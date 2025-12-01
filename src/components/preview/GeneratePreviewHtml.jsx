// GeneratePreviewHtml.jsx

// 1. Agregamos 'senderName' como tercer argumento con un valor por defecto
export const generatePreviewHtml = (editableContent, selectedOrg, senderName = "MMI Analytics") => {
  
  const bodyHtml = `<p>${editableContent.body.replace(/\n/g, '<br>')}</p>`;

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
        .content { 
            padding: 24px; 
            font-size: 15px; 
            line-height: 1.6; 
            color: #3c4043; 
        }
        .content p { margin:0 0 14px; }

        /* Footer Unificado */
        .footer { 
            font-size: 12px; 
            color: #666666; 
            text-align: center; 
            padding: 20px; 
            border-top: 1px solid #eeeeee; 
            background: #f8f9fa; 
            margin-top: 30px;
        }
        .footer-org {
            font-weight: bold;
            color: #5f6368;
            font-size: 13px;
            margin-bottom: 10px;
            display: block;
        }
        .footer-tech {
            font-size: 11px;
            color: #aaaaaa;
        }
        .footer-tech a { color: #aaaaaa; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="gmail-container">
        
        <div class="content">${bodyHtml}</div>
        
        <div class="footer">
            <span class="footer-org">
                ${senderName}
            </span>
            
            <div class="footer-tech">
               <a href="#">Darse de baja</a>
            </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

export default generatePreviewHtml;