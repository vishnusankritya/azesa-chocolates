import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  arrow?: boolean;
  className?: string;
  variant?: "cream" | "yellow" | "dark";
};

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type ButtonElementProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type Props = LinkProps | ButtonElementProps;

const BASE_CLASSES =
  "inline-flex items-center gap-1.5 px-5 py-2 rounded-full border-2 border-brand-dark font-heading text-sm uppercase tracking-wide shadow-[3px_3px_0_0_#1c1109] transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none flex-shrink-0";

const VARIANT_CLASSES = {
  cream: "bg-brand-cream text-brand-dark hover:bg-brand-dark hover:text-brand-cream",
  yellow: "bg-brand-yellow text-brand-dark hover:bg-brand-dark hover:text-brand-yellow",
  dark: "bg-brand-dark text-brand-cream hover:bg-brand-dark hover:text-brand-cream",
};

function ArrowIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true" className="flex-shrink-0">
      <path
        d="M1.25 1L5.5 4.5L1.25 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Button({ children, arrow = true, className = "", variant = "cream", ...props }: Props) {
  const classes = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`.trim();

  if (props.href) {
    const { href, ...linkProps } = props as LinkProps;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
        {arrow && <ArrowIcon />}
      </Link>
    );
  }

  const buttonProps = props as ButtonElementProps;
  return (
    <button className={classes} {...buttonProps}>
      {children}
      {arrow && <ArrowIcon />}
    </button>
  );
}
