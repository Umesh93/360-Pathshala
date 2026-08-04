import { useParams } from "react-router-dom";
import AdminLayout from "../../../../layouts/AdminLayout";
import TeacherForm from "../components/TeacherForm";

export default function EditTeacherPage() {
  const { id } = useParams();
  return <AdminLayout><div className="space-y-6"><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Edit Teacher</h1><TeacherForm teacherId={Number(id)} /></div></AdminLayout>;
}
