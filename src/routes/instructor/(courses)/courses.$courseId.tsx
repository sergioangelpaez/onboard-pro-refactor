import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { CourseSections } from "#/components/admin/courses/course-sections";
import { ActivityFormSheet } from "#/components/admin/activities/activity-form";
import { CreateSectionDialog } from "#/components/admin/courses/create-section-dialog";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import { useCourseSections } from "#/hooks/courses/use-course-sections";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { puedeEditarContenido } from "#/lib/utils/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/instructor/(courses)/courses/$courseId")(
	{ component: CourseDetailRoute },
);

/** "3 secciones · 7 actividades", sin pluralizar mal cuando hay una sola. */
function resumen(secciones: number, actividades: number) {
	return [
		`${secciones} ${secciones === 1 ? "sección" : "secciones"}`,
		`${actividades} ${actividades === 1 ? "actividad" : "actividades"}`,
	].join(" · ");
}

function CourseDetailRoute() {
	const { courseId } = Route.useParams();
	const { data: sections, isLoading, error, refetch } = useCourseSections(courseId);

	// El curso sale del listado, que ya está en cache: casi siempre se llega acá
	// haciendo clic en esa misma tabla.
	const { data: courses } = useAllCourses();
	const course = courses?.find((c) => c.id === courseId);

	const [crearAbierto, setCrearAbierto] = useState(false);
	const { user } = useCurrentUser();
	// Quien dicta el curso o lo administra es quien agrega contenido.
	const puedeEditar = puedeEditarContenido(user?.role);

	const total = (sections ?? []).reduce((n, s) => n + s.actividades.length, 0);

	return (
		<div className="app-container">
			<div className="mb-6 flex items-start gap-3">
				{/* La flecha va pegada al título y no en una fila propia: así no se
				    come una línea entera ni queda flotando centrada. */}
				<Button
					variant="ghost"
					size="icon"
					className="mt-1 shrink-0"
					aria-label="Volver a los cursos"
					asChild
				>
					<Link to="/instructor/courses">
						<ArrowLeft />
					</Link>
				</Button>

				<div className="min-w-0 flex-1">
					<h1>{course?.name ?? "Curso"}</h1>
					<p className="text-muted-foreground text-sm">
						{[course?.instructor, sections && resumen(sections.length, total)]
							.filter(Boolean)
							.join(" · ")}
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{course?.status && (
						<Badge variant={course.status === "Abierto" ? "default" : "outline"}>
							{course.status}
						</Badge>
					)}

					{puedeEditar && (
						<>
							<CreateSectionDialog courseId={courseId} />
							<Button onClick={() => setCrearAbierto(true)}>
								<Plus />
								Crear actividad
							</Button>
						</>
					)}
				</div>
			</div>

			{isLoading && <LoadingState message="Cargando el contenido del curso..." />}

			{error && (
				<ErrorState
					title="No se pudo cargar el curso"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			{sections && <CourseSections sections={sections} />}

			{/* El formulario es el de Sergio: ya acepta el curso por defecto, así
			    que no hacía falta uno aparte para esta pantalla. */}
			<ActivityFormSheet
				open={crearAbierto}
				onOpenChange={setCrearAbierto}
				defaultCourseId={courseId}
			/>
		</div>
	);
}
