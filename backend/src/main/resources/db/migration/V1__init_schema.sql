-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL, -- 'ADMIN', 'FARMER', 'CONSUMER'
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 2. Ponds Table
CREATE TABLE ponds (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    length_m DOUBLE PRECISION NOT NULL,
    width_m DOUBLE PRECISION NOT NULL,
    depth_m DOUBLE PRECISION NOT NULL,
    water_source VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ponds_farmer_id ON ponds(farmer_id);

-- 3. Fish Species Table
CREATE TABLE fish_species (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    scientific_name VARCHAR(150),
    optimal_ph_min DOUBLE PRECISION,
    optimal_ph_max DOUBLE PRECISION,
    optimal_temp_min DOUBLE PRECISION,
    optimal_temp_max DOUBLE PRECISION,
    optimal_do_min DOUBLE PRECISION, -- Dissolved Oxygen
    optimal_do_max DOUBLE PRECISION,
    optimal_salinity_min DOUBLE PRECISION,
    optimal_salinity_max DOUBLE PRECISION,
    optimal_ammonia_max DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pond Stocks Table (Cultivation Batch)
CREATE TABLE pond_stocks (
    id BIGSERIAL PRIMARY KEY,
    pond_id BIGINT REFERENCES ponds(id) ON DELETE CASCADE,
    fish_species_id BIGINT REFERENCES fish_species(id) ON DELETE RESTRICT,
    initial_quantity INT NOT NULL,
    current_quantity INT NOT NULL,
    initial_weight_g DOUBLE PRECISION NOT NULL, -- average weight per fish in grams
    current_weight_g DOUBLE PRECISION NOT NULL, -- average weight per fish in grams
    stocked_at TIMESTAMP NOT NULL,
    harvested_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'HARVESTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pond_stocks_pond_id ON pond_stocks(pond_id);
CREATE INDEX idx_pond_stocks_status ON pond_stocks(status);

-- 5. Water Quality Records Table
CREATE TABLE water_quality_records (
    id BIGSERIAL PRIMARY KEY,
    pond_id BIGINT REFERENCES ponds(id) ON DELETE CASCADE,
    ph DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    dissolved_oxygen DOUBLE PRECISION,
    salinity DOUBLE PRECISION,
    ammonia DOUBLE PRECISION,
    notes TEXT,
    recorded_by BIGINT REFERENCES users(id),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_water_quality_pond_recorded ON water_quality_records(pond_id, recorded_at);

-- 6. Feed Types Table
CREATE TABLE feed_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    manufacturer VARCHAR(100),
    protein_percentage DOUBLE PRECISION,
    fat_percentage DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Feeding Schedules Table
CREATE TABLE feeding_schedules (
    id BIGSERIAL PRIMARY KEY,
    pond_id BIGINT REFERENCES ponds(id) ON DELETE CASCADE,
    feed_type_id BIGINT REFERENCES feed_types(id) ON DELETE RESTRICT,
    time_of_day TIME NOT NULL,
    quantity_kg DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feeding_schedules_pond ON feeding_schedules(pond_id);

-- 8. Feeding Records Table
CREATE TABLE feeding_records (
    id BIGSERIAL PRIMARY KEY,
    pond_stock_id BIGINT REFERENCES pond_stocks(id) ON DELETE CASCADE,
    feed_type_id BIGINT REFERENCES feed_types(id) ON DELETE RESTRICT,
    quantity_kg DOUBLE PRECISION NOT NULL,
    fed_at TIMESTAMP NOT NULL,
    recorded_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feeding_records_stock ON feeding_records(pond_stock_id);

-- 9. FCR Records Table
CREATE TABLE fcr_records (
    id BIGSERIAL PRIMARY KEY,
    pond_stock_id BIGINT REFERENCES pond_stocks(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL,
    total_feed_given_kg DOUBLE PRECISION NOT NULL,
    total_biomass_gain_kg DOUBLE PRECISION NOT NULL,
    fcr_value DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fcr_records_stock ON fcr_records(pond_stock_id);

-- 10. Digital Certifications Table
CREATE TABLE digital_certifications (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    document_url VARCHAR(512) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    reviewer_id BIGINT REFERENCES users(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certifications_farmer ON digital_certifications(farmer_id);
CREATE INDEX idx_certifications_status ON digital_certifications(status);

-- 11. Products Table (Marketplace)
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    stock_quantity DECIMAL(10, 2) NOT NULL, -- in kg or pcs
    unit VARCHAR(20) NOT NULL, -- 'KG', 'PCS'
    category VARCHAR(50) NOT NULL, -- 'FRESH_FISH', 'FROZEN_FISH', 'PROCESSED', 'FEED', 'EQUIPMENT'
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_products_status ON products(moderation_status);

-- 12. Product Images Table
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Orders Table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    consumer_id BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_consumer ON orders(consumer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 14. Order Items Table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL,
    price_per_unit DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'ALERT', 'REMINDER', 'INFO'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
