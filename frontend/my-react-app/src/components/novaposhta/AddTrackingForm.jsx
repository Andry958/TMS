import { useState } from 'react';
import PropTypes from 'prop-types';

const NP_BLUE = "#0066CC";
const NP_BLUE_DARK = "#0055AA";

export default function AddTrackingForm({ onAdd, loading }) {
  const [newTTN, setNewTTN] = useState("");

  const handleAdd = () => {
    if (newTTN.trim()) {
      onAdd(newTTN.trim());
      setNewTTN("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="card border-0 shadow mb-4">
      <div className="card-body">
        <h5 style={{ color: NP_BLUE_DARK, marginBottom: "1rem" }}>
          ➕ Додати нове відправлення
        </h5>
        <div className="row g-3">
          <div className="col-md-9">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Номер ТТН (наприклад: 20450012345678)"
              value={newTTN}
              onChange={(e) => setNewTTN(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>
          <div className="col-md-3">
            <button
              onClick={handleAdd}
              className="btn btn-primary w-100 btn-lg"
              style={{ backgroundColor: NP_BLUE, borderColor: NP_BLUE }}
              disabled={loading || !newTTN.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Додавання...
                </>
              ) : (
                "➕ Додати"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

AddTrackingForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
