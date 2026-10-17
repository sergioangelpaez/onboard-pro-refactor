import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ActivitiesRouteContent } from "#/components/activities/activities-route-content";
import { ActivityFormSheet } from "#/components/activities/activity-form";
import { useAllActivities } from "#/hooks/activities/use-all-activities";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/(activities)/activities")({
	component: RouteComponent,
});

function RouteComponent() {
	const [open, setOpen] = useState(false);
	const { data, isLoading, error, refetch } = useAllActivities();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Actividades</h1>
				<Button onClick={() => setOpen(true)}>
					<Plus />
					Crear actividad
				</Button>
			</div>

			<ActivitiesRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				onCreate={() => setOpen(true)}
			/>

			<ActivityFormSheet open={open} onOpenChange={setOpen} />
		</div>
	);
}
