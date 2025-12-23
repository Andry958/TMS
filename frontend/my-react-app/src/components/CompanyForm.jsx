import React from "react";

/*
  Shared company form UI. Renders inputs in the same visual structure
  and order as MyCompanyPage's cards/rows, but with editable inputs.
  Props must provide `form` and all handlers used by the pages.
*/
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
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Основна інформація">
            <div className="mb-2">
              <label className="form-label">Назва компанії</label>
              <input className="form-control" name="name" value={form.name || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Тип компанії (ТОВ, ПП)</label>
              <input className="form-control" name="companyType" value={form.companyType || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">ЄДРПОУ</label>
              <input className="form-control" name="codeCompany" value={form.codeCompany || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">ІПН</label>
              <input className="form-control" name="ipn" value={form.ipn || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Система оподаткування</label>
              <input className="form-control" name="taxSystem" value={form.taxSystem || ""} onChange={handleChange} />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Керівництво">
            <div className="mb-2">
              <label className="form-label">Директор</label>
              <input className="form-control" name="directorFullName" value={form.directorFullName || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Бухгалтер</label>
              <input className="form-control" name="accountantFullName" value={form.accountantFullName || ""} onChange={handleChange} />
            </div>
          </Section>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Контактна інформація">
            <div className="mb-2">
              <label className="form-label">Телефон</label>
              <input className="form-control" name="phoneNumber" value={form.phoneNumber || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" name="email" value={form.email || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Сайт</label>
              <input className="form-control" name="website" value={form.website || ""} onChange={handleChange} />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Юридична адреса">
            <div className="mb-2">
              <label className="form-label">Адреса</label>
              <input className="form-control" name="legalAddress_StreetAddress" value={form.legalAddress_StreetAddress || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Місто/Регіон</label>
              <input className="form-control" name="legalAddress_City" value={form.legalAddress_City || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Країна/Індекс</label>
              <input className="form-control" name="legalAddress_Country" value={form.legalAddress_Country || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Буд./Кв.</label>
              <div className="d-flex gap-2">
                <input className="form-control" name="legalAddress_BuildingNumber" value={form.legalAddress_BuildingNumber || ""} onChange={handleChange} />
                <input className="form-control" name="legalAddress_ApartmentNumber" value={form.legalAddress_ApartmentNumber || ""} onChange={handleChange} />
              </div>
            </div>
          </Section>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="Поштова адреса">
            <div className="mb-2">
              <label className="form-label">Адреса</label>
              <input className="form-control" name="postalAddress_StreetAddress" value={form.postalAddress_StreetAddress || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Квартира</label>
              <input className="form-control" name="postalAddress_ApartmentNumber" value={form.postalAddress_ApartmentNumber || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Місто/Регіон</label>
              <input className="form-control" name="postalAddress_City" value={form.postalAddress_City || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Країна/Індекс</label>
              <input className="form-control" name="postalAddress_Country" value={form.postalAddress_Country || ""} onChange={handleChange} />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Фактична адреса">
            <div className="mb-2">
              <label className="form-label">Адреса</label>
              <input className="form-control" name="actualAddress_StreetAddress" value={form.actualAddress_StreetAddress || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Квартира</label>
              <input className="form-control" name="actualAddress_ApartmentNumber" value={form.actualAddress_ApartmentNumber || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Місто/Регіон</label>
              <input className="form-control" name="actualAddress_City" value={form.actualAddress_City || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">Країна/Індекс</label>
              <input className="form-control" name="actualAddress_Country" value={form.actualAddress_Country || ""} onChange={handleChange} />
            </div>
          </Section>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Банківські реквізити</h5>
              <div className="row g-3">
                {(form.bankDetails || []).length === 0 ? (
                  <p className="text-muted">Немає доданих банківських рахунків</p>
                ) : (
                  (form.bankDetails || []).map((bank, index) => (
                    <div key={index} className="col-md-6">
                      <div className="card border mb-3">
                        <div className="card-body">
                          <h6 className="card-title">Рахунок #{index + 1}</h6>
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
                                <option value={0}>{(currencies || []).find(c => c.code === 0)?.name || 'UAH'}</option>
                              ) : (
                                (currencies || []).map(curr => (
                                  <option key={curr.code} value={curr.code}>{curr.name}</option>
                                ))
                              )}
                            </select>
                          </div>
                          <div className="mb-2">
                            <label className="form-label">Назва банку</label>
                            <input className="form-control" value={bank.bankName || ""} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} />
                          </div>
                          <div className="mb-2">
                            <label className="form-label">МФО</label>
                            <input className="form-control" value={bank.bankMfo || ""} onChange={(e) => handleBankChange(index, 'bankMfo', e.target.value)} />
                          </div>

                          {bank.typeAccount === 1 && (
                            <>
                              <div className="mb-2">
                                <label className="form-label">IBAN</label>
                                <input className="form-control" value={bank.iban || ""} onChange={(e) => handleBankChange(index, 'iban', e.target.value)} />
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
                    </div>
                  ))
                )}
                <div className="col-12">
                  <button className="btn btn-success btn-sm" type="button" onClick={addBankAccount}>+ Додати рахунок</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Section title="API інтеграції">
            <div className="mb-2">
              <label className="form-label">Nova Poshta API</label>
              <input className="form-control" name="apiNovaPoshtaKey" value={form.apiNovaPoshtaKey || ""} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label className="form-label">LardyTrans API</label>
              <input className="form-control" name="apiLardyTransKey" value={form.apiLardyTransKey || ""} onChange={handleChange} />
            </div>
          </Section>
        </div>

        <div className="col-md-6">
          <Section title="Додаткова інформація">
            <div>
              <label className="form-label">Коментар / примітки</label>
              <textarea className="form-control" rows={3} name="additionalInfo" value={form.additionalInfo || ""} onChange={handleChange} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
