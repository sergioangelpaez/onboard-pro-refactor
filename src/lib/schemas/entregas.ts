import { z } from "zod";

/** Una entrega de un aprendiz, tal como la devuelve el backend. */
export const entregaSchema = z.object({
	// null en quien todavia no entrego: no hay entrega que revisar.
	id: z.string().nullable(),
	activityId: z.string().nullish(),
	userId: z.string().nullish(),
	archivo: z.string().nullish(),
	mime: z.string().nullish(),
	comentario: z.string().nullish(),
	// 'sin_entregar' lo arma el backend con la gente de los grupos del curso:
	// quien revisa necesita saber a quien le falta, no solo quien entrego.
	estado: z.enum(["entregado", "aprobada", "rehacer", "sin_entregar"]),
	entregadoAt: z.string().nullish(),
	feedback: z.string().nullish(),
	revisadoPor: z.string().nullish(),
	revisadoAt: z.string().nullish(),
	aprendiz: z
		.object({
			// null en quien todavia no entrego: no hay entrega que revisar.
	id: z.string().nullable(),
			firstname: z.string(),
			lastname: z.string(),
			email: z.string(),
		})
		.nullable(),
});

export type Entrega = z.infer<typeof entregaSchema>;
