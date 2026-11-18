import { createFileRoute } from "@tanstack/react-router";
import { BandejaEntregas } from "#/components/admin/entregas/bandeja-entregas";

export const Route = createFileRoute("/instructor/(entregas)/entregas")({
	component: BandejaEntregas,
});
