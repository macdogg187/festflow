-- Kilby Block Party 2026 — official lineup (Fri May 15 – Sun May 17, 2026)
-- Source: official schedule images for the 2026 edition (4 stages).
-- Times converted to 24h. Pre-noon slots (11:45) start as 11:45 AM; all later
-- slots are PM and converted to 24h accordingly.

INSERT INTO festivals (id, name, slug, location, start_date, end_date, map_url)
VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Kilby Block Party',
  'kilby-block-party-2026',
  'Utah State Fairpark, Salt Lake City',
  '2026-05-15',
  '2026-05-17',
  'https://kilbyblockparty.com/map'
)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      location = EXCLUDED.location,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      map_url = EXCLUDED.map_url;

-- Clear any prior-year / placeholder sets for this festival before reseeding.
DELETE FROM sets WHERE festival_id = 'a1b2c3d4-0001-4000-8000-000000000001';

-- =========================
-- Friday, May 15, 2026
-- =========================
INSERT INTO sets (festival_id, artist_name, stage, day, start_time, end_time) VALUES
  -- Kilby Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Gelli Haha',          'Kilby Stage',    '2026-05-15', '12:15', '12:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Newdad',              'Kilby Stage',    '2026-05-15', '13:30', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ritt Momney',         'Kilby Stage',    '2026-05-15', '15:00', '15:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Beach Bunny',         'Kilby Stage',    '2026-05-15', '16:50', '17:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Japanese Breakfast',  'Kilby Stage',    '2026-05-15', '18:50', '19:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Turnstile',           'Kilby Stage',    '2026-05-15', '21:00', '22:15'),
  -- Desert Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Gonk',                'Desert Stage',   '2026-05-15', '11:45', '12:10'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Hotline TNT',         'Desert Stage',   '2026-05-15', '12:50', '13:20'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Die Spitz',           'Desert Stage',   '2026-05-15', '14:10', '14:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Drugdealer',          'Desert Stage',   '2026-05-15', '15:55', '16:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Chanel Beads',        'Desert Stage',   '2026-05-15', '17:45', '18:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Sports',              'Desert Stage',   '2026-05-15', '19:55', '20:55'),
  -- Lake Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dad Bod',             'Lake Stage',     '2026-05-15', '11:45', '12:10'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Wombo',               'Lake Stage',     '2026-05-15', '12:50', '13:20'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dry Cleaning',        'Lake Stage',     '2026-05-15', '14:10', '14:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Snail Mail',          'Lake Stage',     '2026-05-15', '15:55', '16:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Father John Misty',   'Lake Stage',     '2026-05-15', '17:45', '18:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Modest Mouse',        'Lake Stage',     '2026-05-15', '19:55', '20:55'),
  -- Mountain Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Nadezhda',            'Mountain Stage', '2026-05-15', '12:15', '12:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Provoker',            'Mountain Stage', '2026-05-15', '13:30', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Show Me The Body',    'Mountain Stage', '2026-05-15', '15:00', '15:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Kevin Morby',         'Mountain Stage', '2026-05-15', '16:50', '17:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Pattie Gonia',        'Mountain Stage', '2026-05-15', '18:50', '19:50');

