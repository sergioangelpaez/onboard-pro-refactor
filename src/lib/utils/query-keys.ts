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
		byId: (id: string) => ["courses", id],
		sections: (id: string) => ["courses", id, "sections"],
	},
	groups: {
		all: ["groups", "all"],
		create: ["groups", "create"],
		byId: (id: string) => ["groups", id],
	},
	entregas: {
		byActivity: (activityId: string) => ["entregas", activityId],
	},
	gamification: {
		courseRanking: (courseId: string) => ["gamification", courseId, "ranking"],
	},
	activities: {
		all: ["activities", "all"],
		materials: (activityId: string) => ["activities", activityId, "materials"],
	},
};
