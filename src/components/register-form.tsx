"use client";

import { callApi } from "@/utils/helpers/call-api";
import { RegisterSchema, registerSchema } from "@/utils/validations/auth";
import { Button, Field, Fieldset, Input } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PasswordInput } from "./ui/password-input";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { useCallback } from "react";
import { navigate } from "@/utils/helpers/router";
import { useAuthUserStore } from "@/providers/auth-user-store-provider";
import { useActionStore } from "@/providers/action-store-provider";

export function RegisterForm() {
  const { setDisabled, clearDisabled } = useActionStore((state) => state);

  const { setEmail, setRegisterPayload } = useAuthUserStore((state) => state);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const handleRegister = useCallback(async (data: {
    fullname: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const {
      fullname,
      username,
      email,
      password,
    } = data;

    try {
      setDisabled();
      const res = await callApi<RegisterSchema>("post", "auth/register", data);
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
      } else {
        setRegisterPayload({
          fullname,
          username,
          password,
        });
        setEmail(email);
        navigate("/verify-otp-register");
        reset();
        toast.success(formatToastMessages(res.message));
      }
    } catch (error) {
      toast.error("Failed to register");
      console.error("Failed to register", error);
    } finally {
      clearDisabled();
    }
  }, [reset, setEmail, setRegisterPayload, setDisabled, clearDisabled]);

  const onSubmit = handleSubmit(handleRegister);

  return (
    <form onSubmit={onSubmit}>
      <Fieldset.Root width="400px">
        <Fieldset.Legend fontSize="3xl" color="gray.700" marginBottom="4">
          Register
        </Fieldset.Legend>

        <Fieldset.Content>
          <Field.Root invalid={!!errors.fullname}>
            <Field.Label>
              Fullname: <Field.RequiredIndicator />
            </Field.Label>
            <Input {...register("fullname")} />
            <Field.ErrorText>{errors.fullname?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.username}>
            <Field.Label>
              Username: <Field.RequiredIndicator />
            </Field.Label>
            <Input {...register("username")} />
            <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.email}>
            <Field.Label>
              Email: <Field.RequiredIndicator />
            </Field.Label>
            <Input {...register("email")} type="email" />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label>
              Password: <Field.RequiredIndicator />
            </Field.Label>
            <PasswordInput {...register("password")} />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>
        </Fieldset.Content>

        <Button loading={isSubmitting} disabled={isSubmitting} type="submit">
          Submit
        </Button>
      </Fieldset.Root>
    </form>
  );
}
