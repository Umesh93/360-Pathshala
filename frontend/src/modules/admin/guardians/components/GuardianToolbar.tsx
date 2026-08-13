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
  provinceFilter: string;
  onProvinceChange: (value: string) => void;
  districtFilter: string;
  onDistrictChange: (value: string) => void;
  studentFilter: string;
  onStudentChange: (value: string) => void;
  deleted: boolean;
  onDeletedChange: (value: boolean) => void;
}

const selectClass =
  "h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#234A91] focus:ring-2 focus:ring-blue-100";

export default function GuardianToolbar(props: GuardianToolbarProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <input
          value={props.searchQuery}
          onChange={(event) => props.onSearch(event.target.value)}
          placeholder="Search by ID, name, mobile or email"
          className={`${selectClass} flex-1`}
        />
        <button
          onClick={props.onExport}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
        >
          Export CSV
        </button>
        <button
          onClick={props.onRefresh}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
        <button
          onClick={props.onAddGuardian}
          className="h-10 rounded-xl bg-[#234A91] text-white px-4 text-sm"
        >
          Add Guardian
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <select
          value={props.statusFilter}
          onChange={(event) => props.onStatusChange(event.target.value)}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          value={props.relationshipFilter}
          onChange={(event) => props.onRelationshipChange(event.target.value)}
          className={selectClass}
        >
          <option value="">All Relationships</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Guardian">Guardian</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Other">Other</option>
        </select>
        <input
          value={props.provinceFilter}
          onChange={(event) => props.onProvinceChange(event.target.value)}
          placeholder="Province"
          className={selectClass}
        />
        <input
          value={props.districtFilter}
          onChange={(event) => props.onDistrictChange(event.target.value)}
          placeholder="District"
          className={selectClass}
        />
        <select
          value={props.studentFilter}
          onChange={(event) => props.onStudentChange(event.target.value)}
          className={selectClass}
        >
          <option value="">All guardians</option>
          <option value="with">With students</option>
          <option value="without">Without students</option>
        </select>
        <label className="h-10 flex items-center gap-2 px-3 rounded-xl border border-gray-200 text-sm">
          <input
            type="checkbox"
            checked={props.deleted}
            onChange={(event) => props.onDeletedChange(event.target.checked)}
          />{" "}
          Deleted only
        </label>
      </div>
    </div>
  );
}
