import { useState } from "react";
import { SectionTitle } from "../components/SectionTitle.jsx";
import { authApi } from "../services/api.js";

export function PasswordPage() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setMessage(""); setError("");
    if (form.new_password !== form.confirm) return setError("La confirmación no coincide");
    try {
      await authApi.changePassword({ current_password: form.current_password, new_password: form.new_password });
      setMessage("Contraseña actualizada correctamente.");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) { setError(err.message); }
  }
  return (
    <>
      <SectionTitle>Cambiar Contraseña</SectionTitle>
      <form className="legacy-form narrow-form" onSubmit={submit}>
        <label>Contraseña actual<input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} required /></label>
        <label>Nueva contraseña<input type="password" minLength="8" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required /></label>
        <label>Confirmar contraseña<input type="password" minLength="8" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required /></label>
        <button className="legacy-button" type="submit">Guardar</button>
      </form>
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
    </>
  );
}

