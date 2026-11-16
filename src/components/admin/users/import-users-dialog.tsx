import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle2,
	Copy,
	Download,
	FileSpreadsheet,
	LoaderCircle,
	Upload,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useAllTenants } from "#/hooks/tenants/use-all-tenants";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { useImportUsers } from "#/hooks/users/use-import-users";
import {
	type FilaImportacion,
	type PreviewImportacion,
	type ResultadoImportacion,
	usersService,
} from "#/lib/services/users";
import { rolReal } from "#/lib/utils/auth/session";

type Paso = "archivo" | "revision" | "resultado";

const PASOS: { valor: Paso; texto: string }[] = [
	{ valor: "archivo", texto: "Archivo" },
	{ valor: "revision", texto: "Revisión" },
	{ valor: "resultado", texto: "Resultado" },
];

const EXTENSIONES = ".csv,.xlsx";

const ROLES: Record<string, string> = {
	student: "Aprendiz",
	instructor: "Instructor",
	admin: "Administrador",
};

/**
 * Carga masiva de personas desde un CSV o un Excel.
 *
 * Va en tres pasos: elegir el archivo (con la plantilla a mano), ver qué
 * pasaría con cada fila y, recién entonces, crear. Ver antes evita lo peor de
 * una carga masiva: descubrir después de crear cien cuentas que el archivo
 * tenía las columnas corridas.
 */
