// lib/utils/auth/session.ts
import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { authService } from "#/lib/services/auth";
import { queryKeys } from "#/lib/utils/query-keys";

export type Role = "admin" | "student";

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

// Roles del backend que en el frontend se comportan como admin.
const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export function normalizeRole(role?: string | null): Role {
	return ADMIN_ROLES.has(role?.toLowerCase() ?? "") ? "admin" : "student";
}

export function isAdmin(role?: string | null) {
	return normalizeRole(role) === "admin";
}

export function getHomeByRole(role?: string | null) {
	return isAdmin(role) ? "/admin/home" : "/student/home";
}
