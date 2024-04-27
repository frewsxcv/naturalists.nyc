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

  const oneYearAgoFromDate = new Date(date);
  dateSubtractYear(oneYearAgoFromDate);

/** Generate dates descending starting from the given date */
export function* datesDescFrom(startDate: Date) {
  for (let date = new Date(startDate); ; dateSubtractDay(date)) {
    yield date;
  }
}
