import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useDeleteActivity } from "#/hooks/activities/use-delete-activity";
import type { Activity } from "#/lib/schemas/activities";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

interface ActivityDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	activity: Activity;
}

export function ActivityDeleteDialog({
	open,
	onOpenChange,
	activity,
}: ActivityDeleteDialogProps) {
	const deleteActivity = useDeleteActivity();

	function handleDelete() {
		deleteActivity.mutate(
			{ id: activity.id },
			{
				onSuccess: () => {
					toast.success("Actividad eliminada correctamente");
					onOpenChange(false);
				},
				onError: (e: Error) => {
					toast.error("No se pudo eliminar la actividad", {
						description: e.message,
					});
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eliminar actividad</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que quieres eliminar la actividad{" "}
						<strong>{activity.title}</strong>? Esta acción no se puede deshacer
						y también se eliminará su archivo adjunto.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={deleteActivity.isPending}
					>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteActivity.isPending}
					>
						{deleteActivity.isPending && (
							<LoaderCircle className="animate-spin" />
						)}
						Eliminar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
