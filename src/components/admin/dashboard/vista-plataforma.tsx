import { useNavigate } from "@tanstack/react-router";
import {
	Building2,
	ChevronRight,
	LibraryBig,
	ShieldAlert,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import type {
	DashboardPlataforma,
	UsoOrganizacion,
} from "#/lib/services/dashboard";
import { fechaCorta, haceCuanto } from "#/lib/utils/fechas";
import { setTenantActivo } from "#/lib/utils/tenant-activo";
import { formatear, Indicador, Variacion } from "./dashboard-parts";

/**
 * El panel del superadmin con todas las organizaciones.
 *
 * Responde una sola pregunta: ¿quién está usando la plataforma? El
 * superadmin no configura las empresas (eso lo hace su administrador), así
 * que de cada una ve si se usa, cuánta gente tiene y si le falta el
 * administrador que la ponga en marcha. Cada tarjeta lleva al panel de esa
 * organización: elegirla la deja activa en el selector del menú.
 */

const DIAS_SIN_USO = 14;

type Estado = "enUso" | "sinUso" | "sinUsar" | "sinAdmin" | "inactiva";

/**
 * En qué punto está la organización. El orden importa: una desactivada no
 * necesita atención, y sin administrador no hay nadie que la pueda poner a
 * andar, así que eso se dice antes que "sin usar".
 */
function estadoDe(o: UsoOrganizacion): Estado {
	if (!o.activa) return "inactiva";
	if (o.admins === 0) return "sinAdmin";
	if (!o.ultimaActividad) return "sinUsar";
	const ultima = new Date(o.ultimaActividad).getTime();
	if (Date.now() - ultima > DIAS_SIN_USO * 86_400_000) return "sinUso";
	return "enUso";
}

const ESTADOS: Record<
	Estado,
	{
		texto: string;
		variante: "default" | "secondary" | "outline" | "destructive";
	}
> = {
	enUso: { texto: "En uso", variante: "default" },
	sinUso: { texto: `Sin uso en ${DIAS_SIN_USO} días`, variante: "destructive" },
	sinUsar: { texto: "Sin usar", variante: "secondary" },
	sinAdmin: { texto: "Sin administrador", variante: "destructive" },
	inactiva: { texto: "Inactiva", variante: "outline" },
};

const ORDEN: Record<Estado, number> = {
	enUso: 0,
	sinUso: 1,
	sinAdmin: 2,
	sinUsar: 3,
	inactiva: 4,
};

const NECESITA_ATENCION: Estado[] = ["sinUso", "sinAdmin", "sinUsar"];

type Filtro = "todas" | "atencion";

export function VistaPlataforma({ data }: { data: DashboardPlataforma }) {
	const { usuarios, cursos, organizaciones } = data;
	const [filtro, setFiltro] = useState<Filtro>("todas");

	const filas = data.porOrganizacion
		.map((o) => ({ ...o, estado: estadoDe(o) }))
		.sort(
			(a, b) =>
				ORDEN[a.estado] - ORDEN[b.estado] ||
				b.usuarios - a.usuarios ||
				a.nombre.localeCompare(b.nombre),
		);
	const atencion = filas.filter((o) => NECESITA_ATENCION.includes(o.estado));
	const visibles = filtro === "atencion" ? atencion : filas;
	const enUso = filas.filter((o) => o.estado === "enUso").length;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Indicador
					tono="azul"
					icono={<Building2 />}
					valor={formatear(enUso)}
					etiqueta="organizaciones en uso"
					detalle={`${formatear(organizaciones.activas)} activas de ${formatear(organizaciones.total)} registradas`}
				/>
				<Indicador
					tono="naranja"
					icono={<Users />}
					valor={formatear(usuarios.total)}
					etiqueta="usuarios"
					detalle={`${formatear(usuarios.porRol.student)} aprendices · ${formatear(usuarios.porRol.instructor)} instructores · ${formatear(usuarios.porRol.admin)} admins`}
				/>
				<Indicador
					tono="verde"
					icono={<UserCheck />}
					valor={formatear(usuarios.activosPeriodo)}
					etiqueta="aprendices activos"
					detalle={`de ${formatear(usuarios.porRol.student)} aprendices`}
					variacion={
						<Variacion
							actual={usuarios.activosPeriodo}
							anterior={usuarios.activosPeriodoAnterior}
						/>
					}
				/>
				<Indicador
					tono="violeta"
					icono={<LibraryBig />}
					valor={formatear(cursos.publicados)}
					etiqueta="cursos publicados"
					detalle={`de ${formatear(cursos.total)} creados`}
				/>
			</div>

			<Card>
				<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
					<div>
						<CardTitle className="text-base">Organizaciones</CardTitle>
						<CardDescription>
							Quién está usando la plataforma. Elige una para ver su panel.
						</CardDescription>
					</div>
					<div
						role="radiogroup"
						aria-label="Filtrar organizaciones"
						className="inline-flex rounded-lg border bg-muted/50 p-1"
					>
						{(
							[
								["todas", `Todas (${filas.length})`],
								["atencion", `Necesitan atención (${atencion.length})`],
							] as const
						).map(([valor, texto]) => (
							// biome-ignore lint/a11y/useSemanticElements: control segmentado, mismo patrón que el selector de periodo
							<button
								key={valor}
								type="button"
								role="radio"
								aria-checked={filtro === valor}
								onClick={() => setFiltro(valor)}
								className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
									filtro === valor
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{texto}
							</button>
						))}
					</div>
				</CardHeader>
				<CardContent>
					{visibles.length === 0 ? (
						<p className="py-6 text-center text-muted-foreground text-sm">
							{filtro === "atencion"
								? "Ninguna organización necesita atención."
								: "Todavía no hay organizaciones."}
						</p>
					) : (
						<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
							{visibles.map((o) => (
								<TarjetaOrganizacion key={o.id} o={o} estado={o.estado} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Dato({
	valor,
	etiqueta,
}: {
	valor: React.ReactNode;
	etiqueta: string;
}) {
	return (
		<div className="min-w-0">
			<p className="font-semibold text-lg tabular-nums leading-tight">
				{valor}
			</p>
			<p className="truncate text-muted-foreground text-xs">{etiqueta}</p>
		</div>
	);
}

function TarjetaOrganizacion({
	o,
	estado,
}: {
	o: UsoOrganizacion;
	estado: Estado;
}) {
	const navigate = useNavigate();
	const e = ESTADOS[estado];
	const ultima = o.ultimaActividad ? haceCuanto(o.ultimaActividad) : null;
	const creada = fechaCorta(o.creada);

	const crearAdmin = () => {
		setTenantActivo(o.id);
		navigate({ to: "/admin/users" });
	};

	return (
		<div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate font-semibold">{o.nombre}</p>
					<p className="truncate text-muted-foreground text-xs">
						{ultima ? `Última actividad ${ultima}` : "Sin actividad todavía"}
						{creada && ` · desde el ${creada}`}
					</p>
				</div>
				<Badge variant={e.variante} className="shrink-0">
					{e.texto}
				</Badge>
			</div>

			{estado === "sinAdmin" ? (
				<div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
					<ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
					<p className="text-muted-foreground">
						No tiene administrador, así que nadie puede ponerla en marcha.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
					<Dato valor={formatear(o.usuarios)} etiqueta="usuarios" />
					<Dato
						valor={`${formatear(o.aprendicesActivos)} / ${formatear(o.aprendices)}`}
						etiqueta="aprendices activos"
					/>
					<Dato valor={formatear(o.cursosPublicados)} etiqueta="cursos" />
				</div>
			)}

			<div className="flex justify-end">
				{estado === "sinAdmin" ? (
					<Button size="sm" onClick={crearAdmin}>
						<UserPlus />
						Crear administrador
					</Button>
				) : (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setTenantActivo(o.id)}
					>
						Ver panel
						<ChevronRight />
					</Button>
				)}
			</div>
		</div>
	);
}
