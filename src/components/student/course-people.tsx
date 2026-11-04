import { Check, Contact, Copy, Mail, Phone, Search, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { ScrollArea } from "#/components/ui/scroll-area";
import { Skeleton } from "#/components/ui/skeleton";
import { useCourseParticipants } from "#/hooks/courses/use-course-participants";
import { useCurrentUser } from "#/hooks/users/use-current-user";

// Colores llenos con texto blanco, en estilo directo: no dependen de que el
// componente de avatar respete las clases de color.
const COLORES = [
	"#2563eb",
	"#7c3aed",
	"#059669",
	"#d97706",
	"#e11d48",
	"#0891b2",
	"#4f46e5",
	"#0d9488",
];

/** Siempre el mismo color para la misma persona. */
function colorDe(id: string) {
	let h = 0;
	for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	return COLORES[h % COLORES.length];
}

function iniciales(nombre?: string | null, apellido?: string | null) {
	return `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase() || "?";
}

const TAMANO = {
	sm: "size-7 text-[11px]",
	default: "size-9 text-xs",
	lg: "size-11 text-sm",
};

function Persona({
	id,
	firstname,
	lastname,
	size = "default",
}: {
	id: string;
	firstname?: string | null;
	lastname?: string | null;
	size?: "default" | "sm" | "lg";
}) {
	return (
		<span
			aria-hidden
			className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-background ${TAMANO[size]}`}
			style={{ backgroundColor: colorDe(id) }}
		>
			{iniciales(firstname, lastname)}
		</span>
	);
}

/** Un dato de contacto con sus dos acciones: abrirlo y copiarlo. */
function DatoContacto({
	icono,
	etiqueta,
	valor,
	href,
}: {
	icono: React.ReactNode;
	etiqueta: string;
	valor: string;
	href: string;
}) {
	const [copiado, setCopiado] = useState(false);
	async function copiar() {
		try {
			await navigator.clipboard.writeText(valor);
			setCopiado(true);
			setTimeout(() => setCopiado(false), 1500);
		} catch {
			toast.error("No se pudo copiar");
		}
	}
	return (
		<div className="flex items-center gap-3 rounded-md border p-2.5">
			<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
				{icono}
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-muted-foreground text-xs">{etiqueta}</p>
				<a
					href={href}
					className="block truncate font-medium text-sm hover:underline"
				>
					{valor}
				</a>
			</div>
			<Button
				size="icon"
				variant="ghost"
				className="size-8 shrink-0"
				onClick={copiar}
				aria-label={`Copiar ${etiqueta.toLowerCase()}`}
				title="Copiar"
			>
				{copiado ? <Check className="text-emerald-600" /> : <Copy />}
			</Button>
		</div>
	);
}

/**
 * El contacto del instructor: el correo y, si lo cargó, el teléfono. Cada
 * dato se abre (correo o llamada) o se copia.
 */
function Contacto({
	nombre,
	email,
	telefono,
	compacto = false,
}: {
	nombre: string;
	email: string;
	telefono?: string | null;
	compacto?: boolean;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					size="sm"
					variant={compacto ? "ghost" : "outline"}
					className={compacto ? "h-8 rounded-full text-primary" : ""}
				>
					<Contact />
					Contacto
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-72 space-y-2">
				<p className="font-medium text-sm">Contactar a {nombre}</p>
				<DatoContacto
					icono={<Mail className="size-4" />}
					etiqueta="Correo"
					valor={email}
					href={`mailto:${email}`}
				/>
				{telefono ? (
					<DatoContacto
						icono={<Phone className="size-4" />}
						etiqueta="Teléfono"
						valor={telefono}
						href={`tel:${telefono.replace(/\s+/g, "")}`}
					/>
				) : (
					<p className="px-1 text-muted-foreground text-xs">
						No cargó un número de teléfono.
					</p>
				)}
			</PopoverContent>
		</Popover>
	);
}

/**
 * Quién está en el curso, en la cabecera: quién lo dicta (con su contacto) y
 * las caras de los compañeros. Tocándolas se abre la lista
 * completa, con los grupos que tienen el curso.
 */
