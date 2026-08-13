import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";

import ErrorState from "@/components/feedback/ErrorState";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/modules/admin/students/components/Toast";
import {
  authError,
  changePassword,
  getCurrentUser,
  updateCurrentUser,
} from "@/services/authService";
import type { AuthUser } from "@/types/Auth";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const emptyPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ProfilePage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
      setFullName(nextUser.fullName);
    } catch (error) {
      setLoadError(authError(error, "Unable to load your profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => void load());
  }, []);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const name = fullName.trim();
    if (!name) {
      showToast("Full name is required.", "validation");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await updateCurrentUser(name);
      setUser(updated);
      setFullName(updated.fullName);
      showToast("Profile updated successfully.", "success");
    } catch (error) {
      showToast(authError(error, "Unable to update your profile."), "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "validation");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("New password and confirmation do not match.", "validation");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwords);
      setPasswords(emptyPasswords);
      showToast("Password changed successfully.", "success");
    } catch (error) {
      showToast(authError(error, "Unable to change your password."), "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const passwordInput = (
    id: PasswordField,
    label: string,
    autoComplete: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible[id] ? "text" : "password"}
          value={passwords[id]}
          minLength={id === "currentPassword" ? undefined : 8}
          maxLength={128}
          autoComplete={autoComplete}
          required
          disabled={savingPassword}
          className="h-11 pr-11"
          onChange={(event) =>
            setPasswords((current) => ({
              ...current,
              [id]: event.target.value,
            }))
          }
        />
        <button
          type="button"
          aria-label={`${visible[id] ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-800"
          onClick={() =>
            setVisible((current) => ({ ...current, [id]: !current[id] }))
          }
        >
          {visible[id] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[430px]" />
        <Skeleton className="h-[430px]" />
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <section className="rounded-lg bg-white shadow-sm">
        <ErrorState
          title="Profile unavailable"
          description={loadError ?? "Unable to load your profile."}
          onRetry={() => void load()}
        />
      </section>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
          Profile
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your account details and password.
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#234A91]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your profile information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={saveProfile}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  required
                  disabled={savingProfile}
                  className="h-11"
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user.username}
                  disabled
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roles">Roles</Label>
                <Input
                  id="roles"
                  value={user.roles.join(", ")}
                  disabled
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={savingProfile || fullName.trim() === user.fullName}
                className="bg-[#234A91] hover:bg-[#193b78]"
              >
                {savingProfile && <Loader2 className="animate-spin" />}
                {savingProfile ? "Saving" : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#234A91]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Use at least 8 characters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={savePassword}>
              {passwordInput(
                "currentPassword",
                "Current password",
                "current-password",
              )}
              {passwordInput("newPassword", "New password", "new-password")}
              {passwordInput(
                "confirmPassword",
                "Confirm password",
                "new-password",
              )}
              <Button
                type="submit"
                disabled={savingPassword}
                className="bg-[#234A91] hover:bg-[#193b78]"
              >
                {savingPassword && <Loader2 className="animate-spin" />}
                {savingPassword ? "Changing password" : "Change password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
