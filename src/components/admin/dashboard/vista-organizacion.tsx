import { Link } from "@tanstack/react-router";
import {
	ChevronRight,
	GraduationCap,
	Inbox,
	LibraryBig,
	Sparkles,
	UserCheck,
	UserX,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import type { DashboardOrganizacion } from "#/lib/services/dashboard";
import { haceCuanto } from "#/lib/utils/fechas";
import {
	BarraPorcentaje,
	formatear,
	GraficoActividad,
	Indicador,
	Variacion,
} from "./dashboard-parts";

/**
 * El panel de una organización: cómo viene el onboarding de su gente.
 *
 * Arriba lo que se mira primero (quién está activo, cuánto termina, cuánto XP
 * se reparte y qué espera revisión); en el medio la tendencia; abajo el
 * detalle por curso y a quién hay que ir a buscar porque dejó de entrar.
 */
export function VistaOrganizacion({ data }: { data: DashboardOrganizacion }) {
	const { usuarios, tasaFinalizacion, xp, cursos } = data;
	const aprendices = usuarios.porRol.student;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Indicador
					tono="azul"
					icono={<UserCheck />}
					valor={formatear(usuarios.activosPeriodo)}
					etiqueta="aprendices activos"
					detalle={`de ${formatear(aprendices)} aprendices`}
					variacion={
						<Variacion
							actual={usuarios.activosPeriodo}
							anterior={usuarios.activosPeriodoAnterior}
						/>
					}
				/>
				<Indicador
					tono="verde"
					icono={<GraduationCap />}
					valor={`${Math.round(tasaFinalizacion.actual)} %`}
					etiqueta="tasa de finalización"
					detalle={`Periodo anterior: ${Math.round(tasaFinalizacion.anterior)} %`}
					variacion={
						<Variacion
							actual={tasaFinalizacion.actual}
							anterior={tasaFinalizacion.anterior}
							puntos
						/>
					}
				/>
				<Indicador
					tono="violeta"
					icono={<Sparkles />}
					valor={formatear(xp.otorgadoPeriodo)}
					etiqueta="XP otorgado"
					detalle={`${formatear(data.xpPromedio)} XP promedio por aprendiz`}
					variacion={
						<Variacion
							actual={xp.otorgadoPeriodo}
							anterior={xp.otorgadoPeriodoAnterior}
						/>
					}
				/>
				<Indicador
					tono={data.entregasPorRevisar > 0 ? "ambar" : "azul"}
					icono={<Inbox />}
					valor={formatear(data.entregasPorRevisar)}
					etiqueta="entregas por revisar"
					accion={
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="-ml-2 h-7 text-primary"
						>
							<Link to="/admin/entregas">
								Ir a la bandeja
								<ChevronRight />
							</Link>
						</Button>
					}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<GraficoActividad
					dias={data.actividadPorDia}
					className="lg:col-span-2"
				/>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Personas y contenido</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-2.5">
							<p className="text-muted-foreground text-xs">
								{formatear(usuarios.total)} personas en total
							</p>
							<Proporcion
								etiqueta="Aprendices"
								valor={usuarios.porRol.student}
								total={usuarios.total}
							/>
							<Proporcion
								etiqueta="Instructores"
								valor={usuarios.porRol.instructor}
								total={usuarios.total}
							/>
							<Proporcion
								etiqueta="Administradores"
								valor={usuarios.porRol.admin}
								total={usuarios.total}
							/>
						</div>
						<div className="flex items-center gap-3 rounded-lg border p-3">
							<LibraryBig className="size-5 shrink-0 text-muted-foreground" />
							<div className="min-w-0 flex-1 text-sm">
								<p>
									<span className="font-semibold tabular-nums">
										{formatear(cursos.publicados)}
									</span>{" "}
									cursos publicados
								</p>
								<p className="text-muted-foreground text-xs">
									{formatear(cursos.total - cursos.publicados)} en borrador ·{" "}
									{formatear(cursos.total)} en total
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="text-base">Cursos</CardTitle>
						<CardDescription>
							Avance promedio de los aprendices inscritos y cuántos lo
							terminaron.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{data.cursosDetalle.length === 0 ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								Todavía no hay cursos con aprendices.
							</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Curso</TableHead>
										<TableHead className="text-right">Aprendices</TableHead>
										<TableHead>Avance promedio</TableHead>
										<TableHead className="text-right">Terminaron</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{[...data.cursosDetalle]
										.sort((a, b) => b.aprendices - a.aprendices)
										.map((c) => (
											<TableRow key={c.id}>
												<TableCell className="max-w-56 truncate font-medium">
													{c.nombre}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{formatear(c.aprendices)}
												</TableCell>
												<TableCell>
													<BarraPorcentaje valor={c.avancePromedio} />
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{formatear(c.completaron)}
													<span className="text-muted-foreground">
														{" "}
														/ {formatear(c.aprendices)}
													</span>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<UserX className="size-4" />
							Aprendices sin actividad en 7 días
						</CardTitle>
						<CardDescription>
							Un buen momento para escribirles antes de que abandonen.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{data.aprendicesSinActividad.length === 0 ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								Todos tuvieron actividad esta semana.
							</p>
						) : (
							<ul className="max-h-80 space-y-1 overflow-y-auto">
								{data.aprendicesSinActividad.map((a) => (
									<li
										key={a.id}
										className="flex items-center gap-3 rounded-lg px-1 py-1.5"
									>
										<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs">
											{`${a.nombre?.[0] ?? ""}${a.apellido?.[0] ?? ""}`.toUpperCase()}
										</span>
										<span className="min-w-0 flex-1 truncate text-sm">
											{a.nombre} {a.apellido}
										</span>
										<span className="shrink-0 text-muted-foreground text-xs">
											{a.ultimaActividad
												? haceCuanto(a.ultimaActividad)
												: "Nunca"}
										</span>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

/** Una fila "Aprendices ····· 42" con su barra proporcional al total. */
function Proporcion({
	etiqueta,
	valor,
	total,
}: {
	etiqueta: string;
	valor: number;
	total: number;
}) {
	const pct = total > 0 ? (valor / total) * 100 : 0;
	return (
		<div className="space-y-1">
			<div className="flex justify-between text-sm">
				<span>{etiqueta}</span>
				<span className="tabular-nums">{formatear(valor)}</span>
			</div>
			<div className="h-1.5 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-primary/70"
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}
