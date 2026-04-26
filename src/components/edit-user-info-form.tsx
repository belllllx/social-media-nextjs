"use client";

import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { EditUserInfoPayload, IUser } from "@/utils/types";
import { editUserInfoSchema, EditUserInfoSchema } from "@/utils/validations/edit-user-info";
import { Badge, Button, Field, Fieldset, Input, DatePicker, parseDate, Portal } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuCalendar } from "react-icons/lu";
import { toast } from "react-toastify";

interface EditUserInfoFormProps {
  activeUser: IUser | null;
  user: IUser;
  onCloseDialog: () => void;
}

export function EditUserInfoForm({
  activeUser,
  user,
  onCloseDialog,
}: EditUserInfoFormProps) {
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditUserInfoSchema>({
    resolver: zodResolver(editUserInfoSchema),
    defaultValues: {
      fullname: user.fullname,
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : undefined,
      info: user.info ?? "",
    }
  });

  const handleEditUserInfo = useCallback(async (data: EditUserInfoSchema) => {
    if (!activeUser) {
      return;
    }

    try {
      const payload: EditUserInfoPayload = {
        fullname: data.fullname ? data.fullname : undefined,
        dateOfBirth:
          data.dateOfBirth === undefined
            ? null
            : new Date(data.dateOfBirth),

        info:
          data.info === ""
            ? null
            : data.info ?? undefined,
      };

      const res = await callApi<EditUserInfoPayload>("put", `user/edit-info/${activeUser.id}`, payload);
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
      } else {
        const updatedUser = (res.data as unknown as { user: IUser }).user;

        reset({
          fullname: updatedUser.fullname,
          dateOfBirth: updatedUser.dateOfBirth
            ? new Date(updatedUser.dateOfBirth).toISOString().split("T")[0]
            : undefined,
          info: updatedUser.info ?? "",
        });

        onCloseDialog();

        queryClient.setQueryData<IUser>(["profile"], (oldUser) => {
          if (!oldUser) {
            return undefined;
          }

          return {
            ...oldUser,
            fullname: updatedUser.fullname,
          }
        });

        queryClient.setQueryData<IUser>(["user", user.id], (oldUser) => {
          if (!oldUser) {
            return undefined;
          }

          return {
            ...oldUser,
            fullname: updatedUser.fullname,
            dateOfBirth: updatedUser.dateOfBirth,
            info: updatedUser.info,
          }
        });

        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["comments"] });

        toast.success(formatToastMessages(res.message));
      }
    } catch (error) {
      toast.error("Failed to edit user info");
      console.error("Failed to edit user info", error);
    }
  }, [onCloseDialog, reset, activeUser, queryClient]);

  const onSubmit = handleSubmit(handleEditUserInfo);

  return (
    <form onSubmit={onSubmit}>
      <Fieldset.Root>
        <Fieldset.Content>
          <Field.Root invalid={!!errors.fullname}>
            <Field.Label>
              Fullname:
              <Field.RequiredIndicator
                fallback={
                  <Badge size="xs" variant="surface">
                    Optional
                  </Badge>
                }
              />
            </Field.Label>
            <Input {...register("fullname")} />
            <Field.ErrorText>{errors.fullname?.message}</Field.ErrorText>
          </Field.Root>

          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <Field.Root invalid={!!errors.dateOfBirth}>
                <DatePicker.Root
                  max={parseDate(new Date().toISOString().split("T")[0])}
                  locale="en-CA"
                  value={field.value ? [parseDate(field.value)] : []}
                  onValueChange={(e) => {
                    const val = e.value[0];
                    if (!val) {
                      return field.onChange(undefined)
                    };

                    // แปลงให้เป็น YYYY-MM-DD ก่อน
                    field.onChange(val.toString());
                  }}
                  invalid={!!errors.dateOfBirth}
                >
                  <DatePicker.Label>
                    Date of birth:
                    <Field.RequiredIndicator
                      fallback={
                        <Badge size="xs" variant="surface">
                          Optional
                        </Badge>
                      }
                    />
                  </DatePicker.Label>
                  <DatePicker.Control>
                    <DatePicker.Input
                      placeholder="yyyy/mm/dd"
                      onChange={(e) => {
                        if (!e.target.value) {
                          field.onChange(undefined);
                        }
                      }}
                    />
                    <DatePicker.IndicatorGroup>
                      <DatePicker.Trigger>
                        <LuCalendar />
                      </DatePicker.Trigger>
                    </DatePicker.IndicatorGroup>
                  </DatePicker.Control>
                  <Portal>
                    <DatePicker.Positioner>
                      <DatePicker.Content>
                        <DatePicker.View view="day">
                          <DatePicker.Header />
                          <DatePicker.DayTable />
                        </DatePicker.View>
                        <DatePicker.View view="month">
                          <DatePicker.Header />
                          <DatePicker.MonthTable />
                        </DatePicker.View>
                        <DatePicker.View view="year">
                          <DatePicker.Header />
                          <DatePicker.YearTable />
                        </DatePicker.View>
                      </DatePicker.Content>
                    </DatePicker.Positioner>
                  </Portal>
                </DatePicker.Root>
                <Field.ErrorText>{errors.dateOfBirth?.message}</Field.ErrorText>
              </Field.Root>
            )}
          />

          <Field.Root invalid={!!errors.info}>
            <Field.Label>
              Info:
              <Field.RequiredIndicator
                fallback={
                  <Badge size="xs" variant="surface">
                    Optional
                  </Badge>
                }
              />
            </Field.Label>
            <Input {...register("info")} />
            <Field.ErrorText>{errors.info?.message}</Field.ErrorText>
          </Field.Root>
        </Fieldset.Content>
        <Button
          loading={isSubmitting}
          disabled={isSubmitting}
          type="submit"
          width="full"
        >
          Save edit
        </Button>
      </Fieldset.Root>
    </form>
  );
}