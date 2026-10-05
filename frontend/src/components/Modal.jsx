import { useEffect } from "react";

export function Modal({ title, children, onClose }) {
  useEffect(() => {
    const close = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="legacy-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-titlebar">
          <strong id="modal-title">{title}</strong>
          <button type="button" onClick={onClose} aria-label="Cerrar">Cerrar</button>
        </div>
        {children}
      </section>
    </div>
  );
}

