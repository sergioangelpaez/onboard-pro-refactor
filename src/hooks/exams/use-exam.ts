import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examsService, type SaveExamPayload } from "#/lib/services/exams";
import { queryKeys } from "#/lib/utils/query-keys";

/** El examen para mostrar antes de empezar: cuántas preguntas, tiempo, intentos. */
export function useExam(activityId: string) {
	return useQuery({
		queryKey: queryKeys.exams.byActivity(activityId),
		queryFn: () => examsService.get(activityId),
	});
}

export function useMyAttempts(activityId: string) {
	return useQuery({
		queryKey: queryKeys.exams.attempts(activityId),
		queryFn: () => examsService.myAttempts(activityId),
	});
}

export function useStartExam(activityId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => examsService.start(activityId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.exams.attempts(activityId),
			});
		},
	});
}

export function useSubmitExam(activityId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (
			respuestas: { preguntaId: string; opcionId: string | null }[],
		) => examsService.submit(activityId, respuestas),
		onSettled: () => {
			// Aprobar suma XP, cuenta para la racha, completa la actividad y puede
			// desbloquear logros: todo lo que muestra el progreso cambia.
			queryClient.invalidateQueries({
				queryKey: queryKeys.exams.attempts(activityId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.gamification.me });
			queryClient.invalidateQueries({
				queryKey: queryKeys.gamification.pending,
			});
			queryClient.invalidateQueries({ queryKey: ["sections"] });
		},
	});
}

/** El examen con sus respuestas y la acción de guardarlo entero. */
export function useExamEditor(activityId: string) {
	const queryClient = useQueryClient();
	const consulta = useQuery({
		queryKey: [...queryKeys.exams.byActivity(activityId), "editor"],
		queryFn: () => examsService.getEditable(activityId),
	});
	const guardar = useMutation({
		mutationFn: (payload: SaveExamPayload) =>
			examsService.save(activityId, payload),
		onSuccess: (r) => {
			queryClient.setQueryData(
				[...queryKeys.exams.byActivity(activityId), "editor"],
				r.examen,
			);
			queryClient.invalidateQueries({
				queryKey: queryKeys.exams.byActivity(activityId),
				exact: true,
			});
		},
	});
	return { ...consulta, guardar };
}
