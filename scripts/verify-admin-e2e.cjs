const { chromium } = require("playwright");

const BASE = "http://localhost:3212";
const results = [];
let passed = 0, failed = 0;

function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  if (cond) passed++; else failed++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

// Navigate to url and poll until `text` appears (handles ISR revalidate cache
// being a beat behind an admin save) or timeout.
async function waitForTextIn(page, url, text, timeout = 12000) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await page.evaluate((t) => document.body.textContent.includes(t), text)) return true;
    await page.waitForTimeout(350);
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  return false;
}

// Poll the admin API until product[slug][field] === expected (source of truth
// for whether the admin edit persisted to the DB).
async function waitForApiValue(page, slug, field, expected, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const ok = await page.evaluate(
      async ({ slug, field, expected }) => {
        const r = await fetch("http://localhost:3212/api/admin/products").then((x) => x.json());
        const m = r.find((p) => p.slug === slug);
        return !!m && JSON.stringify(m[field]) === JSON.stringify(expected);
      },
      { slug, field, expected }
    );
    if (ok) return true;
    await page.waitForTimeout(300);
  }
  return false;
}

async function clickEdit(page, productName) {
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Products", { timeout: 15000 });
  // wait for the product grid (client-fetched) to render Edit buttons
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "Edit"),
    { timeout: 15000 }
  );
  // find the grid cell whose name matches, click its Edit button
  const clicked = await page.evaluate((name) => {
    const cards = [...document.querySelectorAll("div")].filter((el) =>
      el.textContent && el.children.length && el.querySelector("button") &&
      el.querySelector("p")?.textContent?.trim() === name
    );
    for (const c of cards) {
      const edit = [...c.querySelectorAll("button")].find((b) => b.textContent.trim() === "Edit");
      if (edit) { edit.click(); return true; }
    }
    return false;
  }, productName);
  await page.waitForSelector('textarea[placeholder*="What makes" ] , input[placeholder="Product name"]', { timeout: 10000 });
  return clicked;
}

const setField = (page, selector, value) =>
  page.locator(selector).fill(String(value));

async function openEditor(page, productName) {
  await clickEdit(page, productName);
  await page.waitForTimeout(500);
}

