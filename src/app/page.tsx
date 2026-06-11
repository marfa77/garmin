import { LandingPage } from "@/components/landing/LandingPage";
import { LocaleProvider } from "@/lib/i18n";

export default function Home() {
  return (
    <LocaleProvider>
      <LandingPage />
    </LocaleProvider>
  );
}
