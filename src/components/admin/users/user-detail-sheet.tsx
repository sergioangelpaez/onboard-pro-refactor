import {
	Building2,
	CalendarClock,
	Flame,
	LibraryBig,
	Mail,
	Pencil,
	Phone,
	Sparkles,
	Trash,
	Trophy,
	UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { Skeleton } from "#/components/ui/skeleton";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import { useAllGroups } from "#/hooks/groups/use-all-groups";
import { useSoloLectura } from "#/hooks/users/use-solo-lectura";
import type { User } from "#/lib/schemas/users";
import { haceCuantoDia } from "#/lib/utils/fechas";
import { ETIQUETA_ESTADO, etiquetaRol, varianteEstado } from "./etiquetas";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserFormSheet } from "./user-form";

/**
 * El detalle de una persona, al hacer clic en su fila.
 *
 * Lo que se muestra depende del rol: nivel, XP, racha y promedio son del
 * aprendiz (un instructor o un administrador no los acumula); del instructor
 * interesan los cursos que dicta. Los grupos aplican a todos. Todo sale de lo
 * que la pantalla ya tiene en caché (usuarios, grupos y cursos de la
 * organización): no hay una consulta por persona.
 *
 * Abajo van las mismas acciones del menú de la fila (editar, que incluye
 * activar o desactivar, y eliminar), con los mismos formularios. Al guardar
 * se recarga la lista y el panel muestra los datos nuevos; al eliminar, la
 * persona sale de la lista y el panel se cierra solo.
 */
export function UserDetailSheet({
	user,
	onOpenChange,
}: {
	user: User | null;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={!!user} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col gap-0 overflow-y-auto">
				{user && <Detalle user={user} />}
			</SheetContent>
		</Sheet>
	);
}

function Detalle({ user }: { user: User }) {
	const [editando, setEditando] = useState(false);
	const [eliminando, setEliminando] = useState(false);
	const soloLectura = useSoloLectura();
	const grupos = useAllGroups();
	const cursos = useAllCourses();
	const esAprendiz = user.role === "student";
	const esInstructor = user.role === "instructor";

	const susGrupos = (grupos.data ?? []).filter((g) =>
		g.users.some((u) => u.id === user.id),
	);
	const correo = user.email.toLowerCase();
	const aCargo = (cursos.data ?? []).filter(
		(c) => c.instructor?.toLowerCase() === correo && !c.archivado,
	);
	const conexion = haceCuantoDia(user.ultimaConexion);

	return (
		<>
			<SheetHeader>
				<SheetTitle>
					{user.firstname} {user.lastname}
				</SheetTitle>
				<SheetDescription className="flex flex-wrap items-center gap-2">
					<span>{etiquetaRol(user.role)}</span>
					<Badge variant={varianteEstado(user.status)}>
						{ETIQUETA_ESTADO[user.status]}
					</Badge>
				</SheetDescription>
			</SheetHeader>

			<div className="space-y-6 px-4 pb-6">
				<Seccion titulo="Contacto">
					<Fila icono={<Mail />} etiqueta="Correo" valor={user.email} />
					<Fila
						icono={<Phone />}
						etiqueta="Teléfono"
						valor={user.phonumber || "—"}
					/>
					{user.tenantName && (
						<Fila
							icono={<Building2 />}
							etiqueta="Organización"
							valor={user.tenantName}
						/>
					)}
					<Fila
						icono={<CalendarClock />}
						etiqueta="Última conexión"
						valor={
							conexion ? (
								<span className="first-letter:uppercase">{conexion}</span>
							) : (
								"Nunca"
							)
						}
					/>
				</Seccion>

				{esAprendiz && (
					<Seccion titulo="Progreso">
						<div className="grid grid-cols-2 gap-2">
							<Stat icono={<Trophy />} valor={user.level} etiqueta="nivel" />
							<Stat icono={<Sparkles />} valor={user.xp} etiqueta="XP" />
							<Stat
								icono={<Flame />}
								valor={user.streak}
								etiqueta={user.streak === 1 ? "día de racha" : "días de racha"}
								detalle={
									user.racha_maxima != null
										? `Mejor racha: ${user.racha_maxima}`
										: undefined
								}
							/>
						</div>
					</Seccion>
				)}

				{esInstructor && (
					<Seccion titulo="Cursos a cargo">
						{cursos.isLoading ? (
							<Skeleton className="h-10 rounded-lg" />
						) : aCargo.length === 0 ? (
							<Vacio>No tiene cursos a cargo.</Vacio>
						) : (
							<Lista
								icono={<LibraryBig />}
								items={aCargo.map((c) => ({ id: c.id, nombre: c.name }))}
							/>
						)}
					</Seccion>
				)}

				<Seccion titulo="Grupos">
					{grupos.isLoading ? (
						<Skeleton className="h-10 rounded-lg" />
					) : susGrupos.length === 0 ? (
						<Vacio>
							{esAprendiz
								? "No está en ningún grupo: no tiene cursos asignados."
								: "No está en ningún grupo."}
						</Vacio>
					) : (
						<Lista
							icono={<UsersRound />}
							items={susGrupos.map((g) => ({ id: g.id, nombre: g.name }))}
						/>
					)}
				</Seccion>
			</div>

			{/* El superadmin solo consulta: editar o borrar lo hace el admin. */}
			{!soloLectura && (
				<SheetFooter className="mt-auto flex-row justify-end gap-2 border-t">
					<Button variant="outline" onClick={() => setEliminando(true)}>
						<Trash />
						Eliminar
					</Button>
					<Button onClick={() => setEditando(true)}>
						<Pencil />
						Editar
					</Button>
				</SheetFooter>
			)}

			<UserFormSheet
				key={user.id}
				open={editando}
				onOpenChange={setEditando}
				user={user}
			/>
			<UserDeleteDialog
				open={eliminando}
				onOpenChange={setEliminando}
				user={user}
			/>
		</>
	);
}

