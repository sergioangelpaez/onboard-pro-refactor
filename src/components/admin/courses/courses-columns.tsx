import type { Course } from "#/lib/schemas/courses";
import { createAppColumnHelper } from "@/lib/ui/data-table";
import { Badge } from "../../ui/badge";
import { CourseRowActions } from "./table/course-actions";

const columnHelper = createAppColumnHelper<Course>();

export const coursesColumns = columnHelper.columns([
	columnHelper.accessor("name", {
		header: "Nombre",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("instructor", {
		header: "Instructor",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("status", {
		header: "Estado",
		cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
	}),
	columnHelper.accessor("actividades", {
		header: "Actividades",
		cell: (info) => info.getValue().length,
	}),
	columnHelper.accessor("created_at", {
		header: "Creado",
		cell: (info) =>
			new Date(info.getValue()).toLocaleDateString("es-CO", {
				year: "numeric",
				month: "short",
				day: "numeric",
			}),
	}),
	columnHelper.display({
		id: "actions",
		header: "Acciones",
		cell: ({ row }) => <CourseRowActions row={row} />,
	}),
]);