async function saveAndWait(page) {
  await page.getByRole("button", { name: /Save product/ }).click();
  // wait for editor to close (onSaved reload)
  await page.waitForSelector('button:has-text("Delete product")', { state: "detached", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  console.log("=== ADMIN-BYPASS check: editor opens ===");
  await openEditor(page, "Mango");
  check("admin editor opens", await page.locator('input[placeholder="Product name"]').count() > 0);

  // --- NAME ---
  console.log("\n=== NAME ===");
  await page.locator('input[placeholder="Product name"]').fill("Mango Renamed");
  await saveAndWait(page);
  await page.goto(`${BASE}/shop/mango`, { waitUntil: "domcontentloaded" });
  const h1 = await page.locator("h1").first().textContent();
  check("name reflects on detail page", h1 === "Mango Renamed", `h1=${h1}`);
  // restore
  await openEditor(page, "Mango Renamed");
  await page.locator('input[placeholder="Product name"]').fill("Mango");
  await saveAndWait(page);

  // --- PRICE ---
  console.log("\n=== PRICE ===");
  await openEditor(page, "Mango");
  await page.locator('input[placeholder="319"]').fill("3333");
  await saveAndWait(page);
  await page.goto(`${BASE}/shop/mango`, { waitUntil: "domcontentloaded" });
  const priceTxt = await page.locator("text=₹3333").count();
  check("price reflects on detail page", priceTxt >= 1);
  await openEditor(page, "Mango");
  await page.locator('input[placeholder="319"]').fill("319");
  await saveAndWait(page);

  // --- INGREDIENT ---
  console.log("\n=== INGREDIENT ===");
  await openEditor(page, "Mango");
  await page.locator('input[placeholder="Alphonso Mango"]').fill("TestKiwi");
  await saveAndWait(page);
  check("ingredient persists in DB", await waitForApiValue(page, "mango", "ingredient", "TestKiwi"));
  check("ingredient reflects on detail page", await waitForTextIn(page, `${BASE}/shop/mango`, "TestKiwi"));
  await openEditor(page, "Mango");
  await page.locator('input[placeholder="Alphonso Mango"]').fill("Alphonso Mango");
  await saveAndWait(page);

  // --- TAGLINE ---
  console.log("\n=== TAGLINE ===");
  await openEditor(page, "Mango");
  await page.locator('input[placeholder="Sweet, tropical"]').fill("TestTaglineXYZ");
  await saveAndWait(page);
  await page.goto(`${BASE}/shop/mango`, { waitUntil: "domcontentloaded" });
  const tg = await page.evaluate(() => document.body.innerText.includes("TestTaglineXYZ"));
  check("tagline reflects on detail page", tg);
  await openEditor(page, "Mango");
  await page.locator('input[placeholder="Sweet, tropical"]').fill("Sweet, tropical");
  await saveAndWait(page);

  // --- DESCRIPTION (the crash case) ---
  console.log("\n=== DESCRIPTION (crash check) ===");
  await openEditor(page, "Mango");
  await page.locator('textarea[placeholder*="What makes"]').fill("Updated description line one.\nSecond line with «quotes» and apostrophe's here.");
  await saveAndWait(page);
  const g = await page.goto(`${BASE}/shop/mango`, { waitUntil: "domcontentloaded" });
  check("description edit does NOT crash detail page", g.status() < 500, `http ${g.status()}`);
  const desc = await page.evaluate(() => document.body.innerText.includes("Updated description line one."));
  check("description reflects on detail page", desc);
  await openEditor(page, "Mango");
  await page.locator('textarea[placeholder*="What makes"]').fill("Sun-ripened Alphonso mango folded through single-origin dark chocolate.");
  await saveAndWait(page);

  // --- AVAILABILITY: out_of_stock ---
  console.log("\n=== AVAILABILITY = out_of_stock ===");
  await openEditor(page, "Mango");
  await page.locator('select').nth(1).selectOption("out_of_stock");
  await saveAndWait(page);
  check("availability persists in DB (out_of_stock)", await waitForApiValue(page, "mango", "availability", "out_of_stock"));
  check("out_of_stock shows badge on shop card", await waitForTextIn(page, `${BASE}/shop`, "Out of stock"));
  // Add-to-cart disabled on detail
  const st = await page.goto(`${BASE}/shop/mango`, { waitUntil: "domcontentloaded" });
  check("detail page still 200 when out_of_stock", st.status() < 500);
  // restore available
  await openEditor(page, "Mango");
  await page.locator('select').nth(1).selectOption("available");
  await saveAndWait(page);

  // --- AVAILABILITY: hidden ---
  console.log("\n=== AVAILABILITY = hidden ===");
  await openEditor(page, "Mango");
  await page.locator('select').nth(1).selectOption("hidden");
  await saveAndWait(page);
  await page.goto(`${BASE}/shop`, { waitUntil: "domcontentloaded" });
  const hiddenGone = await page.evaluate(() => !document.body.innerText.includes("Mango"));
  check("hidden product absent from /shop", hiddenGone);
  const dn = await page.goto(`${BASE}/shop/mango`, { waitUntil: "domcontentloaded" });
  check("hidden product detail -> not found (404)", dn.status() === 404, `http ${dn.status()}`);
  // restore
  await openEditor(page, "Mango"); // editor still opens from list (admin lists all incl hidden)
  await page.locator('select').nth(1).selectOption("available");
  await saveAndWait(page);

  // --- IMAGE ---
  console.log("\n=== IMAGE ===");
  await openEditor(page, "Mango");
  await page.evaluate(() => {
    const urls = [...document.querySelectorAll('button[aria-label="Remove image"]')];
    urls.forEach((b) => b.click()); // clear all images
  });
  await page.locator('input[placeholder="Paste image URL"]').fill("https://example.com/test-img-1.png");
  await page.getByRole("button", { name: "Add URL" }).click();
  await saveAndWait(page);
  await page.goto(`${BASE}/shop/mango`, { waitUntil: "domcontentloaded" });
  const imgPresent = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("main img")];
    return imgs.some((i) => i.src.includes("test-img-1.png"));
  });
  check("image reflects on detail page", imgPresent);
  // restore original image url from a known product (skip exact restore; note)
  console.log("  (note: image left as example URL — original not auto-restored)");

  // --- HAMPER: mrp + occasion + contents ---
  console.log("\n=== HAMPER (mrp, occasion, contents) ===");
  const hamperInfo = await page.evaluate(async () => {
    const r = await fetch("http://localhost:3212/api/admin/products").then((x) => x.json());
    const h = r.find((p) => p.type === "hamper");
    return h ? { name: h.name, slug: h.slug } : null;
  });
  console.log("  hamper product:", hamperInfo?.name);
  if (hamperInfo) {
    await openEditor(page, hamperInfo.name);
    await page.locator('input[placeholder="399"]').fill("9999");
    await page.locator('input[placeholder*="Rakhi"]').fill("TestOccasion");
    const contentsInput = await page.evaluate(() => {
      const all = [...document.querySelectorAll("input")];
      const c = all.find((i) => i.placeholder.includes("Chocolate") || i.placeholder.includes("cookies"));
      return c ? c.placeholder : null;
    });
    console.log("  contents input placeholder:", contentsInput);
    if (contentsInput) {
      await page.locator(`input[placeholder="${contentsInput}"]`).fill("TestItem1, TestItem2");
    }
    await saveAndWait(page);
    const url = `${BASE}/shop/${hamperInfo.slug}`;
    check("hamper mrp reflects on detail", await waitForTextIn(page, url, "9999"));
    check("hamper occasion reflects on detail", await waitForTextIn(page, url, "TestOccasion"));
    check("hamper contents reflect on detail", await waitForTextIn(page, url, "TestItem1"));
    console.log("  (hamper left with test values — restored to seeded values via API in the surrounding run)");
  } else {
    console.log("  no hamper product found — skipped");
  }

  console.log("\n===== SUMMARY =====");
  console.log(`PASS: ${passed}  FAIL: ${failed}`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error("SCRIPT ERROR:", e.message);
  console.error("Partial results:");
  results.forEach((r) => console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? " — " + r.detail : ""}`));
  process.exit(1);
});
