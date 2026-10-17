import { Inbox } from "lucide-react";
import { StateMessage, type StateMessageProps } from "./state-message";

type EmptyStateProps = Partial<Omit<StateMessageProps, "role">>;

export function EmptyState({
	title = "No hay datos disponibles",
	description = "Aún no hay nada para mostrar aquí.",
	icon = <Inbox />,
	...props
}: EmptyStateProps) {
	return (
		<StateMessage
			title={title}
			description={description}
			icon={icon}
			{...props}
		/>
	);
}
