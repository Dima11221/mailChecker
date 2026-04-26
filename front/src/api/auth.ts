import { api } from "./axiosClient.ts";
import type { ILoginPayload, ILoginResponse, IUser } from "./types";

export async function login(payload: ILoginPayload): Promise<ILoginResponse> {
  const { data } = await api.post<ILoginResponse>("/auth/login", payload);
  return data;
}

export async function getMe(): Promise<{ user: IUser }> {
  const { data } = await api.get<{ user: IUser }>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
