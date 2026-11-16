import {
	Building2,
	ChevronRight,
	LibraryBig,
	Sparkles,
	UserCheck,
	Users,
} from "lucide-react";
import { Badge } from "#/components/ui/badge";
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
import type { DashboardPlataforma } from "#/lib/services/dashboard";
import { setTenantActivo } from "#/lib/utils/tenant-activo";
import {
	BarraPorcentaje,
	formatear,
	GraficoActividad,
	Indicador,
	Variacion,
} from "./dashboard-parts";

/**
 * El panel del superadmin con todas las organizaciones juntas.
 *
 * Responde "¿cómo va la plataforma?" y "¿qué empresa necesita atención?". La
 * tabla de abajo es la puerta de entrada al detalle: elegir una organización
 * la deja activa en el selector del menú, como si se eligiera desde ahí, y el
 * panel pasa a mostrar la vista de esa empresa.
 */
export function VistaPlataforma({ data }: { data: DashboardPlataforma }) {
	const { usuarios, xp, cursos, organizaciones } = data;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				<Indicador
					tono="azul"
					icono={<Building2 />}
					valor={formatear(organizaciones.activas)}
					etiqueta="organizaciones activas"
					detalle={`de ${formatear(organizaciones.total)} registradas`}
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
					tono="azul"
					icono={<LibraryBig />}
					valor={formatear(cursos.publicados)}
					etiqueta="cursos publicados"
					detalle={`de ${formatear(cursos.total)} creados`}
				/>
				<Indicador
					tono="violeta"
					icono={<Sparkles />}
					valor={formatear(xp.otorgadoPeriodo)}
					etiqueta="XP otorgado"
					detalle={`${formatear(data.actividadesCompletadasPeriodo)} actividades completadas`}
					variacion={
						<Variacion
							actual={xp.otorgadoPeriodo}
							anterior={xp.otorgadoPeriodoAnterior}
						/>
					}
				/>
			</div>

			<GraficoActividad dias={data.actividadPorDia} />

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Por organización</CardTitle>
					<CardDescription>
						Elige una para ver su panel en detalle.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{data.porOrganizacion.length === 0 ? (
						<p className="py-6 text-center text-muted-foreground text-sm">
							Todavía no hay organizaciones.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Organización</TableHead>
									<TableHead className="text-right">Usuarios</TableHead>
									<TableHead className="text-right">
										Aprendices activos
									</TableHead>
									<TableHead className="text-right">Cursos</TableHead>
									<TableHead>Finalización</TableHead>
									<TableHead className="text-right">XP del periodo</TableHead>
									<TableHead className="w-8" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{[...data.porOrganizacion]
									.sort((a, b) => b.xpPeriodo - a.xpPeriodo)
									.map((o) => (
										<TableRow
											key={o.id}
											className="cursor-pointer"
											onClick={() => setTenantActivo(o.id)}
										>
											<TableCell className="max-w-56">
												{/* El botón hace la fila alcanzable con el teclado; el
												    clic en cualquier otra celda hace lo mismo. */}
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setTenantActivo(o.id);
													}}
													className="flex min-w-0 items-center gap-2 text-left font-medium hover:underline"
												>
													<span className="truncate">{o.nombre}</span>
													{!o.activa && (
														<Badge variant="outline" className="shrink-0">
															Inactiva
														</Badge>
													)}
												</button>
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{formatear(o.usuarios)}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{formatear(o.aprendicesActivos)}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{formatear(o.cursosPublicados)}
											</TableCell>
											<TableCell>
												<BarraPorcentaje valor={o.tasaFinalizacion} />
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{formatear(o.xpPeriodo)}
											</TableCell>
											<TableCell>
												<ChevronRight className="size-4 text-muted-foreground" />
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
