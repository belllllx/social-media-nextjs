import { ResendOtpLink } from "./resend-otp-link";
import { VerifyOtpForm } from "./verify-otp-form";

export function VerifyOtp() {
  return (
    <>
      <VerifyOtpForm verifyOtpUrl="auth/forgot-password/verify-otp" />
      <ResendOtpLink resendOtpUrl="auth/forgot-password/resend-email" />
    </>
  );
}
