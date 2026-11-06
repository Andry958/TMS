export const accountTypes = [
  { value: 0, name: "Гривневий" },
  { value: 1, name: "Валютний" }
];

export const currencies = [
  { code: 980, name: "UAH - Українська гривня" },
  { code: 840, name: "USD - Долар США" },
  { code: 978, name: "EUR - Євро" },
  { code: 985, name: "PLN - Злотий" },
  { code: 826, name: "GBP - Фунт стерлінгів" }
];

export const UAH_CURRENCY_CODE = 980;

const legacyCurrencyCodes = [980, 840, 978, 985, 826];

export function normalizeCurrencyCode(value) {
  const numericValue = Number(value);
  if (currencies.some(currency => currency.code === numericValue)) return numericValue;
  return legacyCurrencyCodes[numericValue] ?? UAH_CURRENCY_CODE;
}

export function createEmptyBankDetails() {
  return {
    typeAccount: 0,
    currency: UAH_CURRENCY_CODE,
    bankName: "",
    bankMfo: "",
    iban: "",
    swift: "",
    bankOfBeneficiary: "",
    correspondentBanks: []
  };
}
