import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const role = user?.roles.includes('SCHOOL_ADMIN') ? 'school-admin' : user?.roles[0]?.toLowerCase().replace('_', '-');
    if (role) api.get(`/dashboards/${role}`).then((res) => setMetrics(res.data.metrics)).catch(() => setMetrics({}));
  }, [user]);

  return <>
    <h2>Dashboard</h2>
    <div className="row g-3 mt-2">{Object.entries(metrics).map(([key, value]) => <div className="col-md-3" key={key}>
      <div className="card card-body shadow-sm"><span className="text-muted">{key}</span><strong className="fs-3">{String(value)}</strong></div>
    </div>)}</div>
  </>;
}
