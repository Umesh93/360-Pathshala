import type { ReactNode } from "react";

import loginBg from "../../assets/images/login-bg.jpg";
import logo from "../../assets/images/logo.png";

export default function PasswordRecoveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="login-page">
      <div className="login-left">
        <img src={loginBg} alt="360 Pathshala" />
      </div>
      <div className="login-right">
        <main className="login-form-wrapper">
          <img src={logo} alt="360 Pathshala" className="login-logo" />
          {children}
        </main>
      </div>
    </div>
  );
}
