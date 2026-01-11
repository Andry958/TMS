export const formatDate = (value) => {
  if (!value) return "—";

  let date;
  if (value instanceof Date) {
    date = value;
  } else {
    const parts = value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (parts) {
      const [, day, month, year] = parts;
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(value);
      if (isNaN(date)) return "—";
    }
  }

  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const parseDeliveryDate = (str) => {
  if (!str) return null;
  const parts = str.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!parts) return null;
  const [, day, month, year] = parts;
  return new Date(year, month - 1, day);
};

export const addBusinessDays = (date, days) => {
  let result = new Date(date);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }

  return result;
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const differenceInCalendarDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
};

export const calculateDueDate = (startDate, daysType, daysCount) => {
  if (!startDate || daysCount <= 0) return null;
  const parts = startDate.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  let baseDate = parts
    ? new Date(parts[3], parts[2] - 1, parts[1])
    : new Date(startDate);

  if (isNaN(baseDate)) return null;

  const result = daysType === "business"
    ? addBusinessDays(baseDate, Number(daysCount))
    : addDays(baseDate, Number(daysCount));

  result.setHours(0, 0, 0, 0);
  return result;
};
