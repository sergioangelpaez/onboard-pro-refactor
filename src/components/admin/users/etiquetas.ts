import type { User } from "#/lib/schemas/users";

/** Los nombres de rol que ve la gente, iguales en toda la app ("Aprendiz", no "student"). */
export const ETIQUETA_ROL: Record<string, string> = {
	student: "Aprendiz",
	instructor: "Instructor",
	admin: "Administrador",
	superadmin: "Superadmin",
};

export function etiquetaRol(role: string) {
	return ETIQUETA_ROL[role] ?? role;
}

export const ETIQUETA_ESTADO: Record<User["status"], string> = {
	Active: "Activo",
	Inactive: "Inactivo",
	Pending: "Pendiente",
	Suspended: "Suspendido",
};

export function varianteEstado(status: User["status"]) {
	if (status === "Active") return "default" as const;
	if (status === "Suspended") return "destructive" as const;
	return "outline" as const;
}
