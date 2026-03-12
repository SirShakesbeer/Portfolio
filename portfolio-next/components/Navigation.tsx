export default function Navigation() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item"><a className="nav-link" href="#header">Home</a></li>
            <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
            <li className="nav-item"><a className="nav-link" href="/life">Leben</a></li>
            <li className="nav-item"><a className="nav-link" href="/skills">Fähigkeiten</a></li>
            <li className="nav-item"><a className="nav-link" href="/projects">Projekte</a></li>
            <li className="nav-item"><a className="nav-link" href="/studio">Studio</a></li>
            <li className="nav-item"><a className="nav-link" href="#hobbys">Hobbys</a></li>
            <li className="nav-item"><a className="nav-link" href="#referenzen">Referenzen</a></li>
            <li className="nav-item"><a className="nav-link" href="#footer">Kontakt</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
