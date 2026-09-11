import { createServerFn } from "@tanstack/react-start";
import { usersService } from ".";

export const createUserFn = createServerFn({ method: "POST" })
	.validator((data: CreateUserPayload) => data)
	.handler(async ({ data }) => {
		const response = await usersService.createUser(data).catch((error) => {
			console.error("Error creating user:", error);
			throw new Error("Failed to create user");
		});

		return response;
	});
