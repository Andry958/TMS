import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://localhost:7060';

function TrackingEditPage() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/Tracking/${trackingId}`);
        if (!response.ok) {
          throw new Error('Не вдалося завантажити деталі');
        }
        const data = await response.json();
        setTracking(data);
        setFormData(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (trackingId) fetchTracking();
  }, [trackingId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Видаляємо поля, які не повинні редагуватися (приходять з Nova Poshta)
      const dataToSend = { ...formData };
      delete dataToSend.status;
      delete dataToSend.statusCode;
      delete dataToSend.trackingUpdateDate;
      delete dataToSend.actualDeliveryDate;
      delete dataToSend.recipientDateTime;
      delete dataToSend.expressWaybillPaymentStatus;
      delete dataToSend.expressWaybillAmountToPay;

      const response = await fetch(`${API_BASE_URL}/api/Tracking/${trackingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Помилка збереження: ${text}`);
      }

      setSuccess('Зміни успішно збережені!');
      setTimeout(() => navigate(`/tracking/detail/${trackingId}`), 1500);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !tracking) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          <h4>Помилка</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Повернутися
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row mb-4">
        <div className="col">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            ← Повернутися
          </button>
        </div>
      </div>

      <div className="card shadow-lg">
        <div className="card-header bg-warning text-dark">
          <h3 className="mb-0">Редагування відправлення: {formData.number}</h3>
        </div>
        <div className="card-body">
          {success && (
            <div className="alert alert-success alert-dismissible fade show">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess(null)} />
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Основна інформація */}
            <div className="row g-3 mb-4">
              <h5 className="fw-bold">📋 Основне</h5>

              <div className="col-md-6">
                <label className="form-label">Номер ТТН</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.number || ''}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Статус <span className="text-danger">(не редаговується)</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.status || ''}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Код статусу <span className="text-danger">(не редаговується)</span></label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.statusCode || ''}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Дата створення</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.dateCreated || ''}
                  onChange={(e) => handleInputChange('dateCreated', e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Дата оновлення трекінгу <span className="text-danger">(не редаговується)</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.trackingUpdateDate || ''}
                  disabled
                />
              </div>
            </div>

            {/* Отримувач */}
            <div className="row g-3 mb-4">
              <h5 className="fw-bold">👤 Отримувач</h5>

              <div className="col-md-6">
                <label className="form-label">ПІБ отримувача</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.recipientFullName || ''}
                  onChange={(e) => handleInputChange('recipientFullName', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Телефон</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phoneRecipient || ''}
                  onChange={(e) => handleInputChange('phoneRecipient', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Місто отримувача</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cityRecipient || ''}
                  onChange={(e) => handleInputChange('cityRecipient', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Адреса отримувача</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.recipientAddress || ''}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Дата доставки <span className="text-danger">(не редаговується)</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.recipientDateTime || ''}
                  disabled
                />
              </div>

              <div className="col-12">
                <label className="form-label">Фактична дата доставки <span className="text-danger">(не редаговується)</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.actualDeliveryDate || ''}
                  disabled
                />
              </div>
            </div>

            {/* Відправник */}
            <div className="row g-3 mb-4">
              <h5 className="fw-bold">📤 Відправник</h5>

              <div className="col-md-6">
                <label className="form-label">Місто відправника</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.citySender || ''}
                  onChange={(e) => handleInputChange('citySender', e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Адреса відправника</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.senderAddress || ''}
                  onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                />
              </div>
            </div>

            {/* Оплата та вартість */}
            <div className="row g-3 mb-4">
              <h5 className="fw-bold">💰 Вартість та оплата</h5>

              <div className="col-md-6">
                <label className="form-label">До сплати <span className="text-danger">(не редаговується)</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.expressWaybillAmountToPay || ''}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Статус оплати <span className="text-danger">(не редаговується)</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.expressWaybillPaymentStatus || ''}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Платник</label>
                <select
                  className="form-select"
                  value={formData.payerType || ''}
                  onChange={(e) => handleInputChange('payerType', e.target.value)}
                >
                  <option value="">Виберіть платника</option>
                  <option value="Відправник">Відправник</option>
                  <option value="Отримувач">Отримувач</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Вартість</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.cost || ''}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                />
              </div>
            </div>

            {/* Додатково */}
            <div className="row g-3 mb-4">
              <h5 className="fw-bold">📦 Додаткова інформація</h5>

              <div className="col-md-6">
                <label className="form-label">Вага (кг)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Опис</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                ← Скасувати
              </button>
              <button
                type="submit"
                className="btn btn-warning"
                disabled={saving}
              >
                {saving ? 'Збереження...' : '💾 Зберегти зміни'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TrackingEditPage;
