export default function AddSchoolForm() {
  return (
    <div className="bg-white rounded-2xl">
      <div className="border-b p-5">
        <h2 className="font-semibold">School Info</h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Name of School</label>
            <input
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="ABC School"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="Kathmandu"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="school@gmail.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input
              className="w-full border rounded-lg p-3 mt-2"
              placeholder="98xxxxxxxx"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium">Features</label>
          <select className="w-full border rounded-lg p-3 mt-2" multiple>
            <option>Student Registration</option>
            <option>Attendance</option>
            <option>Exam Management</option>
            <option>Fees Management</option>
          </select>
        </div>
      </div>
    </div>
  );
}
