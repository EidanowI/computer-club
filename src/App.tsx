import NavBar from "./components/NavBar";
import "./test.css"
import MainSection from "./components/MainSection";

function App() {
  const navSections = [
    { id: 'home', label: 'О клубе', iconPath: "" },
    { id: 'info', label: 'О клубе', iconPath: "././public/img/nav-icons/info-icon.png" },
    { id: 'price', label: 'Стоимость', iconPath: "././public/img/nav-icons/price-icon.png" },
    { id: 'arenas', label: 'Арены', iconPath: "././public/img/nav-icons/arenas-icon.png" },
    { id: 'devices', label: 'Оборудование', iconPath: "././public/img/nav-icons/device-icon.png" },
    { id: 'compets', label: 'Турниры', iconPath: "././public/img/nav-icons/compets-icon.png" },
    { id: 'contscts', label: 'Контакты', iconPath: "././public/img/nav-icons/contacts.png" },
  ];

  return (
    <div className="app">
      <NavBar sections={navSections} />
      
      <main className="main-content">
        <section id="home" className="content-section">
          <MainSection/>
        </section>

        <section id="info" className="content-section">
          <h1>О нас</h1>
          <p>Информация о компании...</p>
        </section>

        <section id="price" className="content-section">
          <h1>Услуги</h1>
          <p>Наши услуги...</p>
        </section>

        <section id="arenas" className="content-section">
          <h1>Портфолио</h1>
          <p>Наши работы...</p>
        </section>

        <section id="devices" className="content-section">
          <h1>Контакты</h1>
          <p>Контактная информация...</p>
        </section>

        <section id="compets" className="content-section">
          <h1>Контакты</h1>
          <p>Контактная информация...</p>
        </section>

        <section id="contscts" className="content-section">
          <h1>Контакты</h1>
          <p>Контактная информация...</p>
        </section>
      </main>
    </div>
  );
}

export default App
