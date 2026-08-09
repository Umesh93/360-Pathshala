import { useEffect, useState, type ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import ParentLayout from "../../layouts/ParentLayout";
import StudentLayout from "../../layouts/StudentLayout";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  LookupSelectors,
  Notice,
  ScheduleSummary,
  TimetableGrid,
} from "./components";
import {
  getChildrenSchedules,
  getStudentSchedule,
  getTeacherSchedule,
  timetableError,
} from "./service";
import type { ChildSchedule, GridSelection, ScheduleResponse } from "./types";

function ScheduleView({
  title,
  subtitle,
  layout,
  load,
  sessionPicker = false,
}: {
  title: string;
  subtitle: string;
  layout: (children: ReactNode) => ReactNode;
  load: (academicSessionId?: number) => Promise<ScheduleResponse>;
  sessionPicker?: boolean;
}) {
  const [schedule, setSchedule] = useState<ScheduleResponse>();
  const [selection, setSelection] = useState<GridSelection>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setSchedule(await load(selection.academicSessionId));
    } catch (requestError) {
      setSchedule(undefined);
      setError(timetableError(requestError));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    load()
      .then((record) => {
        if (active) setSchedule(record);
      })
      .catch((requestError) => {
        if (active) setError(timetableError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);
  const content = (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => void refresh()}
          >
            <RefreshCw /> Refresh
          </Button>
        }
      />
      {sessionPicker && (
        <section className="mb-5 max-w-sm border border-gray-200 bg-white p-4 shadow-sm">
          <LookupSelectors
            value={selection}
            onChange={setSelection}
            includeSection={false}
          />
          <Button
            className="mt-3"
            disabled={!selection.academicSessionId || loading}
            onClick={() => void refresh()}
          >
            Load session
          </Button>
        </section>
      )}
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white">
          <Loader2 className="animate-spin text-[#234A91]" />
        </div>
      ) : error ? (
        <Notice error message={error} />
      ) : !schedule?.weeklyEntries.length ? (
        <EmptyState
          title="No timetable available"
          description="No scheduled periods are available for the selected academic session."
        />
      ) : (
        <div className="space-y-5">
          <ScheduleSummary schedule={schedule} />
          <section className="border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <TimetableGrid entries={schedule.weeklyEntries} />
          </section>
        </div>
      )}
    </>
  );
  return layout(content);
}

export function TeacherTimetablePage() {
  return (
    <ScheduleView
      title="My Timetable"
      subtitle="Your weekly teaching schedule, upcoming classes, and free periods."
      layout={(children) => <TeacherLayout>{children}</TeacherLayout>}
      load={getTeacherSchedule}
      sessionPicker
    />
  );
}
export function StudentTimetablePage() {
  return (
    <ScheduleView
      title="My Timetable"
      subtitle="Your current weekly class schedule."
      layout={(children) => <StudentLayout>{children}</StudentLayout>}
      load={getStudentSchedule}
    />
  );
}

export function ParentTimetablePage() {
  const [children, setChildren] = useState<ChildSchedule[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const records = await getChildrenSchedules();
      setChildren(records);
      setSelected((current) =>
        records.some((child) => child.studentId === current)
          ? current
          : (records[0]?.studentId ?? 0),
      );
    } catch (requestError) {
      setChildren([]);
      setError(timetableError(requestError));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    getChildrenSchedules()
      .then((records) => {
        if (!active) return;
        setChildren(records);
        setSelected(records[0]?.studentId ?? 0);
      })
      .catch((requestError) => {
        if (active) setError(timetableError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const child = children.find((item) => item.studentId === selected);
  return (
    <ParentLayout>
      <PageHeader
        title="Child Timetable"
        subtitle="Weekly schedules for students linked to your guardian account."
        action={
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => void load()}
          >
            <RefreshCw /> Refresh
          </Button>
        }
      />
      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white">
          <Loader2 className="animate-spin text-[#234A91]" />
        </div>
      ) : error ? (
        <Notice error message={error} />
      ) : !children.length ? (
        <EmptyState
          title="No linked student schedules"
          description="No timetable is available for a student linked to this guardian account."
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {children.map((item) => (
              <Button
                key={item.studentId}
                variant={selected === item.studentId ? "default" : "outline"}
                onClick={() => setSelected(item.studentId)}
              >
                {item.studentName}
              </Button>
            ))}
          </div>
          {child &&
            (child.schedule.weeklyEntries.length ? (
              <>
                <ScheduleSummary schedule={child.schedule} />
                <section className="border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                  <div className="mb-4">
                    <h2 className="font-semibold text-gray-900">
                      {child.studentName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {child.className} - {child.sectionName}
                    </p>
                  </div>
                  <TimetableGrid entries={child.schedule.weeklyEntries} />
                </section>
              </>
            ) : (
              <EmptyState
                title="No timetable available"
                description={`No scheduled periods are available for ${child.studentName}.`}
              />
            ))}
        </div>
      )}
    </ParentLayout>
  );
}
