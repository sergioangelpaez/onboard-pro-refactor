import type { Activity } from "#/lib/schemas/activities";
import { createAppColumnHelper } from "@/lib/ui/data-table";
import { ActivityRowActions } from "./activity-actions";

const columnHelper = createAppColumnHelper<Activity>();

export const activitiesColumns = columnHelper.columns([
	columnHelper.accessor((activity) => `${activity.id}`, {
		id: "id",
		header: "ID",
		cell: (info) => info.getValue(),
		sortFn: "alphanumeric",
	}),
	columnHelper.accessor("name", {
		header: "Nombre",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("type", {
		header: "Tipo",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("title", {
		header: "Título",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("description", {
		header: "Descripción",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("adjunto", {
		header: "Adjunto",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("deliverable", {
		header: "Entregable",
		cell: (info) => (info.getValue() ? "Sí" : "No"),
	}),
	columnHelper.accessor("created_at", {
		header: "Creado",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("xp", {
		header: "XP",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("sectionName", {
		header: "Sección",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("courseName", {
		header: "Curso",
		cell: (info) => info.getValue(),
	}),
	columnHelper.display({
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => <ActivityRowActions row={row} />,
	}),
]);
