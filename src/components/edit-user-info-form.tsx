"use client";

import { callApi } from "@/utils/helpers/call-api";
import { formatToastMessages } from "@/utils/helpers/format-toast-messages";
import { IUser } from "@/utils/types";
import { editUserInfoSchema, EditUserInfoSchema } from "@/utils/validations/edit-user-info";
import { Badge, Button, Field, Fieldset, Input, DatePicker, parseDate, Portal } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { LuCalendar } from "react-icons/lu";
import { toast } from "react-toastify";

interface EditUserInfoFormProps {
  activeUser: IUser | null;
}

export function EditUserInfoForm({ activeUser }: EditUserInfoFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditUserInfoSchema>({
    resolver: zodResolver(editUserInfoSchema),
    defaultValues: {
      fullname: activeUser?.fullname,
      dateOfBirth: activeUser?.dateOfBirth ?? undefined,
      info: activeUser?.info ?? "",
    },
  });

  const handleEditUserInfo = useCallback(async (data: {
    fullname?: string,
    dateOfBirth?: Date,
    info?: string,
  }) => {
    try {
      const res = await callApi<EditUserInfoSchema>("put", "user/edit-info", data);
      if (!res.success) {
        toast.error(formatToastMessages(res.message));
      } else {
        reset();
        toast.success(formatToastMessages(res.message));
      }
    } catch (error) {
      toast.error("Failed to edit user info");
      console.error("Failed to edit user info", error);
    }
  }, [reset]);

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
                    const iso = val.toString();
                    field.onChange(new Date(iso));
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