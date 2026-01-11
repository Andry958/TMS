import PropTypes from "prop-types";

const typeToClass = (type) => {
  if (type === "success") return "success";
  if (type === "error") return "danger";
  if (type === "warning") return "warning";
  return "secondary";
};

export default function ToastContainer({ toasts, onClose, position = "bottom-end" }) {
  // position can be "bottom-end", "bottom-start", etc. (bootstrap util classes)
  return (
    <div
      style={{
        position: "fixed",
        right: position.includes("end") ? "1rem" : undefined,
        left: position.includes("start") ? "1rem" : undefined,
        bottom: position.includes("bottom") ? "1rem" : undefined,
        top: position.includes("top") ? "1rem" : undefined,
        zIndex: 1080,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: "320px",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast align-items-center text-bg-${typeToClass(t.type)} show`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">{t.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => onClose(t.id)}
            />
          </div>
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
  position: PropTypes.string,
};
