-- ============================================
-- Shipping Enhancements Migration - Ghana Edition
-- File: 003_shipping_enhancements_ghana.sql
-- Description: Add shipping tracking and carrier management features optimized for Ghana
-- ============================================

-- 1. Create shipping_carriers table for managing different shipping providers
CREATE TABLE IF NOT EXISTS shipping_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'ghl', 'dhl_ghana', 'ups_ghana', 'courier_plus'
  tracking_url_template TEXT, -- Template with {tracking_number} placeholder
  api_endpoint TEXT, -- For tracking API integration
  phone_number VARCHAR(20), -- Local contact number
  email VARCHAR(100), -- Contact email
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Ghana-focused carriers
INSERT INTO shipping_carriers (name, code, tracking_url_template, phone_number, email) VALUES
('Ghana Post', 'ghana_post', 'https://www.ghanapost.com.gh/track?tracking_number={tracking_number}', '+233302666440', 'info@ghanapost.com.gh'),
('DHL Ghana', 'dhl_ghana', 'https://www.dhl.com/gh-en/home/tracking.html?submit=1&tracking-id={tracking_number}', '+233302740940', 'customerservice.gh@dhl.com'),
('Courier Plus', 'courier_plus', 'https://courierplus.com.gh/track?id={tracking_number}', '+233244000000', 'info@courierplus.com.gh'),
('Zipline Ghana', 'zipline', NULL, '+233501234567', 'operations@zipline.com'),
('UPS Ghana', 'ups_ghana', 'https://www.ups.com/track?track=yes&trackNums={tracking_number}', '+233302123456', 'customercare@ups.com'),
('FedEx Ghana', 'fedex_ghana', 'https://www.fedex.com/fedextrack/?trknbr={tracking_number}', '+233302789012', 'customerservice@fedex.com'),
('EMS Ghana', 'ems_ghana', 'https://www.ems.post/en/global-network/ghana', '+233302666441', 'ems@ghanapost.com.gh'),
('Standard Local', 'standard_local', NULL, '+233501111111', 'delivery@tapverse.com');

-- 2. Create shipping_zones table for different shipping regions and pricing (Ghana-focused)
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  countries TEXT[], -- Array of country codes
  regions TEXT[], -- Array of Ghana regions for domestic shipping
  base_rate DECIMAL(10,2) DEFAULT 0.00, -- in GHS (Ghana Cedis)
  rate_per_item DECIMAL(10,2) DEFAULT 0.00,
  free_shipping_threshold DECIMAL(10,2), -- Minimum order amount for free shipping in GHS
  estimated_delivery_days_min INTEGER,
  estimated_delivery_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Ghana-focused shipping zones
