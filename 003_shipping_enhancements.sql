-- ============================================
-- Shipping Enhancements Migration
-- File: 003_shipping_enhancements.sql
-- Description: Add shipping tracking and carrier management features
-- ============================================

-- 1. Create shipping_carriers table for managing different shipping providers
CREATE TABLE IF NOT EXISTS shipping_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'ups', 'fedex', 'usps', 'dhl'
  tracking_url_template TEXT, -- Template with {tracking_number} placeholder
  api_endpoint TEXT, -- For tracking API integration
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default carriers
INSERT INTO shipping_carriers (name, code, tracking_url_template) VALUES
('UPS', 'ups', 'https://www.ups.com/track?track=yes&trackNums={tracking_number}'),
('FedEx', 'fedex', 'https://www.fedex.com/fedextrack/?trknbr={tracking_number}'),
('USPS', 'usps', 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking_number}'),
('DHL', 'dhl', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}'),
('Standard Shipping', 'standard', NULL);

-- 2. Create shipping_zones table for different shipping regions and pricing
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  countries TEXT[], -- Array of country codes
  states TEXT[], -- Array of state codes for domestic shipping
  base_rate DECIMAL(10,2) DEFAULT 0.00,
  rate_per_item DECIMAL(10,2) DEFAULT 0.00,
  free_shipping_threshold DECIMAL(10,2), -- Minimum order amount for free shipping
  estimated_delivery_days_min INTEGER,
  estimated_delivery_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default shipping zones
INSERT INTO shipping_zones (name, description, countries, base_rate, rate_per_item, free_shipping_threshold, estimated_delivery_days_min, estimated_delivery_days_max) VALUES
('Domestic US', 'United States domestic shipping', ARRAY['US'], 5.00, 1.00, 50.00, 3, 7),
('North America', 'Canada and Mexico', ARRAY['CA', 'MX'], 12.00, 2.00, 100.00, 7, 14),
('Europe', 'European Union and UK', ARRAY['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH'], 15.00, 3.00, 150.00, 10, 21),
('International', 'Rest of world', ARRAY[], 25.00, 5.00, 200.00, 14, 30);

-- 3. Add shipping-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS carrier_id UUID REFERENCES shipping_carriers(id),
ADD COLUMN IF NOT EXISTS shipping_zone_id UUID REFERENCES shipping_zones(id),
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS actual_delivery_date DATE,
ADD COLUMN IF NOT EXISTS shipping_notes TEXT,
ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracking_events JSONB DEFAULT '[]'::jsonb; -- Store tracking history

-- 4. Create tracking_events table for detailed tracking history
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'exception'
  status VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  carrier_event_id VARCHAR(100), -- Carrier's internal event ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create shipping_rates table for dynamic pricing based on weight/dimensions
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES shipping_carriers(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- 'standard', 'express', 'overnight'
  weight_min DECIMAL(8,2) DEFAULT 0.00, -- in pounds
  weight_max DECIMAL(8,2),
  dimension_length_max DECIMAL(8,2), -- in inches
  dimension_width_max DECIMAL(8,2),
  dimension_height_max DECIMAL(8,2),
  base_rate DECIMAL(10,2) NOT NULL,
  rate_per_pound DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create order_shipments table for orders that might be split into multiple shipments
CREATE TABLE IF NOT EXISTS order_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipment_number VARCHAR(50) NOT NULL, -- Auto-generated shipment number
  carrier_id UUID REFERENCES shipping_carriers(id),
  tracking_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'shipped', 'delivered', 'returned'
  items_included JSONB DEFAULT '[]'::jsonb, -- Which items from the order are in this shipment
  weight DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height, unit}
  shipping_cost DECIMAL(10,2),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_carrier_id ON orders(carrier_id);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_zone_id ON orders(shipping_zone_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_status_shipped_at ON orders(status, shipped_at);
CREATE INDEX IF NOT EXISTS idx_tracking_events_order_id ON tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_order_shipments_order_id ON order_shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_shipments_tracking_number ON order_shipments(tracking_number);

-- 8. Create functions for automatic order number and shipment number generation
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate shipment number in format: SHP-YYYYMMDD-XXXX
  NEW.shipment_number := 'SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(shipment_number FROM 14) AS INTEGER)), 0) + 1 
           FROM order_shipments 
           WHERE shipment_number LIKE 'SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%')::TEXT, 4, '0');
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
          AND status != 'delivered'
      );
  
  -- If any shipment is shipped, mark order as shipped (if not already)
  ELSIF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    UPDATE orders 
    SET status = 'shipped', shipped_at = COALESCE(shipped_at, NEW.shipped_at)
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

