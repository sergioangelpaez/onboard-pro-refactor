import { createFileRoute } from "@tanstack/react-router";
import { Archive, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { CoursesRouteContent } from "#/components/admin/courses/courses-route-content";
import { CreateCourseDialogForm } from "#/components/admin/courses/create-course-dialog-form";
import { Button } from "#/components/ui/button";
import { useAllCourses } from "#/hooks/courses/use-all-courses";

export const Route = createFileRoute("/admin/(courses)/courses")({
	component: CoursesRoute,
});

/**
 * El catálogo de cursos. Los archivados no aparecen acá: se ven aparte con
 * "Ver archivados", que es desde donde se desarchivan o se borran del todo.
 */
function CoursesRoute() {
	const [verArchivados, setVerArchivados] = useState(false);
	const { data, isLoading, error, refetch } = useAllCourses(
		verArchivados ? "solo" : undefined,
	);

	return (
		<div className="app-container">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<h1>{verArchivados ? "Cursos archivados" : "Cursos"}</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setVerArchivados((v) => !v)}>
						{verArchivados ? <ArrowLeft /> : <Archive />}
						{verArchivados ? "Volver al catálogo" : "Ver archivados"}
					</Button>
					{!verArchivados && <CreateCourseDialogForm />}
				</div>
			</div>

			{verArchivados && data && data.length === 0 ? (
				<p className="text-muted-foreground text-sm">
					No hay cursos archivados.
				</p>
			) : (
				<CoursesRouteContent
					data={data}
					isLoading={isLoading}
					error={error}
					refetch={refetch}
				/>
			)}
		</div>
	);
}
