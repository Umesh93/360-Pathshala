export default function AddSchoolForm() {
  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {/* Header */}

        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-3xl font-semibold text-slate-800">School Info</h2>
        </div>

        {/* Body */}

        <div className="space-y-8 p-8">
          {/* First Row */}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">
                Name of the School
              </label>

              <input
                type="text"
                placeholder="ABC Secondary School"
                className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">
                Address
              </label>

              <input
                type="text"
                placeholder="Kathmandu"
                className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                placeholder="school@gmail.com"
                className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-slate-700">
                Phone Number
              </label>

              <input
                type="text"
                placeholder="98XXXXXXXX"
                className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* Features */}

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-700">
              Features
            </label>

            <div className="flex min-h-[56px] flex-wrap items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
                Student Registration
              </span>

              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
                Exam Management
              </span>

              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
                Attendance
              </span>

              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
                Fees Management
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              (Replace this with a MultiSelect component later.)
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}

      <div className="mt-10 flex justify-center gap-6">
        <button className="h-14 w-56 rounded-xl border-2 border-red-400 text-lg font-medium text-red-500 transition hover:bg-red-50">
          Cancel
        </button>

        <button className="h-14 w-64 rounded-xl bg-teal-500 text-lg font-medium text-white transition hover:bg-teal-600">
          Save Changes
        </button>
      </div>
    </>
  );
}
