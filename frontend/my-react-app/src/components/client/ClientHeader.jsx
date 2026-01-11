import { useNavigate } from "react-router-dom";

function ClientHeader({ clientName, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <button 
          className="btn btn-outline-secondary me-3"
          onClick={() => navigate('/clients')}
        >
          ← Назад до списку
        </button>
        <h2 className="d-inline">Картка клієнта: {clientName}</h2>
      </div>
      <div>
        {!isEditing ? (
          <>
            <button className="btn btn-primary me-2" onClick={onEdit}>
              ✏️ Редагувати
            </button>
            <button className="btn btn-danger" onClick={onDelete}>
              🗑️ Видалити
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-success me-2" onClick={onSave}>
              💾 Зберегти
            </button>
            <button className="btn btn-secondary" onClick={onCancel}>
              ❌ Відмінити
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ClientHeader;
