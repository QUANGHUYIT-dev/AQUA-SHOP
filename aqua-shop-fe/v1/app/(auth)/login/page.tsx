import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
