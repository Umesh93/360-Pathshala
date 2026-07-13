import React from "react";
import {
  GraduationCap,
  UserCheck,
  School,
  CalendarCheck,
  Wallet,
  CreditCard,
  FileText,
  CalendarDays,
} from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}

interface DashboardCardsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceToday: number;
    feeCollectionThisMonth: number;
    pendingFees: number;
    upcomingExams: number;
    upcomingEvents: number;
  };
}

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-NP");
};

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  const cards: StatItem[] = [
    {
      title: "Total Students",
      value: formatNumber(stats.totalStudents),
      icon: <GraduationCap size={24} />,
      iconBg: "bg-blue-500",
    },
    {
      title: "Total Teachers",
      value: formatNumber(stats.totalTeachers),
      icon: <UserCheck size={24} />,
      iconBg: "bg-teal-500",
    },
    {
      title: "Total Classes",
      value: formatNumber(stats.totalClasses),
      icon: <School size={24} />,
      iconBg: "bg-purple-500",
    },
    {
      title: "Attendance Today",
      value: formatNumber(stats.attendanceToday),
      icon: <CalendarCheck size={24} />,
      iconBg: "bg-green-500",
    },
    {
      title: "Fee Collection This Month",
      value: `Rs. ${formatNumber(stats.feeCollectionThisMonth)}`,
      icon: <Wallet size={24} />,
      iconBg: "bg-orange-500",
    },
    {
      title: "Pending Fees",
      value: `Rs. ${formatNumber(stats.pendingFees)}`,
      icon: <CreditCard size={24} />,
      iconBg: "bg-red-500",
    },
    {
      title: "Upcoming Exams",
      value: formatNumber(stats.upcomingExams),
      icon: <FileText size={24} />,
      iconBg: "bg-indigo-500",
    },
    {
      title: "Upcoming Events",
      value: formatNumber(stats.upcomingEvents),
      icon: <CalendarDays size={24} />,
      iconBg: "bg-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${card.iconBg}`}
            >
              {card.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{card.value}</h2>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
