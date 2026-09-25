import { CloudAlert } from "lucide-react";
import { StateMessage, type StateMessageProps } from "./state-message";

type ErrorStateProps = Partial<Omit<StateMessageProps, "role">>;

export function ErrorState({
	title = "Ocurrió un error",
	description = "Hubo un problema al cargar los datos. Por favor, inténtalo de nuevo más tarde.",
	icon = <CloudAlert />,
	...props
}: ErrorStateProps) {
	return (
		<StateMessage
			title={title}
			description={description}
			icon={icon}
			role="alert"
			{...props}
		/>
	);
}
