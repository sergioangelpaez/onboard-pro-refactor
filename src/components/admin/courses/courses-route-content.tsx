import { RefreshCw } from "lucide-react";
import type { Course } from "#/lib/schemas/courses";
import { coursesColumns } from "#/components/admin/courses/courses-columns";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { DataTable } from "#/components/shared/table/data-table";
import { Button } from "#/components/ui/button";
import { CreateCourseDialogForm } from "./create-course-dialog-form";

interface CoursesRouteContentProps {
	data: Course[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

export function CoursesRouteContent({
	data,
	isLoading,
	error,
	refetch,
}: CoursesRouteContentProps) {
	if (isLoading) return <LoadingState message="Cargando cursos..." />;

	if (!data && error) {
		return (
			<ErrorState
				title="Error al cargar los cursos"
				description="Ocurrió un error al intentar cargar los cursos. Por favor, espera unos minutos e inténtalo de nuevo."
				content={
					<Button onClick={() => refetch()}>
						<RefreshCw />
						Recargar
					</Button>
				}
			/>
		);
	}

	if (data && data.length === 0) {
		return (
			<EmptyState
				title="Aún no hay cursos"
				description="Aún no hay cursos para mostrar aquí. Para empezar, crea un nuevo curso."
				content={<CreateCourseDialogForm />}
			/>
		);
	}

	return (
		<div>
			<DataTable
				tableKey="courses-table"
				columns={coursesColumns}
				data={data ?? []}
			/>
			<div className="spacer-md" />
		</div>
	);
}
