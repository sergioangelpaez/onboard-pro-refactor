/** Colores por tema, en claro y oscuro. Cada dato del inicio tiene el suyo. */
const TONOS = {
	naranja: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
	verde: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
	violeta: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
	azul: "bg-primary/15 text-primary",
} as const;

/** Un número con su ícono de color y una etiqueta. */
export function StatTile({
	icono,
	tono,
	valor,
	etiqueta,
	detalle,
}: {
	icono: React.ReactNode;
	tono: keyof typeof TONOS;
	valor: React.ReactNode;
	etiqueta: string;
	detalle?: string;
}) {
	return (
		<div className="flex items-center gap-4 rounded-xl border bg-card p-4">
			<span
				className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${TONOS[tono]}`}
			>
				{icono}
			</span>
			<div className="min-w-0">
				<p className="font-semibold text-2xl tabular-nums leading-none">
					{valor}
				</p>
				<p className="mt-1 text-muted-foreground text-sm">{etiqueta}</p>
				{detalle && (
					<p className="truncate text-muted-foreground text-xs">{detalle}</p>
				)}
			</div>
		</div>
	);
}
