export default function GuardianSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: 10 }).map((_, i) => (
              <th key={i} className="p-3 text-left">
                <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t">
              {Array.from({ length: 10 }).map((_, j) => (
                <td key={j} className="p-3">
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
