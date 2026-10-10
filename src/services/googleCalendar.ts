/**
 * File: src/services/googleCalendar.ts
 * 
 * Catatan: Karena fitur sinkronisasi akun Google Calendar API sudah dimatikan,
 * file ini sekarang HANYA bertugas mengambil data Hari Libur Nasional (Tanggal Merah)
 * menggunakan Nager.Date API (Global & Stabil).
 */

export const fetchIndonesianHolidays = async (year: number) => {
  try {
    // Menggunakan API Nager.Date khusus untuk region Indonesia (ID)
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
    
    if (!response.ok) {
      throw new Error("Gagal memuat data hari libur");
    }

    const data = await response.json();

    // Nager.Date mengembalikan format: { date: "YYYY-MM-DD", localName: "Nama Libur Bahasa Lokal", ... }
    return data.map((holiday: any) => ({
      date: holiday.date,
      name: holiday.localName 
    }));
  } catch (error) {
    console.error("Error fetching Indonesian holidays:", error);
    // Jika gagal fetch (misal tidak ada internet), kembalikan array kosong 
    // agar kalender tidak error.
    return []; 
  }
};
