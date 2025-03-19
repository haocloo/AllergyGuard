import Index from '@/components/layout/sidebar';
import { lucia_get_user } from '@/services/server';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await lucia_get_user();
  if (!user?.id) {
    redirect('/auth');
  }
  return (
    <AuthProvider user={user}>
      <Index user={user}>{children}</Index>
    </AuthProvider>
  );
}
