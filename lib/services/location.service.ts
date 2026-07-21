import axios from "axios";

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}

const LOCATION_API_BASE = "https://provinces.open-api.vn/api";

export const locationService = {
  
  getProvinces: async (): Promise<Province[]> => {
    const res = await axios.get<Province[]>(`${LOCATION_API_BASE}/p/`);
    return res.data || [];
  },

  getDistricts: async (provinceCode: number): Promise<District[]> => {
    if (!provinceCode) return [];
    const res = await axios.get<{ districts: District[] }>(`${LOCATION_API_BASE}/p/${provinceCode}?depth=2`);
    return res.data?.districts || [];
  },

  getWards: async (districtCode: number): Promise<Ward[]> => {
    if (!districtCode) return [];
    const res = await axios.get<{ wards: Ward[] }>(`${LOCATION_API_BASE}/d/${districtCode}?depth=2`);
    return res.data?.wards || [];
  },
};

export default locationService;
