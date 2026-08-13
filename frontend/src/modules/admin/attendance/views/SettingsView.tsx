import { useEffect, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { useToast } from "../../students/components/Toast";
import {
  errorMessage,
  getSettings,
  updateSettings,
} from "../attendance.service";
import type { AttendanceSettings } from "../attendance.types";
import {
  cardClass,
  ErrorBanner,
  fieldClass,
  FilterField,
  Loading,
  primaryButton,
} from "../components/AttendanceUi";

const defaults: AttendanceSettings = {
  studentCutoffTime: "09:00",
  teacherCutoffTime: "08:30",
  lateAfterMinutes: 15,
  allowTeacherEdits: false,
  notifyGuardians: true,
  excludeWeekends: true,
};
export default function SettingsView() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    getSettings()
      .then((value) => active && setSettings(value))
      .catch((value) => active && setError(errorMessage(value)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reload]);
  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      showToast("Attendance settings updated", "success");
    } catch (value) {
      showToast(errorMessage(value), "error");
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loading label="Loading attendance settings..." />;
  if (error)
    return (
      <ErrorBanner
        message={error}
        onRetry={() => {
          setError("");
          setLoading(true);
          setReload((value) => value + 1);
        }}
      />
    );
  const toggles: Array<[keyof AttendanceSettings, string, string]> = [
    [
      "allowTeacherEdits",
      "Allow teacher edits",
      "Teachers can revise attendance after initial submission.",
    ],
    [
      "notifyGuardians",
      "Notify guardians",
      "Send notifications when students are marked absent or late.",
    ],
    [
      "excludeWeekends",
      "Exclude weekends",
      "Do not count weekends as working attendance days.",
    ],
  ];
  return (
    <section className={`${cardClass} mx-auto max-w-4xl overflow-hidden`}>
      <div className="border-b p-5">
        <h2 className="font-semibold text-gray-900">Attendance Rules</h2>
        <p className="text-sm text-gray-500">
          Configure marking windows and school-wide attendance behavior.
        </p>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-3">
        <FilterField label="Student cutoff">
          <input
            type="time"
            className={fieldClass}
            value={settings.studentCutoffTime}
            onChange={(event) =>
              setSettings({
                ...settings,
                studentCutoffTime: event.target.value,
              })
            }
          />
        </FilterField>
        <FilterField label="Teacher cutoff">
          <input
            type="time"
            className={fieldClass}
            value={settings.teacherCutoffTime}
            onChange={(event) =>
              setSettings({
                ...settings,
                teacherCutoffTime: event.target.value,
              })
            }
          />
        </FilterField>
        <FilterField label="Mark late after (minutes)">
          <input
            type="number"
            min="0"
            max="240"
            className={fieldClass}
            value={settings.lateAfterMinutes}
            onChange={(event) =>
              setSettings({
                ...settings,
                lateAfterMinutes: Number(event.target.value),
              })
            }
          />
        </FilterField>
      </div>
      <div className="divide-y border-t">
        {toggles.map(([key, label, description]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 p-5"
          >
            <div>
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <Switch
              aria-label={label}
              checked={Boolean(settings[key])}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, [key]: checked })
              }
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t bg-gray-50 p-5">
        <button className={primaryButton} disabled={saving} onClick={save}>
          {saving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          Save Settings
        </button>
      </div>
    </section>
  );
}
