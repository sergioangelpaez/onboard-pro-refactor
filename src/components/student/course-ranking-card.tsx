import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useCourseRanking } from "#/hooks/gamification/use-course-ranking";
import { useCurrentUser } from "#/hooks/users/use-current-user";

/** Cuántos se muestran; si la persona va más abajo, su fila se agrega al final. */
const VISIBLES = 5;
const COLOR_PUESTO = ["text-amber-500", "text-zinc-400", "text-orange-700"];

/**
 * Quién va adelante en este curso. Solo cuenta el XP ganado en sus
 * actividades, así compara a gente que está haciendo lo mismo: el ranking de
 * la organización mezcla a quien entró ayer con quien lleva meses.
 */
export function CourseRankingCard({ courseId }: { courseId: string }) {
	const { user } = useCurrentUser();
	// Se pide entero para poder ubicar a la persona aunque no esté arriba.
	const { data, isLoading } = useCourseRanking(courseId, 500);
	const yo = data?.find((p) => p.id === user?.id);
	const arriba = data?.slice(0, VISIBLES) ?? [];
	const yoFuera = yo && yo.posicion > VISIBLES;

	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Trophy className="size-4" />
					Ranking del curso
				</CardTitle>
				{yo && (
					<span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
						Vas {yo.posicion}.º de {data?.length}
					</span>
				)}
			</CardHeader>
			<CardContent>
				{isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-6 w-full" />
						<Skeleton className="h-6 w-4/5" />
					</div>
				)}

				{!isLoading && (!data || data.length === 0) && (
					<p className="text-muted-foreground text-sm">
						Todavía nadie completó actividades de este curso. ¡Sé el primero!
					</p>
				)}

				{arriba.length > 0 && (
					<ol className="space-y-1">
						{[...arriba, ...(yoFuera && yo ? [yo] : [])].map((p) => {
							const soyYo = p.id === user?.id;
							return (
								<li
									key={p.id}
									className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${soyYo ? "bg-primary/10 font-medium" : ""}`}
								>
									<span
										className={`w-6 text-center font-semibold tabular-nums ${COLOR_PUESTO[p.posicion - 1] ?? "text-muted-foreground"}`}
									>
										{p.posicion}
									</span>
									<span className="min-w-0 flex-1 truncate">
										{p.firstname} {p.lastname}
										{soyYo && (
											<span className="ml-1 text-primary text-xs">(tú)</span>
										)}
									</span>
									<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
										{p.xp} XP
									</span>
								</li>
							);
						})}
					</ol>
				)}
			</CardContent>
		</Card>
	);
}
