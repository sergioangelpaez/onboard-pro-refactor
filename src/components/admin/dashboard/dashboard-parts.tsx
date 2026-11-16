import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { DiaActividad } from "#/lib/services/dashboard";

/** Piezas compartidas por las dos vistas del panel: plataforma y organización. */

export const PERIODOS_DASHBOARD = [7, 30, 90] as const;
export type DiasDashboard = (typeof PERIODOS_DASHBOARD)[number];

const numero = new Intl.NumberFormat("es");

export function formatear(n: number) {
	return numero.format(Math.round(n));
}

/** Los mismos colores suaves que los tiles del inicio del aprendiz. */
const TONOS = {
	naranja: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
	verde: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
	violeta: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
	azul: "bg-primary/15 text-primary",
	ambar: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
} as const;

/** 7, 30 o 90 días. Un control segmentado: son pocas opciones y fijas. */
export function SelectorPeriodo({
	valor,
	onCambiar,
}: {
	valor: DiasDashboard;
	onCambiar: (dias: DiasDashboard) => void;
}) {
	return (
		<div
			role="radiogroup"
			aria-label="Periodo"
			className="inline-flex rounded-lg border bg-muted/50 p-1"
		>
			{PERIODOS_DASHBOARD.map((d) => (
				// biome-ignore lint/a11y/useSemanticElements: control segmentado, mismo patrón que las pestañas del ranking
				<button
					key={d}
					type="button"
					role="radio"
					aria-checked={valor === d}
					onClick={() => onCambiar(d)}
					className={`rounded-md px-3 py-1.5 font-medium text-sm tabular-nums transition-colors ${
						valor === d
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					{d} días
				</button>
			))}
		</div>
	);
}

/**
 * Cómo se movió un número contra el periodo anterior de igual largo.
 *
 * `puntos` es para porcentajes (la tasa de finalización): ahí lo que se lee
 * es la diferencia en puntos, no "creció un 12 % de un 40 %". La flecha y el
 * texto acompañan al color, así no depende solo de distinguir verde y rojo.
 */
export function Variacion({
	actual,
	anterior,
	puntos = false,
}: {
	actual: number;
	anterior: number;
	puntos?: boolean;
}) {
	let texto: string;
	let signo: number;
	if (puntos) {
		const dif = Math.round((actual - anterior) * 10) / 10;
		signo = Math.sign(dif);
		texto = `${dif > 0 ? "+" : ""}${numero.format(dif)} pts`;
	} else if (anterior === 0) {
		signo = Math.sign(actual);
		texto = actual > 0 ? "nuevo" : "sin cambios";
	} else {
		const pct = Math.round(((actual - anterior) / anterior) * 100);
		signo = Math.sign(pct);
		texto = `${pct > 0 ? "+" : ""}${pct} %`;
	}

	const Icono = signo > 0 ? ArrowUpRight : signo < 0 ? ArrowDownRight : Minus;
	const color =
		signo > 0
			? "text-emerald-600 dark:text-emerald-400"
			: signo < 0
				? "text-destructive"
				: "text-muted-foreground";

	return (
		<span
			className={`inline-flex items-center gap-0.5 font-medium text-xs tabular-nums ${color}`}
		>
			<Icono className="size-3.5" />
			{texto}
		</span>
	);
}

/**
 * Un indicador del panel: ícono, valor, etiqueta y, si hay con qué comparar,
 * la variación contra el periodo anterior.
 */
export function Indicador({
	icono,
	tono,
	valor,
	etiqueta,
	detalle,
	variacion,
	accion,
}: {
	icono: React.ReactNode;
	tono: keyof typeof TONOS;
	valor: React.ReactNode;
	etiqueta: string;
	detalle?: React.ReactNode;
	variacion?: React.ReactNode;
	accion?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
			<div className="flex items-start justify-between gap-2">
				<span
					className={`flex size-10 shrink-0 items-center justify-center rounded-lg [&>svg]:size-5 ${TONOS[tono]}`}
				>
					{icono}
				</span>
				{variacion}
			</div>
			<div className="min-w-0">
				<p className="font-semibold text-2xl tabular-nums leading-none">
					{valor}
				</p>
				<p className="mt-1 text-muted-foreground text-sm">{etiqueta}</p>
				{detalle && (
					<p className="mt-0.5 truncate text-muted-foreground text-xs">
						{detalle}
					</p>
				)}
			</div>
			{accion && <div className="mt-auto">{accion}</div>}
		</div>
	);
}

/** Una barra fina de 0 a 100, para tasas y avances dentro de una tabla. */
export function BarraPorcentaje({ valor }: { valor: number }) {
	const v = Math.max(0, Math.min(100, valor));
	return (
		<div className="flex items-center gap-2">
			<div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:w-24">
				<div
					className="h-full rounded-full bg-primary"
					style={{ width: `${v}%` }}
				/>
			</div>
			<span className="w-10 text-right text-xs tabular-nums">
				{Math.round(v)} %
			</span>
		</div>
	);
}

type Metrica = "xp" | "completadas";

const METRICAS: { valor: Metrica; texto: string; unidad: string }[] = [
	{ valor: "xp", texto: "XP otorgado", unidad: "XP" },
	{
		valor: "completadas",
		texto: "Actividades completadas",
		unidad: "completadas",
	},
];

function diaCorto(iso: string) {
	// Las fechas llegan como "2026-11-16": se leen en hora local, no en UTC,
	// para que el día no se corra uno para atrás.
	const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
	return new Date(a, (m ?? 1) - 1, d ?? 1).toLocaleDateString("es", {
		day: "numeric",
		month: "short",
	});
}

/**
 * La actividad día por día, en barras.
 *
 * XP y actividades completadas tienen escalas muy distintas: en vez de dos
 * ejes en un mismo gráfico (que invita a comparar alturas que no se
 * comparan), se elige cuál ver. Pasar el puntero o tocar una barra muestra
 * el día arriba, donde no tapa nada.
 */
export function GraficoActividad({
	dias,
	className,
}: {
	dias: DiaActividad[];
	className?: string;
}) {
	const [metrica, setMetrica] = useState<Metrica>("xp");
	const [activo, setActivo] = useState<number | null>(null);
	const meta = METRICAS.find((m) => m.valor === metrica) ?? METRICAS[0];
	const valores = dias.map((d) => d[metrica]);
	const maximo = Math.max(...valores, 0);
	const total = valores.reduce((a, b) => a + b, 0);
	// Un tope redondo para la línea de referencia de arriba.
	const tope = maximo > 0 ? redondearArriba(maximo) : 1;
	const dia = activo !== null ? dias[activo] : null;

	return (
		<Card className={className}>
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<CardTitle className="text-base">Actividad por día</CardTitle>
					<p className="text-muted-foreground text-sm" aria-live="polite">
						{dia ? (
							<>
								<span className="font-medium text-foreground">
									{diaCorto(dia.fecha)}
								</span>
								{" · "}
								{formatear(dia.xp)} XP · {formatear(dia.completadas)}{" "}
								{dia.completadas === 1 ? "completada" : "completadas"}
							</>
						) : (
							<>
								<span className="font-medium text-foreground tabular-nums">
									{formatear(total)}
								</span>{" "}
								{meta.unidad} en el periodo
							</>
						)}
					</p>
				</div>
				<div className="inline-flex shrink-0 self-start rounded-lg border bg-muted/50 p-0.5">
					{METRICAS.map((m) => (
						<button
							key={m.valor}
							type="button"
							aria-pressed={metrica === m.valor}
							onClick={() => setMetrica(m.valor)}
							className={`rounded-md px-2.5 py-1 font-medium text-xs transition-colors ${
								metrica === m.valor
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{m.texto}
						</button>
					))}
				</div>
			</CardHeader>
			<CardContent>
				{dias.length === 0 ? (
					<p className="py-10 text-center text-muted-foreground text-sm">
						Sin actividad en el periodo.
					</p>
				) : (
					<>
						<div className="relative h-48 pl-10">
							{/* Referencias: el tope y la mitad. Tenues, para no competir
							    con las barras. */}
							{[1, 0.5].map((f) => (
								<div
									key={f}
									className="pointer-events-none absolute right-0 left-10 border-border/70 border-t border-dashed"
									style={{ bottom: `${f * 100}%` }}
								>
									<span className="-translate-y-1/2 -left-10 absolute w-9 text-right text-[10px] text-muted-foreground tabular-nums">
										{abreviar(tope * f)}
									</span>
								</div>
							))}
							<fieldset
								aria-label={`${meta.texto} por día`}
								className="absolute inset-0 left-10 m-0 flex min-w-0 items-end gap-px border-0 border-b p-0"
								onMouseLeave={() => setActivo(null)}
							>
								{dias.map((d, i) => {
									const v = d[metrica];
									const alto = (v / tope) * 100;
									return (
										<button
											key={d.fecha}
											type="button"
											aria-label={`${diaCorto(d.fecha)}: ${formatear(d.xp)} XP, ${formatear(d.completadas)} completadas`}
											onMouseEnter={() => setActivo(i)}
											onFocus={() => setActivo(i)}
											onBlur={() => setActivo(null)}
											onClick={() => setActivo(i)}
											// El área sensible es la columna entera, no solo la
											// barra: un día con poco se puede señalar igual.
											className="group flex h-full min-w-0 flex-1 items-end focus-visible:outline-none"
										>
											<span
												className={`block w-full rounded-t-[3px] transition-colors ${
													activo === i
														? "bg-primary"
														: "bg-primary/60 group-hover:bg-primary"
												}`}
												style={{
													height: v > 0 ? `max(${alto}%, 2px)` : 0,
												}}
											/>
										</button>
									);
								})}
							</fieldset>
						</div>
						<div className="mt-1.5 flex justify-between pl-10 text-[10px] text-muted-foreground">
							<span>{diaCorto(dias[0].fecha)}</span>
							{dias.length > 2 && (
								<span>{diaCorto(dias[Math.floor(dias.length / 2)].fecha)}</span>
							)}
							<span>{diaCorto(dias[dias.length - 1].fecha)}</span>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

/** 1.234 → 1,3 k. Para las referencias del eje, donde no entra el número entero. */
function abreviar(n: number) {
	if (n >= 1000)
		return `${new Intl.NumberFormat("es", { maximumFractionDigits: 1 }).format(n / 1000)} k`;
	return formatear(n);
}

/** 37 → 40, 412 → 500, 8.300 → 10.000. */
function redondearArriba(n: number) {
	const potencia = 10 ** Math.floor(Math.log10(n));
	const pasos = [1, 2, 2.5, 5, 10];
	for (const p of pasos) if (n <= p * potencia) return p * potencia;
	return 10 * potencia;
}
