import { useEffect, useState } from "react";
import { CalendarPlus, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import ConfirmDialog from "../../../../components/feedback/ConfirmDialog";
import { useToast } from "../../students/components/Toast";
import {
  deleteHoliday,
  errorMessage,
  getHolidays,
  saveHoliday,
} from "../attendance.service";
import type { Holiday } from "../attendance.types";
import {
  cardClass,
  Empty,
  ErrorBanner,
  fieldClass,
  FilterField,
  primaryButton,
  secondaryButton,
  today,
} from "../components/AttendanceUi";

const blank = (): Omit<Holiday, "id"> & { id?: number } => ({
  name: "",
  date: today(),
  description: "",
  recurring: false,
});
export default function HolidayView() {
  const { showToast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [items, setItems] = useState<Holiday[]>([]);
  const [form, setForm] = useState(blank());
  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState<number>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    getHolidays(year)
      .then((data) => active && setItems(data))
      .catch((value) => active && setError(errorMessage(value)));
    return () => {
      active = false;
    };
  }, [year, reload]);
  const submit = async () => {
    if (!form.name.trim() || !form.date) {
      showToast("Holiday name and date are required", "validation");
      return;
    }
    setSaving(true);
    try {
      await saveHoliday(form);
      showToast(
        `Holiday ${form.id ? "updated" : "created"} successfully`,
        "success",
      );
      setOpen(false);
      setForm(blank());
      setReload((value) => value + 1);
    } catch (value) {
      showToast(errorMessage(value), "error");
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!removeId) return;
    try {
      await deleteHoliday(removeId);
      showToast("Holiday deleted successfully", "success");
      setRemoveId(undefined);
      setReload((value) => value + 1);
    } catch (value) {
      setRemoveId(undefined);
      showToast(errorMessage(value), "error");
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <FilterField label="Calendar year">
          <input
            type="number"
            min="2000"
            max="2100"
            className={`${fieldClass} w-40`}
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          />
        </FilterField>
        <button
          className={primaryButton}
          onClick={() => {
            setForm(blank());
            setOpen(true);
          }}
        >
          <CalendarPlus size={17} />
          Add Holiday
        </button>
      </div>
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => setReload((value) => value + 1)}
        />
      )}
      <section className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Holiday</th>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-t" key={item.id}>
                  <td className="p-4">
                    <b>{item.name}</b>
                    {item.recurring && (
                      <span className="ml-2 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        Annual
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {item.date}
                    {item.endDate && item.endDate !== item.date
                      ? ` to ${item.endDate}`
                      : ""}
                  </td>
                  <td className="p-4 text-gray-600">
                    {item.description || "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Edit ${item.name}`}
                        className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setForm(item);
                          setOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        aria-label={`Delete ${item.name}`}
                        className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                        onClick={() => setRemoveId(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <Empty>No holidays configured for {year}.</Empty>}
        </div>
      </section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit" : "Add"} Holiday</DialogTitle>
            <DialogDescription>
              Holiday dates are excluded from attendance calculations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <FilterField label="Holiday name">
              <input
                className={fieldClass}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </FilterField>
            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Start date">
                <input
                  type="date"
                  className={fieldClass}
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </FilterField>
              <FilterField label="End date">
                <input
                  type="date"
                  min={form.date}
                  className={fieldClass}
                  value={form.endDate || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      endDate: event.target.value || undefined,
                    })
                  }
                />
              </FilterField>
            </div>
            <FilterField label="Description">
              <textarea
                className="min-h-20 w-full rounded-lg border border-gray-200 p-3 text-sm"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </FilterField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.recurring}
                onChange={(event) =>
                  setForm({ ...form, recurring: event.target.checked })
                }
              />
              Repeat annually
            </label>
          </div>
          <DialogFooter>
            <button className={secondaryButton} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className={primaryButton}
              onClick={submit}
              disabled={saving}
            >
              {saving && <LoaderCircle size={17} className="animate-spin" />}
              Save Holiday
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={removeId !== undefined}
        title="Delete Holiday"
        description="This holiday will no longer be excluded from attendance calculations."
        confirmLabel="Delete"
        variant="destructive"
        onCancel={() => setRemoveId(undefined)}
        onConfirm={remove}
      />
    </div>
  );
}
