import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokenStorage } from "#/lib/services/token-storage";

// El backend vuelve del login con Google/Microsoft a /?token=<jwt>,
// o a /?token=Fail&reason=<mensaje> si la autenticación falló.
export const Route = createFileRoute("/")({
	component: Home,
	ssr: false,
	beforeLoad: ({ location }) => {
		const { token, reason } = location.search as {
			token?: string;
			reason?: string;
		};

		if (token && token !== "Fail") {
			tokenStorage.set(token);
			throw redirect({ to: "/home" });
		}

		if (token === "Fail") {
			throw redirect({
				to: "/auth",
				search: { error: reason || "No se pudo iniciar sesión." },
			});
		}

		throw redirect({ to: "/auth" });
	},
});

function Home() {
	return null;
}
