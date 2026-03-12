export default function QuellenOffcanvas() {
  return (
    <div
      className="offcanvas offcanvas-start"
      tabIndex={-1}
      id="offcanvasQuelle"
      aria-labelledby="offcanvasQuelleLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasQuelleLabel">Quellen</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
      </div>
      <div className="offcanvas-body">
        <ul>
          <li><a href="https://codepen.io/motionharvest/pen/WNQYJyM">Quelle für Scroll-Tunnel</a></li>
          <li><a href="https://s3-us-west-2.amazonaws.com/s.cdpn.io/68819/3d_space_5.jpg">Quelle für Tunnel-Bild</a></li>
          <li><a href="https://s3-us-west-2.amazonaws.com/s.cdpn.io/68819/waveform-bump3.jpg">Quelle für Tunnel-Bild 2</a></li>
          <li><a href="https://www.goodfon.com/miscellanea/wallpaper-download-1920x1080-dice-dice-d20-d20-d-d-dungeons-dragons-roll-dnd-role-playing.html">Bild: DnD</a></li>
          <li><a href="https://www.saechsischer-chorverband.de/scv/projekte/gewandhaussingen-sachsischer-chore.html">Bild: Chor</a></li>
          <li><a href="https://pxhere.com/de/photo/101197">Bild: Gitarre</a></li>
          <li><a href="https://www.flickr.com/photos/w-tommerdich/52739082935">Bild: Maus</a></li>
        </ul>
      </div>
    </div>
  );
}
