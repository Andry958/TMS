const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function TrackingDetails({ tracking, onClose }) {
  return (
    <div
      className="modal fade show"
      style={{ display: 'block' }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Деталі відправлення № <strong>{tracking.Number}</strong>
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="row g-4">
              {/* Основна інформація */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Основна інформація</h6>
                <dl className="row mb-0">
                  <dt className="col-sm-5">Номер ТТН</dt>
                  <dd className="col-sm-7">{tracking.Number || '—'}</dd>

                  <dt className="col-sm-5">Статус</dt>
                  <dd className="col-sm-7">{tracking.Status || '—'}</dd>

                  <dt className="col-sm-5">Код статусу</dt>
                  <dd className="col-sm-7">{tracking.StatusCode}</dd>

                  <dt className="col-sm-5">Створено</dt>
                  <dd className="col-sm-7">{formatDate(tracking.DateCreated)}</dd>

                  <dt className="col-sm-5">Оновлено</dt>
                  <dd className="col-sm-7">{formatDate(tracking.TrackingUpdateDate)}</dd>
                </dl>
              </div>

              {/* Відправник */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Відправник</h6>
                <dl className="row mb-0">
                  <dt className="col-sm-5">Місто</dt>
                  <dd className="col-sm-7">{tracking.CitySender || '—'}</dd>
                  <dt className="col-sm-5">Адреса</dt>
                  <dd className="col-sm-7">{tracking.SenderAddress || '—'}</dd>
                  <dt className="col-sm-5">ПІБ</dt>
                  <dd className="col-sm-7">{tracking.SenderFullNameEW || '—'}</dd>
                  <dt className="col-sm-5">Телефон</dt>
                  <dd className="col-sm-7">{tracking.PhoneSender || '—'}</dd>
                  <dt className="col-sm-5">Відділення</dt>
                  <dd className="col-sm-7">{tracking.WarehouseSender || '—'}</dd>
                </dl>
              </div>

              {/* Отримувач */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Отримувач</h6>
                <dl className="row mb-0">
                  <dt className="col-sm-5">Місто</dt>
                  <dd className="col-sm-7">{tracking.CityRecipient || '—'}</dd>
                  <dt className="col-sm-5">Адреса</dt>
                  <dd className="col-sm-7">{tracking.RecipientAddress || '—'}</dd>
                  <dt className="col-sm-5">ПІБ</dt>
                  <dd className="col-sm-7">{tracking.RecipientFullName || '—'}</dd>
                  <dt className="col-sm-5">Телефон</dt>
                  <dd className="col-sm-7">{tracking.PhoneRecipient || '—'}</dd>
                  <dt className="col-sm-5">Відділення</dt>
                  <dd className="col-sm-7">{tracking.WarehouseRecipient || '—'}</dd>
                </dl>
              </div>

              {/* Вантаж */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Вантаж</h6>
                <dl className="row mb-0">
                  <dt className="col-sm-5">Тип</dt>
                  <dd className="col-sm-7">{tracking.CargoType || '—'}</dd>
                  <dt className="col-sm-5">Опис</dt>
                  <dd className="col-sm-7">{tracking.CargoDescriptionString || '—'}</dd>
                  <dt className="col-sm-5">Місць</dt>
                  <dd className="col-sm-7">{tracking.SeatsAmount || '—'}</dd>
                  <dt className="col-sm-5">Документарна вага</dt>
                  <dd className="col-sm-7">{tracking.DocumentWeight || '—'} кг</dd>
                  <dt className="col-sm-5">Об'ємна вага</dt>
                  <dd className="col-sm-7">{tracking.VolumeWeight || '—'} кг</dd>
                  <dt className="col-sm-5">Фактична вага</dt>
                  <dd className="col-sm-7">{tracking.FactualWeight || '—'} кг</dd>
                </dl>
              </div>

              {/* Оплата */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Оплата</h6>
                <dl className="row mb-0">
                  <dt className="col-sm-5">Платник</dt>
                  <dd className="col-sm-7">{tracking.PayerType || '—'}</dd>
                  <dt className="col-sm-5">Спосіб оплати</dt>
                  <dd className="col-sm-7">{tracking.PaymentMethod || '—'}</dd>
                  <dt className="col-sm-5">Статус оплати</dt>
                  <dd className="col-sm-7">{tracking.ExpressWaybillPaymentStatus || '—'}</dd>
                  <dt className="col-sm-5">До сплати</dt>
                  <dd className="col-sm-7">
                    {formatMoney(tracking.ExpressWaybillAmountToPay)}
                  </dd>
                  <dt className="col-sm-5">Оголошена вартість</dt>
                  <dd className="col-sm-7">{formatMoney(tracking.AnnouncedPrice)}</dd>
                </dl>
              </div>

              {/* Дати доставки */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Дати доставки</h6>
                <dl className="row mb-0">
                  <dt className="col-sm-5">Планова</dt>
                  <dd className="col-sm-7">{formatDate(tracking.ScheduledDeliveryDate)}</dd>
                  <dt className="col-sm-5">Фактична</dt>
                  <dd className="col-sm-7">{formatDate(tracking.ActualDeliveryDate)}</dd>
                  <dt className="col-sm-5">Дата отримання</dt>
                  <dd className="col-sm-7">{formatDate(tracking.RecipientDateTime)}</dd>
                </dl>
              </div>

              {/* Додатково */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Додатково</h6>
                <dl className="row mb-0">
                  <dt className="col-sm-5">SecurePayment</dt>
                  <dd className="col-sm-7">{tracking.SecurePayment ? 'Так' : 'Ні'}</dd>
                  <dt className="col-sm-5">Можливість повернення</dt>
                  <dd className="col-sm-7">{tracking.PossibilityCreateReturn ? 'Так' : 'Ні'}</dd>
                  <dt className="col-sm-5">Можливість претензії</dt>
                  <dd className="col-sm-7">{tracking.PossibilityCreateClaim ? 'Так' : 'Ні'}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Закрити
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </div>
  );
}

export default TrackingDetails;