import { useState, useEffect, useCallback } from "react";
import { getStudents } from "../services/student.service";
import type { Student, PaginatedResponse } from "../types/student.types";

interface UseStudentsOptions {
  page?: number;
  limit?: number;
  search?: string;
  classFilter?: string;
  sectionFilter?: string;
  statusFilter?: string;
}

interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: () => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setClassFilter: (classFilter: string) => void;
  setSectionFilter: (sectionFilter: string) => void;
  setStatusFilter: (statusFilter: string) => void;
}

const useStudents = (options: UseStudentsOptions = {}): UseStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(options.page || 1);
  const [search, setSearch] = useState(options.search || "");
  const [classFilter, setClassFilter] = useState(options.classFilter || "");
  const [sectionFilter, setSectionFilter] = useState(
    options.sectionFilter || "",
  );
  const [statusFilter, setStatusFilter] = useState(options.statusFilter || "");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: options.limit || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<Student> = await getStudents(
        page,
        options.limit || 10,
        search,
        classFilter,
        sectionFilter,
        statusFilter,
      );
      setStudents(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [page, search, classFilter, sectionFilter, statusFilter, options.limit]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      await fetchStudents();
      if (!isMounted) return;
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    pagination,
    refetch: fetchStudents,
    setPage,
    setSearch,
    setClassFilter,
    setSectionFilter,
    setStatusFilter,
  };
};

export default useStudents;
