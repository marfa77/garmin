import { LoginPageContent } from "@/components/auth/LoginPageContent";
import { LocaleProvider } from "@/lib/i18n";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const next = searchParams.next ?? "/dashboard";

  return (
    <LocaleProvider>
      <LoginPageContent next={next} />
    </LocaleProvider>
  );
}
