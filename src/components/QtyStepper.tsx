"use client";

export default function QtyStepper({
  qty,
  onDec,
  onInc,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-brand-dark bg-brand-cream p-1 shadow-[3px_3px_0_0_#1c1109]">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDec}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-heading text-xl font-black leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
      >
        −
      </button>
      <span className="w-8 text-center font-heading text-lg text-brand-dark">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onInc}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-heading text-xl font-black leading-none text-brand-dark transition-colors hover:bg-brand-dark hover:text-brand-cream"
      >
        +
      </button>
    </div>
  );
}