INSERT INTO shipping_zones (name, description, countries, regions, base_rate, rate_per_item, free_shipping_threshold, estimated_delivery_days_min, estimated_delivery_days_max) VALUES
(
  'Greater Accra', 
  'Greater Accra Region - Same day/Next day delivery', 
  ARRAY['GH'], 
  ARRAY['Greater Accra'], 
  10.00, 2.00, 100.00, 1, 2
),
(
  'Ashanti Region', 
  'Ashanti Region including Kumasi', 
  ARRAY['GH'], 
  ARRAY['Ashanti'], 
  15.00, 3.00, 120.00, 2, 4
),
(
  'Southern Ghana', 
  'Central, Western, Eastern, and Volta Regions', 
  ARRAY['GH'], 
  ARRAY['Central', 'Western', 'Eastern', 'Volta'], 
  20.00, 4.00, 150.00, 3, 7
),
(
  'Northern Ghana', 
  'Northern, Upper East, Upper West, North East, Savannah, and Bono Regions', 
  ARRAY['GH'], 
  ARRAY['Northern', 'Upper East', 'Upper West', 'North East', 'Savannah', 'Bono', 'Bono East', 'Ahafo', 'Oti', 'Western North'], 
  30.00, 5.00, 200.00, 5, 10
),
(
  'West Africa', 
  'ECOWAS countries', 
  ARRAY['NG', 'CI', 'BF', 'TG', 'BJ', 'SN', 'ML', 'NE', 'GW', 'LR', 'SL', 'CV', 'GM'], 
  ARRAY[]::TEXT[], 
  50.00, 8.00, 300.00, 7, 14
),
(
  'Africa', 
  'Other African countries', 
  ARRAY['KE', 'UG', 'TZ', 'RW', 'ET', 'ZA', 'EG', 'MA', 'DZ', 'TN', 'LY', 'SD', 'ZM', 'ZW', 'MW', 'MZ', 'AO', 'CM', 'CD', 'CF', 'TD', 'CG', 'GA', 'GQ', 'ST', 'DJ', 'ER', 'SO', 'SS', 'UG', 'BI', 'KM', 'MG', 'MU', 'SC', 'MR', 'SZ', 'LS', 'BW', 'NA'], 
  ARRAY[]::TEXT[], 
  80.00, 12.00, 500.00, 10, 21
),
(
  'Europe & Americas', 
  'Europe, North & South America', 
  ARRAY['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'LU', 'IS', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'PY', 'BO', 'EC', 'VE', 'GY', 'SR', 'GF', 'MX', 'CR', 'PA', 'GT', 'HN', 'SV', 'NI', 'BZ', 'JM', 'HT', 'DO', 'CU', 'TT', 'BB', 'GD', 'LC', 'VC', 'DM', 'AG', 'KN', 'BS'], 
  ARRAY[]::TEXT[], 
  120.00, 20.00, 800.00, 14, 30
),
(
  'Asia & Oceania', 
  'Asia, Australia, and Pacific Islands', 
  ARRAY['CN', 'JP', 'IN', 'ID', 'TH', 'VN', 'PH', 'MY', 'SG', 'KR', 'BD', 'PK', 'LK', 'MM', 'KH', 'LA', 'BN', 'MV', 'NP', 'BT', 'MN', 'KZ', 'UZ', 'TM', 'TJ', 'KG', 'AF', 'IR', 'IQ', 'SY', 'LB', 'JO', 'IL', 'PS', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE', 'TR', 'CY', 'GE', 'AM', 'AZ', 'AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'NC', 'PF', 'WS', 'TO', 'TV', 'NR', 'KI', 'MH', 'FM', 'PW'], 
  ARRAY[]::TEXT[], 
  150.00, 25.00, 1000.00, 14, 35
);

-- 3. Add shipping-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS carrier_id UUID REFERENCES shipping_carriers(id),
ADD COLUMN IF NOT EXISTS shipping_zone_id UUID REFERENCES shipping_zones(id),
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS actual_delivery_date DATE,
ADD COLUMN IF NOT EXISTS shipping_notes TEXT,
ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracking_events JSONB DEFAULT '[]'::jsonb, -- Store tracking history
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'GHS'; -- Ghana Cedis

-- 4. Create tracking_events table for detailed tracking history
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'picked_up', 'in_transit', 'arrived_sorting', 'out_for_delivery', 'delivered', 'exception', 'delayed'
  status VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(200), -- e.g., 'Accra Mail Centre', 'Kumasi Depot', 'Tema Port'
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  carrier_event_id VARCHAR(100), -- Carrier's internal event ID
  notes TEXT, -- Additional notes in local context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create shipping_rates table for dynamic pricing based on weight/dimensions
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES shipping_carriers(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- 'standard', 'express', 'same_day', 'next_day'
  weight_min DECIMAL(8,2) DEFAULT 0.00, -- in kg
  weight_max DECIMAL(8,2),
  dimension_length_max DECIMAL(8,2), -- in cm
  dimension_width_max DECIMAL(8,2),
  dimension_height_max DECIMAL(8,2),
  base_rate DECIMAL(10,2) NOT NULL, -- in GHS
  rate_per_kg DECIMAL(10,2) DEFAULT 0.00,
  fuel_surcharge_percent DECIMAL(5,2) DEFAULT 0.00, -- For international shipping
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample shipping rates for Ghana
INSERT INTO shipping_rates (shipping_zone_id, carrier_id, service_type, weight_max, base_rate, rate_per_kg) VALUES
-- Greater Accra rates
((SELECT id FROM shipping_zones WHERE name = 'Greater Accra'), (SELECT id FROM shipping_carriers WHERE code = 'standard_local'), 'same_day', 2.0, 15.00, 3.00),
((SELECT id FROM shipping_zones WHERE name = 'Greater Accra'), (SELECT id FROM shipping_carriers WHERE code = 'courier_plus'), 'express', 5.0, 20.00, 4.00),
-- Ashanti Region rates  
((SELECT id FROM shipping_zones WHERE name = 'Ashanti Region'), (SELECT id FROM shipping_carriers WHERE code = 'ghana_post'), 'standard', 10.0, 18.00, 2.50),
((SELECT id FROM shipping_zones WHERE name = 'Ashanti Region'), (SELECT id FROM shipping_carriers WHERE code = 'courier_plus'), 'express', 5.0, 25.00, 5.00),
-- International rates
((SELECT id FROM shipping_zones WHERE name = 'West Africa'), (SELECT id FROM shipping_carriers WHERE code = 'dhl_ghana'), 'express', 30.0, 80.00, 15.00),
((SELECT id FROM shipping_zones WHERE name = 'Europe & Americas'), (SELECT id FROM shipping_carriers WHERE code = 'dhl_ghana'), 'express', 30.0, 150.00, 25.00);

-- 6. Create order_shipments table for orders that might be split into multiple shipments
CREATE TABLE IF NOT EXISTS order_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipment_number VARCHAR(50) NOT NULL, -- Auto-generated shipment number
  carrier_id UUID REFERENCES shipping_carriers(id),
  tracking_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'picked_up', 'in_transit', 'delivered', 'returned', 'lost'
  items_included JSONB DEFAULT '[]'::jsonb, -- Which items from the order are in this shipment
  weight DECIMAL(8,2), -- in kg
  dimensions JSONB, -- {length, width, height, unit: 'cm'}
  shipping_cost DECIMAL(10,2), -- in GHS
  pickup_location VARCHAR(200), -- e.g., 'Accra Warehouse', 'Kumasi Office'
  delivery_location VARCHAR(200),
  picked_up_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  delivery_instructions TEXT, -- Special instructions for Ghana context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_carrier_id ON orders(carrier_id);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_zone_id ON orders(shipping_zone_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_status_shipped_at ON orders(status, shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);
CREATE INDEX IF NOT EXISTS idx_tracking_events_order_id ON tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_order_shipments_order_id ON order_shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_shipments_tracking_number ON order_shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_order_shipments_status ON order_shipments(status);

-- 8. Create functions for automatic shipment number generation
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate shipment number in format: GH-SHP-YYYYMMDD-XXXX
  NEW.shipment_number := 'GH-SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(shipment_number FROM 16) AS INTEGER)), 0) + 1 
           FROM order_shipments 
           WHERE shipment_number LIKE 'GH-SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for automatic shipment number generation
DROP TRIGGER IF EXISTS generate_shipment_number_trigger ON order_shipments;
CREATE TRIGGER generate_shipment_number_trigger
  BEFORE INSERT ON order_shipments
  FOR EACH ROW
  EXECUTE FUNCTION generate_shipment_number();

-- 10. Create function to update order status based on shipment status
CREATE OR REPLACE FUNCTION update_order_status_from_shipments()
RETURNS TRIGGER AS $$
BEGIN
  -- If all shipments for an order are delivered, mark order as delivered
  IF NEW.status = 'delivered' THEN
    UPDATE orders 
    SET status = 'delivered', delivered_at = NEW.delivered_at
    WHERE id = NEW.order_id 
      AND NOT EXISTS (
        SELECT 1 FROM order_shipments 
        WHERE order_id = NEW.order_id 
          AND status NOT IN ('delivered', 'returned')
      );
  
  -- If any shipment is shipped/in_transit, mark order as shipped (if not already)
  ELSIF NEW.status IN ('picked_up', 'in_transit') AND OLD.status = 'pending' THEN
    UPDATE orders 
    SET status = 'shipped', shipped_at = COALESCE(shipped_at, NEW.picked_up_at, NEW.shipped_at)
    WHERE id = NEW.order_id 
      AND status NOT IN ('shipped', 'delivered');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger for automatic order status updates
DROP TRIGGER IF EXISTS update_order_status_trigger ON order_shipments;
CREATE TRIGGER update_order_status_trigger
  AFTER UPDATE OF status ON order_shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_from_shipments();

-- 12. Create RLS policies for shipping tables
ALTER TABLE shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_shipments ENABLE ROW LEVEL SECURITY;

-- Allow all users to read carriers and zones (public data)
CREATE POLICY "Allow read carriers" ON shipping_carriers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read zones" ON shipping_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read rates" ON shipping_rates FOR SELECT TO authenticated USING (true);

-- Users can only see their own tracking events and shipments
CREATE POLICY "Users can view own tracking events" ON tracking_events 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = tracking_events.order_id 
      AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can view own shipments" ON order_shipments 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_shipments.order_id 
      AND orders.user_id = auth.uid()
  ));

-- 13. Create view for order tracking summary (Ghana context)
CREATE OR REPLACE VIEW order_tracking_summary AS
SELECT 
  o.id as order_id,
  o.order_number,
  o.status as order_status,
  o.tracking_number,
  o.shipped_at,
  o.delivered_at,
  o.currency,
  sc.name as carrier_name,
  sc.code as carrier_code,
  sc.tracking_url_template,
  sc.phone_number as carrier_phone,
  sz.name as shipping_zone,
  sz.estimated_delivery_days_min,
  sz.estimated_delivery_days_max,
  COUNT(os.id) as shipment_count,
  COUNT(CASE WHEN os.status = 'delivered' THEN 1 END) as delivered_shipments,
  CASE 
    WHEN sz.name = 'Greater Accra' THEN 'Local - Same Day/Next Day'
    WHEN sz.name IN ('Ashanti Region', 'Southern Ghana') THEN 'Domestic - 2-7 Days'
    WHEN sz.name = 'Northern Ghana' THEN 'Domestic - 5-10 Days'
    WHEN sz.name = 'West Africa' THEN 'Regional - 7-14 Days'
    ELSE 'International - 14+ Days'
  END as delivery_category
FROM orders o
LEFT JOIN shipping_carriers sc ON o.carrier_id = sc.id
LEFT JOIN shipping_zones sz ON o.shipping_zone_id = sz.id
LEFT JOIN order_shipments os ON o.id = os.order_id
GROUP BY o.id, sc.name, sc.code, sc.tracking_url_template, sc.phone_number,
         sz.name, sz.estimated_delivery_days_min, sz.estimated_delivery_days_max;

-- 14. Create function to calculate shipping cost (Ghana context)
CREATE OR REPLACE FUNCTION calculate_shipping_cost_ghana(
  p_shipping_country TEXT,
  p_total_amount DECIMAL(10,2),
  p_shipping_region TEXT DEFAULT NULL, -- Ghana region for domestic
  p_weight DECIMAL(8,2) DEFAULT 0.1, -- in kg
  p_service_type TEXT DEFAULT 'standard',
  p_currency TEXT DEFAULT 'GHS'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_zone_id UUID;
  v_base_rate DECIMAL(10,2);
  v_rate_per_item DECIMAL(10,2);
  v_free_threshold DECIMAL(10,2);
  v_shipping_cost DECIMAL(10,2);
  v_currency_multiplier DECIMAL(10,2) DEFAULT 1.0;
BEGIN
  -- Currency conversion (basic rates - should be updated with live rates)
  CASE p_currency
    WHEN 'USD' THEN v_currency_multiplier := 12.0; -- 1 USD = 12 GHS (approximate)
    WHEN 'EUR' THEN v_currency_multiplier := 13.0; -- 1 EUR = 13 GHS (approximate)
    WHEN 'GBP' THEN v_currency_multiplier := 15.0; -- 1 GBP = 15 GHS (approximate)
    ELSE v_currency_multiplier := 1.0; -- GHS
  END CASE;
  
  -- Find matching shipping zone for Ghana
  IF p_shipping_country = 'GH' OR p_shipping_country = 'Ghana' THEN
    -- Domestic Ghana shipping - match by region
    SELECT id, base_rate, rate_per_item, free_shipping_threshold
    INTO v_zone_id, v_base_rate, v_rate_per_item, v_free_threshold
    FROM shipping_zones
    WHERE 'GH' = ANY(countries)
      AND (p_shipping_region = ANY(regions) OR regions = ARRAY[]::TEXT[])
      AND is_active = true
    ORDER BY 
      CASE WHEN p_shipping_region = ANY(regions) THEN 1 ELSE 2 END,
      base_rate ASC
    LIMIT 1;
  ELSE
    -- International shipping
    SELECT id, base_rate, rate_per_item, free_shipping_threshold
    INTO v_zone_id, v_base_rate, v_rate_per_item, v_free_threshold
    FROM shipping_zones
    WHERE (p_shipping_country = ANY(countries) OR countries = ARRAY[]::TEXT[])
      AND is_active = true
    ORDER BY 
      CASE WHEN p_shipping_country = ANY(countries) THEN 1 ELSE 2 END,
      base_rate ASC
    LIMIT 1;
  END IF;
  
  -- If no zone found, use most expensive as fallback
  IF v_zone_id IS NULL THEN
    SELECT id, base_rate, rate_per_item, free_shipping_threshold
    INTO v_zone_id, v_base_rate, v_rate_per_item, v_free_threshold
    FROM shipping_zones
    WHERE countries = ARRAY[]::TEXT[] AND is_active = true
    ORDER BY base_rate DESC
    LIMIT 1;
  END IF;
  
  -- Convert threshold to input currency for comparison
  v_free_threshold := v_free_threshold / v_currency_multiplier;
  
  -- Calculate shipping cost
  IF p_total_amount >= v_free_threshold THEN
    v_shipping_cost := 0.00;
  ELSE
    v_shipping_cost := v_base_rate + (v_rate_per_item * p_weight);
    
    -- Add service type premium
    CASE p_service_type
      WHEN 'same_day' THEN v_shipping_cost := v_shipping_cost * 2.0;
      WHEN 'next_day' THEN v_shipping_cost := v_shipping_cost * 1.5;
      WHEN 'express' THEN v_shipping_cost := v_shipping_cost * 1.3;
      ELSE NULL; -- standard rate
    END CASE;
  END IF;
  
  -- Convert back to input currency
  v_shipping_cost := v_shipping_cost / v_currency_multiplier;
  
  RETURN COALESCE(v_shipping_cost, 10.00 / v_currency_multiplier); -- Default fallback
END;
$$ LANGUAGE plpgsql;

-- 15. Update existing orders to have appropriate Ghana shipping zones
UPDATE orders SET 
  shipping_zone_id = (SELECT id FROM shipping_zones WHERE name = 'Greater Accra' LIMIT 1),
  currency = 'GHS'
WHERE shipping_zone_id IS NULL 
  AND (shipping_country = 'Ghana' OR shipping_country = 'GH')
  AND (shipping_city ILIKE '%accra%' OR shipping_state ILIKE '%accra%');

UPDATE orders SET 
  shipping_zone_id = (SELECT id FROM shipping_zones WHERE name = 'Ashanti Region' LIMIT 1),
  currency = 'GHS'
WHERE shipping_zone_id IS NULL 
  AND (shipping_country = 'Ghana' OR shipping_country = 'GH')
  AND (shipping_city ILIKE '%kumasi%' OR shipping_state ILIKE '%ashanti%');

UPDATE orders SET 
  shipping_zone_id = (SELECT id FROM shipping_zones WHERE name = 'Northern Ghana' LIMIT 1),
  currency = 'GHS'
WHERE shipping_zone_id IS NULL 
  AND (shipping_country = 'Ghana' OR shipping_country = 'GH')
  AND (shipping_state ILIKE ANY(ARRAY['%northern%', '%upper%', '%savannah%', '%bono%']));

UPDATE orders SET 
  shipping_zone_id = (SELECT id FROM shipping_zones WHERE name = 'Southern Ghana' LIMIT 1),
  currency = 'GHS'
WHERE shipping_zone_id IS NULL 
  AND (shipping_country = 'Ghana' OR shipping_country = 'GH');

-- International orders
UPDATE orders SET 
  shipping_zone_id = (SELECT id FROM shipping_zones WHERE name = 'West Africa' LIMIT 1)
WHERE shipping_zone_id IS NULL 
  AND shipping_country IN ('Nigeria', 'NG', 'Ivory Coast', 'CI', 'Burkina Faso', 'BF', 'Togo', 'TG', 'Benin', 'BJ');

UPDATE orders SET 
  shipping_zone_id = (SELECT id FROM shipping_zones WHERE name = 'Europe & Americas' LIMIT 1)
WHERE shipping_zone_id IS NULL 
  AND shipping_country IN ('United States', 'US', 'United Kingdom', 'GB', 'Germany', 'DE', 'France', 'FR', 'Canada', 'CA');

-- Fallback for remaining international orders
UPDATE orders SET 
  shipping_zone_id = (SELECT id FROM shipping_zones WHERE name = 'Asia & Oceania' LIMIT 1)
WHERE shipping_zone_id IS NULL;

-- 16. Create updated_at trigger function for shipping tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_shipping_carriers_updated_at ON shipping_carriers;
CREATE TRIGGER update_shipping_carriers_updated_at 
  BEFORE UPDATE ON shipping_carriers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_zones_updated_at ON shipping_zones;
CREATE TRIGGER update_shipping_zones_updated_at 
  BEFORE UPDATE ON shipping_zones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipping_rates_updated_at ON shipping_rates;
CREATE TRIGGER update_shipping_rates_updated_at 
  BEFORE UPDATE ON shipping_rates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_shipments_updated_at ON order_shipments;
CREATE TRIGGER update_order_shipments_updated_at 
  BEFORE UPDATE ON order_shipments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Create Ghana-specific helper functions
CREATE OR REPLACE FUNCTION get_ghana_region_from_city(city_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN city_name ILIKE ANY(ARRAY['%accra%', '%tema%', '%kasoa%', '%madina%', '%adenta%']) THEN 'Greater Accra'
    WHEN city_name ILIKE ANY(ARRAY['%kumasi%', '%obuasi%', '%sunyani%', '%techiman%']) THEN 'Ashanti'
    WHEN city_name ILIKE ANY(ARRAY['%cape coast%', '%takoradi%', '%sekondi%', '%winneba%']) THEN 'Central'
    WHEN city_name ILIKE ANY(ARRAY['%ho%', '%keta%', '%hohoe%']) THEN 'Volta'
    WHEN city_name ILIKE ANY(ARRAY['%koforidua%', '%akosombo%']) THEN 'Eastern'
    WHEN city_name ILIKE ANY(ARRAY['%tamale%', '%yendi%', '%salaga%']) THEN 'Northern'
    WHEN city_name ILIKE ANY(ARRAY['%bolgatanga%', '%bawku%', '%navrongo%']) THEN 'Upper East'
    WHEN city_name ILIKE ANY(ARRAY['%wa%', '%lawra%', '%tumu%']) THEN 'Upper West'
    ELSE 'Other'
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Migration Complete - Ghana Edition
-- ============================================

-- To verify the migration was successful, run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%shipping%';
-- SELECT name, countries, regions, base_rate FROM shipping_zones ORDER BY base_rate;
-- SELECT name, code, phone_number FROM shipping_carriers WHERE is_active = true; 