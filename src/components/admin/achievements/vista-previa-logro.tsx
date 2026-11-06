import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { logrosService } from "#/lib/services/logros";

/** Espera a que se deje de escribir antes de medir: cada medición recorre a todos. */
function useDiferido<T>(valor: T, ms = 500) {
	const [diferido, setDiferido] = useState(valor);
	useEffect(() => {
		const t = setTimeout(() => setDiferido(valor), ms);
		return () => clearTimeout(t);
	}, [valor, ms]);
	return diferido;
}

/**
 * Cuántas personas cumplirían hoy la condición, antes de guardar el logro.
 * Sirve para ver si la meta es demasiado fácil (la cumplen todos) o imposible
 * (no la cumple nadie). No guarda nada.
 */
export function VistaPreviaLogro({
	tipoCondicion,
	meta,
	cursoId,
	tenantId,
}: {
	tipoCondicion: string;
	meta: number;
	cursoId?: string;
	tenantId?: string | null;
}) {
	const params = useDiferido({ tipoCondicion, meta, cursoId, tenantId });
	const listo =
		!!params.tipoCondicion && Number.isInteger(params.meta) && params.meta >= 1;

	const { data, isFetching, error } = useQuery({
		queryKey: ["achievements", "vista-previa", params],
		queryFn: () =>
			logrosService.vistaPrevia({
				tipoCondicion: params.tipoCondicion,
				meta: params.meta,
				...(params.cursoId ? { cursoId: params.cursoId } : {}),
				...(params.tenantId ? { tenantId: params.tenantId } : {}),
			}),
		enabled: listo,
		staleTime: 60_000,
	});

	if (!tipoCondicion) return null;

	let tono = "border-border bg-muted/40";
	let consejo = "";
	if (data && data.aprendices > 0) {
		if (data.porcentaje >= 80) {
			tono = "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10";
			consejo = "Casi todos ya la cumplen: puede que sea demasiado fácil.";
		} else if (data.cumplirian === 0) {
			tono = "border-sky-300 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-500/10";
			consejo = "Nadie la cumple todavía: es una meta para perseguir.";
		} else {
			tono = "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10";
			consejo = "Una meta alcanzable, pero no regalada.";
		}
	}

	return (
		<div className={`space-y-1.5 rounded-md border p-3 text-sm ${tono}`}>
			<p className="flex items-center gap-1.5 font-medium">
				<Users className="size-4" />
				Si la activas hoy
				{isFetching && <LoaderCircle className="size-3.5 animate-spin" />}
			</p>
			{error && (
				<p className="text-destructive text-xs">
					No se pudo calcular: {(error as Error).message}
				</p>
			)}
			{data && (
				<>
					<p>
						<span className="font-semibold tabular-nums">
							{data.estimado ? "≈ " : ""}
							{data.cumplirian}
						</span>{" "}
						de {data.aprendices}{" "}
						{data.aprendices === 1 ? "aprendiz la cumple" : "aprendices la cumplen"} (
						{data.porcentaje}%).
					</p>
					{data.ejemplos.length > 0 && (
						<p className="text-muted-foreground text-xs">
							Por ejemplo:{" "}
							{data.ejemplos.map((e) => `${e.firstname} ${e.lastname}`).join(", ")}
							{data.cumplirian > data.ejemplos.length ? "…" : ""}
						</p>
					)}
					{consejo && <p className="text-muted-foreground text-xs">{consejo}</p>}
				</>
			)}
		</div>
	);
}
