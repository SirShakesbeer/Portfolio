export default function Header() {
  return (
    <header className="row" id="header">
      <div className="col-12 header-bg" />
      <div className="col-12 text-center py-4" id="title">
        <h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/icons/letter-uppercase-circle-p-svgrepo-com.svg"
            alt="P"
            className="logo"
          />{' '}
          Paul Thomasius
        </h1>
      </div>
    </header>
  );
}
