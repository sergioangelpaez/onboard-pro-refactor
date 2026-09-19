export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

export class UnauthorizedError extends Error {
	constructor(message = "Unauthorized") {
		super(message);
		this.name = "UnauthorizedError";
	}
}

export class InvalidCredentialsError extends Error {
	constructor(message = "Invalid credentials") {
		super(message);
		this.name = "InvalidCredentialsError";
	}
}

export class TooManyRequestsError extends Error {
	constructor(message = "Too many requests") {
		super(message);
		this.name = "TooManyRequestsError";
	}
}
