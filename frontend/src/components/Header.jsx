import { assetPath } from "../utils/assets.js";

export function Header({ admin = false, reference = false }) {
  if (reference) {
    return (
      <header className="legacy-header reference-header">
        <img className="reference-header-logo" src={assetPath("assets/legacy/header-uam.png")} alt="UAM · Casa abierta al tiempo" />
        <div className="reference-header-bar">
          <div className="reference-header-title">
            <strong>Módulo de Información Escolar de Alumnos de Licenciatura</strong>
            <span>Subsistema de Administración Escolar</span>
          </div>
        </div>
        <img className="reference-header-mark" src={assetPath("assets/legacy/header-mark.png")} alt="" aria-hidden="true" />
        <div className="reference-header-code">AEWBU001/SAE4.5/JASH/15062009</div>
      </header>
    );
  }

  return (
    <header className="legacy-header">
      <div className="legacy-header-bar">
        <div className="header-identity-space" aria-hidden="true" />
        <div className="header-title">
          <strong>Sistema de Información Escolar</strong>
          <span>{admin ? "Administración del Portal Académico" : "Portal Académico"}</span>
        </div>
      </div>
    </header>
  );
}