-- 13. Create view for order tracking summary
CREATE OR REPLACE VIEW order_tracking_summary AS
SELECT 
  o.id as order_id,
  o.order_number,
  o.status as order_status,
  o.tracking_number,
  o.shipped_at,
  o.delivered_at,
  sc.name as carrier_name,
  sc.code as carrier_code,
  sc.tracking_url_template,
  sz.name as shipping_zone,
  sz.estimated_delivery_days_min,
  sz.estimated_delivery_days_max,
  COUNT(os.id) as shipment_count,
  COUNT(CASE WHEN os.status = 'delivered' THEN 1 END) as delivered_shipments
FROM orders o
LEFT JOIN shipping_carriers sc ON o.carrier_id = sc.id
LEFT JOIN shipping_zones sz ON o.shipping_zone_id = sz.id
LEFT JOIN order_shipments os ON o.id = os.order_id
GROUP BY o.id, sc.name, sc.code, sc.tracking_url_template, sz.name, 
         sz.estimated_delivery_days_min, sz.estimated_delivery_days_max;

-- 14. Create function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_shipping_country TEXT,
  p_shipping_state TEXT,
  p_total_amount DECIMAL(10,2),
  p_weight DECIMAL(8,2) DEFAULT 0.1,
  p_service_type TEXT DEFAULT 'standard'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_zone_id UUID;
  v_base_rate DECIMAL(10,2);
  v_rate_per_item DECIMAL(10,2);
  v_free_threshold DECIMAL(10,2);
  v_shipping_cost DECIMAL(10,2);
BEGIN
  -- Find matching shipping zone
  SELECT id, base_rate, rate_per_item, free_shipping_threshold
  INTO v_zone_id, v_base_rate, v_rate_per_item, v_free_threshold
  FROM shipping_zones
  WHERE (p_shipping_country = ANY(countries) OR countries = '{}')
    AND (p_shipping_state = ANY(states) OR states = '{}' OR states IS NULL)
    AND is_active = true
  ORDER BY 
    CASE WHEN p_shipping_country = ANY(countries) THEN 1 ELSE 2 END,
    CASE WHEN p_shipping_state = ANY(states) THEN 1 ELSE 2 END
  LIMIT 1;
  
  -- If no zone found, use international rate
  IF v_zone_id IS NULL THEN
    SELECT id, base_rate, rate_per_item, free_shipping_threshold
    INTO v_zone_id, v_base_rate, v_rate_per_item, v_free_threshold
    FROM shipping_zones
    WHERE countries = '{}' AND is_active = true
    LIMIT 1;
  END IF;
  
  -- Calculate shipping cost
  IF p_total_amount >= v_free_threshold THEN
    v_shipping_cost := 0.00;
  ELSE
    v_shipping_cost := v_base_rate + (v_rate_per_item * p_weight);
  END IF;
  
  RETURN COALESCE(v_shipping_cost, 5.00); -- Default fallback
END;
$$ LANGUAGE plpgsql;

-- 15. Update existing orders to have default shipping zone
UPDATE orders SET shipping_zone_id = (
  SELECT id FROM shipping_zones WHERE name = 'Domestic US' LIMIT 1
) WHERE shipping_zone_id IS NULL AND shipping_country = 'United States';

UPDATE orders SET shipping_zone_id = (
  SELECT id FROM shipping_zones WHERE name = 'International' LIMIT 1
) WHERE shipping_zone_id IS NULL;

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

-- ============================================
-- Migration Complete
-- ============================================

-- To verify the migration was successful, run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%shipping%';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name LIKE '%carrier%' OR column_name LIKE '%shipping%'; 