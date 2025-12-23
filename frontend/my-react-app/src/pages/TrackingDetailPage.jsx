import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://localhost:7060';

const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '—';

  let cleaned = dateString.trim();
  if (!cleaned) return '—';
  
  try {
    if (/^\d{2}-\d{2}-\d{4}/.test(cleaned)) {
      // Format: "DD-MM-YYYY HH:mm:ss"
      const parts = cleaned.split(' ');
      if (parts.length >= 2) {
        const [day, month, yearPart] = parts[0].split('-');
        const time = parts.slice(1).join(' '); // Join time parts in case of multiple spaces
        if (day && month && yearPart && time) {
          cleaned = `${yearPart}-${month}-${day}T${time}`;
        }
      }
    } else if (cleaned.includes('T')) {
      // Already ISO format, keep as is
    } else {
      // Try replacing space with T for ISO format
      cleaned = cleaned.replace(' ', 'T');
    }

    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};

const formatMoney = (amount) => {
  if (amount == null) return '—';
  return Number(amount).toLocaleString('uk-UA', { minimumFractionDigits: 2 }) + ' ₴';
};

function TrackingDetailPage() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (trackingId) fetchTracking();
  }, [trackingId]);

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

  if (error || !tracking) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">
          <h4>Помилка</h4>
          <p>{error || 'Не вдалося завантажити деталі відправлення'}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Повернутися
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status, statusCode) => {
    if (Number(statusCode) < 0 || (status || '').toLowerCase().includes('помилка')) {
      return 'bg-danger';
    }
    if (status?.includes('Доставлено')) {
      return 'bg-success';
    }
    if (status?.includes('В дорозі') || status?.includes('На відділенні')) {
      return 'bg-warning';
    }
    return 'bg-secondary';
  };

  return (
    <div className="container my-5">
      <div className="row mb-4">
        <div className="col">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            ← Повернутися
          </button>
        </div>
        <div className="col text-end">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/tracking/edit/${tracking.id}`)}
          >
            ✏️ Редагувати
          </button>
        </div>
      </div>

      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Деталі відправлення: {tracking.number}</h3>
        </div>
        <div className="card-body">
          {/* Основна інформація */}
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">📋 Основне</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="text-muted small">Статус</label>
                  <p>
                    <span className={`badge ${getStatusBadgeClass(tracking.status, tracking.statusCode)}`}>
                      {tracking.status || '—'}
                    </span>
                  </p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Код статусу</label>
                  <p className="mb-0">{tracking.statusCode || '—'}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Дата створення</label>
                  <p className="mb-0">{formatDate(tracking.dateCreated)}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Дата оновлення</label>
                  <p className="mb-0">{formatDate(tracking.trackingUpdateDate)}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Дата доставки</label>
                  <p className="mb-0">{formatDate(tracking.recipientDateTime || tracking.actualDeliveryDate)}</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold mb-3">👤 Отримувач</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="text-muted small">ПІБ</label>
                  <p className="mb-0">{tracking.recipientFullName || '—'}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Телефон</label>
                  <p className="mb-0">{tracking.phoneRecipient || '—'}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Місто</label>
                  <p className="mb-0">{tracking.cityRecipient || '—'}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Адреса</label>
                  <p className="mb-0">{tracking.recipientAddress || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Відправник та доставка */}
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">📤 Відправник</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="text-muted small">Місто</label>
                  <p className="mb-0">{tracking.citySender || '—'}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Адреса</label>
                  <p className="mb-0">{tracking.senderAddress || '—'}</p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h5 className="fw-bold mb-3">💰 Вартість та оплата</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="text-muted small">До сплати</label>
                  <p className="mb-0">{formatMoney(tracking.expressWaybillAmountToPay)}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Статус оплати</label>
                  <p className="mb-0">{tracking.expressWaybillPaymentStatus || '—'}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Платник</label>
                  <p className="mb-0">{tracking.payerType || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Додаткова інформація */}
          {(tracking.description || tracking.weight || tracking.cost) && (
            <div className="row g-4">
              <div className="col-12">
                <h5 className="fw-bold mb-3">📦 Додаткова інформація</h5>
                <div className="row g-3">
                  {tracking.description && (
                    <div className="col-12">
                      <label className="text-muted small">Опис</label>
                      <p className="mb-0">{tracking.description}</p>
                    </div>
                  )}
                  {tracking.weight && (
                    <div className="col-md-6">
                      <label className="text-muted small">Вага</label>
                      <p className="mb-0">{tracking.weight} кг</p>
                    </div>
                  )}
                  {tracking.cost && (
                    <div className="col-md-6">
                      <label className="text-muted small">Вартість</label>
                      <p className="mb-0">{formatMoney(tracking.cost)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between gap-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              ← Повернутися
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/tracking/edit/${tracking.id}`)}
            >
              ✏️ Редагувати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackingDetailPage;
