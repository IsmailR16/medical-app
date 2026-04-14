import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";

export default async function NavbarAuth() {
  let isSignedIn = false;
  try {
    const { userId } = await auth();
    isSignedIn = !!userId;
  } catch {
    // auth() fails when middleware doesn't run on this route (public pages)
  }
  return <Navbar isSignedIn={isSignedIn} />;
}
