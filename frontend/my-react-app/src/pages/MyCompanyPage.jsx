import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { useApi } from "../context/ApiContext";
import NovaPoshtaDisplay from "../components/common/NovaPoshtaDisplay";
import "../styles/my-company.css";


function Section({ title, children }) {
  return (
    <div className="card shadow-sm h-100 my-company-card">
      <div className="card-body">
        <h5 className="mb-3 my-company-card__title">{title}</h5>
        {children}
      </div>
    </div>
  );
}

function MyCompanyPage({ setActiveSection }) {
  const { companyId } = useCompany();
  const { apiData } = useApi();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");

  const API_URL = `${apiData}/company`;


  useEffect(() => {
    if (!companyId) return;

    fetch(`${API_URL}/${companyId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        console.log(res.json);
        return res.json();
      })
      .then(data => setCompany(data))
      .catch(err => {
        console.error("Помилка завантаження компанії:", err);
        setError("Не вдалося завантажити дані компанії. Перевірте підключення до сервера.");
      });
  }, [companyId, API_URL]);

  if (!companyId) {
    return (
      <div className="my-company-page">
        <div className="card p-4 shadow-sm my-company-card">
          <h4 className="mb-2">Компанію ще не створено</h4>
          <p className="text-muted mb-3">Створіть компанію, щоб почати роботу. Вона буде прив’язана до вашого облікового запису.</p>
          <button className="btn btn-primary align-self-start" onClick={() => setActiveSection("settings")}>
            Створити компанію
          </button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="my-company-page">
        {error ? (
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Помилка!</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">
              Перевірте, чи запущений сервер на <strong>{API_URL}</strong>
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Завантаження...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currencyNames = {
    0: "UAH",
    1: "USD",
    2: "EUR",
    3: "PLN",
    4: "GBP"
  };

  const accountTypeNames = {
    0: "Гривневий",
    1: "Валютний"
  };

  const positionNames = {
    0: "Директор",
    1: "Бухгалтер",
    2: "Менеджер",
    3: "Інше"
  };
  console.log(company);
  // Отримуємо дані з вкладених структур
  const phone = company.contact?.phoneNumber || "";
  const email = company.contact?.email || "";
  const website = company.contact?.website || "";

  const legal = company.legalAddress || {};
  const ukrPoshta = company.ukrPoshtaAddress || {};
  const actual = company.actualAddress || {};

  // Підготовка даних Нової Пошти у форматі форми для NovaPoshtaDisplay
  const novaPoshtaForm = {
    novaPoshtaRecipientType: company.novaPoshtaRecipient?.recipientType?.toString() || "",
    nP_Phone: company.novaPoshtaRecipient?.phone || "",
    nP_LastName: company.novaPoshtaRecipient?.lastName || "",
    nP_FirstName: company.novaPoshtaRecipient?.firstName || "",
    nP_MiddleName: company.novaPoshtaRecipient?.middleName || "",
    nP_EdrpouCode: company.novaPoshtaRecipient?.edrpouCode || "",
    nP_CompanyName: company.novaPoshtaRecipient?.companyName || "",
    nP_OwnershipForm: company.novaPoshtaRecipient?.ownershipForm || "",
    nP_OrgPhone: company.novaPoshtaRecipient?.organizationPhone || "",
    nP_OrgLastName: company.novaPoshtaRecipient?.organizationLastName || "",
    nP_OrgFirstName: company.novaPoshtaRecipient?.organizationFirstName || "",
    nP_OrgMiddleName: company.novaPoshtaRecipient?.organizationMiddleName || "",
    novaPoshtaDeliveryType: company.novaPoshtaDelivery?.deliveryType?.toString() || "",
    npD_City: company.novaPoshtaDelivery?.city || "",
    npD_Branch: company.novaPoshtaDelivery?.branch || "",
    npD_Street: company.novaPoshtaDelivery?.street || "",
    npD_Building: company.novaPoshtaDelivery?.building || "",
    npD_Apartment: company.novaPoshtaDelivery?.apartment || "",
    npD_AddressComment: company.novaPoshtaDelivery?.addressComment || "",
    npD_PostomatNumber: company.novaPoshtaDelivery?.postomatNumber || "",
    npD_DigitalAddressReference: company.novaPoshtaDelivery?.digitalAddressReference || ""
  };

  // Отримуємо список працівників
  const managementPeople = company.managementPeaple || [];

  return (
    <div className="my-company-page">
      <div className="sticky-action-bar my-company-actions">
        <div className="my-company-heading">
          <span className="my-company-eyebrow">ПРОФІЛЬ КОМПАНІЇ</span>
          <h1 className="mb-0">{company.name}</h1>
        </div>
        <div className="my-company-actions__controls">
          <button
            className="btn btn-primary"
            onClick={() => setActiveSection("editcompany")}
          >
            ✏️ Редагувати
          </button>
        </div>
      </div>
    
      {/* ===== РЯД 1 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 my-company-card">
            <div className="card-body">
              <h5 className="mb-3 my-company-card__title">🏢 Основна інформація</h5>
              <p className="mb-2"><strong>Тип:</strong> {company.companyType || "—"}</p>
              <p className="mb-2"><strong>ЄДРПОУ:</strong> {company.codeCompany || "—"}</p>
              <p className="mb-2"><strong>ІПН:</strong> {company.ipn || "—"}</p>
              <p className="mb-0"><strong>Податкова система:</strong> {company.taxSystem || "—"}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100 my-company-card">
            <div className="card-body">
              <h5 className="mb-3 my-company-card__title">👥 Керівництво та персонал</h5>
              {managementPeople.length > 0 ? (
                <div>
                  {managementPeople.map((person, index) => (
                    <div key={index} className="mb-3 pb-2 border-bottom">
                      <p className="mb-1">
                        <span className="badge bg-primary me-2">{positionNames[person.position] || "Інше"}</span>
                        <strong>{person.fullName || "—"}</strong>
                      </p>
                      {person.phoneNumber && (
                        <p className="mb-1 text-muted small">📞 {person.phoneNumber}</p>
                      )}
                      {person.email && (
                        <p className="mb-0 text-muted small">✉️ {person.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Інформація про персонал відсутня</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 2 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 my-company-card">
            <div className="card-body">
              <h5 className="mb-3 my-company-card__title">📞 Контактна інформація</h5>
              <p className="mb-2"><strong>Телефон:</strong> {phone || "—"}</p>
              <p className="mb-2"><strong>Електронна пошта:</strong> {email || "—"}</p>
              <p className="mb-0"><strong>Сайт:</strong> {website || "—"}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100 my-company-card">
            <div className="card-body">
              <h5 className="mb-3 my-company-card__title">📍 Юридична адреса</h5>
              <p className="mb-2"><strong>Адреса:</strong> {legal.streetAddress || "—"} {legal.buildingNumber || ""}, кв.(офіс) {legal.apartmentNumber || "—"}</p>
              <p className="mb-2"><strong>Населений пункт/Регіон:</strong> {legal.city || "—"}, {legal.region || "—"}</p>
              <p className="mb-0"><strong>Країна/Індекс:</strong> {legal.country || "—"}, {legal.postalCode || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 3 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 my-company-card">
            <div className="card-body">
              <h5 className="mb-3 my-company-card__title">📮 Укр. пошта</h5>
              <p className="mb-2"><strong>Адреса:</strong> {ukrPoshta.streetAddress || "—"} {ukrPoshta.buildingNumber || ""}</p>
              <p className="mb-2"><strong>Кв.(офіс):</strong> {ukrPoshta.apartmentNumber || "—"}</p>
              <p className="mb-2"><strong>Населений пункт/Регіон:</strong> {ukrPoshta.city || "—"}, {ukrPoshta.region || "—"}</p>
              <p className="mb-0"><strong>Країна/Індекс:</strong> {ukrPoshta.country || "—"}, {ukrPoshta.postalCode || "—"}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100 my-company-card">
            <div className="card-body">
              <h5 className="mb-3 my-company-card__title">📝 Додаткова інформація</h5>
              <p className="mb-0">{company.additionalInfo || "Немає додаткової інформації"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Нова Пошта ===== */}
      <NovaPoshtaDisplay form={novaPoshtaForm} />

      {/* ===== РЯД 4 - Банківські реквізити (список) ===== */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm my-company-card">
            <div className="card-body">
              <h5 className="mb-3 my-company-card__title">Банківські реквізити</h5>
              {company.bankDetails && company.bankDetails.length > 0 ? (
                <div className="row g-3">
                  {company.bankDetails.map((bank, index) => (
                    <div key={index} className="col-md-6">
                      <div className="card border my-company-bank-card">
                        <div className="card-body">
                          <h6 className="card-title">
                            Рахунок #{index + 1} 
                            <span className="badge bg-primary ms-2">
                              {accountTypeNames[bank.typeAccount] || "—"}
                            </span>
                          </h6>
                          <hr />
                          <p className="mb-1"><strong>Валюта:</strong> {currencyNames[bank.currency] || "—"}</p>
                          <p className="mb-1"><strong>Банк:</strong> {bank.bankName || "—"}</p>

                          {bank.typeAccount === 0 ? (
                            // Гривневий: показуємо IBAN і МФО
                            <>
                              <p className="mb-1"><strong>IBAN:</strong> {bank.iban || "—"}</p>
                              <p className="mb-1"><strong>МФО:</strong> {bank.bankMfo || "—"}</p>
                            </>
                          ) : (
                            // Валютний: показуємо IBAN, SWIFT, Адреса банку та банки-кореспонденти
                            <>
                              <p className="mb-1"><strong>IBAN:</strong> {bank.iban || "—"}</p>
                              {bank.swift && (
                                <p className="mb-1"><strong>SWIFT:</strong> {bank.swift}</p>
                              )}
                              {bank.bankMfo && (
                                <p className="mb-1"><strong>Адреса банку:</strong> {bank.bankMfo}</p>
                              )}
                              {bank.correspondentBanks && bank.correspondentBanks.length > 0 && (
                                <div className="mt-2">
                                  <strong>Банки-кореспонденти:</strong>
                                  <ul className="mb-0 mt-1">
                                    {bank.correspondentBanks.map((cb, idx) => (
                                      <li key={idx}>
                                        {cb.bankName || "—"}, <strong>SWIFT: </strong>{cb.swift || "—"}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Банківські реквізити не додано</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 5 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-12 my-company-integrations">
          <Section title="API інтеграції">
            <p><strong>Nova Poshta:</strong> {company.apiKeys?.novaPoshta ? "Налаштовано ✓" : "Не налаштовано"}</p>
            <p><strong>LardyTrans:</strong> {company.apiKeys?.lardyTrans ? "Налаштовано ✓" : "Не налаштовано"}</p>
          </Section>
        </div>
      </div>
      
    </div>
  );
}

export default MyCompanyPage;