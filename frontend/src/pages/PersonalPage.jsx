import { useEffect, useState } from "react";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { studentApi } from "../services/api.js";
import { assetPath } from "../utils/assets.js";

const applicantName = "Alexis Arael Vazquez Robles";
const applicantFolio = "2262139202";

const personalRows = [
  ["TRIMESTRE INGRESO:", "otoño"],
  ["MATRÍCULA:", "2262139202"],
  ["UNIDAD:", "Azcapotzalco"],
  ["DIVISIÓN:", "Ciencias básicas e ingeniería"],
  ["CARRERA:", "Ingeniería eléctrica"],
  ["TURNO:", "Matutino"],
  ["DEDICACIÓN:", "Tiempo completo"],
];

export function PersonalPage() {
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    studentApi.profilePhoto()
      .then(setPhotoPreview)
      .catch((error) => setPhotoError(error.message))
      .finally(() => setPhotoLoading(false));
  }, []);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);

    try {
      setPhotoPreview(await studentApi.uploadProfilePhoto(file));
    } catch (error) {
      setPhotoError(error.message);
    } finally {
      setPhotoUploading(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <SectionTitle>Información Personal</SectionTitle>
      <section className="admission-proof" aria-label="Comprobante de información personal">
        <p className="admission-proof-caption">Comprobante de aspirante seleccionado</p>

        <header className="admission-proof-header">
          <div className="admission-proof-brand">
            <img src={assetPath("assets/legacy/uam-logo-clean-crop.jpg")} alt="" aria-hidden="true" />
            <strong>UNIVERSIDAD AUTÓNOMA METROPOLITANA</strong>
          </div>
          <h2>
            SEGUNDO PROCESO DE SELECCIÓN A LICENCIATURA PARA
            <br />
            INGRESAR EN SEPTIEMBRE DE 2012
          </h2>
        </header>

        <div className="admission-proof-applicant-frame">
          <div className="admission-proof-applicant-panel">
            <div className="admission-proof-card-title">Comprobante de Aspirante Seleccionado</div>
            <div className="admission-proof-identity-row">
              <strong>NOMBRE:</strong>
              <span>{applicantName}</span>
            </div>
            <div className="admission-proof-identity-row">
              <strong>FOLIO:</strong>
              <span>{applicantFolio}</span>
            </div>
          </div>
          <label className="admission-proof-photo-slot" aria-label="Cargar foto del aspirante">
            {photoPreview ? (
              <img src={photoPreview} alt="Foto del aspirante guardada en su perfil" />
            ) : (
              <span>{photoLoading ? "Cargando foto…" : "Cargar foto"}</span>
            )}
            {photoUploading && <span className="admission-proof-photo-status">Guardando…</span>}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={photoLoading || photoUploading}
              onChange={handlePhotoChange}
            />
          </label>
        </div>
        {photoError && <div className="message error admission-proof-photo-error">{photoError}</div>}

        <p className="admission-proof-alert">
          Conforme a la información contenida en la base de datos, resultaste seleccionado
          <br />
          según se indica enseguida.
        </p>

        <p className="admission-proof-copy">
          Recuerda que si no realizas la inscripción en el día, la hora y el lugar señalado en la publicación de resultados,
          <br />
          renuncias a tu derecho a ingresar a la Universidad Autónoma Metropolitana.
        </p>

        <p className="admission-proof-copy">
          Para que adquieras la calidad de alumno sigue las indicaciones del instructivo de inscripción.
        </p>

        <button className="admission-proof-button" type="button">Instructivo de Inscripción</button>

        <h3>Obten la línea de captura para el pago en banco, de tu Inscripción.</h3>

        <button className="admission-proof-button admission-proof-pay" type="button">Línea de captura</button>

        <p className="admission-proof-copy admission-proof-questionnaire-copy">
          Para tu trámite de inscripción debes llenar el cuestionario de prácticas escolares e imprimir tu comprobante de
          <br />
          llenado, el cual deberás presentar en la Coordinación de Sistemas Escolares.
        </p>

        <button className="admission-proof-button admission-proof-questionnaire" type="button">
          Cuestionario de prácticas escolares
        </button>

        <div className="admission-proof-divider" />

        <div className="personal-admission-sheet">
          {personalRows.map(([label, value]) => (
            <div className="personal-admission-row" key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
          ))}
        </div>

        <button className="admission-proof-print" type="button">Imprimir página</button>
      </section>
    </>
  );
}
