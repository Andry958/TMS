import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://localhost:7060'; // або ваш продакшн URL

// Надійніше форматування дати (обробляє "DD-MM-YYYY HH:mm:ss" і "YYYY-MM-DD HH:mm:ss")
const formatDate = (dateString) => {
  if (!dateString) return '—';

  let cleaned = dateString.trim();
  // Замінюємо "DD-MM-YYYY" на "YYYY-MM-DD" для new Date()
  if (/^\d{2}-\d{2}-\d{4}/.test(cleaned)) {
    const [day, month, yearAndTime] = cleaned.split(' ');
    const [year, time] = yearAndTime.split(' ');
    cleaned = `${year}-${month}-${day}T${time}`;
  } else {
    cleaned = cleaned.replace(' ', 'T');
  }

  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return dateString; // якщо не вдалося — повертаємо як є

  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (amount) => {
  if (amount == null) return '—';
  return Number(amount).toLocaleString('uk-UA', { minimumFractionDigits: 2 }) + ' ₴';
};

function NovaPoshtaTrackingPage({ companyId }) {
  const navigate = useNavigate();
  const [trackings, setTrackings] = useState([]);
  const [companyApiKey, setCompanyApiKey] = useState('');
  const [newTTN, setNewTTN] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString('uk-UA'));
  const [selectedTracking, setSelectedTracking] = useState(null);

  const fetchTrackings = async () => {
    if (!companyId) {
      setError('Не вказано ID компанії');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/api/Tracking/company/${companyId}`;
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Помилка ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('📊 Отримані трекінги:', data);
      setTrackings(Array.isArray(data) ? data : []);
      setLastUpdated(new Date().toLocaleString('uk-UA'));
    } catch (err) {
      console.error('❌ Помилка завантаження:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async () => {
    try {
      if (!companyId) return;
      const res = await fetch(`${API_BASE_URL}/api/company/${companyId}`);
      if (!res.ok) return;
      const data = await res.json();
      setCompanyApiKey(data?.apiKeys?.novaPoshta || '');
    } catch (err) {
      console.error('Error fetching company:', err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompany();
      fetchTrackings();
    }
  }, [companyId]);

  const handleAddTracking = async (e) => {
    e.preventDefault();
    if (!newTTN.trim() || !companyApiKey.trim() || !companyId) {
      alert('Заповніть усі поля та переконайтесь, що у компанії налаштований API-ключ Nova Poshta');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        TTN: newTTN.trim(),
        IdCompany: Number(companyId),
      };

      const response = await fetch(`${API_BASE_URL}/api/Tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Помилка додавання: ${text}`);
      }

      await fetchTrackings(); // оновлюємо весь список з сервера
      setNewTTN('');
      alert('ТТН успішно додано!');
    } catch (err) {
      alert(`Помилка: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🚚 Відстеження Nova Poshta</h2>
          <p className="text-muted">Список відправлень компанії</p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={fetchTrackings}
          disabled={loading}
        >
          {loading ? 'Оновлення...' : '🔄 Оновити'}
        </button>
      </div>

      {/* Форма додавання */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Додати відправлення</h5>
          <form onSubmit={handleAddTracking}>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Номер ТТН</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Наприклад: 20451234567890"
                  value={newTTN}
                  onChange={(e) => setNewTTN(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  ➕ Додати
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      <div className="alert alert-info mb-4">
        <strong>Останнє оновлення:</strong> {lastUpdated}
      </div>

      {/* Таблиця */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Список відправлень ({trackings.length})</h5>

          {loading && !trackings.length ? (
            <div className="text-center py-5">Завантаження...</div>
          ) : !trackings.length ? (
            <p className="text-center text-muted py-5">📦 Немає відправлень. Додайте першу ТТН!</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>№</th>
                    <th>ТТН</th>
                    <th>Статус</th>
                    <th>Дата доставки</th>
                    <th>Отримувач</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {trackings.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>
                        <strong className="font-monospace">{item.number || '—'}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            Number(item.statusCode) < 0 || (item.status || '').toLowerCase().includes('помилка')
                              ? 'bg-danger'
                              : item.status?.includes('Доставлено')
                              ? 'bg-success'
                              : item.status?.includes('В дорозі') || item.status?.includes('На відділенні')
                              ? 'bg-warning'
                              : 'bg-secondary'
                          }`}
                        >
                          {item.status || '—'}
                        </span>
                      </td>
                      <td>{formatDate(item.recipientDateTime || item.actualDeliveryDate)}</td>
                      <td>{item.recipientFullName || '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => navigate(`/tracking/detail/${item.id}`)}
                          title="Переглянути деталі"
                        >
                          👁️ Деталі
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => navigate(`/tracking/edit/${item.id}`)}
                          title="Редагувати"
                        >
                          ✏️ Редагувати
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Модальне вікно з деталями */}
      {selectedTracking && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Деталі ТТН {selectedTracking.number}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTracking(null)}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Основне</h6>
                    <p><strong>Статус:</strong> {selectedTracking.status}</p>
                    <p><strong>Код статусу:</strong> {selectedTracking.statusCode}</p>
                    <p><strong>Створено:</strong> {formatDate(selectedTracking.dateCreated)}</p>
                    <p><strong>Оновлено:</strong> {formatDate(selectedTracking.trackingUpdateDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Отримувач</h6>
                    <p><strong>ПІБ:</strong> {selectedTracking.recipientFullName || '—'}</p>
                    <p><strong>Телефон:</strong> {selectedTracking.phoneRecipient || '—'}</p>
                    <p><strong>Місто:</strong> {selectedTracking.cityRecipient || '—'}</p>
                    <p><strong>Адреса:</strong> {selectedTracking.recipientAddress || '—'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Відправник</h6>
                    <p><strong>Місто:</strong> {selectedTracking.citySender || '—'}</p>
                    <p><strong>Адреса:</strong> {selectedTracking.senderAddress || '—'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Вартість та оплата</h6>
                    <p><strong>До сплати:</strong> {formatMoney(selectedTracking.expressWaybillAmountToPay)}</p>
                    <p><strong>Статус оплати:</strong> {selectedTracking.expressWaybillPaymentStatus || '—'}</p>
                    <p><strong>Платник:</strong> {selectedTracking.payerType || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTracking(null)}
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setSelectedTracking(null)} />
        </div>
      )}
    </div>
  );
}

export default NovaPoshtaTrackingPage;