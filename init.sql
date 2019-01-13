drop table if EXISTS Flights;
create table Flights (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  plane VARCHAR(10) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  armed_time INTEGER NOT NULL,
  flight_time INTEGER NOT NULL,
  segments JSONB NOT NULL
);

CREATE INDEX commands_plane_index ON Flights(plane);
CREATE INDEX commands_startdate_index ON Flights(start_date);
CREATE INDEX commands_enddate_index ON Flights(end_date);
CREATE INDEX commands_duration_index ON Flights(duration);
CREATE INDEX commands_flighttime_index ON Flights(flight_time);