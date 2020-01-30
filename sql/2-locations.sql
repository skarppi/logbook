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
    group by name

ALTER TABLE flights ADD COLUMN location integer REFERENCES locations(id);

comment on constraint "flights_location_fkey" on "flights" is
  E'@foreignFieldName locationById';

UPDATE flights set location = (select id from locations where name = notes->>'location');
SELECT f.notes->>'location' as name
    from flights f
    where CHAR_LENGTH( f.notes->>'location' ) > 0
    group by name