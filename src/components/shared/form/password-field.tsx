import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";

export function PasswordField({
	field,
	label,
	autoComplete,
	labelAction,
}: {
	field: AnyFieldApi;
	label: string;
	autoComplete: string;
	labelAction?: React.ReactNode;
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
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
