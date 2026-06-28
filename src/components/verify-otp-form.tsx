"use client";

import { useActionStore } from "@/providers/action-store-provider";
import { createAuthUserStore } from "@/stores/auth-user-store";
import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { navigate } from "@/utils/helpers/router";
import { OtpBody } from "@/utils/types";
import { otpSchema, OtpSchema } from "@/utils/validations/auth";
import { Button, Field, Heading, PinInput, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface VerifyOtpFormProps {
  verifyOtpUrl: "auth/forgot-password/verify-otp" | "auth/register/verify-otp";
}

export function VerifyOtpForm({ verifyOtpUrl }: VerifyOtpFormProps) {
  const { clearDisabled } = useActionStore((state) => state);

  const authUserStore = createAuthUserStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
  });

  const handleVerifyOtp = useCallback(async (data: { otp: string[] }) => {
    try {
      const res = await callApi<OtpBody>(
        "post",
        verifyOtpUrl,
        {
          otp: data.otp.join(""),
        },
        {
          withCredentials: true,
        },
      );
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
      } else {
        reset();
        toast.success(formatToastMessages(res.message));
        if (verifyOtpUrl === "auth/forgot-password/verify-otp") {
          navigate("/reset-password");
          return;
        }

        clearDisabled();
        authUserStore.persist.clearStorage();
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to verify otp");
      console.error("Failed to verify otp", error);
    }
  }, [reset, verifyOtpUrl, authUserStore, clearDisabled]);

  const onSubmit = handleSubmit(handleVerifyOtp);

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="w-[400px] flex flex-col justify-center items-center"
      >
        <VStack gapY="3" width="full">
          <Heading textAlign="start" size="2xl" color="gray.600">
            Verify otp
          </Heading>
          <Field.Root invalid={!!errors.otp}>
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <PinInput.Root
                  attached
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  width="full"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  gapY="2"
                >
                  <PinInput.HiddenInput />
                  <PinInput.Control>
                    <PinInput.Input index={0} />
                    <PinInput.Input index={1} />
                    <PinInput.Input index={2} />
                    <PinInput.Input index={3} />
                    <PinInput.Input index={4} />
                    <PinInput.Input index={5} />
                  </PinInput.Control>
                  <Field.ErrorText>{errors.otp?.message}</Field.ErrorText>
                </PinInput.Root>
              )}
            />
          </Field.Root>
          <Button
            loading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            width="full"
          >
            Submit
          </Button>
        </VStack>
      </form>
    </>
  );
}
