import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { celebrar, celebrarNivel } from "#/components/shared/celebracion";
import type { Section } from "#/lib/schemas/courses";
import { activitiesService } from "#/lib/services/activities";
import type { MyProgress } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

/**
 * Marcar un recurso como completado.
 *
 * Se marca en pantalla al instante y se corrige si el backend dice que no:
 * acreditar XP y revisar logros tarda un par de segundos, y esperar con la
 * actividad "a medias" se sentía lento.
 *
 * Los avisos (XP, subida de nivel, logros) van acá y no en el botón: si al
 * completar se pliega la sección, el botón se desmonta antes de que llegue la
 * respuesta y sus callbacks ya no corren. Por eso la celebración no salía.
 */
export function useCompleteActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		// Con la clave, los demás botones saben que hay un guardado en curso.
		mutationKey: ["completar-actividad"],
		mutationFn: (id: string) => activitiesService.complete(id),
		onMutate: async (id: string) => {
			const aviso = toast.loading("Guardando tu progreso…");
			await queryClient.cancelQueries({ queryKey: ["sections"] });
			const antes = queryClient.getQueriesData<Section[]>({
				queryKey: ["sections"],
			});

			// Cuánto XP vale, para adelantar la subida de nivel: el servidor tarda
			// unos segundos y la celebración tiene que sentirse en el momento.
			const xpActividad =
				antes
					.flatMap(([, secciones]) => secciones ?? [])
					.flatMap((s) => s.actividades)
					.find((a) => a.id === id)?.xp ?? 0;
			const progreso = queryClient.getQueryData<MyProgress>(
				queryKeys.gamification.me,
			);
			if (
				progreso?.xpSiguienteNivel != null &&
				xpActividad > 0 &&
				progreso.xp + xpActividad >= progreso.xpSiguienteNivel
			) {
				celebrarNivel(progreso.nivel + 1, progreso.nombreSiguiente);
			}

			queryClient.setQueriesData<Section[]>(
				{ queryKey: ["sections"] },
				(secciones) =>
					secciones?.map((s) => ({
						...s,
						actividades: s.actividades.map((a) =>
							a.id === id
								? { ...a, completada: true, estado: "completada" }
								: a,
						),
					})),
			);
			return { antes, aviso };
		},
		onError: (e: Error, _id, contexto) => {
			for (const [clave, datos] of contexto?.antes ?? []) {
				queryClient.setQueryData(clave, datos);
			}
			toast.error("No se pudo completar la actividad", {
				id: contexto?.aviso,
				description: e.message,
			});
		},
		onSuccess: (r, _id, contexto) => {
			const xp = r?.xpGanado ?? 0;
			// El mismo aviso pasa de "guardando" al resultado.
			toast.success(
				xp > 0 ? `¡Actividad completada! +${xp} XP` : "¡Actividad completada!",
				{ id: contexto?.aviso },
			);
			celebrar(r);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
			// Completar suma XP y cuenta para la racha: el inicio tiene que reflejarlo.
			queryClient.invalidateQueries({ queryKey: queryKeys.gamification.me });
			// Puede haber desbloqueado logros.
			queryClient.invalidateQueries({ queryKey: queryKeys.achievements.mine });
			queryClient.invalidateQueries({
				queryKey: queryKeys.gamification.pending,
			});
			queryClient.invalidateQueries({ queryKey: ["sections"] });
			queryClient.invalidateQueries({ queryKey: ["gamification"] });
		},
	});
}
