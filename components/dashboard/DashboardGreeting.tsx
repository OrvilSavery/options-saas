"use client";

import { useEffect, useState } from "react";

export default function DashboardGreeting() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setText("Good morning.");
    else if (hour < 17) setText("Good afternoon.");
    else setText("Good evening.");
  }, []);

  return (
    <h1 className="text-[22px] font-bold tracking-tight text-slate-950">
      {text || " "}
    </h1>
  );
}
