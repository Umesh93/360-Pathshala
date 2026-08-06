import PageHeader from "../../components/layout/PageHeader";
import TeacherLayout from "../../layouts/TeacherLayout";
import ManagementWorkspace from "../../modules/assignments/ManagementWorkspace";

export default function TeacherAssignments() {
  return (
    <TeacherLayout>
      <PageHeader
        title="Assignments"
        subtitle="Manage your assignments and review student submissions."
      />
      <ManagementWorkspace role="teacher" />
    </TeacherLayout>
  );
}
