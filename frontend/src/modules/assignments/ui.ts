export const card = "rounded-xl border border-gray-200 bg-white shadow-sm";
export const input =
  "mt-1 min-h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#234A91] focus:ring-1 focus:ring-[#234A91] disabled:bg-gray-100";
export const primary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#234A91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b3a72] disabled:cursor-not-allowed disabled:opacity-50";
export const secondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

export const titleCase = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not set";
