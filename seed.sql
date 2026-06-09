USE db_siprabu_ft;

-- Insert sample barangs
INSERT IGNORE INTO barangs (kode_barang, no_urut_pendaft, nama_barang, merk_type, th_perolehan, lokasi_ruangan, kondisi) VALUES
('1.02.01.01.001', 1, 'PC Client Dell OptiPlex', 'Intel Core i5, 8GB RAM', 2024, 'LAB-RPL', 'Baik'),
('1.02.01.01.002', 2, 'Air Conditioner Sharp 1.5 PK', 'AH-A9UCY Inverter', 2023, 'LAB-JAS', 'Rusak Ringan'),
('1.02.01.01.003', 3, 'Proyektor Epson EB-X400', 'EB-X400 3300 lumens', 2022, 'LAB-KOD', 'Baik');

-- Insert sample reports
INSERT IGNORE INTO laporan_kerusakans (kode_barang, no_urut_pendaft, dilaporkan_oleh, deskripsi_kerusakan, foto_url, status_laporan) VALUES
('1.02.01.01.002', 2, 'Rahmat (Dosen)', 'AC tidak dingin, hanya keluar angin saja.', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', 'Menunggu'),
('1.02.01.01.003', 3, 'Siti (Mahasiswa)', 'Lensa proyektor buram dan ada titik hitam di tengah layar.', 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80', 'Diproses');
