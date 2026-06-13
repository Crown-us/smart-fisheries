-- Seed Users (Password is 'password123' BCrypt-encoded)
INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_verified) VALUES
('admin@smartfish.com', 'admin', '$2a$10$2mPewzXzM14wNaTBLHv2Zesaa/iZrqoWOBJelP5JEsBSVq/w6Uzpe', 'System', 'Admin', 'ADMIN', true),
('farmer@smartfish.com', 'farmer', '$2a$10$2mPewzXzM14wNaTBLHv2Zesaa/iZrqoWOBJelP5JEsBSVq/w6Uzpe', 'Budi', 'Petani', 'FARMER', true),
('consumer@smartfish.com', 'consumer', '$2a$10$2mPewzXzM14wNaTBLHv2Zesaa/iZrqoWOBJelP5JEsBSVq/w6Uzpe', 'Andi', 'Konsumen', 'CONSUMER', true);

-- Seed Fish Species
INSERT INTO fish_species (name, scientific_name, optimal_ph_min, optimal_ph_max, optimal_temp_min, optimal_temp_max, optimal_do_min, optimal_do_max, optimal_salinity_min, optimal_salinity_max, optimal_ammonia_max) VALUES
('Nila (Tilapia)', 'Oreochromis niloticus', 6.5, 8.5, 25.0, 32.0, 4.0, 9.0, 0.0, 15.0, 0.05),
('Lele (Catfish)', 'Clarias gariepinus', 6.5, 8.0, 24.0, 30.0, 3.0, 8.0, 0.0, 5.0, 0.1),
('Mas (Carp)', 'Cyprinus carpio', 7.0, 8.0, 20.0, 28.0, 5.0, 8.0, 0.0, 2.0, 0.02);

-- Seed Feed Types
INSERT INTO feed_types (name, manufacturer, protein_percentage, fat_percentage, notes) VALUES
('Cargill Prima 1', 'Cargill Indonesia', 32.0, 5.0, 'Premium starter feed for tilapia and catfish'),
('CP Prima Eco 2', 'Charoen Pokphand', 28.0, 4.0, 'Economical grower feed');

-- Seed Ponds for Farmer (Budi - ID: 2)
INSERT INTO ponds (farmer_id, name, location, length_m, width_m, depth_m, water_source, status) VALUES
(2, 'Kolam A - Nila', 'Sektor Barat, Kebun Budi', 10.0, 5.0, 1.5, 'Spring Water', 'ACTIVE'),
(2, 'Kolam B - Lele', 'Sektor Timur, Kebun Budi', 8.0, 4.0, 1.2, 'Well Water', 'ACTIVE');

-- Seed Pond Stocks (Cultivation batches)
INSERT INTO pond_stocks (pond_id, fish_species_id, initial_quantity, current_quantity, initial_weight_g, current_weight_g, stocked_at, status) VALUES
(1, 1, 1000, 980, 15.0, 150.0, NOW() - INTERVAL '45 days', 'ACTIVE'),
(2, 2, 2000, 1950, 10.0, 85.0, NOW() - INTERVAL '30 days', 'ACTIVE');

-- Seed Water Quality Records
INSERT INTO water_quality_records (pond_id, ph, temperature, dissolved_oxygen, salinity, ammonia, notes, recorded_by, recorded_at) VALUES
(1, 7.2, 28.5, 5.2, 1.0, 0.01, 'Normal morning reading', 2, NOW() - INTERVAL '3 days'),
(1, 7.4, 29.0, 4.8, 1.0, 0.02, 'Afternoon reading', 2, NOW() - INTERVAL '2 days'),
(1, 7.1, 28.0, 5.5, 1.0, 0.01, 'Morning reading', 2, NOW() - INTERVAL '1 day'),
(1, 7.3, 28.2, 5.0, 1.0, 0.015, 'Latest condition check', 2, NOW() - INTERVAL '2 hours'),
(2, 6.8, 27.5, 3.8, 0.0, 0.04, 'Normal condition', 2, NOW() - INTERVAL '1 day');

-- Seed Feeding Records
INSERT INTO feeding_records (pond_stock_id, feed_type_id, quantity_kg, fed_at, recorded_by) VALUES
(1, 1, 15.0, NOW() - INTERVAL '3 days', 2),
(1, 1, 15.5, NOW() - INTERVAL '2 days', 2),
(1, 1, 16.0, NOW() - INTERVAL '1 day', 2),
(2, 2, 20.0, NOW() - INTERVAL '1 day', 2);

-- Seed FCR Records
INSERT INTO fcr_records (pond_stock_id, calculation_date, total_feed_given_kg, total_biomass_gain_kg, fcr_value) VALUES
(1, CURRENT_DATE - 1, 150.0, 120.0, 1.25),
(2, CURRENT_DATE - 1, 120.0, 95.0, 1.26);

-- Seed Products for Marketplace
INSERT INTO products (farmer_id, name, description, price, stock_quantity, unit, category, is_moderated, moderation_status) VALUES
(2, 'Ikan Nila Segar Super', 'Ikan nila segar baru ditangkap dari kolam alami. Berat rata-rata 300-400 gram per ekor.', 35000.00, 150.0, 'KG', 'FRESH_FISH', true, 'APPROVED'),
(2, 'Lele Segar Hidup', 'Lele segar siap konsumsi, dibudidayakan secara bersih dan higienis.', 25000.00, 200.0, 'KG', 'FRESH_FISH', true, 'APPROVED');

-- Seed Product Images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500&auto=format&fit=crop', true),
(2, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop', true);

-- Seed Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'Kualitas Air Kolam B', 'Dissolved Oxygen (DO) mendekati batas minimal (3.8 mg/L). Hidupkan aerator!', 'ALERT', false),
(2, 'Jadwal Pemberian Pakan', 'Jadwal pemberian pakan sore untuk Kolam A pukul 16:00.', 'REMINDER', false);
