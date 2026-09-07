const buttonVariants = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",

  outline:
    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",

  destructive:
    "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
};

export const Button = ({
  children,
  variant = "default",
  type = "button",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2";

  const variantStyles = buttonVariants[variant] || buttonVariants.default;

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
