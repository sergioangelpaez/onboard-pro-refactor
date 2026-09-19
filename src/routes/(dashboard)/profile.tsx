import { createFileRoute } from "@tanstack/react-router";
import { ChangePasswordDialogForm } from "#/components/auth/change-password-dialog-form";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/(dashboard)/profile")({
	component: ProfileRoute,
});

function ProfileRoute() {
	const { user } = useCurrentUser();

	if (!user) return null;

	const initials =
		`${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase();

	return (
		<div className="app-container">
			<div className="flex w-full flex-col ">
				<div className="mb-4 flex items-center justify-between">
					<h1>Perfil</h1>
					<ChangePasswordDialogForm />
				</div>
				<Card>
					<CardHeader className="flex flex-row items-center gap-4">
						<Avatar className="h-16 w-16 rounded-lg">
							<AvatarFallback className="rounded-lg text-lg">
								{initials || "?"}
							</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className="text-xl">
								{user.firstname} {user.lastname}
							</CardTitle>
							<CardDescription>{user.email}</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<Separator />
						<div className="grid grid-cols-2 gap-4">
							<ProfileField label="Rol" value={user.role} />
							<ProfileField
								label="Estado"
								value={<Badge variant="outline">{user.status}</Badge>}
							/>
							<ProfileField label="Teléfono" value={user.phonumber || "—"} />
							<ProfileField
								label="Tenant"
								value={user.tenantId ? String(user.tenantId) : "—"}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Progreso</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<ProfileField label="Nivel" value={String(user.level)} />
							<ProfileField label="XP" value={String(user.xp)} />
							<ProfileField label="Racha" value={String(user.streak)} />
							<ProfileField label="Promedio" value={String(user.average)} />
						</div>
						<Separator className="my-4" />
						<ProfileField label="Misiones" value={user.missions} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function ProfileField({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-muted-foreground text-xs">{label}</span>
			<span className="text-sm font-medium">{value}</span>
		</div>
	);
}
