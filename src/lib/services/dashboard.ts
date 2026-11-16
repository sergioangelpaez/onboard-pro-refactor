import { apiFetch } from "./api-fetch";

/** La ventana del panel, con las fechas que el backend tomó de verdad. */
export interface PeriodoDashboard {
	dias: number;
	desde: string;
	hasta: string;
}

export interface UsuariosDashboard {
	total: number;
	porRol: { student: number; instructor: number; admin: number };
	/** Aprendices que hicieron algo en el periodo. */
	activosPeriodo: number;
	/** Lo mismo en el periodo anterior de igual largo, para comparar. */
	activosPeriodoAnterior: number;
}

export interface XpDashboard {
	otorgadoPeriodo: number;
	otorgadoPeriodoAnterior: number;
}

/** Un día del gráfico de uso. */
export interface DiaActividad {
	fecha: string;
	/** Personas distintas que usaron la plataforma ese día. */
	activos: number;
	completadas: number;
	/** Entregas enviadas. */
	entregas: number;
	/** Actividades nuevas en los cursos. */
	creadas: number;
	xp: number;
}

/** El panel del superadmin mirando todas las organizaciones a la vez. */
export interface DashboardPlataforma {
	alcance: "plataforma";
	periodo: PeriodoDashboard;
	organizaciones: { total: number; activas: number };
	usuarios: UsuariosDashboard;
	cursos: { total: number; publicados: number };
	xp: XpDashboard;
	actividadesCompletadasPeriodo: number;
	actividadPorDia: DiaActividad[];
	/** false mientras el backend no registra entradas a la plataforma. */
	accesosRegistrados?: boolean;
	porOrganizacion: UsoOrganizacion[];
}

/** Cómo está usando la plataforma una organización. */
export interface UsoOrganizacion {
	id: string;
	nombre: string;
	activa: boolean;
	/** Cuándo se registró la organización. */
	creada: string | null;
	usuarios: number;
	aprendices: number;
	instructores: number;
	admins: number;
	/** Aprendices que hicieron algo en el periodo. */
	aprendicesActivos: number;
	cursosPublicados: number;
	/** Sin contar los archivados. */
	cursosCreados: number;
	grupos: number;
	entregasPorRevisar: number;
	/** De 0 a 100. */
	tasaFinalizacion: number;
	/** Último día en que alguien de la organización hizo algo; null si nunca. */
	ultimaActividad: string | null;
	xpPeriodo: number;
}

/** El panel de una organización: el del admin o el del superadmin parado en una. */
export interface DashboardOrganizacion {
	alcance: "organizacion";
	organizacion: { id: string; nombre: string };
	periodo: PeriodoDashboard;
	usuarios: UsuariosDashboard;
	cursos: { total: number; publicados: number };
	/** De 0 a 100, en este periodo y en el anterior. */
	tasaFinalizacion: { actual: number; anterior: number };
	xpPromedio: number;
	xp: XpDashboard;
	entregasPorRevisar: number;
	actividadPorDia: DiaActividad[];
	/** false mientras el backend no registra entradas a la plataforma. */
	accesosRegistrados?: boolean;
	cursosDetalle: {
		id: string;
		nombre: string;
		aprendices: number;
		/** De 0 a 100. */
		avancePromedio: number;
		completaron: number;
	}[];
	aprendicesSinActividad: {
		id: string;
		nombre: string;
		apellido: string;
		/** null si nunca hizo nada. */
		ultimaActividad: string | null;
	}[];
}

export type Dashboard = DashboardPlataforma | DashboardOrganizacion;

export const dashboardService = {
	/**
	 * Los números del panel de inicio de la administración.
	 *
	 * El backend decide el alcance: al admin siempre le devuelve su
	 * organización; al superadmin, la que mande en `tenantId` o, sin ella, la
	 * plataforma entera. Por eso la respuesta trae `alcance` y se distingue por
	 * ahí, no por el rol.
	 */
	async resumen(params: { tenantId?: string | null; dias: number }) {
		const query = new URLSearchParams({ dias: String(params.dias) });
		if (params.tenantId) query.set("tenantId", params.tenantId);
		return await apiFetch<Dashboard>(`/dashboard?${query}`);
	},
};
