// lib/utils/auth/session.ts
import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { authService } from "#/lib/services/auth";
import { queryKeys } from "#/lib/utils/query-keys";

/**
 * Los cuatro roles que maneja el backend.
 *
 * Antes acá había dos, y se decidía con `role.includes("admin")`. Eso dejaba
 * al instructor clasificado como aprendiz —"instructor" no contiene "admin"—
 * así que el guarda de /admin lo expulsaba y no veía ni sus cursos ni sus
 * entregas. Y al superadministrador lo volvía indistinguible de un admin,
 * cuando es el único que puede crear organizaciones.
 */
export type Role = "superadmin" | "admin" | "instructor" | "student";

const ROLES: Role[] = ["superadmin", "admin", "instructor", "student"];

/** El rol tal como lo manda el backend. Lo desconocido entra como aprendiz. */
export function normalizeRole(role?: string | null): Role {
	const limpio = role?.toLowerCase().trim() as Role | undefined;
	return limpio && ROLES.includes(limpio) ? limpio : "student";
}

/**
 * El área que le corresponde a cada rol.
 *
 * Son tres y no dos: quien dicta no administra la empresa ni es un aprendiz,
 * así que tiene la suya con sus cursos, sus grupos y sus entregas.
 */
export function areaDe(role?: string | null) {
	const rol = normalizeRole(role);
	if (rol === "instructor") return "/instructor";
	return rol === "student" ? "/student" : "/admin";
}

/** Administración de la plataforma: admin y superadministrador. */
export function esAreaAdmin(role?: string | null) {
	return areaDe(role) === "/admin";
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
	return `${areaDe(role)}/home` as
		| "/admin/home"
		| "/instructor/home"
		| "/student/home";
}
