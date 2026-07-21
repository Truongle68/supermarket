import { ENDPOINT } from "../constants/end-point";
import httpClient from "../httpClient";
import {
  ApiResponse,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/lib/types";

export const userService = {
  // Address Services
  getAddressList: async (): Promise<ApiResponse<Address[]>> => {
    const res = await httpClient.get(ENDPOINT.USER.ADDRESS.GET_LIST);
    return res.data;
  },

  createAddress: async (data: CreateAddressRequest): Promise<ApiResponse<Address>> => {
    const res = await httpClient.post(ENDPOINT.USER.ADDRESS.CREATE, data);
    return res.data;
  },

  setDefaultAddress: async (id: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.ADDRESS.SET_DEFAULT, { id });
    return res.data;
  },

  updateAddress: async (data: UpdateAddressRequest): Promise<ApiResponse<Address>> => {
    const res = await httpClient.post(ENDPOINT.USER.ADDRESS.UPDATE, data);
    return res.data;
  },

  deleteAddress: async (id: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.post(ENDPOINT.USER.ADDRESS.DELETE, { id });
    return res.data;
  },
};

export default userService;