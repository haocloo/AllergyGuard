import { redirect } from "next/navigation";

export default function Page() {
  redirect("/auth");

  return <div>Hi this is main page</div>;
}
