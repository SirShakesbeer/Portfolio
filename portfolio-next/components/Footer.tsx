export default function Footer() {
  return (
    <footer className="row" id="footer">
      <div className="col-12 text-center py-2 d-flex justify-content-center">
        <p>
          Kontakt:{' '}
          <a href="mailto:paul.thomasius@stud.htwk-leipzig.de">Paul Thomasius</a>
          {' | '}
          <a
            data-bs-toggle="offcanvas"
            href="#offcanvasQuelle"
            role="button"
            aria-controls="offcanvasQuelle"
          >
            Quellen
          </a>
        </p>
      </div>
    </footer>
  );
}
