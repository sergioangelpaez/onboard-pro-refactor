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
	// Ver `areaDe` al final del archivo: son tres areas, no dos.
	return `${areaDe(role)}/home` as
		| "/admin/home"
		| "/instructor/home"
		| "/student/home";
}

// --- Area de instructor -----------------------------------------------------
// Agregado en la rama vista-instructor. Lo de arriba queda tal cual: esto se
// suma sin tocar `normalizeRole` ni `isAdmin`, para poder sacarlo entero si se
// decide que el instructor comparta area con los aprendices.

/** Los cuatro roles que maneja el backend, sin aplastar ninguno. */
export type RolReal = "superadmin" | "admin" | "instructor" | "student";

const ROLES_REALES: RolReal[] = ["superadmin", "admin", "instructor", "student"];

export function rolReal(role?: string | null): RolReal {
	const limpio = role?.toLowerCase().trim() as RolReal | undefined;
	return limpio && ROLES_REALES.includes(limpio) ? limpio : "student";
}

/**
 * El area que le corresponde a cada rol.
 *
 * Son tres: quien dicta no administra la empresa ni es un aprendiz, asi que
 * tiene la suya con sus cursos, sus grupos y sus entregas. Los limites de lo
 * que puede hacer los aplica el backend con `requireRole`.
 */
export function areaDe(role?: string | null) {
	const rol = rolReal(role);
	if (rol === "instructor") return "/instructor";
	return rol === "student" ? "/student" : "/admin";
}
