import { createFileRoute } from "@tanstack/react-router";
import { Check, LoaderCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCompleteActivity } from "#/hooks/activities/use-complete-activity";
import { useAllActivities } from "#/hooks/activities/use-all-activities";
import type { Activity } from "#/lib/schemas/activities";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/student/activities")({
	component: ActivitiesRoute,
});

function ActivitiesRoute() {
	const { data, isLoading, error, refetch } = useAllActivities();

	if (isLoading) {
		return (
			<ActivitiesPage>
				<p>Cargando actividades...</p>
			</ActivitiesPage>
		);
	}

	if (error) {
		return (
			<ActivitiesPage>
				<div className="space-y-3">
					<p>Ocurrió un error al cargar las actividades. Inténtalo de nuevo.</p>
					<Button onClick={() => refetch()}>
						<RefreshCw />
						Recargar
					</Button>
				</div>
			</ActivitiesPage>
		);
	}

	return (
		<ActivitiesPage>
			{data && data.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{data.map((activity) => (
						<ActivityCard key={activity.id} activity={activity} />
					))}
				</div>
			) : (
				<p className="text-muted-foreground">
					Aún no tienes actividades para realizar.
				</p>
			)}
		</ActivitiesPage>
	);
}

function ActivitiesPage({ children }: { children: React.ReactNode }) {
	return (
		<div className="app-container space-y-6">
			<div>
				<h1>Mis actividades</h1>
				<p className="text-muted-foreground">
					Completa tus actividades para avanzar en tu progreso.
				</p>
			</div>
			{children}
		</div>
	);
}

function ActivityCard({ activity }: { activity: Activity }) {
	const [completed, setCompleted] = useState(false);
	const completeActivity = useCompleteActivity();
	const isCompleting =
		completeActivity.isPending && completeActivity.variables === activity.id;

	function handleComplete() {
		completeActivity.mutate(activity.id, {
			onSuccess: () => {
				setCompleted(true);
				toast.success("Actividad completada correctamente");
			},
			onError: (completionError: Error) => {
				toast.error("No se pudo completar la actividad", {
					description: completionError.message,
				});
			},
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{activity.title}</CardTitle>
				<CardDescription>{activity.type}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 space-y-3">
				<p className="text-sm text-muted-foreground">{activity.description}</p>
				<p className="text-sm font-medium">{activity.xp} XP</p>
			</CardContent>
			<CardFooter>
				<Button
					className="w-full"
					variant={completed ? "secondary" : "default"}
					onClick={handleComplete}
					disabled={completed || completeActivity.isPending}
				>
					{isCompleting ? <LoaderCircle className="animate-spin" /> : <Check />}
					{completed ? "Completada" : "Marcar como completada"}
				</Button>
			</CardFooter>
		</Card>
	);
}
