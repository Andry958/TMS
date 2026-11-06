import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "../context/ApiContext";
import "../styles/transport.css";

let fallbackIdCounter = 0;

function createUniqueId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackIdCounter += 1;
  return `${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const emptyVehicleFields = {
  trailerPlate: "",
  euro: "",
  status: "На базі",
  driver: "",
  division: "",
  mechanic: "",
  mileage: "",
  capacity: "",
  volume: "",
  pallets: "",
  dimensions: "",
  doorHeight: "",
  tare: "",
  gross: "",
  equipment: "",
  extras: "",
  customs: "",
  adr: "",
  refrigerationType: "",
  temperatureRange: "",
  temperatureRecorder: "",
  doubleDeck: "",
  hydraulicLiftCapacity: "",
  gps: "",
  imei: "",
  canBus: "",
  fuel: "",
  fuelLevel: "",
  adblue: "",
  consumption: "",
  eQueue: "",
  transitSystems: "",
  transitProfile: "",
  lastGpsUpdate: "",
  nextServiceDate: "",
  nextServiceMileage: "",
  serviceWorks: "",
  tireAxles: "",
  tireTread: "",
  tireDetails: "",
  repairHistory: "",
  ownership: "",
  ownershipDetails: "",
  lessor: "",
  leaseCost: "",
  costPerKm: "",
};

const tabs = [
  { id: "general", label: "Загальні дані" },
  { id: "cargo", label: "Вантажний відсік" },
  { id: "documents", label: "Документи" },
  { id: "telematics", label: "Телематика" },
  { id: "maintenance", label: "ТО та ремонти" },
  { id: "assignments", label: "Водії" },
];

const editorGroups = {
  general: [
    { key: "type", label: "Тип ТЗ", options: ["Тягач", "Причіп", "Напівпричіп", "Автопоїзд (зчіпка)", "Вантажне авто > 3.5 тон", "Малотоннажне авто < 3.5 тон", "Інше"] },
    { key: "make", label: "Марка та модель", required: true },
    { key: "year", label: "Рік випуску", type: "number", required: true },
    { key: "plate", label: "Державний номер", required: true },
    { key: "trailerPlate", label: "Номер причепа / напівпричепа" },
    { key: "vin", label: "VIN / номер шасі" },
    { key: "euro", label: "Екологічний клас" },
    {
      key: "body",
      label: "Тип кузова",
      options: [
        "Тент", "Цільномет", "Бус", "Зерновоз", "Контейнер", "Одяговоз", "Ізотерм", "Реф.", "Реф.-тушевоз",
        "Бортова / Відкрита", "Платформа", "Маніпулятор", "Ломовоз / Металовоз", "Контейнеровоз", "Трал / Негабарит", "Плитовоз", "Самоскид", "Mulda",
        "40'", "20'", "Молоковоз", "Бітумовоз", "Бензовоз", "Газовоз", "Кормовоз", "Борошновоз", "Автоцистерна", "Цементовоз", "Масловоз",
        "Автовоз", "Автовишка", "Бетоновоз", "Лісовоз", "Коневоз", "Кран", "Сміттєвоз", "Навантажувач", "Птаховоз", "Скотвоз", "Скловоз", "Трубовоз", "Щеповоз", "Евакуатор", "Яхтовоз",
        "Мікроавтобус", "Автобус", "Інше",
      ],
    },
    { key: "doubleDeck", label: "Додаткові властивості кузова" },
    { key: "status", label: "Поточний статус", options: ["На базі", "У рейсі", "В ремонті", "Неактивний"] },
    { key: "division", label: "Підрозділ / колона" },
    { key: "mechanic", label: "Відповідальний механік" },
    { key: "mileage", label: "Поточний пробіг (км)", type: "number" },
    { key: "ownership", label: "Тип власності", options: ["Власний", "Лізинг", "Орендований"] },
    { key: "ownershipDetails", label: "Умови власності" },
    { key: "lessor", label: "Орендодавець / лізингодавець" },
    { key: "leaseCost", label: "Вартість оренди / лізингу (UAH)", type: "number" },
    { key: "consumption", label: "Норма витрати пального (л/100 км)", type: "number" },
    { key: "fuel", label: "Об'єм паливних баків (л)", type: "number" },
    { key: "adblue", label: "Об'єм бака AdBlue (л)", type: "number" },
    { key: "costPerKm", label: "Собівартість 1 км (UAH)", type: "number" },
  ],
  cargo: [
    { key: "capacity", label: "Вантажопідйомність (т)", type: "number" },
    { key: "volume", label: "Корисний об'єм (м³)", type: "number" },
    { key: "pallets", label: "Місткість європалет", type: "number" },
    { key: "dimensions", label: "Внутрішні габарити" },
    { key: "doorHeight", label: "Висота дверного прорізу" },
    { key: "tare", label: "Власна маса (кг)", type: "number" },
    { key: "gross", label: "Повна маса MAM (кг)", type: "number" },
    { key: "equipment", label: "Установка / спеціальне обладнання" },
    { key: "refrigerationType", label: "Тип холодильної установки" },
    { key: "temperatureRange", label: "Температурний режим" },
    { key: "temperatureRecorder", label: "Термописець / реєстратор" },
    { key: "hydraulicLiftCapacity", label: "Гідроборт, вантажопідйомність (кг)", type: "number" },
    { key: "extras", label: "Ремені, коники, мати, кутники", multiline: true },
    { key: "customs", label: "Митний трос / допуск під пломбами" },
    { key: "adr", label: "Клас ADR / небезпечні вантажі" },
  ],
  telematics: [
    { key: "gps", label: "Провайдер GPS" },
    { key: "imei", label: "GPS-пристрій Globus · серійний номер / IMEI" },
    { key: "canBus", label: "Інтеграція CAN-шини", options: ["Підключено", "Не підключено", "Не підтримується"] },
    { key: "fuelLevel", label: "Залишок пального в баках (л)", type: "number" },
    { key: "lastGpsUpdate", label: "Останнє оновлення GPS" },
    { key: "eQueue", label: "Профіль єЧерга" },
    { key: "transitSystems", label: "PUESC / SENT / RMPD" },
    { key: "transitProfile", label: "ID профілю державних реєстрів" },
  ],
  maintenance: [
    { key: "nextServiceDate", label: "Дата наступного ТО", type: "date" },
    { key: "nextServiceMileage", label: "Пробіг наступного ТО (км)", type: "number" },
    { key: "serviceWorks", label: "Роботи за планом ТО", multiline: true },
    { key: "tireAxles", label: "Облік шин по вісях", multiline: true },
    { key: "tireTread", label: "Залишок протектора шин", multiline: true },
    { key: "tireDetails", label: "Модель, пробіг, сезонність шин", multiline: true },
    { key: "repairHistory", label: "Історія ремонтів та сервісних робіт", multiline: true },
  ],
};

const bodyPropertyOptions = ["Doubledeck", "Jumbo", "Mega"];

const poweredVehicleTypes = new Set([
  "Тягач",
  "Автопоїзд (зчіпка)",
  "Вантажне авто > 3.5 тон",
  "Малотоннажне авто < 3.5 тон",
  "Малотоннажне авто",
]);
const cargoVehicleTypes = new Set([
  "Причіп",
  "Напівпричіп",
  "Автопоїзд (зчіпка)",
  "Вантажне авто > 3.5 тон",
  "Малотоннажне авто < 3.5 тон",
  "Малотоннажне авто",
]);
const trailerVehicleTypes = new Set(["Причіп", "Напівпричіп"]);
const truckCombinationTypes = new Set([
  "Тягач",
  "Вантажне авто > 3.5 тон",
  "Малотоннажне авто < 3.5 тон",
  "Малотоннажне авто",
]);
const vehicleEditorTabs = [
  ...tabs.filter((tab) => tab.id === "general" || tab.id === "cargo"),
  { id: "documents", label: "Документи" },
  ...tabs.filter((tab) => ["telematics", "maintenance", "assignments"].includes(tab.id)),
];

function getVisibleEditorTabs(type) {
  const hasEngine = poweredVehicleTypes.has(type);
  const hasCargo = cargoVehicleTypes.has(type);

  return vehicleEditorTabs.filter((tab) => {
    if (tab.id === "cargo") return hasCargo;
    if (["telematics", "assignments"].includes(tab.id)) return hasEngine;
    return true;
  });
}

function isEditorFieldVisible(fieldKey, type) {
  const hasEngine = poweredVehicleTypes.has(type);
  const hasCargo = cargoVehicleTypes.has(type);

  if (["euro", "consumption", "fuel", "adblue", "mileage", "nextServiceMileage", "fuelLevel", "canBus", "costPerKm"].includes(fieldKey)) {
    return hasEngine;
  }
  if (fieldKey === "body") return true;
  if (fieldKey === "doubleDeck") return true;
  if (["capacity", "volume", "pallets", "dimensions", "doorHeight", "tare", "gross", "equipment", "refrigerationType", "temperatureRange", "temperatureRecorder", "hydraulicLiftCapacity", "extras", "customs", "adr"].includes(fieldKey)) {
    return hasCargo;
  }
  if (fieldKey === "trailerPlate") return type === "Автопоїзд (зчіпка)";
  return true;
}

function getBodyProperties(value = "") {
  const values = String(value).split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  return {
    selected: bodyPropertyOptions.filter((option) => values.includes(option)),
    other: values.filter((item) => !bodyPropertyOptions.includes(item)).join(", "),
  };
}

function normalizeDateForInput(value = "") {
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : "";
}

async function readApiResponse(response) {
  if (response.ok) return response.status === 204 ? null : response.json();
  const body = await response.json().catch(() => null);
  throw new Error(body?.message || body?.title || `Запит не виконано (${response.status}).`);
}

function mapVehicleDocument(document) {
  return {
    id: document.id,
    name: document.type,
    number: document.number || "",
    issueDate: normalizeDateForInput(document.issueDate || ""),
    expiry: normalizeDateForInput(document.expiryDate || ""),
    status: "Дійсний",
    details: document.comment || "",
    attachments: (document.files || []).map((file) => ({
      id: file.id,
      documentId: document.id,
      name: file.originalFileName,
      type: file.contentType,
      size: file.sizeBytes,
    })),
  };
}

function mapVehicle(vehicle, documents = []) {
  return {
    ...emptyVehicleFields,
    ...vehicle,
    type: vehicle.type === "Малотоннажне авто" ? "Малотоннажне авто < 3.5 тон" : vehicle.type,
    driver: vehicle.currentDriver?.fullName || "Не призначено",
    year: vehicle.year == null ? "" : String(vehicle.year),
    mileage: vehicle.mileage == null ? "" : String(vehicle.mileage),
    capacity: vehicle.capacity == null ? "" : String(vehicle.capacity),
    volume: vehicle.volume == null ? "" : String(vehicle.volume),
    pallets: vehicle.pallets == null ? "" : String(vehicle.pallets),
    tare: vehicle.tare == null ? "" : String(vehicle.tare),
    gross: vehicle.gross == null ? "" : String(vehicle.gross),
    hydraulicLiftCapacity: vehicle.hydraulicLiftCapacity == null ? "" : String(vehicle.hydraulicLiftCapacity),
    fuel: vehicle.fuel == null ? "" : String(vehicle.fuel),
    fuelLevel: vehicle.fuelLevel == null ? "" : String(vehicle.fuelLevel),
    adblue: vehicle.adblue == null ? "" : String(vehicle.adblue),
    consumption: vehicle.consumption == null ? "" : String(vehicle.consumption),
    nextServiceDate: normalizeDateForInput(vehicle.nextServiceDate || ""),
    nextServiceMileage: vehicle.nextServiceMileage == null ? "" : String(vehicle.nextServiceMileage),
    leaseCost: vehicle.leaseCost == null ? "" : String(vehicle.leaseCost),
    costPerKm: vehicle.costPerKm == null ? "" : String(vehicle.costPerKm),
    documents: documents.map(mapVehicleDocument),
  };
}

function toVehiclePayload(form) {
  const numeric = (key) => form[key] === "" || form[key] == null ? null : Number(form[key]);
  return {
    type: form.type,
    make: form.make,
    year: numeric("year"),
    plate: form.plate,
    trailerPlate: form.trailerPlate,
    vin: form.vin,
    euroClass: form.euro,
    bodyType: form.body,
    status: form.status,
    division: form.division,
    mechanic: form.mechanic,
    mileageKm: numeric("mileage"),
    capacityTons: numeric("capacity"),
    volumeM3: numeric("volume"),
    palletCapacity: numeric("pallets"),
    cargoDimensions: form.dimensions,
    doorHeight: form.doorHeight,
    tareKg: numeric("tare"),
    grossWeightKg: numeric("gross"),
    equipment: form.equipment,
    refrigerationType: form.refrigerationType,
    temperatureRange: form.temperatureRange,
    temperatureRecorder: form.temperatureRecorder,
    doubleDeck: form.doubleDeck,
    hydraulicLiftCapacityKg: numeric("hydraulicLiftCapacity"),
    extras: form.extras,
    customsApproval: form.customs,
    adrClass: form.adr,
    gpsProvider: form.gps,
    gpsDeviceId: form.imei,
    canBusStatus: form.canBus,
    fuelTankLitres: numeric("fuel"),
    fuelLevelLitres: numeric("fuelLevel"),
    adblueTankLitres: numeric("adblue"),
    consumptionLitresPer100Km: numeric("consumption"),
    eQueueProfile: form.eQueue,
    transitSystems: form.transitSystems,
    transitProfileId: form.transitProfile,
    lastGpsUpdate: form.lastGpsUpdate,
    nextServiceDate: form.nextServiceDate ? `${form.nextServiceDate}T00:00:00` : null,
    nextServiceMileageKm: numeric("nextServiceMileage"),
    plannedServiceWorks: form.serviceWorks,
    tireAxles: form.tireAxles,
    tireTread: form.tireTread,
    tireDetails: form.tireDetails,
    repairHistory: form.repairHistory,
    ownershipType: form.ownership,
    ownershipDetails: form.ownershipDetails,
    lessor: form.lessor,
    leaseCost: numeric("leaseCost"),
    leaseCurrency: "UAH",
    costPerKm: numeric("costPerKm"),
    costCurrency: "UAH",
  };
}

function formatTransportDate(value = "") {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }
  return value;
}

function getDocumentStatus(document) {
  const date = normalizeDateForInput(document.expiry);
  if (date) {
    const expiryTime = Date.parse(`${date}T00:00:00Z`);
    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const daysLeft = Math.ceil((expiryTime - todayUtc) / 86_400_000);
    if (daysLeft < 0 || document.status === "Прострочений") {
      return { label: "Прострочений", attention: true };
    }
    if (daysLeft <= 30 || document.status?.startsWith("Увага")) {
      return { label: `Увага · ${daysLeft} дн.`, attention: true };
    }
  }
  if (document.status === "Прострочений") return { label: "Прострочений", attention: true };
  if (document.status?.startsWith("Увага")) return { label: document.status, attention: true };
  return { label: document.status || "Дійсний", attention: false };
}

function getDocumentAlerts(vehicle) {
  return (vehicle.documents || []).filter((document) => getDocumentStatus(document).attention).length;
}

function Detail({ label, value }) {
  return (
    <div className="transport-detail">
      <span>{label}</span>
      <strong>{value || "Не вказано"}</strong>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <section className="transport-section">
      <div className="transport-section__heading">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function OverviewTab({ vehicle, linkedTrailer, linkedVehicle }) {
  return (
    <div className="transport-panel-grid">
      <Section title="Ідентифікація">
        <div className="transport-details-grid">
          <Detail label="Тип ТЗ" value={vehicle.type} />
          <Detail label="Марка та модель" value={vehicle.make} />
          <Detail label="Рік випуску" value={vehicle.year} />
          <Detail label="Державний номер" value={vehicle.plate} />
          {vehicle.trailerPlate && <Detail label="Номер причепа / напівпричепа" value={vehicle.trailerPlate} />}
          <Detail label="VIN / номер шасі" value={vehicle.vin} />
          <Detail label="Екологічний клас" value={vehicle.euro} />
          <Detail label="Тип кузова" value={vehicle.body} />
        </div>
      </Section>
      {(vehicle.currentDriver || vehicle.trailerPlate || linkedVehicle) && (
        <Section title="Склад автопоїзда">
          <div className="transport-details-grid">
            {trailerVehicleTypes.has(vehicle.type) ? (
              <>
                <Detail label="Причіп — номер" value={vehicle.plate} />
                <Detail label="Причіп — марка" value={vehicle.make} />
                <Detail label="Прив'язаний автомобіль — номер" value={linkedVehicle?.plate} />
                <Detail label="Прив'язаний автомобіль — марка" value={linkedVehicle?.make} />
                <Detail label="Водій автомобіля" value={linkedVehicle?.currentDriver?.fullName} />
              </>
            ) : (
              <>
                <Detail label="Автомобіль — номер" value={vehicle.plate} />
                <Detail label="Автомобіль — марка" value={vehicle.make} />
                <Detail label="Водій" value={vehicle.currentDriver?.fullName} />
                <Detail label="Причіп — номер" value={vehicle.trailerPlate} />
                <Detail label="Причіп — марка" value={linkedTrailer?.make} />
              </>
            )}
          </div>
        </Section>
      )}
      <Section title="Експлуатація та власність">
        <div className="transport-details-grid">
          <Detail label="Підрозділ / колона" value={vehicle.division} />
          <Detail label="Відповідальний механік" value={vehicle.mechanic} />
          <Detail label="Відповідальний водій" value={vehicle.driver} />
          <Detail label="Поточний пробіг" value={vehicle.mileage ? `${vehicle.mileage} км` : ""} />
          <Detail label="Тип власності" value={vehicle.ownership} />
          <Detail label="Умови власності" value={vehicle.ownershipDetails} />
          <Detail label="Норма витрати пального" value={vehicle.consumption} />
          <Detail label="Паливні баки / AdBlue" value={`${vehicle.fuel} / ${vehicle.adblue}`} />
          <Detail label="Розрахункова собівартість" value={vehicle.costPerKm} />
          <Detail label="Поточний статус" value={vehicle.status} />
        </div>
      </Section>
    </div>
  );
}

function CargoTab({ vehicle }) {
  return (
    <div className="transport-panel-grid">
      <Section title="Габарити та вантажомісткість">
        <div className="transport-details-grid">
          <Detail label="Тип кузова" value={vehicle.body} />
          <Detail label="Вантажопідйомність" value={vehicle.capacity} />
          <Detail label="Корисний об'єм" value={vehicle.volume} />
          <Detail label="Місткість європалет" value={vehicle.pallets} />
          <Detail label="Внутрішні габарити" value={vehicle.dimensions} />
          <Detail label="Висота дверного прорізу" value={vehicle.doorHeight} />
          <Detail label="Власна маса (тара)" value={vehicle.tare} />
          <Detail label="Повна маса (MAM)" value={vehicle.gross} />
        </div>
      </Section>
      <Section title="Спеціальне обладнання та оснащення">
        <div className="transport-details-grid">
          <Detail label="Установка / обладнання" value={vehicle.equipment} />
          <Detail label="Додаткове оснащення" value={vehicle.extras} />
          <Detail label="Митне обладнання" value={vehicle.customs} />
          <Detail label="Допуск ADR" value={vehicle.adr} />
          {vehicle.body === "Рефрижератор" && (
            <>
              <Detail label="Температурний режим" value={vehicle.temperatureRange} />
              <Detail label="Тип установки" value={vehicle.refrigerationType} />
              <Detail label="Термописець" value={vehicle.temperatureRecorder} />
              <Detail label="Додаткові властивості кузова" value={vehicle.doubleDeck} />
            </>
          )}
          <Detail label="Гідроборт, вантажопідйомність" value={vehicle.hydraulicLiftCapacity ? `${vehicle.hydraulicLiftCapacity} кг` : ""} />
        </div>
      </Section>
    </div>
  );
}

function FileActions({ attachments = [], onPreview, onDownload, onRemove }) {
  const [error, setError] = useState("");
  if (!attachments.length) return null;

  const runAction = async (action) => {
    setError("");
    try {
      await action();
    } catch (actionError) {
      console.error("Не вдалося виконати дію з вкладеним файлом.", actionError);
      setError(actionError.message || "Не вдалося відкрити файл.");
    }
  };

  return (
    <>
      <div className="transport-file-list">
        {attachments.map((attachment) => (
          <div className="transport-file" key={attachment.id}>
            <span className="transport-file__icon" aria-hidden="true">▤</span>
            <button
              className="transport-file__name"
              type="button"
              title={`Відкрити ${attachment.name}`}
              onClick={() => runAction(() => onPreview(attachment))}
            >
              {attachment.name}
            </button>
            <button type="button" onClick={() => runAction(() => onPreview(attachment))}>Переглянути</button>
            <button type="button" onClick={() => runAction(() => onDownload(attachment))}>Завантажити</button>
            {onRemove && (
              <button
                className="transport-file__remove"
                type="button"
                onClick={() => onRemove(attachment)}
                aria-label={`Видалити файл ${attachment.name}`}
                title="Видалити файл"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <span className="transport-file__error" role="alert">{error}</span>}
    </>
  );
}

function AttachmentPreview({ attachment, onClose }) {
  const [objectUrl] = useState(() => URL.createObjectURL(attachment.blob));
  const [docxHtml, setDocxHtml] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(() => attachment.name.toLowerCase().endsWith(".docx"));
  const lowerName = attachment.name.toLowerCase();
  const isDocx = lowerName.endsWith(".docx");
  const isPdf = attachment.type === "application/pdf" || lowerName.endsWith(".pdf");
  const isImage = (attachment.type || "").startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerName);
  const isText = (attachment.type || "").startsWith("text/") || /\.(txt|csv|log)$/.test(lowerName);

  useEffect(() => {
    let isActive = true;
    if (isDocx) {
      const renderDocument = async () => {
        try {
          const [mammothPackage, purifierPackage] = await Promise.all([
            import("mammoth"),
            import("dompurify"),
          ]);
          const mammoth = mammothPackage.default || mammothPackage;
          const purifier = purifierPackage.default || purifierPackage;
          const result = await mammoth.convertToHtml({ arrayBuffer: await attachment.blob.arrayBuffer() });
          if (isActive) setDocxHtml(purifier.sanitize(result.value));
        } catch (previewError) {
          console.error("Не вдалося відобразити DOCX-файл.", previewError);
          if (isActive) setError("Не вдалося відобразити цей DOCX-файл. Спробуйте завантажити його.");
        } finally {
          if (isActive) setIsLoading(false);
        }
      };
      renderDocument();
    }
    return () => {
      isActive = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [attachment, isDocx, objectUrl]);

  return (
    <div className="transport-preview-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="transport-preview" role="dialog" aria-modal="true" aria-labelledby="transport-preview-title">
        <header className="transport-preview__header">
          <div>
            <span className="transport-eyebrow">ПЕРЕГЛЯД ФАЙЛУ</span>
            <h2 id="transport-preview-title">{attachment.name}</h2>
          </div>
          <div className="transport-preview__actions">
            <a className="transport-button transport-button--secondary" href={objectUrl || undefined} download={attachment.name}>Завантажити</a>
            <button className="transport-icon-button" type="button" onClick={onClose} aria-label="Закрити">×</button>
          </div>
        </header>
        <div className="transport-preview__body">
          {isLoading && <div className="transport-preview__message">Відкриваємо документ…</div>}
          {error && <div className="transport-preview__message is-error">{error}</div>}
          {!isLoading && !error && isPdf && objectUrl && (
            <iframe className="transport-preview__pdf" src={objectUrl} title={`Перегляд ${attachment.name}`} />
          )}
          {!isLoading && !error && isDocx && docxHtml && (
            <article className="transport-preview__docx" dangerouslySetInnerHTML={{ __html: docxHtml }} />
          )}
          {!isLoading && !error && isImage && objectUrl && (
            <img className="transport-preview__image" src={objectUrl} alt={attachment.name} />
          )}
          {!isLoading && !error && isText && (
            <iframe className="transport-preview__text" src={objectUrl} title={`Перегляд ${attachment.name}`} />
          )}
          {!isLoading && !error && !isPdf && !isDocx && !isImage && !isText && (
            <div className="transport-preview__message">
              Для цього формату немає вбудованого перегляду. Файл можна завантажити.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DocumentsTab({ vehicle, onPreview, onDownload }) {
  return (
    <Section
      title="Документи та дозволи"
      action={<span className="transport-notice">Нагадування: за 30, 15 та 5 днів</span>}
    >
      <div className="transport-documents">
        {vehicle.documents.map((document, index) => {
          const documentStatus = getDocumentStatus(document);
          const isDueSoon = documentStatus.attention;
          return (
            <article className={`transport-document${isDueSoon ? " is-due" : ""}`} key={document.id ?? `${document.name}-${index}`}>
              <span className={`transport-document__icon${isDueSoon ? " is-warning" : ""}`} aria-hidden="true">
                {isDueSoon ? "!" : "✓"}
              </span>
              <div className="transport-document__info">
                <strong>{document.name}</strong>
                {document.details && <span>{document.details}</span>}
                <span>Дійсний до {formatTransportDate(document.expiry)}</span>
              </div>
              <span className={`transport-document__status${isDueSoon ? " is-warning" : ""}`}>{documentStatus.label}</span>
              <FileActions attachments={document.attachments} onPreview={onPreview} onDownload={onDownload} />
            </article>
          );
        })}
      </div>
      <div className="transport-info-note">
        Статуси й терміни дії можна змінити в режимі редагування транспортного засобу.
      </div>
    </Section>
  );
}

function TelematicsTab({ vehicle }) {
  return (
    <div className="transport-panel-grid">
      <Section title="GPS та бортова телематика">
        <div className="transport-details-grid">
          <Detail label="Провайдер GPS" value={vehicle.gps} />
          <Detail label="Прив’язаний GPS-пристрій Globus" value={vehicle.imei} />
          <Detail label="CAN-шина" value={vehicle.canBus} />
          <Detail label="Останнє оновлення" value={vehicle.lastGpsUpdate} />
        </div>
        <div className="transport-live-grid">
          <div><span>Пробіг</span><strong>{vehicle.mileage} <small>км</small></strong></div>
          <div><span>Пальне в баках</span><strong>{vehicle.fuelLevel || "—"} <small>л</small></strong></div>
          <div><span>Середня витрата</span><strong>{vehicle.consumption}</strong></div>
        </div>
      </Section>
      <Section title="Державні транзитні системи">
        <div className="transport-details-grid">
          <Detail label="єЧерга" value={vehicle.eQueue} />
          <Detail label="PUESC / SENT / RMPD" value={vehicle.transitSystems} />
          <Detail label="Ідентифікатор профілю" value={vehicle.transitProfile} />
        </div>
        <div className="transport-info-note">
          Вкажіть серійний номер GPS-пристрою з Globus у вкладці «Телематика» під час редагування. За цим номером пристрій буде пов’язаний з транспортом на карті автопарку.
        </div>
      </Section>
    </div>
  );
}

function MaintenanceTab({ vehicle }) {
  return (
    <div className="transport-panel-grid">
      <Section title="Планове технічне обслуговування">
        <div className="transport-service-card">
          <span className="transport-service-card__icon" aria-hidden="true">↻</span>
          <div>
            <span>Наступне планове ТО</span>
            <strong>{vehicle.nextServiceMileage}</strong>
            <small>Орієнтовна дата: {formatTransportDate(vehicle.nextServiceDate)}</small>
          </div>
        </div>
        <div className="transport-details-grid">
          <Detail label="Роботи за планом" value={vehicle.serviceWorks} />
          <Detail label="Поточний пробіг" value={vehicle.mileage ? `${vehicle.mileage} км` : ""} />
        </div>
      </Section>
      <Section title="Шини та історія ремонтів">
        <div className="transport-details-grid">
          <Detail label="Облік шин по вісях" value={vehicle.tireAxles} />
          <Detail label="Залишок протектора" value={vehicle.tireTread} />
          <Detail label="Сезонність / модель" value={vehicle.tireDetails} />
          <Detail label="Історія сервісних робіт" value={vehicle.repairHistory} />
        </div>
        <div className="transport-info-note">
          Планування ТО, шини та ремонтні роботи можна буде синхронізувати з модулем сервісу й обліку запчастин.
        </div>
      </Section>
    </div>
  );
}

function TransportEditor({ initialVehicle, defaultType, isTrailerCategory, apiData, onClose, onSubmit, onDelete, onPreview, onDownload }) {
  const [form, setForm] = useState(() => {
    const vehicle = { ...emptyVehicleFields, type: defaultType, body: "Тент", ...initialVehicle };
    vehicle.nextServiceDate = normalizeDateForInput(vehicle.nextServiceDate);
    vehicle.documents = (vehicle.documents || []).map((document, index) => ({
      ...document,
      id: document.id ?? `${document.name}-${index}`,
      attachments: Array.isArray(document.attachments) ? document.attachments : [],
      expiry: normalizeDateForInput(document.expiry),
      status: document.status?.startsWith("Увага") ? "Увага" : document.status || "Дійсний",
    }));
    return vehicle;
  });
  const [activeEditorTab, setActiveEditorTab] = useState("general");
  const [pendingFiles, setPendingFiles] = useState({});
  const [fileError, setFileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [gpsDevices, setGpsDevices] = useState([]);
  const [gpsDevicesLoading, setGpsDevicesLoading] = useState(false);
  const [gpsDevicesError, setGpsDevicesError] = useState("");

  useEffect(() => {
    if (activeEditorTab !== "telematics") return undefined;

    const controller = new AbortController();
    const loadGpsDevices = async () => {
      setGpsDevicesLoading(true);
      setGpsDevicesError("");
      try {
        const response = await fetch(`${apiData}/globus/devices`, {
          credentials: "include",
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.detail || payload.title || "Не вдалося завантажити GPS-пристрої.");
        }
        setGpsDevices(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setGpsDevicesError(error.message || "Не вдалося завантажити GPS-пристрої.");
        }
      } finally {
        if (!controller.signal.aborted) setGpsDevicesLoading(false);
      }
    };

    loadGpsDevices();
    return () => controller.abort();
  }, [activeEditorTab, apiData]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "type" && !getVisibleEditorTabs(value).some((tab) => tab.id === activeEditorTab)) {
      setActiveEditorTab("general");
    }
  };

  const updateDocument = (id, key, value) => {
    setForm((current) => ({
      ...current,
      documents: current.documents.map((document) => (
        document.id === id ? { ...document, [key]: value } : document
      )),
    }));
  };

  const addDocument = () => {
    setForm((current) => ({
      ...current,
      documents: [
        ...current.documents,
        { id: `document-${createUniqueId()}`, name: "", number: "", issueDate: "", expiry: "", status: "Дійсний", details: "", attachments: [] },
      ],
    }));
  };

  const addFiles = (documentId, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (files.some((file) => file.size > 20 * 1024 * 1024)) {
      setFileError("Розмір кожного файла не повинен перевищувати 20 МБ.");
      return;
    }
    if (files.some((file) => !/\.(pdf|doc|docx|png|jpe?g)$/i.test(file.name))) {
      setFileError("Підтримуються лише файли PDF, DOC, DOCX, PNG та JPEG.");
      return;
    }
    const nextFiles = files.map((file) => ({
      id: `pending-${createUniqueId()}`,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
    }));
    setPendingFiles((current) => ({
      ...current,
      ...Object.fromEntries(nextFiles.map((file, index) => [file.id, files[index]])),
    }));
    setForm((current) => ({
      ...current,
      documents: current.documents.map((document) => (
        document.id === documentId
          ? { ...document, attachments: [...document.attachments, ...nextFiles] }
          : document
      )),
    }));
    setFileError("");
  };

  const removeFile = (documentId, fileId) => {
    setPendingFiles((current) => {
      if (!current[fileId]) return current;
      const next = { ...current };
      delete next[fileId];
      return next;
    });
    setForm((current) => ({
      ...current,
      documents: current.documents.map((document) => (
        document.id === documentId
          ? { ...document, attachments: document.attachments.filter((file) => file.id !== fileId) }
          : document
      )),
    }));
  };

  const showFile = (file) => onPreview(file, pendingFiles);
  const downloadFile = (file) => onDownload(file, pendingFiles);

  const removeDocument = (id) => {
    setForm((current) => ({
      ...current,
      documents: current.documents.filter((document) => document.id !== id),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    if (!form.make.trim() || !form.plate.trim() || Number(form.year) < 1950 || Number(form.year) > 2100) {
      setActiveEditorTab("general");
      setFileError("Перевірте обов'язкові поля: марку, державний номер і рік випуску.");
      return;
    }
    if (form.documents.some((document) => !document.name.trim())) {
      setActiveEditorTab("documents");
      setFileError("Вкажіть назву для кожного доданого документа.");
      return;
    }
    setIsSaving(true);
    setFileError("");
    try {
      await onSubmit(form, pendingFiles);
    } catch (error) {
      console.error("Не вдалося зберегти транспортний засіб або його файли.", error);
      setFileError(error.message || "Не вдалося зберегти дані. Спробуйте ще раз.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="transport-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="transport-modal transport-editor" role="dialog" aria-modal="true" aria-labelledby="transport-modal-title">
        <div className="transport-modal__header">
          <div>
            <span className="transport-eyebrow">АВТОПАРК · {initialVehicle ? "РЕДАГУВАННЯ" : "НОВИЙ ЗАПИС"}</span>
            <h2 id="transport-modal-title">{initialVehicle ? "Редагування транспортного засобу" : "Новий транспортний засіб"}</h2>
          </div>
          <button className="transport-icon-button" type="button" onClick={onClose} aria-label="Закрити">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <nav className="transport-editor-tabs" aria-label="Розділи форми транспортного засобу">
            {getVisibleEditorTabs(form.type).map((tab) => (
              <button
                key={tab.id}
                className={activeEditorTab === tab.id ? "is-active" : ""}
                type="button"
                onClick={() => setActiveEditorTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="transport-editor-content">
            {activeEditorTab === "documents" ? (
              <div className="transport-editor-documents">
              <div className="transport-editor-documents__heading">
                <div>
                  <h3>Документи та дозволи</h3>
                  <p>Вкажіть термін дії — статус і нагадування можна оновити в будь-який час.</p>
                </div>
                <button className="transport-button transport-button--secondary" type="button" onClick={addDocument}>+ Додати документ</button>
              </div>
              {form.documents.map((document) => (
                <article className="transport-editor-document" key={document.id}>
                  <label className="transport-editor-document__name">Назва документа
                    <input
                      value={document.name}
                      onChange={(event) => updateDocument(document.id, "name", event.target.value)}
                      placeholder="Напр. Зелена картка"
                      required
                    />
                  </label>
                  <label>Номер документа
                    <input
                      value={document.number || ""}
                      onChange={(event) => updateDocument(document.id, "number", event.target.value)}
                      placeholder="Номер"
                    />
                  </label>
                  <label>Дата видачі
                    <input
                      type="date"
                      value={document.issueDate || ""}
                      onChange={(event) => updateDocument(document.id, "issueDate", event.target.value)}
                    />
                  </label>
                  <label>Дійсний до
                    <input
                      type="date"
                      value={document.expiry}
                      onChange={(event) => updateDocument(document.id, "expiry", event.target.value)}
                    />
                  </label>
                  <label>Статус
                    <select value={document.status} onChange={(event) => updateDocument(document.id, "status", event.target.value)}>
                      <option>Дійсний</option><option>Увага</option><option>Прострочений</option><option>Очікується</option>
                    </select>
                  </label>
                  <label className="transport-editor-document__details">Покриття / примітка
                    <input
                      value={document.details || ""}
                      onChange={(event) => updateDocument(document.id, "details", event.target.value)}
                      placeholder="Додаткова інформація"
                    />
                  </label>
                  <button
                    className="transport-icon-button transport-remove-button"
                    type="button"
                    onClick={() => removeDocument(document.id)}
                    aria-label={`Видалити документ ${document.name || ""}`}
                    title="Видалити документ"
                  >
                    ×
                  </button>
                  <div className="transport-editor-document__files">
                    <label className="transport-upload">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={(event) => {
                          addFiles(document.id, event.target.files);
                          event.target.value = "";
                        }}
                      />
                      <span aria-hidden="true">↑</span> Додати файл (PDF, DOCX, зображення)
                    </label>
                    <FileActions
                      attachments={document.attachments}
                      onPreview={showFile}
                      onDownload={downloadFile}
                      onRemove={(file) => removeFile(document.id, file.id)}
                    />
                  </div>
                </article>
              ))}
              {form.documents.length === 0 && <p className="transport-editor-empty">Документів ще немає. Додайте документ, щоб відстежувати термін його дії.</p>}
              <p className="transport-info-note">Нагадування перед завершенням терміну (за 30, 15 та 5 днів) відображаються в картці автопарку.</p>
            </div>
          ) : (
            <div className="transport-form-grid transport-form-grid--complete">
              {editorGroups[activeEditorTab]
                .filter((field) => isEditorFieldVisible(field.key, form.type))
                .map((field) => field.key === "doubleDeck" ? (
                  <fieldset className="transport-body-properties is-multiline" key={field.key}>
                    <legend>{field.label}</legend>
                      {bodyPropertyOptions.map((option) => {
                        const properties = getBodyProperties(form.doubleDeck);
                        return (
                          <label key={option}>
                            <input
                              type="checkbox"
                              checked={properties.selected.includes(option)}
                              onChange={() => {
                                const nextSelected = properties.selected.includes(option)
                                  ? properties.selected.filter((item) => item !== option)
                                  : [...properties.selected, option];
                                setForm((current) => ({
                                  ...current,
                                  doubleDeck: [...nextSelected, ...getBodyProperties(current.doubleDeck).other.split(",").map((item) => item.trim()).filter(Boolean)].join(", "),
                                }));
                              }}
                            />
                            {option}
                          </label>
                        );
                      })}
                    <input
                      type="text"
                      aria-label="Інші властивості кузова"
                      placeholder="Інші властивості"
                      value={getBodyProperties(form.doubleDeck).other}
                      onChange={(event) => {
                        const selected = getBodyProperties(form.doubleDeck).selected;
                        const other = event.target.value.split(",").map((item) => item.trim()).filter(Boolean);
                        setForm((current) => ({ ...current, doubleDeck: [...selected, ...other].join(", ") }));
                      }}
                    />
                  </fieldset>
                ) : (
                <label className={field.multiline ? "is-multiline" : ""} key={field.key}>
                  {field.label}
                  {field.key === "type" && isTrailerCategory ? (
                    <input value="Напівпричіп" readOnly />
                  ) : field.key === "type" && field.options ? (
                    <select name={field.key} value={form[field.key] ?? ""} onChange={updateField}>
                      <option value="">Не вказано</option>
                      {field.options
                        .filter((option) => isTrailerCategory
                          ? trailerVehicleTypes.has(option)
                          : !trailerVehicleTypes.has(option))
                        .map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : field.options ? (
                    <select name={field.key} value={form[field.key] ?? ""} onChange={updateField}>
                      <option value="">Не вказано</option>
                      {field.options.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : field.multiline ? (
                    <textarea
                      name={field.key}
                      value={form[field.key] ?? ""}
                      onChange={updateField}
                      rows={3}
                    />
                  ) : field.key === "imei" ? (
                    <>
                      <input
                        name={field.key}
                        type="text"
                        list="transport-globus-devices"
                        value={form[field.key] ?? ""}
                        onChange={updateField}
                        autoComplete="off"
                        placeholder="Виберіть пристрій або введіть серійний номер"
                      />
                      <datalist id="transport-globus-devices">
                        {gpsDevices.map((device) => (
                          <option key={device.serial || device.id} value={device.serial || device.id}>
                            {[device.name, device.plateNumber, device.status].filter(Boolean).join(" · ")}
                          </option>
                        ))}
                      </datalist>
                      <small className="transport-field-hint">
                        {gpsDevicesLoading
                          ? "Завантаження GPS-пристроїв Globus…"
                          : gpsDevicesError
                            ? gpsDevicesError
                            : "Серійний номер зв’язує цей транспортний запис із GPS-пристроєм на карті."}
                      </small>
                    </>
                  ) : (
                    <input
                      name={field.key}
                      type={field.type || "text"}
                      min={field.type === "number" ? 0 : undefined}
                      value={form[field.key] ?? ""}
                      onChange={updateField}
                      required={field.required}
                    />
                  )}
                </label>
              ))}
            </div>
            )}
          </div>
          {fileError && <div className="transport-storage-error" role="alert">{fileError}</div>}
          <p className="transport-info-note">
            Дані й файли зберігаються на сервері та доступні після повторного входу.
          </p>
          <div className="transport-modal__actions">
            {initialVehicle && (
              <button className="transport-button transport-button--danger" type="button" disabled={isSaving} onClick={() => onDelete(initialVehicle.id)}>
                Видалити транспорт
              </button>
            )}
            <span />
            <button className="transport-button transport-button--secondary" type="button" disabled={isSaving} onClick={onClose}>Скасувати</button>
            <button className="transport-button transport-button--primary" type="submit" disabled={isSaving}>
              {isSaving ? "Збереження…" : initialVehicle ? "Зберегти зміни" : "Додати транспорт"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function localDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value) {
  return value ? new Date(value).toISOString() : null;
}

const newTripForm = () => ({
  title: "",
  description: "",
  driverId: "",
  status: "Запланований",
  plannedStartAt: "",
  plannedEndAt: "",
  actualStartAt: "",
  actualEndAt: "",
  issuedAmount: "",
  currency: "UAH",
  startOdometerKm: "",
  endOdometerKm: "",
  points: [{ clientKey: createUniqueId(), order: 0, type: "Початок рейсу", address: "", arrivalAt: "", comment: "" }],
  expenses: [],
});

function VehicleAssignmentsTab({ vehicle, apiData, onError }) {
  const [assignments, setAssignments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    const [assignmentResponse, driverResponse] = await Promise.all([
      fetch(`${apiData}/fleet/vehicles/${vehicle.id}/assignment`, { credentials: "include" }),
      fetch(`${apiData}/fleet/drivers`, { credentials: "include" }),
    ]);
    const [assignmentData, driverData] = await Promise.all([readApiResponse(assignmentResponse), readApiResponse(driverResponse)]);
    setAssignments(assignmentData);
    setDrivers(driverData);
    setDriverId("");
  }, [apiData, vehicle.id]);

  useEffect(() => {
    const task = window.setTimeout(() => load().catch(onError), 0);
    return () => window.clearTimeout(task);
  }, [load, onError]);

  const current = assignments.find((assignment) => !assignment.endedAt);

  const assign = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${apiData}/fleet/vehicles/${vehicle.id}/assignment`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: Number(driverId), changeReason: reason || null }),
      });
      await readApiResponse(response);
      setReason("");
      await load();
    } catch (error) { onError(error); }
  };

  const unassign = async () => {
    try {
      const params = new URLSearchParams({ reason });
      const response = await fetch(`${apiData}/fleet/vehicles/${vehicle.id}/assignment?${params}`, { method: "DELETE", credentials: "include" });
      await readApiResponse(response);
      setReason("");
      await load();
    } catch (error) { onError(error); }
  };

  return (
    <Section title="Призначення водіїв">
      <div className="fleet-operations-current">
        <strong>Поточний водій</strong>
        <span>{current?.driver || "Не призначено"}</span>
        {current && <small>З {new Date(current.startedAt).toLocaleString("uk-UA")}</small>}
      </div>
      <form className="fleet-operations-form" onSubmit={assign}>
        <label>Новий водій
          <select value={driverId} onChange={(event) => setDriverId(event.target.value)} required>
            <option value="">Оберіть водія</option>
            {drivers.filter((driver) => !driver.currentVehicle || driver.id === current?.driverId).map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.fullName} · {driver.phone}</option>
            ))}
          </select>
        </label>
        <label>Причина зміни
          <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} />
        </label>
        <button className="transport-button transport-button--primary" type="submit">{current ? "Замінити водія" : "Призначити водія"}</button>
        {current && <button className="transport-button transport-button--secondary" type="button" onClick={unassign}>Зняти призначення</button>}
      </form>
      <h3 className="fleet-operations-subtitle">Історія призначень</h3>
      <div className="fleet-operations-history">
        {assignments.map((assignment) => (
          <article key={assignment.id}>
            <strong>{assignment.driver}</strong>
            <span>{new Date(assignment.startedAt).toLocaleString("uk-UA")} — {assignment.endedAt ? new Date(assignment.endedAt).toLocaleString("uk-UA") : "Поточне"}</span>
            {assignment.changeReason && <small>{assignment.changeReason}</small>}
          </article>
        ))}
        {!assignments.length && <p className="transport-empty">Призначень ще немає.</p>}
      </div>
    </Section>
  );
}

