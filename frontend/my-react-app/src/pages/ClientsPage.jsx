import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useCompany } from "../context/CompanyContext";

function ClientsPage() {
   const { companyId } = useCompany();
  
  const { apiData } = useApi();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (companyId) {
      fetchClients();
    }
  }, [companyId]);

  const fetchClients = async () => {
    if (!companyId) {
      console.log("❌ companyId не встановлено, клієнти не завантажуються");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`📡 Завантаження клієнтів для компанії ${companyId}`);
      const response = await fetch(`${apiData}/client?companyId=${companyId}`);
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      
      console.log(`✅ Завантажено ${data.length} клієнтів`);
      // contactPersons вже включені в дані клієнта з backend
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      alert("Помилка завантаження клієнтів");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredClients = () => {
    let filteredClients = [...clients];

    // Фільтрація за пошуком
    if (searchTerm) {
      filteredClients = filteredClients.filter(client => 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.codeCompany?.includes(searchTerm) ||
        client.companyType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Сортування
    if (sortConfig.key) {
      filteredClients.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredClients;
  };

  const sortedAndFilteredClients = getSortedAndFilteredClients();
  const totalPages = Math.ceil(sortedAndFilteredClients.length / itemsPerPage);
  const paginatedClients = sortedAndFilteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  const PositionReturn = (position) => {
    if (position === 0) {
      return 'Директор';
    }
    if (position === 1) {
      return 'Бухагалтер';
    }
    if (position === 2) {
      return 'Менеджер';
    }
    else {
      return 'Інше';
    }
  }
  const formatContactPersons = (persons) => {
    if (!persons || persons.length === 0) return <span className="text-muted">Немає контактів</span>;
    
    return (
      <div>
        {persons.map((person, idx) => (
          <div key={idx} className="small">
            <strong>{person.fullName}</strong>
            {(person.position || person.position === 0) && <span className="text-muted"> ({PositionReturn(person.position)})</span>}
            {person.phoneNumber && <span className="text-muted">, ({person.phoneNumber})</span>}
            {person.email && <span className="text-muted">, ({person.email})</span>}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Завантаження...</span>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">⚠️ Компанію не вибрано</h4>
          <p>Для перегляду клієнтів спочатку оберіть або створіть головну компанію на сторінці "Моя компанія".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Клієнти компанії</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/clients/create')}
        >
          + Створити компанію-клієнта
        </button>
      </div>

      {/* Пошук */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Пошук за назвою, ЄДРПОУ або типом компанії..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-6 text-end">
              <span className="text-muted">
                Знайдено: {sortedAndFilteredClients.length} з {clients.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Таблиця клієнтів */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('companyType')}
                  >
                    Тип компанії {getSortIcon('companyType')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('codeCompany')}
                  >
                    ЄДРПОУ {getSortIcon('codeCompany')}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                  >
                    Назва компанії {getSortIcon('name')}
                  </th>
                  <th>Контактні особи</th>
                  <th>Примітка</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      {searchTerm ? 'Нічого не знайдено' : 'Немає клієнтів'}
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <span className="badge bg-info">{client.companyType || 'Клієнт'}</span>
                      </td>
                      <td>
                        <code>{client.codeCompany || '-'}</code>
                      </td>
                      <td>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/clients/${client.id}`);
                          }}
                          className="text-decoration-none fw-bold"
                          style={{ 
                            color: '#0066cc',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          {client.name}
                        </a>
                      </td>
                      <td>{formatContactPersons(client.contactPersons)}</td>
                      <td>
                        <small className="text-muted">
                          {client.additionalInfo?.substring(0, 50)}
                          {client.additionalInfo?.length > 50 && '...'}
                        </small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Пагінація */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Попередня
                    </button>
                  </li>
                  
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Показуємо тільки кілька сторінок навколо поточної
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                    ) {
                      return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                      return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                    }
                    return null;
                  })}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Наступна
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientsPage;
