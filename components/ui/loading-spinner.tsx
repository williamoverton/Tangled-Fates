import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
  variant?: "default" | "large" | "small" | "dots" | "inline";
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  text = "Loading...",
  className,
  variant = "default",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
        {text && <span className="text-muted-foreground text-sm">{text}</span>}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "border-2 border-muted border-t-primary rounded-full animate-spin",
            sizeClasses[size]
          )}
        ></div>
        {text && (
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  const containerClasses =
    variant === "large"
      ? "min-h-[400px] space-y-6"
      : variant === "small"
      ? "min-h-[100px] space-y-2"
      : "min-h-[200px] space-y-4";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        containerClasses,
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "border-4 border-muted rounded-full animate-spin border-t-primary",
            sizeClasses[size]
          )}
        ></div>
      </div>
      {text && (
        <p
          className={cn(
            "text-muted-foreground font-medium",
            textSizeClasses[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}
