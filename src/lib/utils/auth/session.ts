// lib/utils/auth/session.ts
import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { authService } from "#/lib/services/auth";
import { queryKeys } from "#/lib/utils/query-keys";

export type Role = "admin" | "student";

export function normalizeRole(role?: string | null): Role {
	return role?.toLowerCase().includes("admin") ? "admin" : "student";
}

export const currentUserQueryOptions = queryOptions({
	queryKey: queryKeys.users.me, // la misma key que usa el hook, ver punto 2
	queryFn: () => authService.getMe(),
	staleTime: 5 * 60 * 1000,
	retry: false,
});

export async function getCurrentUser(queryClient: QueryClient) {
	try {
		return await queryClient.ensureQueryData(currentUserQueryOptions);
	} catch {
		return null;
	}
}

export function getHomeByRole(role?: string | null) {
	return normalizeRole(role) === "admin" ? "/admin/home" : "/student/home";
}
