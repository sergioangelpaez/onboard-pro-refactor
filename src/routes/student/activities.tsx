import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Esta pantalla listaba `GET /activities/get/all`: todas las actividades de la
 * empresa, sin filtrar por los cursos de la persona ni por lo que ya había
 * completado, y con "Marcar como completada" incluso en tareas y exámenes.
 *
 * Lo pendiente ahora está en el inicio y cada actividad se hace dentro de su
 * curso. Se deja la ruta para que los enlaces viejos no terminen en un 404.
 */
export const Route = createFileRoute("/student/activities")({
	beforeLoad: () => {
		throw redirect({ to: "/student/courses" });
	},
});
