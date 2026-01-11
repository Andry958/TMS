import PropTypes from 'prop-types';

const NP_BLUE = "#0066CC";

export default function TrackingPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="card border-0 shadow mt-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted">
            Сторінка <strong>{currentPage}</strong> з <strong>{totalPages}</strong>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  title="Перша сторінка"
                >
                  ««
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Попередня"
                >
                  ‹
                </button>
              </li>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Показуємо тільки 5 сторінок навколо поточної
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                ) {
                  return (
                    <li
                      key={pageNum}
                      className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => onPageChange(pageNum)}
                        style={
                          currentPage === pageNum
                            ? { backgroundColor: NP_BLUE, borderColor: NP_BLUE }
                            : {}
                        }
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                  return (
                    <li key={pageNum} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return null;
              })}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Наступна"
                >
                  ›
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Остання сторінка"
                >
                  »»
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

TrackingPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
