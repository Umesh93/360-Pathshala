import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import ErrorState from "../../components/feedback/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import Skeleton from "../../components/Skeleton";
import StudentLayout from "../../layouts/StudentLayout";
import { authError } from "../../services/authService";
import {
  getAcademicCalendar,
  type AcademicCalendarEntry,
} from "../../services/studentAccountService";

const date = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );
const day = (value: string) =>
  new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(
    new Date(`${value}T00:00:00`),
  );
const title = (value: string) =>
  value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AcademicCalendar() {
  const [entries, setEntries] = useState<AcademicCalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await getAcademicCalendar());
    } catch (reason) {
      setError(authError(reason, "Unable to load the academic calendar."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <StudentLayout>
      <PageHeader
        title="Academic Calendar"
        subtitle="School holidays and academic calendar dates."
      />
      {loading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <section className="rounded-lg bg-white shadow-sm">
          <ErrorState title="Calendar unavailable" description={error} onRetry={load} />
        </section>
      ) : entries.length ? (
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Day</th>
                  <th className="px-5 py-3">Holiday / Event</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                      {entry.startsOn === entry.endsOn
                        ? date(entry.startsOn)
                        : `${date(entry.startsOn)} - ${date(entry.endsOn)}`}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{day(entry.startsOn)}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{entry.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#234A91]">
                        {title(entry.type)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{entry.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-gray-100 md:hidden">
            {entries.map((entry) => (
              <article key={entry.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#234A91]">
                    <CalendarDays size={20} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900">{entry.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {date(entry.startsOn)} · {day(entry.startsOn)}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase text-[#234A91]">
                      {title(entry.type)}
                    </p>
                    {entry.description && <p className="mt-2 text-sm text-gray-600">{entry.description}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-gray-400" />
          <h2 className="mt-3 font-semibold text-gray-800">No calendar entries</h2>
          <p className="mt-1 text-sm text-gray-500">No holidays or academic calendar dates are available.</p>
        </section>
      )}
    </StudentLayout>
  );
}
