drop table if EXISTS Flights;
create table Flights (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  plane VARCHAR(10) NOT NULL,
  startdate TIMESTAMP WITH TIME ZONE NOT NULL,
  enddate TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  flighttime INTEGER NOT NULL,
  raw JSONB NOT NULL
);

CREATE INDEX commands_plane_index ON Flights(plane);
CREATE INDEX commands_startdate_index ON Flights(startdate);
CREATE INDEX commands_enddate_index ON Flights(enddate);
CREATE INDEX commands_duration_index ON Flights(duration);
CREATE INDEX commands_flighttime_index ON Flights(flighttime);