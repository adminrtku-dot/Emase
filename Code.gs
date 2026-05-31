/**
 * Fungsi utama yang dijalankan Google Apps Script saat Web App diakses.
 * Merender file 'Index.html' dengan mode responsif.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi Tabungan Emas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Membuka Spreadsheet aktif dan memeriksa/membuat lembar kerja (sheet) 
 * yang diperlukan jika belum ada.
 */
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
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
}

/**
 * Mengambil semua data dari Google Sheets untuk dikirim ke aplikasi React (Index.html).
 * Dipanggil saat aplikasi pertama kali dimuat.
 */
function getAppData() {
  initSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ambil Data Harga
  const sheetPrices = ss.getSheetByName('Prices');
  const priceValues = sheetPrices.getRange(2, 1, 1, 2).getValues()[0];
  const prices = {
    beli: Number(priceValues[0]),
    buyback: Number(priceValues[1])
  };
  
  // 2. Ambil Data Tujuan (Goals)
  const sheetGoals = ss.getSheetByName('Goals');
  const goalsRows = sheetGoals.getRange(2, 1, sheetGoals.getLastRow() - 1, 5).getValues();
  const goals = goalsRows.map(row => ({
    id: Number(row[0]),
    name: String(row[1]),
    targetGrams: Number(row[2]),
    currentGrams: Number(row[3]),
    color: String(row[4])
  }));
  
  // 3. Ambil Data Transaksi (Maksimal 10 terakhir)
  const sheetTrx = ss.getSheetByName('Transactions');
  let transactions = [];
  if (sheetTrx.getLastRow() > 1) {
    const trxRows = sheetTrx.getRange(2, 1, sheetTrx.getLastRow() - 1, 5).getValues();
    transactions = trxRows.map(row => ({
      id: Number(row[0]),
      date: String(row[1]),
      type: String(row[2]),
      amountGrams: Number(row[3]),
      pricePerGram: Number(row[4])
    }));
  }
  
  return { prices, goals, transactions };
}

/**
 * Menyimpan pembaruan harga emas ke sheet 'Prices'.
 */
function savePricesGS(prices) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Prices');
  sheet.getRange(2, 1, 1, 2).setValues([[prices.beli, prices.buyback]]);
  return { success: true };
}

/**
 * Menyimpan seluruh data tujuan (Goals) ke sheet 'Goals'.
 * Metode ini membersihkan baris lama dan menulis ulang daftar terbaru.
 */
function saveGoalsGS(goals) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Goals');
  
  // Hapus semua data lama di bawah header
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  
  // Tulis ulang baris baru
  goals.forEach(goal => {
    sheet.appendRow([goal.id, goal.name, goal.targetGrams, goal.currentGrams, goal.color]);
  });
  
  return { success: true };
}

/**
 * Mencatat transaksi baru ke sheet 'Transactions' sekaligus memperbarui saldo di sheet 'Goals'.
 */
function saveTransactionAndGoalsGS(trx, updatedGoals) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Catat Transaksi Baru
  const sheetTrx = ss.getSheetByName('Transactions');
  sheetTrx.appendRow([trx.id, trx.date, trx.type, trx.amountGrams, trx.pricePerGram]);
  
  // 2. Perbarui Semua Tujuan (karena saldo berubah)
  saveGoalsGS(updatedGoals);
  
  return { success: true };
}
