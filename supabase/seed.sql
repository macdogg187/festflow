-- Seed data for Kilby Block Party 2026

-- Insert festival
INSERT INTO festivals (id, name, slug, location, start_date, end_date, map_url)
VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Kilby Block Party',
  'kilby-block-party-2026',
  'Utah State Fairpark, Salt Lake City',
  '2026-05-15',
  '2026-05-17',
  'https://kilbyblockparty.com/map'
);

-- Friday Sets - May 15
INSERT INTO sets (id, festival_id, artist_name, stage, day, start_time, end_time) VALUES
  ('s00001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Lorde', 'Main Stage', '2026-05-15', '20:30', '22:00'),
  ('s00002', 'a1b2c3d4-0001-4000-8000-000000000001', 'Alvvays', 'Main Stage', '2026-05-15', '18:30', '19:30'),
  ('s00003', 'a1b2c3d4-0001-4000-8000-000000000001', 'Japanese Breakfast', 'Second Stage', '2026-05-15', '17:00', '18:00'),
  ('s00004', 'a1b2c3d4-0001-4000-8000-000000000001', 'Snail Mail', 'Second Stage', '2026-05-15', '15:30', '16:30'),
  ('s00005', 'a1b2c3d4-0001-4000-8000-000000000001', 'Makthaverskan', 'Main Stage', '2026-05-15', '14:00', '14:45'),
  ('s00006', 'a1b2c3d4-0001-4000-8000-000000000001', 'Drinks', 'Second Stage', '2026-05-15', '19:45', '20:45');

-- Saturday Sets - May 16
INSERT INTO sets (id, festival_id, artist_name, stage, day, start_time, end_time) VALUES
  ('s00007', 'a1b2c3d4-0001-4000-8000-000000000001', 'The xx', 'Main Stage', '2026-05-16', '20:30', '22:00'),
  ('s00008', 'a1b2c3d4-0001-4000-8000-000000000001', 'Beach House', 'Main Stage', '2026-05-16', '18:30', '19:30'),
  ('s00009', 'a1b2c3d4-0001-4000-8000-000000000001', 'Mitski', 'Second Stage', '2026-05-16', '17:00', '18:00'),
  ('s00010', 'a1b2c3d4-0001-4000-8000-000000000001', 'Slowdive', 'Second Stage', '2026-05-16', '15:30', '16:30'),
  ('s00011', 'a1b2c3d4-0001-4000-8000-000000000001', 'Turnover', 'Main Stage', '2026-05-16', '14:00', '14:45'),
  ('s00012', 'a1b2c3d4-0001-4000-8000-000000000001', 'Hatchie', 'Second Stage', '2026-05-16', '19:45', '20:45');

-- Sunday Sets - May 17
INSERT INTO sets (id, festival_id, artist_name, stage, day, start_time, end_time) VALUES
  ('s00013', 'a1b2c3d4-0001-4000-8000-000000000001', 'Hayley Williams', 'Main Stage', '2026-05-17', '20:30', '22:00'),
  ('s00014', 'a1b2c3d4-0001-4000-8000-000000000001', 'Paramore', 'Main Stage', '2026-05-17', '18:30', '19:30'),
  ('s00015', 'a1b2c3d4-0001-4000-8000-000000000001', 'Phoebe Bridgers', 'Second Stage', '2026-05-17', '17:00', '18:00'),
  ('s00016', 'a1b2c3d4-0001-4000-8000-000000000001', 'Julien Baker', 'Second Stage', '2026-05-17', '15:30', '16:30'),
  ('s00017', 'a1b2c3d4-0001-4000-8000-000000000001', 'Lucy Dacus', 'Main Stage', '2026-05-17', '14:00', '14:45'),
  ('s00018', 'a1b2c3d4-0001-4000-8000-000000000001', 'Boygenius', 'Second Stage', '2026-05-17', '19:45', '20:45');
