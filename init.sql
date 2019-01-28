drop table if EXISTS Flights;
create table Flights (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  plane VARCHAR(10) NOT NULL,
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

drop table if EXISTS Batteries;
create table Batteries (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(64) NOT NULL,
  cells INTEGER NOT NULL,
  capacity INTEGER NOT NULL
);


CREATE INDEX batteries_battery_index ON BatteryCycles(battery_id);
CREATE INDEX batteries_date_index ON BatteryCycles(date);
CREATE INDEX batteries_flight_index ON BatteryCycles(flight_id);

DROP TYPE BatteryState;
CREATE TYPE BatteryState AS ENUM ('discharged', 'storage', 'charged');

drop table if EXISTS BatteryCycles;
create table BatteryCycles (
  id SERIAL NOT NULL PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  battery_id VARCHAR(64) NOT NULL REFERENCES Batteries(id),
  state BatteryState NOT NULL,
  flight_id VARCHAR(64) REFERENCES Flights(id),
  voltage DECIMAL(5,3),
  discharged INTEGER,
  charged INTEGER,
  UNIQUE (date, battery_id),
  UNIQUE (battery_id, flight_id)
);

CREATE INDEX batteries_battery_index ON BatteryCycles(battery_id);
CREATE INDEX batteries_date_index ON BatteryCycles(date);
CREATE INDEX batteries_flight_index ON BatteryCycles(flight_id);