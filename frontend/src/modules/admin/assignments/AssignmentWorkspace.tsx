import AdminLayout from "../../../layouts/AdminLayout";
import PageHeader from "../../../components/layout/PageHeader";
import ManagementWorkspace from "../../assignments/ManagementWorkspace";

export default function AssignmentWorkspace() {
  return (
    <AdminLayout>
      <PageHeader
        title="Assignments"
        subtitle="Create, publish, review, and report on class assignments."
      />
      <ManagementWorkspace role="admin" />
    </AdminLayout>
  );
}
