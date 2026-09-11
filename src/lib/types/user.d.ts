interface User {
	id: string;
	email: string;
	firstname: string;
	lastname: string;
	phonumber: string;
	role: string;
	status: string; //TODO: Hay un tipo para esto? "active" | "inactive" | "pending" | "suspended"?
	level: number;
	xp: number;
	streak: number;
	average: number;
	missions: string;
	tenantId: string | null;
}

interface CreateUserPayload {
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	role: string;
}
