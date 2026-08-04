interface GuardianToolbarProps {
  searchQuery: string;
  onSearch: (value: string) => void;
  onRefresh: () => void;
  onAddGuardian: () => void;
  onExport: () => void;
  relationshipFilter: string;
  onRelationshipChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  communicationFilter: string;
  onCommunicationChange: (value: string) => void;
}

export default function GuardianToolbar({
  searchQuery,
  onSearch,
  onRefresh,
  onAddGuardian,
  onExport,
  relationshipFilter,
  onRelationshipChange,
  statusFilter,
  onStatusChange,
  communicationFilter,
  onCommunicationChange,
}: GuardianToolbarProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <input
          value={searchQuery}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search by name, phone or email"
          className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100 flex-1"
        />
        <button onClick={onExport} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
          Export CSV
        </button>
        <button onClick={onRefresh} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select value={relationshipFilter} onChange={(event) => onRelationshipChange(event.target.value)} className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100">
          <option value="">All Relationships</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Guardian">Guardian</option>
        </select>
        <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)} className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select value={communicationFilter} onChange={(event) => onCommunicationChange(event.target.value)} className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100">
          <option value="">All Preferences</option>
          <option value="SMS">SMS</option>
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
        <button onClick={onAddGuardian} className="h-10 rounded-xl bg-[#234A91] text-white px-4 text-sm">
          Add Guardian
        </button>
      </div>
    </div>
  );
}
