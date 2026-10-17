import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/home")({
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<div className="app-container">
			<h1>Bienvenido al Home</h1>
		</div>
	);
}
