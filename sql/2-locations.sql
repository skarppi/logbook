DROP VIEW LOCATIONS;

CREATE TABLE LOCATIONS (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  coordinates point
);

CREATE INDEX flights_notes_location_index ON flights USING BTREE ((notes->>'location'));

-- https://stackoverflow.com/questions/43998658/errorcould-not-identify-an-equality-operator-for-type-point
CREATE OR REPLACE FUNCTION public.hashpoint(point) RETURNS integer
   LANGUAGE sql IMMUTABLE
   AS 'SELECT hashfloat8($1[0]) # hashfloat8($1[1])';
CREATE OPERATOR CLASS public.point_hash_ops DEFAULT FOR TYPE point USING hash AS
   OPERATOR 1 ~=(point,point),
   FUNCTION 1 public.hashpoint(point);

CREATE VIEW FLIGHT_LOCATIONS as
  SELECT COALESCE(l.id, f.notes->>'location') as location , l.coordinate[0] as latitude, l.coordinate[1] as longitude, count(f.*) as flights
    from flights f
    full outer join locations l on l.id = f.notes->>'location'
    where CHAR_LENGTH( f.notes->>'location') > 0 or l.id is not null
    group by location, l.id, latitude, longitude
    order by location;


