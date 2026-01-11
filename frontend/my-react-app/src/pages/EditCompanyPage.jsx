import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { useCompany } from "../context/CompanyContext";
import { useApi } from "../context/ApiContext";
import NovaPoshtaForm from "../components/common/NovaPoshtaForm";
import NovaPoshtaDisplay from "../components/common/NovaPoshtaDisplay";

const currencies = [
  { code: 0, name: "UAH - Українська гривня" },
  { code: 1, name: "USD - Долар США" },
  { code: 2, name: "EUR - Євро" },
  { code: 3, name: "PLN - Злотий" },
  { code: 4, name: "GBP - Фунт стерлінгів" }
];

const accountTypes = [
  { value: 0, name: "Гривневий" },
  { value: 1, name: "Валютний" }
];

const positionTypes = [
  { value: 0, name: "Директор" },
  { value: 1, name: "Бухгалтер" },
  { value: 2, name: "Менеджер" },
  { value: 3, name: "Представник" }
];

function Section({ title, children }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-3">{title}</h5>
        {children}
      </div>
    </div>
  );
}

function EditCompanyPage({ setActiveSection }) {
  const { companyId } = useCompany();
  const { apiData } = useApi();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    fullName: "",
    position: 2,
    phoneNumber: "",
    email: ""
  });
  const { pushToast } = useToast();
  const [isEditingNP, setIsEditingNP] = useState(false);
  
  const API_URL = `${apiData}/company`;
  const PEOPLE_API = `${apiData}/managementPeaple`;

  useEffect(() => {
    if (!companyId) {
      pushToast("Немає ID компанії", "error");
      return;
    }

    console.log("Запит до:", `${API_URL}/${companyId}`);
    
    fetch(`${API_URL}/${companyId}`)
      .then(async res => {
        console.log("Статус відповіді:", res.status, res.statusText);
        
        if (!res.ok) {
          const text = await res.text();
          console.error("Відповідь сервера:", text.substring(0, 500));
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const contentType = res.headers.get("content-type");
        console.log("Content-Type:", contentType);
        
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Отримано не JSON:", text.substring(0, 500));
          throw new Error("Сервер повернув не JSON відповідь");
        }
        
        return res.json();
      })
      .then(data => {
        console.log("Отримані дані компанії:", data);
        setForm({
          name: data.name ?? "",
          companyType: data.companyType ?? "",
          codeCompany: data.codeCompany ?? "",
          ipn: data.ipn ?? "",
          taxSystem: data.taxSystem ?? "",
          additionalInfo: data.additionalInfo ?? "",
          logoPath: data.logoPath ?? "",

          phoneNumber: data.contact?.phoneNumber ?? "",
          email: data.contact?.email ?? "",
          website: data.contact?.website ?? "",

          legalAddress_Country: data.legalAddress?.country ?? "",
          legalAddress_City: data.legalAddress?.city ?? "",
          legalAddress_Region: data.legalAddress?.region ?? "",
          legalAddress_PostalCode: data.legalAddress?.postalCode ?? "",
          legalAddress_StreetAddress: data.legalAddress?.streetAddress ?? "",
          legalAddress_BuildingNumber: data.legalAddress?.buildingNumber ?? "",
          legalAddress_ApartmentNumber: data.legalAddress?.apartmentNumber ?? "",

          ukrPoshtaAddress_Country: data.ukrPoshtaAddress?.country ?? "",
          ukrPoshtaAddress_City: data.ukrPoshtaAddress?.city ?? "",
          ukrPoshtaAddress_Region: data.ukrPoshtaAddress?.region ?? "",
          ukrPoshtaAddress_PostalCode: data.ukrPoshtaAddress?.postalCode ?? "",
          ukrPoshtaAddress_StreetAddress: data.ukrPoshtaAddress?.streetAddress ?? "",
          ukrPoshtaAddress_BuildingNumber: data.ukrPoshtaAddress?.buildingNumber ?? "",
          ukrPoshtaAddress_ApartmentNumber: data.ukrPoshtaAddress?.apartmentNumber ?? "",

          novaPoshtaRecipientType: data.novaPoshtaRecipient?.recipientType?.toString() ?? "",
          nP_Phone: data.novaPoshtaRecipient?.phone ?? "",
          nP_LastName: data.novaPoshtaRecipient?.lastName ?? "",
          nP_FirstName: data.novaPoshtaRecipient?.firstName ?? "",
          nP_MiddleName: data.novaPoshtaRecipient?.middleName ?? "",
          nP_EdrpouCode: data.novaPoshtaRecipient?.edrpouCode ?? "",
          nP_CompanyName: data.novaPoshtaRecipient?.companyName ?? "",
          nP_OwnershipForm: data.novaPoshtaRecipient?.ownershipForm ?? "",
          nP_OrgPhone: data.novaPoshtaRecipient?.orgPhone ?? "",
          nP_OrgLastName: data.novaPoshtaRecipient?.orgLastName ?? "",
          nP_OrgFirstName: data.novaPoshtaRecipient?.orgFirstName ?? "",
          nP_OrgMiddleName: data.novaPoshtaRecipient?.orgMiddleName ?? "",

          novaPoshtaDeliveryType: data.novaPoshtaDelivery?.deliveryType?.toString() ?? "",
          npD_City: data.novaPoshtaDelivery?.city ?? "",
          npD_Branch: data.novaPoshtaDelivery?.branch ?? "",
          npD_Street: data.novaPoshtaDelivery?.street ?? "",
          npD_Building: data.novaPoshtaDelivery?.building ?? "",
          npD_Apartment: data.novaPoshtaDelivery?.apartment ?? "",
          npD_AddressComment: data.novaPoshtaDelivery?.addressComment ?? "",
          npD_PostomatNumber: data.novaPoshtaDelivery?.postomatNumber ?? "",
          npD_DigitalAddressReference: data.novaPoshtaDelivery?.digitalAddressReference ?? "",

          actualAddress_Country: data.actualAddress?.country ?? "",
          actualAddress_City: data.actualAddress?.city ?? "",
          actualAddress_Region: data.actualAddress?.region ?? "",
          actualAddress_PostalCode: data.actualAddress?.postalCode ?? "",
          actualAddress_StreetAddress: data.actualAddress?.streetAddress ?? "",
          actualAddress_BuildingNumber: data.actualAddress?.buildingNumber ?? "",
          actualAddress_ApartmentNumber: data.actualAddress?.apartmentNumber ?? "",

          bankDetails: (data.bankDetails || []).map(bd => ({
            typeAccount: bd.typeAccount ?? 0,
            currency: bd.currency ?? 0,
            bankName: bd.bankName ?? "",
            bankMfo: bd.bankMfo ?? "",
            iban: bd.iban ?? "",
            swift: bd.swift ?? "",
            bankOfBeneficiary: bd.bankOfBeneficiary ?? "",
            correspondentBanks: (bd.correspondentBanks || []).map(cb => ({
              bankName: cb.bankName ?? "",
              swift: cb.swift ?? ""
            }))
          })),

          apiNovaPoshtaKey: data.apiKeys?.novaPoshta ?? "",
          apiLardyTransKey: data.apiKeys?.lardyTrans ?? ""
        });

        setLoading(false);
      })
      .catch((error) => {
        console.error("Деталі помилки:", error);
        pushToast(`Помилка завантаження: ${error.message}`, "error");
        setLoading(false);
      });
      
    // Завантажуємо список людей
    fetch(`${PEOPLE_API}/bycompany/${companyId}`)
      .then(async res => {
        if (!res.ok) {
          if (res.status === 404) {
            return [];
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return [];
        }
        return res.json();
      })
      .then(data => setPeople(data || []))
      .catch(err => {
        console.error("Помилка завантаження персоналу:", err);
      });
  }, [companyId, apiData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (index, field, value) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      if (field === 'typeAccount') {
        const typeVal = parseInt(value);
        if (typeVal === 0) {
          newBankDetails[index] = {
            typeAccount: 0,
            currency: 0,
            bankName: newBankDetails[index].bankName,
            bankMfo: newBankDetails[index].bankMfo,
            iban: "",
            swift: "",
            bankOfBeneficiary: "",
            correspondentBanks: []
          };
        } else {
          newBankDetails[index] = { ...newBankDetails[index], typeAccount: typeVal };
        }
      } else {
        newBankDetails[index] = { ...newBankDetails[index], [field]: value };
      }
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const addCorrespondentBank = (bankIndex) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      const bank = { ...newBankDetails[bankIndex] };
      bank.correspondentBanks = [...(bank.correspondentBanks || []), { bankName: "", swift: "" }];
      newBankDetails[bankIndex] = bank;
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const removeCorrespondentBank = (bankIndex, cbIndex) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      const bank = { ...newBankDetails[bankIndex] };
      bank.correspondentBanks = (bank.correspondentBanks || []).filter((_, i) => i !== cbIndex);
      newBankDetails[bankIndex] = bank;
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const handleCorrespondentBankChange = (bankIndex, cbIndex, field, value) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      const bank = { ...newBankDetails[bankIndex] };
      const cbs = [...(bank.correspondentBanks || [])];
      cbs[cbIndex] = { ...cbs[cbIndex], [field]: value };
      bank.correspondentBanks = cbs;
      newBankDetails[bankIndex] = bank;
      return { ...prev, bankDetails: newBankDetails };
    });
  };

  const addBankAccount = () => {
    setForm(prev => ({
      ...prev,
      bankDetails: [
        ...prev.bankDetails,
        {
          typeAccount: 0,
          currency: 0,
          bankName: "",
          bankMfo: "",
          iban: "",
          swift: "",
          bankOfBeneficiary: "",
          correspondentBanks: []
        }
      ]
    }));
  };

  const removeBankAccount = (index) => {
    if (form.bankDetails.length === 1) {
      pushToast("Має залишитись хоча б один банківський рахунок", "warning");
      return;
    }
    setForm(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.filter((_, i) => i !== index)
    }));
  };

  const handlePersonChange = (e) => {
    const { name, value } = e.target;
    setNewPerson(prev => ({ ...prev, [name]: name === 'position' ? parseInt(value) : value }));
  };

  const addPerson = async () => {
    if (!newPerson.fullName.trim()) {
      pushToast("Введіть ім'я працівника", "warning");
      return;
    }

    try {
      const res = await fetch(`${PEOPLE_API}/add?companyId=${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPerson, companyId })
      });

      if (!res.ok) throw new Error();
      
      pushToast("Працівника додано", "success");
      
      const updatedPeople = await fetch(`${PEOPLE_API}/bycompany/${companyId}`).then(r => r.json());
      setPeople(updatedPeople);
      
      setNewPerson({ fullName: "", position: 2, phoneNumber: "", email: "" });
    } catch {
      pushToast("Помилка додавання працівника", "error");
    }
  };

  const deletePerson = async (personId) => {
    if (!window.confirm("Видалити цього працівника?")) return;

    try {
      const res = await fetch(`${PEOPLE_API}/${personId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      
      pushToast("Працівника видалено", "success");
      setPeople(prev => prev.filter(p => p.id !== personId));
    } catch {
      pushToast("Помилка видалення", "error");
    }
  };

  const mapFormToDto = (f) => ({
    name: f.name,
    companyType: f.companyType,
    codeCompany: f.codeCompany,
    ipn: f.ipn,
    taxSystem: f.taxSystem,
    additionalInfo: f.additionalInfo,
    logoPath: f.logoPath,
    phoneNumber: f.phoneNumber,
    email: f.email,
    website: f.website,
    legalAddress_Country: f.legalAddress_Country,
    legalAddress_City: f.legalAddress_City,
    legalAddress_Region: f.legalAddress_Region,
    legalAddress_PostalCode: f.legalAddress_PostalCode,
    legalAddress_StreetAddress: f.legalAddress_StreetAddress,
    legalAddress_BuildingNumber: f.legalAddress_BuildingNumber,
    legalAddress_ApartmentNumber: f.legalAddress_ApartmentNumber,
    ukrPoshtaAddress_Country: f.ukrPoshtaAddress_Country,
    ukrPoshtaAddress_City: f.ukrPoshtaAddress_City,
    ukrPoshtaAddress_Region: f.ukrPoshtaAddress_Region,
    ukrPoshtaAddress_PostalCode: f.ukrPoshtaAddress_PostalCode,
    ukrPoshtaAddress_StreetAddress: f.ukrPoshtaAddress_StreetAddress,
    ukrPoshtaAddress_BuildingNumber: f.ukrPoshtaAddress_BuildingNumber,
    ukrPoshtaAddress_ApartmentNumber: f.ukrPoshtaAddress_ApartmentNumber,
    novaPoshtaRecipientType: f.novaPoshtaRecipientType === "" ? null : parseInt(f.novaPoshtaRecipientType),
    nP_Phone: f.nP_Phone,
    nP_LastName: f.nP_LastName,
    nP_FirstName: f.nP_FirstName,
    nP_MiddleName: f.nP_MiddleName,
    nP_EdrpouCode: f.nP_EdrpouCode,
    nP_CompanyName: f.nP_CompanyName,
    nP_OwnershipForm: f.nP_OwnershipForm,
    nP_OrgPhone: f.nP_OrgPhone,
    nP_OrgLastName: f.nP_OrgLastName,
    nP_OrgFirstName: f.nP_OrgFirstName,
    nP_OrgMiddleName: f.nP_OrgMiddleName,
    novaPoshtaDeliveryType: f.novaPoshtaDeliveryType === "" ? null : parseInt(f.novaPoshtaDeliveryType),
    npD_City: f.npD_City,
    npD_Branch: f.npD_Branch,
    npD_Street: f.npD_Street,
    npD_Building: f.npD_Building,
    npD_Apartment: f.npD_Apartment,
    npD_AddressComment: f.npD_AddressComment,
    npD_PostomatNumber: f.npD_PostomatNumber,
    npD_DigitalAddressReference: f.npD_DigitalAddressReference,
    actualAddress_Country: f.actualAddress_Country,
    actualAddress_City: f.actualAddress_City,
    actualAddress_Region: f.actualAddress_Region,
    actualAddress_PostalCode: f.actualAddress_PostalCode,
    actualAddress_StreetAddress: f.actualAddress_StreetAddress,
    actualAddress_BuildingNumber: f.actualAddress_BuildingNumber,
    actualAddress_ApartmentNumber: f.actualAddress_ApartmentNumber,
    managementPeaple: [],
    bankDetails: f.bankDetails.map(bd => ({
      typeAccount: bd.typeAccount,
      currency: bd.currency,
      bankName: bd.bankName,
      bankMfo: bd.bankMfo,
      iban: bd.iban || null,
      swift: bd.swift || null,
      bankOfBeneficiary: bd.bankOfBeneficiary || null,
      correspondentBanks: (bd.correspondentBanks || []).map(cb => ({
        bankName: cb.bankName,
        swift: cb.swift
      }))
    })),
    apiNovaPoshtaKey: f.apiNovaPoshtaKey,
    apiLardyTransKey: f.apiLardyTransKey
  });

  const handleSubmit = async () => {
    try {
      const dto = mapFormToDto(form);
      const res = await fetch(`${API_URL}/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
      });

      if (!res.ok) throw new Error();
      pushToast("Дані збережено", "success");
      setActiveSection("mycompany");
    } catch {
      pushToast("Помилка збереження", "error");
    }
  };

  const handleCancel = () => {
    setActiveSection("mycompany");
  };

  if (loading) return <div className="text-center mt-5">Завантаження...</div>;
  if (!form) return <div className="text-center mt-5">Немає даних</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Редагування компанії</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handleSubmit}>
            💾 Зберегти
          </button>
          <button className="btn btn-outline-secondary" onClick={handleCancel}>
            ↩️ Скасувати
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>🏢 Основна інформація</h5>
              <div className="mb-2">
                <label className="form-label">Назва компанії</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label className="form-label">Тип компанії</label>
                <input className="form-control" name="companyType" value={form.companyType} onChange={handleChange} placeholder="ТОВ, ПП, ФОП..." />
              </div>
              <div className="mb-2">
                <label className="form-label">ЄДРПОУ</label>
                <input className="form-control" name="codeCompany" value={form.codeCompany} onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label className="form-label">ІПН</label>
                <input className="form-control" name="ipn" value={form.ipn} onChange={handleChange} />
              </div>
              <div className="mb-0">
                <label className="form-label">Податкова система</label>
                <input className="form-control" name="taxSystem" value={form.taxSystem} onChange={handleChange} placeholder="Загальна, спрощена..." />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>👥 Керівництво та персонал</h5>
              <div className="mb-3">
                <h6 style={{ color: '#e60000' }}>Список працівників</h6>
                {people.length > 0 ? (
                  <div className="list-group mb-3">
                    {people.map((person) => (
                      <div key={person.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className="badge bg-primary me-2">{positionTypes.find(p => p.value === person.position)?.name}</span>
                          <strong>{person.fullName}</strong>
                          {person.phoneNumber && <div className="small text-muted">📞 {person.phoneNumber}</div>}
                          {person.email && <div className="small text-muted">✉️ {person.email}</div>}
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => deletePerson(person.id)}>🗑️</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Немає працівників</p>
                )}
                
                <h6 className="mt-3" style={{ color: '#e60000' }}>➕ Додати нового працівника</h6>
                <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="mb-2">
                    <label className="form-label">ПІБ</label>
                    <input className="form-control" name="fullName" value={newPerson.fullName} onChange={handlePersonChange} placeholder="Повне ім'я" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Посада</label>
                    <select className="form-control" name="position" value={newPerson.position} onChange={handlePersonChange}>
                      {positionTypes.map(pos => (
                        <option key={pos.value} value={pos.value}>{pos.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Телефон</label>
                    <input className="form-control" name="phoneNumber" value={newPerson.phoneNumber} onChange={handlePersonChange} placeholder="+380..." />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email" name="email" value={newPerson.email} onChange={handlePersonChange} placeholder="email@example.com" />
                  </div>
                  <button className="btn btn-success btn-sm w-100" onClick={addPerson}>+ Додати працівника</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📞 Контактна інформація</h5>
              <div className="mb-2">
                <label className="form-label">Телефон</label>
                <input className="form-control" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+380..." />
              </div>
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
              <div className="mb-0">
                <label className="form-label">Веб-сайт</label>
                <input className="form-control" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📍 Юридична адреса</h5>
              <div className="row g-2">
                <div className="col-8">
                  <label className="form-label">Вулиця</label>
                  <input className="form-control" name="legalAddress_StreetAddress" value={form.legalAddress_StreetAddress} onChange={handleChange} placeholder="Вулиця" />
                </div>
                <div className="col-2">
                  <label className="form-label">Буд.</label>
                  <input className="form-control" name="legalAddress_BuildingNumber" value={form.legalAddress_BuildingNumber} onChange={handleChange} placeholder="№" />
                </div>
                <div className="col-2">
                  <label className="form-label">Кв.</label>
                  <input className="form-control" name="legalAddress_ApartmentNumber" value={form.legalAddress_ApartmentNumber} onChange={handleChange} placeholder="№" />
                </div>
              </div>
              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label">Місто</label>
                  <input className="form-control" name="legalAddress_City" value={form.legalAddress_City} onChange={handleChange} placeholder="Місто" />
                </div>
                <div className="col-6">
                  <label className="form-label">Регіон</label>
                  <input className="form-control" name="legalAddress_Region" value={form.legalAddress_Region} onChange={handleChange} placeholder="Область" />
                </div>
              </div>
              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label">Країна</label>
                  <input className="form-control" name="legalAddress_Country" value={form.legalAddress_Country} onChange={handleChange} placeholder="Україна" />
                </div>
                <div className="col-6">
                  <label className="form-label">Індекс</label>
                  <input className="form-control" name="legalAddress_PostalCode" value={form.legalAddress_PostalCode} onChange={handleChange} placeholder="00000" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📮 Фактична (Поштова) адреса</h5>
              <div className="row g-2">
                <div className="col-8">
                  <label className="form-label">Вулиця</label>
                  <input className="form-control" name="ukrPoshtaAddress_StreetAddress" value={form.ukrPoshtaAddress_StreetAddress} onChange={handleChange} placeholder="Вулиця" />
                </div>
                <div className="col-2">
                  <label className="form-label">Буд.</label>
                  <input className="form-control" name="ukrPoshtaAddress_BuildingNumber" value={form.ukrPoshtaAddress_BuildingNumber} onChange={handleChange} placeholder="№" />
                </div>
                <div className="col-2">
                  <label className="form-label">Кв.</label>
                  <input className="form-control" name="ukrPoshtaAddress_ApartmentNumber" value={form.ukrPoshtaAddress_ApartmentNumber} onChange={handleChange} placeholder="№" />
                </div>
              </div>
              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label">Місто</label>
                  <input className="form-control" name="ukrPoshtaAddress_City" value={form.ukrPoshtaAddress_City} onChange={handleChange} placeholder="Місто" />
                </div>
                <div className="col-6">
                  <label className="form-label">Регіон</label>
                  <input className="form-control" name="ukrPoshtaAddress_Region" value={form.ukrPoshtaAddress_Region} onChange={handleChange} placeholder="Область" />
                </div>
              </div>
              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label">Країна</label>
                  <input className="form-control" name="ukrPoshtaAddress_Country" value={form.ukrPoshtaAddress_Country} onChange={handleChange} placeholder="Україна" />
                </div>
                <div className="col-6">
                  <label className="form-label">Індекс</label>
                  <input className="form-control" name="ukrPoshtaAddress_PostalCode" value={form.ukrPoshtaAddress_PostalCode} onChange={handleChange} placeholder="00000" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📝 Додаткова інформація</h5>
              <textarea className="form-control" rows="8" name="additionalInfo" value={form.additionalInfo} onChange={handleChange} placeholder="Коментар / примітки" />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Банківські реквізити</h5>
                <button className="btn btn-success btn-sm" onClick={addBankAccount}>
                  + Додати рахунок
                </button>
              </div>

              <div className="row g-3">
                {form.bankDetails.map((bank, index) => (
                  <div key={index} className="col-md-6">
                    <div className="card border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6>Рахунок #{index + 1} <span className="badge bg-primary ms-2">{accountTypes.find(t => t.value === bank.typeAccount)?.name}</span></h6>
                          <button className="btn btn-danger btn-sm" onClick={() => removeBankAccount(index)}>🗑️</button>
                        </div>
                        <hr />

                        <p className="mb-1"><strong>Тип рахунку:</strong> 
                          <select className="form-control d-inline-block w-50 ms-2" value={bank.typeAccount} onChange={(e) => handleBankChange(index, 'typeAccount', e.target.value)}>
                            {accountTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.name}</option>
                            ))}
                          </select>
                        </p>

                        <p className="mb-1"><strong>Валюта:</strong> 
                          <select className="form-control d-inline-block w-50 ms-2" value={bank.currency} onChange={(e) => handleBankChange(index, 'currency', parseInt(e.target.value))} disabled={bank.typeAccount === 0}>
                            {bank.typeAccount === 0 ? (
                              <option value={0}>{currencies.find(c => c.code === 0).name}</option>
                            ) : (
                              currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>{curr.name}</option>
                              ))
                            )}
                          </select>
                        </p>

                        <p className="mb-1"><strong>Банк:</strong> <input className="form-control d-inline-block w-75" value={bank.bankName || ""} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} /></p>
                        
                        {bank.typeAccount === 0 ? (
                          <>
                            <p className="mb-1"><strong>IBAN:</strong> <input className="form-control d-inline-block w-75" value={bank.iban || ""} onChange={(e) => handleBankChange(index, 'iban', e.target.value)} /></p>
                            <p className="mb-1"><strong>МФО:</strong> <input className="form-control d-inline-block w-75" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} /></p>
                          </>
                        ) : (
                          <>
                            <p className="mb-1"><strong>IBAN:</strong> <input className="form-control d-inline-block w-75" value={bank.iban || ""} onChange={(e) => handleBankChange(index, 'iban', e.target.value)} /></p>
                            <p className="mb-1"><strong>SWIFT:</strong> <input className="form-control d-inline-block w-75" value={bank.swift || ""} onChange={(e) => handleBankChange(index, 'swift', e.target.value)} /></p>
                            <p className="mb-1"><strong>Адреса банку:</strong> <input className="form-control d-inline-block w-75" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} /></p>
                            
                            {bank.correspondentBanks && bank.correspondentBanks.length > 0 && (
                              <div className="mt-2">
                                <strong>Банки-кореспонденти:</strong>
                                <ul className="mb-0 mt-1">
                                  {bank.correspondentBanks.map((cb, cbIndex) => (
                                    <li key={cbIndex} className="mb-2">
                                      <input className="form-control d-inline-block" style={{width: '40%'}} placeholder="Назва банку" value={cb.bankName || ""} onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'bankName', e.target.value)} />
                                      {' '}
                                      <input className="form-control d-inline-block" style={{width: '30%'}} placeholder="SWIFT" value={cb.swift || ""} onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'swift', e.target.value)} />
                                      {' '}
                                      <button className="btn btn-outline-danger btn-sm" onClick={() => removeCorrespondentBank(index, cbIndex)}>🗑</button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <button className="btn btn-sm btn-secondary mt-2" onClick={() => addCorrespondentBank(index)}>+ Додати банк-кореспондент</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Нова Пошта */}
      {isEditingNP ? (
        <>
          <div className="row g-4 mb-2">
            <div className="col-12 text-end">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsEditingNP(false)}
              >
                ✖️ Закрити редагування
              </button>
            </div>
          </div>
          <NovaPoshtaForm form={form} setForm={setForm} isEditing={true} />
        </>
      ) : (
        <>
          <NovaPoshtaDisplay form={form} />
          <div className="row g-4 mb-4">
            <div className="col-12 text-center">
              <button 
                className="btn btn-outline-primary"
                onClick={() => setIsEditingNP(true)}
              >
                ✏️ Редагувати дані Нової Пошти
              </button>
            </div>
          </div>
        </>
      )}

      {/* Старий блок Нової Пошти видалено - тепер використовується NovaPoshtaForm */}

      <div className="row g-4 mb-5">
        <div className="col-md-12">
          <div className="card shadow-sm" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>🔑 API інтеграції</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">🚚 Nova Poshta API Key</label>
                  <input className="form-control" name="apiNovaPoshtaKey" value={form.apiNovaPoshtaKey} onChange={handleChange} placeholder="Введіть API ключ Нової Пошти" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">🚛 LardyTrans API Key</label>
                  <input className="form-control" name="apiLardyTransKey" value={form.apiLardyTransKey} onChange={handleChange} placeholder="Введіть API ключ LardyTrans" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCompanyPage;