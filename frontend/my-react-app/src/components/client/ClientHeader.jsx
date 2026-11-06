import { useNavigate } from "react-router-dom";

function ClientHeader({ clientName, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="sticky-action-bar client-card-actions d-flex justify-content-between align-items-center mb-4">
      <div>
        <button 
          className="btn btn-outline-secondary client-card-actions__back me-3"
          onClick={() => navigate('/clients')}
        >
          ← Назад до списку
        </button>
        <h2 className="d-inline">Картка клієнта: {clientName}</h2>
      </div>
      <div className="client-card-actions__controls">
        {!isEditing ? (
          <>
            <button className="btn btn-primary client-card-actions__edit me-2" onClick={onEdit}>
              ✏️ Редагувати
            </button>
            <button className="btn btn-danger client-card-actions__delete" onClick={onDelete}>
              🗑️ Видалити
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-success client-card-actions__save me-2" onClick={onSave}>
              💾 Зберегти
            </button>
            <button className="btn btn-secondary client-card-actions__cancel" onClick={onCancel}>
              ❌ Відмінити
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ClientHeader;
