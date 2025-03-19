import { localeCurrencyMap } from "../constants/localeAndSymbol";

export const onlyPositiveValue = (value, setter) => {
  const numValue = parseFloat(value)
  if (numValue < 0) {
    setter("0")
  } else {
    setter(value)
  }
}

export function formatNumber(number, locale, minFrac = 2, maxFrac = 2, currency = '') {
  return number.toLocaleString(locale, {
    style: 'currency',
    currency: localeCurrencyMap[locale].currency,
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac
  });
}

// export const formatDateTime = (locale, dateString, isHour12 = true) => {
//   const date = new Date(dateString);
//   return {
//     date: date.toLocaleDateString(locale, {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     }),
//     time: date.toLocaleTimeString(locale, {
//       hour12: isHour12,
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   };
// };


export const formatDateTime = (locale, dateString, preserveLocalTime = false, isHour12 = true) => {
  if (!dateString) return { date: '', time: '' };
  
  const timeZone = localeCurrencyMap[locale]?.timeZone || 'IST';
  let date;

  // When preserveLocalTime is true, we keep the date/time as selected in the local timezone
  // This is important for form inputs to maintain the user's selected values
  if (preserveLocalTime && dateString instanceof Date) {
    date = new Date(dateString);
  } else if (preserveLocalTime && typeof dateString === 'string' && dateString.includes('T')) {
    // For ISO strings, parse while preserving local time components
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    let [hours, minutes] = [0, 0];
    
    if (timePart) {
      [hours, minutes] = timePart.split(':').map(Number);
    }
    
    // Create date in local timezone without converting
    date = new Date(year, month - 1, day, hours, minutes);
  } else {
    // Standard date parsing (will convert to local timezone)
    date = new Date(dateString);
  }

  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: preserveLocalTime ? undefined : timeZone
  };

  const timeOptions = {
    hour12: isHour12,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: preserveLocalTime ? undefined : timeZone
  };

  // For form inputs, we need YYYY-MM-DD format
  const formattedDate = preserveLocalTime && !dateOptions.timeZone 
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : date.toLocaleDateString(locale, dateOptions);

  // For form inputs, we need HH:MM format
  const formattedTime = preserveLocalTime && !timeOptions.timeZone
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : date.toLocaleTimeString(locale, timeOptions);

  return {
    date: formattedDate,
    time: formattedTime
  };
};
