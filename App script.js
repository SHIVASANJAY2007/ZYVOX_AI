const SHEET_NAME = "Zyvox AI";

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({
        success: false,
        message: `Sheet "${SHEET_NAME}" not found`
      });
    }

    let data = {};

    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    const action = data.action;

    if (action === "signup") {
      return signup(sheet, data);
    }

    if (action === "login") {
      return login(sheet, data);
    }

    if (action === "checkEmail") {
      return checkEmail(sheet, data);
    }

    return jsonResponse({
      success: false,
      message: "Invalid action"
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

// OPTIMIZED SIGNUP: Only reads required columns to increase processing speed
function signup(sheet, data) {
  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");

  if (!name || !phone || !email || !password) {
    return jsonResponse({
      success: false,
      message: "Name, phone, email and password are required"
    });
  }

  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const emailColumn = headers.indexOf("Email");
  const personNoColumn = headers.indexOf("Person No");

  if (emailColumn === -1 || personNoColumn === -1) {
    return jsonResponse({
      success: false,
      message: "Required columns are missing"
    });
  }

  // Speed Optimization: Read only the Email column instead of the entire sheet data
  if (lastRow > 1) {
    const emailValues = sheet.getRange(2, emailColumn + 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < emailValues.length; i++) {
      if (String(emailValues[i][0] || "").trim().toLowerCase() === email) {
        return jsonResponse({
          success: false,
          message: "An account with this email already exists"
        });
      }
    }
  }

  // Speed Optimization: Read only the Person No column to generate next ID
  let personNo;
  if (lastRow > 1) {
    const personNoValues = sheet.getRange(2, personNoColumn + 1, lastRow - 1, 1).getValues();
    let maxNumber = 0;
    for (let i = 0; i < personNoValues.length; i++) {
      const value = String(personNoValues[i][0] || "");
      const match = value.match(/\d+/);
      if (match) {
        const number = parseInt(match[0], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }
    personNo = "ZYV" + String(maxNumber + 1).padStart(4, "0");
  } else {
    personNo = "ZYV0001";
  }

  // Timezone Correction: Format date according to the spreadsheet's native timezone configuration
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const formattedDate = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");

  const row = createRow(headers, {
    "Person No": personNo,
    "Name": name,
    "Phone": phone,
    "Email": email,
    "Password": password,
    "created_at": formattedDate,
    "last_login": "",
    "Place (Source)": "",
    "Place (Destination)": "",
    "Date of Going": "",
    "Date of Returning": "",
    "Activities": "",
    "Mode of Transport": "",
    "Hotel Staying": "",
    "Car Rent": ""
  });

  sheet.appendRow(row);

  return jsonResponse({
    success: true,
    message: "Account created successfully",
    user: {
      personNo: personNo,
      name: name,
      phone: phone,
      email: email
    }
  });
}

// OPTIMIZED LOGIN: Performs search only on the Email column first, and then loads only the matched row
function login(sheet, data) {
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");

  if (!email || !password) {
    return jsonResponse({
      success: false,
      message: "Email and password are required"
    });
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse({
      success: false,
      message: "Invalid email or password"
    });
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const personNoColumn = headers.indexOf("Person No");
  const nameColumn = headers.indexOf("Name");
  const phoneColumn = headers.indexOf("Phone");
  const emailColumn = headers.indexOf("Email");
  const passwordColumn = headers.indexOf("Password");
  const lastLoginColumn = headers.indexOf("last_login");

  if (
    emailColumn === -1 ||
    passwordColumn === -1 ||
    personNoColumn === -1
  ) {
    return jsonResponse({
      success: false,
      message: "Required login columns are missing"
    });
  }

  // Speed Optimization: Read only the Email column to quickly find matching row index
  const emailValues = sheet.getRange(2, emailColumn + 1, lastRow - 1, 1).getValues();
  let matchRowIdx = -1;
  for (let i = 0; i < emailValues.length; i++) {
    if (String(emailValues[i][0] || "").trim().toLowerCase() === email) {
      matchRowIdx = i + 2; // +2 for 1-based index and skipping header row
      break;
    }
  }

  if (matchRowIdx === -1) {
    return jsonResponse({
      success: false,
      message: "Invalid email or password"
    });
  }

  // Speed Optimization: Read ONLY the matched single row from the sheet
  const matchedRow = sheet.getRange(matchRowIdx, 1, 1, headers.length).getValues()[0];
  const rowPassword = String(matchedRow[passwordColumn] || "");

  if (rowPassword !== password) {
    return jsonResponse({
      success: false,
      message: "Invalid email or password"
    });
  }

  // Timezone Correction: Format last login date using the spreadsheet's native timezone
  if (lastLoginColumn !== -1) {
    const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    const formattedDate = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");
    sheet.getRange(matchRowIdx, lastLoginColumn + 1).setValue(formattedDate);
  }

  return jsonResponse({
    success: true,
    message: "Login successful",
    user: {
      personNo: matchedRow[personNoColumn],
      name: nameColumn !== -1 ? matchedRow[nameColumn] : "",
      phone: phoneColumn !== -1 ? matchedRow[phoneColumn] : "",
      email: matchedRow[emailColumn]
    }
  });
}

// OPTIMIZED EMAIL CHECK: Scans only the Email column
function checkEmail(sheet, data) {
  const email = String(data.email || "").trim().toLowerCase();

  if (!email) {
    return jsonResponse({
      success: false,
      message: "Email is required"
    });
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return jsonResponse({
      success: true,
      exists: false,
      message: "Email is available"
    });
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const emailColumn = headers.indexOf("Email");

  if (emailColumn === -1) {
    return jsonResponse({
      success: false,
      message: "Email column not found"
    });
  }

  // Speed Optimization: Read only the Email column from the spreadsheet
  const emailValues = sheet.getRange(2, emailColumn + 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < emailValues.length; i++) {
    if (String(emailValues[i][0] || "").trim().toLowerCase() === email) {
      return jsonResponse({
        success: true,
        exists: true,
        message: "Email already exists"
      });
    }
  }

  return jsonResponse({
    success: true,
    exists: false,
    message: "Email is available"
  });
}

function createRow(headers, data) {
  return headers.map(header => {
    return data[header] !== undefined ? data[header] : "";
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}