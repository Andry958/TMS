import { useState } from "react";
import { accountTypes, createEmptyBankDetails, currencies, UAH_CURRENCY_CODE } from "../../constants/bankDetails";

const addressPrefixes = [
  ["legalAddress", "Юридична адреса"],
  ["ukrPoshtaAddress", "Поштова адреса"],
  ["actualAddress", "Фактична адреса"]
];

const addressFields = [
  ["Country", "Країна"],
  ["City", "Місто"],
  ["Region", "Область"],
  ["PostalCode", "Індекс"],
  ["StreetAddress", "Вулиця"],
  ["BuildingNumber", "Будинок"],
  ["ApartmentNumber", "Квартира / офіс"]
];

const initialClient = {
  name: "", companyType: "", codeCompany: "", ipn: "", taxSystem: "", additionalInfo: "",
  phoneNumber: "", email: "", website: "",
  legalAddress_Country: "", legalAddress_City: "", legalAddress_Region: "", legalAddress_PostalCode: "", legalAddress_StreetAddress: "", legalAddress_BuildingNumber: "", legalAddress_ApartmentNumber: "",
  ukrPoshtaAddress_Country: "", ukrPoshtaAddress_City: "", ukrPoshtaAddress_Region: "", ukrPoshtaAddress_PostalCode: "", ukrPoshtaAddress_StreetAddress: "", ukrPoshtaAddress_BuildingNumber: "", ukrPoshtaAddress_ApartmentNumber: "",
  actualAddress_Country: "", actualAddress_City: "", actualAddress_Region: "", actualAddress_PostalCode: "", actualAddress_StreetAddress: "", actualAddress_BuildingNumber: "", actualAddress_ApartmentNumber: "",
  bankDetails: []
};

