import { AddressLabel } from "./domain";

export interface Address {
  id: string;
  user_id: string;
  label: AddressLabel;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  label: AddressLabel;
  address_line: string;
  ward?: string;
  district?: string;
  city: string;
  lat?: number;
  lng?: number;
}

export interface UpdateAddressRequest {
  id: string;
  label?: AddressLabel;
  address_line?: string;
  ward?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

export interface SetDefaultAddressRequest {
  id: string;
}

export interface DeleteAddressRequest {
  id: string;
}
