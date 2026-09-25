import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
	message?: string;
}

export function LoadingState({ message = "Cargando..." }: LoadingStateProps) {
	return (
		<div className="state-container">
			<LoaderCircle className="animate-spin w-4 h-4" />
			<p>{message}</p>
		</div>
	);
}
