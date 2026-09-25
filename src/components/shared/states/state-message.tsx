import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

export interface StateMessageProps {
	title: string;
	description?: string;
	icon: React.ReactNode;
	content?: React.ReactNode;
	role?: React.AriaRole;
}

export function StateMessage({
	title,
	description,
	icon,
	content,
	role,
}: StateMessageProps) {
	return (
		<div className="state-container" role={role}>
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">{icon}</EmptyMedia>
					<EmptyTitle>{title}</EmptyTitle>
					{description && <EmptyDescription>{description}</EmptyDescription>}
				</EmptyHeader>
				{content && <EmptyContent>{content}</EmptyContent>}
			</Empty>
		</div>
	);
}
