import { formatDistanceToNow, format } from "date-fns";

export function formatDate(date: Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateOfBirth(date: Date | null) {
  if (!date) {
    return "-";
  }

  return format(date, "EEEE, MMMM d, yyyy");
}