-- =========================
-- Saturday, May 16, 2026
-- =========================
INSERT INTO sets (festival_id, artist_name, stage, day, start_time, end_time) VALUES
  -- Kilby Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Cardinals',                  'Kilby Stage',    '2026-05-16', '12:15', '12:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Feeble Little Horse',        'Kilby Stage',    '2026-05-16', '13:30', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Clap Your Hands Say Yeah',   'Kilby Stage',    '2026-05-16', '15:00', '15:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Briston Maroney',            'Kilby Stage',    '2026-05-16', '16:50', '17:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Lucy Dacus',                 'Kilby Stage',    '2026-05-16', '18:50', '19:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'The xx',                     'Kilby Stage',    '2026-05-16', '21:00', '22:15'),
  -- Desert Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Chalk (SLC)',                'Desert Stage',   '2026-05-16', '11:45', '12:10'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'The Kilans',                 'Desert Stage',   '2026-05-16', '12:50', '13:20'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Automatic',                  'Desert Stage',   '2026-05-16', '14:10', '14:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ben Kweller',                'Desert Stage',   '2026-05-16', '15:55', '16:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Caroline',                   'Desert Stage',   '2026-05-16', '17:45', '18:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Quadeca',                    'Desert Stage',   '2026-05-16', '19:55', '20:55'),
  -- Lake Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Wilbere',                    'Lake Stage',     '2026-05-16', '11:45', '12:10'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'YHWH Nailgun',               'Lake Stage',     '2026-05-16', '12:50', '13:20'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Lyn Lapid',                  'Lake Stage',     '2026-05-16', '14:10', '14:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Between Friends',            'Lake Stage',     '2026-05-16', '15:55', '16:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'The Last Dinner Party',      'Lake Stage',     '2026-05-16', '17:45', '18:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Alex G',                     'Lake Stage',     '2026-05-16', '19:55', '20:55'),
  -- Mountain Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Jill Whit',                  'Mountain Stage', '2026-05-16', '12:15', '12:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Fightmaster',                'Mountain Stage', '2026-05-16', '13:30', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Jane Remover',               'Mountain Stage', '2026-05-16', '15:00', '15:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dehd',                       'Mountain Stage', '2026-05-16', '16:50', '17:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'The Moss',                   'Mountain Stage', '2026-05-16', '18:50', '19:50');

-- =========================
-- Sunday, May 17, 2026
-- =========================
INSERT INTO sets (festival_id, artist_name, stage, day, start_time, end_time) VALUES
  -- Kilby Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Folk Bitch Trio',                'Kilby Stage',    '2026-05-17', '12:15', '12:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Hannah Cohen',                   'Kilby Stage',    '2026-05-17', '13:30', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Melody''s Echo Chamber',         'Kilby Stage',    '2026-05-17', '15:00', '15:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Flipturn',                       'Kilby Stage',    '2026-05-17', '16:50', '17:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Hayley Williams',                'Kilby Stage',    '2026-05-17', '18:50', '19:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Lorde',                          'Kilby Stage',    '2026-05-17', '21:00', '22:30'),
  -- Desert Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Bad Luck Brigade',               'Desert Stage',   '2026-05-17', '11:45', '12:10'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Old Mervs',                      'Desert Stage',   '2026-05-17', '12:50', '13:20'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Glom',                           'Desert Stage',   '2026-05-17', '14:10', '14:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Freak Slug',                     'Desert Stage',   '2026-05-17', '15:55', '16:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Kennyhoopla',                    'Desert Stage',   '2026-05-17', '17:45', '18:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Ethan Regan',                    'Desert Stage',   '2026-05-17', '19:55', '20:55'),
  -- Lake Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Rachael Jenkins',                'Lake Stage',     '2026-05-17', '11:45', '12:10'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Mustard Service',                'Lake Stage',     '2026-05-17', '12:50', '13:20'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Smerz',                          'Lake Stage',     '2026-05-17', '14:10', '14:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Grandaddy',                      'Lake Stage',     '2026-05-17', '15:55', '16:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Magdalena Bay',                  'Lake Stage',     '2026-05-17', '17:45', '18:45'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Blood Orange',                   'Lake Stage',     '2026-05-17', '19:55', '20:55'),
  -- Mountain Stage
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Starr67',                        'Mountain Stage', '2026-05-17', '12:15', '12:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'This Is Lorelei',                'Mountain Stage', '2026-05-17', '13:30', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Tops',                           'Mountain Stage', '2026-05-17', '15:00', '15:50'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'American Football',              'Mountain Stage', '2026-05-17', '16:50', '17:40'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Wild Nothing (Playing Gemini)',  'Mountain Stage', '2026-05-17', '18:50', '19:50');
