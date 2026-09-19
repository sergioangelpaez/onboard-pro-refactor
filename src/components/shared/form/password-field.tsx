import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";

export function PasswordField({
	field,
	label,
	autoComplete,
}: {
	field: AnyFieldApi;
	label: string;
	autoComplete: string;
}) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				type="password"
				autoComplete={autoComplete}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
