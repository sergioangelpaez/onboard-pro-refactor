import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordForm } from "#/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(auth)/reset-password")({
	validateSearch: z.object({ token: z.string().optional() }),
	component: RouteComponent,
});

function RouteComponent() {
	const { token } = Route.useSearch();

	return token ? <ResetPasswordForm token={token} /> : <InvalidLink />;
}

function InvalidLink() {
	return (
		<Card className="w-full max-w-sm border-none shadow-2xl">
			<CardHeader>
				<CardTitle>Enlace no válido</CardTitle>
				<CardDescription>
					Este enlace no es válido o ya venció. Solicita uno nuevo desde el
					inicio de sesión.
				</CardDescription>
			</CardHeader>
			<CardFooter>
				<Button asChild className="w-full">
					<Link to="/auth">Volver a iniciar sesión</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
