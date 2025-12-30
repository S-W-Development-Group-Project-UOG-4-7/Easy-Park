import { AuthProvider } from '../components/AuthProvider';

export default function LandOwnerLayout({
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
