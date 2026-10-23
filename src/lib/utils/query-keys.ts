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
	},
	groups: {
		all: ["groups", "all"],
		create: ["groups", "create"],
		mine: ["groups", "mine"],
	},
	entregas: {
		byActivity: (activityId: string) => ["entregas", activityId],
		mine: (activityId: string) => ["entregas", activityId, "mine"],
	},
	gamification: {
		courseRanking: (courseId: string) => ["gamification", courseId, "ranking"],
		me: ["gamification", "me"],
		pending: ["gamification", "pending"],
		ranking: ["gamification", "ranking"],
		niveles: (tenantId: string | null) => ["gamification", "niveles", tenantId],
	},
	exams: {
		byActivity: (activityId: string) => ["exams", activityId],
		attempts: (activityId: string) => ["exams", activityId, "attempts"],
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
