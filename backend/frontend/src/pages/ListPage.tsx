import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function ListPage({ title, endpoint }: { title: string; endpoint: string }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { api.get(endpoint).then((res) => setRows(res.data.content ?? res.data)); }, [endpoint]);
  return <>
    <h2>{title}</h2>
    <div className="table-responsive bg-white shadow-sm rounded mt-3"><table className="table table-hover mb-0"><tbody>{rows.map((row) => <tr key={String(row.id)}>{Object.entries(row).slice(0, 5).map(([key, value]) => <td key={key}><small className="text-muted">{key}</small><br />{String(value)}</td>)}</tr>)}</tbody></table></div>
  </>;
}
