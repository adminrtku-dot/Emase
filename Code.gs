/**
 * Fungsi pembantu untuk mendapatkan Spreadsheet.
 * Jika script terikat (container-bound), ia menggunakan spreadsheet aktif.
 * Jika standalone, ia akan mencari spreadsheet yang pernah dibuat atau membuat baru.
 */
function getSpreadsheet() {
  try {
    const activeSS = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSS) {
      return activeSS;
    }
  } catch (e) {
    // Abaikan error dan lanjut ke metode alternatif
  }

  // Jika gagal mendapatkan spreadsheet aktif, gunakan properti penyimpanan script
  const userProperties = PropertiesService.getUserProperties();
  const savedSheetId = userProperties.getProperty('GOLD_SAVINGS_SHEET_ID');

  if (savedSheetId) {
    try {
      return SpreadsheetApp.openById(savedSheetId);
    } catch (e) {
      // Jika spreadsheet lama terhapus, buat baru di bawah
    }
  }

  // Membuat Spreadsheet baru jika tidak ada yang ditemukan
  const newSS = SpreadsheetApp.create('Database Tabungan Emas');
  userProperties.setProperty('GOLD_SAVINGS_SHEET_ID', newSS.getId());
  return newSS;
}

/**
 * Fungsi utama yang dijalankan Google Apps Script saat Web App diakses.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi Tabungan Emas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Membuka Spreadsheet dan memeriksa/membuat lembar kerja (sheet) 
 * yang diperlukan jika belum ada.
 */
function initSheets() {
  const ss = getSpreadsheet();
  
  // Sheet 1: Konfigurasi Harga
  let sheetPrices = ss.getSheetByName('Prices');
  if (!sheetPrices) {
    sheetPrices = ss.insertSheet('Prices');
    sheetPrices.appendRow(['Harga Beli', 'Harga Buyback']);
    sheetPrices.appendRow([1350000, 1250000]); // Nilai awal default
  }
  
  // Sheet 2: Daftar Tujuan Tabungan
  let sheetGoals = ss.getSheetByName('Goals');
  if (!sheetGoals) {
    sheetGoals = ss.insertSheet('Goals');
    sheetGoals.appendRow(['ID', 'Nama Tujuan', 'Target (Gram)', 'Saldo Saat Ini (Gram)', 'Warna']);
    // Nilai awal default
    sheetGoals.appendRow([1, 'Dana Darurat', 50, 10, 'bg-emerald-500']);
    sheetGoals.appendRow([2, 'Pendidikan Anak', 100, 25.5, 'bg-blue-500']);
    sheetGoals.appendRow([3, 'Liburan', 15, 5, 'bg-amber-500']);
  }
  
  // Sheet 3: Riwayat Transaksi
  let sheetTrx = ss.getSheetByName('Transactions');
  if (!sheetTrx) {
    sheetTrx = ss.insertSheet('Transactions');
    sheetTrx.appendRow(['ID Transaksi', 'Tanggal', 'Tipe', 'Gram', 'Harga Per Gram']);
  }

  // Sheet 4: Konfigurasi Sistem (PIN Keamanan)
  let sheetConfig = ss.getSheetByName('Config');
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet('Config');
    sheetConfig.appendRow(['Key', 'Value']);
    sheetConfig.appendRow(['PIN_TRANSAKSI', '123456']); // Default PIN
  }
}

/**
 * Mengambil semua data dari Google Sheets untuk dikirim ke aplikasi React (Index.html).
 */
function getAppData() {
  initSheets();
  const ss = getSpreadsheet();
  
  // 1. Ambil Data Harga
  const sheetPrices = ss.getSheetByName('Prices');
  const priceValues = sheetPrices.getRange(2, 1, 1, 2).getValues()[0];
  const prices = {
    beli: Number(priceValues[0]),
    buyback: Number(priceValues[1])
  };
  
  // 2. Ambil Data Tujuan (Goals)
  const sheetGoals = ss.getSheetByName('Goals');
  const lastRowGoals = sheetGoals.getLastRow();
  let goals = [];
  if (lastRowGoals > 1) {
    const goalsRows = sheetGoals.getRange(2, 1, lastRowGoals - 1, 5).getValues();
    goals = goalsRows.map(row => ({
      id: Number(row[0]),
      name: String(row[1]),
      targetGrams: Number(row[2]),
      currentGrams: Number(row[3]),
      color: String(row[4])
    }));
  }
  
  // 3. Ambil Data Transaksi (Maksimal 10 terakhir)
  const sheetTrx = ss.getSheetByName('Transactions');
  const lastRowTrx = sheetTrx.getLastRow();
  let transactions = [];
  if (lastRowTrx > 1) {
    const trxRows = sheetTrx.getRange(2, 1, lastRowTrx - 1, 5).getValues();
    transactions = trxRows.map(row => ({
      id: Number(row[0]),
      date: String(row[1]),
      type: String(row[2]),
      amountGrams: Number(row[3]),
      pricePerGram: Number(row[4])
    }));
  }

  // 4. Ambil PIN Transaksi
  const sheetConfig = ss.getSheetByName('Config');
  const pin = String(sheetConfig.getRange(2, 2).getValue());
  
  return { prices, goals, transactions, pin };
}

/**
 * Menyimpan pembaruan harga emas ke sheet 'Prices'.
 */
function savePricesGS(prices) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Prices');
  sheet.getRange(2, 1, 1, 2).setValues([[prices.beli, prices.buyback]]);
  return { success: true };
}

/**
 * Menyimpan PIN baru ke sheet 'Config'.
 */
function savePinGS(newPin) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Config');
  sheet.getRange(2, 2).setValue(String(newPin));
  return { success: true };
}

/**
 * Menyimpan seluruh data tujuan (Goals) ke sheet 'Goals'.
 */
function saveGoalsGS(goals) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Goals');
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  goals.forEach(goal => {
    sheet.appendRow([goal.id, goal.name, goal.targetGrams, goal.currentGrams, goal.color]);
  });
  
  return { success: true };
}

/**
 * Mencatat transaksi baru ke sheet 'Transactions' sekaligus memperbarui saldo di sheet 'Goals'.
 */
function saveTransactionAndGoalsGS(trx, updatedGoals) {
  const ss = getSpreadsheet();
  
  const sheetTrx = ss.getSheetByName('Transactions');
  sheetTrx.appendRow([trx.id, trx.date, trx.type, trx.amountGrams, trx.pricePerGram]);
  
  saveGoalsGS(updatedGoals);
  
  return { success: true };
}
