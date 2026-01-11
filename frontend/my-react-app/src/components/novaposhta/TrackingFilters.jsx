import PropTypes from 'prop-types';

const NP_BLUE = "#0066CC";

export default function TrackingFilters({
  filterStatus,
  setFilterStatus,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  searchTTN,
  setSearchTTN,
  filterOverdue,
  setFilterOverdue,
  filterPaid,
  setFilterPaid,
}) {
  return (
    <div className="card border-0 shadow mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label small text-muted">Статус відправлення</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Усі статуси</option>
              <option value="Доставлено">Доставлено</option>
              <option value="В дорозі">В дорозі</option>
              <option value="Відправлення отримано">Відправлення отримано</option>
              <option value="Прибув у відділення">Прибув у відділення</option>
              <option value="Змінено адресу">Змінено адресу</option>
              <option value="Скасовано">Скасовано</option>
              <option value="Відмова">Відмова отримувача</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted">Сортувати за</label>
            <select
              className="form-select"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="id">ID</option>
              <option value="paymentDueDate">Крайній термін</option>
              <option value="overdueDays">Протермінування</option>
              <option value="payer">Платник</option>
              <option value="amount">Сума</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small text-muted">Порядок</label>
            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Зменшення</option>
              <option value="asc">Зростання</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted">Пошук по ТТН</label>
            <input
              type="text"
              className="form-control"
              placeholder="Введіть номер ТТН..."
              value={searchTTN}
              onChange={(e) => setSearchTTN(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small text-muted">Протермінування</label>
            <select
              className="form-select"
              value={filterOverdue}
              onChange={(e) => setFilterOverdue(e.target.value)}
            >
              <option value="">Всі</option>
              <option value="overdue">Протерміновані</option>
              <option value="notOverdue">Не протерміновані</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small text-muted">Оплата</label>
            <select
              className="form-select"
              value={filterPaid}
              onChange={(e) => setFilterPaid(e.target.value)}
            >
              <option value="">Всі</option>
              <option value="paid">Оплачені</option>
              <option value="unpaid">Не оплачені</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

TrackingFilters.propTypes = {
  filterStatus: PropTypes.string.isRequired,
  setFilterStatus: PropTypes.func.isRequired,
  sortField: PropTypes.string.isRequired,
  setSortField: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  setSortOrder: PropTypes.func.isRequired,
  searchTTN: PropTypes.string.isRequired,
  setSearchTTN: PropTypes.func.isRequired,
  filterOverdue: PropTypes.string.isRequired,
  setFilterOverdue: PropTypes.func.isRequired,
  filterPaid: PropTypes.string.isRequired,
  setFilterPaid: PropTypes.func.isRequired,
};
