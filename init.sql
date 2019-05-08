DROP TABLE if EXISTS Flights;
CREATE TABLE Flights (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  plane VARCHAR(10) NOT NULL,
  session INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  armed_time INTEGER NOT NULL,
  flight_time INTEGER NOT NULL,
  notes JSONB,
  segments JSONB NOT NULL
);

CREATE INDEX flights_plane_index ON Flights(plane);
CREATE INDEX flights_startdate_index ON Flights(start_date);
CREATE INDEX flights_enddate_index ON Flights(end_date);
CREATE INDEX flights_duration_index ON Flights(duration);
CREATE INDEX flights_flighttime_index ON Flights(flight_time);

DROP TABLE if EXISTS Batteries;
CREATE TABLE Batteries (
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(64) NOT NULL,
  cells INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  UNIQUE(name)
);


CREATE INDEX batteries_battery_index ON Batteries(id);

DROP TYPE if EXISTS Battery_State;
CREATE TYPE Battery_State AS ENUM ('discharged', 'storage', 'charged');

DROP TABLE if EXISTS Battery_Cycles;
CREATE TABLE Battery_Cycles (
  id SERIAL NOT NULL PRIMARY KEY,
  DATE TIMESTAMP WITH TIME ZONE NOT NULL,
  battery_name VARCHAR(64) NOT NULL REFERENCES Batteries(name),
  state Battery_State NOT NULL,
  flight_id VARCHAR(64) REFERENCES Flights(id),
  voltage DECIMAL(5,3),
  discharged INTEGER,
  charged INTEGER,
  resistance JSONB,
  UNIQUE (date, battery_name),
  UNIQUE (battery_name, flight_id)
);

CREATE INDEX battery_cycles_battery_index ON Battery_Cycles(battery_name);
CREATE INDEX batter_cycles_date_index ON Battery_Cycles(date);
CREATE INDEX batter_cycles_flight_index ON Battery_Cycles(flight_id);

-- battery cycle deletion

CREATE FUNCTION delete_battery_cycles_by_battery_id(battery_id integer) RETURNS batteries AS $$
  delete from battery_cycles where battery_name = (select name from batteries where id = delete_battery_cycles_by_battery_id.battery_id);
  delete from batteries where id = delete_battery_cycles_by_battery_id.battery_id returning *;
$$ LANGUAGE sql VOLATILE;

-- dashboard views

DROP VIEW totals;
CREATE VIEW totals as
    SELECT plane, CAST(count(*) as integer)  as flights, CAST(sum(flight_time) as integer) as total_time
    FROM flights
    group by plane;

DROP VIEW FLIGHTS_BY_DAY;
CREATE VIEW FLIGHTS_BY_DAY as
SELECT to_char(start_date, 'YYYY-MM-DD') as date,
          plane,
          cast(sum(flight_time) as integer) as total_time, 
          cast(count(*) as integer) as flights 
      FROM flights 
      GROUP BY 1,2 
      ORDER BY date;

DROP VIEW FLIGHTS_BY_MONTH;
CREATE VIEW FLIGHTS_BY_MONTH as
SELECT to_char(start_date, 'YYYY-MM-01') as date,
          plane,
          cast(sum(flight_time) as integer) as total_time, 
          cast(count(*) as integer) as flights 
      FROM flights 
      GROUP BY 1,2 
      ORDER BY date;

DROP VIEW FLIGHTS_BY_YEAR;
CREATE VIEW FLIGHTS_BY_YEAR as
SELECT to_char(start_date, 'YYYY-01-01') as date,
          plane,
          cast(sum(flight_time) as integer) as total_time, 
          cast(count(*) as integer) as flights 
      FROM flights 
      GROUP BY 1,2 
      ORDER BY date;