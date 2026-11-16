import { createFileRoute, Link } from "@tanstack/react-router";
import {
	CheckCheck,
	ChevronRight,
	Flame,
	Medal,
	RefreshCw,
} from "lucide-react";
import { ErrorState } from "#/components/shared/states/error-state";
import { AchievementsPreview } from "#/components/student/home/achievements-preview";
import { NextSteps } from "#/components/student/home/next-steps";
import { ProgressHero } from "#/components/student/home/progress-hero";
import { StatTile } from "#/components/student/home/stat-tile";
import { MyCourseCard } from "#/components/student/my-course-card";
import { UltimasAcreditaciones } from "#/components/student/ultimas-acreditaciones";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { useMyAchievements } from "#/hooks/achievements/use-my-achievements";
import { useMyCourses } from "#/hooks/courses/use-my-courses";
import { useMyPending } from "#/hooks/gamification/use-my-pending";
import { useMyProgress } from "#/hooks/gamification/use-my-progress";
import { useCurrentUser } from "#/hooks/users/use-current-user";

export const Route = createFileRoute("/student/home")({
	component: HomeRoute,
});

/** Cuántos cursos se muestran en el inicio; el resto, en "Mis cursos". */
const CURSOS_VISIBLES = 3;

/**
 * El inicio del aprendiz, de arriba abajo:
 *
 *   1. cómo va (nivel, XP, racha)
 *   2. qué hacer ahora (el siguiente paso y lo pendiente) y sus logros
 *   3. sus cursos, para entrar directo
 *
 * Cada bloque carga por su cuenta: si uno falla, el resto se sigue viendo.
 */
function HomeRoute() {
	const { user } = useCurrentUser();
	const progreso = useMyProgress();
	const pendientes = useMyPending();
	const logros = useMyAchievements();
	const cursos = useMyCourses();

	const racha = progreso.data?.racha;

	return (
		<div className="app-container space-y-6">
			<ProgressHero
				nombre={user?.firstname}
				progreso={progreso.data}
				pendientes={pendientes.data?.resumen.actividadesPendientes}
			/>

			{!progreso.data && progreso.error && (
				<ErrorState
					title="No se pudo cargar tu progreso"
					description={progreso.error.message}
					content={
						<Button onClick={() => progreso.refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			<div className="grid gap-4 sm:grid-cols-3">
				{progreso.isLoading ? (
					<>
						<Skeleton className="h-20 rounded-xl" />
						<Skeleton className="h-20 rounded-xl" />
						<Skeleton className="h-20 rounded-xl" />
					</>
				) : (
					<>
						<StatTile
							tono="naranja"
							icono={<Flame className="size-6" />}
							valor={racha?.dias ?? 0}
							etiqueta={racha?.dias === 1 ? "día de racha" : "días de racha"}
							detalle={
								racha?.maxima ? `Tu mejor racha: ${racha.maxima}` : undefined
							}
						/>
						<StatTile
							tono="verde"
							icono={<CheckCheck className="size-6" />}
							valor={progreso.data?.actividadesCompletadas ?? 0}
							etiqueta="actividades completadas"
						/>
						<StatTile
							tono="violeta"
							icono={<Medal className="size-6" />}
							valor={
								logros.data
									? `${logros.data.ganados}/${logros.data.total}`
									: "—"
							}
							etiqueta="logros ganados"
						/>
					</>
				)}
			</div>

			{/* items-start: cada tarjeta mide lo que su contenido; sin eso la
			    columna corta se estira hasta la altura de la larga y queda vacía. */}
			<div className="grid items-start gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
					<NextSteps data={pendientes.data} isLoading={pendientes.isLoading} />
					{/* Lo último que sumó, para que el XP no sea un número que sube
					    solo: la lista completa está en el perfil. */}
					<UltimasAcreditaciones visibles={4} conNivel={false} />
				</div>
				<AchievementsPreview
					data={logros.data}
					isLoading={logros.isLoading}
				/>
			</div>

			{cursos.data && cursos.data.length > 0 && (
				<section className="space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-lg">Mis cursos</h2>
						<Link
							to="/student/courses"
							className="flex items-center gap-1 text-primary text-sm hover:underline"
						>
							Ver todos
							<ChevronRight className="size-4" />
						</Link>
					</div>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{cursos.data.slice(0, CURSOS_VISIBLES).map((c) => (
							<MyCourseCard key={c.id} course={c} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
