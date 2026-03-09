--- Run this command in your Supabase SQL Editor ---

CREATE TABLE IF NOT EXISTS public.delivery (
    id TEXT PRIMARY KEY,
    customer_gstin_no TEXT,
    invoice_no TEXT,
    invoice_date DATE,
    dealer_parent_code TEXT,
    dealer_location_code TEXT,
    dealer_name TEXT,
    sc_code TEXT,
    sc_name TEXT,
    team_lead TEXT,
    invoice_status TEXT,
    initial_promised_delivery_date DATE,
    delivery_date DATE,
    delivery_note_number TEXT,
    delivery_note_cancelled_reason TEXT,
    delivery_note_cancelled_date DATE,
    delivery_note_remarks TEXT,
    delivery_delay_reason_remarks TEXT,
    chassis_no TEXT,
    engine_no TEXT,
    registration_number TEXT,
    key_number TEXT,
    model_group TEXT,
    model TEXT,
    model_variant TEXT,
    seating TEXT,
    color TEXT,
    model_code TEXT,
    demo_vehicle TEXT,
    customer_type TEXT,
    customer_id TEXT,
    customer_name TEXT,
    address TEXT,
    pin_code TEXT,
    locality TEXT,
    city TEXT,
    tehsil TEXT,
    district TEXT,
    mitra_type TEXT,
    mitra_id TEXT,
    mitra_name TEXT,
    shield_scheme_reg_id TEXT,
    shield_scheme_type TEXT,
    shield_scheme_reg_date DATE,
    shield_scheme_employee_name TEXT,
    rsa_scheme_reg_id TEXT,
    rsa_scheme_type TEXT,
    rsa_scheme_reg_date DATE,
    rsa_scheme_employee_name TEXT,
    amc_scheme_reg_id TEXT,
    amc_scheme_type TEXT,
    amc_scheme_reg_date DATE,
    amc_scheme_employee_name TEXT,
    insurance_company TEXT,
    insurance_cover_note_no TEXT,
    insurance_cover_note_date DATE,
    insurance_note_type TEXT,
    financier TEXT,
    financier_branch TEXT,
    finance_amount NUMERIC,
    pdi_done_indicator TEXT,
    bndp_discount_amount NUMERIC,
    bndp_discount_type TEXT,
    bndp_applicable TEXT,
    kyc_applicable TEXT,
    kyc_status TEXT,
    cloud_platform TEXT,
    api_status TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security
ALTER TABLE public.delivery ENABLE ROW LEVEL SECURITY;

-- Create basic security policies (Allow authenticated users to read/insert)
CREATE POLICY "Enable read access for authenticated users" 
ON public.delivery FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON public.delivery FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON public.delivery FOR UPDATE
TO authenticated 
USING (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON public.delivery FOR DELETE
TO authenticated 
USING (true);
