import { useState, useEffect } from 'react';
import TrackingDetails from './TrackingDetails';


// Функція форматування дати (можна замінити на date-fns або moment)
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Функція форматування суми
const formatMoney = (amount) => {
  if (!amount) return '—';
  return Number(amount).toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' грн';
};

function TrackingsTable({ companyId, refresh }) {
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTracking, setSelectedTracking] = useState(null);

  useEffect(() => {
    const fetchTrackings = async () => {
      try {
        setLoading(true);
        // Приклад ендпоінту з вашого бекенду
        const response = await fetch(`/api/Tracking/company/${companyId}`);
        if (!response.ok) throw new Error('Не вдалося завантажити дані');

        const data = await response.json();
        console.log('✅ Отримані дані трекінгів:', data);
        setTrackings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchTrackings();
    }
  }, [companyId, refresh]);

  if (loading) return <div className="text-center py-5">Завантаження...</div>;
  if (error) return <div className="alert alert-danger">Помилка: {error}</div>;
  if (!trackings.length) return <div className="text-center py-5">Немає відправлень</div>;

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th className="text-center">№</th>
              <th>Номер ТТН</th>
              <th>Помилка / Статус</th>
              <th className="text-center">Календ./Роб.</th>
              <th className="text-center">К-сть місць</th>
              <th>Крайній термін</th>
              <th>Протермінування</th>
              <th className="text-end">Сума, грн</th>
              <th>№ рахунку</th>
              <th>Платник</th>
              <th>Транспорт</th>
              <th>Маршрут</th>
              <th>Оплата</th>
              <th className="text-center">Дія</th>
            </tr>
          </thead>
          <tbody>
            {trackings.map((tracking, index) => {
              const isError = tracking.StatusCode < 0 || (tracking.Status || '').toLowerCase().includes('помилка');

              // Різниця в днях між створенням і фактичною доставкою
              let calendarDays = '—';
              if (tracking.DateCreated && tracking.ActualDeliveryDate) {
                const created = new Date(tracking.DateCreated);
                const delivered = new Date(tracking.ActualDeliveryDate);
                calendarDays = Math.round((delivered - created) / (1000 * 60 * 60 * 24));
              }

              // Протермінування
              let overdue = '—';
              if (tracking.ScheduledDeliveryDate && tracking.ActualDeliveryDate) {
                const scheduled = new Date(tracking.ScheduledDeliveryDate);
                const actual = new Date(tracking.ActualDeliveryDate);
                if (actual > scheduled) {
                  const days = Math.round((actual - scheduled) / (1000 * 60 * 60 * 24));
                  overdue = `+${days} дн.`;
                }
              }

              const route = [tracking.CitySender, tracking.CityRecipient]
                .filter(Boolean)
                .join(' → ') || '—';

              return (
                <tr key={tracking.Id || index} className={isError ? 'table-danger' : ''}>
                  <td className="text-center">{index + 1}</td>
                  <td><strong>{tracking.Number || '—'}</strong></td>
                  <td>
                    {isError ? (
                      <span className="badge bg-danger">Помилка / невірна ТТН</span>
                    ) : (
                      <span className="badge bg-secondary">{tracking.Status || '—'}</span>
                    )}
                  </td>
                  <td className="text-center">{calendarDays}</td>
                  <td className="text-center">{tracking.SeatsAmount || '—'}</td>
                  <td>{formatDate(tracking.ScheduledDeliveryDate)}</td>
                  <td className={overdue.startsWith('+') ? 'text-danger fw-bold' : ''}>
                    {overdue}
                  </td>
                  <td className="text-end">
                    {formatMoney(tracking.ExpressWaybillAmountToPay || tracking.DocumentCost)}
                  </td>
                  <td>{tracking.RefEW || '—'}</td>
                  <td>{tracking.PayerType || '—'}</td>
                  <td>{tracking.ServiceType || '—'}</td>
                  <td>{route}</td>
                  <td>{tracking.ExpressWaybillPaymentStatus || '—'}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedTracking(tracking)}
                      title="Детальна інформація"
                    >
                      🛈 Інформація
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Модальне вікно з деталями */}
      {selectedTracking && (
        <TrackingDetails
          tracking={selectedTracking}
          onClose={() => setSelectedTracking(null)}
        />
      )}
    </>
  );
}

export default TrackingsTable;