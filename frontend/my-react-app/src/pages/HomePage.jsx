import "../styles/home.css";

function HomeIcon({ name }) {
  const icons = {
    orders: <><path d="M7 3h10v18H7z"/><path d="M10 7h4M10 11h4M10 15h4"/></>,
    transport: <><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></>,
    tracking: <><circle cx="12" cy="12" r="9"/><path d="m8 13 3 3 5-7"/></>,
    clients: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1zM16 5a3 3 0 0 1 0 6M18 14a4 4 0 0 1 3 4v2"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
    route: <><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h7a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h7"/></>,
  };

  return <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;
}

const quickSections = [
  { id: "orders", title: "Замовлення", text: "Створюйте рейси та відстежуйте виконання замовлень", accent: "violet" },
  { id: "transport", title: "Транспорт", text: "Керуйте автопарком, водіями та технічним станом", accent: "blue" },
  { id: "tracking", title: "Трекінг", text: "Контролюйте доставку вантажів і статуси перевезень", accent: "cyan" },
  { id: "clients", title: "Клієнти", text: "Працюйте з замовниками та їхніми контактами", accent: "orange" },
];

function HomePage({ setActiveSection }) {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-hero__eyebrow"><span /> Система управління логістикою</div>
          <h1>Вітаємо в <strong>LogiSystem</strong></h1>
          <p>Керуйте вантажними перевезеннями, автопарком і замовленнями з одного зручного робочого простору.</p>
          <button className="home-hero__button" type="button" onClick={() => setActiveSection("orders")}> 
            Створити замовлення <HomeIcon name="arrow" />
          </button>
        </div>
        <div className="home-hero__visual" aria-hidden="true">
          <img src="/tractor-combination.jpg" alt="" />
          <div className="home-hero__badge">
            <span className="home-hero__badge-dot" />
            Європейські маршрути
          </div>
        </div>
      </section>

      <section className="home-quick" aria-labelledby="quick-title">
        <div className="home-section-heading">
          <div>
            <span className="home-section-heading__kicker">Робочі простори</span>
            <h2 id="quick-title">Оберіть розділ для початку роботи</h2>
          </div>
        </div>
        <div className="home-quick__grid">
          {quickSections.map((item) => (
            <button key={item.id} className="home-quick-card" type="button" onClick={() => setActiveSection(item.id)}>
              <span className={`home-quick-card__icon home-quick-card__icon--${item.accent}`}><HomeIcon name={item.id} /></span>
              <span className="home-quick-card__body">
                <strong>{item.title}</strong>
                <small>{item.text}</small>
              </span>
              <span className="home-quick-card__arrow"><HomeIcon name="arrow" /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="emal-section" aria-labelledby="company-title">
        <div className="emal-section__intro">
          <span className="home-section-heading__kicker">Про EMAL Ltd.</span>
          <h2 id="company-title">Надійна логістика в Європі</h2>
          <p>Понад 13 років досвіду у міжнародних вантажних перевезеннях. Ми доставляємо товари швидко, безпечно та відповідально.</p>
          <button className="emal-section__link" type="button" onClick={() => setActiveSection("fleetMap")}>Переглянути карту авто <HomeIcon name="arrow" /></button>
        </div>
        <div className="emal-facts">
          <article><span><HomeIcon name="shield" /></span><div><strong>24/7</strong><small>оперативна підтримка</small></div></article>
          <article><span><HomeIcon name="route" /></span><div><strong>ЄС</strong><small>регулярні рейси до Європи</small></div></article>
          <article><span><HomeIcon name="clock" /></span><div><strong>13+</strong><small>років професійного досвіду</small></div></article>
        </div>
      </section>

      <section className="home-services" aria-label="Послуги перевезень">
        <article>
          <img src="/trailer-combination.jpg" alt="Сучасний вантажний автомобіль EMAL" />
          <div className="home-services__content">
            <span>Транспортні рішення</span>
            <h3>Рефрижератори та тент-штори</h3>
            <p>Температурний контроль, універсальні вантажі та повне технічне супроводження.</p>
            <button type="button" onClick={() => setActiveSection("transport")}>Обрати транспорт <HomeIcon name="arrow" /></button>
          </div>
        </article>
        <div className="home-services__benefits">
          <div><strong>до 24 т</strong><span>вантажопідйомність</span></div>
          <div><strong>до 92 м³</strong><span>об’єм кузова</span></div>
          <div><strong>Євро-стандарт</strong><span>екологічна техніка</span></div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
