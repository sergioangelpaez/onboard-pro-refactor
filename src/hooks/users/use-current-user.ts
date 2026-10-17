import { useSuspenseQuery } from "@tanstack/react-query";
import { currentUserQueryOptions } from "#/lib/utils/auth/session";

export function useCurrentUser() {
	const { data } = useSuspenseQuery(currentUserQueryOptions);
	return { user: data };
}
