import type { School } from "../types/School";

interface Props {
  schools: School[];
}

export default function SchoolTable({ schools }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              School
            </th>

            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Address
            </th>

            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Email
            </th>

            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Phone Number
            </th>

            <th className="px-6 py-5 text-left text-sm font-semibold text-slate-700">
              Features
            </th>
          </tr>
        </thead>

        <tbody>
          {schools.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-500">
                No schools found.
              </td>
            </tr>
          ) : (
            schools.map((school) => (
              <tr
                key={school.id}
                className="border-t border-slate-200 hover:bg-slate-50 transition"
              >
                <td className="px-6 py-5 font-medium text-slate-800">
                  {school.schoolName}
                </td>

                <td className="px-6 py-5 text-slate-600">{school.address}</td>

                <td className="px-6 py-5 text-slate-600">{school.email}</td>

                <td className="px-6 py-5 text-slate-600">
                  {school.phoneNumber}
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {school.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
