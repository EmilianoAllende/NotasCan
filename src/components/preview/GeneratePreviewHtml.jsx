
// --- ¡NUEVO! ---
// Esta función ahora acepta 'editableContent' y 'selectedOrg' como argumentos
// para que no dependa del estado de un componente específico.
export const generatePreviewHtml = (editableContent, selectedOrg) => {
  // --- ¡CORRECCIÓN DE ESPACIADO! ---
  // Reemplazamos los saltos de línea (\n) por <br>
  // y lo envolvemos en UN solo párrafo.
  const bodyHtml = `<p>${editableContent.body.replace(/\n/g, '<br>')}</p>`;

  // --- PLANTILLA MEJORADA (Simula Gmail) ---
  // Esta plantilla ahora solo contiene el CUERPO del email.
  // El "Asunto" se muestra en el modal de vista previa.
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${editableContent.subject}</title>
      <style>
        body { margin:0; background:#fff; font-family:'Roboto', Arial, sans-serif; color:#202124; }
        .gmail-container { max-width:640px; margin:0 auto; }
        .content { padding:24px 24px; font-size:15px; line-height:1.6; color: #3c4043; }
        .content p { margin:0 0 14px; } /* Espaciado entre párrafos (si el body ya los trae) */
        .cta { text-align:center; padding:20px; }
        .cta a { background:#1a73e8; color:#fff; padding:10px 22px; text-decoration:none; border-radius:4px; font-weight:500; }
        .footer { font-size:12px; color:#5f6368; text-align:center; padding:16px; border-top:1px solid #e0e0e0; background:#f8f9fa; }
      </style>
    </head>
    <body>
      <div class="gmail-container">
        <div class="content">${bodyHtml}</div>
        <div class="cta"><a href="https://mmi-e.com/contacto/" target="_blank">Explorar posibles sinergias</a></div>
        <div class="footer">
          © 2025 MMI Analytics — Todos los derechos reservados.<br>
          Si no deseas recibir más correos, <a href="#" style="color:#1a73e8;">darte de baja aquí</a>.
        </div>
      </div>
    </body>
    </html>
  `;
};
export default generatePreviewHtml