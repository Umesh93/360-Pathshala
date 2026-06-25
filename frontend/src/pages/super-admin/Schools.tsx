import { useEffect, useState } from "react";

import AddSchoolForm from "../../components/AddSchoolForm";
import SchoolTable from "../../components/SchoolTable";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import { getSchools } from "../../services/schoolService";
import type { School } from "../../types/School";

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getSchools().then(setSchools);
  }, []);

  return (
    <SuperAdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-gray-500">Manage schools</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#234A91] text-white px-5 py-3 rounded-lg"
        >
          {showForm ? "Back to List" : "Add New School"}
        </button>
      </div>

      {showForm ? <AddSchoolForm /> : <SchoolTable schools={schools} />}
    </SuperAdminLayout>
  );
}
