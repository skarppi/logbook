DROP VIEW IF EXISTS locations;
DROP VIEW IF EXISTS FLIGHTS_BY_YEAR;
DROP VIEW IF EXISTS FLIGHTS_BY_MONTH;
DROP VIEW IF EXISTS FLIGHTS_BY_DAY;
DROP VIEW IF EXISTS totals;
DROP FUNCTION IF EXISTS delete_battery_cycles_by_battery_id(battery_id integer);
DROP TABLE if EXISTS Battery_Cycles;

DROP TABLE if EXISTS Flights;
DROP TABLE if EXISTS Plane_Batteries;
DROP FUNCTION IF EXISTS update_plane_batteries(plane varchar(12), batteries varchar(64)[]);
DROP TYPE if EXISTS Battery_State;
DROP TABLE if EXISTS Batteries;
DROP TABLE if EXISTS Planes;
DROP TABLE if EXISTS LogicalSwitches;