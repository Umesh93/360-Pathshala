import LoginForm from "../../components/auth/LoginForm";
import loginBg from "../../assets/images/login-bg.jpg";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-left">
        <img src={loginBg} alt="Login Background" />
      </div>

      <div className="login-right">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
