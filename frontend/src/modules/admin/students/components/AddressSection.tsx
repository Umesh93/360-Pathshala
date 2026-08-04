import AddressForm from "../../../../components/common/address/AddressForm";
import type { AddressData } from "../schemas/student.schema";

interface AddressSectionProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Record<string, string>;
}

export default function AddressSection({ data, onChange, errors = {} }: AddressSectionProps) {
  return <AddressForm data={data} onChange={onChange} errors={errors} />;
}
