import { useState, useEffect } from "react";

export default function CompanyForm(props) {
  const {
    form,
    handleChange,
    handleBankChange,
    addBankAccount,
    removeBankAccount,
    addCorrespondentBank,
    removeCorrespondentBank,
    handleCorrespondentBankChange,
    currencies,
    accountTypes
  } = props;

  const [localForm, setLocalForm] = useState(form);

  /** 🔁 синхронізація при зміні компанії */
  useEffect(() => {
    setLocalForm(form);
  }, [form]);

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

  return (
    <div>
      {/* Основна інформація та Керівництво */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Основна інформація">
            <div className="mb-2">
              <label htmlFor="companyName" className="form-label">Назва компанії</label>
              <input id="companyName" className="form-control" name="name" value={form.name || ""} onChange={handleChange} autoComplete="organization" />
            </div>
            <div className="mb-2">
              <label htmlFor="companyType" className="form-label">Тип компанії (ТОВ, ПП)</label>
              <input id="companyType" className="form-control" name="companyType" value={form.companyType || ""} onChange={handleChange} autoComplete="off" />
            </div>
            <div className="mb-2">
              <label htmlFor="codeCompany" className="form-label">ЄДРПОУ</label>
              <input id="codeCompany" className="form-control" name="codeCompany" value={form.codeCompany || ""} onChange={handleChange} autoComplete="off" />
            </div>
            <div className="mb-2">
              <label htmlFor="ipn" className="form-label">ІПН</label>
              <input id="ipn" className="form-control" name="ipn" value={form.ipn || ""} onChange={handleChange} autoComplete="off" />
            </div>
            <div className="mb-2">
              <label htmlFor="taxSystem" className="form-label">Система оподаткування</label>
              <input id="taxSystem" className="form-control" name="taxSystem" value={form.taxSystem || ""} onChange={handleChange} autoComplete="off" />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Керівництво">
            <div className="mb-2">
              <label htmlFor="directorFullName" className="form-label">Директор</label>
              <input id="directorFullName" className="form-control" name="directorFullName" value={form.directorFullName || ""} onChange={handleChange} autoComplete="name" />
            </div>
            <div className="mb-2">
              <label htmlFor="accountantFullName" className="form-label">Бухгалтер</label>
              <input id="accountantFullName" className="form-control" name="accountantFullName" value={form.accountantFullName || ""} onChange={handleChange} autoComplete="name" />
            </div>
          </Section>
        </div>
      </div>

      {/* Контактна та Юридична адреса */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Контактна інформація">
            <div className="mb-2">
              <label htmlFor="phoneNumber" className="form-label">Телефон</label>
              <input id="phoneNumber" className="form-control" name="phoneNumber" value={form.phoneNumber || ""} onChange={handleChange} autoComplete="tel" />
            </div>
            <div className="mb-2">
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" type="email" className="form-control" name="email" value={form.email || ""} onChange={handleChange} autoComplete="email" />
            </div>
            <div className="mb-2">
              <label htmlFor="website" className="form-label">Сайт</label>
              <input id="website" className="form-control" name="website" value={form.website || ""} onChange={handleChange} autoComplete="url" />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Юридична адреса">
            <div className="mb-2">
              <label htmlFor="legalAddress_StreetAddress" className="form-label">Адреса</label>
              <input id="legalAddress_StreetAddress" className="form-control" name="legalAddress_StreetAddress" value={form.legalAddress_StreetAddress || ""} onChange={handleChange} autoComplete="address-line1" />
            </div>
            <div className="mb-2">
              <label htmlFor="legalAddress_City" className="form-label">Населений пункт/Регіон</label>
              <input id="legalAddress_City" className="form-control" name="legalAddress_City" value={form.legalAddress_City || ""} onChange={handleChange} autoComplete="address-level2" />
            </div>
            <div className="mb-2">
              <label htmlFor="legalAddress_Country" className="form-label">Країна/Індекс</label>
              <input id="legalAddress_Country" className="form-control" name="legalAddress_Country" value={form.legalAddress_Country || ""} onChange={handleChange} autoComplete="country" />
            </div>
            <div className="mb-2">
              <label className="form-label">Буд./Кв.</label>
              <div className="d-flex gap-2">
                <div className="flex-fill">
                  <label htmlFor="legalAddress_BuildingNumber" className="visually-hidden">Будинок</label>
                  <input id="legalAddress_BuildingNumber" className="form-control" name="legalAddress_BuildingNumber" value={form.legalAddress_BuildingNumber || ""} onChange={handleChange} autoComplete="address-line1" placeholder="Буд." />
                </div>
                <div className="flex-fill">
                  <label htmlFor="legalAddress_ApartmentNumber" className="visually-hidden">Квартира</label>
                  <input id="legalAddress_ApartmentNumber" className="form-control" name="legalAddress_ApartmentNumber" value={form.legalAddress_ApartmentNumber || ""} onChange={handleChange} autoComplete="address-line2" placeholder="Кв.(офіс)" />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Укр. пошта адреса та API інтеграції */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Укр. пошта">
            <div className="mb-2">
              <label htmlFor="ukrPoshtaAddress_StreetAddress" className="form-label">Адреса</label>
              <input id="ukrPoshtaAddress_StreetAddress" className="form-control" name="ukrPoshtaAddress_StreetAddress" value={form.ukrPoshtaAddress_StreetAddress || ""} onChange={handleChange} autoComplete="address-line1" />
            </div>
            <div className="mb-2">
              <label htmlFor="ukrPoshtaAddress_ApartmentNumber" className="form-label">Кв.(офіс)</label>
              <input id="ukrPoshtaAddress_ApartmentNumber" className="form-control" name="ukrPoshtaAddress_ApartmentNumber" value={form.ukrPoshtaAddress_ApartmentNumber || ""} onChange={handleChange} autoComplete="address-line2" />
            </div>
            <div className="mb-2">
              <label htmlFor="ukrPoshtaAddress_City" className="form-label">Населений пункт/Регіон</label>
              <input id="ukrPoshtaAddress_City" className="form-control" name="ukrPoshtaAddress_City" value={form.ukrPoshtaAddress_City || ""} onChange={handleChange} autoComplete="address-level2" />
            </div>
            <div className="mb-2">
              <label htmlFor="ukrPoshtaAddress_Country" className="form-label">Країна/Індекс</label>
              <input id="ukrPoshtaAddress_Country" className="form-control" name="ukrPoshtaAddress_Country" value={form.ukrPoshtaAddress_Country || ""} onChange={handleChange} autoComplete="country" />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="API інтеграції">
            <div className="mb-2">
              <label htmlFor="apiNovaPoshtaKey" className="form-label">Nova Poshta API</label>
              <input id="apiNovaPoshtaKey" className="form-control" name="apiNovaPoshtaKey" value={form.apiNovaPoshtaKey || ""} onChange={handleChange} autoComplete="off" />
            </div>
            <div className="mb-2">
              <label htmlFor="apiLardyTransKey" className="form-label">LardyTrans API</label>
              <input id="apiLardyTransKey" className="form-control" name="apiLardyTransKey" value={form.apiLardyTransKey || ""} onChange={handleChange} autoComplete="off" />
            </div>
          </Section>
        </div>
      </div>

      {/* Нова Пошта */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>🚚 Нова Пошта</h5>
              
              {/* Отримувач */}
              <div className="mb-4">
                <h6 className="mb-3">Отримувач</h6>
                <div className="mb-3">
                  <label className="form-label">Тип отримувача</label>
                  <select 
                    className="form-control" 
                    name="novaPoshtaRecipientType" 
                    value={form.novaPoshtaRecipientType ?? ""} 
                    onChange={handleChange}
                  >
                    <option value="">Не обрано</option>
                    <option value="0">Приватна особа</option>
                    <option value="1">Організація</option>
                  </select>
                </div>

                {form.novaPoshtaRecipientType === "0" && (
                  <div className="border p-3 rounded mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3">Дані приватної особи</h6>
                    <div className="row g-2">
                      <div className="col-md-3">
                        <label className="form-label">Телефон</label>
                        <input className="form-control" name="nP_Phone" value={form.nP_Phone || ""} onChange={handleChange} placeholder="+380..." />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Прізвище</label>
                        <input className="form-control" name="nP_LastName" value={form.nP_LastName || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Ім'я</label>
                        <input className="form-control" name="nP_FirstName" value={form.nP_FirstName || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">По батькові</label>
                        <input className="form-control" name="nP_MiddleName" value={form.nP_MiddleName || ""} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}

                {form.novaPoshtaRecipientType === "1" && (
                  <div className="border p-3 rounded mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3">Дані організації</h6>
                    <div className="row g-2 mb-2">
                      <div className="col-md-4">
                        <label className="form-label">ЄДРПОУ</label>
                        <input className="form-control" name="nP_EdrpouCode" value={form.nP_EdrpouCode || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Назва компанії</label>
                        <input className="form-control" name="nP_CompanyName" value={form.nP_CompanyName || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Форма власності</label>
                        <input className="form-control" name="nP_OwnershipForm" value={form.nP_OwnershipForm || ""} onChange={handleChange} placeholder="ТОВ, ПП..." />
                      </div>
                    </div>
                    <div className="row g-2">
                      <div className="col-md-3">
                        <label className="form-label">Телефон</label>
                        <input className="form-control" name="nP_OrgPhone" value={form.nP_OrgPhone || ""} onChange={handleChange} placeholder="+380..." />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Прізвище контактної особи</label>
                        <input className="form-control" name="nP_OrgLastName" value={form.nP_OrgLastName || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Ім'я</label>
                        <input className="form-control" name="nP_OrgFirstName" value={form.nP_OrgFirstName || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">По батькові</label>
                        <input className="form-control" name="nP_OrgMiddleName" value={form.nP_OrgMiddleName || ""} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Доставка */}
              <div>
                <h6 className="mb-3">Спосіб доставки</h6>
                <div className="mb-3">
                  <label className="form-label">Тип доставки</label>
                  <select 
                    className="form-control" 
                    name="novaPoshtaDeliveryType" 
                    value={form.novaPoshtaDeliveryType ?? ""} 
                    onChange={handleChange}
                  >
                    <option value="">Не обрано</option>
                    <option value="0">Відділення</option>
                    <option value="1">Адреса</option>
                    <option value="2">Поштомат</option>
                    <option value="3">Цифрова адреса</option>
                  </select>
                </div>

                {form.novaPoshtaDeliveryType === "0" && (
                  <div className="border p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3">Відділення Нової Пошти</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label">Місто</label>
                        <input className="form-control" name="npD_City" value={form.npD_City || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Номер відділення</label>
                        <input className="form-control" name="npD_Branch" value={form.npD_Branch || ""} onChange={handleChange} placeholder="Відділення №1" />
                      </div>
                    </div>
                  </div>
                )}

                {form.novaPoshtaDeliveryType === "1" && (
                  <div className="border p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3">Доставка на адресу</h6>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <label className="form-label">Місто</label>
                        <input className="form-control" name="npD_City" value={form.npD_City || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Вулиця</label>
                        <input className="form-control" name="npD_Street" value={form.npD_Street || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Будинок</label>
                        <input className="form-control" name="npD_Building" value={form.npD_Building || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Квартира</label>
                        <input className="form-control" name="npD_Apartment" value={form.npD_Apartment || ""} onChange={handleChange} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Коментар до адреси</label>
                        <input className="form-control" name="npD_AddressComment" value={form.npD_AddressComment || ""} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}

                {form.novaPoshtaDeliveryType === "2" && (
                  <div className="border p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3">Поштомат</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label">Місто</label>
                        <input className="form-control" name="npD_City" value={form.npD_City || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Номер поштомату</label>
                        <input className="form-control" name="npD_PostomatNumber" value={form.npD_PostomatNumber || ""} onChange={handleChange} placeholder="Поштомат №123" />
                      </div>
                    </div>
                  </div>
                )}

                {form.novaPoshtaDeliveryType === "3" && (
                  <div className="border p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <h6 className="mb-3">Цифрова адреса</h6>
                    <div className="col-12">
                      <label className="form-label">Референс цифрової адреси</label>
                      <input className="form-control" name="npD_DigitalAddressReference" value={form.npD_DigitalAddressReference || ""} onChange={handleChange} placeholder="Референс з API Нової Пошти" />
                    </div>
                  </div>
                )}
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
              <h5 className="mb-3">Банківські реквізити</h5>
              <div className="row g-3">
                {(form.bankDetails || []).map((bank, index) => (
                  <div key={index} className="col-md-6">
                    <div className="card border mb-3">
                      <div className="card-body">
                        <h6 className="card-title">Рахунок #{index + 1}</h6>
                        <hr />
                        <div className="mb-2">
                          <label htmlFor={`typeAccount-${index}`} className="form-label">Тип рахунку</label>
                          <select id={`typeAccount-${index}`} className="form-control" value={bank.typeAccount} onChange={(e) => handleBankChange(index, 'typeAccount', parseInt(e.target.value))}>
                            {accountTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-2">
                          <label htmlFor={`currency-${index}`} className="form-label">Валюта</label>
                          <select id={`currency-${index}`} className="form-control" value={bank.currency} onChange={(e) => handleBankChange(index, 'currency', parseInt(e.target.value))} disabled={bank.typeAccount === 0}>
                            {bank.typeAccount === 0 ? (
                              <option value={0}>{(currencies || []).find(c => c.code === 0)?.name || 'UAH'}</option>
                            ) : (
                              (currencies || []).map(curr => (
                                <option key={curr.code} value={curr.code}>{curr.name}</option>
                              ))
                            )}
                          </select>
                        </div>
                        <div className="mb-2">
                          <label htmlFor={`bankName-${index}`} className="form-label">Назва банку</label>
                          <input id={`bankName-${index}`} className="form-control" value={bank.bankName || ""} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} autoComplete="organization" />
                        </div>
                        <div className="mb-2">
                          <label htmlFor={`bankMfo-${index}`} className="form-label">МФО</label>
                          <input id={`bankMfo-${index}`} className="form-control" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} autoComplete="off" />
                        </div>

                        {bank.typeAccount === 1 && (
                          <>
                            <div className="mb-2">
                              <label htmlFor={`iban-${index}`} className="form-label">IBAN</label>
                              <input id={`iban-${index}`} className="form-control" value={bank.iban || ""} onChange={(e) => handleBankChange(index, 'iban', e.target.value)} autoComplete="off" />
                            </div>
                            <div className="mb-2">
                              <label htmlFor={`swift-${index}`} className="form-label">SWIFT</label>
                              <input id={`swift-${index}`} className="form-control" value={bank.swift || ""} onChange={(e) => handleBankChange(index, 'swift', e.target.value)} autoComplete="off" />
                            </div>
                            <div className="mb-2">
                              <label htmlFor={`bankOfBeneficiary-${index}`} className="form-label">Банк отримувача</label>
                              <input id={`bankOfBeneficiary-${index}`} className="form-control" value={bank.bankOfBeneficiary || ""} onChange={(e) => handleBankChange(index, 'bankOfBeneficiary', e.target.value)} autoComplete="organization" />
                            </div>

                            <div className="mb-2">
                              <label className="form-label">Банки-кореспонденти</label>
                              {(bank.correspondentBanks || []).map((cb, cbIndex) => (
                                <div key={cbIndex} className="d-flex gap-2 mb-2">
                                  <input
                                    id={`cbName-${index}-${cbIndex}`}
                                    className="form-control"
                                    placeholder="Назва банку"
                                    value={cb.bankName || ""}
                                    onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'bankName', e.target.value)}
                                    autoComplete="organization"
                                  />
                                  <input
                                    id={`cbSwift-${index}-${cbIndex}`}
                                    className="form-control"
                                    placeholder="SWIFT"
                                    value={cb.swift || ""}
                                    onChange={(e) => handleCorrespondentBankChange(index, cbIndex, 'swift', e.target.value)}
                                    autoComplete="off"
                                  />
                                  <button className="btn btn-outline-danger" type="button" onClick={() => removeCorrespondentBank(index, cbIndex)}>🗑</button>
                                </div>
                              ))}
                              <button className="btn btn-sm btn-secondary" type="button" onClick={() => addCorrespondentBank(index)}>+ Додати банк-кореспондент</button>
                            </div>
                          </>
                        )}

                        <div className="d-flex gap-2 mt-2">
                          <button className="btn btn-danger btn-sm" type="button" onClick={() => removeBankAccount(index)}>🗑️ Видалити</button>
                        </div>
                      </div>
                    </div>
                  </div>))}

                <div className="col-12">
                  <button className="btn btn-success btn-sm" type="button" onClick={addBankAccount}>+ Додати рахунок</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Додаткова інформація */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Додаткова інформація">
            <div>
              <label htmlFor="additionalInfo" className="form-label">Коментар / примітки</label>
              <textarea id="additionalInfo" className="form-control" rows={3} name="additionalInfo" value={form.additionalInfo || ""} onChange={handleChange} autoComplete="off" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
