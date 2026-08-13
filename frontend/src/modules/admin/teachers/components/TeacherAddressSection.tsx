import React from "react";
import type { AddressData } from "../schemas/teacher.schema";
import AddressForm from "../../../../components/common/address/AddressForm";

interface TeacherAddressSectionProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Record<string, string>;
}

const TeacherAddressSection: React.FC<TeacherAddressSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <AddressForm
      data={{
        ...data,
        currentStreet: data.currentStreet || "",
        permanentProvince: data.permanentProvince || "",
        permanentDistrict: data.permanentDistrict || "",
        permanentMunicipality: data.permanentMunicipality || "",
        permanentWard: data.permanentWard || "",
        permanentStreet: data.permanentStreet || "",
      }}
      onChange={onChange}
      errors={errors}
    />
  );
};

export default TeacherAddressSection;
