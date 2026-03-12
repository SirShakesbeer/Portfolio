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
            <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
            <li className="nav-item"><a className="nav-link" href="/life">Life</a></li>
            <li className="nav-item"><a className="nav-link" href="/skills">Skills</a></li>
            <li className="nav-item"><a className="nav-link" href="/projects">Projects</a></li>
            <li className="nav-item"><a className="nav-link" href="/studio">Studio</a></li>
            <li className="nav-item"><a className="nav-link" href="/hobbies">Hobbies</a></li>
            <li className="nav-item"><a className="nav-link" href="/contact">Links</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
