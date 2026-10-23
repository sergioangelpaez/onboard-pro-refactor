import { useAllGroups } from "#/hooks/groups/use-all-groups";
import { useAllUsers } from "#/hooks/users/use-all-users";
import { Input } from "../../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";

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
