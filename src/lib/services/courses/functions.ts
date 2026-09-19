import { createServerFn } from "@tanstack/react-start";
import { createCourseSchema } from "#/lib/schemas/courses";
import { coursesService } from ".";

export const createCourse = createServerFn({ method: "POST" })
	.validator(createCourseSchema)
	.handler(async ({ data }) => {
		try {
			return await coursesService.createCourse(data);
		} catch (error) {
			throw new Error(
				`Failed to create course: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	});
