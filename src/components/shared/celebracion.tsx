import { Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";

/** Lo que devuelve el backend cada vez que se acredita XP. */
export interface ResultadoParaCelebrar {
	xpGanado?: number;
	xpAcreditado?: number;
	avisoXp?: string | null;
	nivel?: number;
	nombreNivel?: string | null;
	subioDeNivel?: boolean;
	logrosDesbloqueados?: {
		id: string;
		nombre: string;
		icono: string;
		xpRecompensa: number;
	}[];
}

const EVENTO = "onboardpro:subio-de-nivel";

// El último nivel celebrado: la app puede adelantarse a la respuesta del
// servidor y, cuando esta llega, no hay que festejar dos veces lo mismo.
let ultimoCelebrado = 0;

/** Abre la celebración de un nivel, si no se celebró ya. */
export function celebrarNivel(nivel: number, nombreNivel?: string | null) {
	if (nivel <= ultimoCelebrado) return;
	ultimoCelebrado = nivel;
	const detalle: SubidaDeNivel = { nivel, nombreNivel };
	window.dispatchEvent(new CustomEvent(EVENTO, { detail: detalle }));
}

interface SubidaDeNivel {
	nivel: number;
	nombreNivel?: string | null;
}

/**
 * Avisa todo lo que pasó al ganar XP: la subida de nivel (con su celebración
 * en pantalla), cada logro desbloqueado y, si sumó menos de lo que vale (un
 * reintento),
 * el motivo. Se llama con la respuesta tal cual, venga de completar un
 * recurso, de aprobar un examen o de jugar un concurso.
 */
export function celebrar(r: ResultadoParaCelebrar | null | undefined) {
	if (!r) return;

	for (const logro of r.logrosDesbloqueados ?? []) {
		toast.success(`¡Logro desbloqueado: ${logro.nombre}!`, {
			icon: <span className="text-lg">{logro.icono || "🏅"}</span>,
			description:
				logro.xpRecompensa > 0
					? `+${logro.xpRecompensa} XP de recompensa. Ya está en tu perfil.`
					: "Ya está en tu perfil.",
			duration: 6000,
		});
	}

	if (r.avisoXp) {
		toast.warning("Esta vez no sumaste todo el XP", {
			description: r.avisoXp,
			duration: 8000,
		});
	}

	if (r.subioDeNivel && r.nivel != null) celebrarNivel(r.nivel, r.nombreNivel);
}

const CHISPAS = ["🎉", "⭐", "✨", "🏆", "🎊", "💫", "🌟", "🎉"];

/**
 * La celebración de la subida de nivel. Va montada una vez en el área del
 * aprendiz y se abre sola cuando `celebrar` avisa que subió.
 */
export function Celebracion() {
	const [subida, setSubida] = useState<SubidaDeNivel | null>(null);

	useEffect(() => {
		const escuchar = (e: Event) => {
			const detalle = (e as CustomEvent<SubidaDeNivel>).detail;
			setSubida(detalle);
			toast.success(`¡Subiste al nivel ${detalle.nivel}!`, {
				icon: <Star className="size-4 fill-amber-400 text-amber-500" />,
				description: detalle.nombreNivel ?? undefined,
			});
		};
		window.addEventListener(EVENTO, escuchar);
		return () => window.removeEventListener(EVENTO, escuchar);
	}, []);

	return (
		<Dialog open={!!subida} onOpenChange={(abierto) => !abierto && setSubida(null)}>
			<DialogContent className="overflow-hidden text-center sm:max-w-sm">
				{/* Chispas que caen: decorativas, no las lee un lector de pantalla. */}
				<div aria-hidden className="pointer-events-none absolute inset-0">
					{CHISPAS.map((c, i) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: lista fija
							key={i}
							className="absolute animate-bounce text-2xl"
							style={{
								left: `${8 + i * 11}%`,
								top: `${(i % 3) * 12 + 4}%`,
								animationDelay: `${i * 120}ms`,
								animationDuration: `${900 + (i % 4) * 150}ms`,
							}}
						>
							{c}
						</span>
					))}
				</div>

				<DialogHeader className="relative items-center gap-3 pt-10 sm:text-center">
					<div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg ring-4 ring-amber-200/60 dark:ring-amber-500/30">
						<span className="font-bold text-4xl text-white tabular-nums">
							{subida?.nivel}
						</span>
					</div>
					<DialogTitle className="flex items-center gap-2 text-2xl">
						<Sparkles className="size-5 text-amber-500" />
						¡Subiste de nivel!
					</DialogTitle>
					<DialogDescription className="text-base">
						Ahora estás en el nivel {subida?.nivel}
						{subida?.nombreNivel ? ` · ${subida.nombreNivel}` : ""}. Tu
						esfuerzo se está notando.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="relative sm:justify-center">
					<Button onClick={() => setSubida(null)}>¡Seguir aprendiendo!</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
