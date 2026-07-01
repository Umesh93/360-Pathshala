// export default function AddSchoolForm() {
//   return (
//     <>
//       <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
//         {/* Header */}

//         <div className="border-b border-slate-200 px-8 py-6">
//           <h2 className="text-3xl font-semibold text-slate-800">School Info</h2>
//         </div>

//         {/* Body */}

//         <div className="space-y-8 p-8">
//           {/* First Row */}

//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Name of the School
//               </label>

//               <input
//                 type="text"
//                 placeholder="ABC Secondary School"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Address
//               </label>

//               <input
//                 type="text"
//                 placeholder="Kathmandu"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Email
//               </label>

//               <input
//                 type="email"
//                 placeholder="school@gmail.com"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Phone Number
//               </label>

//               <input
//                 type="text"
//                 placeholder="98XXXXXXXX"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>
//           </div>

//           {/* Features */}

//           <div>
//             <label className="mb-2 block text-base font-semibold text-slate-700">
//               Features
//             </label>

//             <div className="flex min-h-[56px] flex-wrap items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
//               <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
//                 Student Registration
//               </span>

//               <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
//                 Exam Management
//               </span>

//               <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
//                 Attendance
//               </span>

//               <span className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
//                 Fees Management
//               </span>
//             </div>

//             <p className="mt-2 text-sm text-slate-500">
//               (Replace this with a MultiSelect component later.)
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Buttons */}

//       <div className="mt-10 flex justify-center gap-6">
//         <button className="h-14 w-56 rounded-xl border-2 border-red-400 text-lg font-medium text-red-500 transition hover:bg-red-50">
//           Cancel
//         </button>

//         <button className="h-14 w-64 rounded-xl bg-teal-500 text-lg font-medium text-white transition hover:bg-teal-600">
//           Save Changes
//         </button>
//       </div>
//     </>
//   );
// }

// import { useState } from "react";
// import MultiSelect from "./MultiSelect";

// export default function AddSchoolForm() {
//   const [features, setFeatures] = useState<string[]>([]);

//   const featureOptions = [
//     "Student Registration",
//     "Attendance",
//     "Exam Management",
//     "Fees Management",
//     "Library",
//     "Transport",
//     "Hostel",
//     "Payroll",
//     "Inventory",
//     "HR Management",
//   ];

//   return (
//     <>
//       <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
//         <div className="border-b border-slate-200 px-8 py-6">
//           <h2 className="text-3xl font-semibold text-slate-800">School Info</h2>
//         </div>

//         <div className="space-y-8 p-8">
//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Name of the School
//               </label>

//               <input
//                 type="text"
//                 placeholder="ABC Secondary School"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Address
//               </label>

//               <input
//                 type="text"
//                 placeholder="Kathmandu"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Email
//               </label>

//               <input
//                 type="email"
//                 placeholder="school@gmail.com"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Phone Number
//               </label>

//               <input
//                 type="text"
//                 placeholder="98XXXXXXXX"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="mb-2 block text-base font-semibold text-slate-700">
//               Features
//             </label>

//             <MultiSelect
//               options={featureOptions}
//               selected={features}
//               onChange={setFeatures}
//               placeholder="Select Features"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="mt-10 flex justify-center gap-6">
//         <button className="h-14 w-56 rounded-xl border-2 border-red-400 text-lg font-medium text-red-500 hover:bg-red-50">
//           Cancel
//         </button>

//         <button className="h-14 w-64 rounded-xl bg-teal-500 text-lg font-medium text-white hover:bg-teal-600">
//           Save Changes
//         </button>
//       </div>
//     </>
//   );
// }

// import { useState } from "react";
// import MultiSelect from "./MultiSelect";

// export default function AddSchoolForm() {
//   const [features, setFeatures] = useState<string[]>([]);

//   const featureOptions = [
//     "Student Registration",
//     "Attendance",
//     "Exam Management",
//     "Fees Management",
//     "Library",
//     "Transport",
//     "Hostel",
//     "Payroll",
//     "Inventory",
//     "HR Management",
//   ];

//   return (
//     <>
//       <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
//         {/* Header */}
//         <div className="border-b border-slate-200 px-8 py-6">
//           <h2 className="text-3xl font-semibold text-slate-800">School Info</h2>
//         </div>

//         {/* Body */}
//         <div className="space-y-8 p-8">
//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Name of the School
//               </label>

//               <input
//                 type="text"
//                 placeholder="ABC Secondary School"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Address
//               </label>

//               <input
//                 type="text"
//                 placeholder="Kathmandu"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Email
//               </label>

//               <input
//                 type="email"
//                 placeholder="school@gmail.com"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-base font-semibold text-slate-700">
//                 Phone Number
//               </label>

//               <input
//                 type="text"
//                 placeholder="98XXXXXXXX"
//                 className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="mb-2 block text-base font-semibold text-slate-700">
//               Features
//             </label>

//             <MultiSelect
//               options={featureOptions}
//               selected={features}
//               onChange={setFeatures}
//               placeholder="Select Features"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="mt-10 flex justify-center gap-6">
//         <button className="h-14 w-56 rounded-xl border-2 border-red-400 text-lg font-medium text-red-500 transition hover:bg-red-50">
//           Cancel
//         </button>

//         <button className="h-14 w-64 rounded-xl bg-teal-500 text-lg font-medium text-white transition hover:bg-teal-600">
//           Save Changes
//         </button>
//       </div>
//     </>
//   );
// }

import { useState } from "react";
import MultiSelect from "./MultiSelect";

export default function AddSchoolForm() {
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const featureOptions = [
    "Student Registration",
    "Attendance",
    "Exam Management",
    "Fees Management",
    "Library",
    "Transport",
    "Hostel",
    "Payroll",
    "Inventory",
    "HR Management",
    "Parent Portal",
    "Teacher Portal",
    "Online Admission",
    "Timetable",
    "SMS Notification",
    "Certificate Management",
    "Finance",
    "Accounting",
  ];

  const handleSubmit = () => {
    const school = {
      schoolName,
      address,
      email,
      phoneNumber,
      features,
    };

    console.log(school);

    // TODO:
    // Call your API here

    /*
    axios.post("/schools", school)
    */

    alert("School saved successfully!");
  };

  const handleCancel = () => {
    setSchoolName("");
    setAddress("");
    setEmail("");
    setPhoneNumber("");
    setFeatures([]);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}

        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            School Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the school's basic information and enable required modules.
          </p>
        </div>

        {/* Body */}

        <div className="space-y-8 p-8">
          {/* First Row */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {/* School */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                School Name
              </label>

              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="ABC Secondary School"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            {/* Address */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Address
              </label>

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Kathmandu"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="school@gmail.com"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>

              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98XXXXXXXX"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* Features */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Enabled Features
            </label>

            <MultiSelect
              options={featureOptions}
              selected={features}
              onChange={setFeatures}
              placeholder="Choose modules for this school"
            />

            <p className="mt-2 text-xs text-slate-500">
              Select one or more modules that will be enabled for this school.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}

      <div className="flex justify-end gap-4">
        <button
          onClick={handleCancel}
          className="rounded-xl border border-red-300 px-8 py-3 font-medium text-red-600 transition hover:bg-red-50"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="rounded-xl bg-teal-600 px-8 py-3 font-medium text-white transition hover:bg-teal-700"
        >
          Save School
        </button>
      </div>
    </div>
  );
}
