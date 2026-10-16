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
	},
	groups: {
		all: ["groups", "all"],
		create: ["groups", "create"],
		mine: ["groups", "mine"],
	},
	activities: {
		all: ["activities", "all"],
	},
	sections: {
		all: ["sections", "all"],
		byCourse: (courseId: string) => ["sections", "byCourse", courseId],
	},
};
