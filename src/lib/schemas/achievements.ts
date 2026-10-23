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

const normalizeCategories = (value: unknown): AchievementCategoryOption[] => {
	if (!Array.isArray(value)) return [];

	const categories = value
		.map((entry) => {
			if (typeof entry === "string") return { nombre: entry.trim(), icono: "" };

			const record = asRecord(entry);
			if (!record) return { nombre: "", icono: "" };

			return {
				nombre: asString(
					resolveValue(record, ["nombre", "name", "value", "id"]),
				).trim(),
				icono: asString(resolveValue(record, ["icono", "icon"])).trim(),
			};
		})
		.filter((entry) => entry.nombre.length > 0);

	const unicas = new Map(categories.map((c) => [c.nombre, c]));
	return [...unicas.values()];
};

const normalizeConditions = (value: unknown): AchievementConditionOption[] => {
	if (!Array.isArray(value)) return [];

	const conditions = value
		.map((entry): AchievementConditionOption | null => {
			if (typeof entry === "string") {
				const tipoCondicion = entry.trim();
				if (!tipoCondicion) return null;
				return { tipoCondicion, unidad: "", ejemplo: "", categoria: "" };
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
			const categoria = asString(
				resolveValue(record, ["categoria", "category"]),
			).trim();

			return { tipoCondicion, unidad, ejemplo, categoria };
		})
		.filter((entry): entry is AchievementConditionOption => entry !== null);

	const unique = new Map<string, AchievementConditionOption>();
	for (const condition of conditions) {
		if (!unique.has(condition.tipoCondicion))
			unique.set(condition.tipoCondicion, condition);
	}

	return [...unique.values()];
};

/**
 * Valores especiales del selector de alcance. Cualquier otro valor es el id
 * de un curso.
 */
export const SIN_CURSO = "general"; // toda la organización
export const TODAS = "todas"; // todas las organizaciones (solo superadmin)

// La categoría no se elige: el backend la saca del tipo de condición (una
// racha siempre es "Constancia"). El curso es opcional: sin él, el logro vale
// para toda la organización.
export const createAchievementSchema = z.object({
	nombre: z.string().min(1, "El nombre es obligatorio").max(100),
	descripcion: z.string().max(1000),
	tipoCondicion: z.string().min(1, "Selecciona una condición"),
	meta: z.number().int().min(1, "La meta tiene que ser al menos 1"),
	xpRecompensa: z
		.number()
		.int()
		.nonnegative("La recompensa XP no puede ser negativa"),
	icono: z.string().max(100),
	/** El alcance: TODAS, SIN_CURSO o el id de un curso. */
	cursoId: z.string().min(1, "Elige el alcance"),
});

export const achievementConditionOptionSchema = z.object({
	tipoCondicion: z.string(),
	unidad: z.string(),
	ejemplo: z.string(),
	categoria: z.string(),
});

export const achievementCategoryOptionSchema = z.object({
	nombre: z.string(),
	icono: z.string(),
});

export const achievementCreateOptionsSchema = z.object({
	categorias: z.array(achievementCategoryOptionSchema),
	condiciones: z.array(achievementConditionOptionSchema),
	iconoGenerico: z.string(),
});

export type CreateAchievementPayload = z.infer<typeof createAchievementSchema>;
export type AchievementConditionOption = z.infer<
	typeof achievementConditionOptionSchema
>;
export type AchievementCategoryOption = z.infer<
	typeof achievementCategoryOptionSchema
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
		return { categorias: [], condiciones: [], iconoGenerico: "🏅" };
	}

	const categorias = normalizeCategories(
		resolveValue(data, ["categorias", "categories"]),
	);
	const condiciones = normalizeConditions(
		resolveValue(data, ["condiciones", "conditions", "tiposCondicion"]),
	);

	const iconoGenerico =
		asString(resolveValue(data, ["iconoGenerico"])).trim() || "🏅";

	return achievementCreateOptionsSchema.parse({
		categorias,
		condiciones,
		iconoGenerico,
	});
}

/** "actividades_completadas" -> "Actividades completadas". */
export function etiquetaCondicion(tipo: string) {
	const texto = tipo.replaceAll("_", " ");
	return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Lo que se le manda al backend, sin los campos vacíos y con el alcance
 * traducido:
 *
 *   TODAS       -> generico: true (vale para todas las organizaciones)
 *   SIN_CURSO   -> sin curso (vale para toda la organización)
 *   un curso    -> cursoId
 *
 * `tenantId` solo lo pasa el superadmin, para crear en la organización que
 * eligió en el menú. Para el resto el backend usa la del token y lo ignora.
 */
export function payloadDeLogro(
	v: CreateAchievementPayload,
	tenantId: string | null = null,
) {
	const generico = v.cursoId === TODAS;
	return {
		nombre: v.nombre.trim(),
		...(v.descripcion.trim() ? { descripcion: v.descripcion.trim() } : {}),
		tipoCondicion: v.tipoCondicion,
		meta: v.meta,
		xpRecompensa: v.xpRecompensa,
		...(v.icono.trim() ? { icono: v.icono.trim() } : {}),
		...(generico ? { generico: true } : {}),
		...(!generico && v.cursoId !== SIN_CURSO ? { cursoId: v.cursoId } : {}),
		...(!generico && tenantId ? { tenantId } : {}),
	};
}
