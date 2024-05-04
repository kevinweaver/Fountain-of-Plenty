"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "https://warpcast.com/~/channel/fountain";
  }, []);

  return null;
}
