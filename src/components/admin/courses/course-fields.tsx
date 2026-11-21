import { Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "#/components/ui/checkbox";
import { useAllGroups } from "#/hooks/groups/use-all-groups";
import { useAllUsers } from "#/hooks/users/use-all-users";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { rolReal } from "#/lib/utils/auth/session";
import { cn } from "@/lib/utils/utils";
import { Button } from "../../ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../../ui/command";
import { Field, FieldDescription, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";

/**
 * "Para toda la organización": el curso lo tienen todos los aprendices de la
 * organización, estén o no en un grupo. Solo lo decide el administrador, así
 * que a los demás roles no se les muestra.
 */
export function ParaTodosCampo({
	id,
	value,
	onChange,
}: {
	id: string;
	value: boolean;
	onChange: (value: boolean) => void;
}) {
	const { user } = useCurrentUser();
	if (rolReal(user?.role) !== "admin") return null;
	return (
		<Field orientation="horizontal" className="items-start">
			<Checkbox
				id={id}
				checked={value}
				onCheckedChange={(v: boolean | string) => onChange(v === true)}
			/>
			<div className="grid gap-1">
				<FieldLabel htmlFor={id}>Para toda la organización</FieldLabel>
				<FieldDescription>
					Todos los aprendices de la organización tendrán este curso, también
					los que se registren después.
				</FieldDescription>
			</div>
		</Field>
	);
}

/** Valor del selector de grupo que significa "no asignarlo todavía". */
export const SIN_GRUPO = "ninguno";

interface CampoProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
}

/**
 * Publicado o borrador. En la base son "Abierto" y "Cerrado"; acá se dicen
 * por lo que significan para el aprendiz.
 */
export function EstadoSelect({
	id,
	value,
	onChange,
	onBlur,
}: Omit<CampoProps, "onChange"> & {
	onChange: (value: "Abierto" | "Cerrado") => void;
}) {
	return (
		<Select
			value={value}
			onValueChange={(v) => onChange(v as "Abierto" | "Cerrado")}
		>
			<SelectTrigger id={id} onBlur={onBlur}>
				<SelectValue placeholder="Elige el estado" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="Abierto">
					🟢 Publicado · los aprendices lo ven
				</SelectItem>
				<SelectItem value="Cerrado">📝 Borrador · todavía no lo ven</SelectItem>
			</SelectContent>
		</Select>
	);
}

/**
 * Los grupos de la organización. Elegir uno es lo que le da el curso a la
 * gente: al guardar se crea la asignación grupo↔curso. (El campo de texto
 * "grupo" que había antes no asignaba nada.)
 */
export function GrupoSelect({ id, value, onChange, onBlur }: CampoProps) {
	const { data: grupos = [], isLoading } = useAllGroups();
	return (
		<Select value={value} onValueChange={onChange} disabled={isLoading}>
			<SelectTrigger id={id} onBlur={onBlur}>
				<SelectValue
					placeholder={isLoading ? "Cargando grupos..." : "Elige un grupo"}
				/>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={SIN_GRUPO}>Sin grupo por ahora</SelectItem>
				{grupos.map((g) => (
					<SelectItem key={g.id} value={g.id}>
						{g.name}
						{g.users?.length ? ` · ${g.users.length} personas` : ""}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

/**
 * Los grupos a los que se asigna el curso: uno, varios o ninguno. Asignar es
 * lo que le da el curso a la gente (relación grupo↔curso). Con `cursoId`, los
 * grupos que ya lo tienen salen marcados y bloqueados: quitárselo a un grupo
 * se hace desde Grupos.
 */
export function GruposMultiSelect({
	id,
	value,
	onChange,
	onBlur,
	cursoId,
}: {
	id: string;
	value: string[];
	onChange: (value: string[]) => void;
	onBlur?: () => void;
	cursoId?: string;
}) {
	const { data: grupos = [], isLoading } = useAllGroups();
	const yaAsignados = new Set(
		cursoId
			? grupos
					.filter((g) =>
						((g as { courses?: { id: string }[] }).courses ?? []).some(
							(c) => c.id === cursoId,
						),
					)
					.map((g) => g.id)
			: [],
	);
	const toggle = (gid: string) =>
		onChange(
			value.includes(gid) ? value.filter((v) => v !== gid) : [...value, gid],
		);
	const nuevos = value.length;
	const texto = isLoading
		? "Cargando grupos..."
		: nuevos > 0
			? `${nuevos} ${nuevos === 1 ? "grupo seleccionado" : "grupos seleccionados"}`
			: yaAsignados.size > 0
				? `Asignado a ${yaAsignados.size} ${yaAsignados.size === 1 ? "grupo" : "grupos"} · agregar más`
				: "Elige uno o varios grupos";
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					role="combobox"
					className="justify-between font-normal"
					onBlur={onBlur}
					disabled={isLoading}
				>
					<span className="truncate">{texto}</span>
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-(--radix-popover-trigger-width) p-0"
				align="start"
			>
				<Command>
					<CommandInput placeholder="Buscar grupo..." />
					<CommandList>
						<CommandEmpty>No hay grupos con ese nombre.</CommandEmpty>
						<CommandGroup>
							{grupos.map((g) => {
								const asignado = yaAsignados.has(g.id);
								const marcado = asignado || value.includes(g.id);
								return (
									<CommandItem
										key={g.id}
										value={g.id}
										keywords={[g.name]}
										disabled={asignado}
										onSelect={() => !asignado && toggle(g.id)}
									>
										<Check
											className={cn(
												"mr-2 size-4",
												marcado ? "opacity-100" : "opacity-0",
											)}
										/>
										<span className="truncate">{g.name}</span>
										<span className="ml-auto pl-2 text-muted-foreground text-xs">
											{asignado
												? "ya asignado"
												: g.users?.length
													? `${g.users.length} personas`
													: ""}
										</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

/**
 * Quién dicta el curso: instructores y administradores activos de la
 * organización, que es lo que acepta el backend. Si la lista de personas no
 * se puede cargar, queda un campo de correo para no bloquear el formulario.
 */
export function InstructorSelect({ id, value, onChange, onBlur }: CampoProps) {
	const { data: usuarios, isLoading, isError } = useAllUsers();
	const posibles = (usuarios ?? []).filter(
		(u) => ["instructor", "admin"].includes(u.role) && u.status !== "Inactive",
	);

	if (isError || (!isLoading && posibles.length === 0)) {
		return (
			<Input
				id={id}
				type="email"
				placeholder="instructor@empresa.com"
				value={value}
				onBlur={onBlur}
				onChange={(e) => onChange(e.target.value)}
			/>
		);
	}

	// Si el curso tiene un instructor que ya no está en la lista (borrado o
	// de antes de validar), se muestra igual para no perder el dato.
	const desconocido = value && !posibles.some((u) => u.email === value);

	return (
		<Select value={value} onValueChange={onChange} disabled={isLoading}>
			<SelectTrigger id={id} onBlur={onBlur}>
				<SelectValue
					placeholder={
						isLoading ? "Cargando personas..." : "Elige quién lo dicta"
					}
				/>
			</SelectTrigger>
			<SelectContent>
				{desconocido && (
					<SelectItem value={value}>
						⚠️ {value} (no está en la organización)
					</SelectItem>
				)}
				{posibles.map((u) => (
					<SelectItem key={u.id} value={u.email}>
						{u.firstname} {u.lastname} ·{" "}
						{u.role === "admin" ? "Admin" : "Instructor"}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
