import { createFileRoute } from "@tanstack/react-router";
import { CoursesRouteContent } from "#/components/courses/courses-route-content";
import { CreateCourseDialogForm } from "#/components/courses/create-course-dialog-form";
import { useAllCourses } from "#/hooks/courses/use-all-courses";

export const Route = createFileRoute("/(dashboard)/(courses)/courses")({
	component: CoursesRoute,
});

function CoursesRoute() {
	const { data, isLoading, error, refetch } = useAllCourses();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Cursos</h1>
				<CreateCourseDialogForm />
			</div>

			<CoursesRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
			/>
		</div>
	);
}
