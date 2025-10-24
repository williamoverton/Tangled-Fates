import { ReactNode } from "react";
import { BrandLink } from "./BrandLink";
import { AuthButtons } from "./AuthButtons";
import { GitHubLink } from "./GitHubLink";

interface BaseNavbarProps {
  children: ReactNode;
  className?: string;
}

export function BaseNavbar({ children, className = "" }: BaseNavbarProps) {
  const headerClasses =
    "flex justify-between items-center p-4 gap-4 h-16 text-white bg-medieval-header-bg border-b border-border shrink-0";

  const containerClasses = "flex justify-between items-center w-full";

  return (
    <header className={`${headerClasses} ${className}`}>
      <div className={containerClasses}>
        <div className="flex items-center gap-2">
          <BrandLink />
          {children}
        </div>
        <div className="flex items-center gap-4">
          <GitHubLink />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
