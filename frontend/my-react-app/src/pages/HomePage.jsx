function HomePage({ setActiveSection }) {
  return (
    <div className="container mt-5">
      <h1>Вітаємо в LogiSystem</h1>
      <p>Оберіть розділ для початку роботи</p>

      <button
        className="btn btn-primary"
        onClick={() => setActiveSection("transport")}
      >
        Перейти до транспорту
      </button>
    </div>
  );
}

export default HomePage;
