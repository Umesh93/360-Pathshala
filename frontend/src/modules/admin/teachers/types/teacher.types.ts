export interface Teacher {
  id: number;
  teacherId: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dob: string;
  phone: string;
  email?: string;
  address: string;
  qualification: string;
  subject: string;
  joiningDate: string;
  experience: string;
  status: "active" | "inactive";
  photo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
