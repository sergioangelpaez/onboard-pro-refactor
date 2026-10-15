import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ActivityFormSheet } from "#/components/activities/activity-form";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(dashboard)/(activities)/activities")({
	component: RouteComponent,
});

function RouteComponent() {
	const [open, setOpen] = useState(false);

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Actividades</h1>
				<Button onClick={() => setOpen(true)}>
					<Plus />
					Crear actividad
				</Button>
			</div>

			<ActivityFormSheet open={open} onOpenChange={setOpen} />
		</div>
	);
}
