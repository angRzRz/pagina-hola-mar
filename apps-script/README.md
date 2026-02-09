# Backend gratuito (Google Apps Script + Google Sheets)

## 1) Crea la hoja de cálculo
- Crea una Google Sheet nueva y nómbrala, por ejemplo, `HolaMar-Leads`.
- Abre **Extensiones → Apps Script**.

## 2) Pega el código
- Sustituye el contenido del editor por `apps-script/Code.gs`.
- Si el script no está vinculado a la hoja, rellena `SPREADSHEET_ID`.

## 3) Despliega el web app
- **Implementar → Nueva implementación → Tipo: Aplicación web**.
- Ejecutar como: **tú**.
- Quién tiene acceso: **Cualquiera**.
- Guarda la URL del despliegue.

## 4) Conecta el frontend
- En `docs/app.js`, rellena `CONFIG.scriptUrl` con la URL del despliegue.

## 5) Activa la retención (30 días)
- En Apps Script, crea un disparador temporal diario para `purgeOldTranscripts`.

## 6) Permisos
- La primera vez que se ejecute, Google pedirá permisos. Acéptalos.

## Notas
- La hoja tendrá dos pestañas: `Chats` (transcripts) y `Leads` (resumen).
- El bot guarda el chat completo durante 30 días y luego lo borra, manteniendo el resumen.
