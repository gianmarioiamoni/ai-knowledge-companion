-- Marketplace Schema
-- Sprint 4: Marketplace features

-- Add marketplace-specific fields to tutors table
ALTER TABLE tutors 
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forks_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_tutor_id UUID REFERENCES tutors(id) ON DELETE SET NULL;

-- Create index for marketplace queries
CREATE INDEX IF NOT EXISTS idx_tutors_marketplace ON tutors(visibility) WHERE visibility = 'marketplace';
CREATE INDEX IF NOT EXISTS idx_tutors_category ON tutors(category) WHERE visibility = 'marketplace';
CREATE INDEX IF NOT EXISTS idx_tutors_featured ON tutors(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_tutors_rating ON tutors(rating_average DESC) WHERE visibility = 'marketplace';

-- Tutor reviews table
CREATE TABLE IF NOT EXISTS tutor_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(tutor_id, user_id)
);

-- Tutor forks tracking table
CREATE TABLE IF NOT EXISTS tutor_forks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  original_tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
  forked_tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate forks
  UNIQUE(original_tutor_id, forked_tutor_id)
);

-- Tutor views tracking (for analytics)
CREATE TABLE IF NOT EXISTS tutor_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_tutor_id ON tutor_reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_user_id ON tutor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_rating ON tutor_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tutor_forks_original ON tutor_forks(original_tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_forks_forked ON tutor_forks(forked_tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_forks_user ON tutor_forks(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_views_tutor_id ON tutor_views(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_views_created_at ON tutor_views(created_at DESC);

-- Row Level Security
ALTER TABLE tutor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_forks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutor_reviews
CREATE POLICY "Anyone can view published reviews" ON tutor_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tutors 
      WHERE tutors.id = tutor_reviews.tutor_id 
      AND tutors.visibility IN ('public', 'marketplace')
    )
  );

CREATE POLICY "Users can create reviews" ON tutor_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON tutor_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON tutor_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tutor_forks
CREATE POLICY "Anyone can view fork relationships" ON tutor_forks
  FOR SELECT USING (true);

CREATE POLICY "Service can create forks" ON tutor_forks
  FOR INSERT WITH CHECK (true);

-- RLS Policies for tutor_views
CREATE POLICY "Service can create views" ON tutor_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own view history" ON tutor_views
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update tutor rating average
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tutors
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM tutor_reviews
      WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM tutor_reviews
      WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
    )
  WHERE id = COALESCE(NEW.tutor_id, OLD.tutor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating when review is added/updated/deleted
DROP TRIGGER IF EXISTS trigger_update_tutor_rating ON tutor_reviews;
CREATE TRIGGER trigger_update_tutor_rating
  AFTER INSERT OR UPDATE OR DELETE ON tutor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_rating();

-- Function to update fork count
CREATE OR REPLACE FUNCTION update_tutor_forks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tutors
    SET forks_count = forks_count + 1
    WHERE id = NEW.original_tutor_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tutors
    SET forks_count = GREATEST(forks_count - 1, 0)
    WHERE id = OLD.original_tutor_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update forks count
DROP TRIGGER IF EXISTS trigger_update_tutor_forks_count ON tutor_forks;
CREATE TRIGGER trigger_update_tutor_forks_count
  AFTER INSERT OR DELETE ON tutor_forks
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_forks_count();

-- Function to get marketplace tutors with filters
CREATE OR REPLACE FUNCTION get_marketplace_tutors(
  p_category TEXT DEFAULT NULL,
  p_is_free BOOLEAN DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT 0.0,
  p_search TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[],
  price DECIMAL,
  is_free BOOLEAN,
  rating_average DECIMAL,
  reviews_count INTEGER,
  downloads_count INTEGER,
  forks_count INTEGER,
  featured BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  owner_display_name TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    t.id,
    t.owner_id,
    t.name,
    t.description,
    t.category,
    t.tags,
    t.price,
    t.is_free,
    t.rating_average,
    t.reviews_count,
    t.downloads_count,
    t.forks_count,
    t.featured,
    t.created_at,
    t.updated_at,
    p.display_name as owner_display_name
  FROM tutors t
  LEFT JOIN profiles p ON t.owner_id = p.id
  WHERE 
    t.visibility = 'marketplace'
    AND (p_category IS NULL OR t.category = p_category)
    AND (p_is_free IS NULL OR t.is_free = p_is_free)
    AND t.rating_average >= p_min_rating
    AND (
      p_search IS NULL 
      OR t.name ILIKE '%' || p_search || '%'
      OR t.description ILIKE '%' || p_search || '%'
      OR p_search = ANY(t.tags)
    )
  ORDER BY
    CASE WHEN p_sort_by = 'rating' THEN t.rating_average END DESC,
    CASE WHEN p_sort_by = 'downloads' THEN t.downloads_count END DESC,
    CASE WHEN p_sort_by = 'newest' THEN t.created_at END DESC,
    CASE WHEN p_sort_by = 'popular' THEN t.forks_count END DESC,
    t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Function to get tutor statistics
CREATE OR REPLACE FUNCTION get_tutor_stats(p_tutor_id UUID)
RETURNS TABLE (
  total_views BIGINT,
  unique_viewers BIGINT,
  total_forks BIGINT,
  total_reviews BIGINT,
  rating_distribution JSONB
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    (SELECT COUNT(*) FROM tutor_views WHERE tutor_id = p_tutor_id) as total_views,
    (SELECT COUNT(DISTINCT user_id) FROM tutor_views WHERE tutor_id = p_tutor_id AND user_id IS NOT NULL) as unique_viewers,
    (SELECT COUNT(*) FROM tutor_forks WHERE original_tutor_id = p_tutor_id) as total_forks,
    (SELECT COUNT(*) FROM tutor_reviews WHERE tutor_id = p_tutor_id) as total_reviews,
    (
      SELECT jsonb_build_object(
        'rating_5', COUNT(*) FILTER (WHERE rating = 5),
        'rating_4', COUNT(*) FILTER (WHERE rating = 4),
        'rating_3', COUNT(*) FILTER (WHERE rating = 3),
        'rating_2', COUNT(*) FILTER (WHERE rating = 2),
        'rating_1', COUNT(*) FILTER (WHERE rating = 1)
      )
      FROM tutor_reviews
      WHERE tutor_id = p_tutor_id
    ) as rating_distribution;
$$;

-- Add updated_at trigger for tutor_reviews
CREATE TRIGGER update_tutor_reviews_updated_at 
  BEFORE UPDATE ON tutor_reviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment review helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tutor_reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

