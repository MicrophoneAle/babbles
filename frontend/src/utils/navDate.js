import { format } from "date-fns";

const NAV_MONTH_ABBREV = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export function formatNavDate(date, { includeYear = true } = {}) {
  const day = format(date, "EEE");
  const month = NAV_MONTH_ABBREV[date.getMonth()];
  const dayNum = format(date, "d");
  return includeYear ? `${day}, ${month} ${dayNum}, ${format(date, "yyyy")}` : `${day}, ${month} ${dayNum}`;
}
