# NovaPoshtaForm & NovaPoshtaDisplay - Компоненти інтеграції з Новою Поштою

## Опис
Два React-компоненти для роботи з даними Нової Пошти:
- **NovaPoshtaForm** - редагування з автопідтягуванням даних
- **NovaPoshtaDisplay** - відображення (read-only)

## Локація
- `src/components/common/NovaPoshtaForm.jsx` - форма редагування
- `src/components/common/NovaPoshtaDisplay.jsx` - компонент відображення

## Використання

### NovaPoshtaForm - Редагування

#### В EditCompanyPage
```jsx
import NovaPoshtaForm from "../components/common/NovaPoshtaForm";

const [isEditingNP, setIsEditingNP] = useState(false);

{isEditingNP ? (
  <NovaPoshtaForm form={form} setForm={setForm} isEditing={true} />
) : (
  <NovaPoshtaDisplay form={form} />
)}
```

#### В ClientCard
```jsx
import NovaPoshtaForm from "../components/common/NovaPoshtaForm";

// Використовує API ключ головної компанії
<NovaPoshtaForm 
  form={form} 
  setForm={setForm} 
  isEditing={isEditing} 
  apiNovaPoshta={parentCompany?.apiNovaPoshtaKey}
/>
```

### NovaPoshtaDisplay - Відображення

```jsx
import NovaPoshtaDisplay from "../components/common/NovaPoshtaDisplay";

<NovaPoshtaDisplay form={form} />
```

## Функціональність

### Автопідтягування даних
1. **Пошук міст** - динамічний пошук міст при введенні 3+ символів (debounce 300ms)
2. **Автопошук компанії** - автоматичне підтягування даних компанії по ЄДРПОУ (8 цифр, debounce 600ms)
3. **Завантаження відділень/поштоматів** - автоматичне завантаження списку відділень або поштоматів при виборі міста

### Типи отримувача
- **Приватна особа (0)** - ПІБ, телефон
- **Юридична особа (1)** - ЄДРПОУ, назва компанії, форма власності, контактна особа

### Типи доставки
- **Відділення (0)** - місто + відділення (з автопідтягуванням списку)
- **Адресна доставка (1)** - місто, вулиця, будинок, квартира
- **Поштомат (2)** - місто + поштомат (з автопідтягуванням списку)
- **Цифрова адреса (3)** - референс цифрової адреси

## Props

### NovaPoshtaForm (редагування)
```typescript
{
  form: Object,          // Об'єкт з даними форми
  setForm: Function,     // Функція для оновлення форми
  isEditing: boolean,    // Режим редагування (enabled/disabled поля)
  apiNovaPoshta?: string // API ключ Нової Пошти (опціонально, якщо не вказано - використовується form.apiNovaPoshtaKey)
}
```

### NovaPoshtaDisplay (відображення)
```typescript
{
  form: Object  // Об'єкт з даними форми для відображення
}
```

**Примітка:** Для клієнтів рекомендується передавати `apiNovaPoshta` з API ключем головної компанії, оскільки у клієнтів може не бути власного API ключа.

## Залежності
- `useApi` context - для отримання apiData (backend URL)
- `useToast` context - для показу повідомлень користувачу

## API Endpoints
Компонент використовує наступні backend endpoints:
- `GET /novaposhta/address/search-settlements` - пошук міст
- `GET /novaposhta/address/warehouses` - список відділень/поштоматів
- `GET /novaposhta/counterparty/by-edrpou` - пошук компанії по ЄДРПОУ

## Старі компоненти (deprecated)
Попередня реалізація в `src/components/client/novaposhta/` більше не використовується:
- ❌ `ClientNovaPoshta.jsx` - замінено на NovaPoshtaForm
- ❌ `useNovaPoshta.js` - логіка інтегрована в NovaPoshtaForm
- ❌ `CityAutocomplete.jsx` - інтегровано в NovaPoshtaForm
- ❌ `RecipientForm.jsx` - інтегровано в NovaPoshtaForm
- ❌ `DeliveryForm.jsx` - інтегровано в NovaPoshtaForm

Ці файли можна видалити або залишити як backup.

## Приклад структури form
```javascript
{
  apiNovaPoshtaKey: "string",           // API ключ НП
  novaPoshtaRecipientType: "0"|"1"|"",  // Тип отримувача
  nP_Phone: "string",                    // Телефон (приватна особа)
  nP_LastName: "string",
  nP_FirstName: "string",
  nP_MiddleName: "string",
  nP_EdrpouCode: "string",              // ЄДРПОУ (юр. особа)
  nP_CompanyName: "string",             // Назва компанії
  nP_OwnershipForm: "string",           // Форма власності
  nP_OrgPhone: "string",
  nP_OrgLastName: "string",
  nP_OrgFirstName: "string",
  nP_OrgMiddleName: "string",
  novaPoshtaDeliveryType: "0"|"1"|"2"|"3"|"", // Тип доставки
  npD_City: "string",                   // Місто
  npD_Branch: "string",                 // Відділення
  npD_Street: "string",                 // Вулиця
  npD_Building: "string",               // Будинок
  npD_Apartment: "string",              // Квартира
  npD_AddressComment: "string",         // Коментар
  npD_PostomatNumber: "string",         // Поштомат
  npD_DigitalAddressReference: "string" // Цифрова адреса
}
```

## Оновлення (2026-01-11)
- ✅ Створено універсальний компонент NovaPoshtaForm
- ✅ Замінено в EditCompanyPage
- ✅ Замінено в ClientCard
- ✅ Всі функції автопідтягування збережені та працюють
