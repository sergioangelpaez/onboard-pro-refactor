export const queryKeys = {
	auth: {
		login: ["auth", "login"],
		logout: ["auth", "logout"],
	},
	users: {
		me: ["user", "me"],
		all: ["user", "all"],
		create: ["user", "create"],
	},
	tenants: {
		all: ["tenants", "all"],
		create: ["tenants", "create"],
	},
	courses: {
		all: ["courses", "all"],
		create: ["courses", "create"],
		mine: ["courses", "mine"],
		participants: (courseId: string) => ["courses", courseId, "participants"],
	},
	groups: {
		all: ["groups", "all"],
		create: ["groups", "create"],
		mine: ["groups", "mine"],
	},
	entregas: {
		bandeja: ["entregas", "bandeja"],
		mias: ["entregas", "mias"],
		byActivity: (activityId: string) => ["entregas", activityId],
		mine: (activityId: string) => ["entregas", activityId, "mine"],
	},
	gamification: {
		courseRanking: (courseId: string) => ["gamification", courseId, "ranking"],
		me: ["gamification", "me"],
		pending: ["gamification", "pending"],
		ranking: ["gamification", "ranking"],
		movimientos: ["gamification", "me", "movimientos"],
	},
	dashboard: {
		resumen: (tenantId: string | null, dias: number) => [
			"dashboard",
			tenantId ?? "plataforma",
			dias,
		],
	},
	exams: {
		byActivity: (activityId: string) => ["exams", activityId],
		attempts: (activityId: string) => ["exams", activityId, "attempts"],
		misJuegos: ["exams", "mis-juegos"],
	},
	activities: {
		all: ["activities", "all"],
		materials: (activityId: string) => ["activities", activityId, "materials"],
	},
	achievements: {
		all: ["achievements", "all"],
		mine: ["achievements", "mine"],
		options: ["achievements", "options"],
		create: ["achievements", "create"],
	},
	sections: {
		all: ["sections", "all"],
		byCourse: (courseId: string) => ["sections", "byCourse", courseId],
	},
};
