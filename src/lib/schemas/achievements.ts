import { z } from "zod";

const asRecord = (value: unknown): Record<string, unknown> | null => {
	if (typeof value !== "object" || value === null) return null;
	return value as Record<string, unknown>;
};

const asString = (value: unknown): string => {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	return "";
};

const resolveValue = (
	source: Record<string, unknown>,
	keys: string[],
): unknown => {
	for (const key of keys) {
		if (key in source) return source[key];
	}
	return undefined;
};

const normalizeCategories = (value: unknown): string[] => {
	if (!Array.isArray(value)) return [];

	const categories = value
		.map((entry) => {
			if (typeof entry === "string") return entry;

			const record = asRecord(entry);
			if (!record) return "";

			return asString(resolveValue(record, ["nombre", "name", "value", "id"]));
		})
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);

	return [...new Set(categories)];
};

const normalizeConditions = (value: unknown): AchievementConditionOption[] => {
	if (!Array.isArray(value)) return [];

	const conditions = value
		.map((entry): AchievementConditionOption | null => {
			if (typeof entry === "string") {
				const tipoCondicion = entry.trim();
				if (!tipoCondicion) return null;
				return { tipoCondicion, unidad: "", ejemplo: "" };
			}

			const record = asRecord(entry);
			if (!record) return null;

			const tipoCondicion = asString(
				resolveValue(record, ["tipoCondicion", "tipo", "type", "value", "id"]),
			).trim();

			if (!tipoCondicion) return null;

			const unidad = asString(resolveValue(record, ["unidad", "unit"])).trim();
			const ejemplo = asString(
				resolveValue(record, ["ejemplo", "example"]),
			).trim();

			return { tipoCondicion, unidad, ejemplo };
		})
		.filter((entry): entry is AchievementConditionOption => entry !== null);

	const unique = new Map<string, AchievementConditionOption>();
	for (const condition of conditions) {
		if (!unique.has(condition.tipoCondicion)) unique.set(condition.tipoCondicion, condition);
	}

	return [...unique.values()];
};

export const createAchievementSchema = z.object({
	nombre: z.string().min(1, "El nombre es obligatorio").max(255),
	descripcion: z.string().min(1, "La descripción es obligatoria").max(1000),
	categoria: z.string().min(1, "Selecciona una categoría"),
	tipoCondicion: z.string().min(1, "Selecciona una condición"),
	meta: z.number().int().nonnegative("La meta no puede ser negativa"),
	xpRecompensa: z
		.number()
		.int()
		.nonnegative("La recompensa XP no puede ser negativa"),
	cursoId: z.string().min(1, "El curso es obligatorio"),
	generico: z.boolean(),
});

export const achievementConditionOptionSchema = z.object({
	tipoCondicion: z.string(),
	unidad: z.string(),
	ejemplo: z.string(),
});

export const achievementCreateOptionsSchema = z.object({
	categorias: z.array(z.string()),
	condiciones: z.array(achievementConditionOptionSchema),
});

export type CreateAchievementPayload = z.infer<typeof createAchievementSchema>;
export type AchievementConditionOption = z.infer<
	typeof achievementConditionOptionSchema
>;
export type AchievementCreateOptions = z.infer<
	typeof achievementCreateOptionsSchema
>;

export function normalizeAchievementCreateOptions(
	value: unknown,
): AchievementCreateOptions {
	const root = asRecord(value);
	const data = root ? (asRecord(root.data) ?? root) : null;

	if (!data) {
		return { categorias: [], condiciones: [] };
	}

	const categorias = normalizeCategories(
		resolveValue(data, ["categorias", "categories"]),
	);
	const condiciones = normalizeConditions(
		resolveValue(data, ["condiciones", "conditions", "tiposCondicion"]),
	);

	return achievementCreateOptionsSchema.parse({ categorias, condiciones });
}