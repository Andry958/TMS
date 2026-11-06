import PropTypes from "prop-types";
import "../../styles/toasts.css";

export default function ToastContainer({ toasts, onClose }) {
  return (
    <div className="app-toast-stack" aria-label="Сповіщення">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`app-toast app-toast--${toast.type || "info"}`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <div className="app-toast__message">{toast.message}</div>
          <button
            type="button"
            className="app-toast__close"
            aria-label="Закрити сповіщення"
            onClick={() => onClose(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.string,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};
