import { BookOpen, ClipboardCheck, GraduationCap } from "lucide-react";

import ParentLayout from "../../layouts/ParentLayout";

const ParentDashboard = () => (
  <ParentLayout>
    <section className="mx-auto max-w-3xl rounded-lg bg-white px-6 py-12 text-center shadow-sm md:px-10 md:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#234A91]">
        <GraduationCap size={28} />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase text-[#234A91]">
        Coming Soon
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
        Parent Dashboard
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-gray-600">
        A consolidated view of your children's school activity is being
        prepared. Child attendance, published results, and assignments will
        appear here.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [ClipboardCheck, "Child attendance"],
          [GraduationCap, "Published results"],
          [BookOpen, "Assignments"],
        ].map(([Icon, label]) => (
          <div
            key={String(label)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600"
          >
            <Icon size={18} className="text-[#234A91]" />
            {String(label)}
          </div>
        ))}
      </div>
    </section>
  </ParentLayout>
);

export default ParentDashboard;
