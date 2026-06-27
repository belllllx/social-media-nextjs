import { ResendOtpLink } from "./resend-otp-link";
import { VerifyOtpForm } from "./verify-otp-form";

export function VerifyOtpRegister() {
  return (
    <>
      <VerifyOtpForm verifyOtpUrl="auth/register/verify-otp" />
      <ResendOtpLink resendOtpUrl="auth/register/resend-email" />
    </>
  );
}