export function ImportUsersDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { user } = useCurrentUser();
	const esSuper = rolReal(user?.role) === "superadmin";
	const organizacionActiva = useOrganizacionActiva();
	const { data: organizaciones = [] } = useAllTenants(esSuper);
	const { previsualizar, importar } = useImportUsers();

	const [paso, setPaso] = useState<Paso>("archivo");
	const [archivo, setArchivo] = useState<File | null>(null);
	const [tenantElegido, setTenantElegido] = useState<string>();
	const [preview, setPreview] = useState<PreviewImportacion | null>(null);
	const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
	const [bajando, setBajando] = useState(false);
	const input = useRef<HTMLInputElement>(null);

	// El superadmin importa a la organización en la que está parado; si está
	// viendo todas, tiene que elegir una acá. A los demás se la pone el backend.
	const tenantId = esSuper
		? (organizacionActiva ?? tenantElegido ?? null)
		: null;
	const faltaOrganizacion = esSuper && !tenantId;

	function reiniciar() {
		setPaso("archivo");
		setArchivo(null);
		setPreview(null);
		setResultado(null);
		previsualizar.reset();
		importar.reset();
		if (input.current) input.current.value = "";
	}

	function cambiarApertura(abierto: boolean) {
		// No se cierra a mitad de la importación: quedaría sin saber qué se creó.
		if (!abierto && importar.isPending) return;
		onOpenChange(abierto);
		if (!abierto) reiniciar();
	}

	async function bajarPlantilla() {
		setBajando(true);
		try {
			await usersService.descargarPlantilla();
		} catch (e) {
			toast.error("No se pudo descargar la plantilla", {
				description: (e as Error).message,
			});
		} finally {
			setBajando(false);
		}
	}

	function revisar() {
		if (!archivo) return;
		previsualizar.mutate(
			{ archivo, tenantId },
			{
				onSuccess: (r) => {
					setPreview(r);
					setPaso("revision");
				},
				onError: (e: Error) =>
					toast.error("No se pudo leer el archivo", { description: e.message }),
			},
		);
	}

	function confirmar() {
		if (!archivo) return;
		importar.mutate(
			{ archivo, tenantId },
			{
				onSuccess: (r) => {
					setResultado(r);
					setPaso("resultado");
					toast.success(r.message);
				},
				onError: (e: Error) =>
					toast.error("No se pudo importar", { description: e.message }),
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={cambiarApertura}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Importar usuarios</DialogTitle>
					<DialogDescription>
						Crea muchas cuentas a la vez desde un archivo CSV o Excel.
					</DialogDescription>
				</DialogHeader>

				<Pasos actual={paso} />

				{paso === "archivo" && (
					<div className="space-y-4">
						<div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center">
							<FileSpreadsheet className="size-8 shrink-0 text-primary" />
							<div className="min-w-0 flex-1 text-sm">
								<p className="font-medium">1. Descarga la plantilla</p>
								<p className="text-muted-foreground">
									Columnas: nombre, apellido, correo, rol (student, instructor o
									admin), teléfono y grupo. Teléfono y grupo son opcionales.
								</p>
							</div>
							<Button
								variant="outline"
								onClick={bajarPlantilla}
								disabled={bajando}
							>
								{bajando ? (
									<LoaderCircle className="animate-spin" />
								) : (
									<Download />
								)}
								Plantilla CSV
							</Button>
						</div>

						{esSuper && !organizacionActiva && (
							<div className="space-y-1.5">
								<p className="font-medium text-sm">Organización</p>
								<Select value={tenantElegido} onValueChange={setTenantElegido}>
									<SelectTrigger className="w-full sm:w-80">
										<SelectValue placeholder="Elige a qué organización van" />
									</SelectTrigger>
									<SelectContent>
										{organizaciones.map((o) => (
											<SelectItem key={o.id} value={o.id}>
												{o.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<button
							type="button"
							onClick={() => input.current?.click()}
							className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
						>
							<Upload className="size-6 text-muted-foreground" />
							<span className="font-medium text-sm">
								{archivo ? archivo.name : "2. Elige el archivo completado"}
							</span>
							<span className="text-muted-foreground text-xs">
								{archivo
									? `${(archivo.size / 1024).toFixed(1)} KB · haz clic para cambiarlo`
									: "Formato .csv o .xlsx"}
							</span>
						</button>
						<input
							ref={input}
							type="file"
							accept={EXTENSIONES}
							className="hidden"
							onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
						/>

						<DialogFooter>
							<Button variant="outline" onClick={() => cambiarApertura(false)}>
								Cancelar
							</Button>
							<Button
								onClick={revisar}
								disabled={
									!archivo || faltaOrganizacion || previsualizar.isPending
								}
							>
								{previsualizar.isPending && (
									<LoaderCircle className="animate-spin" />
								)}
								Revisar archivo
							</Button>
						</DialogFooter>
					</div>
				)}

				{paso === "revision" && preview && (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							<Cifra etiqueta="Filas" valor={preview.resumen.total} />
							<Cifra
								etiqueta="Válidas"
								valor={preview.resumen.validas}
								tono="ok"
							/>
							<Cifra
								etiqueta="Con errores"
								valor={preview.resumen.conErrores}
								tono={preview.resumen.conErrores ? "error" : undefined}
							/>
							<Cifra
								etiqueta="Duplicadas"
								valor={preview.resumen.duplicadas}
								tono={preview.resumen.duplicadas ? "aviso" : undefined}
							/>
						</div>

						{preview.resumen.validas < preview.resumen.total && (
							<p className="flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-amber-800 text-sm dark:text-amber-200">
								<AlertTriangle className="mt-0.5 size-4 shrink-0" />
								Las filas con errores o con un correo que ya existe se van a
								omitir. Si prefieres corregirlas, ajusta el archivo y vuelve a
								subirlo.
							</p>
						)}

						<TablaFilas filas={preview.filas} />

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setPaso("archivo")}
								disabled={importar.isPending}
							>
								<ArrowLeft />
								Cambiar archivo
							</Button>
							<Button
								onClick={confirmar}
								disabled={preview.resumen.validas === 0 || importar.isPending}
							>
								{importar.isPending ? (
									<LoaderCircle className="animate-spin" />
								) : (
									<UserPlus />
								)}
								{preview.resumen.validas === 1
									? "Crear 1 usuario"
									: `Crear ${preview.resumen.validas} usuarios`}
							</Button>
						</DialogFooter>
					</div>
				)}

				{paso === "resultado" && resultado && (
					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
							<Cifra
								etiqueta="Usuarios creados"
								valor={resultado.creados}
								tono="ok"
							/>
							<Cifra
								etiqueta="Agregados a un grupo"
								valor={resultado.conGrupo}
							/>
							<Cifra
								etiqueta="Filas omitidas"
								valor={resultado.omitidas.length}
								tono={resultado.omitidas.length ? "aviso" : undefined}
							/>
						</div>

						{resultado.omitidas.length > 0 && (
							<div className="space-y-2">
								<p className="font-medium text-sm">Filas omitidas</p>
								<ul className="max-h-60 divide-y overflow-y-auto rounded-lg border text-sm">
									{resultado.omitidas.map((o) => (
										<li
											key={`${o.fila}-${o.email}`}
											className="flex flex-col gap-0.5 p-2.5 sm:flex-row sm:items-center sm:gap-3"
										>
											<span className="w-16 shrink-0 text-muted-foreground text-xs tabular-nums">
												Fila {o.fila}
											</span>
											<span className="min-w-0 truncate font-medium sm:w-56">
												{o.email || "Sin correo"}
											</span>
											<span className="min-w-0 flex-1 text-muted-foreground">
												{o.motivo}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						<DialogFooter>
							<Button variant="outline" onClick={reiniciar}>
								Importar otro archivo
							</Button>
							<Button onClick={() => cambiarApertura(false)}>Listo</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function Pasos({ actual }: { actual: Paso }) {
	const indice = PASOS.findIndex((p) => p.valor === actual);
	return (
		<ol className="flex items-center gap-2 text-xs">
			{PASOS.map((p, i) => (
				<li key={p.valor} className="flex items-center gap-2">
					<span
						className={`flex size-6 items-center justify-center rounded-full font-semibold ${
							i <= indice
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{i < indice ? <CheckCircle2 className="size-3.5" /> : i + 1}
					</span>
					<span
						className={i === indice ? "font-medium" : "text-muted-foreground"}
					>
						{p.texto}
					</span>
					{i < PASOS.length - 1 && <span className="h-px w-6 bg-border" />}
				</li>
			))}
		</ol>
	);
}

const TONOS_CIFRA = {
	ok: "text-emerald-600 dark:text-emerald-300",
	error: "text-destructive",
	aviso: "text-amber-600 dark:text-amber-300",
} as const;

function Cifra({
	etiqueta,
	valor,
	tono,
}: {
	etiqueta: string;
	valor: number;
	tono?: keyof typeof TONOS_CIFRA;
}) {
	return (
		<div className="rounded-lg border bg-card p-3">
			<p
				className={`font-semibold text-xl tabular-nums ${tono ? TONOS_CIFRA[tono] : ""}`}
			>
				{valor}
			</p>
			<p className="text-muted-foreground text-xs">{etiqueta}</p>
		</div>
	);
}

/** Cada fila del archivo con su estado. Las que no se van a crear, resaltadas. */
function TablaFilas({ filas }: { filas: FilaImportacion[] }) {
	return (
		<div className="max-h-[45vh] overflow-auto rounded-lg border">
			<table className="w-full min-w-[640px] text-sm">
				<thead className="sticky top-0 z-10 bg-muted text-left text-muted-foreground text-xs">
					<tr>
						<th className="px-3 py-2 font-medium">Fila</th>
						<th className="px-3 py-2 font-medium">Nombre</th>
						<th className="px-3 py-2 font-medium">Correo</th>
						<th className="px-3 py-2 font-medium">Rol</th>
						<th className="px-3 py-2 font-medium">Grupo</th>
						<th className="px-3 py-2 font-medium">Estado</th>
					</tr>
				</thead>
				<tbody className="divide-y">
					{filas.map((f) => {
						const conError = f.errores.length > 0;
						return (
							<tr
								key={f.fila}
								className={
									conError
										? "bg-destructive/5"
										: f.duplicado
											? "bg-amber-500/5"
											: undefined
								}
							>
								<td className="px-3 py-2 align-top text-muted-foreground tabular-nums">
									{f.fila}
								</td>
								<td className="px-3 py-2 align-top">
									{`${f.datos.firstname} ${f.datos.lastname}`.trim() || "—"}
								</td>
								<td className="max-w-56 truncate px-3 py-2 align-top">
									{f.datos.email || "—"}
								</td>
								<td className="px-3 py-2 align-top">
									{ROLES[f.datos.role] ?? (f.datos.role || "—")}
								</td>
								<td className="px-3 py-2 align-top">
									{f.datos.grupo ? (
										<span className="inline-flex items-center gap-1">
											<Users className="size-3.5 text-muted-foreground" />
											{f.datos.grupo}
										</span>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</td>
								<td className="px-3 py-2 align-top">
									{conError ? (
										<div className="space-y-1">
											<Badge variant="destructive" className="gap-1">
												<XCircle className="size-3" />
												Con errores
											</Badge>
											<ul className="list-disc space-y-0.5 pl-4 text-destructive text-xs">
												{f.errores.map((e) => (
													<li key={e}>{e}</li>
												))}
											</ul>
										</div>
									) : f.duplicado ? (
										<Badge
											variant="outline"
											className="gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300"
										>
											<Copy className="size-3" />
											Ya existe
										</Badge>
									) : (
										<Badge variant="secondary" className="gap-1">
											<CheckCircle2 className="size-3" />
											Lista
										</Badge>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
