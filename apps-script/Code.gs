const CONFIG = {
  SPREADSHEET_ID: "",
  SHEET_CHATS: "Chats",
  SHEET_LEADS: "Leads",
  RETENTION_DAYS: 30
};

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  const spreadsheet = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const chats = ensureSheet_(spreadsheet, CONFIG.SHEET_CHATS, [
    "session_id",
    "created_at",
    "last_updated",
    "name",
    "phone",
    "language",
    "agent",
    "consent",
    "role",
    "criteria_json",
    "summary",
    "transcript_json",
    "transcript_deleted_at",
    "source"
  ]);
  const leads = ensureSheet_(spreadsheet, CONFIG.SHEET_LEADS, [
    "session_id",
    "created_at",
    "last_updated",
    "name",
    "phone",
    "language",
    "agent",
    "consent",
    "role",
    "criteria_json",
    "summary",
    "source"
  ]);
  const now = new Date();
  const createdAt = payload.createdAt ? new Date(payload.createdAt) : now;
  const lead = payload.lead || {};
  const criteria = JSON.stringify(lead.criteria || {});
  const transcript = JSON.stringify(payload.transcript || []);
  const chatRow = [
    payload.sessionId,
    createdAt,
    payload.updatedAt ? new Date(payload.updatedAt) : now,
    lead.name || "",
    lead.phone || "",
    lead.language || "",
    lead.agent || "",
    lead.consent ? "yes" : "no",
    lead.role || "",
    criteria,
    lead.summary || "",
    transcript,
    "",
    payload.source || ""
  ];
  const leadRow = [
    payload.sessionId,
    createdAt,
    payload.updatedAt ? new Date(payload.updatedAt) : now,
    lead.name || "",
    lead.phone || "",
    lead.language || "",
    lead.agent || "",
    lead.consent ? "yes" : "no",
    lead.role || "",
    criteria,
    lead.summary || "",
    payload.source || ""
  ];
  upsertRow_(chats, payload.sessionId, chatRow);
  upsertRow_(leads, payload.sessionId, leadRow);
  return jsonResponse_({ ok: true });
}

function doGet() {
  return jsonResponse_({ ok: true, message: "Hola Mar webhook" });
}

function purgeOldTranscripts() {
  const spreadsheet = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_CHATS);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const lastCol = sheet.getLastColumn();
  const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const values = dataRange.getValues();
  const now = new Date();
  const maxAgeMs = CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let changed = false;
  values.forEach((row) => {
    const lastUpdated = row[2] ? new Date(row[2]) : null;
    const transcript = row[11];
    const deletedAt = row[12];
    if (
      lastUpdated &&
      now - lastUpdated > maxAgeMs &&
      transcript &&
      !deletedAt
    ) {
      row[11] = "";
      row[12] = now;
      changed = true;
    }
  });
  if (changed) {
    dataRange.setValues(values);
  }
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function upsertRow_(sheet, key, values) {
  if (!key) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    sheet.appendRow(values);
    return;
  }
  const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const index = keys.indexOf(key);
  if (index === -1) {
    sheet.appendRow(values);
    return;
  }
  sheet.getRange(index + 2, 1, 1, values.length).setValues([values]);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
