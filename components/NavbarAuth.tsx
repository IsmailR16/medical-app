import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";

export default async function NavbarAuth() {
  const { userId } = await auth();
  return <Navbar isSignedIn={!!userId} />;
}
