ALTER TABLE Batteries ADD COLUMN retired_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE battery_cycles ADD COLUMN start_voltage DECIMAL(5,3);
ALTER TABLE battery_cycles ADD COLUMN end_voltage DECIMAL(5,3);
ALTER TABLE battery_cycles ADD COLUMN min_voltage DECIMAL(5,3);
