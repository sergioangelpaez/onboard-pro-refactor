import type { AnyFieldApi } from "@tanstack/react-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

export function PasswordField({
	field,
	label,
	autoComplete,
	labelAction,
	description,
}: {
	field: AnyFieldApi;
	label: string;
	autoComplete: string;
	labelAction?: React.ReactNode;
	/** Una ayuda corta debajo del campo. */
	description?: string;
}) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid}>
			<div className="flex items-end justify-between">
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
				{labelAction}
			</div>
			<Input
				id={field.name}
				type="password"
				autoComplete={autoComplete}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{description && !isInvalid && (
				<FieldDescription>{description}</FieldDescription>
			)}
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
