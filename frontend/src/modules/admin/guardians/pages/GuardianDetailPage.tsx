import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import {
  decodeGuardianAddress,
  getGuardian,
  getChildren,
} from "../services/guardian.service";
import type { Guardian, Child } from "../types/guardian.types";
import GuardianStatusBadge from "../components/GuardianStatusBadge";
import { useToast } from "../../students/components/Toast";

const value = (item: unknown) => String(item || "-");
const dateTime = (item?: string) =>
  item ? new Date(item).toLocaleString() : "-";
const Card = ({
  title,
  fields,
}: {
  title: string;
  fields: [string, unknown][];
}) => (
  <section className="bg-white rounded-xl p-5 shadow-sm">
    <h2 className="font-semibold text-gray-800 mb-4">{title}</h2>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(([label, item]) => (
        <div key={label}>
          <dt className="text-xs uppercase text-gray-500">{label}</dt>
          <dd className="mt-1 text-sm font-medium text-gray-800 break-words">
            {value(item)}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);

export default function GuardianDetailPage() {
  const guardianId = Number(useParams().id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [guardian, setGuardian] = useState<Guardian>();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [record, linkedChildren] = await Promise.all([
        getGuardian(guardianId),
        getChildren(guardianId),
      ]);
      setGuardian(record);
      setChildren(linkedChildren);
    } catch {
      showToast("Failed to load guardian", "error");
    } finally {
      setLoading(false);
    }
  }, [guardianId, showToast]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  if (loading)
    return (
      <AdminLayout>
        <div className="p-8 text-gray-600">Loading guardian...</div>
      </AdminLayout>
    );
  if (!guardian)
    return (
      <AdminLayout>
        <div className="p-8 text-red-600">Guardian not found</div>
      </AdminLayout>
    );
  const address = decodeGuardianAddress(guardian.address);
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {guardian.photo ? (
              <img
                src={guardian.photo}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-50 text-[#234A91] flex items-center justify-center text-xl font-semibold">
                {guardian.firstName?.[0] || guardian.fullName[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[#234A91]">
                {guardian.guardianCode}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {guardian.fullName}
              </h1>
              <div className="mt-1">
                <GuardianStatusBadge status={guardian.status} />
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/guardians/${guardian.id}/edit`)}
            className="px-5 py-2 rounded-xl bg-[#234A91] text-white"
          >
            Edit Guardian
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Children", guardian.childrenCount],
            ["Relationship", guardian.relationship],
            ["Occupation", guardian.occupation],
            ["Preference", guardian.communicationPreference],
          ].map(([label, item]) => (
            <div
              key={String(label)}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <p className="text-xs uppercase text-gray-500">{label}</p>
              <p className="mt-1 font-medium text-gray-800">{value(item)}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card
            title="Guardian Information"
            fields={[
              ["Guardian ID", guardian.id],
              ["Guardian Code", guardian.guardianCode],
              ["Full Name", guardian.fullName],
              ["Relationship", guardian.relationship],
              ["Gender", guardian.gender],
              ["Date of Birth", guardian.dateOfBirth],
              ["Nationality", guardian.nationality],
              ["Citizenship No.", guardian.citizenshipNumber],
            ]}
          />
          <Card
            title="Contact"
            fields={[
              ["Mobile", guardian.mobile || guardian.phone],
              ["Alternate Phone", guardian.alternatePhone],
              ["Email", guardian.email],
              ["Emergency Contact", guardian.emergencyContactPerson],
              ["Emergency Number", guardian.emergencyContactNumber],
              ["Emergency Relationship", guardian.emergencyContactRelationship],
            ]}
          />
          <Card
            title="Occupation"
            fields={[
              ["Occupation", guardian.occupation],
              ["Education", guardian.education],
              ["Employer", guardian.employer],
              ["Organization", guardian.organization],
              ["Office Address", guardian.officeAddress],
              ["Annual Income", guardian.annualIncome],
            ]}
          />
          <Card
            title="Address"
            fields={[
              [
                "Current Province",
                address.currentProvinceName ||
                  guardian.province ||
                  address.currentProvince,
              ],
              [
                "Current District",
                address.currentDistrictName ||
                  guardian.district ||
                  address.currentDistrict,
              ],
              ["Municipality", address.currentMunicipality],
              ["Ward", address.currentWard],
              ["Street/Tole", address.currentStreet],
              [
                "Permanent same as current",
                address.permanentSameAsCurrent ? "Yes" : "No",
              ],
            ]}
          />
          <Card
            title="Communication Preference"
            fields={[
              ["Preferred Method", guardian.communicationPreference],
              ["Preferred Language", guardian.preferredLanguage],
            ]}
          />
          <Card
            title="Documents & Notes"
            fields={[
              ["Document Type", guardian.documentType],
              ["Document Number", guardian.documentNumber],
              ["Issued Date", guardian.documentIssuedDate],
              ["Expiry Date", guardian.documentExpiryDate],
              ["Notes", guardian.notes],
            ]}
          />
        </div>
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Children ({children.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    "Name",
                    "Admission No.",
                    "Class",
                    "Section",
                    "Roll",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {children.map((child) => {
                  const href = `/admin/students/${child.id}`;
                  return (
                    <tr key={child.id} className="hover:bg-blue-50/40">
                      <td className="p-0">
                        <Link
                          to={href}
                          className="block px-3 py-4 font-medium text-[#234A91] hover:underline"
                        >
                          {child.firstName} {child.lastName}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          to={href}
                          className="block px-3 py-4 text-sm text-gray-700"
                        >
                          {value(child.admissionNumber)}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          to={href}
                          className="block px-3 py-4 text-sm text-gray-700"
                        >
                          {value(child.className)}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          to={href}
                          className="block px-3 py-4 text-sm text-gray-700"
                        >
                          {value(child.sectionName)}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          to={href}
                          className="block px-3 py-4 text-sm text-gray-700"
                        >
                          {value(child.rollNumber)}
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link to={href} className="block px-3 py-4">
                          <GuardianStatusBadge status={child.status} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {children.length === 0 && (
              <p className="py-4 text-sm text-gray-500">
                No children linked to this guardian.
              </p>
            )}
          </div>
        </section>
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Activity Timeline</h2>
          <ol className="space-y-4 border-l-2 border-blue-100 ml-2 pl-5">
            <li>
              <p className="font-medium text-sm">Guardian record created</p>
              <p className="text-xs text-gray-500">
                {dateTime(guardian.createdAt)}
                {guardian.createdBy ? ` by user ${guardian.createdBy}` : ""}
              </p>
            </li>
            <li>
              <p className="font-medium text-sm">
                Guardian record last updated
              </p>
              <p className="text-xs text-gray-500">
                {dateTime(guardian.updatedAt)}
                {guardian.updatedBy ? ` by user ${guardian.updatedBy}` : ""}
              </p>
            </li>
          </ol>
        </section>
      </div>
    </AdminLayout>
  );
}
