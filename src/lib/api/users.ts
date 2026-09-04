import { apiServer } from "@/lib/api/server";
import type { ApiUser } from "@/lib/types";

export async function getMe(): Promise<ApiUser> {
  return apiServer<ApiUser>("/users/me");
}

export async function updateMyProfile(input: { fullName: string }): Promise<ApiUser> {
  return apiServer<ApiUser>("/users/me", { method: "PATCH", body: input });
}
