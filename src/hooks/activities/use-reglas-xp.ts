import { useQuery } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { REGLAS_XP } from "#/lib/utils/reglas-xp";

/** Los rangos de XP por tipo. Mientras cargan, los conocidos de antemano. */
export function useReglasXp() {
	const { data } = useQuery({
		queryKey: ["activities", "reglas-xp"],
		queryFn: () => activitiesService.reglasXp(),
		staleTime: Number.POSITIVE_INFINITY,
	});
	return data ?? REGLAS_XP;
}
