import AuthForm from "@/features/auth/components/AuthForm";
import Header from "../components/Header";

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[rgb(255,230,230)] to-[rgb(230,230,255)]">
      <Header />
      <div className="pt-8">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
