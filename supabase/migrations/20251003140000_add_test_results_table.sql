-- Create test_results table for storing AI-extracted PDF data
CREATE TABLE IF NOT EXISTS test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_number VARCHAR(50),
    order_number VARCHAR(50),
    test_date DATE,
    concrete_grade VARCHAR(20),
    test_age INTEGER,
    compressive_strength DECIMAL(5,2),
    target_strength DECIMAL(5,2),
    slump_value DECIMAL(5,2),
    air_content DECIMAL(4,2),
    test_type VARCHAR(20) CHECK (test_type IN ('Cube', 'Cylinder', 'Slump', 'Air Content')),
    technician VARCHAR(100),
    lab_name VARCHAR(100),
    sample_location VARCHAR(200),
    certification_number VARCHAR(50),
    confidence_score DECIMAL(5,2),
    source_document VARCHAR(255),
    extracted_text TEXT,
    status VARCHAR(20) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_test_results_batch_number ON test_results(batch_number);
CREATE INDEX IF NOT EXISTS idx_test_results_order_number ON test_results(order_number);
CREATE INDEX IF NOT EXISTS idx_test_results_test_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
CREATE INDEX IF NOT EXISTS idx_test_results_confidence ON test_results(confidence_score);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_test_results_updated_at 
    BEFORE UPDATE ON test_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read test_results" 
    ON test_results FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to insert test_results" 
    ON test_results FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow users to update their own test_results" 
    ON test_results FOR UPDATE 
    TO authenticated 
    USING (created_by = auth.uid());

-- Create view for aggregated test statistics
CREATE OR REPLACE VIEW test_results_summary AS
SELECT 
    DATE_TRUNC('month', test_date) as month,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE compressive_strength >= target_strength) as passed_tests,
    ROUND(
        (COUNT(*) FILTER (WHERE compressive_strength >= target_strength)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as pass_rate,
    AVG(compressive_strength) as avg_strength,
    AVG(confidence_score) as avg_confidence,
    COUNT(*) FILTER (WHERE status = 'verified') as verified_tests,
    COUNT(*) FILTER (WHERE status = 'pending_review') as pending_tests
FROM test_results 
WHERE test_date IS NOT NULL
GROUP BY DATE_TRUNC('month', test_date)
ORDER BY month DESC;

-- Grant permissions on the view
GRANT SELECT ON test_results_summary TO authenticated;

-- Create function to validate test data
CREATE OR REPLACE FUNCTION validate_test_result(
    p_compressive_strength DECIMAL,
    p_target_strength DECIMAL,
    p_test_age INTEGER,
    p_concrete_grade VARCHAR
) RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    is_valid BOOLEAN := true;
    warnings TEXT[] := '{}';
BEGIN
    -- Check if strength meets target
    IF p_compressive_strength < p_target_strength THEN
        is_valid := false;
        warnings := array_append(warnings, 'Compressive strength below target');
    END IF;
    
    -- Check if test age is standard
    IF p_test_age NOT IN (7, 28, 56, 90) THEN
        warnings := array_append(warnings, 'Non-standard test age');
    END IF;
    
    -- Check if strength is reasonable for grade
    IF p_concrete_grade IS NOT NULL THEN
        DECLARE
            expected_strength INTEGER;
        BEGIN
            expected_strength := CAST(REGEXP_REPLACE(p_concrete_grade, '[^0-9]', '', 'g') AS INTEGER);
            IF p_compressive_strength < expected_strength * 0.8 OR p_compressive_strength > expected_strength * 1.5 THEN
                warnings := array_append(warnings, 'Strength significantly different from grade specification');
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if grade format is unexpected
            NULL;
        END;
    END IF;
    
    result := jsonb_build_object(
        'is_valid', is_valid,
        'warnings', warnings,
        'recommendation', CASE 
            WHEN is_valid THEN 'Test result appears normal'
            ELSE 'Review required - potential quality issue'
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on validation function
GRANT EXECUTE ON FUNCTION validate_test_result TO authenticated;

-- Insert some sample data for testing
INSERT INTO test_results (
    batch_number, order_number, test_date, concrete_grade, test_age,
    compressive_strength, target_strength, test_type, technician,
    confidence_score, source_document, status
) VALUES 
    ('BAT-2025-001', 'ORD-001', '2025-10-01', '25MPa', 28, 28.5, 25.0, 'Cube', 'John Smith', 95.0, 'test_cert_001.pdf', 'verified'),
    ('BAT-2025-002', 'ORD-002', '2025-10-02', '30MPa', 7, 22.1, 21.0, 'Cube', 'Sarah Wilson', 88.5, 'test_cert_002.pdf', 'verified'),
    ('BAT-2025-003', 'ORD-003', '2025-10-03', '35MPa', 28, 32.8, 35.0, 'Cube', 'Mike Johnson', 92.0, 'test_cert_003.pdf', 'pending_review');