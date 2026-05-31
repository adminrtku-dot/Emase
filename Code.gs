/**
 * Fungsi utama yang dijalankan Google Apps Script saat Web App diakses.
 * Fungsi ini merender file 'Index.html'.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi Tabungan Emas') // Judul tab browser
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1'); // Agar responsif di HP
}

/**
 * --- FITUR TAMBAHAN (Opsional) ---
 * Fungsi-fungsi di bawah ini adalah contoh jika Anda ingin
 * menyimpan data ke Google Sheets alih-alih Local Storage.
 * Anda dapat memanggilnya dari React menggunakan:
 * google.script.run.withSuccessHandler(callback).namaFungsi(data);
 */

// Contoh fungsi untuk mengambil data awal (bisa dari Spreadsheet)
function getInitialData() {
  // Dalam skenario nyata, Anda bisa membaca dari Sheet di sini
  return {
    prices: { beli: 1350000, buyback: 1250000 },
    goals: [
      { id: 1, name: 'Dana Darurat', targetGrams: 50, currentGrams: 10, color: 'bg-emerald-500' },
      { id: 2, name: 'Pendidikan Anak', targetGrams: 100, currentGrams: 25.5, color: 'bg-blue-500' },
      { id: 3, name: 'Liburan', targetGrams: 15, currentGrams: 5, color: 'bg-amber-500' }
    ],
    transactions: [
      { id: 1, type: 'buy', amountGrams: 40.5, pricePerGram: 1300000, date: new Date().toISOString() }
    ]
  };
}

// Contoh fungsi untuk menyimpan transaksi ke Spreadsheet
function simpanTransaksiSheet(transaksi) {
  try {
    // const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Riwayat');
    // sheet.appendRow([transaksi.id, transaksi.date, transaksi.type, transaksi.amountGrams, transaksi.pricePerGram]);
    return { success: true, message: "Transaksi berhasil disimpan ke Sheet" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}
