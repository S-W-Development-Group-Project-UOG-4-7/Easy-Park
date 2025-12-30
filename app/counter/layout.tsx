import { AuthProvider } from '../components/AuthProvider';

export default function CounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
