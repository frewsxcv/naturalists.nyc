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
