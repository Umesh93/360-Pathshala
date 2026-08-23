import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";

import ErrorState from "../../components/feedback/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import Skeleton from "../../components/Skeleton";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import StudentLayout from "../../layouts/StudentLayout";
import { useToast } from "../../modules/admin/students/components/Toast";
import { authError, changePassword } from "../../services/authService";
import { getStudentProfile, type StudentProfile } from "../../services/studentAccountService";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";
const emptyPasswords = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function StudentProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({ currentPassword: false, newPassword: false, confirmPassword: false });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setProfile(await getStudentProfile());
    } catch (reason) {
      setError(authError(reason, "Unable to load your profile."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwords.newPassword.length < 8 || passwords.newPassword.length > 128)
      return showToast("New password must be between 8 and 128 characters.", "validation");
    if (passwords.newPassword !== passwords.confirmPassword)
      return showToast("New password and confirmation do not match.", "validation");
    setSaving(true);
    try {
      await changePassword(passwords);
      setPasswords(emptyPasswords);
      showToast("Password changed successfully.", "success");
    } catch (reason) {
      showToast(authError(reason, "Unable to change your password."), "error");
    } finally {
      setSaving(false);
    }
  };

  const passwordInput = (id: PasswordField, label: string, autoComplete: string) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={visible[id] ? "text" : "password"} value={passwords[id]} autoComplete={autoComplete} minLength={id === "currentPassword" ? undefined : 8} maxLength={128} required disabled={saving} className="h-11 pr-11" onChange={(event) => setPasswords((current) => ({ ...current, [id]: event.target.value }))} />
        <button type="button" aria-label={`${visible[id] ? "Hide" : "Show"} ${label.toLowerCase()}`} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500" onClick={() => setVisible((current) => ({ ...current, [id]: !current[id] }))}>
          {visible[id] ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );

  const fields = profile ? [
    ["Admission Number", profile.admissionNumber], ["Roll Number", profile.rollNumber],
    ["Class", profile.className], ["Section", profile.sectionName], ["Email", profile.email],
    ["Phone", profile.phone], ["Date of Birth", profile.dateOfBirth], ["Gender", profile.gender],
    ["Address", profile.address], ["Guardian", profile.guardianName],
    ["Relationship", profile.guardianRelationship], ["Guardian Phone", profile.guardianPhone],
    ["Guardian Email", profile.guardianEmail],
  ] : [];

  return (
    <StudentLayout>
      <PageHeader title="My Profile" subtitle="View your Student information and manage your password." />
      {loading ? <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-[520px]" /><Skeleton className="h-[520px]" /></div>
      : error || !profile ? <section className="rounded-lg bg-white"><ErrorState title="Profile unavailable" description={error || "Unable to load your profile."} onRetry={load} /></section>
      : <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                {profile.photo ? <img src={profile.photo} alt={profile.fullName} className="h-20 w-20 rounded-full border border-gray-200 object-cover" />
                : <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-[#234A91]">{profile.fullName.charAt(0).toUpperCase()}</span>}
                <div><CardTitle className="text-xl">{profile.fullName}</CardTitle><CardDescription>{[profile.className, profile.sectionName].filter(Boolean).join(" · ") || "Class not assigned"}</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {fields.map(([label, value]) => <div key={label} className={label === "Address" ? "sm:col-span-2" : ""}><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 break-words font-medium text-gray-900">{value || "-"}</p></div>)}
              </div>
              <p className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-500">Contact your school administrator if any profile information needs correction.</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm">
            <CardHeader><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#234A91]"><LockKeyhole size={20} /></span><div><CardTitle>Change Password</CardTitle><CardDescription>Use between 8 and 128 characters</CardDescription></div></div></CardHeader>
            <CardContent><form className="space-y-5" onSubmit={savePassword}>{passwordInput("currentPassword", "Current password", "current-password")}{passwordInput("newPassword", "New password", "new-password")}{passwordInput("confirmPassword", "Confirm new password", "new-password")}<Button className="bg-[#234A91] hover:bg-[#193b78]" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <UserRound />}{saving ? "Changing password" : "Change password"}</Button></form></CardContent>
          </Card>
        </div>}
    </StudentLayout>
  );
}
