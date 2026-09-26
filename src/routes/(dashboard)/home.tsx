import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/home")({
	component: HomeRoute,
	beforeLoad: ({ context }) => {
		if (!context.user) throw redirect({ to: "/auth" });
	},
});

function HomeRoute() {
	return (
		<div className="app-container">
			<h1>Bienvenido al Home</h1>
		</div>
	);
}
