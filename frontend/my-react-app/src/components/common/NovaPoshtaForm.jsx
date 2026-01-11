import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../context/ApiContext";

/**
 * Універсальний компонент для роботи з Новою Поштою
 * Використовується в EditCompanyPage, ClientCard та інших місцях
 * 
 * @param {Object} form - Об'єкт з даними форми
 * @param {Function} setForm - Функція для оновлення форми
 * @param {boolean} isEditing - Режим редагування
 * @param {string} apiNovaPoshta - API ключ Нової Пошти (опціонально, для клієнтів використовується ключ головної компанії)
 */
function NovaPoshtaForm({ form, setForm, isEditing, apiNovaPoshta }) {
  const { apiData } = useApi();
  const { pushToast } = useToast();

  // Nova Poshta autocomplete стейти
  const [npCities, setNpCities] = useState([]);
  const [npWarehouses, setNpWarehouses] = useState([]);
  const [npPostomats, setNpPostomats] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [postomatSearchTerm, setPostomatSearchTerm] = useState("");

  // Використовуємо переданий apiNovaPoshta або apiKey з форми
  const apiKey = apiNovaPoshta || form?.apiNovaPoshtaKey;

  // Динамічне завантаження міст при пошуку (3+ символи)
  useEffect(() => {
    if (!apiKey || citySearchTerm.length < 3) {
      if (citySearchTerm.length === 0) {
        setNpCities([]);
      }
      return;
    }
    
    const timeout = setTimeout(async () => {
      setLoadingCities(true);
      try {
        const res = await fetch(
          `${apiData}/novaposhta/address/search-settlements?apiKey=${encodeURIComponent(apiKey)}&cityName=${encodeURIComponent(citySearchTerm)}&limit=500`
        );
        const json = await res.json();
        
        let cities = [];
        if (json?.data && Array.isArray(json.data)) {
          json.data.forEach(item => {
            if (item.Addresses && Array.isArray(item.Addresses)) {
              cities = cities.concat(item.Addresses);
            }
          });
        }
        
        setNpCities(cities);
      } catch (error) {
        console.error("Помилка завантаження міст:", error);
        setNpCities([]);
      } finally {
        setLoadingCities(false);
      }
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [citySearchTerm, apiKey, apiData]);

  // Автопідтягування компанії по ЄДРПОУ
  useEffect(() => {
    if (!apiKey || !form?.nP_EdrpouCode || form.nP_EdrpouCode.length !== 8) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiData}/novaposhta/counterparty/by-edrpou?apiKey=${encodeURIComponent(apiKey)}&edrpou=${encodeURIComponent(form.nP_EdrpouCode)}`
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
        
        pushToast("✅ Компанію знайдено", "success");
      } catch (error) {
        console.error("Помилка пошуку компанії:", error);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [form?.nP_EdrpouCode, apiKey, apiData, setForm, pushToast]);

  // Завантаження відділень/поштоматів при виборі міста
  const loadWarehousesForCity = async (cityRef, deliveryType) => {
    if (!apiKey || !cityRef || !deliveryType) return;
    
    setLoadingWarehouses(true);
    
    try {
      let warehouseType = null;
      
      if (deliveryType === "0") {
        warehouseType = "Branch";
      } else if (deliveryType === "2") {
        warehouseType = "Postomat";
      }
      
      const url = new URL(`${apiData}/novaposhta/address/warehouses`);
      url.searchParams.append('apiKey', apiKey);
      url.searchParams.append('cityRef', cityRef);
      if (warehouseType) {
        url.searchParams.append('warehouseType', warehouseType);
      }
      
      console.log("Запит відділень:", url.toString());
      const res = await fetch(url);
      const json = await res.json();
      console.log("Відповідь відділень:", json);
      
      if (deliveryType === "0") {
        setNpWarehouses(json?.data || []);
      } else if (deliveryType === "2") {
        setNpPostomats(json?.data || []);
      }
      
      if (json?.data?.length > 0) {
        pushToast(`✅ Знайдено ${json.data.length} ${warehouseType === 'Postomat' ? 'поштоматів' : 'відділень'}`, "success");
      } else {
        pushToast(`⚠️ Не знайдено ${warehouseType === 'Postomat' ? 'поштоматів' : 'відділень'} у цьому місті`, "warning");
      }
    } catch (error) {
      console.error("Помилка завантаження відділень:", error);
      pushToast("Помилка завантаження відділень", "error");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
                  <div className="mb-3">
                    <label className="form-label">Тип отримувача</label>
                    <select 
                      className="form-control" 
                      name="novaPoshtaRecipientType" 
                      value={form?.novaPoshtaRecipientType ?? ""} 
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Не обрано</option>
                      <option value="0">🧑 Приватна особа</option>
                      <option value="1">🏢 Організація</option>
                    </select>
                  </div>

                  {form?.novaPoshtaRecipientType === "0" && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <label className="form-label">Прізвище</label>
                        <input className="form-control" name="nP_LastName" value={form?.nP_LastName || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Ім'я</label>
                        <input className="form-control" name="nP_FirstName" value={form?.nP_FirstName || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">По батькові</label>
                        <input className="form-control" name="nP_MiddleName" value={form?.nP_MiddleName || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Телефон</label>
                        <input className="form-control" name="nP_Phone" value={form?.nP_Phone || ""} onChange={handleChange} placeholder="+380..." disabled={!isEditing} />
                      </div>
                    </div>
                  )}

                  {form?.novaPoshtaRecipientType === "1" && (
                    <div className="mt-3">
                      <div className="mb-3">
                        <label className="form-label">ЄДРПОУ <span className="badge bg-info ms-2">🔍 Автопошук</span></label>
                        <input 
                          className="form-control" 
                          name="nP_EdrpouCode" 
                          value={form?.nP_EdrpouCode || ""} 
                          onChange={handleChange}
                          placeholder="Введіть ЄДРПОУ для автопошуку"
                          disabled={!isEditing}
                        />
                        <small className="text-muted">Після введення 8+ символів компанія підтягнеться автоматично</small>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Форма власності</label>
                        <input className="form-control" name="nP_OwnershipForm" value={form?.nP_OwnershipForm || ""} onChange={handleChange} placeholder="ТОВ, ПП..." disabled={!isEditing} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Назва компанії</label>
                        <input className="form-control" name="nP_CompanyName" value={form?.nP_CompanyName || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <hr />
                      <p className="mb-2 text-muted small">Контактна особа:</p>
                      <div className="mb-2">
                        <label className="form-label">Прізвище</label>
                        <input className="form-control" name="nP_OrgLastName" value={form?.nP_OrgLastName || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Ім'я</label>
                        <input className="form-control" name="nP_OrgFirstName" value={form?.nP_OrgFirstName || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">По батькові</label>
                        <input className="form-control" name="nP_OrgMiddleName" value={form?.nP_OrgMiddleName || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Телефон</label>
                        <input className="form-control" name="nP_OrgPhone" value={form?.nP_OrgPhone || ""} onChange={handleChange} placeholder="+380..." disabled={!isEditing} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Доставка */}
              <div className="col-md-6">
                <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="mb-3" style={{ color: '#e60000' }}>📦 Доставка</h6>
                  <div className="mb-3">
                    <label className="form-label">Тип доставки</label>
                    <select 
                      className="form-control" 
                      name="novaPoshtaDeliveryType" 
                      value={form?.novaPoshtaDeliveryType ?? ""} 
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Не обрано</option>
                      <option value="0">🏪 Відділення</option>
                      <option value="1">🏠 Адреса</option>
                      <option value="2">📫 Поштомат</option>
                      <option value="3">🔢 Цифрова адреса</option>
                    </select>
                  </div>

                  {form?.novaPoshtaDeliveryType === "0" && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <label className="form-label">Місто {loadingCities && <span className="spinner-border spinner-border-sm ms-2"></span>}</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Введіть мінімум 3 символи для пошуку..."
                          value={form?.npD_City || citySearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCitySearchTerm(value);
                            if (value !== form?.npD_City) {
                              setForm(f => ({ ...f, npD_City: "" }));
                            }
                          }}
                          disabled={!isEditing || !apiKey}
                        />
                        {!apiKey && <small className="text-danger">⚠️ Спочатку введіть API ключ Нової Пошти</small>}
                        {npCities.length > 0 && citySearchTerm && (
                          <select 
                            className="form-control" 
                            value={form?.npD_City || ""} 
                            onChange={(e) => {
                              const selectedCity = npCities.find(c => c.Present === e.target.value);
                              setForm(f => ({ ...f, npD_City: e.target.value, npD_Branch: "" }));
                              if (selectedCity) {
                                console.log("Обране місто:", selectedCity);
                                loadWarehousesForCity(selectedCity.DeliveryCity, "0");
                              }
                              setNpCities([]);
                            }}
                            size="8"
                            disabled={!isEditing}
                          >
                            <option key="empty-option" value="">Оберіть місто ({npCities.length} знайдено)</option>
                            {npCities.map(city => (
                              <option key={city.Ref} value={city.Present}>
                                {city.Present}
                              </option>
                            ))}
                          </select>
                        )}
                        {citySearchTerm.length > 0 && citySearchTerm.length < 3 && !form?.npD_City && (
                          <small className="text-muted">Введіть ще {3 - citySearchTerm.length} символи для пошуку</small>
                        )}
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Відділення {loadingWarehouses && <span className="spinner-border spinner-border-sm ms-2"></span>}</label>
                        {npWarehouses.length > 0 && (
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Пошук відділення..."
                            value={warehouseSearchTerm}
                            onChange={(e) => setWarehouseSearchTerm(e.target.value)}
                            disabled={!isEditing}
                          />
                        )}
                        <select 
                          className="form-control" 
                          name="npD_Branch" 
                          value={form?.npD_Branch || ""} 
                          onChange={(e) => {
                            handleChange(e);
                            setWarehouseSearchTerm("");
                          }}
                          disabled={!isEditing || !form?.npD_City || npWarehouses.length === 0}
                          size={npWarehouses.length > 0 ? "8" : "1"}
                        >
                          <option value="">Оберіть відділення</option>
                          {npWarehouses
                            .filter(warehouse => 
                              warehouse.Description.toLowerCase().includes(warehouseSearchTerm.toLowerCase())
                            )
                            .map(warehouse => (
                              <option key={warehouse.Ref} value={warehouse.Description}>
                                {warehouse.Description}
                              </option>
                            ))}
                        </select>
                        {form?.npD_City && npWarehouses.length === 0 && !loadingWarehouses && (
                          <small className="text-muted">Відділень не знайдено в цьому місті</small>
                        )}
                      </div>
                    </div>
                  )}

                  {form?.novaPoshtaDeliveryType === "1" && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <label className="form-label">Місто {loadingCities && <span className="spinner-border spinner-border-sm ms-2"></span>}</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Введіть мінімум 3 символи для пошуку..."
                          value={form?.npD_City || citySearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCitySearchTerm(value);
                            if (value !== form?.npD_City) {
                              setForm(f => ({ ...f, npD_City: "" }));
                            }
                          }}
                          disabled={!isEditing || !apiKey}
                        />
                        {!apiKey && <small className="text-danger">⚠️ Спочатку введіть API ключ Нової Пошти</small>}
                        {npCities.length > 0 && citySearchTerm && (
                          <select 
                            className="form-control" 
                            value={form?.npD_City || ""} 
                            onChange={(e) => {
                              setForm(f => ({ ...f, npD_City: e.target.value }));
                              setNpCities([]);
                            }}
                            size="8"
                            disabled={!isEditing}
                          >
                            <option key="empty-option" value="">Оберіть місто ({npCities.length} знайдено)</option>
                            {npCities.map(city => (
                              <option key={city.Ref} value={city.Present}>
                                {city.Present}
                              </option>
                            ))}
                          </select>
                        )}
                        {citySearchTerm.length > 0 && citySearchTerm.length < 3 && !form?.npD_City && (
                          <small className="text-muted">Введіть ще {3 - citySearchTerm.length} символи для пошуку</small>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Вулиця</label>
                        <input className="form-control" name="npD_Street" value={form?.npD_Street || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Будинок</label>
                        <input className="form-control" name="npD_Building" value={form?.npD_Building || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Квартира</label>
                        <input className="form-control" name="npD_Apartment" value={form?.npD_Apartment || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Коментар</label>
                        <input className="form-control" name="npD_AddressComment" value={form?.npD_AddressComment || ""} onChange={handleChange} disabled={!isEditing} />
                      </div>
                    </div>
                  )}

                  {form?.novaPoshtaDeliveryType === "2" && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <label className="form-label">Місто {loadingCities && <span className="spinner-border spinner-border-sm ms-2"></span>}</label>
                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Введіть мінімум 3 символи для пошуку..."
                          value={form?.npD_City || citySearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCitySearchTerm(value);
                            if (value !== form?.npD_City) {
                              setForm(f => ({ ...f, npD_City: "" }));
                            }
                          }}
                          disabled={!isEditing || !apiKey}
                        />
                        {!apiKey && <small className="text-danger">⚠️ Спочатку введіть API ключ Нової Пошти</small>}
                        {npCities.length > 0 && citySearchTerm && (
                          <select 
                            className="form-control" 
                            value={form?.npD_City || ""} 
                            onChange={(e) => {
                              const selectedCity = npCities.find(c => c.Present === e.target.value);
                              setForm(f => ({ ...f, npD_City: e.target.value, npD_PostomatNumber: "" }));
                              if (selectedCity) {
                                loadWarehousesForCity(selectedCity.DeliveryCity, "2");
                              }
                              setNpCities([]);
                            }}
                            size="8"
                            disabled={!isEditing}
                          >
                            <option key="empty-option" value="">Оберіть місто ({npCities.length} знайдено)</option>
                            {npCities.map(city => (
                              <option key={city.Ref} value={city.Present}>
                                {city.Present}
                              </option>
                            ))}
                          </select>
                        )}
                        {citySearchTerm.length > 0 && citySearchTerm.length < 3 && !form?.npD_City && (
                          <small className="text-muted">Введіть ще {3 - citySearchTerm.length} символи для пошуку</small>
                        )}
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Поштомат {loadingWarehouses && <span className="spinner-border spinner-border-sm ms-2"></span>}</label>
                        {npPostomats.length > 0 && (
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Пошук поштомата..."
                            value={postomatSearchTerm}
                            onChange={(e) => setPostomatSearchTerm(e.target.value)}
                            disabled={!isEditing}
                          />
                        )}
                        <select 
                          className="form-control" 
                          name="npD_PostomatNumber" 
                          value={form?.npD_PostomatNumber || ""} 
                          onChange={(e) => {
                            handleChange(e);
                            setPostomatSearchTerm("");
                          }}
                          disabled={!isEditing || !form?.npD_City || npPostomats.length === 0}
                          size={npPostomats.length > 0 ? "8" : "1"}
                        >
                          <option value="">Оберіть поштомат</option>
                          {npPostomats
                            .filter(warehouse => 
                              warehouse.Description.toLowerCase().includes(postomatSearchTerm.toLowerCase())
                            )
                            .map(warehouse => (
                              <option key={warehouse.Ref} value={warehouse.Description}>
                                {warehouse.Description}
                              </option>
                            ))}
                        </select>
                        {form?.npD_City && npPostomats.length === 0 && !loadingWarehouses && (
                          <small className="text-muted">Поштоматів не знайдено в цьому місті</small>
                        )}
                      </div>
                    </div>
                  )}

                  {form?.novaPoshtaDeliveryType === "3" && (
                    <div className="mt-3">
                      <div className="mb-0">
                        <label className="form-label">Референс цифрової адреси</label>
                        <input className="form-control" name="npD_DigitalAddressReference" value={form?.npD_DigitalAddressReference || ""} onChange={handleChange} placeholder="Референс з API Нової Пошти" disabled={!isEditing} />
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
  );
}

export default NovaPoshtaForm;
