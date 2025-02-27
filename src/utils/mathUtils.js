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
    currency: localeCurrencyMap[locale],
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


export const formatDateTime = (locale, dateString, isDteFormatted = true, isHour12 = true) => {
  const date = new Date(dateString);

  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const timeOptions = {
    hour12: isHour12,
    hour: '2-digit',
    minute: '2-digit'
  };

  const formattedDate = isDteFormatted ? date.toLocaleDateString(locale, dateOptions) : date.toISOString().split('T')[0];
  const formattedTime = date.toLocaleTimeString(locale, timeOptions);


  return {
    date: formattedDate,
    time: formattedTime
  };
};
