export default function CustomerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication check for login page
  return <>{children}</>;
}
