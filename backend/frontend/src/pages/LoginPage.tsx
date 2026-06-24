import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    await login(usernameOrEmail, password);
    navigate('/');
  }

  return <div className="container py-5" style={{ maxWidth: 420 }}>
    <h1 className="mb-4">360 Pathshala</h1>
    <form className="card card-body shadow-sm" onSubmit={submit}>
      <label className="form-label">Username or Email</label>
      <input className="form-control mb-3" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} />
      <label className="form-label">Password</label>
      <input className="form-control mb-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn-primary">Login</button>
    </form>
  </div>;
}
