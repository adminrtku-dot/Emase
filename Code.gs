function doGet() {
  // Menampilkan file Index.html ke layar
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi Tabungan Emas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Fungsi dummy untuk mengambil harga Antam (Jika Anda punya API)
function getHargaEmas() {
  return {
    beli: 1350000,
    buyback: 1250000
  };
}

// Fungsi untuk menyimpan data ke Spreadsheet (Bisa Anda kembangkan nanti)
function simpanTransaksi(data) {
  // Implementasi ke Google Sheets diletakkan di sini
  // const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transaksi');
  // sheet.appendRow([new Date(), data.jenis, data.gram, data.harga]);
  return "Sukses";
}