function VehicleTripsTab({ vehicle, apiData, onError }) {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(null);
  const [editingTripId, setEditingTripId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [tripResponse, driverResponse] = await Promise.all([
      fetch(`${apiData}/fleet/vehicles/${vehicle.id}/trips`, { credentials: "include" }),
      fetch(`${apiData}/fleet/drivers?includeArchived=true`, { credentials: "include" }),
    ]);
    const [tripData, driverData] = await Promise.all([readApiResponse(tripResponse), readApiResponse(driverResponse)]);
    setTrips(tripData);
    setDrivers(driverData);
  }, [apiData, vehicle.id]);

  useEffect(() => {
    const task = window.setTimeout(() => load().catch(onError), 0);
    return () => window.clearTimeout(task);
  }, [load, onError]);

  const startEditing = (trip) => {
    setEditingTripId(trip.id);
    setForm({
      ...trip,
      driverId: String(trip.driverId),
      plannedStartAt: localDateTime(trip.plannedStartAt),
      plannedEndAt: localDateTime(trip.plannedEndAt),
      actualStartAt: localDateTime(trip.actualStartAt),
      actualEndAt: localDateTime(trip.actualEndAt),
      issuedAmount: String(trip.issuedAmount),
      startOdometerKm: trip.startOdometerKm == null ? "" : String(trip.startOdometerKm),
      endOdometerKm: trip.endOdometerKm == null ? "" : String(trip.endOdometerKm),
      points: (trip.points || []).map((point) => ({ ...point, clientKey: createUniqueId(), arrivalAt: localDateTime(point.arrivalAt) })),
      expenses: (trip.expenses || []).map((expense) => ({ ...expense, spentAt: localDateTime(expense.spentAt) })),
    });
  };

  const saveTrip = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      driverId: Number(form.driverId),
      title: form.title,
      description: form.description || null,
      status: form.status,
      plannedStartAt: toIsoDateTime(form.plannedStartAt),
      plannedEndAt: toIsoDateTime(form.plannedEndAt),
      actualStartAt: toIsoDateTime(form.actualStartAt),
      actualEndAt: toIsoDateTime(form.actualEndAt),
      issuedAmount: Number(form.issuedAmount || 0),
      currency: form.currency,
      startOdometerKm: form.startOdometerKm === "" ? null : Number(form.startOdometerKm),
      endOdometerKm: form.endOdometerKm === "" ? null : Number(form.endOdometerKm),
      points: form.points.map((point, order) => ({
        order,
        type: point.type,
        address: point.address,
        arrivalAt: toIsoDateTime(point.arrivalAt),
        comment: point.comment || null,
      })),
      expenses: form.expenses.map((expense) => ({
        amount: Number(expense.amount),
        spentAt: toIsoDateTime(expense.spentAt),
        description: expense.description,
        category: expense.category || null,
      })),
    };
    try {
      const response = await fetch(
        editingTripId ? `${apiData}/fleet/trips/${editingTripId}` : `${apiData}/fleet/vehicles/${vehicle.id}/trips`,
        {
          method: editingTripId ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      await readApiResponse(response);
      setForm(null);
      setEditingTripId(null);
      await load();
    } catch (error) { onError(error); }
    finally { setSaving(false); }
  };

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const expenseTotalMinor = form?.expenses.reduce(
    (sum, expense) => sum + Math.round(Number(expense.amount || 0) * 100),
    0,
  ) ?? 0;
  const issuedMinor = Math.round(Number(form?.issuedAmount || 0) * 100);

  return (
    <Section title="Рейси автомобіля" action={
      <button className="transport-button transport-button--primary" type="button" onClick={() => {
        setEditingTripId(null);
        setForm({ ...newTripForm(), driverId: "" });
      }}>+ Створити рейс</button>
    }>
      {form && <form className="fleet-trip-form" onSubmit={saveTrip}>
        <div className="fleet-trip-form__header"><h3>{editingTripId ? "Редагування рейсу" : "Новий рейс"}</h3><button type="button" onClick={() => setForm(null)}>Скасувати</button></div>
        <div className="fleet-trip-grid">
          <label>Назва рейсу<input required maxLength={200} value={form.title} onChange={(event) => updateForm("title", event.target.value)} /></label>
          <label>Водій
            <select required value={form.driverId} onChange={(event) => updateForm("driverId", event.target.value)}>
              <option value="">Оберіть водія</option>{drivers.map((driver) => <option key={driver.id} value={driver.id} disabled={driver.isArchived && String(driver.id) !== String(form.driverId)}>{driver.fullName}{driver.isArchived ? " (архів)" : ""}</option>)}
            </select>
          </label>
          <label>Статус<select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>{["Запланований", "У процесі", "Завершений", "Скасований"].map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Валюта<input maxLength={20} value={form.currency} onChange={(event) => updateForm("currency", event.target.value)} /></label>
          <label>Початок (план)<input type="datetime-local" value={form.plannedStartAt || ""} onChange={(event) => updateForm("plannedStartAt", event.target.value)} /></label>
          <label>Завершення (план)<input type="datetime-local" value={form.plannedEndAt || ""} onChange={(event) => updateForm("plannedEndAt", event.target.value)} /></label>
          <label>Початок (факт)<input type="datetime-local" value={form.actualStartAt || ""} onChange={(event) => updateForm("actualStartAt", event.target.value)} /></label>
          <label>Завершення (факт)<input type="datetime-local" value={form.actualEndAt || ""} onChange={(event) => updateForm("actualEndAt", event.target.value)} /></label>
          <label>Видано коштів<input type="number" min="0" step="0.01" required value={form.issuedAmount} onChange={(event) => updateForm("issuedAmount", event.target.value)} /></label>
          <label>Одометр на початку (км)<input type="number" min="0" step="0.1" value={form.startOdometerKm} onChange={(event) => updateForm("startOdometerKm", event.target.value)} /></label>
          <label>Одометр в кінці (км)<input type="number" min="0" step="0.1" value={form.endOdometerKm} onChange={(event) => updateForm("endOdometerKm", event.target.value)} /></label>
        </div>
        <label className="fleet-trip-wide">Опис<textarea rows={2} value={form.description || ""} onChange={(event) => updateForm("description", event.target.value)} /></label>

        <div className="fleet-trip-section-heading"><h4>Точки маршруту</h4><button type="button" onClick={() => updateForm("points", [...form.points, { clientKey: createUniqueId(), order: form.points.length, type: "Розвантаження", address: "", arrivalAt: "", comment: "" }])}>+ Точка</button></div>
        {form.points.map((point, index) => <div className="fleet-trip-point" key={point.clientKey || point.id}>
          <select aria-label="Тип точки" value={point.type} onChange={(event) => updateForm("points", form.points.map((item, i) => i === index ? { ...item, type: event.target.value } : item))}>
            {["Початок рейсу", "Довантаження", "Дорозвантаження", "Розвантаження", "Гараж"].map((type) => <option key={type}>{type}</option>)}
          </select>
          <input required aria-label="Адреса точки" placeholder="Назва або адреса" value={point.address} onChange={(event) => updateForm("points", form.points.map((item, i) => i === index ? { ...item, address: event.target.value } : item))} />
          <input type="datetime-local" aria-label="Час прибуття" value={point.arrivalAt || ""} onChange={(event) => updateForm("points", form.points.map((item, i) => i === index ? { ...item, arrivalAt: event.target.value } : item))} />
          <input aria-label="Коментар" placeholder="Коментар" value={point.comment || ""} onChange={(event) => updateForm("points", form.points.map((item, i) => i === index ? { ...item, comment: event.target.value } : item))} />
          <div><button type="button" disabled={index === 0} onClick={() => {
            const points = [...form.points]; [points[index - 1], points[index]] = [points[index], points[index - 1]]; updateForm("points", points);
          }}>↑</button><button type="button" disabled={index === form.points.length - 1} onClick={() => {
            const points = [...form.points]; [points[index + 1], points[index]] = [points[index], points[index + 1]]; updateForm("points", points);
          }}>↓</button><button type="button" onClick={() => updateForm("points", form.points.filter((_, i) => i !== index))}>×</button></div>
        </div>)}

        <div className="fleet-trip-section-heading"><h4>Витрати</h4><button type="button" onClick={() => updateForm("expenses", [...form.expenses, { amount: "", spentAt: localDateTime(new Date().toISOString()), description: "", category: "" }])}>+ Витрата</button></div>
        {form.expenses.map((expense, index) => <div className="fleet-trip-expense" key={expense.id || index}>
          <input type="number" min="0.01" step="0.01" required aria-label="Сума витрати" placeholder="Сума" value={expense.amount} onChange={(event) => updateForm("expenses", form.expenses.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} />
          <input type="datetime-local" required aria-label="Дата витрати" value={expense.spentAt} onChange={(event) => updateForm("expenses", form.expenses.map((item, i) => i === index ? { ...item, spentAt: event.target.value } : item))} />
          <input required aria-label="Опис витрати" placeholder="Опис" value={expense.description} onChange={(event) => updateForm("expenses", form.expenses.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} />
          <input aria-label="Категорія витрати" placeholder="Категорія" value={expense.category || ""} onChange={(event) => updateForm("expenses", form.expenses.map((item, i) => i === index ? { ...item, category: event.target.value } : item))} />
          <button type="button" onClick={() => updateForm("expenses", form.expenses.filter((_, i) => i !== index))}>×</button>
        </div>)}
        <div className="fleet-trip-totals">
          <span>Витрати: {(expenseTotalMinor / 100).toFixed(2)} {form.currency}</span>
          <strong>Залишок: {((issuedMinor - expenseTotalMinor) / 100).toFixed(2)} {form.currency}</strong>
          <span>Кілометраж: {form.startOdometerKm !== "" && form.endOdometerKm !== "" ? (Number(form.endOdometerKm) - Number(form.startOdometerKm)).toFixed(1) : "—"} км</span>
        </div>
        <div className="fleet-trip-form__footer"><button className="transport-button transport-button--secondary" type="button" onClick={() => setForm(null)}>Скасувати</button><button className="transport-button transport-button--primary" type="submit" disabled={saving}>{saving ? "Збереження…" : "Зберегти рейс"}</button></div>
      </form>}

      <div className="fleet-trip-list">
        {trips.map((trip) => <article key={trip.id}>
          <div className="fleet-trip-list__title"><strong>{trip.title}</strong><span>{trip.status} · {trip.driverName}</span></div>
          <div className="fleet-trip-list__route">{(trip.points || []).map((point) => point.address).join(" → ") || "Маршрут не вказано"}</div>
          <div className="fleet-trip-list__metrics"><span>Видано: {trip.issuedAmount} {trip.currency}</span><span>Витрати: {trip.totalExpenses} {trip.currency}</span><strong>Залишок: {trip.balance} {trip.currency}</strong><span>{trip.mileageKm ?? "—"} км</span></div>
          <button className="transport-button transport-button--secondary" type="button" onClick={() => startEditing(trip)}>Переглянути / редагувати</button>
        </article>)}
        {!trips.length && <p className="transport-empty">Рейсів для цього автомобіля ще немає.</p>}
      </div>
    </Section>
  );
}

function CombinationUnit({ kind, title, plate, make, driver, vehicleType, bodyType, onSelect, onSelectDriver, isMissing = false, missingLabel }) {
  const isTrailer = kind === "trailer";
  const isTruck = !isTrailer && truckCombinationTypes.has(vehicleType);
  const isBus = !isTrailer && !isTruck && /автобус|мікроавтобус/i.test(`${vehicleType} ${bodyType || ""}`);

  return (
    <div className={`fleet-combination-unit fleet-combination-unit--${kind}`}>
      <button className="fleet-combination-unit__trigger" type="button" onClick={onSelect} aria-label={`Переглянути дані: ${title}, ${plate || "номер не вказано"}`}>
      <div className={`fleet-combination-unit__graphic${isMissing ? " is-missing" : ""}`} aria-hidden="true">
        {isMissing ? <span className="fleet-combination-unit__missing-mark">?</span> : isTrailer ? (
          <img className="fleet-combination-art--trailer" src="/trailer-combination.jpg" alt="" />
        ) : isTruck ? (
          <img className="fleet-combination-art--tractor" src="/tractor-combination.jpg" alt="" />
        ) : isBus ? (
          <svg viewBox="0 0 180 78" role="presentation">
            <path d="M22 15h124a8 8 0 0 1 8 8v31H14V23a8 8 0 0 1 8-8Z" />
            <path d="M24 23h34v20H24zm41 0h31v20H65zm38 0h31v20h-31zM14 48h140" />
            <circle cx="43" cy="60" r="9" />
            <circle cx="125" cy="60" r="9" />
          </svg>
        ) : (
          <svg viewBox="0 0 180 78" role="presentation">
            <path d="M18 49h12l9-17a12 12 0 0 1 11-7h47a15 15 0 0 1 12 6l14 18h15v12H18z" />
            <path d="m47 32-8 15h42V29H51a5 5 0 0 0-4 3Zm39-3v18h40l-11-14a10 10 0 0 0-8-4Z" />
            <circle cx="48" cy="61" r="9" />
            <circle cx="121" cy="61" r="9" />
          </svg>
        )}
      </div>
      <div className="fleet-combination-unit__details">
        <span className="fleet-combination-unit__type">{title}</span>
        <strong>{plate || "Номер не вказано"}</strong>
        <span>{make || (missingLabel ? missingLabel : "Марку не вказано")}</span>
      </div>
      </button>
      {driver && (
        <button className="fleet-combination-unit__driver" type="button" onClick={onSelectDriver}>
          Водій: <strong>{driver}</strong><span aria-hidden="true">ⓘ</span>
        </button>
      )}
    </div>
  );
}

function CombinationGraphic({ vehicle, trailer, driverInfo, onSelectInfo, missingTrailer = false, missingDriver = false }) {
  if (!vehicle) return null;

  const showVehicleInfo = () => onSelectInfo?.({
    title: vehicle.type === "Тягач" ? "Інформація про тягач" : "Інформація про автомобіль",
    items: [
      ["Тип ТЗ", vehicle.type],
      ["Марка та модель", vehicle.make],
      ["Державний номер", vehicle.plate],
      ["Рік випуску", vehicle.year],
      ["Тип кузова", vehicle.body],
      ["Статус", vehicle.status],
    ],
  });
  const showTrailerInfo = () => onSelectInfo?.({
    title: "Інформація про причіп",
    items: [
      ["Тип", trailer?.type],
      ["Марка та модель", trailer?.make],
      ["Державний номер", trailer?.plate],
      ["Рік випуску", trailer?.year],
      ["Тип кузова", trailer?.body],
      ["Вантажопідйомність", trailer?.capacity ? `${trailer.capacity} т` : ""],
      ["Статус", trailer?.status],
    ],
  });
  const showDriverInfo = () => onSelectInfo?.({
    title: "Інформація про водія",
    items: [
      ["ПІБ", driverInfo?.fullName || vehicle.currentDriver?.fullName],
      ["Телефон", driverInfo?.phone],
      ["Email", driverInfo?.email],
      ["Додатковий контакт", driverInfo?.additionalContact],
      ["Поточний автомобіль", driverInfo?.currentVehicle?.plate],
    ],
  });

  return (
    <div className={`fleet-combination-graphic${trailer ? " has-trailer" : " is-solo"}`} aria-label="Схема складу автопоїзда">
      <CombinationUnit
        kind="vehicle"
        title={vehicle.type === "Тягач" ? "Тягач" : "Автомобіль"}
        plate={vehicle.plate}
        make={vehicle.make}
        driver={vehicle.currentDriver?.fullName}
        vehicleType={vehicle.type}
        bodyType={vehicle.body}
        onSelect={showVehicleInfo}
        onSelectDriver={showDriverInfo}
        isMissing={missingDriver}
        missingLabel={missingDriver ? "Компонент ще не призначено" : undefined}
      />
      {trailer ? (
        <>
          <div className="fleet-combination-graphic__coupling" aria-hidden="true"><span /><span /><span /></div>
          <CombinationUnit
            kind="trailer"
            title={trailer.type}
            plate={trailer.plate}
            make={trailer.make}
            vehicleType={trailer.type}
            onSelect={showTrailerInfo}
          />
        </>
      ) : missingTrailer ? (
        <CombinationUnit
          kind="trailer"
          title="Причіп"
          plate="?"
          vehicleType="Причіп"
          onSelect={() => undefined}
          isMissing
          missingLabel="Причіп передано до іншого автопоїзда"
        />
      ) : (
        <div className="fleet-combination-graphic__solo-note">
          <span aria-hidden="true">✓</span>
          Автомобіль без причепа
        </div>
      )}
    </div>
  );
}

function CombinationInfoDialog({ info, onClose }) {
  if (!info) return null;
  const visibleItems = info.items.filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "");

  return (
    <div className="transport-modal-backdrop fleet-combination-info-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="transport-modal fleet-combination-info" role="dialog" aria-modal="true" aria-labelledby="fleet-combination-info-title">
        <div className="transport-modal__header fleet-combination-modal__header">
          <h2 id="fleet-combination-info-title">{info.title}</h2>
          <button className="transport-modal__close" type="button" aria-label="Закрити" onClick={onClose}>×</button>
        </div>
        <div className="transport-details-grid">
          {visibleItems.map(([label, value]) => <Detail key={label} label={label} value={value} />)}
          {visibleItems.length === 0 && <p className="transport-empty">Додаткові дані не вказані.</p>}
        </div>
        <div className="fleet-combination-info__footer">
          <button className="transport-button transport-button--secondary" type="button" onClick={onClose}>Закрити</button>
        </div>
      </section>
    </div>
  );
}

function VehicleCombinationsTab({ vehicles, apiData, onSaved }) {
  const [drivers, setDrivers] = useState([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedTrailerId, setSelectedTrailerId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [transferMarkers, setTransferMarkers] = useState({});
  const [pendingTransfer, setPendingTransfer] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiData}/fleet/drivers`, { credentials: "include" })
      .then(readApiResponse)
      .then((items) => {
        if (!cancelled) setDrivers(items);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Не вдалося завантажити водіїв.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDrivers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiData]);

  const combinationVehicles = vehicles.filter((vehicle) => !trailerVehicleTypes.has(vehicle.type));
  const trailers = vehicles.filter((vehicle) => trailerVehicleTypes.has(vehicle.type));
  const selectedVehicle = combinationVehicles.find((vehicle) => String(vehicle.id) === selectedVehicleId);
  const requiresTrailer = selectedVehicle?.type === "Тягач";
  const selectedTrailer = trailers.find((item) => String(item.id) === selectedTrailerId);
  const savedCombinations = combinationVehicles.filter((vehicle) => vehicle.currentDriver || vehicle.trailerPlate);

  const selectVehicle = (vehicleId) => {
    const vehicle = combinationVehicles.find((item) => String(item.id) === vehicleId);
    setSelectedVehicleId(vehicleId);
    const trailer = trailers.find((item) => item.plate === vehicle?.trailerPlate);
    setSelectedTrailerId(trailer ? String(trailer.id) : "");
    setSelectedDriverId(vehicle?.currentDriver?.driverId ? String(vehicle.currentDriver.driverId) : "");
  };

  const chooseTrailer = (trailerId) => {
    const trailer = trailers.find((item) => String(item.id) === trailerId);
    const owner = trailer && combinationVehicles.find((item) =>
      String(item.id) !== selectedVehicleId && item.trailerPlate === trailer.plate,
    );
    if (owner) {
      setPendingTransfer({
        kind: "trailer",
        id: trailerId,
        item: trailer.plate,
        owner: owner.plate,
        target: selectedVehicle?.plate,
      });
      return;
    }
    setSelectedTrailerId(trailerId);
  };

  const chooseDriver = (driverId) => {
    const driver = drivers.find((item) => String(item.id) === driverId);
    const ownerId = driver?.currentVehicle?.vehicleId;
    if (ownerId && String(ownerId) !== selectedVehicleId) {
      setPendingTransfer({
        kind: "driver",
        id: driverId,
        item: driver.fullName,
        owner: driver.currentVehicle.plate,
        target: selectedVehicle?.plate,
      });
      return;
    }
    setSelectedDriverId(driverId);
  };

  const confirmTransfer = () => {
    if (!pendingTransfer) return;
    if (pendingTransfer.kind === "trailer") setSelectedTrailerId(pendingTransfer.id);
    if (pendingTransfer.kind === "driver") setSelectedDriverId(pendingTransfer.id);
    setPendingTransfer(null);
  };

  const startCreating = () => {
    setError("");
    setMessage("");
    setSelectedVehicleId("");
    setSelectedTrailerId("");
    setSelectedDriverId("");
    setIsFormOpen(true);
  };

  const startEditing = (vehicleId) => {
    setError("");
    setMessage("");
    selectVehicle(vehicleId);
    setIsFormOpen(true);
  };

  const saveCombination = async (event) => {
    event.preventDefault();
    const vehicle = combinationVehicles.find((item) => String(item.id) === selectedVehicleId);
    const trailer = trailers.find((item) => String(item.id) === selectedTrailerId);
    if (!vehicle || !selectedDriverId || (vehicle.type === "Тягач" && !trailer)) {
      setError(vehicle?.type === "Тягач"
        ? "Для тягача оберіть причіп і водія."
        : "Оберіть автомобіль і водія.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");
    let vehicleSaved = false;
    let driverSaved = false;
    try {
      const oldTrailerOwner = trailer && combinationVehicles.find((item) =>
        String(item.id) !== String(vehicle.id) && item.trailerPlate === trailer.plate,
      );
      if (oldTrailerOwner) {
        const oldOwnerResponse = await fetch(`${apiData}/fleet/vehicles/${oldTrailerOwner.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toVehiclePayload({ ...oldTrailerOwner, trailerPlate: "" })),
        });
        await readApiResponse(oldOwnerResponse);
      }

      const newDriver = drivers.find((item) => String(item.id) === selectedDriverId);
      const oldDriverOwner = newDriver?.currentVehicle?.vehicleId && combinationVehicles.find((item) =>
        String(item.id) !== String(vehicle.id) && String(item.id) === String(newDriver.currentVehicle.vehicleId),
      );
      if (oldDriverOwner) {
        const unassignResponse = await fetch(`${apiData}/fleet/vehicles/${oldDriverOwner.id}/assignment?reason=${encodeURIComponent("Переміщення водія до іншого автопоїзда")}`, {
          method: "DELETE",
          credentials: "include",
        });
        await readApiResponse(unassignResponse);
      }

      const vehicleResponse = await fetch(`${apiData}/fleet/vehicles/${vehicle.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toVehiclePayload({ ...vehicle, trailerPlate: trailer?.plate || "" })),
      });
      await readApiResponse(vehicleResponse);
      vehicleSaved = true;

      if (String(vehicle.currentDriver?.driverId || "") !== selectedDriverId) {
        const assignmentResponse = await fetch(`${apiData}/fleet/vehicles/${vehicle.id}/assignment`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverId: Number(selectedDriverId), changeReason: "Формування автопоїзда" }),
        });
        await readApiResponse(assignmentResponse);
      }
      driverSaved = true;

      await onSaved();
      setTransferMarkers((current) => {
        const next = { ...current };
        if (oldTrailerOwner) next[String(oldTrailerOwner.id)] = { ...next[String(oldTrailerOwner.id)], trailer: true };
        if (oldDriverOwner) next[String(oldDriverOwner.id)] = { ...next[String(oldDriverOwner.id)], driver: true };
        return next;
      });
      setMessage("Автопоїзд сформовано.");
      setIsFormOpen(false);
    } catch (saveError) {
      if (vehicleSaved) {
        let refreshError = "";
        try {
          await onSaved();
        } catch (reloadError) {
          refreshError = ` Не вдалося оновити список: ${reloadError.message}`;
        }
        setError(driverSaved
          ? `Автопоїзд збережено, але оновити список не вдалося: ${saveError.message}`
          : `Дані автомобіля збережено, але не вдалося призначити водія: ${saveError.message}${refreshError}`);
      } else {
        setError(saveError.message || "Не вдалося сформувати автопоїзд.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const unassignTrailer = async (vehicle) => {
    if (!window.confirm(`Від'єднати причіп від автомобіля ${vehicle.plate}?`)) return;
    setError("");
    setMessage("");
    let trailerUnassigned = false;
    try {
      const response = await fetch(`${apiData}/fleet/vehicles/${vehicle.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toVehiclePayload({ ...vehicle, trailerPlate: "" })),
      });
      await readApiResponse(response);
      trailerUnassigned = true;
      await onSaved();
      if (String(vehicle.id) === selectedVehicleId) {
        setSelectedTrailerId("");
      }
      setMessage("Причіп від'єднано від автомобіля.");
    } catch (unassignError) {
      setError(trailerUnassigned
        ? `Причіп від'єднано, але список не оновився: ${unassignError.message}`
        : unassignError.message || "Не вдалося від'єднати причіп.");
    }
  };

  return (
    <div className="fleet-combinations-page">
      <div className="fleet-combinations-toolbar">
        <div>
          <h2>Автопоїзди</h2>
          <p>Керуйте складом автомобілів, причепів і водіїв.</p>
        </div>
        <button className="transport-button transport-button--primary" type="button" onClick={startCreating}>
          <span aria-hidden="true">+</span> Створити автопоїзд
        </button>
      </div>
      {error && !isFormOpen && <div className="transport-storage-error" role="alert">{error}</div>}
      {message && !isFormOpen && <div className="transport-info-note" role="status">{message}</div>}
      <Section title={`Створені автопоїзди · ${savedCombinations.length}`}>
        <div className="fleet-trip-list fleet-combinations-list">
          {savedCombinations.map((vehicle) => {
            const trailer = trailers.find((item) => item.plate === vehicle.trailerPlate);
            return (
              <article className="fleet-combination" key={vehicle.id}>
                <CombinationGraphic
                  vehicle={vehicle}
                  trailer={trailer}
                  driverInfo={drivers.find((driver) => String(driver.id) === String(vehicle.currentDriver?.driverId))}
                  onSelectInfo={setInfo}
                  missingTrailer={Boolean(transferMarkers[String(vehicle.id)]?.trailer)}
                  missingDriver={Boolean(transferMarkers[String(vehicle.id)]?.driver)}
                />
                <div className="fleet-combination__actions">
                  <button className="transport-button transport-button--secondary" type="button" onClick={() => startEditing(String(vehicle.id))}>Редагувати склад</button>
                  {trailer && <button className="transport-button transport-button--secondary" type="button" onClick={() => unassignTrailer(vehicle)}>Від'єднати причіп</button>}
                </div>
              </article>
            );
          })}
          {savedCombinations.length === 0 && <p className="transport-empty">Автопоїздів ще не сформовано. Натисніть «Створити автопоїзд», щоб додати перший.</p>}
        </div>
      </Section>

      {isFormOpen && (
        <div
          className="transport-modal-backdrop fleet-combination-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false);
          }}
        >
          <section className="transport-modal fleet-combination-modal" role="dialog" aria-modal="true" aria-labelledby="fleet-combination-modal-title">
            <div className="transport-modal__header fleet-combination-modal__header">
              <div>
                <span className="transport-eyebrow">УПРАВЛІННЯ АВТОПАРКОМ</span>
                <h2 id="fleet-combination-modal-title">{selectedVehicle ? "Редагування автопоїзда" : "Створення автопоїзда"}</h2>
              </div>
              <button className="transport-modal__close" type="button" aria-label="Закрити" onClick={() => setIsFormOpen(false)} disabled={isSaving}>×</button>
            </div>
        <form className="fleet-trip-form" onSubmit={saveCombination}>
          <div className="fleet-trip-grid">
            <label>Автомобіль
              <select required value={selectedVehicleId} onChange={(event) => selectVehicle(event.target.value)}>
                <option value="">Оберіть автомобіль</option>
                {combinationVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate} · {vehicle.make} ({vehicle.type})</option>)}
              </select>
            </label>
            <label>Причіп / напівпричіп{requiresTrailer ? " (обов'язково для тягача)" : " (необов'язково)"}
              <select required={requiresTrailer} value={selectedTrailerId} onChange={(event) => chooseTrailer(event.target.value)}>
                <option value="">Без причепа</option>
                {trailers.map((trailer) => {
                  const assignedToAnotherVehicle = combinationVehicles.some((item) =>
                    String(item.id) !== selectedVehicleId && item.trailerPlate === trailer.plate,
                  );
                  return <option key={trailer.id} value={trailer.id}>
                    {trailer.plate} · {trailer.make} ({trailer.type}){assignedToAnotherVehicle ? " · вже у складі автопоїзда" : ""}
                  </option>;
                })}
              </select>
            </label>
            <label>Водій
              <select required value={selectedDriverId} onChange={(event) => chooseDriver(event.target.value)} disabled={isLoadingDrivers}>
                <option value="">{isLoadingDrivers ? "Завантаження водіїв…" : "Оберіть водія"}</option>
                {drivers.filter((driver) => !driver.isArchived).map((driver) => (
                  <option
                    key={driver.id}
                    value={driver.id}
                  >
                    {driver.fullName}{driver.currentVehicle && String(driver.currentVehicle.vehicleId) !== selectedVehicleId ? ` · вже закріплений (${driver.currentVehicle.plate})` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {selectedVehicle && (
            <div className="fleet-combination-preview">
              <div className="fleet-combination-preview__heading">
                <strong>Попередній вигляд автопоїзда</strong>
                <span>Склад оновиться після збереження</span>
              </div>
              <CombinationGraphic
                vehicle={{ ...selectedVehicle, currentDriver: drivers.find((driver) => String(driver.id) === selectedDriverId) ? { fullName: drivers.find((driver) => String(driver.id) === selectedDriverId).fullName } : selectedVehicle.currentDriver }}
                trailer={selectedTrailer}
                driverInfo={drivers.find((driver) => String(driver.id) === selectedDriverId)}
                onSelectInfo={setInfo}
              />
            </div>
          )}
          {error && <div className="transport-storage-error" role="alert">{error}</div>}
          {message && <div className="transport-info-note" role="status">{message}</div>}
          <div className="fleet-trip-form__footer">
            <button className="transport-button transport-button--secondary" type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving}>Скасувати</button>
            <button className="transport-button transport-button--primary" type="submit" disabled={isSaving || isLoadingDrivers || combinationVehicles.length === 0}>
              {isSaving ? "Збереження…" : selectedVehicle ? "Зберегти зміни" : "Створити автопоїзд"}
            </button>
          </div>
        </form>
        {combinationVehicles.length === 0 && <p className="transport-empty">Додайте автомобіль у категорії «Автомобілі».</p>}
        {requiresTrailer && trailers.length === 0 && <p className="transport-empty">Для тягача додайте причіп або напівпричіп у категорії «Причепи».</p>}
          </section>
        </div>
      )}
      {pendingTransfer && (
        <div className="transport-modal-backdrop fleet-transfer-confirm-backdrop" role="presentation">
          <section className="transport-modal fleet-transfer-confirm" role="dialog" aria-modal="true" aria-labelledby="fleet-transfer-confirm-title">
            <div className="fleet-transfer-confirm__icon" aria-hidden="true">↔</div>
            <span className="transport-eyebrow">ПЕРЕМІЩЕННЯ КОМПОНЕНТА</span>
            <h2 id="fleet-transfer-confirm-title">
              {pendingTransfer.kind === "driver" ? "Перекріпити водія?" : "Перемістити причіп?"}
            </h2>
            <p>
              <strong>{pendingTransfer.item}</strong> зараз закріплено за автопоїздом <strong>{pendingTransfer.owner}</strong>.
              Після підтвердження компонент буде додано до автопоїзда <strong>{pendingTransfer.target || "поточний"}</strong>,
              а на попередньому автопоїзді з’явиться позначка «потрібне перепризначення».
            </p>
            <div className="fleet-transfer-confirm__actions">
              <button className="transport-button transport-button--secondary" type="button" onClick={() => setPendingTransfer(null)}>Скасувати</button>
              <button className="transport-button transport-button--primary" type="button" onClick={confirmTransfer}>Перемістити</button>
            </div>
          </section>
        </div>
      )}
      <CombinationInfoDialog info={info} onClose={() => setInfo(null)} />
    </div>
  );
}

