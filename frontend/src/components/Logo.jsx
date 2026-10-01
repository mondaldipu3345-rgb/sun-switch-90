export function Logo({ size = 44, className = "" }) {
  return (
    <img
      src="/logo.png"
      alt="SUN SWITCH - The energy of future"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`rounded-full object-cover bg-white ring-2 ring-white shadow-md shrink-0 ${className}`}
      data-testid="site-logo"
    />
  );
}
