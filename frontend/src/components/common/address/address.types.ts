export interface AddressValue {
  currentProvince: string;
  currentProvinceName?: string;
  currentDistrict: string;
  currentDistrictName?: string;
  currentMunicipality: string;
  currentMunicipalityName?: string;
  currentWard: string;
  currentWardNumber?: string;
  currentStreet?: string;
  permanentSameAsCurrent: boolean;
  permanentProvince?: string;
  permanentProvinceName?: string;
  permanentDistrict?: string;
  permanentDistrictName?: string;
  permanentMunicipality?: string;
  permanentWard?: string;
  permanentStreet?: string;
}

export interface LocationOption {
  id: number;
  name: string;
}

export type ProvinceOption = LocationOption;
