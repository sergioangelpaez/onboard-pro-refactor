import {
	ArrowDown,
	ArrowUp,
	CircleCheck,
	LoaderCircle,
	Plus,
	Save,
	Trash,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useExamEditor } from "#/hooks/exams/use-exam";
import type { EditableExam, SaveExamPayload } from "#/lib/services/exams";

interface OpcionBorrador {
	key: string;
	texto: string;
	esCorrecta: boolean;
}

interface PreguntaBorrador {
	key: string;
	/** Solo las que ya existen en el servidor. Sin id, el backend la crea. */
	id?: string;
	enunciado: string;
	puntaje: number;
	opciones: OpcionBorrador[];
}

const clave = () => crypto.randomUUID();

const opcionVacia = (esCorrecta = false): OpcionBorrador => ({
	key: clave(),
	texto: "",
	esCorrecta,
});

const preguntaVacia = (): PreguntaBorrador => ({
	key: clave(),
	enunciado: "",
	puntaje: 1,
	opciones: [opcionVacia(true), opcionVacia()],
});

function borradorDe(examen: EditableExam): PreguntaBorrador[] {
	return examen.preguntas.map((p) => ({
		key: p.id,
		id: p.id,
		enunciado: p.enunciado,
		puntaje: p.puntaje,
		opciones: p.opciones.map((o) => ({
			key: o.id,
			texto: o.texto,
			esCorrecta: o.esCorrecta,
		})),
	}));
}

/**
 * El editor del examen para quien lo arma.
 *
 * Se edita todo en pantalla y se guarda de una vez: el backend recibe la lista
 * entera de preguntas (las que traen id se editan, las nuevas se crean, las
 * que ya no están se borran) y lo aplica todo o nada. Si una pregunta está mal
 * no se guarda ninguna, y el mensaje dice cuál.
 */
export function ExamEditor({ activityId }: { activityId: string }) {
	const { data, isLoading, error, guardar } = useExamEditor(activityId);

	if (isLoading)
		return (
			<p className="text-muted-foreground text-sm">Cargando el examen...</p>
		);
	if (error || !data) {
		return (
			<p className="text-muted-foreground text-sm">
				No se pudo cargar el examen: {error?.message}
			</p>
		);
	}

	// La key reinicia el borrador cuando llega una versión nueva del servidor
	// (al guardar), en vez de mezclarla con lo que estaba en pantalla.
	const version = data.preguntas
		.map((p) => `${p.id}:${p.enunciado}:${p.opciones.length}`)
		.join("|");
	return (
		<Formulario
			key={`${version}-${data.tiempoLimite}-${data.intentosPermitidos}-${data.porcentajeAprobacion}`}
			examen={data}
			guardando={guardar.isPending}
			onGuardar={(payload) =>
				guardar.mutate(payload, {
					onSuccess: (r) => toast.success(r.message),
					onError: (e: Error) =>
						toast.error("No se pudo guardar el examen", {
							description: e.message,
						}),
				})
			}
		/>
	);
}

