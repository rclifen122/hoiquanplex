// Login layout - bypasses parent auth check
export default function CustomerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
