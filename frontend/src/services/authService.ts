import api, { storeToken, clearToken } from "./api";
import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
  ProfilePatchPayload,
} from "@/types";

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>("/api/user/token/", payload);
    storeToken(data.access);
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>("/api/user/create/", payload);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/api/user/me/");
    return data;
  },

  async patchProfile(payload: ProfilePatchPayload): Promise<User> {
    const { data } = await api.patch<User>("/api/user/me/", payload);
    return data;
  },

  logout(): void {
    clearToken();
  },
};