function Seccion({
	titulo,
	children,
}: {
	titulo: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-2">
			<h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
				{titulo}
			</h3>
			{children}
		</section>
	);
}

function Fila({
	icono,
	etiqueta,
	valor,
}: {
	icono: React.ReactNode;
	etiqueta: string;
	valor: React.ReactNode;
}) {
	return (
		<div className="flex items-center gap-3 text-sm">
			<span className="text-muted-foreground [&>svg]:size-4">{icono}</span>
			<span className="w-28 shrink-0 text-muted-foreground">{etiqueta}</span>
			<span className="min-w-0 truncate">{valor}</span>
		</div>
	);
}

function Stat({
	icono,
	valor,
	etiqueta,
	detalle,
}: {
	icono: React.ReactNode;
	valor: number;
	etiqueta: string;
	detalle?: string;
}) {
	return (
		<div className="rounded-lg border bg-muted/40 p-3">
			<div className="flex items-center gap-2">
				<span className="text-primary [&>svg]:size-4">{icono}</span>
				<span className="font-semibold text-lg tabular-nums">
					{new Intl.NumberFormat("es").format(valor ?? 0)}
				</span>
			</div>
			<p className="text-muted-foreground text-xs">{etiqueta}</p>
			{detalle && <p className="text-muted-foreground text-xs">{detalle}</p>}
		</div>
	);
}

function Lista({
	icono,
	items,
}: {
	icono: React.ReactNode;
	items: { id: string; nombre: string }[];
}) {
	return (
		<ul className="space-y-1.5">
			{items.map((i) => (
				<li
					key={i.id}
					className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
				>
					<span className="text-muted-foreground [&>svg]:size-4">{icono}</span>
					<span className="truncate">{i.nombre}</span>
				</li>
			))}
		</ul>
	);
}

function Vacio({ children }: { children: React.ReactNode }) {
	return <p className="text-muted-foreground text-sm">{children}</p>;
}
