import { ChevronRight, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Skeleton } from "#/components/ui/skeleton";
import { useCourseRanking } from "#/hooks/gamification/use-course-ranking";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import type { RankingEntry } from "#/lib/services/gamification";

/** El podio. Si la persona va más abajo, su fila se agrega al final. */
const VISIBLES = 3;
const COLOR_PUESTO = ["text-amber-500", "text-zinc-400", "text-orange-700"];

function Fila({ p, soyYo }: { p: RankingEntry; soyYo: boolean }) {
	return (
		<li
			className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${soyYo ? "bg-primary/10 font-medium" : ""}`}
		>
			<span
				className={`w-6 text-center font-semibold tabular-nums ${COLOR_PUESTO[p.posicion - 1] ?? "text-muted-foreground"}`}
			>
				{p.posicion}
			</span>
			<span className="min-w-0 flex-1 truncate">
				{p.firstname} {p.lastname}
				{soyYo && <span className="ml-1 text-primary text-xs">(tú)</span>}
			</span>
			<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
				{p.xp} XP
			</span>
		</li>
	);
}

/**
 * Quién va adelante en este curso. Solo cuenta el XP ganado en sus
 * actividades, así compara a gente que está haciendo lo mismo: el ranking de
 * la organización mezcla a quien entró ayer con quien lleva meses.
 *
 * Muestra el podio para que la tarjeta no sea más alta que el resumen del
 * curso que tiene al lado; la tabla completa se abre aparte.
 */
export function CourseRankingCard({ courseId }: { courseId: string }) {
	const { user } = useCurrentUser();
	const [todos, setTodos] = useState(false);
	// Se pide entero para poder ubicar a la persona aunque no esté arriba.
	const { data, isLoading } = useCourseRanking(courseId, 500);
	const yo = data?.find((p) => p.id === user?.id);
	const arriba = data?.slice(0, VISIBLES) ?? [];
	const yoFuera = yo && yo.posicion > VISIBLES;
	// Siempre se puede abrir la tabla: aunque sean pocos, es donde se ve todo.
	const hayRanking = (data?.length ?? 0) > 0;

	return (
		<Card className="h-full gap-3 py-5">
			<CardHeader className="flex flex-row items-center justify-between gap-2 px-5">
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
			<CardContent className="flex flex-1 flex-col px-5">
				{isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-6 w-full" />
						<Skeleton className="h-6 w-4/5" />
						<Skeleton className="h-6 w-3/5" />
					</div>
				)}

				{!isLoading && (!data || data.length === 0) && (
					<p className="text-muted-foreground text-sm">
						Todavía nadie completó actividades de este curso. ¡Sé el primero!
					</p>
				)}

				{arriba.length > 0 && (
					<ol className="space-y-0.5">
						{arriba.map((p) => (
							<Fila key={p.id} p={p} soyYo={p.id === user?.id} />
						))}
						{yoFuera && yo && (
							<>
								<li
									aria-hidden
									className="px-2 text-center text-muted-foreground text-xs leading-none"
								>
									⋯
								</li>
								<Fila p={yo} soyYo />
							</>
						)}
					</ol>
				)}

				{hayRanking && !yo && (
					<p className="mt-2 px-2 text-muted-foreground text-xs">
						Todavía no sumas XP en este curso. Completa una actividad para
						entrar al ranking.
					</p>
				)}

				{hayRanking && (
					<Button
						variant="ghost"
						size="sm"
						className="mt-auto self-end text-primary"
						onClick={() => setTodos(true)}
					>
						Ver ranking completo
						<ChevronRight />
					</Button>
				)}
			</CardContent>

			<Dialog open={todos} onOpenChange={setTodos}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Trophy className="size-4" />
							Ranking del curso
						</DialogTitle>
						<DialogDescription>
							Solo cuenta el XP ganado en las actividades de este curso.
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className="max-h-[60vh] pr-3">
						<ol className="space-y-0.5">
							{(data ?? []).map((p) => (
								<Fila key={p.id} p={p} soyYo={p.id === user?.id} />
							))}
						</ol>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
