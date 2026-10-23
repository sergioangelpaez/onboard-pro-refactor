/**
 * Qué ve y qué puede hacer cada rol.
 *
 * El menú sale del prototipo de `public/index.html` del backend, que ya tenía
 * resuelto qué grupo y qué nombre le toca a cada sección según quién mira: un
 * administrador ve "Personas" donde el superadmin ve "Usuarios", y un
 * aprendiz ve "Mi progreso" donde los demás ven "Resumen".
 *
 * Los permisos son un espejo de los `requireRole` del backend. Sirven para no
 * mostrar pantallas ni botones que van a responder 403, no para proteger: la
 * autorización real vive en el servidor, porque el cliente se puede alterar.
 * Si acá y allá no coinciden, manda el servidor.
 */
export type Role = "student" | "instructor" | "admin" | "superadmin";

export interface MenuItem {
	label: string;
	url: string;
	/** Nombre del icono de lucide-react que le corresponde. */
	icon: IconName;
}

export interface MenuGroup {
	label: string;
	items: MenuItem[];
}

export type IconName =
	| "dashboard"
	| "tenants"
	| "users"
	| "courses"
	| "groups";

/**
 * El menú de cada rol.
 *
 * No aparece "Mi perfil": se abre haciendo clic en el usuario, al pie del
 * menú, y repetirlo como sección sería el mismo destino dos veces.
 *
 * Tampoco "Actividades": una actividad sin su curso no se entiende, así que
 * se llega a ellas abriendo el curso al que pertenecen.
 *
 * Tampoco "Ranking": está en el prototipo y el backend lo sirve
 * (`GET /api/gamification/ranking`), pero todavía no hay pantalla, y un
 * elemento que lleva a una ruta inexistente es peor que no tenerlo.
 */
export const MENU: Record<Role, MenuGroup[]> = {
	superadmin: [
		{
			label: "Plataforma",
			items: [
				{ label: "Resumen", url: "/home", icon: "dashboard" },
				{ label: "Empresas", url: "/tenants", icon: "tenants" },
				{ label: "Usuarios", url: "/users", icon: "users" },
			],
		},
		{
			label: "Contenido",
			items: [
				{ label: "Cursos", url: "/courses", icon: "courses" },
				{ label: "Grupos", url: "/groups", icon: "groups" },
			],
		},
	],

	admin: [
		{
			label: "Mi empresa",
			items: [
				{ label: "Resumen", url: "/home", icon: "dashboard" },
				{ label: "Personas", url: "/users", icon: "users" },
				{ label: "Grupos", url: "/groups", icon: "groups" },
			],
		},
		{
			label: "Contenido",
			items: [
				{ label: "Cursos", url: "/courses", icon: "courses" },
			],
		},
	],

	instructor: [
		{
			label: "Docencia",
			items: [
				{ label: "Resumen", url: "/home", icon: "dashboard" },
				{ label: "Mis cursos", url: "/courses", icon: "courses" },
			],
		},
		{
			label: "Personas",
			items: [{ label: "Grupos", url: "/groups", icon: "groups" }],
		},
	],

	student: [
		{
			label: "Mi formación",
			items: [
				{ label: "Mi progreso", url: "/home", icon: "dashboard" },
				{ label: "Mis cursos", url: "/courses", icon: "courses" },
			],
		},
	],
};

export function menuDe(rol: string | undefined): MenuGroup[] {
	return MENU[(rol as Role) ?? "student"] ?? MENU.student;
}

/** Si una ruta no está en el menú del rol, tampoco debería poder abrirla a mano. */
export function puedeAbrir(rol: string | undefined, url: string) {
	return menuDe(rol).some((g) => g.items.some((i) => url.startsWith(i.url)));
}

/**
 * Crear, editar y borrar personas.
 * userRoutes POST/PUT/DELETE: requireRole("admin", "superadmin").
 * El instructor consulta el listado pero no da de alta a nadie.
 */
export function puedeAdministrarPersonas(rol: string | undefined) {
	return rol === "admin" || rol === "superadmin";
}

/**
 * Crear un grupo y mover integrantes.
 * groupsRoutes create / add-users / remove-users incluyen al instructor, que
 * arma los equipos de su gente con usuarios que ya existen.
 */
export function puedeGestionarGrupos(rol: string | undefined) {
	return rol === "instructor" || rol === "admin" || rol === "superadmin";
}

/** Renombrar o eliminar un grupo y asignarle cursos: de admin para arriba. */
export function puedeBorrarGrupos(rol: string | undefined) {
	return rol === "admin" || rol === "superadmin";
}

/** Crear cursos. coursesRoutes POST /create ya incluye al instructor. */
export function puedeCrearCursos(rol: string | undefined) {
	return rol === "instructor" || rol === "admin" || rol === "superadmin";
}

/**
 * Crear, editar y borrar contenido de un curso: actividades, material y
 * exámenes. activitiesRoutes: requireRole("admin", "superadmin", "instructor").
 */
export function puedeEditarContenido(rol: string | undefined) {
	return rol === "instructor" || rol === "admin" || rol === "superadmin";
}

/** El superadmin es el único que ve varias organizaciones mezcladas. */
export function veVariasOrganizaciones(rol: string | undefined) {
	return rol === "superadmin";
}
