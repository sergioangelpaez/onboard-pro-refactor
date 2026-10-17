import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useDeleteUser } from "#/hooks/users/use-delete-user";
import type { User } from "@/lib/schemas/users";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";

interface UserDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
}

export function UserDeleteDialog({
	open,
	onOpenChange,
	user,
}: UserDeleteDialogProps) {
	const deleteUser = useDeleteUser();

	function handleDelete() {
		deleteUser.mutate(
			{ id: user.id },
			{
				onSuccess: () => {
					toast.success("Usuario eliminado correctamente");
					onOpenChange(false);
				},
				onError: (e: Error) => {
					toast.error("No se pudo eliminar el usuario", {
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
					<DialogTitle>Eliminar Usuario</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que quieres eliminar a {user.firstname}{" "}
						{user.lastname}?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteUser.isPending}
					>
						{deleteUser.isPending && <LoaderCircle className="animate-spin" />}
						Eliminar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
