import { useState } from "react";
import { Redirect } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";

export default function Index() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <LoadingScreen onComplete={() => setReady(true)} />;
  }

  return <Redirect href="/welcome" />;
}
