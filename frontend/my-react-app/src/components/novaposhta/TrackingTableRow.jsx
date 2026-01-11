import PropTypes from 'prop-types';

const formatDate = (value) => {
  if (!value) return "—";

  let date;
  if (value instanceof Date) {
    date = value;
  } else {
    const parts = value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (parts) {
      const [, day, month, year] = parts;
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(value);
      if (isNaN(date)) return "—";
    }
  }

  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const parseDeliveryDate = (str) => {
  if (!str) return null;
  const parts = str.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!parts) return null;
  const [, day, month, year] = parts;
  return new Date(year, month - 1, day);
};

export default function TrackingTableRow({
  tracking,
  isEditing,
  onToggleEdit,
  onUpdate,
  onSave,
  onDelete,
}) {
  const getStatusBadgeClass = (status) => {
    if (status?.includes("Доставлено")) return "bg-success";
    if (status?.includes("В дорозі")) return "bg-warning text-dark";
    if (status?.includes("Відправлення отримано")) return "bg-info";
    if (status?.includes("Скасовано") || status?.includes("Відмова")) return "bg-danger";
    return "bg-secondary";
  };

  return (
    <tr>
      <td className="ps-3">
        <span className="badge bg-secondary">{tracking.id}</span>
      </td>
      <td className="font-monospace fw-bold">{tracking.number || tracking.TTN}</td>
      <td>
        <span className={`badge ${getStatusBadgeClass(tracking.status)}`}>
          {tracking.status || "—"}
        </span>
      </td>
      <td>{formatDate(parseDeliveryDate(tracking.deliveryDate))}</td>
      <td>{tracking.recipientCompany || "—"}</td>
      <td>{tracking.recipientFullName || "—"}</td>
      <td>
        {isEditing ? (
          <select
            className="form-select form-select-sm"
            value={tracking.daysType || "calendar"}
            onChange={(e) => onUpdate(tracking.id, "daysType", e.target.value)}
          >
            <option value="calendar">Календарні</option>
            <option value="business">Робочі</option>
          </select>
        ) : (
          <span>{tracking.daysType === "business" ? "Робочі" : "Календарні"}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: "80px" }}
            value={tracking.daysCount ?? 0}
            onChange={(e) => onUpdate(tracking.id, "daysCount", e.target.value)}
            min="0"
          />
        ) : (
          <span>{tracking.daysCount ?? "—"}</span>
        )}
      </td>
      <td>
        {tracking.paymentDueDate ? formatDate(new Date(tracking.paymentDueDate)) : "—"}
      </td>
      <td>
        {tracking.overdueDays > 0 ? (
          <span className="badge bg-danger">{tracking.overdueDays} дн</span>
        ) : (
          "—"
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: "100px" }}
            value={tracking.amount ?? ""}
            onChange={(e) => onUpdate(tracking.id, "amount", e.target.value)}
            step="0.01"
          />
        ) : (
          <span>{tracking.amount ? `${tracking.amount} ₴` : "—"}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "120px" }}
            value={tracking.invoiceNumber ?? ""}
            onChange={(e) => onUpdate(tracking.id, "invoiceNumber", e.target.value)}
          />
        ) : (
          <span>{tracking.invoiceNumber || "—"}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "140px" }}
            value={tracking.payer ?? ""}
            onChange={(e) => onUpdate(tracking.id, "payer", e.target.value)}
          />
        ) : (
          <span>{tracking.payer || "—"}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "100px" }}
            value={tracking.vehicle ?? ""}
            onChange={(e) => onUpdate(tracking.id, "vehicle", e.target.value)}
          />
        ) : (
          <span>{tracking.vehicle || "—"}</span>
        )}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "120px" }}
            value={tracking.route ?? ""}
            onChange={(e) => onUpdate(tracking.id, "route", e.target.value)}
          />
        ) : (
          <span>{tracking.route || "—"}</span>
        )}
      </td>
      <td className="text-center">
        <input
          type="checkbox"
          className="form-check-input"
          checked={!!tracking.paymentMark}
          onChange={(e) => onUpdate(tracking.id, "paymentMark", e.target.checked)}
          disabled={!isEditing}
        />
      </td>
      <td>
        <div className="d-flex gap-1">
          {isEditing ? (
            <>
              <button
                className="btn btn-sm btn-success"
                onClick={() => onSave(tracking)}
                title="Зберегти"
              >
                💾
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => onToggleEdit(tracking.id)}
                title="Скасувати"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onToggleEdit(tracking.id)}
              title="Редагувати"
            >
              ✏️
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(tracking)}
            title="Видалити"
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}

TrackingTableRow.propTypes = {
  tracking: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
