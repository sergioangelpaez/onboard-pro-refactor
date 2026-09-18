import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query";
import { type CreateCourseFormInput, createCourseSchema } from "@/lib/schemas/courses"

const defaultValues: CreateCourseFormInput = {
    name: "",
    description: "",
    userIds: [],
  };

export default function CreateUserFormDialog(){
  const form = useForm({
    defaultValues,
    validators: {
      onMount: createCourseSchema,
      onChange: createCourseSchema,
    },
    onSubmit: ({value}) => createUserFormMutation.mutateAsync(value)
  })

  const createUserFormMutation = useMutation({
    mutationFn: async (values: CreateCourseFormInput) => {
      return await 
    }
  })    
  return (

  )
}