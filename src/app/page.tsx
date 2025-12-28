import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to login page as configured in next.config.js
  redirect('/login');
}
