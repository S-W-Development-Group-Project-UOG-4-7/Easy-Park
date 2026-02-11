import { redirect } from 'next/navigation';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = String(params?.token || '').trim();

  if (token) {
    redirect(`/?token=${encodeURIComponent(token)}`);
  }

  redirect('/');
}
