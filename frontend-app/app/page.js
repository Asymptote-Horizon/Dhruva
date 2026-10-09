"use client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Dhruva3DIntro = dynamic(() => import("./components/Dhruva3DIntro"), { ssr: false });

export default function Home() {
  const router = useRouter();

  return (
    <main role="main" aria-label="Dhruva Celestial Spatial Intro">
      <Dhruva3DIntro
        onStartGame={() => router.push("/game")}
        onStartNormal={() => router.push("/explore")}
      />
    </main>
  );
}
