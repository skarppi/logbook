create extension if not exists cube;
create extension if not exists earthdistance;

DROP VIEW LOCATIONS;

CREATE TABLE LOCATIONS (
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  latitude float8,
  longitude float8
);

insert into LOCATIONS (name)
SELECT f.notes->>'location' as name
    from flights f
    where CHAR_LENGTH( f.notes->>'location' ) > 0
    group by name;

ALTER TABLE flights ADD COLUMN location_id integer REFERENCES locations(id);

UPDATE flights set location_id = (select id from locations where name = notes->>'location');
SELECT f.notes->>'location' as name
    from flights f
    where CHAR_LENGTH( f.notes->>'location' ) > 0
    group by name;

CREATE OR REPLACE FUNCTION locations_by_coordinate(lat float8 default null, lon float8 default null) RETURNS table (
  id integer,
  name VARCHAR(64),
  latitude float8,
  longitude float8,
  distance integer
) AS $$
  select a.id, a.name, a.latitude::float8, a.longitude::float8,
  	((point(a.longitude, a.latitude)<@>POINT(lon, lat)) * 1609.344)::integer as distance
  from locations a
  order by distance, a.name;
$$ LANGUAGE sql STABLE;