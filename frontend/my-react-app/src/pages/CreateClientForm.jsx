import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useCompany } from "../context/CompanyContext";

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
  { value: 3, name: "Інше" }
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

function CreateClientForm() {
  const navigate = useNavigate();
  const { apiData } = useApi();
  const { companyId } = useCompany();
  const API_URL = `${apiData}/client`;
  const PEOPLE_API = `${apiData}/managementPeaple`;

  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    fullName: "",
    position: 2,
    phoneNumber: "",
    email: ""
  });

  const [form, setForm] = useState({
    name: "",
    companyType: "",
    codeCompany: "",
    ipn: "",
    taxSystem: "",
    additionalInfo: "",
    logoPath: "",

    phoneNumber: "",
    email: "",
    website: "",

    legalAddress_Country: "",
    legalAddress_City: "",
    legalAddress_Region: "",
    legalAddress_PostalCode: "",
    legalAddress_StreetAddress: "",
    legalAddress_BuildingNumber: "",
    legalAddress_ApartmentNumber: "",

    ukrPoshtaAddress_Country: "",
    ukrPoshtaAddress_City: "",
    ukrPoshtaAddress_Region: "",
    ukrPoshtaAddress_PostalCode: "",
    ukrPoshtaAddress_StreetAddress: "",
    ukrPoshtaAddress_BuildingNumber: "",
    ukrPoshtaAddress_ApartmentNumber: "",

    novaPoshtaRecipientType: "",
    nP_Phone: "",
    nP_LastName: "",
    nP_FirstName: "",
    nP_MiddleName: "",
    nP_EdrpouCode: "",
    nP_CompanyName: "",
    nP_OwnershipForm: "",
    nP_OrgPhone: "",
    nP_OrgLastName: "",
    nP_OrgFirstName: "",
    nP_OrgMiddleName: "",

    novaPoshtaDeliveryType: "",
    npD_City: "",
    npD_Branch: "",
    npD_Street: "",
    npD_Building: "",
    npD_Apartment: "",
    npD_AddressComment: "",
    npD_PostomatNumber: "",
    npD_DigitalAddressReference: "",

    directorFullName: "",
    accountantFullName: "",

    bankDetails: [
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
    ],

    apiNovaPoshtaKey: "",
    apiLardyTransKey: ""
  });

  // Нова Пошта стейти
  const [citySearch, setCitySearch] = useState("");
  const [npCities, setNpCities] = useState([]);
  const [npWarehouses, setNpWarehouses] = useState([]);
  const [selectedCityRef, setSelectedCityRef] = useState("");

  // Автопідтягування компанії по ЄДРПОУ
  useEffect(() => {
    if (!form?.apiNovaPoshtaKey || !form?.nP_EdrpouCode || form.nP_EdrpouCode.length !== 8) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiData}/novaposhta/counterparty/by-edrpou?apiKey=${encodeURIComponent(form.apiNovaPoshtaKey)}&edrpou=${encodeURIComponent(form.nP_EdrpouCode)}`
        );
        const json = await res.json();

        if (!json?.success || !json?.companyName) {
          console.log("Компанію не знайдено");
          return;
        }

        setForm(prev => ({
          ...prev,
          nP_CompanyName: json.companyName || prev.nP_CompanyName,
          nP_OwnershipForm: json.ownershipForm || prev.nP_OwnershipForm
        }));
        
        alert("✅ Компанію знайдено в Новій Пошті");
      } catch (error) {
        console.error("Помилка пошуку компанії:", error);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [form?.nP_EdrpouCode, form?.apiNovaPoshtaKey, apiData]);

  // Пошук міст (autocomplete)
  useEffect(() => {
    if (!form?.apiNovaPoshtaKey || !citySearch || citySearch.length < 2) {
      setNpCities([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiData}/novaposhta/address/search-settlements?apiKey=${encodeURIComponent(form.apiNovaPoshtaKey)}&cityName=${encodeURIComponent(citySearch)}&limit=20`
        );
        const json = await res.json();
        
        if (json?.data?.[0]?.Addresses) {
          setNpCities(json.data[0].Addresses);
        }
      } catch (error) {
        console.error("Помилка пошуку міст:", error);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [citySearch, form?.apiNovaPoshtaKey, apiData]);

  // Завантаження відділень/поштоматів при виборі міста
  const loadWarehousesForCity = async (cityRef, deliveryType) => {
    if (!form?.apiNovaPoshtaKey || !cityRef) return;

    try {
      let endpoint = "";
      if (deliveryType === "0") {
        endpoint = `${apiData}/novaposhta/address/warehouses?apiKey=${encodeURIComponent(form.apiNovaPoshtaKey)}&cityRef=${encodeURIComponent(cityRef)}`;
      } else if (deliveryType === "2") {
        endpoint = `${apiData}/novaposhta/address/postomats?apiKey=${encodeURIComponent(form.apiNovaPoshtaKey)}&cityRef=${encodeURIComponent(cityRef)}`;
      }

      if (endpoint) {
        const res = await fetch(endpoint);
        const json = await res.json();
        
        if (json?.data) {
          setNpWarehouses(json.data);
        }
      }
    } catch (error) {
      console.error("Помилка завантаження відділень:", error);
    }
  };

  // Відстеження зміни міста для завантаження відділень
  useEffect(() => {
    if (selectedCityRef && form?.novaPoshtaDeliveryType && (form.novaPoshtaDeliveryType === "0" || form.novaPoshtaDeliveryType === "2")) {
      loadWarehousesForCity(selectedCityRef, form.novaPoshtaDeliveryType);
    } else {
      setNpWarehouses([]);
    }
  }, [selectedCityRef, form?.novaPoshtaDeliveryType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (index, field, value) => {
    setForm(prev => {
      const newBankDetails = [...prev.bankDetails];
      if (field === 'typeAccount') {
        const typeVal = value;
        if (typeVal === 0) {
          newBankDetails[index] = {
            ...newBankDetails[index],
            typeAccount: 0,
            currency: 0,
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
      alert("Має залишитись хоча б один банківський рахунок");
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

  const addPerson = () => {
    if (!newPerson.fullName.trim()) {
      alert("Введіть ім'я працівника");
      return;
    }
    
    setPeople(prev => [...prev, { ...newPerson, id: Date.now() }]);
    setNewPerson({ fullName: "", position: 2, phoneNumber: "", email: "" });
  };

  const deletePerson = (personId) => {
    setPeople(prev => prev.filter(p => p.id !== personId));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.codeCompany) {
      alert("Заповніть обов'язкові поля: Назва компанії та ЄДРПОУ");
      return;
    }

    if (!companyId) {
      alert("Не вибрано головну компанію");
      return;
    }

    try {
      // Підготовка даних: конвертуємо порожні рядки в null для int? полів
      const preparedData = {
        ...form,
        parentCompanyId: companyId,
        novaPoshtaRecipientType: form.novaPoshtaRecipientType === "" ? null : parseInt(form.novaPoshtaRecipientType),
        novaPoshtaDeliveryType: form.novaPoshtaDeliveryType === "" ? null : parseInt(form.novaPoshtaDeliveryType)
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedData)
      });

      if (!res.ok) throw new Error("Failed to create client");

      const data = await res.json();
      const newClientId = data.id;
      
      // Додаємо людей до компанії-клієнта
      if (people.length > 0) {
        for (const person of people) {
          try {
            const personData = {
              fullName: person.fullName,
              position: person.position,
              phoneNumber: person.phoneNumber || null,
              email: person.email || null,
              companyId: newClientId
            };
            
            await fetch(`${PEOPLE_API}/add?companyId=${newClientId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(personData)
            });
          } catch (err) {
            console.error("Помилка при додаванні працівника:", err);
          }
        }
      }
      
      alert("Компанію-клієнта успішно створено!");
      navigate(`/clients/${newClientId}`);
    } catch (err) {
      console.error("Помилка створення компанії-клієнта:", err);
      alert("Помилка створення компанії-клієнта");
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <button 
          className="btn btn-outline-secondary me-3"
          onClick={() => navigate('/clients')}
        >
          ← Назад до списку
        </button>
        <h2 className="d-inline">Створення компанії-клієнта</h2>
        <p className="text-muted mt-2">
          Заповніть інформацію про компанію-клієнта. Ці дані будуть використовуватись у документах та рахунках.
        </p>
      </div>

      {/* Основна інформація та Контактні особи */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Основна інформація">
            <div className="mb-2">
              <label className="form-label">Назва компанії <span className="text-danger">*</span></label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="ТОВ 'Компанія'" />
            </div>
            <div className="mb-2">
              <label className="form-label">Тип компанії</label>
              <select className="form-control" name="companyType" value={form.companyType || ""} onChange={handleChange}>
                  <option value="">Оберіть тип</option>
                  <option value="Власник вантажу">Власник вантажу</option>
                  <option value="Перевізник">Перевізник</option>
                  <option value="Експедитор">Експедитор</option>
                </select>
            </div>
            <div className="mb-2">
              <label className="form-label">ЄДРПОУ <span className="text-danger">*</span></label>
              <input className="form-control" name="codeCompany" value={form.codeCompany} onChange={handleChange} placeholder="12345678" />
            </div>
            <div className="mb-2">
              <label className="form-label">ІПН</label>
              <input className="form-control" name="ipn" value={form.ipn} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Система оподаткування</label>
              <input className="form-control" name="taxSystem" value={form.taxSystem} onChange={handleChange} placeholder="Загальна, спрощена" />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Контактні особи">
            <div className="mb-3">
              <h6>Список працівників</h6>
              {people.length > 0 ? (
                <div className="list-group mb-3">
                  {people.map((person) => (
                    <div key={person.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{positionTypes.find(p => p.value === person.position)?.name}:</strong> {person.fullName}
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
              
              <h6 className="mt-3">Додати нового працівника</h6>
              <div className="border p-3 rounded">
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
          </Section>
        </div>
      </div>

      {/* Контактна та Юридична адреса */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Контактна інформація">
            <div className="mb-2">
              <label className="form-label">Телефон</label>
              <input className="form-control" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+380..." />
            </div>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="info@company.com" />
            </div>
            <div className="mb-2">
              <label className="form-label">Сайт</label>
              <input className="form-control" name="website" value={form.website} onChange={handleChange} placeholder="https://company.com" />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Юридична адреса">
            <div className="mb-2">
              <label className="form-label">Вулиця</label>
              <input className="form-control" name="legalAddress_StreetAddress" value={form.legalAddress_StreetAddress} onChange={handleChange} placeholder="вул. Хрещатик" />
            </div>
            <div className="mb-2">
              <label className="form-label">Будинок / Квартира</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Буд." name="legalAddress_BuildingNumber" value={form.legalAddress_BuildingNumber} onChange={handleChange} />
                <input className="form-control" placeholder="Кв./Офіс" name="legalAddress_ApartmentNumber" value={form.legalAddress_ApartmentNumber} onChange={handleChange} />
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Місто / Регіон</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Місто" name="legalAddress_City" value={form.legalAddress_City} onChange={handleChange} />
                <input className="form-control" placeholder="Регіон" name="legalAddress_Region" value={form.legalAddress_Region} onChange={handleChange} />
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Країна / Індекс</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Україна" name="legalAddress_Country" value={form.legalAddress_Country} onChange={handleChange} />
                <input className="form-control" placeholder="01001" name="legalAddress_PostalCode" value={form.legalAddress_PostalCode} onChange={handleChange} />
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Поштова адреса та Додаткова інформація */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Укр. пошта">
            <div className="mb-2">
              <label className="form-label">Вулиця</label>
              <input className="form-control" name="ukrPoshtaAddress_StreetAddress" value={form.ukrPoshtaAddress_StreetAddress} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Будинок / Квартира</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Буд." name="ukrPoshtaAddress_BuildingNumber" value={form.ukrPoshtaAddress_BuildingNumber} onChange={handleChange} />
                <input className="form-control" placeholder="Кв./Офіс" name="ukrPoshtaAddress_ApartmentNumber" value={form.ukrPoshtaAddress_ApartmentNumber} onChange={handleChange} />
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Місто / Регіон</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Місто" name="ukrPoshtaAddress_City" value={form.ukrPoshtaAddress_City} onChange={handleChange} />
                <input className="form-control" placeholder="Регіон" name="ukrPoshtaAddress_Region" value={form.ukrPoshtaAddress_Region} onChange={handleChange} />
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Країна / Індекс</label>
              <div className="d-flex gap-2">
                <input className="form-control" placeholder="Україна" name="ukrPoshtaAddress_Country" value={form.ukrPoshtaAddress_Country} onChange={handleChange} />
                <input className="form-control" placeholder="01001" name="ukrPoshtaAddress_PostalCode" value={form.ukrPoshtaAddress_PostalCode} onChange={handleChange} />
              </div>
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Додаткова інформація">
            <div className="mb-2">
              <label className="form-label">Примітка</label>
              <textarea className="form-control" rows="10" name="additionalInfo" value={form.additionalInfo} onChange={handleChange} placeholder="Будь-яка додаткова інформація..." />
            </div>
          </Section>
        </div>
      </div>

      {/* Нова Пошта */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-4" style={{ color: '#e60000' }}>🚚 Нова Пошта</h5>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3" style={{ color: '#e60000' }}>👤 Отримувач</h6>
                    <div className="mb-3">
                      <label className="form-label">Тип отримувача</label>
                      <select className="form-select" name="novaPoshtaRecipientType" value={form.novaPoshtaRecipientType} onChange={handleChange}>
                        <option value="">Оберіть тип</option>
                        <option value="0">🧑 Приватна особа</option>
                        <option value="1">🏢 Організація</option>
                      </select>
                    </div>

                    {form.novaPoshtaRecipientType === "0" && (
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-danger me-2">🧑 Приватна особа</span>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Телефон</label>
                          <input className="form-control" name="nP_Phone" value={form.nP_Phone} onChange={handleChange} placeholder="+380 XX XXX XX XX" />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Прізвище</label>
                          <input className="form-control" name="nP_LastName" value={form.nP_LastName} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Ім'я</label>
                          <input className="form-control" name="nP_FirstName" value={form.nP_FirstName} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">По батькові</label>
                          <input className="form-control" name="nP_MiddleName" value={form.nP_MiddleName} onChange={handleChange} />
                        </div>
                      </div>
                    )}

                    {form.novaPoshtaRecipientType === "1" && (
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-danger me-2">🏢 Організація</span>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Код ЄДРПОУ <span className="badge bg-info ms-2">🔍 Автопошук</span></label>
                          <input 
                            className="form-control" 
                            name="nP_EdrpouCode" 
                            value={form.nP_EdrpouCode} 
                            onChange={handleChange}
                            placeholder="Введіть ЄДРПОУ для автопошуку"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Назва компанії</label>
                          <input className="form-control" name="nP_CompanyName" value={form.nP_CompanyName} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Форма власності</label>
                          <input className="form-control" name="nP_OwnershipForm" value={form.nP_OwnershipForm} onChange={handleChange} placeholder="ТОВ, ФОП, ПП..." />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Телефон організації</label>
                          <input className="form-control" name="nP_OrgPhone" value={form.nP_OrgPhone} onChange={handleChange} placeholder="+380..." />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Прізвище</label>
                          <input className="form-control" name="nP_OrgLastName" value={form.nP_OrgLastName} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Ім'я</label>
                          <input className="form-control" name="nP_OrgFirstName" value={form.nP_OrgFirstName} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">По батькові</label>
                          <input className="form-control" name="nP_OrgMiddleName" value={form.nP_OrgMiddleName} onChange={handleChange} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3" style={{ color: '#e60000' }}>📦 Доставка</h6>
                    <div className="mb-3">
                      <label className="form-label">Тип доставки</label>
                      <select className="form-select" name="novaPoshtaDeliveryType" value={form.novaPoshtaDeliveryType} onChange={handleChange}>
                        <option value="">Оберіть тип доставки</option>
                        <option value="0">🏪 Відділення</option>
                        <option value="1">🏠 Адреса</option>
                        <option value="2">📫 Поштомат</option>
                        <option value="3">🔢 Цифрова адреса</option>
                      </select>
                    </div>

                    {form.novaPoshtaDeliveryType === "0" && (
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-danger me-2">🏪 Відділення</span>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Місто <span className="badge bg-info ms-2">🔍 Пошук</span></label>
                          <input 
                            className="form-control mb-2" 
                            placeholder="Почніть вводити назву міста..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                          />
                          {npCities.length > 0 && (
                            <div className="list-group mb-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                              {npCities.map((city, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="list-group-item list-group-item-action"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, npD_City: city.Present }));
                                    setSelectedCityRef(city.DeliveryCity);
                                    setCitySearch("");
                                    setNpCities([]);
                                  }}
                                >
                                  {city.Present}
                                </button>
                              ))}
                            </div>
                          )}
                          <input className="form-control" name="npD_City" value={form.npD_City} onChange={handleChange} readOnly />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Відділення</label>
                          <select 
                            className="form-select" 
                            name="npD_Branch" 
                            value={form.npD_Branch} 
                            onChange={handleChange}
                            disabled={!selectedCityRef || npWarehouses.length === 0}
                          >
                            <option value="">Оберіть відділення</option>
                            {npWarehouses.map((wh, idx) => (
                              <option key={idx} value={wh.Description}>
                                {wh.Description}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {form.novaPoshtaDeliveryType === "1" && (
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-danger me-2">🏠 Адреса</span>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Місто</label>
                          <input className="form-control" name="npD_City" value={form.npD_City} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Вулиця</label>
                          <input className="form-control" name="npD_Street" value={form.npD_Street} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Будинок</label>
                          <input className="form-control" name="npD_Building" value={form.npD_Building} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Квартира/Офіс</label>
                          <input className="form-control" name="npD_Apartment" value={form.npD_Apartment} onChange={handleChange} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Коментар до адреси</label>
                          <input className="form-control" name="npD_AddressComment" value={form.npD_AddressComment} onChange={handleChange} />
                        </div>
                      </div>
                    )}

                    {form.novaPoshtaDeliveryType === "2" && (
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-danger me-2">📫 Поштомат</span>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Місто <span className="badge bg-info ms-2">🔍 Пошук</span></label>
                          <input 
                            className="form-control mb-2" 
                            placeholder="Почніть вводити назву міста..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                          />
                          {npCities.length > 0 && (
                            <div className="list-group mb-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                              {npCities.map((city, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="list-group-item list-group-item-action"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, npD_City: city.Present }));
                                    setSelectedCityRef(city.DeliveryCity);
                                    setCitySearch("");
                                    setNpCities([]);
                                  }}
                                >
                                  {city.Present}
                                </button>
                              ))}
                            </div>
                          )}
                          <input className="form-control" name="npD_City" value={form.npD_City} onChange={handleChange} readOnly />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Поштомат</label>
                          <select 
                            className="form-select" 
                            name="npD_PostomatNumber" 
                            value={form.npD_PostomatNumber} 
                            onChange={handleChange}
                            disabled={!selectedCityRef || npWarehouses.length === 0}
                          >
                            <option value="">Оберіть поштомат</option>
                            {npWarehouses.map((wh, idx) => (
                              <option key={idx} value={wh.Description}>
                                {wh.Description}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {form.novaPoshtaDeliveryType === "3" && (
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <span className="badge bg-danger me-2">🔢 Цифрова адреса</span>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Цифрова адреса (референс)</label>
                          <input className="form-control" name="npD_DigitalAddressReference" value={form.npD_DigitalAddressReference} onChange={handleChange} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Банківські реквізити */}
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
                          {form.bankDetails.length > 1 && (
                            <button className="btn btn-danger btn-sm" onClick={() => removeBankAccount(index)}>🗑️</button>
                          )}
                        </div>
                        <hr />

                        <div className="mb-2">
                          <label className="form-label">Тип рахунку</label>
                          <select className="form-control" value={bank.typeAccount} onChange={(e) => handleBankChange(index, 'typeAccount', parseInt(e.target.value))}>
                            {accountTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Валюта</label>
                          <select className="form-control" value={bank.currency} onChange={(e) => handleBankChange(index, 'currency', parseInt(e.target.value))} disabled={bank.typeAccount === 0}>
                            {bank.typeAccount === 0 ? (
                              <option value={0}>{currencies.find(c => c.code === 0)?.name}</option>
                            ) : (
                              currencies.map(curr => (
                                <option key={curr.code} value={curr.code}>{curr.name}</option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Назва банку</label>
                          <input className="form-control" value={bank.bankName || ""} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} placeholder="ПриватБанк" />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">МФО</label>
                          <input className="form-control" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} placeholder="305299" />
                        </div>

                        {bank.typeAccount === 1 && (
                          <>
                            <div className="mb-2">
                              <label className="form-label">IBAN</label>
                              <input className="form-control" value={bank.iban || ""} onChange={(e) => handleBankChange(index, 'iban', e.target.value)} placeholder="UA..." />
                            </div>
                            <div className="mb-2">
                              <label className="form-label">SWIFT</label>
                              <input className="form-control" value={bank.swift || ""} onChange={(e) => handleBankChange(index, 'swift', e.target.value)} />
                            </div>
                            <div className="mb-2">
                              <label className="form-label">Банк отримувача</label>
                              <input className="form-control" value={bank.bankOfBeneficiary || ""} onChange={(e) => handleBankChange(index, 'bankOfBeneficiary', e.target.value)} />
                            </div>

                            <div className="mb-2">
                              <label className="form-label">Банки-кореспонденти</label>
                              {(bank.correspondentBanks || []).map((cb, cbIndex) => (
                                <div key={cbIndex} className="d-flex gap-2 mb-2">
                                  <input className="form-control" placeholder="Назва банку" value={cb.bankName || ""} onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'bankName', e.target.value)} />
                                  <input className="form-control" placeholder="SWIFT" value={cb.swift || ""} onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'swift', e.target.value)} />
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => removeCorrespondentBank(index, cbIndex)}>🗑</button>
                                </div>
                              ))}
                              <button className="btn btn-sm btn-secondary" onClick={() => addCorrespondentBank(index)}>+ Додати банк-кореспондент</button>
                            </div>
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

      {/* API інтеграції */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <Section title="API інтеграції">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-2">
                  <label className="form-label">Nova Poshta API Key</label>
                  <input className="form-control" name="apiNovaPoshtaKey" value={form.apiNovaPoshtaKey} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-2">
                  <label className="form-label">LardyTrans API Key</label>
                  <input className="form-control" name="apiLardyTransKey" value={form.apiLardyTransKey} onChange={handleChange} />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Кнопки дій */}
      <div className="row mb-5">
        <div className="col-12">
          <button className="btn btn-success btn-lg me-3" onClick={handleSubmit}>
            💾 Створити компанію-клієнта
          </button>
          <button className="btn btn-outline-secondary btn-lg" onClick={() => navigate('/clients')}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateClientForm;
