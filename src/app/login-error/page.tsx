import { LoginError } from "@/components/login-error";
import { Suspense } from "react";

export default function LoginErrorPage() {
  return (
    <Suspense fallback={null}>
      <LoginError />
    </Suspense>
  );
}
