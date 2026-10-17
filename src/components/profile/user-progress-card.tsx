import type { User } from "#/lib/schemas/users";
import { ProfileField } from "../shared/fields/info-field";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

export function UserProgressCard({ user }: { user: User }) {
	if (!user) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Progreso</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<ProfileField label="Nivel" value={user.level} />
					<ProfileField label="XP" value={String(user.xp)} />
					<ProfileField label="Racha" value={String(user.streak)} />
					<ProfileField label="Promedio" value={String(user.average)} />
				</div>
				<Separator className="my-4" />
				<ProfileField label="Misiones" value={user.missions} />
			</CardContent>
		</Card>
	);
}
