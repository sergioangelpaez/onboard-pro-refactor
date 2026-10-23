import { Link } from "@tanstack/react-router";
import { Flame, Star } from "lucide-react";
import { useMyProgress } from "#/hooks/gamification/use-my-progress";
import { SidebarGroup } from "@/components/ui/sidebar";

/**
 * Nivel, XP y racha en el menú del aprendiz, para tenerlos a la vista desde
 * cualquier pantalla. Se oculta cuando el menú está plegado a íconos.
 */
export function SidebarProgress() {
	const { data } = useMyProgress();
	if (!data) return null;
	const {
		nivel,
		xp,
		porcentaje,
		faltan,
		xpSiguienteNivel,
		racha,
		nombreNivel,
	} = data;

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<Link
				to="/student/home"
				className="block space-y-2.5 rounded-xl border bg-gradient-to-br from-primary/15 to-transparent p-3 transition-colors hover:border-primary/40"
			>
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-1.5 font-medium text-sm">
						<Star className="size-4 fill-amber-400 text-amber-500" />
						Nivel {nivel}
						{nombreNivel && (
							<span className="truncate font-normal text-muted-foreground">
								· {nombreNivel}
							</span>
						)}
					</span>
					<span
						className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
							racha.dias > 0
								? "bg-orange-500/15 text-orange-700 dark:text-orange-300"
								: "bg-muted text-muted-foreground"
						}`}
					>
						<Flame
							className={`size-3.5 ${racha.dias > 0 && racha.activaHoy ? "fill-current" : ""}`}
						/>
						{racha.dias}
					</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-background/70 ring-1 ring-border">
					<div
						className="h-full rounded-full bg-primary"
						style={{ width: `${Math.max(porcentaje, 3)}%` }}
					/>
				</div>
				<p className="text-muted-foreground text-xs">
					<span className="font-medium text-foreground tabular-nums">
						{xp} XP
					</span>
					{xpSiguienteNivel !== null &&
						` · faltan ${faltan} para el ${nivel + 1}`}
				</p>
			</Link>
		</SidebarGroup>
	);
}
