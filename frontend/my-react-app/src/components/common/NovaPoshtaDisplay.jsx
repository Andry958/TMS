/**
 * Компонент для відображення (read-only) даних Нової Пошти
 * Використовується для показу збережених даних без можливості редагування
 */
function NovaPoshtaDisplay({ form }) {
  if (!form) return null;

  // Перевірка чи є взагалі дані Нової Пошти
  const hasRecipientData = form.novaPoshtaRecipientType !== undefined && form.novaPoshtaRecipientType !== "";
  const hasDeliveryData = form.novaPoshtaDeliveryType !== undefined && form.novaPoshtaDeliveryType !== "";

  if (!hasRecipientData && !hasDeliveryData) {
    return (
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm" style={{ borderLeft: '4px solid #e60000' }}>
            <div className="card-body">
              <h5 className="mb-3" style={{ color: '#e60000' }}>🚚 Нова Пошта</h5>
              <p className="text-muted mb-0">Дані Нової Пошти не заповнені</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4 mb-4">
      <div className="col-12">
        <div className="card shadow-sm" style={{ borderLeft: '4px solid #e60000' }}>
          <div className="card-body">
            <h5 className="mb-3" style={{ color: '#e60000' }}>🚚 Нова Пошта</h5>
            
            <div className="row g-4">
              {/* Отримувач */}
              <div className="col-md-6">
                <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="mb-3" style={{ color: '#e60000' }}>👤 Отримувач</h6>
                  
                  <div className="mb-2">
                    <label className="form-label fw-bold">Тип отримувача:</label>
                    <p className="mb-0">
                      {form.novaPoshtaRecipientType === "0" && "🧑 Приватна особа"}
                      {form.novaPoshtaRecipientType === "1" && "🏢 Організація"}
                      {!form.novaPoshtaRecipientType && <span className="text-muted">Не вказано</span>}
                    </p>
                  </div>

                  {form.novaPoshtaRecipientType === "0" && (
                    <>
                      {(form.nP_LastName || form.nP_FirstName || form.nP_MiddleName) && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">ПІБ:</label>
                          <p className="mb-0">
                            {[form.nP_LastName, form.nP_FirstName, form.nP_MiddleName]
                              .filter(Boolean)
                              .join(' ') || '-'}
                          </p>
                        </div>
                      )}
                      {form.nP_Phone && (
                        <div className="mb-0">
                          <label className="form-label fw-bold">Телефон:</label>
                          <p className="mb-0">{form.nP_Phone}</p>
                        </div>
                      )}
                    </>
                  )}

                  {form.novaPoshtaRecipientType === "1" && (
                    <>
                      {form.nP_EdrpouCode && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">ЄДРПОУ:</label>
                          <p className="mb-0">{form.nP_EdrpouCode}</p>
                        </div>
                      )}
                      {(form.nP_OwnershipForm || form.nP_CompanyName) && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">Компанія:</label>
                          <p className="mb-0">
                            {form.nP_OwnershipForm && `${form.nP_OwnershipForm} `}
                            {form.nP_CompanyName || '-'}
                          </p>
                        </div>
                      )}
                      {(form.nP_OrgLastName || form.nP_OrgFirstName || form.nP_OrgMiddleName) && (
                        <>
                          <hr className="my-2" />
                          <p className="mb-1 text-muted small">Контактна особа:</p>
                          <div className="mb-2">
                            <label className="form-label fw-bold">ПІБ:</label>
                            <p className="mb-0">
                              {[form.nP_OrgLastName, form.nP_OrgFirstName, form.nP_OrgMiddleName]
                                .filter(Boolean)
                                .join(' ') || '-'}
                            </p>
                          </div>
                        </>
                      )}
                      {form.nP_OrgPhone && (
                        <div className="mb-0">
                          <label className="form-label fw-bold">Телефон:</label>
                          <p className="mb-0">{form.nP_OrgPhone}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Доставка */}
              <div className="col-md-6">
                <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="mb-3" style={{ color: '#e60000' }}>📦 Доставка</h6>
                  
                  <div className="mb-2">
                    <label className="form-label fw-bold">Тип доставки:</label>
                    <p className="mb-0">
                      {form.novaPoshtaDeliveryType === "0" && "🏪 Відділення"}
                      {form.novaPoshtaDeliveryType === "1" && "🏠 Адреса"}
                      {form.novaPoshtaDeliveryType === "2" && "📫 Поштомат"}
                      {form.novaPoshtaDeliveryType === "3" && "🔢 Цифрова адреса"}
                      {!form.novaPoshtaDeliveryType && <span className="text-muted">Не вказано</span>}
                    </p>
                  </div>

                  {form.novaPoshtaDeliveryType === "0" && (
                    <>
                      {form.npD_City && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">Місто:</label>
                          <p className="mb-0">{form.npD_City}</p>
                        </div>
                      )}
                      {form.npD_Branch && (
                        <div className="mb-0">
                          <label className="form-label fw-bold">Відділення:</label>
                          <p className="mb-0">{form.npD_Branch}</p>
                        </div>
                      )}
                    </>
                  )}

                  {form.novaPoshtaDeliveryType === "1" && (
                    <>
                      {form.npD_City && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">Місто:</label>
                          <p className="mb-0">{form.npD_City}</p>
                        </div>
                      )}
                      {form.npD_Street && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">Вулиця:</label>
                          <p className="mb-0">{form.npD_Street}</p>
                        </div>
                      )}
                      {(form.npD_Building || form.npD_Apartment) && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">Будинок/Квартира:</label>
                          <p className="mb-0">
                            {form.npD_Building && `буд. ${form.npD_Building}`}
                            {form.npD_Building && form.npD_Apartment && ', '}
                            {form.npD_Apartment && `кв. ${form.npD_Apartment}`}
                          </p>
                        </div>
                      )}
                      {form.npD_AddressComment && (
                        <div className="mb-0">
                          <label className="form-label fw-bold">Коментар:</label>
                          <p className="mb-0">{form.npD_AddressComment}</p>
                        </div>
                      )}
                    </>
                  )}

                  {form.novaPoshtaDeliveryType === "2" && (
                    <>
                      {form.npD_City && (
                        <div className="mb-2">
                          <label className="form-label fw-bold">Місто:</label>
                          <p className="mb-0">{form.npD_City}</p>
                        </div>
                      )}
                      {form.npD_PostomatNumber && (
                        <div className="mb-0">
                          <label className="form-label fw-bold">Поштомат:</label>
                          <p className="mb-0">{form.npD_PostomatNumber}</p>
                        </div>
                      )}
                    </>
                  )}

                  {form.novaPoshtaDeliveryType === "3" && form.npD_DigitalAddressReference && (
                    <div className="mb-0">
                      <label className="form-label fw-bold">Цифрова адреса:</label>
                      <p className="mb-0">
                        <code className="text-break">{form.npD_DigitalAddressReference}</code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NovaPoshtaDisplay;
