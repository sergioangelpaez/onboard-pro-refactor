import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { coursesColumns } from "#/components/admin/courses/courses-columns";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { DataTable } from "#/components/shared/table/data-table";
import { Button } from "#/components/ui/button";
import { useAllCourses } from "#/hooks/courses/use-all-courses";

export const Route = createFileRoute("/instructor/(courses)/courses/")({
	component: CoursesRoute,
});

/**
 * Los cursos que dicta. El servidor ya los filtra por instructor, asi que aca
 * no hay que decidir nada: se listan y se entra a cualquiera.
 */
function CoursesRoute() {
	const navigate = useNavigate();
	const { data, isLoading, error, refetch } = useAllCourses();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Mis cursos</h1>
			</div>

			{isLoading && <LoadingState message="Cargando tus cursos..." />}

			{!data && error && (
				<ErrorState
					title="Error al cargar los cursos"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Recargar
						</Button>
					}
				/>
			)}

			{data && data.length === 0 && (
				<EmptyState
					title="Todavía no tenés cursos a cargo"
					description="Cuando te asignen uno va a aparecer acá."
				/>
			)}

			{data && data.length > 0 && (
				<DataTable
					tableKey="instructor-courses"
					columns={coursesColumns}
					data={data}
					onRowClick={(curso) =>
						navigate({
							to: "/instructor/courses/$courseId",
							params: { courseId: curso.id },
						})
					}
				/>
			)}
		</div>
	);
}
