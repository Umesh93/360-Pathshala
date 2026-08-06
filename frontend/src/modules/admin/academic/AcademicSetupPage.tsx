import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import PageHeader from "../../../components/layout/PageHeader";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import { useToast } from "../students/components/Toast";
import {
  createAcademicClass, createAcademicSection, deleteAcademicClass, deleteAcademicSection,
  getAcademicClass, getAcademicClasses, getAcademicSection, getAcademicSections,
  updateAcademicClass, updateAcademicSection, type AcademicClass, type AcademicSection,
} from "./academic.service";

const message = (error: unknown) => (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Request failed";

export default function AcademicSetupPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"classes" | "sections">("classes");
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [classOptions, setClassOptions] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number>();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [capacity, setCapacity] = useState("40");
  const [deleteId, setDeleteId] = useState<number>();

  const loadClasses = useCallback(async () => {
    const result = await getAcademicClasses(page, 10, search);
    setClasses(result.content); setTotalPages(Math.max(result.totalPages, 1));
  }, [page, search]);

  const loadSections = useCallback(async () => {
    const options = await getAcademicClasses(0, 100);
    setClassOptions(options.content);
    const classId = selectedClassId || options.content[0]?.id;
    if (!selectedClassId && classId) setSelectedClassId(classId);
    if (!classId) { setSections([]); setTotalPages(1); return; }
    const result = await getAcademicSections(classId, page, 10);
    setSections(result.content); setTotalPages(Math.max(result.totalPages, 1));
  }, [page, selectedClassId]);

  const refresh = useCallback(() => tab === "classes" ? loadClasses() : loadSections(), [loadClasses, loadSections, tab]);
  useEffect(() => { queueMicrotask(() => refresh().catch((error) => showToast(message(error), "error"))); }, [refresh, showToast]);
  const reset = () => { setEditingId(undefined); setName(""); setCode(""); setCapacity("40"); };

  const submit = async () => {
    if (!name.trim()) { showToast("Name is required", "error"); return; }
    try {
      if (tab === "classes") {
        if (!code.trim()) { showToast("Code is required", "error"); return; }
        if (editingId) await updateAcademicClass(editingId, { name: name.trim(), code: code.trim() });
        else await createAcademicClass({ name: name.trim(), code: code.trim() });
      } else {
        if (!selectedClassId) { showToast("Select a class", "error"); return; }
        const payload = { classId: selectedClassId, name: name.trim(), capacity: Number(capacity) || 0 };
        if (editingId) await updateAcademicSection(editingId, payload); else await createAcademicSection(payload);
      }
      showToast(`${tab === "classes" ? "Class" : "Section"} ${editingId ? "updated" : "created"} successfully`, "success");
      reset(); await refresh();
    } catch (error) { showToast(message(error), "error"); }
  };

  const edit = async (id: number) => {
    try {
      if (tab === "classes") {
        const item = await getAcademicClass(id); setName(item.name); setCode(item.code);
      } else {
        const item = await getAcademicSection(id); setSelectedClassId(item.classId); setName(item.name); setCapacity(String(item.capacity));
      }
      setEditingId(id);
    } catch (error) { showToast(message(error), "error"); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      if (tab === "classes") await deleteAcademicClass(deleteId); else await deleteAcademicSection(deleteId);
      showToast(`${tab === "classes" ? "Class" : "Section"} deleted successfully`, "success");
      setDeleteId(undefined); reset(); await refresh();
    } catch (error) { setDeleteId(undefined); showToast(message(error), "error"); }
  };

  const records = tab === "classes" ? classes : sections;
  return <AdminLayout>
    <PageHeader title="Academic Setup" subtitle="Manage classes and sections" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Academic Setup" }]} />
    <div className="space-y-4">
      <div className="flex gap-2">{(["classes", "sections"] as const).map((value) => <button key={value} onClick={() => { setTab(value); setPage(0); reset(); }} className={`px-4 py-2 rounded-xl capitalize ${tab === value ? "bg-[#234A91] text-white" : "bg-white text-gray-700"}`}>{value}</button>)}</div>
      <div className="bg-white rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        {tab === "sections" && <select value={selectedClassId || ""} onChange={(event) => { setSelectedClassId(Number(event.target.value)); setPage(0); reset(); }} className="h-10 rounded-xl border border-gray-200 px-3"><option value="">Select Class</option>{classOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={tab === "classes" ? "Class name" : "Section name"} className="h-10 rounded-xl border border-gray-200 px-3" />
        {tab === "classes" ? <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code" className="h-10 rounded-xl border border-gray-200 px-3" /> : <input type="number" min="0" value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="Capacity" className="h-10 rounded-xl border border-gray-200 px-3" />}
        <button onClick={submit} className="h-10 rounded-xl bg-[#234A91] text-white px-4">{editingId ? "Update" : "Add"}</button>
        {editingId && <button onClick={reset} className="h-10 rounded-xl border border-gray-200 px-4">Cancel</button>}
      </div>
      {tab === "classes" && <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search classes" className="h-10 w-full md:w-80 rounded-xl border border-gray-200 px-3" />}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-4">Name</th><th className="text-left p-4">{tab === "classes" ? "Code" : "Capacity"}</th><th className="text-left p-4">Status</th><th className="text-right p-4">Actions</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-t"><td className="p-4">{record.name}</td><td className="p-4">{"code" in record ? record.code : record.capacity}</td><td className="p-4 text-green-700">Active</td><td className="p-4 text-right space-x-3"><button className="text-[#234A91]" onClick={() => edit(record.id)}>Edit</button><button className="text-red-600" onClick={() => setDeleteId(record.id)}>Delete</button></td></tr>)}{records.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No {tab} found</td></tr>}</tbody></table></div>
      <div className="flex justify-end items-center gap-3"><button disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="px-3 py-2 bg-white rounded-lg disabled:opacity-50">Previous</button><span>{page + 1} / {totalPages}</span><button disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)} className="px-3 py-2 bg-white rounded-lg disabled:opacity-50">Next</button></div>
    </div>
    <ConfirmDialog open={deleteId !== undefined} title={`Delete ${tab === "classes" ? "Class" : "Section"}`} description="This action soft deletes the record. It is blocked while dependent records exist." confirmLabel="Delete" variant="destructive" onConfirm={confirmDelete} onCancel={() => setDeleteId(undefined)} />
  </AdminLayout>;
}
