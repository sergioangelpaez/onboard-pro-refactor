import { createFileRoute } from "@tanstack/react-router";
import { CreateAchievementDialogForm } from "#/components/admin/achievements/create-achievement-dialog-form";
import { EmptyState } from "#/components/shared/states/empty-state";

export const Route = createFileRoute("/admin/(achievements)/logros")({
	component: LogrosRoute,
});

function LogrosRoute() {
	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Logros</h1>
				<CreateAchievementDialogForm />
			</div>

			<EmptyState
				title="Crea el primer logro"
				description="Usa el botón 'Crear logro' para registrar un nuevo logro de gamificación."
			/>
		</div>
	);
}