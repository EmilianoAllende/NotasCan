const DEFAULT_PROMPT = `Tu tarea es generar un correo electrónico de tipo "{{ $('Data Extractor').item.json.campaignType }}" para la organización "{{ $('Data Extractor').item.json.organizacion }}".
**Datos del destinatario:**
- Persona de contacto: {{ $('Data Extractor').item.json.persona_contacto }}
- Si el elemento anterior no existe o es "indefinido" (o similar), usa en su lugar "{{ $('Data Extractor').item.json.persona }}"
- Industria: {{ $('Data Extractor').item.json.industria }}
- Metadata: : {{ $('Data Extractor').item.json.industria }}
**Instrucciones:**
- El tono debe ser profesional pero cercano.
- El asunto (subject) debe ser corto y atractivo.
- El cuerpo (body) debe ser conciso.
- Ten en cuenta metadata como "actividad principal" y "intereses".
- Debes basarte en los siguientes ejemplos sobre cómo redactar (y cómo no redactar) el correo.
---
**EJEMPLOS DE CÓMO SÍ REDACTAR (BUENOS):**
**Ejemplo 1:** {
  "subject": "Potenciando a [Nombre de la Empresa]",
  "body": "Hola [Nombre de Contacto], nos comunicamos con usted porque veo que [Nombre de la Empresa] es un referente en el sector de [Industria]. Creo que nuestra solución podría ayudarles a optimizar sus procesos. ¿Te interesaría conversar 15 minutos la próxima semana?"
}
**Ejemplo 2:** {
  "subject": "Una idea para [Nombre de la Empresa]",
  "body": "Estimado/a [Nombre de Contacto], Nuestro equipo ha desarrollado una herramienta que está ayudando a empresas de [Industria] a mejorar su rendimiento. Me encantaría mostrarte cómo podría aplicarse en [Nombre de la Empresa]. Saludos."
}
**Ejemplo 3:** {
  "subject": "Colaboración con [Nombre de la Empresa]",
  "body": "Hola [Nombre de Contacto], espero que se encuentre muy bien. Vemos el gran trabajo que hacen en [Industria] y queríamos proponer una sinergia. ¿Tendrías un momento para explorar esta posibilidad?"
}
---
**EJEMPLOS DE CÓMO NO REDACTAR (MALOS):**
**Ejemplo 1 (Demasiado genérico):** {
  "subject": "Oportunidad de negocio",
  "body": "Estimado cliente, tenemos un producto que le puede interesar. Contáctenos."
}
**Ejemplo 2 (Muy informal y vago):** {
  "subject": "Hola!",
  "body": "Qué tal? Vi tu empresa y pensé que podríamos hacer algo juntos. Avísame."
}
**Ejemplo 3 (Exagerado y poco profesional):** {
  "subject": "¡¡LA MEJOR OFERTA DE SU VIDA!!",
  "body": "No creerá lo que tenemos para usted. ¡Es una revolución! ¡Llame ya!"
}`;
export default DEFAULT_PROMPT;
