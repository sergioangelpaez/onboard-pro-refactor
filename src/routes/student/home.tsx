import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/student/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/student/home"!</div>
}
