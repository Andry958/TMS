import { useState, useEffect } from "react";
import { useCompany } from "../context/CompanyContext";
import { useApi } from "../context/ApiContext";

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

const positionTypes = [
  { value: 0, name: "Директор" },
  { value: 1, name: "Бухгалтер" },
  { value: 2, name: "Менеджер" },
  { value: 3, name: "Інше" }
];

function CompanySettingsPage({ setActiveSection }) {
  const { companyId, setCompanyId } = useCompany();
  const { apiData } = useApi();
  const API_URL = `${apiData}/company`;
  const PEOPLE_API = `${apiData}/managementPeaple`;
 apiData
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    fullName: "",
    position: 2,
    phoneNumber: "",
    email: ""
  });

  // Nova Poshta autocomplete стейти
  const [npCities, setNpCities] = useState([]);
  const [npWarehouses, setNpWarehouses] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [selectedCityRef, setSelectedCityRef] = useState("");

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

    actualAddress_Country: "",
    actualAddress_City: "",
    actualAddress_Region: "",
    actualAddress_PostalCode: "",
    actualAddress_StreetAddress: "",
    actualAddress_BuildingNumber: "",
    actualAddress_ApartmentNumber: "",

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

  useEffect(() => {
    if (companyId) setActiveSection("mycompany");
  }, [companyId, setActiveSection]);

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

    try {
      // Підготовка даних: конвертуємо порожні рядки в null для int? полів
      const preparedData = {
        ...form,
        novaPoshtaRecipientType: form.novaPoshtaRecipientType === "" ? null : parseInt(form.novaPoshtaRecipientType),
        novaPoshtaDeliveryType: form.novaPoshtaDeliveryType === "" ? null : parseInt(form.novaPoshtaDeliveryType)
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedData)
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const newCompanyId = data.id;
      
      console.log("Компанія створена з ID:", newCompanyId);
      console.log("Додаємо людей:", people);
      
      // Додаємо людей до компанії
      if (people.length > 0) {
        for (const person of people) {
          try {
            const personData = {
              fullName: person.fullName,
              position: person.position,
              phoneNumber: person.phoneNumber || null,
              email: person.email || null,
              companyId: newCompanyId
            };
            
            console.log("Додаємо працівника:", personData);
            
            const personRes = await fetch(`${PEOPLE_API}/add?companyId=${newCompanyId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(personData)
            });
            
            if (!personRes.ok) {
              console.error("Помилка додавання працівника:", await personRes.text());
            } else {
              console.log("Працівника додано успішно");
            }
          } catch (err) {
            console.error("Помилка при додаванні працівника:", err);
          }
        }
      }
      
      setCompanyId(newCompanyId);
      alert("Компанію успішно створено!");
      setActiveSection("mycompany");
    } catch (err) {
      console.error("Помилка створення компанії:", err);
      alert("Помилка створення компанії");
    }
  };

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
  }, [form?.nP_EdrpouCode, form?.apiNovaPoshtaKey]);

  // Пошук міст (autocomplete)
  useEffect(() => {
    if (!form?.apiNovaPoshtaKey || !citySearch || citySearch.length < 2) {
      setNpCities([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiData}/novaposhta/cities?apiKey=${encodeURIComponent(form.apiNovaPoshtaKey)}&q=${encodeURIComponent(citySearch)}`
        );
        const json = await res.json();
        setNpCities(json?.data?.[0]?.Addresses || []);
      } catch (error) {
        console.error("Помилка пошуку міста:", error);
        setNpCities([]);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [citySearch, form?.apiNovaPoshtaKey]);

  // Завантаження відділень/поштоматів
  const loadWarehouses = async (cityRef, deliveryType = null) => {
    if (!form?.apiNovaPoshtaKey || !cityRef) return;
    
    try {
      const type = deliveryType || form?.novaPoshtaDeliveryType;
      let warehouseType = null;
      if (type === "0") {
        warehouseType = "Branch";
      } else if (type === "2") {
        warehouseType = "Postomat";
      }

      const url = new URL(`${apiData}/novaposhta/address/warehouses`);
      url.searchParams.append('apiKey', form.apiNovaPoshtaKey);
      url.searchParams.append('cityRef', cityRef);
      if (warehouseType) {
        url.searchParams.append('warehouseType', warehouseType);
      }

      const res = await fetch(url);
      const json = await res.json();
      setNpWarehouses(json?.data || []);
      
      pushToast(`✅ Знайдено ${json.data.length} ${warehouseType === 'Postomat' ? 'поштоматів' : 'відділень'}`, "success");
    } catch (error) {
      console.error("Помилка завантаження відділень:", error);
      setNpWarehouses([]);
      pushToast("❌ Помилка завантаження відділень", "error");
    }
  };

  return (
    <div className="container mt-5">
      <div className="mb-4">
        <h2>Створення компанії</h2>
        <p className="text-muted">
          Заповніть інформацію про компанію. Ці дані будуть використовуватись у документах, рахунках та інтеграціях.
        </p>
      </div>

      {/* ===== РЯД 1 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>🏢 Основна інформація</h5>
              <div className="mb-2">
                <label className="form-label">Назва компанії</label>
                <input className="form-control" name="name" onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label className="form-label">Тип компанії</label>
                <input className="form-control" name="companyType" onChange={handleChange} placeholder="ТОВ, ПП, ФОП..." />
              </div>
              <div className="mb-2">
                <label className="form-label">ЄДРПОУ</label>
                <input className="form-control" name="codeCompany" onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label className="form-label">ІПН</label>
                <input className="form-control" name="ipn" onChange={handleChange} />
              </div>
              <div className="mb-0">
                <label className="form-label">Податкова система</label>
                <input className="form-control" name="taxSystem" onChange={handleChange} placeholder="Загальна, спрощена..." />
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

      {/* ===== РЯД 2 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📞 Контактна інформація</h5>
              <div className="mb-2">
                <label className="form-label">Телефон</label>
                <input className="form-control" name="phoneNumber" onChange={handleChange} placeholder="+380..." />
              </div>
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" name="email" onChange={handleChange} placeholder="email@example.com" />
              </div>
              <div className="mb-0">
                <label className="form-label">Веб-сайт</label>
                <input className="form-control" name="website" onChange={handleChange} placeholder="https://..." />
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
                  <input className="form-control" name="legalAddress_StreetAddress" onChange={handleChange} placeholder="Вулиця" />
                </div>
                <div className="col-2">
                  <label className="form-label">Буд.</label>
                  <input className="form-control" name="legalAddress_BuildingNumber" onChange={handleChange} placeholder="№" />
                </div>
                <div className="col-2">
                  <label className="form-label">Кв.</label>
                  <input className="form-control" name="legalAddress_ApartmentNumber" onChange={handleChange} placeholder="№" />
                </div>
              </div>
              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label">Місто</label>
                  <input className="form-control" name="legalAddress_City" onChange={handleChange} placeholder="Місто" />
                </div>
                <div className="col-6">
                  <label className="form-label">Регіон</label>
                  <input className="form-control" name="legalAddress_Region" onChange={handleChange} placeholder="Область" />
                </div>
              </div>
              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label">Країна</label>
                  <input className="form-control" name="legalAddress_Country" onChange={handleChange} placeholder="Україна" />
                </div>
                <div className="col-6">
                  <label className="form-label">Індекс</label>
                  <input className="form-control" name="legalAddress_PostalCode" onChange={handleChange} placeholder="00000" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== РЯД 3 ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>📮 Укр. пошта</h5>
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

      {/* ===== РЯД Нова Пошта ===== */}
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
                        <div className="mb-3">
                          <label className="form-label">Код ЄДРПОУ <span className="badge bg-info ms-2">🔍 Автопошук</span></label>
                          <input 
                            className="form-control" 
                            name="nP_EdrpouCode" 
                            value={form.nP_EdrpouCode} 
                            onChange={handleChange}
                            placeholder="Введіть ЄДРПОУ для автопошуку"
                          />
                          <small className="text-muted">Після введення 8+ символів компанія підтягнеться автоматично</small>
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
                        <div className="mb-2 position-relative">
                          <label className="form-label">Місто <span className="badge bg-info ms-2">🔍 Автопошук</span></label>
                          <input 
                            className="form-control" 
                            value={citySearch} 
                            onChange={(e) => setCitySearch(e.target.value)}
                            placeholder="Почніть вводити назву міста"
                          />
                          {npCities.length > 0 && (
                            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                              {npCities.map(city => (
                                <li
                                  key={city.Ref}
                                  className="list-group-item list-group-item-action"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setForm(f => ({ ...f, npD_City: city.Present }));
                                    loadWarehouses(city.Ref, "0");
                                    setSelectedCityRef(city.Ref);
                                    setCitySearch(city.Present);
                                    setNpCities([]);
                                  }}
                                >
                                  📍 {city.Present}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Номер відділення</label>
                          {npWarehouses.length > 0 ? (
                            <select 
                              className="form-control" 
                              name="npD_Branch" 
                              value={form.npD_Branch} 
                              onChange={handleChange}
                            >
                              <option value="">Оберіть відділення</option>
                              {npWarehouses
                                .filter(w => w.CategoryOfWarehouse === 'Branch')
                                .map(warehouse => (
                                  <option key={warehouse.Ref} value={warehouse.Description}>
                                    {warehouse.Description}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <input 
                              className="form-control" 
                              name="npD_Branch" 
                              value={form.npD_Branch} 
                              onChange={handleChange} 
                              placeholder="Спочатку оберіть місто" 
                            />
                          )}
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
                        <div className="mb-2 position-relative">
                          <label className="form-label">Місто <span className="badge bg-info ms-2">🔍 Автопошук</span></label>
                          <input 
                            className="form-control" 
                            value={citySearch} 
                            onChange={(e) => setCitySearch(e.target.value)}
                            placeholder="Почніть вводити назву міста"
                          />
                          {npCities.length > 0 && (
                            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                              {npCities.map(city => (
                                <li
                                  key={city.Ref}
                                  className="list-group-item list-group-item-action"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setForm(f => ({ ...f, npD_City: city.Present }));
                                    loadWarehouses(city.Ref, "2");
                                    setSelectedCityRef(city.Ref);
                                    setCitySearch(city.Present);
                                    setNpCities([]);
                                  }}
                                >
                                  📍 {city.Present}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Номер поштомату</label>
                          {npWarehouses.length > 0 ? (
                            <select 
                              className="form-control" 
                              name="npD_PostomatNumber" 
                              value={form.npD_PostomatNumber} 
                              onChange={handleChange}
                            >
                              <option value="">Оберіть поштомат</option>
                              {npWarehouses.map(warehouse => (
                                <option key={warehouse.Ref} value={warehouse.Description}>
                                  {warehouse.Description}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              className="form-control" 
                              name="npD_PostomatNumber" 
                              value={form.npD_PostomatNumber} 
                              onChange={handleChange} 
                              placeholder="Спочатку оберіть місто" 
                            />
                          )}
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

      {/* ===== РЯД 4 - Банківські реквізити ===== */}
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
                          <select className="form-control d-inline-block w-50 ms-2" value={bank.typeAccount} onChange={(e) => handleBankChange(index, 'typeAccount', parseInt(e.target.value))}>
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
                          <p className="mb-1"><strong>МФО:</strong> <input className="form-control d-inline-block w-75" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} /></p>
                        ) : (
                          <>
                            <p className="mb-1"><strong>МФО:</strong> <input className="form-control d-inline-block w-75" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} /></p>
                            <p className="mb-1"><strong>IBAN:</strong> <input className="form-control d-inline-block w-75" value={bank.iban || ""} onChange={(e) => handleBankChange(index, 'iban', e.target.value)} /></p>
                            {bank.swift !== undefined && (
                              <p className="mb-1"><strong>SWIFT:</strong> <input className="form-control d-inline-block w-75" value={bank.swift || ""} onChange={(e) => handleBankChange(index, 'swift', e.target.value)} /></p>
                            )}
                            {bank.bankOfBeneficiary !== undefined && (
                              <p className="mb-1"><strong>Банк отримувача:</strong> <input className="form-control d-inline-block w-75" value={bank.bankOfBeneficiary || ""} onChange={(e) => handleBankChange(index, 'bankOfBeneficiary', e.target.value)} /></p>
                            )}
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
                                <button className="btn btn-sm btn-secondary mt-2" onClick={() => addCorrespondentBank(index)}>+ Додати банк-кореспондент</button>
                              </div>
                            )}
                            {(!bank.correspondentBanks || bank.correspondentBanks.length === 0) && (
                              <button className="btn btn-sm btn-secondary mt-2" onClick={() => addCorrespondentBank(index)}>+ Додати банк-кореспондент</button>
                            )}
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

	  {/* ===== РЯД 5 ===== */}
	  <div className="row g-4 mb-4">
		<div className="col-md-12">
		  <Section title="API інтеграції">
			<p><strong>Nova Poshta:</strong> <input className="form-control d-inline-block w-75" name="apiNovaPoshtaKey" onChange={handleChange} /></p>
			<p><strong>LardyTrans:</strong> <input className="form-control d-inline-block w-75" name="apiLardyTransKey" onChange={handleChange} /></p>
		  </Section>
		</div>
	  </div>

	  <button className="btn btn-success mb-5" onClick={handleSubmit}>
		💾 Зберегти компанію
	  </button>
	</div>
  );
}

export default CompanySettingsPage;