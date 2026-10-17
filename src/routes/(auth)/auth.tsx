import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { authService } from "#/lib/services/auth";
import { InvalidCredentialsError } from "#/lib/services/errors";
import { tokenStorage } from "#/lib/services/token-storage";
import { queryKeys } from "#/lib/utils/query-keys";
import backGroundImage from "@/assets/universidad-central.webp";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/(auth)/auth")({
	component: LoginComponent,
	ssr: false,
	validateSearch: (search: Record<string, unknown>): { error?: string } => ({
		error: typeof search.error === "string" ? search.error : undefined,
	}),
	beforeLoad: async ({ context }) => {
		if (!tokenStorage.get()) return;

		try {
			await context.queryClient.ensureQueryData({
				queryKey: queryKeys.users.me,
				queryFn: authService.getMe,
				retry: false,
			});
		} catch (error) {
			if (error instanceof InvalidCredentialsError) return;
			throw error;
		}

		throw redirect({ to: "/home" });
	},
});

function LoginComponent() {
	const { error } = Route.useSearch();

	// Error devuelto por el backend al fallar el login con Google/Microsoft.
	useEffect(() => {
		if (error) toast.error(error, { id: "oauth-error" });
	}, [error]);

	return (
		<div className="relative flex h-screen w-screen items-center justify-around overflow-hidden">
			<img
				src={backGroundImage}
				alt=""
				className="absolute inset-0 -z-10 h-full w-full object-cover"
				fetchPriority="high"
			/>

			<div className="absolute inset-0 -z-10 bg-black/50" />

			<div>
				<p className="font-bold text-5xl text-white">OnBoard Pro</p>
				<p className="text-white">Accede a tu cuenta o crea una nueva.</p>
			</div>

			<LoginForm />
		</div>
	);
}
