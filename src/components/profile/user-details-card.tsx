import type { User } from "#/lib/schemas/users";
import { ProfileField } from "../shared/fields/info-field";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";

export function UserDetailsCard({ user }: { user: User }) {
	const initials =
		`${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase();

	if (!user) return null;

	return (
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
	);
}
