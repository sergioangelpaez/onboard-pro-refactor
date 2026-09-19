import { createFileRoute } from "@tanstack/react-router";
import { CreateCourseDialogForm } from "#/components/courses/create-course-dialog-form";

export const Route = createFileRoute("/(dashboard)/(courses)/courses")({
	component: CoursesRoute,
});

function CoursesRoute() {
	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Cursos</h1>
				<CreateCourseDialogForm />
			</div>
		</div>
	);
}