function TransportPage() {
  const { apiData } = useApi();
  const [vehicles, setVehicles] = useState([]);
  const [storageError, setStorageError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFleetType, setActiveFleetType] = useState("vehicles");
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [query, setQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newVehicleType, setNewVehicleType] = useState("Тягач");
  const [filePreview, setFilePreview] = useState(null);
  const reportError = useCallback((error) => {
    setStorageError(error.message || "Не вдалося виконати операцію.");
  }, []);

  const loadVehicles = useCallback(async () => {
    if (!apiData) throw new Error('API не налаштовано.');
    const response = await fetch(apiData + '/fleet/vehicles', { credentials: 'include' });
    const items = await readApiResponse(response);
    const withDocuments = await Promise.all(items.map(async (vehicle) => {
      const documentsResponse = await fetch(apiData + '/fleet/vehicles/' + vehicle.id + '/documents', { credentials: 'include' });
      const documents = await readApiResponse(documentsResponse);
      return mapVehicle(vehicle, documents);
    }));
    setVehicles(withDocuments);
    setSelectedId((current) => withDocuments.some((item) => item.id === current) ? current : (withDocuments[0]?.id ?? null));
    setStorageError('');
  }, [apiData]);

  useEffect(() => {
    let cancelled = false;
    const loadTask = window.setTimeout(() => {
      loadVehicles().catch((error) => {
        if (!cancelled) setStorageError(error.message || 'Не вдалося завантажити транспорт.');
      }).finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(loadTask);
    };
  }, [loadVehicles]);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('uk');
    if (!normalizedQuery) return vehicles;
    return vehicles.filter((vehicle) =>
      (vehicle.plate + ' ' + vehicle.trailerPlate + ' ' + vehicle.make + ' ' + vehicle.driver + ' ' + vehicle.body)
        .toLocaleLowerCase('uk').includes(normalizedQuery),
    );
  }, [query, vehicles]);
  const categorizedVehicles = useMemo(
    () => filteredVehicles.filter((vehicle) => (
      activeFleetType === "trailers"
        ? trailerVehicleTypes.has(vehicle.type)
        : !trailerVehicleTypes.has(vehicle.type)
    )),
    [activeFleetType, filteredVehicles],
  );
  const activeVehicle = activeFleetType === "combinations"
    ? null
    : categorizedVehicles.find((vehicle) => vehicle.id === selectedId) || categorizedVehicles[0];
  const visibleTabs = activeVehicle ? getVisibleEditorTabs(activeVehicle.type) : tabs;
  const visibleActiveTab = visibleTabs.some((tab) => tab.id === activeTab) ? activeTab : "general";

  const saveVehicle = async (form, pendingFiles) => {
    const isEditing = editingId !== null;
    const url = apiData + '/fleet/vehicles' + (isEditing ? '/' + editingId : '');
    const response = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toVehiclePayload(form)),
    });
    const savedVehicle = await readApiResponse(response);
    const vehicleId = isEditing ? editingId : savedVehicle.id;
    const existingVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
    const keptDocumentIds = new Set();

    try {
      for (const document of form.documents) {
        const documentPayload = {
          type: document.name.trim(),
          number: document.number || null,
          issueDate: document.issueDate || null,
          expiryDate: document.expiry || null,
          comment: document.details || null,
        };
        const isExisting = Number.isInteger(document.id);
        const documentUrl = apiData + '/fleet/vehicles/' + vehicleId + '/documents' + (isExisting ? '/' + document.id : '');
        const documentResponse = await fetch(documentUrl, {
          method: isExisting ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(documentPayload),
        });
        const savedDocument = await readApiResponse(documentResponse);
        const documentId = isExisting ? document.id : savedDocument.id;
        keptDocumentIds.add(documentId);
        const pending = (document.attachments || []).find((attachment) => pendingFiles[attachment.id]);
        const hadFile = (existingVehicle?.documents || []).some((item) => item.id === documentId && item.attachments.length > 0);
        if (pending) {
          const data = new FormData();
          data.append('file', pendingFiles[pending.id]);
          const uploadResponse = await fetch(apiData + '/fleet/vehicles/' + vehicleId + '/documents/' + documentId + '/file', {
            method: 'POST', credentials: 'include', body: data,
          });
          await readApiResponse(uploadResponse);
        } else if (isExisting && hadFile && !(document.attachments || []).length) {
          const deleteFileResponse = await fetch(apiData + '/fleet/vehicles/' + vehicleId + '/documents/' + documentId + '/file', {
            method: 'DELETE', credentials: 'include',
          });
          await readApiResponse(deleteFileResponse);
        }
      }

      for (const oldDocument of existingVehicle?.documents || []) {
        if (!keptDocumentIds.has(oldDocument.id)) {
          const deleteResponse = await fetch(apiData + '/fleet/vehicles/' + vehicleId + '/documents/' + oldDocument.id, {
            method: 'DELETE', credentials: 'include',
          });
          await readApiResponse(deleteResponse);
        }
      }
    } catch (documentError) {
      try {
        await loadVehicles();
        setSelectedId(vehicleId);
      } catch (reloadError) {
        setStorageError(`Автомобіль збережено, але не вдалося оновити дані документів: ${reloadError.message}`);
      }
      setIsAddOpen(false);
      setEditingId(null);
      setStorageError(`Автомобіль збережено, але роботу з документами не завершено: ${documentError.message}`);
      return;
    }

    await loadVehicles();
    setSelectedId(vehicleId);
    setIsAddOpen(false);
    setEditingId(null);
    setActiveTab('general');
    setQuery('');
  };

  const deleteVehicle = async (vehicleId) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle || !window.confirm('Видалити транспортний засіб ' + vehicle.plate + '?')) return;
    try {
      const response = await fetch(apiData + '/fleet/vehicles/' + vehicleId, { method: 'DELETE', credentials: 'include' });
      await readApiResponse(response);
      await loadVehicles();
      setIsAddOpen(false);
      setEditingId(null);
    } catch (error) {
      setStorageError(error.message || 'Не вдалося видалити транспортний засіб.');
    }
  };

  const fetchAttachment = async (attachment, pendingFiles = {}) => {
    if (pendingFiles[attachment.id]) return pendingFiles[attachment.id];
    const response = await fetch(apiData + '/fleet/vehicles/' + selectedId + '/documents/' + attachment.documentId + '/file', { credentials: 'include' });
    if (!response.ok) await readApiResponse(response);
    return response.blob();
  };

  const previewFile = async (attachment, pendingFiles = {}) => {
    try {
      const blob = await fetchAttachment(attachment, pendingFiles);
      setFilePreview({ ...attachment, blob });
    } catch (error) {
      setStorageError(error.message || 'Не вдалося відкрити файл.');
      throw error;
    }
  };

  const downloadFile = async (attachment, pendingFiles = {}) => {
    try {
      const blob = await fetchAttachment(attachment, pendingFiles);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setStorageError(error.message || 'Не вдалося завантажити файл.');
      throw error;
    }
  };

  const openAddDialog = (type = "Тягач") => {
    setEditingId(null);
    setNewVehicleType(type);
    setActiveFleetType(trailerVehicleTypes.has(type) ? "trailers" : "vehicles");
    setIsAddOpen(true);
  };

  const closeDialog = () => {
    setIsAddOpen(false);
    setEditingId(null);
  };

  const renderActiveTab = () => {
    if (!activeVehicle) return null;
    switch (visibleActiveTab) {
      case "cargo": return <CargoTab vehicle={activeVehicle} />;
      case "documents": return <DocumentsTab vehicle={activeVehicle} onPreview={previewFile} onDownload={downloadFile} />;
      case "telematics": return <TelematicsTab vehicle={activeVehicle} />;
      case "maintenance": return <MaintenanceTab vehicle={activeVehicle} />;
      case "assignments": return <VehicleAssignmentsTab vehicle={activeVehicle} apiData={apiData} onError={reportError} />;
      default: return <OverviewTab
        vehicle={activeVehicle}
        linkedTrailer={vehicles.find((vehicle) => trailerVehicleTypes.has(vehicle.type) && vehicle.plate === activeVehicle.trailerPlate)}
        linkedVehicle={vehicles.find((vehicle) => !trailerVehicleTypes.has(vehicle.type) && vehicle.trailerPlate === activeVehicle.plate)}
      />;
    }
  };

  const inTripCount = vehicles.filter((vehicle) => vehicle.status === "У рейсі").length;
  const alertsCount = vehicles.reduce((count, vehicle) => count + getDocumentAlerts(vehicle), 0);

  return (
    <div className="transport-page">
      <div className="transport-heading">
        <div>
          <span className="transport-eyebrow">УПРАВЛІННЯ АВТОПАРКОМ</span>
          <h1>Транспорт</h1>
          <p>Технічна інформація, документи та готовність автопарку до рейсів.</p>
          <span className="transport-demo-label">Дані з автопарку компанії</span>
        </div>
      </div>

      <nav className="transport-tabs transport-type-tabs" aria-label="Категорії автопарку">
        <button
          type="button"
          className={activeFleetType === "vehicles" ? "is-active" : ""}
          onClick={() => setActiveFleetType("vehicles")}
          aria-current={activeFleetType === "vehicles" ? "page" : undefined}
        >
          Автомобілі <span className="transport-tabs__count">{vehicles.filter((vehicle) => !trailerVehicleTypes.has(vehicle.type)).length}</span>
        </button>
        <button
          type="button"
          className={activeFleetType === "trailers" ? "is-active" : ""}
          onClick={() => setActiveFleetType("trailers")}
          aria-current={activeFleetType === "trailers" ? "page" : undefined}
        >
          Причепи <span className="transport-tabs__count">{vehicles.filter((vehicle) => trailerVehicleTypes.has(vehicle.type)).length}</span>
        </button>
        <button
          type="button"
          className={activeFleetType === "combinations" ? "is-active" : ""}
          onClick={() => setActiveFleetType("combinations")}
          aria-current={activeFleetType === "combinations" ? "page" : undefined}
        >
          Автопоїзди <span className="transport-tabs__count">{vehicles.filter((vehicle) => !trailerVehicleTypes.has(vehicle.type) && (vehicle.currentDriver || vehicle.trailerPlate)).length}</span>
        </button>
        {activeFleetType !== "combinations" && (
          <button
            className="transport-button transport-button--primary transport-type-tabs__add"
            type="button"
            onClick={() => openAddDialog(activeFleetType === "trailers" ? "Причіп" : "Тягач")}
          >
            <span aria-hidden="true">+</span> {activeFleetType === "trailers" ? "Додати причіп" : "Додати автомобіль"}
          </button>
        )}
      </nav>

      <div className="transport-stats">
        <article className="transport-stat">
          <span className="transport-stat__icon">▣</span>
          <div><span>Усього одиниць</span><strong>{vehicles.length}</strong></div>
          <small>у реєстрі</small>
        </article>
        <article className="transport-stat">
          <span className="transport-stat__icon is-blue">↗</span>
          <div><span>У рейсі</span><strong>{inTripCount}</strong></div>
          <small>на маршруті</small>
        </article>
        <article className="transport-stat">
          <span className="transport-stat__icon is-amber">◷</span>
          <div><span>Потребують уваги</span><strong>{alertsCount}</strong></div>
          <small>документи скоро завершаться</small>
        </article>
      </div>

      {storageError && <div className="transport-storage-error" role="alert">{storageError}</div>}
      {isLoading && <div className="transport-info-note" role="status">Завантаження даних автопарку…</div>}

      {activeFleetType === "combinations" ? (
        <VehicleCombinationsTab vehicles={vehicles} apiData={apiData} onSaved={loadVehicles} />
      ) : <div className="transport-workspace">
        <aside className="transport-fleet">
          <div className="transport-fleet__heading">
            <div><h2>{activeFleetType === "trailers" ? "Причепи" : "Автомобілі"}</h2><span>{categorizedVehicles.length} одиниць</span></div>
          </div>
          <label className="transport-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Номер, марка, водій..." aria-label="Пошук транспорту" />
          </label>
          <div className="transport-vehicle-list">
            {categorizedVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                className={`transport-vehicle${activeVehicle?.id === vehicle.id ? " is-selected" : ""}`}
                type="button"
                onClick={() => setSelectedId(vehicle.id)}
              >
                <span className="transport-vehicle__avatar" aria-hidden="true">▰</span>
                <span className="transport-vehicle__main">
                  <strong>{vehicle.plate}</strong>
                  <span>{vehicle.make}</span>
                  <span className="transport-vehicle__meta">{vehicle.body} · {vehicle.year}</span>
                </span>
                <span className={`transport-status-dot${vehicle.status === "У рейсі" ? " is-moving" : ""}`} title={vehicle.status} />
              </button>
            ))}
            {categorizedVehicles.length === 0 && <p className="transport-empty">У цій категорії транспортних засобів не знайдено.</p>}
          </div>
          <div className="transport-fleet__legend"><span /> На базі <span className="is-moving" /> У рейсі</div>
        </aside>

        <section className="transport-record">
          {activeVehicle ? (
            <>
              <header className="transport-record__header">
                <div className="transport-record__identity">
                  <span className="transport-record__vehicle-icon" aria-hidden="true">▰</span>
                  <div>
                    <div className="transport-record__title">
                      <h2>{activeVehicle.make}</h2>
                      <span className={`transport-status${activeVehicle.status === "У рейсі" ? " is-moving" : ""}`}>
                        <span />{activeVehicle.status}
                      </span>
                    </div>
                    <p>{activeVehicle.plate}{activeVehicle.trailerPlate ? ` / ${activeVehicle.trailerPlate}` : ""} <span>·</span> {activeVehicle.type}</p>
                  </div>
                </div>
                <button className="transport-button transport-button--secondary transport-edit-button" type="button" onClick={() => {
                  setEditingId(activeVehicle.id);
                  setIsAddOpen(true);
                }}>
                  Редагувати дані
                </button>
              </header>

              {getDocumentAlerts(activeVehicle) > 0 && (
                <div className="transport-alert-banner">
                  <span aria-hidden="true">!</span>
                  <div><strong>Перевірте терміни дії документів</strong><small>{getDocumentAlerts(activeVehicle)} документ(и) потребують уваги.</small></div>
                  <button type="button" onClick={() => setActiveTab("documents")}>Переглянути</button>
                </div>
              )}

              <nav className="transport-tabs" aria-label="Інформація про транспорт">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={visibleActiveTab === tab.id ? "is-active" : ""}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={visibleActiveTab === tab.id ? "page" : undefined}
                  >
                    {tab.label}
                    {tab.id === "documents" && getDocumentAlerts(activeVehicle) > 0 && <span className="transport-tabs__count">{getDocumentAlerts(activeVehicle)}</span>}
                  </button>
                ))}
              </nav>
              <div className="transport-tab-content">{renderActiveTab()}</div>
            </>
          ) : (
            <div className="transport-no-selection">
              <span aria-hidden="true">▰</span>
              <h2>Оберіть транспортний засіб</h2>
              <p>Виберіть запис зі списку або додайте новий до автопарку.</p>
              <button
                className="transport-button transport-button--primary"
                type="button"
                onClick={() => openAddDialog(activeFleetType === "trailers" ? "Напівпричіп" : "Тягач")}
              >
                {activeFleetType === "trailers" ? "Додати причіп" : "Додати автомобіль"}
              </button>
            </div>
          )}
        </section>
      </div>}
      {isAddOpen && (
        <TransportEditor
          initialVehicle={editingId === null ? null : vehicles.find((vehicle) => vehicle.id === editingId)}
          defaultType={newVehicleType}
          isTrailerCategory={activeFleetType === "trailers"}
          apiData={apiData}
          onClose={closeDialog}
          onSubmit={saveVehicle}
          onDelete={deleteVehicle}
          onPreview={previewFile}
          onDownload={downloadFile}
        />
      )}
      {filePreview && (
        <AttachmentPreview key={filePreview.id} attachment={filePreview} onClose={() => setFilePreview(null)} />
      )}
    </div>
  );
}

export default TransportPage;
