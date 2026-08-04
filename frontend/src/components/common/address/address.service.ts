import api from "../../../services/api";
import type { LocationOption } from "./address.types";

export const getProvinces = async (): Promise<LocationOption[]> => {
  const response = await api.get("/people/students/locations/provinces");
  return response.data as LocationOption[];
};

export const getDistricts = async (provinceId: number): Promise<LocationOption[]> => {
  const response = await api.get("/people/students/locations/districts", { params: { provinceId } });
  return response.data as LocationOption[];
};