function Formulario({
	examen,
	guardando,
	onGuardar,
}: {
	examen: EditableExam;
	guardando: boolean;
	onGuardar: (payload: SaveExamPayload) => void;
}) {
	const [tiempo, setTiempo] = useState(
		examen.tiempoLimite ? String(examen.tiempoLimite) : "",
	);
	const [intentos, setIntentos] = useState(String(examen.intentosPermitidos));
	const [aprobacion, setAprobacion] = useState(
		String(examen.porcentajeAprobacion),
	);
	const [preguntas, setPreguntas] = useState<PreguntaBorrador[]>(() =>
		borradorDe(examen),
	);
	const [cambios, setCambios] = useState(false);

	const puntajeTotal = preguntas.reduce(
		(a, p) => a + (Number(p.puntaje) || 0),
		0,
	);

	function cambiar(updater: (ps: PreguntaBorrador[]) => PreguntaBorrador[]) {
		setPreguntas(updater);
		setCambios(true);
	}
	const editarPregunta = (key: string, cambio: Partial<PreguntaBorrador>) =>
		cambiar((ps) => ps.map((p) => (p.key === key ? { ...p, ...cambio } : p)));
	const mover = (i: number, d: -1 | 1) =>
		cambiar((ps) => {
			const copia = [...ps];
			[copia[i], copia[i + d]] = [copia[i + d], copia[i]];
			return copia;
		});

	function guardar() {
		onGuardar({
			tiempoLimite: tiempo.trim() ? Number(tiempo) : null,
			intentosPermitidos: Number(intentos),
			porcentajeAprobacion: Number(aprobacion),
			preguntas: preguntas.map((p) => ({
				...(p.id ? { id: p.id } : {}),
				enunciado: p.enunciado,
				puntaje: Number(p.puntaje) || 1,
				opciones: p.opciones.map((o) => ({
					texto: o.texto,
					esCorrecta: o.esCorrecta,
				})),
			})),
		});
	}

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
				<CardTitle>Examen</CardTitle>
				<span className="text-muted-foreground text-sm">
					{preguntas.length} {preguntas.length === 1 ? "pregunta" : "preguntas"}{" "}
					· {puntajeTotal} puntos
				</span>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="grid gap-4 sm:grid-cols-3">
					<Campo
						id="tiempo"
						etiqueta="Tiempo límite (minutos)"
						ayuda="Vacío: sin límite"
					>
						<Input
							id="tiempo"
							type="number"
							min={1}
							max={480}
							value={tiempo}
							onChange={(e) => {
								setTiempo(e.target.value);
								setCambios(true);
							}}
						/>
					</Campo>
					<Campo id="intentos" etiqueta="Intentos permitidos" ayuda="De 1 a 10">
						<Input
							id="intentos"
							type="number"
							min={1}
							max={10}
							value={intentos}
							onChange={(e) => {
								setIntentos(e.target.value);
								setCambios(true);
							}}
						/>
					</Campo>
					<Campo
						id="aprobacion"
						etiqueta="% para aprobar"
						ayuda="Del puntaje total"
					>
						<Input
							id="aprobacion"
							type="number"
							min={1}
							max={100}
							value={aprobacion}
							onChange={(e) => {
								setAprobacion(e.target.value);
								setCambios(true);
							}}
						/>
					</Campo>
				</div>

				{preguntas.length === 0 && (
					<p className="rounded-md border border-dashed p-6 text-center text-muted-foreground text-sm">
						Todavía no hay preguntas. Sin preguntas nadie puede rendir el
						examen.
					</p>
				)}

				<ol className="space-y-4">
					{preguntas.map((p, i) => (
						<li key={p.key} className="space-y-3 rounded-md border p-4">
							<div className="flex items-start gap-2">
								<span className="mt-2 font-medium text-sm">{i + 1}.</span>
								<Textarea
									aria-label={`Enunciado de la pregunta ${i + 1}`}
									placeholder="Escribe la pregunta"
									rows={2}
									value={p.enunciado}
									onChange={(e) =>
										editarPregunta(p.key, { enunciado: e.target.value })
									}
								/>
								<div className="flex shrink-0 flex-col">
									<Button
										type="button"
										size="icon"
										variant="ghost"
										aria-label="Subir"
										disabled={i === 0}
										onClick={() => mover(i, -1)}
									>
										<ArrowUp />
									</Button>
									<Button
										type="button"
										size="icon"
										variant="ghost"
										aria-label="Bajar"
										disabled={i === preguntas.length - 1}
										onClick={() => mover(i, 1)}
									>
										<ArrowDown />
									</Button>
								</div>
							</div>

							<fieldset className="space-y-2 pl-5">
								<legend className="mb-1 text-muted-foreground text-xs">
									Opciones · marca la correcta
								</legend>
								{p.opciones.map((o, j) => (
									<div key={o.key} className="flex items-center gap-2">
										<input
											type="radio"
											name={`correcta-${p.key}`}
											aria-label={`Opción ${j + 1} es la correcta`}
											checked={o.esCorrecta}
											onChange={() =>
												editarPregunta(p.key, {
													opciones: p.opciones.map((x) => ({
														...x,
														esCorrecta: x.key === o.key,
													})),
												})
											}
											className="accent-primary"
										/>
										<Input
											aria-label={`Texto de la opción ${j + 1}`}
											placeholder={`Opción ${j + 1}`}
											value={o.texto}
											onChange={(e) =>
												editarPregunta(p.key, {
													opciones: p.opciones.map((x) =>
														x.key === o.key
															? { ...x, texto: e.target.value }
															: x,
													),
												})
											}
										/>
										{o.esCorrecta && (
											<CircleCheck
												className="size-4 shrink-0 text-primary"
												aria-hidden
											/>
										)}
										<Button
											type="button"
											size="icon"
											variant="ghost"
											aria-label={`Quitar la opción ${j + 1}`}
											disabled={p.opciones.length <= 2}
											onClick={() => {
												const resto = p.opciones.filter((x) => x.key !== o.key);
												// Si se quita la correcta, la primera que queda pasa a serlo.
												if (o.esCorrecta && resto.length)
													resto[0] = { ...resto[0], esCorrecta: true };
												editarPregunta(p.key, { opciones: resto });
											}}
										>
											<X />
										</Button>
									</div>
								))}
								<Button
									type="button"
									size="sm"
									variant="ghost"
									onClick={() =>
										editarPregunta(p.key, {
											opciones: [...p.opciones, opcionVacia()],
										})
									}
								>
									<Plus />
									Agregar opción
								</Button>
							</fieldset>

							<div className="flex flex-wrap items-center justify-between gap-2 pl-5">
								<div className="flex items-center gap-2">
									<Label htmlFor={`puntaje-${p.key}`} className="text-xs">
										Puntaje
									</Label>
									<Input
										id={`puntaje-${p.key}`}
										type="number"
										min={1}
										className="h-8 w-20"
										value={p.puntaje}
										onChange={(e) =>
											editarPregunta(p.key, { puntaje: Number(e.target.value) })
										}
									/>
								</div>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									className="text-destructive"
									onClick={() =>
										cambiar((ps) => ps.filter((x) => x.key !== p.key))
									}
								>
									<Trash />
									Quitar pregunta
								</Button>
							</div>
						</li>
					))}
				</ol>

				<div className="flex flex-wrap items-center justify-between gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => cambiar((ps) => [...ps, preguntaVacia()])}
					>
						<Plus />
						Agregar pregunta
					</Button>
					<div className="flex items-center gap-3">
						{cambios && (
							<span className="text-muted-foreground text-sm">
								Hay cambios sin guardar
							</span>
						)}
						<Button
							type="button"
							onClick={guardar}
							disabled={guardando || !cambios}
						>
							{guardando ? <LoaderCircle className="animate-spin" /> : <Save />}
							Guardar examen
						</Button>
					</div>
				</div>

				<p className="text-muted-foreground text-xs">
					Si alguien ya rindió el examen, sus preguntas no se pueden cambiar (la
					configuración sí): quien lo rindió quedaría con un resultado que no
					corresponde al examen.
				</p>
			</CardContent>
		</Card>
	);
}

function Campo({
	id,
	etiqueta,
	ayuda,
	children,
}: {
	id: string;
	etiqueta: string;
	ayuda: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{etiqueta}</Label>
			{children}
			<p className="text-muted-foreground text-xs">{ayuda}</p>
		</div>
	);
}
