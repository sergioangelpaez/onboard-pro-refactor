import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useDeleteGroup } from "#/hooks/groups/use-delete-group";
import type { Group } from "@/lib/schemas/groups";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";

interface GroupDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group;
}

export function GroupDeleteDialog({
	open,
	onOpenChange,
	group,
}: GroupDeleteDialogProps) {
	const deleteGroup = useDeleteGroup();

	function handleDelete() {
		deleteGroup.mutate(
			{ id: group.id },
			{
				onSuccess: () => {
					toast.success("Grupo eliminado correctamente");
					onOpenChange(false);
				},
				onError: (e: Error) => {
					toast.error("No se pudo eliminar el grupo", {
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
					<DialogTitle>Eliminar Grupo</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que quieres eliminar el grupo {group.name}?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteGroup.isPending}
					>
						{deleteGroup.isPending && <LoaderCircle className="animate-spin" />}
						Eliminar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
