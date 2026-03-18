import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

/** Container card with optional hover effect */
export function Card({ children, hover = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-surface-border bg-white shadow-card
        ${hover ? "transition-shadow duration-200 hover:shadow-card-hover" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card header section */
export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-surface-border ${className}`}>
      {children}
    </div>
  );
}

/** Card body section */
export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

/** Card footer section */
export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-3 border-t border-surface-border bg-surface-muted rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}
