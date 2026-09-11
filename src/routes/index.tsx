import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
	beforeLoad: ({ context }) => {
		if (!context.user) throw redirect({ to: "/auth" });
	},
});

function Home() {
	return null;
}
