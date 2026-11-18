/**
 * Fechas para mostrar. Se centralizan acá porque cada pantalla venía armando
 * las suyas y el mismo dato salía escrito de tres maneras distintas.
 */

const relativo = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/**
 * "hace 3 horas", "ayer", "hace 2 semanas". Para lo reciente se lee mejor que
 * una fecha; pasado un mes ya conviene la fecha exacta.
 */
export function haceCuanto(iso?: string | null) {
	if (!iso) return null;
	const ms = new Date(iso).getTime();
	if (Number.isNaN(ms)) return null;
	const segundos = Math.round((ms - Date.now()) / 1000);
	const abs = Math.abs(segundos);
	if (abs < 60) return "hace un momento";
	if (abs < 3600) return relativo.format(Math.round(segundos / 60), "minute");
	if (abs < 86_400) return relativo.format(Math.round(segundos / 3600), "hour");
	if (abs < 7 * 86_400)
		return relativo.format(Math.round(segundos / 86_400), "day");
	if (abs < 30 * 86_400)
		return relativo.format(Math.round(segundos / (7 * 86_400)), "week");
	return fechaCorta(iso);
}

/** "12 nov 2026". */
export function fechaCorta(iso?: string | null) {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleDateString("es", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

/** "12 nov 2026, 15:30". */
export function fechaHora(iso?: string | null) {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Para un día suelto ("2026-11-16", sin hora): "hoy", "ayer", "hace 5 días",
 * "hace 2 semanas" o, pasado un mes, la fecha. Se lee como fecha local: con
 * new Date("2026-11-16") sería medianoche UTC, que en Colombia es el día
 * anterior.
 */
export function haceCuantoDia(dia?: string | null) {
	if (!dia) return null;
	const [a, m, d] = dia.slice(0, 10).split("-").map(Number);
	if (!a || !m || !d) return null;
	const fecha = new Date(a, m - 1, d);
	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);
	const dias = Math.round((hoy.getTime() - fecha.getTime()) / 86_400_000);
	if (dias <= 0) return "hoy";
	if (dias < 7) return relativo.format(-dias, "day");
	if (dias < 30) return relativo.format(-Math.floor(dias / 7), "week");
	return fechaCorta(fecha.toISOString());
}
