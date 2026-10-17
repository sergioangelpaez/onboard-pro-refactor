import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser, getHomeByRole } from "@/lib/utils/auth/session";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		const user = await getCurrentUser(context.queryClient);
		if (!user) throw redirect({ to: "/auth" });
		throw redirect({ to: getHomeByRole(user.role) });
	},
});
