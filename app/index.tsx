import { Redirect } from "expo-router";
import { useSession } from "@/components/SessionContext";

export default function Index() {
  const { status } = useSession();

  // "loading" = the launch-time refresh (SessionContext) hasn't resolved yet — render nothing
  // rather than guessing, so a returning learner isn't flashed the welcome screen first.
  if (status === "loading") return null;

  return <Redirect href={status === "signedIn" ? "/home" : "/welcome"} />;
}
