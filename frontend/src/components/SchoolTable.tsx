import type { School } from "../types/School";

interface Props {
  schools: School[];
}

export default function SchoolTable({ schools }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-4">School</th>
            <th className="p-4">Address</th>
            <th className="p-4">Email</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Features</th>
          </tr>
        </thead>

        <tbody>
          {schools.map((school) => (
            <tr key={school.id} className="border-b">
              <td className="p-4">{school.schoolName}</td>
              <td className="p-4">{school.address}</td>
              <td className="p-4">{school.email}</td>
              <td className="p-4">{school.phoneNumber}</td>
              <td className="p-4">{school.features.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
