import { createFileRoute } from "@tanstack/react-router";
import { CreateCourseForm } from "#/components/courses/create-course-form";

export const Route = createFileRoute("/(dashboard)/(courses)/courses")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Cursos</h1>
				<CreateCourseForm />
			</div>
		</div>
	);
}
