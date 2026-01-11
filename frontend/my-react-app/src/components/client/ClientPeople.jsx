import { useState } from "react";

const positionTypes = [
  { value: 0, name: "Директор" },
  { value: 1, name: "Бухгалтер" },
  { value: 2, name: "Менеджер" },
  { value: 3, name: "Інше" }
];

function ClientPeople({ people, isEditing, onAdd, onDelete }) {
  const [newPerson, setNewPerson] = useState({
    fullName: "",
    position: 2,
    phoneNumber: "",
    email: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPerson(prev => ({ ...prev, [name]: name === 'position' ? parseInt(value) : value }));
  };

  const handleAdd = () => {
    if (!newPerson.fullName.trim()) {
      alert("Введіть ім'я працівника");
      return;
    }
    onAdd(newPerson);
    setNewPerson({ fullName: "", position: 2, phoneNumber: "", email: "" });
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="mb-3">Контактні особи</h5>
        <div className="mb-3">
          <h6>Список працівників</h6>
          {people.length > 0 ? (
            <div className="list-group mb-3">
              {people.map((person) => (
                <div key={person.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{positionTypes.find(p => p.value === person.position)?.name}:</strong> {person.fullName}
                    {person.phoneNumber && <div className="small text-muted">📞 {person.phoneNumber}</div>}
                    {person.email && <div className="small text-muted">✉️ {person.email}</div>}
                  </div>
                  {isEditing && (
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(person.id)}>🗑️</button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Немає працівників</p>
          )}

          {isEditing && (
            <>
              <h6 className="mt-3">Додати нового працівника</h6>
              <div className="border p-3 rounded">
                <div className="mb-2">
                  <label className="form-label">ПІБ</label>
                  <input className="form-control" name="fullName" value={newPerson.fullName} onChange={handleChange} placeholder="Повне ім'я" />
                </div>
                <div className="mb-2">
                  <label className="form-label">Посада</label>
                  <select className="form-control" name="position" value={newPerson.position} onChange={handleChange}>
                    {positionTypes.map(pos => (
                      <option key={pos.value} value={pos.value}>{pos.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Телефон</label>
                  <input className="form-control" name="phoneNumber" value={newPerson.phoneNumber} onChange={handleChange} placeholder="+380..." />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" name="email" value={newPerson.email} onChange={handleChange} placeholder="email@example.com" />
                </div>
                <button className="btn btn-success btn-sm w-100" onClick={handleAdd}>+ Додати працівника</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientPeople;
