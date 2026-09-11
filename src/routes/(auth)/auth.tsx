import { createFileRoute, redirect } from "@tanstack/react-router";
import backGroundImage from "@/assets/universidad-central.webp";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/(auth)/auth")({
	component: LoginComponent,
	beforeLoad: ({ context }) => {
		if (context.user) throw redirect({ to: "/home" });
	},
});

function LoginComponent() {
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
