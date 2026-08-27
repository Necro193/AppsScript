// ==========================================
// KONFIGURASI SPREADSHEET
// ==========================================

// ID Spreadsheet kamu (Sudah diperbaiki, hanya ID-nya saja)
const SPREADSHEET_ID = '1H_pNLdJhspuLuki6x5wwKGO9T8XF53gZxSx7OJvKsds'; 
// Sesuaikan dengan nama tab (sheet) di file kamu, biasanya 'Sheet1'
const SHEET_NAME = 'Sheet1'; 

// Fungsi ini wajib ada untuk menampilkan halaman HTML sebagai Web App
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Dashboard Meta Mahakam')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ==========================================
// FUNGSI CRUD (BACKEND)
// ==========================================

// 1. READ: Mengambil data dari Spreadsheet
function getEmployeeData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Ambil semua data
    const dataRange = sheet.getDataRange().getValues();
    if (dataRange.length <= 1) return [];

    const rawData = dataRange.slice(1); // Buang baris header

    // Konversi ke format JSON yang dipahami antarmuka Web dengan Row ID
    const formattedData = rawData.map((row, index) => {
      return {
        rowId: index + 2, // Baris asli di Google Sheets (Index array mulai dari 0, ditambah 1 untuk baris ke-1, ditambah 1 lagi karena header)
        // Perbaikan mapping indeks kolom karena ada kolom 'No' di Kolom A (indeks 0)
        no: row[0],
        nama: row[1],
        kelamin: row[2],
        durasiKerja: row[3],
        kota: row[4],
        tempatKerja: row[5],
        gaji: row[6]
      };
    });

    return formattedData;
  } catch (e) {
    Logger.log(e.toString());
    return { error: e.message };
  }
}

// 2. CREATE: Menambah data baru
function addEmployee(payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Mengambil nomor terakhir untuk kolom 'No'
    const lastRow = sheet.getLastRow();
    let nextNo = 1;
    if (lastRow > 1) {
       nextNo = sheet.getRange(lastRow, 1).getValue() + 1;
    }

    // Menyusun array sesuai urutan kolom di Sheet, tambahkan 'No' di awal
    const newRow = [
      nextNo, // Kolom A: No
      payload.nama, // Kolom B: Nama
      payload.kelamin, // Kolom C: Jenis Kelamin
      payload.durasiKerja, // Kolom D: Durasi Kerja
      payload.kota, // Kolom E: Kota Ditempatkan
      payload.tempatKerja, // Kolom F: Tempat Kerja
      payload.gaji // Kolom G: Gaji Perbulan
    ];
    
    sheet.appendRow(newRow);
    
    // Kembalikan data terbaru untuk merender ulang UI
    return getEmployeeData();
  } catch (e) {
    return { error: e.message };
  }
}

// 3. UPDATE: Mengubah data
function editEmployee(rowId, payload) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Kita tidak mengubah kolom 'No' (kolom 1), jadi kita update dari kolom 2
    const updatedRow = [
      [payload.nama, payload.kelamin, payload.durasiKerja, payload.kota, payload.tempatKerja, payload.gaji]
    ];
    
    // Timpa data pada baris spesifik (rowId), mulai dari kolom 2 (B), sebanyak 1 baris, 6 kolom
    sheet.getRange(rowId, 2, 1, 6).setValues(updatedRow);
    
    return getEmployeeData();
  } catch (e) {
    return { error: e.message };
  }
}

// 4. DELETE: Menghapus data
function deleteEmployee(rowId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    sheet.deleteRow(rowId);
    
    return getEmployeeData();
  } catch (e) {
    return { error: e.message };
  }
}