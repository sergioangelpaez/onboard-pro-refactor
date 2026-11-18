import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Building2,
	KeyRound,
	LoaderCircle,
	Mail,
	Medal,
	Pencil,
	Phone,
	Trophy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ChangePasswordDialogForm } from "#/components/auth/change-password-dialog-form";
import { UserGroupsCard } from "#/components/profile/user-groups-card";
import { MisEntregasCard } from "#/components/student/mis-entregas-card";
import { UltimasAcreditaciones } from "#/components/student/ultimas-acreditaciones";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { useMyProgress } from "#/hooks/gamification/use-my-progress";
import { useMyGroups } from "#/hooks/groups/use-my-groups";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import type { User } from "#/lib/schemas/users";
import { authService } from "#/lib/services/auth";
import { queryKeys } from "#/lib/utils/query-keys";

export const Route = createFileRoute("/student/profile")({
	component: PerfilRoute,
});

/**
 * El perfil del aprendiz: sus datos, la seguridad de su cuenta, sus grupos,
 * de dónde salió su XP y cómo van sus entregas. Antes "Perfil" en el menú lo mandaba al inicio
 * porque esta página no existía.
 */
function PerfilRoute() {
	const { user } = useCurrentUser();
	const { data: progreso } = useMyProgress();
	const grupos = useMyGroups();
	const [editando, setEditando] = useState(false);
	const [cambiandoClave, setCambiandoClave] = useState(false);

	if (!user) return null;
	const iniciales =
		`${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase();

	return (
		<div className="app-container space-y-6">
			<section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 via-primary/5 to-background p-6">
				<div
					aria-hidden
					className="-right-16 -top-16 absolute size-56 rounded-full bg-primary/20 blur-3xl"
				/>
				<div className="relative flex flex-wrap items-center gap-5">
					<Avatar className="size-20 rounded-2xl ring-4 ring-background">
						<AvatarFallback className="rounded-2xl bg-primary text-2xl text-primary-foreground">
							{iniciales || "?"}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<h1 className="font-semibold text-2xl">
							{user.firstname} {user.lastname}
						</h1>
						<p className="text-muted-foreground">
							Aprendiz{user.tenantName ? ` · ${user.tenantName}` : ""}
						</p>
						{progreso && (
							<p className="mt-1 text-sm">
								Nivel <span className="font-semibold">{progreso.nivel}</span> ·{" "}
								<span className="font-semibold tabular-nums">
									{progreso.xp}
								</span>{" "}
								XP
							</p>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" asChild>
							<Link to="/student/logros">
								<Medal />
								Mis logros
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link to="/student/ranking">
								<Trophy />
								Ranking
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-2">
						<CardTitle className="text-base">Mis datos</CardTitle>
						<Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
							<Pencil />
							Editar
						</Button>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<Dato
							icono={<Mail className="size-4" />}
							etiqueta="Correo"
							valor={user.email}
						/>
						<Dato
							icono={<Phone className="size-4" />}
							etiqueta="Teléfono"
							valor={user.phonumber || "Sin cargar"}
						/>
						<Dato
							icono={<Building2 className="size-4" />}
							etiqueta="Organización"
							valor={user.tenantName ?? "—"}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Seguridad</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-muted-foreground text-sm">
							Para cambiar tu contraseña necesitas la actual. Si la olvidaste,
							cierra sesión y usa "¿Olvidaste tu contraseña?".
						</p>
						<Button variant="outline" onClick={() => setCambiandoClave(true)}>
							<KeyRound />
							Cambiar contraseña
						</Button>
					</CardContent>
				</Card>

				<UserGroupsCard
					className="lg:col-span-2"
					groups={grupos.groups ?? []}
					isLoading={grupos.isLoading}
					isError={grupos.isError}
					refetch={grupos.refetch}
				/>

				<UltimasAcreditaciones />
				<MisEntregasCard />
			</div>

			<EditarDatos user={user} open={editando} onOpenChange={setEditando} />
			<ChangePasswordDialogForm
				open={cambiandoClave}
				onOpenChange={setCambiandoClave}
			/>
		</div>
	);
}

function Dato({
	icono,
	etiqueta,
	valor,
}: {
	icono: React.ReactNode;
	etiqueta: string;
	valor: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
				{icono}
			</span>
			<div className="min-w-0">
				<p className="text-muted-foreground text-xs">{etiqueta}</p>
				<p className="truncate">{valor}</p>
			</div>
		</div>
	);
}

/** Nombre, apellido y teléfono. El correo no se edita: identifica la cuenta. */
function EditarDatos({
	user,
	open,
	onOpenChange,
}: {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [nombre, setNombre] = useState(user.firstname ?? "");
	const [apellido, setApellido] = useState(user.lastname ?? "");
	const [telefono, setTelefono] = useState(user.phonumber ?? "");
	const [guardando, setGuardando] = useState(false);

	async function guardar(e: React.FormEvent) {
		e.preventDefault();
		if (!nombre.trim()) {
			toast.error("El nombre no puede quedar vacío.");
			return;
		}
		setGuardando(true);
		try {
			await authService.updateMe({
				firstname: nombre.trim(),
				lastname: apellido.trim(),
				phonumber: telefono.trim(),
			});
			toast.success("Datos actualizados");
			await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
			onOpenChange(false);
		} catch (error) {
			toast.error("No se pudieron guardar tus datos", {
				description: (error as Error).message,
			});
		} finally {
			setGuardando(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Editar mis datos</DialogTitle>
					<DialogDescription>
						El correo no se puede cambiar: identifica tu cuenta.
					</DialogDescription>
				</DialogHeader>
				<form id="editar-mis-datos" onSubmit={guardar} className="grid gap-4">
					<div className="grid gap-1.5">
						<Label htmlFor="mi-nombre">Nombre</Label>
						<Input
							id="mi-nombre"
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
						/>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="mi-apellido">Apellido</Label>
						<Input
							id="mi-apellido"
							value={apellido}
							onChange={(e) => setApellido(e.target.value)}
						/>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="mi-telefono">Teléfono</Label>
						<Input
							id="mi-telefono"
							type="tel"
							value={telefono}
							onChange={(e) => setTelefono(e.target.value)}
						/>
					</div>
				</form>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={guardando}
					>
						Cancelar
					</Button>
					<Button type="submit" form="editar-mis-datos" disabled={guardando}>
						{guardando && <LoaderCircle className="animate-spin" />}
						Guardar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
