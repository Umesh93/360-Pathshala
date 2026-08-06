import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout";
import { useToast } from "../students/components/Toast";
import { getAcademicClasses } from "../academic/academic.service";
import { createSubject, getSubject, updateSubject } from "./subject.service";
import type { SubjectRequest } from "./subject.types";

const initial: SubjectRequest = {
  classId: 0,
  subjectCode: "",
  subjectName: "",
  subjectType: "THEORY",
  creditHours: 0,
  fullMarks: 100,
  passMarks: 40,
  optional: false,
  status: "ACTIVE",
  description: "",
};
const errorMessage = (error: unknown) =>
  (
    error as {
      response?: {
        data?: { message?: string; errors?: Record<string, string> };
      };
    }
  ).response?.data?.message || "Request failed";

export default function SubjectFormPage() {
  const { id } = useParams();
  const subjectId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const requestedClassId = Number(searchParams.get("classId")) || 0;
  const [form, setForm] = useState(() =>
    subjectId ? initial : { ...initial, classId: requestedClassId },
  );
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    getAcademicClasses(0, 100).then((page) => setClasses(page.content));
    if (subjectId)
      getSubject(subjectId)
        .then((item) =>
          setForm({
            classId: item.classId,
            subjectCode: item.subjectCode,
            subjectName: item.subjectName,
            subjectType: item.subjectType,
            creditHours: item.creditHours,
            fullMarks: item.fullMarks,
            passMarks: item.passMarks,
            optional: item.optional,
            status: item.status,
            description: item.description || "",
          }),
        )
        .catch((error) => showToast(errorMessage(error), "error"));
  }, [subjectId, showToast]);
  const update = <K extends keyof SubjectRequest>(
    key: K,
    value: SubjectRequest[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));
  const submit = async () => {
    if (!form.classId || !form.subjectCode.trim() || !form.subjectName.trim()) {
      showToast("Class, subject code, and subject name are required", "error");
      return;
    }
    if (form.passMarks > form.fullMarks) {
      showToast("Pass marks cannot exceed full marks", "error");
      return;
    }
    setSaving(true);
    try {
      if (subjectId) await updateSubject(subjectId, form);
      else await createSubject(form);
      showToast(
        `Subject ${subjectId ? "updated" : "created"} successfully`,
        "success",
      );
      navigate("/admin/subjects");
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {subjectId ? "Edit Subject" : "Add Subject"}
          </h1>
          <p className="text-gray-500">
            Configure class-specific academic subject details
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="text-sm">
            Class
            <select
              value={form.classId || ""}
              onChange={(event) =>
                update("classId", Number(event.target.value))
              }
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            >
              <option value="">Select Class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Subject Code
            <input
              value={form.subjectCode}
              onChange={(event) => update("subjectCode", event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            />
          </label>
          <label className="text-sm">
            Subject Name
            <input
              value={form.subjectName}
              onChange={(event) => update("subjectName", event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            />
          </label>
          <label className="text-sm">
            Subject Type
            <select
              value={form.subjectType}
              onChange={(event) => update("subjectType", event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            >
              <option value="THEORY">Theory</option>
              <option value="PRACTICAL">Practical</option>
              <option value="THEORY_PRACTICAL">Theory + Practical</option>
            </select>
          </label>
          <label className="text-sm">
            Credit Hours
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.creditHours}
              onChange={(event) =>
                update("creditHours", Number(event.target.value))
              }
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            />
          </label>
          <label className="text-sm">
            Full Marks
            <input
              type="number"
              min="1"
              value={form.fullMarks}
              onChange={(event) =>
                update("fullMarks", Number(event.target.value))
              }
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            />
          </label>
          <label className="text-sm">
            Pass Marks
            <input
              type="number"
              min="0"
              value={form.passMarks}
              onChange={(event) =>
                update("passMarks", Number(event.target.value))
              }
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            />
          </label>
          <label className="text-sm">
            Status
            <select
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
          <label className="text-sm flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.optional}
              onChange={(event) => update("optional", event.target.checked)}
            />{" "}
            Optional Subject
          </label>
          <label className="text-sm sm:col-span-2 lg:col-span-4">
            Description
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="mt-1 min-h-24 w-full rounded-xl border border-gray-200 p-3"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate("/admin/subjects")}
            className="px-5 py-2.5 rounded-xl border border-gray-200"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={submit}
            className="px-5 py-2.5 rounded-xl bg-[#234A91] text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : subjectId
                ? "Update Subject"
                : "Save Subject"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
