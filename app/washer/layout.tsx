import { AuthProvider } from '../components/AuthProvider';

export default function WasherLayout({
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
