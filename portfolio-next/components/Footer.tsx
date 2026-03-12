export default function Footer() {
  return (
    <footer className="row" id="footer">
      <div className="col-12 text-center py-2 d-flex justify-content-center">
        <p>
          <a href="/contact">Kontakt & Links</a>
          {' | '}
          <a href="/impressum">Impressum</a>
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
