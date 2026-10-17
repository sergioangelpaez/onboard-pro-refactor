import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useDeleteTenant } from "#/hooks/tenants/use-delete-tenant";
import type { Tenant } from "#/lib/schemas/tenants";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";

interface TenantDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Tenant;
}

export function TenantDeleteDialog({
	open,
	onOpenChange,
	group,
}: TenantDeleteDialogProps) {
	const deleteTenant = useDeleteTenant();

	function handleDelete() {
		deleteTenant.mutate(
			{ id: group.id },
			{
				onSuccess: () => {
					toast.success("Organización eliminada correctamente");
					onOpenChange(false);
				},
				onError: (e: Error) => {
					toast.error("No se pudo eliminar la organización", {
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
					<DialogTitle>Eliminar Organización</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que quieres eliminar la organización {group.name}?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteTenant.isPending}
					>
						{deleteTenant.isPending && (
							<LoaderCircle className="animate-spin" />
						)}
						Eliminar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
