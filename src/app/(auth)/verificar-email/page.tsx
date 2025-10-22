"use client";

import { useSearchParams } from "next/navigation";
import VerifyEmailMessage from "@/components/Auth/VerifyEmailMessage";

export default function VerificarEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "seu@email.com";

  return <VerifyEmailMessage email={email} />;
}

