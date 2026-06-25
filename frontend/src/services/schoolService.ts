import type { School } from "../types/School";

export const getSchools = async (): Promise<School[]> => {
  return [
    {
      id: 1,
      schoolName: "ABC Secondary School",
      address: "Kathmandu",
      email: "abc@gmail.com",
      phoneNumber: "9800000001",
      features: ["Student Registration", "Attendance"],
    },
    {
      id: 2,
      schoolName: "XYZ School",
      address: "Pokhara",
      email: "xyz@gmail.com",
      phoneNumber: "9800000002",
      features: ["Exam Management", "Attendance"],
    },
  ];
};
