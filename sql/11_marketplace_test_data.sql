-- Marketplace Test Data
-- Script per popolare il marketplace con tutors di test

-- Prima assicurati che tutti gli owner abbiano un profilo
INSERT INTO profiles (id, display_name, bio)
SELECT 
  t.owner_id,
  'Demo User ' || substring(t.owner_id::text, 1, 8),
  'Demo user profile'
FROM tutors t
WHERE t.owner_id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Aggiorna i tutors esistenti per renderli marketplace-ready
UPDATE tutors
SET 
  visibility = 'marketplace',
  category = CASE 
    WHEN random() < 0.3 THEN 'programming'
    WHEN random() < 0.5 THEN 'languages'
    WHEN random() < 0.7 THEN 'mathematics'
    ELSE 'science'
  END,
  is_free = CASE WHEN random() < 0.7 THEN true ELSE false END,
  price = CASE WHEN random() < 0.7 THEN 0.00 ELSE (random() * 50)::decimal(10,2) END,
  featured = CASE WHEN random() < 0.2 THEN true ELSE false END,
  tags = ARRAY['AI', 'Learning', 'Tutorial']::text[],
  rating_average = (random() * 2 + 3)::decimal(3,2), -- Random between 3.0 and 5.0
  reviews_count = (random() * 20)::integer,
  downloads_count = (random() * 100)::integer,
  forks_count = (random() * 50)::integer
WHERE id IN (
  SELECT id FROM tutors LIMIT 5  -- Aggiorna i primi 5 tutors
);

-- Aggiungi alcune recensioni di esempio (opzionale)
-- Prima crea un utente di test se non esiste
DO $$
DECLARE
  test_user_id uuid;
  test_tutor_id uuid;
BEGIN
  -- Prendi il primo tutor marketplace
  SELECT id INTO test_tutor_id 
  FROM tutors 
  WHERE visibility = 'marketplace' 
  LIMIT 1;
  
  -- Prendi il primo utente
  SELECT id INTO test_user_id 
  FROM auth.users 
  LIMIT 1;
  
  -- Aggiungi una recensione di esempio
  IF test_tutor_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    INSERT INTO tutor_reviews (tutor_id, user_id, rating, review_text)
    VALUES 
      (test_tutor_id, test_user_id, 5, 'Excellent tutor! Very helpful and knowledgeable.'),
      (test_tutor_id, test_user_id, 4, 'Great experience, learned a lot!')
    ON CONFLICT (tutor_id, user_id) DO NOTHING;
  END IF;
END $$;

-- Verifica i risultati
SELECT 
  id,
  name,
  visibility,
  category,
  is_free,
  price,
  rating_average,
  reviews_count,
  forks_count,
  featured
FROM tutors
WHERE visibility = 'marketplace';

