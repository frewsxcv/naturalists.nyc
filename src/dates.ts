import * as d3 from "d3";
import { unwrap } from "./utils";

const dateSubtractDay = (d: Date) => d.setDate(d.getDate() - 1);

const dateSubtractYear = (d: Date) => d.setFullYear(d.getFullYear() - 1);

export const formattedDate = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export function prevDayFromDate(date: Date) {
  const d = new Date(date);
  dateSubtractDay(d);
  return d;
}

export function prevYearFromDate(date: Date) {
  const d = new Date(date);
  dateSubtractYear(d);
  return d;
}

/** Generate dates descending starting from the given date */
export function* datesDescFrom(startDate: Date) {
  for (let date = new Date(startDate); ; dateSubtractDay(date)) {
    yield date;
  }
}

const getDateOneMonthAgo = (): Date => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
};

export const getIsoDateOneMonthAgo = (): string => {
  const dateString = getDateOneMonthAgo().toISOString().split("T");
  if (!dateString[0]) {
    throw new Error("Could not generate date string");
  }
  return dateString[0];
};

/** Is 1-indexed */
export const getCurrentWeekOfYear = (): number => {
  return d3.timeWeek.count(d3.timeYear(new Date()), new Date()) + 1;
};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type Month = (typeof months)[number];

/** Is 1-indexed */
export const getCurrentMonthOfYear = (): Month =>
  numberToMonth(d3.timeMonth.count(d3.timeYear(new Date()), new Date()) + 1);

const numberToMonth = (n: number): Month =>
  unwrap(months.find((month) => month === n));

/** Calculate days in seconds */
export const daysToSeconds = (days: number): string => "" + days * 24 * 60 * 60;

export const hoursToSeconds = (hours: number): string => "" + hours * 60 * 60;
