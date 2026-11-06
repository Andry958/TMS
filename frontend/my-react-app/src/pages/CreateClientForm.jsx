import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useCompany } from "../context/CompanyContext";
import { useToast } from "../context/useToast";
import ClientBankDetails from "../components/client/ClientBankDetails";
import NovaPoshtaForm from "../components/common/NovaPoshtaForm";
import { UAH_CURRENCY_CODE, createEmptyBankDetails } from "../constants/bankDetails";

const addressFields = [
  ["StreetAddress", "Вулиця"],
  ["BuildingNumber", "Будинок"],
  ["ApartmentNumber", "Квартира / офіс"],
  ["City", "Місто"],
  ["Region", "Область"],
  ["PostalCode", "Поштовий індекс"],
  ["Country", "Країна"]
];

const initialForm = {
  name: "",
  companyType: "",
  codeCompany: "",
  ipn: "",
  taxSystem: "",
  additionalInfo: "",
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
  actualAddress_Country: "",
  actualAddress_City: "",
  actualAddress_Region: "",
  actualAddress_PostalCode: "",
  actualAddress_StreetAddress: "",
  actualAddress_BuildingNumber: "",
  actualAddress_ApartmentNumber: "",
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
  bankDetails: [createEmptyBankDetails()]
};

function AddressSection({ title, prefix, form, onChange }) {
  return (
    <section className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-3">{title}</h5>
        <div className="row g-3">
          {addressFields.map(([field, label]) => {
            const name = `${prefix}_${field}`;
            return (
              <div className="col-sm-6" key={name}>
                <label className="form-label" htmlFor={name}>{label}</label>
                <input
                  className="form-control"
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={onChange}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CreateClientForm() {
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const { apiData } = useApi();
  const { companyId } = useCompany();
  const [apiNovaPoshtaKey, setApiNovaPoshtaKey] = useState("");
  const [form, setForm] = useState(initialForm);
  const [people, setPeople] = useState([]);
  const [person, setPerson] = useState({
    fullName: "",
    position: 2,
    phoneNumber: "",
    email: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    fetch(`${apiData}/company/${companyId}`)
      .then(response => {
        if (!response.ok) throw new Error("Не вдалося завантажити налаштування компанії");
        return response.json();
      })
      .then(company => setApiNovaPoshtaKey(company.apiKeys?.novaPoshta || ""))
      .catch(error => {
        console.error("Помилка завантаження ключа Нової Пошти:", error);
        pushToast("Не вдалося завантажити ключ Нової Пошти головної компанії", "error");
      });
  }, [apiData, companyId, pushToast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const handleBankChange = (index, field, value) => {
    setForm(current => ({
      ...current,
      bankDetails: current.bankDetails.map((bank, bankIndex) =>
        bankIndex === index
          ? field === "typeAccount" && Number(value) === 0
            ? { ...bank, typeAccount: 0, currency: UAH_CURRENCY_CODE, swift: "", bankOfBeneficiary: "", correspondentBanks: [] }
            : { ...bank, [field]: value }
          : bank)
    }));
  };

  const addBankAccount = () => setForm(current => ({
    ...current,
    bankDetails: [...current.bankDetails, createEmptyBankDetails()]
  }));

  const removeBankAccount = (index) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.length > 1
      ? current.bankDetails.filter((_, bankIndex) => bankIndex !== index)
      : current.bankDetails
  }));

  const addCorrespondent = (bankIndex) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.map((bank, index) => index === bankIndex
      ? { ...bank, correspondentBanks: [...bank.correspondentBanks, { bankName: "", swift: "" }] }
      : bank)
  }));

  const removeCorrespondent = (bankIndex, correspondentIndex) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.map((bank, index) => index === bankIndex
      ? { ...bank, correspondentBanks: bank.correspondentBanks.filter((_, i) => i !== correspondentIndex) }
      : bank)
  }));

  const handleCorrespondentChange = (bankIndex, correspondentIndex, field, value) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.map((bank, index) => index === bankIndex
      ? {
          ...bank,
          correspondentBanks: bank.correspondentBanks.map((correspondent, i) =>
            i === correspondentIndex ? { ...correspondent, [field]: value } : correspondent)
        }
      : bank)
  }));

  const addPerson = () => {
    if (!person.fullName.trim()) {
      pushToast("Вкажіть ім’я контактної особи", "warning");
      return;
    }
    setPeople(current => [...current, { ...person, id: Date.now() }]);
    setPerson({ fullName: "", position: 2, phoneNumber: "", email: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!companyId) {
      pushToast("Спочатку створіть головну компанію", "warning");
      return;
    }
    if (!form.name.trim() || !form.codeCompany.trim()) {
      pushToast("Заповніть назву компанії та ЄДРПОУ", "warning");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiData}/client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          novaPoshtaRecipientType: form.novaPoshtaRecipientType === ""
            ? null
            : Number(form.novaPoshtaRecipientType),
          novaPoshtaDeliveryType: form.novaPoshtaDeliveryType === ""
            ? null
            : Number(form.novaPoshtaDeliveryType),
          email: form.email.trim() || null,
          contactPersons: people.map(contact => ({
            fullName: contact.fullName,
            position: contact.position,
            phoneNumber: contact.phoneNumber,
            email: contact.email.trim() || null
          }))
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const validationMessages = payload?.errors
          ? Object.entries(payload.errors)
            .flatMap(([field, messages]) => messages.map(message => `${field}: ${message}`))
          : [];
        const message = payload?.message || payload?.detail ||
          validationMessages.join(" ") ||
          payload?.title ||
          `Не вдалося створити компанію-клієнта (HTTP ${response.status}).`;
        throw new Error(message);
      }
      const created = await response.json();
      pushToast("Компанію-клієнта створено", "success");
      navigate(`/clients/${created.id}`);
    } catch (error) {
      console.error("Помилка створення компанії-клієнта:", error);
      pushToast(error.message || "Помилка створення компанії-клієнта", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid mt-4 page-shell">
      <div className="sticky-action-bar client-create-actions d-flex justify-content-between align-items-center mb-4">
        <div className="client-create-actions__title">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/clients")}>
            ← Назад до списку
          </button>
          <div>
            <h2 className="mb-0">Нова компанія-клієнт</h2>
            <p className="text-muted mb-0">Реквізити, контакти, адреси, доставка та банківські рахунки компанії.</p>
          </div>
        </div>
        <div className="client-create-actions__controls">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/clients")}>Скасувати</button>
          <button type="submit" form="create-client-form" className="btn btn-primary" disabled={saving}>
            {saving ? "Збереження..." : "Створити компанію-клієнта"}
          </button>
        </div>
      </div>

      <form id="create-client-form" onSubmit={handleSubmit}>
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <section className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="mb-3">Основна інформація</h5>
                <div className="mb-3">
                  <label className="form-label" htmlFor="client-name">Назва компанії *</label>
                  <input id="client-name" className="form-control" name="name" value={form.name} onChange={handleChange} required maxLength={200} />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="client-type">Тип компанії</label>
                  <select id="client-type" className="form-select" name="companyType" value={form.companyType} onChange={handleChange}>
                    <option value="">Оберіть тип</option>
                    <option value="Власник вантажу">Власник вантажу</option>
                    <option value="Перевізник">Перевізник</option>
                    <option value="Експедитор">Експедитор</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="client-edrpou">ЄДРПОУ *</label>
                  <input id="client-edrpou" className="form-control" name="codeCompany" value={form.codeCompany} onChange={handleChange} required maxLength={50} />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="client-ipn">ІПН</label>
                  <input id="client-ipn" className="form-control" name="ipn" value={form.ipn} onChange={handleChange} maxLength={50} />
                </div>
                <div>
                  <label className="form-label" htmlFor="client-tax-system">Система оподаткування</label>
                  <input id="client-tax-system" className="form-control" name="taxSystem" value={form.taxSystem} onChange={handleChange} maxLength={100} />
                </div>
              </div>
            </section>
          </div>

          <div className="col-lg-6">
            <section className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="mb-3">Контактні дані</h5>
                <div className="mb-3">
                  <label className="form-label" htmlFor="client-phone">Телефон</label>
                  <input id="client-phone" className="form-control" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="client-email">Електронна пошта</label>
                  <input id="client-email" className="form-control" type="email" name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="client-website">Сайт</label>
                  <input id="client-website" className="form-control" name="website" value={form.website} onChange={handleChange} />
                </div>
                <h6 className="mt-4">Контактні особи</h6>
                {people.map(contact => (
                  <div className="d-flex justify-content-between align-items-center border rounded p-2 mb-2" key={contact.id}>
                    <span>{contact.fullName}{contact.phoneNumber ? ` · ${contact.phoneNumber}` : ""}</span>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setPeople(current => current.filter(item => item.id !== contact.id))} aria-label={`Видалити ${contact.fullName}`}>×</button>
                  </div>
                ))}
                <div className="row g-2 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contact-name">ПІБ</label>
                    <input id="contact-name" className="form-control" name="fullName" value={person.fullName} onChange={event => setPerson(current => ({ ...current, fullName: event.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contact-position">Посада</label>
                    <select id="contact-position" className="form-select" value={person.position} onChange={event => setPerson(current => ({ ...current, position: Number(event.target.value) }))}>
                      <option value={0}>Директор</option>
                      <option value={1}>Бухгалтер</option>
                      <option value={2}>Менеджер</option>
                      <option value={3}>Інше</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contact-phone">Телефон</label>
                    <input id="contact-phone" className="form-control" name="phoneNumber" value={person.phoneNumber} onChange={event => setPerson(current => ({ ...current, phoneNumber: event.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contact-email">Електронна пошта</label>
                    <input id="contact-email" className="form-control" type="email" name="email" value={person.email} onChange={event => setPerson(current => ({ ...current, email: event.target.value }))} />
                  </div>
                  <div className="col-12">
                    <button type="button" className="btn btn-outline-primary w-100" onClick={addPerson}>+ Додати контактну особу</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <AddressSection title="Юридична адреса" prefix="legalAddress" form={form} onChange={handleChange} />
          </div>
          <div className="col-lg-6">
            <AddressSection title="Поштова адреса" prefix="ukrPoshtaAddress" form={form} onChange={handleChange} />
          </div>
          <div className="col-lg-6">
            <AddressSection title="Фактична адреса" prefix="actualAddress" form={form} onChange={handleChange} />
          </div>
          <div className="col-lg-6">
            <section className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="mb-3">Додаткова інформація</h5>
                <textarea className="form-control" rows="8" name="additionalInfo" value={form.additionalInfo} onChange={handleChange} />
              </div>
            </section>
          </div>
        </div>

        <section className="mb-4">
          <NovaPoshtaForm form={form} setForm={setForm} isEditing apiNovaPoshta={apiNovaPoshtaKey} />
        </section>

        <section className="mb-4">
          <ClientBankDetails
            form={form}
            isEditing
            onBankChange={handleBankChange}
            onAddBank={addBankAccount}
            onRemoveBank={removeBankAccount}
            onAddCorrespondent={addCorrespondent}
            onRemoveCorrespondent={removeCorrespondent}
            onCorrespondentChange={handleCorrespondentChange}
          />
        </section>

      </form>
    </div>
  );
}

export default CreateClientForm;
