-- Fix Order Number Generation to Prevent Duplicates
-- Run this in your Supabase SQL Editor

-- Drop and recreate the order number generation function with better uniqueness
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    timestamp_part TEXT;
    random_part TEXT;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate timestamp part with microseconds for uniqueness
        timestamp_part := TO_CHAR(NOW(), 'YYYYMMDDHH24MISSUS');
        
        -- Generate random 4-digit suffix for additional uniqueness
        random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Format: ORD-YYYYMMDDHHMISSUS-RRRR (timestamp with microseconds + 4 digit random)
        order_num := 'ORD-' || timestamp_part || '-' || random_part;
        
        -- Check if this order number already exists
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_num) THEN
            RETURN order_num;
        END IF;
        
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique order number after % attempts', max_attempts;
        END IF;
        
        -- Small delay to prevent rapid regeneration
        PERFORM pg_sleep(0.001);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Verify the function works by testing it
SELECT generate_order_number() AS test_order_number; 