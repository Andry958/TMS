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

function ClientBankDetails({ form, isEditing, onBankChange, onAddBank, onRemoveBank, onAddCorrespondent, onRemoveCorrespondent, onCorrespondentChange }) {
  return (
    <div className="row g-4 mb-4">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Банківські реквізити</h5>
              {isEditing && (
                <button className="btn btn-success btn-sm" onClick={onAddBank}>
                  + Додати рахунок
                </button>
              )}
            </div>
            <div className="row g-3">
              {(form.bankDetails || []).map((bank, index) => (
                <div key={index} className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>
                          Рахунок #{index + 1}{" "}
                          <span className="badge bg-primary ms-2">
                            {accountTypes.find(t => t.value === bank.typeAccount)?.name}
                          </span>
                        </h6>
                        {isEditing && form.bankDetails.length > 1 && (
                          <button className="btn btn-danger btn-sm" onClick={() => onRemoveBank(index)}>🗑️</button>
                        )}
                      </div>
                      <hr />
                      
                      {isEditing ? (
                        <>
                          <div className="mb-2">
                            <label className="form-label">Тип рахунку</label>
                            <select className="form-control" value={bank.typeAccount} onChange={(e) => onBankChange(index, 'typeAccount', parseInt(e.target.value))}>
                              {accountTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          {bank.typeAccount === 1 && (
                            <div className="mb-2">
                              <label className="form-label">Валюта</label>
                              <select className="form-control" value={bank.currency} onChange={(e) => onBankChange(index, 'currency', parseInt(e.target.value))}>
                                {currencies.map(curr => (
                                  <option key={curr.code} value={curr.code}>{curr.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          <div className="mb-2">
                            <label className="form-label">Назва банку</label>
                            <input className="form-control" value={bank.bankName || ""} onChange={(e) => onBankChange(index, 'bankName', e.target.value)} />
                          </div>
                          
                          <div className="mb-2">
                            <label className="form-label">МФО</label>
                            <input className="form-control" value={bank.bankMfo || ""} onChange={(e) => onBankChange(index, 'bankMfo', e.target.value)} />
                          </div>

                          {bank.typeAccount === 1 && (
                            <>
                              <div className="mb-2">
                                <label className="form-label">IBAN</label>
                                <input className="form-control" value={bank.iban || ""} onChange={(e) => onBankChange(index, 'iban', e.target.value)} />
                              </div>
                              
                              <div className="mb-2">
                                <label className="form-label">SWIFT</label>
                                <input className="form-control" value={bank.swift || ""} onChange={(e) => onBankChange(index, 'swift', e.target.value)} />
                              </div>
                              
                              <div className="mb-2">
                                <label className="form-label">Банк отримувача</label>
                                <input className="form-control" value={bank.bankOfBeneficiary || ""} onChange={(e) => onBankChange(index, 'bankOfBeneficiary', e.target.value)} />
                              </div>

                              <div className="mb-3">
                                <label className="form-label fw-bold">Банки-кореспонденти</label>
                                {(bank.correspondentBanks || []).map((cb, cbIndex) => (
                                  <div key={cbIndex} className="border p-2 mb-2 rounded">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Кореспондент #{cbIndex + 1}</strong>
                                      <button className="btn btn-danger btn-sm" onClick={() => onRemoveCorrespondent(index, cbIndex)}>×</button>
                                    </div>
                                    <div className="mb-2">
                                      <input className="form-control form-control-sm" placeholder="Назва банку" value={cb.bankName || ""} onChange={(e) => onCorrespondentChange(index, cbIndex, 'bankName', e.target.value)} />
                                    </div>
                                    <div>
                                      <input className="form-control form-control-sm" placeholder="SWIFT" value={cb.swift || ""} onChange={(e) => onCorrespondentChange(index, cbIndex, 'swift', e.target.value)} />
                                    </div>
                                  </div>
                                ))}
                                <button className="btn btn-sm btn-outline-primary w-100" onClick={() => onAddCorrespondent(index)}>+ Додати банк-кореспондент</button>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <p><strong>Банк:</strong> {bank.bankName || '-'}</p>
                          <p><strong>МФО:</strong> {bank.bankMfo || '-'}</p>
                          {bank.typeAccount === 1 && (
                            <>
                              <p><strong>IBAN:</strong> {bank.iban || '-'}</p>
                              <p><strong>SWIFT:</strong> {bank.swift || '-'}</p>
                              {bank.bankOfBeneficiary && <p><strong>Банк отримувача:</strong> {bank.bankOfBeneficiary}</p>}
                              {bank.correspondentBanks && bank.correspondentBanks.length > 0 && (
                                <div>
                                  <strong>Банки-кореспонденти:</strong>
                                  <ul className="mb-0">
                                    {bank.correspondentBanks.map((cb, cbIndex) => (
                                      <li key={cbIndex}>{cb.bankName} ({cb.swift})</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
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
  );
}

export default ClientBankDetails;
