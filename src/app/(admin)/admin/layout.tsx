
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: Auth check removed from layout to prevent redirect loops
  // Each protected page should call getAdminUser() and redirect if needed
  // The login page at /admin/login is intentionally public
  return (
    <div className="min-h-screen bg-cinematic text-white">
      {children}
    </div>
  );
}
