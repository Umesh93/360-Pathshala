const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  DELETED: "bg-red-100 text-red-700",
};

interface GuardianStatusBadgeProps {
  status: string;
}

export default function GuardianStatusBadge({
  status,
}: GuardianStatusBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${statusColors[status?.toUpperCase()] || statusColors.ACTIVE}`}
    >
      {status || "ACTIVE"}
    </span>
  );
}