export function CoursePeople({ courseId }: { courseId: string }) {
	const { data, isLoading } = useCourseParticipants(courseId);
	const { user } = useCurrentUser();
	const [abierto, setAbierto] = useState(false);
	const [busqueda, setBusqueda] = useState("");

	if (isLoading) {
		return (
			<div className="flex flex-wrap items-center gap-4">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-9 w-40" />
			</div>
		);
	}
	if (!data) return null;

	const { instructor, aprendices, grupos } = data;
	const nombreInstructor = instructor
		? [instructor.firstname, instructor.lastname].filter(Boolean).join(" ") ||
			instructor.email
		: null;
	const caras = aprendices.slice(0, 5);
	const filtro = busqueda.trim().toLowerCase();
	const visibles = filtro
		? aprendices.filter((a) =>
				`${a.firstname} ${a.lastname}`.toLowerCase().includes(filtro),
			)
		: aprendices;

	return (
		<>
			<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
				{instructor && (
					<div className="flex items-center gap-2.5 rounded-full border bg-card py-1 pr-1 pl-1.5 shadow-xs">
						<Persona
							id={instructor.id ?? instructor.email}
							firstname={instructor.firstname}
							lastname={instructor.lastname}
						/>
						<div className="pr-1 leading-tight">
							<p className="text-muted-foreground text-xs">Instructor</p>
							<p className="font-medium text-sm">{nombreInstructor}</p>
						</div>
						<Contacto
							nombre={nombreInstructor ?? ""}
							email={instructor.email}
							telefono={instructor.telefono}
							compacto
						/>
					</div>
				)}

				{aprendices.length > 0 && (
					<button
						type="button"
						onClick={() => setAbierto(true)}
						className="flex items-center gap-2.5 rounded-full border bg-card py-1 pr-3.5 pl-1.5 text-left shadow-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
					>
						<span className="-space-x-2 flex">
							{caras.map((a) => (
								<Persona key={a.id} {...a} size="sm" />
							))}
							{aprendices.length > caras.length && (
								<span className="inline-flex size-7 items-center justify-center rounded-full border bg-muted font-semibold text-[11px] text-foreground ring-2 ring-background">
									+{aprendices.length - caras.length}
								</span>
							)}
						</span>
						<span className="text-sm">
							<span className="font-medium">{aprendices.length}</span>{" "}
							<span className="text-muted-foreground">
								{aprendices.length === 1 ? "participante" : "participantes"}
							</span>
						</span>
					</button>
				)}
			</div>

			<Dialog open={abierto} onOpenChange={setAbierto}>
				<DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Users className="size-5" />
							Personas del curso
						</DialogTitle>
						<DialogDescription>
							{data.curso.nombre} · {aprendices.length}{" "}
							{aprendices.length === 1 ? "participante" : "participantes"}
						</DialogDescription>
					</DialogHeader>

					{instructor && (
						<div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
							<Persona
								id={instructor.id ?? instructor.email}
								firstname={instructor.firstname}
								lastname={instructor.lastname}
								size="lg"
							/>
							<div className="min-w-0 flex-1">
								<p className="font-medium">{nombreInstructor}</p>
								<p className="truncate text-muted-foreground text-sm">
									Instructor · {instructor.email}
								</p>
							</div>
							<Contacto
								nombre={nombreInstructor ?? ""}
								email={instructor.email}
								telefono={instructor.telefono}
							/>
						</div>
					)}

					{grupos.length > 0 && (
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="text-muted-foreground text-xs">
								{grupos.length === 1 ? "Grupo:" : "Grupos:"}
							</span>
							{grupos.map((g) => (
								<Badge key={g.id} variant="secondary">
									{g.nombre}
								</Badge>
							))}
						</div>
					)}

					<label className="flex items-center gap-2 rounded-md border bg-background px-3 shadow-xs focus-within:ring-2 focus-within:ring-ring/40">
						<Search className="size-4 shrink-0 text-muted-foreground" />
						<input
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							placeholder="Buscar por nombre"
							className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
							aria-label="Buscar participantes"
						/>
					</label>

					<ScrollArea className="min-h-0 flex-1 pr-3">
						<ul className="grid gap-1 sm:grid-cols-2">
							{visibles.map((a) => {
								const soyYo = a.id === user?.id;
								return (
									<li
										key={a.id}
										className={`flex items-center gap-3 rounded-md px-2 py-2 ${soyYo ? "bg-primary/10" : ""}`}
									>
										<Persona {...a} />
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">
												{a.firstname} {a.lastname}
												{soyYo && (
													<span className="ml-1 text-primary text-xs">
														(tú)
													</span>
												)}
											</p>
											<p className="text-muted-foreground text-xs">
												Nivel {a.level}
											</p>
										</div>
									</li>
								);
							})}
						</ul>
						{visibles.length === 0 && (
							<p className="py-6 text-center text-muted-foreground text-sm">
								Nadie coincide con "{busqueda}".
							</p>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
