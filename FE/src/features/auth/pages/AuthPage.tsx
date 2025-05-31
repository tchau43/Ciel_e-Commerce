import AuthForm from "@/features/auth/components/AuthForm";
// import Header from "../components/Header";

const AuthPage = () => {
  return (
    <div className="min-h-screen ">
      {/* <Header /> */}
      <div className="pt-8">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
