-- Verifica stato del marketplace

-- 1. Conta tutors per visibility
SELECT 
  visibility, 
  COUNT(*) as count
FROM tutors
GROUP BY visibility;

-- 2. Verifica tutors marketplace
SELECT 
  id,
  name,
  owner_id,
  visibility,
  category,
  is_free,
  price,
  rating_average,
  featured,
  created_at
FROM tutors
WHERE visibility = 'marketplace';

-- 3. Verifica se ci sono tutors in generale
SELECT 
  id,
  name,
  visibility
FROM tutors
LIMIT 5;

-- 4. Verifica profiles per gli owner
SELECT 
  t.id as tutor_id,
  t.name as tutor_name,
  t.owner_id,
  p.display_name
FROM tutors t
LEFT JOIN profiles p ON t.owner_id = p.id
WHERE t.visibility = 'marketplace';

