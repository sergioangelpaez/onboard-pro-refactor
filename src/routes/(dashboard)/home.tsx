import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/home")({
	component: HomeComponent,
	beforeLoad: ({ context }) => {
		if (!context.user) throw redirect({ to: "/auth" });
	},
});

function HomeComponent() {
	return (
		<div>
			<h1 className="text-2xl font-bold">Bienvenido al Home</h1>
		</div>
	);
}
