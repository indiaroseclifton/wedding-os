export type CapStep = {
  id: string;
  title: string;
  body: string;
  where: "repo" | "mac" | "apple" | "later";
  done: boolean;
};

export const CAPACITOR_STEPS: CapStep[] = [
  {
    id: "shell",
    title: "Shell lives in the repo",
    body: "mobile/ is a Capacitor 7 project. App ID app.weddingos.desk. It opens the live desk — not a copy of the site.",
    where: "repo",
    done: true,
  },
  {
    id: "url",
    title: "Point at the live wedding",
    body: "The wrapper loads wedding-os-taupe.vercel.app. Every Vercel deploy is the next TestFlight build. No second codebase.",
    where: "repo",
    done: true,
  },
  {
    id: "splash",
    title: "Ivory splash, moss-free chrome",
    body: "Launch screen and status bar match the paper desk. Fallback page if the network is down.",
    where: "repo",
    done: true,
  },
  {
    id: "xcode",
    title: "Install Xcode on your Mac",
    body: "App Store → Xcode. Open it once so the tools finish installing. This is the only way an iPhone build exists.",
    where: "mac",
    done: false,
  },
  {
    id: "npm",
    title: "Add iOS and Android projects",
    body: "In Terminal, from the wedding-os folder: cd mobile, npm install, then npx cap add ios and npx cap add android. Once per machine.",
    where: "mac",
    done: false,
  },
  {
    id: "icon",
    title: "Drop the W icon into Xcode",
    body: "Use web/public/icons/icon-512.png as the App Icon in Assets. Same mark as the home-screen PWA.",
    where: "mac",
    done: false,
  },
  {
    id: "run",
    title: "Run it on your iPhone",
    body: "npx cap open ios. Plug the phone in. Pick your Team under Signing. Press Play. You should land on login, then the desk.",
    where: "mac",
    done: false,
  },
  {
    id: "team",
    title: "Apple Developer team",
    body: "Personal team works for your phone. Organization account is required before TestFlight or the App Store.",
    where: "apple",
    done: false,
  },
  {
    id: "camera",
    title: "Camera plugin → moodboard",
    body: "Add @capacitor/camera when we want a couple to shoot a tablescape and pin it. Not needed to open the desk.",
    where: "later",
    done: false,
  },
  {
    id: "push",
    title: "Push plugin last",
    body: "Capacitor Push + a small server job. After the wrapper is boring and reliable.",
    where: "later",
    done: false,
  },
];