export default function QuickClientModal({ apiUrl, onClose, onCreated }) {
  const [form, setForm] = useState(initialClient);
  const [contacts, setContacts] = useState([]);
  const [contact, setContact] = useState({ fullName: "", position: 2, phoneNumber: "", email: "" });
  const [tab, setTab] = useState("base");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = event => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const addContact = () => {
    if (!contact.fullName.trim()) return;
    setContacts(current => [...current, { ...contact, fullName: contact.fullName.trim(), id: Date.now() }]);
    setContact({ fullName: "", position: 2, phoneNumber: "", email: "" });
  };

  const addBank = () => setForm(current => ({ ...current, bankDetails: [...current.bankDetails, createEmptyBankDetails()] }));
  const updateBank = (index, field, value) => setForm(current => ({
    ...current,
    bankDetails: current.bankDetails.map((bank, bankIndex) => bankIndex === index
      ? { ...bank, [field]: value, ...(field === "typeAccount" && Number(value) === 0 ? { currency: UAH_CURRENCY_CODE } : {}) }
      : bank)
  }));

  const submit = async event => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.codeCompany.trim()) {
      setTab("base");
      setError("Заповніть назву компанії та ЄДРПОУ.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({
          ...form,
          name: form.name.trim(), codeCompany: form.codeCompany.trim(),
          email: form.email.trim() || null,
          contactPersons: contacts.map(({ id, ...item }) => ({
            ...item,
            position: Number(item.position),
            phoneNumber: item.phoneNumber.trim() || null,
            email: item.email.trim() || null
          }))
        })
      });
      const created = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(created.message || created.detail || "Не вдалося створити клієнта.");
      onCreated(created);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="requests-modal-backdrop requests-client-modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget && !saving) onClose();
    }}>
      <section className="requests-modal requests-client-modal" role="dialog" aria-modal="true" aria-labelledby="quick-client-title">
        <header className="requests-modal__heading">
          <div><span>ШВИДКЕ ДОДАВАННЯ</span><h2 id="quick-client-title">Новий клієнт</h2></div>
          <button type="button" aria-label="Закрити" onClick={onClose} disabled={saving}>×</button>
        </header>
        <form onSubmit={submit}>
          <nav className="quick-client-tabs" aria-label="Розділи клієнта">
            {[['base', 'Основні дані'], ['contacts', 'Контакти'], ['addresses', 'Адреси'], ['banks', 'Рахунки']].map(([id, label]) =>
              <button type="button" key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}
          </nav>
          <div className="quick-client-body">
            {error && <div className="quick-client-error">{error}</div>}
            {tab === "base" && <div className="quick-client-grid">
              <label className="quick-client-wide"><span>Назва компанії <b>*</b></span><input name="name" value={form.name} onChange={setField} maxLength="200" required /></label>
              <label><span>ЄДРПОУ <b>*</b></span><input name="codeCompany" value={form.codeCompany} onChange={setField} maxLength="50" required /></label>
              <label><span>ІПН</span><input name="ipn" value={form.ipn} onChange={setField} maxLength="50" /></label>
              <label><span>Тип клієнта</span><select name="companyType" value={form.companyType} onChange={setField}><option value="">Оберіть тип</option><option>Власник вантажу</option><option>Перевізник</option><option>Експедитор</option></select></label>
              <label><span>Система оподаткування</span><input name="taxSystem" value={form.taxSystem} onChange={setField} /></label>
              <label><span>Телефон</span><input name="phoneNumber" value={form.phoneNumber} onChange={setField} /></label>
              <label><span>Email</span><input type="email" name="email" value={form.email} onChange={setField} /></label>
              <label className="quick-client-wide"><span>Сайт</span><input name="website" value={form.website} onChange={setField} /></label>
              <label className="quick-client-wide"><span>Додаткова інформація</span><textarea name="additionalInfo" value={form.additionalInfo} onChange={setField} rows="3" /></label>
            </div>}

            {tab === "contacts" && <div>
              {(contacts.length > 0) && <div className="quick-client-list">{contacts.map((item, index) => <div key={item.id}>
                <span><strong>{item.fullName}</strong>{item.phoneNumber ? ` · ${item.phoneNumber}` : ""}</span>
                <button type="button" onClick={() => setContacts(current => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>
              </div>)}</div>}
              <div className="quick-client-grid">
                <label><span>ПІБ</span><input value={contact.fullName} onChange={event => setContact(current => ({ ...current, fullName: event.target.value }))} /></label>
                <label><span>Посада</span><select value={contact.position} onChange={event => setContact(current => ({ ...current, position: Number(event.target.value) }))}><option value="0">Директор</option><option value="1">Бухгалтер</option><option value="2">Менеджер</option><option value="3">Інше</option></select></label>
                <label><span>Телефон</span><input value={contact.phoneNumber} onChange={event => setContact(current => ({ ...current, phoneNumber: event.target.value }))} /></label>
                <label><span>Email</span><input type="email" value={contact.email} onChange={event => setContact(current => ({ ...current, email: event.target.value }))} /></label>
              </div>
              <button type="button" className="quick-client-add" onClick={addContact}>+ Додати контактну особу</button>
            </div>}

            {tab === "addresses" && addressPrefixes.map(([prefix, title]) => <fieldset className="quick-client-address" key={prefix}><legend>{title}</legend><div className="quick-client-grid">
              {addressFields.map(([field, label]) => <label key={field}><span>{label}</span><input name={`${prefix}_${field}`} value={form[`${prefix}_${field}`]} onChange={setField} /></label>)}
            </div></fieldset>)}

            {tab === "banks" && <div>
              {form.bankDetails.map((bank, index) => <fieldset className="quick-client-bank" key={index}><legend>Рахунок #{index + 1}</legend>
                <div className="quick-client-grid">
                  <label><span>Тип</span><select value={bank.typeAccount} onChange={event => updateBank(index, "typeAccount", Number(event.target.value))}>{accountTypes.map(type => <option key={type.value} value={type.value}>{type.name}</option>)}</select></label>
                  <label><span>Валюта</span><select value={bank.currency} onChange={event => updateBank(index, "currency", Number(event.target.value))} disabled={Number(bank.typeAccount) === 0}>{Number(bank.typeAccount) === 0 ? <option value={UAH_CURRENCY_CODE}>UAH — Українська гривня</option> : currencies.map(currency => <option key={currency.code} value={currency.code}>{currency.name}</option>)}</select></label>
                  <label><span>Назва банку</span><input value={bank.bankName} onChange={event => updateBank(index, "bankName", event.target.value)} /></label>
                  <label><span>МФО</span><input value={bank.bankMfo} onChange={event => updateBank(index, "bankMfo", event.target.value)} /></label>
                  <label><span>IBAN</span><input value={bank.iban} onChange={event => updateBank(index, "iban", event.target.value)} /></label>
                  {Number(bank.typeAccount) === 1 && <label><span>SWIFT</span><input value={bank.swift} onChange={event => updateBank(index, "swift", event.target.value)} /></label>}
                </div>
                <button type="button" className="quick-client-remove" onClick={() => setForm(current => ({ ...current, bankDetails: current.bankDetails.filter((_, bankIndex) => bankIndex !== index) }))}>Видалити рахунок</button>
              </fieldset>)}
              <button type="button" className="quick-client-add" onClick={addBank}>+ Додати банківський рахунок</button>
            </div>}
          </div>
          <footer className="requests-modal__footer">
            <button type="button" className="requests-secondary-button" onClick={onClose} disabled={saving}>Скасувати</button>
            <button type="submit" className="requests-primary-button" disabled={saving}>{saving ? "Збереження…" : "Створити клієнта"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
