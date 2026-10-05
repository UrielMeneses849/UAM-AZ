import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { assetPath } from "../utils/assets.js";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === "ADMIN" ? "/admin" : "/avisos"} replace />;

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const signedIn = await login(username, password);
      navigate(signedIn.role === "ADMIN" ? "/admin" : "/avisos", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearFields() {
    setUsername("");
    setPassword("");
    setError("");
  }

  return (
    <div className="site-shell login-shell">
      <Header reference />
      <div className="login-stage">
        <aside className="login-panel">
          <img className="campus-name" src={assetPath("assets/legacy/unidad-azc.png")} alt="Azcapotzalco" />
          <form onSubmit={submit}>
            <label htmlFor="username">Cuenta</label>
            <input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required autoFocus />
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="legacy-button login-button" type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
            <div className="login-utilities">
              <span className="login-utility-label">Limpiar campos</span>
              <button className="legacy-button login-secondary-button" type="button" onClick={clearFields}>limpiar</button>
              <button className="forgot-password-button" type="button" onClick={() => window.open("https://ayamictlan.uam.mx:8443/sae/azc/AELCWBSGT001", "_blank", "noopener,noreferrer")}>¿Olvidaste tu contraseña?</button>
            </div>
          </form>
          {error && <div className="login-error" role="alert">{error}</div>}
          <p className="login-help-text">Si olvidó su cuenta y/o contraseña o aún no cuenta con ellas, solicitelas en la Coordinación de Sistemas Escolares de su Unidad</p>
          <div className="login-ticks">tgp: 0 Ticks</div>
          <div className="login-code">AEWBU004/SAE4.5/JASH/15062009</div>
        </aside>
        <div className="login-left-footer">
          <span>Coordinación de Sistemas Escolares UAM</span>
          <span>Azcapotzalco</span>
          <span>Tecnologías de la Información - DDSAE</span>
        </div>
        <main className="login-welcome">
          <p className="module-name">Módulo de Información Escolar de Alumnos de Licenciatura</p>
          <p className="login-message">¡BIENVENIDO!<br /><br />Trimestre Lectivo 26O</p>
          <section className="login-notice">
            <h3>AVISO IMPORTANTE</h3>
            <h3 className="notice-copy">El Módulo de Información Escolar&nbsp;para los alumnos de la Universidad Autónoma Metropolitana al cual puedes acceder desde la página institucional es el único medio para efectuar trámites escolares vía Web de acuerdo a instructivos, a partir de ahora las consultas de información sobre tus datos académicos, escolares y otros las puedes realizar mediante dispositivos móviles.<br />Considerando que la seguridad de tus datos académicos y personales es muy importante no debes proporcionar tu usuario y contraseña a cualquier otro medio electrónico diferente al Módulo de Información Escolar y a la aplicacón movil oficial AppUAM (aplicación para dispositivos móviles) puesto que la Universidad Autónoma Metropolitana únicamente ha liberado estas dos aplicaciones para estos fines. Para conocer más sobre la aplicación móvil puedes acceder al siguiente link <a href="https://www.uam.mx/appuam/index.html" target="_blank" rel="noreferrer">AppUAM</a>.</h3>
            <h3 className="notice-signature">
              Atentamente<br /><br />
              Dirección de Sistemas Escolares<br /><br />
              Rectoría General<br /><br />
              <a href="https://tinyurl.com/mapaCambioUAM" target="_blank" rel="noreferrer">Cambio UAM</a>
            </h3>
          </section>
          <section className="scholarship-block">
            <h3>BECAS - UAM</h3>
            <div className="scholarship-content">
              <div className="scholarship-image-space"><img src={assetPath("assets/legacy/becas-uam.png")} width="170" height="190" alt="Becas UAM" /></div>
              <div className="scholarship-copy">
                <p>LA UNIVERSIDAD AUTÓNOMA METROPOLITANA, POR CONDUCTO DE SU RECTOR GENERAL</p>
                <p aria-hidden="true">&nbsp;</p>
                <p>CONVOCA A LOS ALUMNOS Y ALUMNAS DE LICENCIATURA DE ESTA UNIVERSIDAD PARA PARTICIPAR EN EL PROGRAMA DE BECAS</p>
                <p>Presiona la siguiente liga URL para mayor información: <a href="https://becas.uam.mx/index.html" target="_blank" rel="noreferrer">https://becas.uam.mx/index.html</a></p>
              </div>
            </div>
          </section>
          <section className="reference-compatibility" aria-label="Compatibilidad del sistema">
            <img className="siiuam-logo" src={assetPath("assets/legacy/siiuam.gif")} width="229" height="199" alt="SIIUAM v5 · Sistema Integral de Información UAM" />
            <p className="compatibility-title">Subsistema de Administración Escolar</p>
            <div className="compatibility-code">AEWBV002/SAE4.5/JASH/15062009</div>
            <table className="compatibility-table">
              <tbody>
                <tr><td colSpan="10" /></tr>
                <tr><td colSpan="10">La funcionalidad de esta página ha sido probada en su totalidad en los siguientes navegadores:</td></tr>
                <tr>
                  <td width="4%"><img src={assetPath("assets/legacy/browser-chrome.jpg")} width="20" height="20" alt="" /></td><td width="21%">Google Chrome Versión 28.0.1500.72</td>
                  <td width="4%"><img src={assetPath("assets/legacy/browser-ie.jpg")} width="20" height="20" alt="" /></td><td width="21%">Internet Explorer 8.0</td>
                  <td width="4%"><img src={assetPath("assets/legacy/browser-firefox.jpg")} width="20" height="20" alt="" /></td><td width="21%">Mozilla Firefox 22.0</td>
                  <td width="4%"><img src={assetPath("assets/legacy/browser-safari.jpg")} width="20" height="20" alt="" /></td><td width="21%">Safari 5.1.7 para Windows</td>
                </tr>
                <tr><td colSpan="10">Se recomienda un resolución en monitor de 1024 x 768 px o mayor.<br />Es indispensable que la configuración del navegador permita el uso de: cookies, javascript y elementos emergentes para este sitio.</td></tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
