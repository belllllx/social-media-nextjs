"use client";

import { Button, HStack } from "@chakra-ui/react";
import { callApi } from "@/utils/helpers/call-api";
import { AuthSchema } from "@/utils/validations/auth";
import { toast } from "react-toastify";
import { useCallback, useState } from "react";
import { useAuthUserStore } from "@/providers/auth-user-store-provider";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { ICommonResponse } from "@/utils/types";

interface ResendOtpLinkProps {
  resendOtpUrl: "auth/forgot-password/resend-email" | "auth/register/resend-email"
}

export function ResendOtpLink({ resendOtpUrl }: ResendOtpLinkProps) {
  const { email, registerPayload } = useAuthUserStore((state) => state);

  const [isLoading, setIsLoading] = useState(false);

  const handleResendOtp = useCallback(async () => {
    try {
      setIsLoading(true);
      let res: Promise<ICommonResponse>;
      if (resendOtpUrl === "auth/forgot-password/resend-email") {
        res = callApi<AuthSchema>("post", resendOtpUrl, {
          email,
        });
      } else {
        if (!registerPayload) {
          return;
        }

        res = callApi("post", resendOtpUrl, undefined, {
          withCredentials: true,
        });
      }

      const result = await res;
      if (!result.success) {
        toast.error(formatToastMessages(result.message));
      } else {
        toast.success(formatToastMessages(result.message));
      }
    } catch (error) {
      toast.error("Failed to resend otp");
      console.error("Failed to resend otp", error);
    } finally {
      setIsLoading(false);
    }
  }, [email, registerPayload, resendOtpUrl]);

  return (
    <HStack fontWeight="normal" gapX="0">
      {"Don't"} have an otp? &nbsp;
      <Button
        onClick={handleResendOtp}
        disabled={isLoading}
        variant="plain"
        padding="0"
      >
        resend
      </Button>
    </HStack>
  );
}
