/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import type { AttendanceStatus, Option } from "../attendance.types";

export const today = () => new Date().toISOString().slice(0, 10);
export const fieldClass = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#234A91] focus:ring-2 focus:ring-[#234A91]/10 disabled:bg-gray-100";
export const primaryButton = "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#234A91] px-4 text-sm font-medium text-white transition hover:bg-[#1b3a72] disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButton = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";
export const cardClass = "rounded-xl border border-gray-100 bg-white shadow-sm";
export const statuses: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "LEAVE"];
const statusStyle: Record<AttendanceStatus, string> = { PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200", ABSENT: "bg-red-50 text-red-700 border-red-200", LATE: "bg-amber-50 text-amber-700 border-amber-200", LEAVE: "bg-blue-50 text-blue-700 border-blue-200" };

export function StatusSelect({ value, onChange, disabled }: { value: AttendanceStatus; onChange: (status: AttendanceStatus) => void; disabled?: boolean }) {
  return <select aria-label="Attendance status" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value as AttendanceStatus)} className={`h-8 rounded-lg border px-2 text-xs font-semibold outline-none ${statusStyle[value]}`}>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>;
}
export function FilterField({ label, children }: { label: string; children: ReactNode }) { return <label className="block min-w-0"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>{children}</label>; }
export function OptionSelect({ value, onChange, options, placeholder, disabled }: { value?: number; onChange: (id?: number) => void; options: Option[]; placeholder: string; disabled?: boolean }) { return <select value={value || ""} disabled={disabled} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)} className={fieldClass}><option value="">{placeholder}</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>; }
export function Loading({ label = "Loading attendance..." }: { label?: string }) { return <div className={`${cardClass} flex min-h-52 items-center justify-center gap-2 text-sm text-gray-500`}><LoaderCircle size={19} className="animate-spin" />{label}</div>; }
export function Empty({ children = "No attendance records found." }: { children?: ReactNode }) { return <div className="p-10 text-center text-sm text-gray-500">{children}</div>; }
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) { return <div role="alert" className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"><span>{message}</span>{onRetry && <button type="button" onClick={onRetry} className="font-semibold underline">Retry</button>}</div>; }
export function MiniPagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) { if (totalPages <= 1) return null; return <div className="flex items-center justify-end gap-3 border-t px-4 py-3 text-sm"><button className={secondaryButton} disabled={page <= 0} onClick={() => onChange(page - 1)}>Previous</button><span className="text-gray-600">Page {page + 1} of {totalPages}</span><button className={secondaryButton} disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Next</button></div>; }
