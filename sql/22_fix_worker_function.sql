-- =====================================================
-- Fix ALL Processing Functions - Add SECURITY DEFINER
-- This allows the functions to bypass RLS policies
-- Required for background workers to access the queue
-- =====================================================

-- =====================================================
-- 1. Fix queue_multimedia_processing
-- =====================================================

DROP FUNCTION IF EXISTS queue_multimedia_processing(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION queue_multimedia_processing(
  p_document_id UUID,
  p_user_id UUID,
  p_media_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  -- Insert into processing queue
  INSERT INTO media_processing_queue (
    document_id,
    user_id,
    media_type,
    status,
    created_at
  ) VALUES (
    p_document_id,
    p_user_id,
    p_media_type,
    'queued',
    NOW()
  )
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION queue_multimedia_processing IS 
  'Queue a multimedia file for asynchronous processing - runs with elevated permissions';

-- =====================================================
-- 2. Fix update_processing_status
-- =====================================================

DROP FUNCTION IF EXISTS update_processing_status(UUID, TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION update_processing_status(
  p_queue_id UUID,
  p_status TEXT,
  p_progress INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE media_processing_queue
  SET 
    status = p_status,
    progress_percent = COALESCE(p_progress, progress_percent),
    error_message = p_error_message,
    processing_started_at = CASE 
      WHEN p_status = 'processing' AND processing_started_at IS NULL 
      THEN NOW() 
      ELSE processing_started_at 
    END,
    processing_completed_at = CASE 
      WHEN p_status IN ('completed', 'failed', 'cancelled') 
      THEN NOW() 
      ELSE processing_completed_at 
    END
  WHERE id = p_queue_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_processing_status IS 
  'Update the status and progress of a processing job - runs with elevated permissions';

-- =====================================================
-- 3. Fix get_next_processing_job
-- =====================================================

DROP FUNCTION IF EXISTS get_next_processing_job();

CREATE OR REPLACE FUNCTION get_next_processing_job()
RETURNS TABLE (
  queue_id UUID,
  document_id UUID,
  user_id UUID,
  media_type TEXT,
  storage_path TEXT,
  retry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mpq.id,
    mpq.document_id,
    mpq.user_id,
    mpq.media_type,
    d.storage_path,
    mpq.retry_count
  FROM media_processing_queue mpq
  JOIN documents d ON d.id = mpq.document_id
  WHERE mpq.status = 'queued'
    AND mpq.retry_count < mpq.max_retries
  ORDER BY mpq.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_next_processing_job IS 
  'Get the next queued job for processing (used by background workers) - runs with elevated permissions';

-- =====================================================
-- 4. Fix cleanup_old_processing_jobs
-- =====================================================

DROP FUNCTION IF EXISTS cleanup_old_processing_jobs();

CREATE OR REPLACE FUNCTION cleanup_old_processing_jobs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM media_processing_queue
  WHERE status IN ('completed', 'failed', 'cancelled')
    AND processing_completed_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_processing_jobs IS 
  'Clean up old completed/failed jobs (older than 7 days) - runs with elevated permissions';

-- =====================================================
-- 5. Verify it works
-- =====================================================

-- Test get_next_processing_job
DO $$
DECLARE
  v_job RECORD;
BEGIN
  SELECT * INTO v_job FROM get_next_processing_job();
  
  IF v_job.queue_id IS NOT NULL THEN
    RAISE NOTICE '✅ Found queued job: %', v_job.queue_id;
    RAISE NOTICE '   Document ID: %', v_job.document_id;
    RAISE NOTICE '   Media Type: %', v_job.media_type;
  ELSE
    RAISE NOTICE '⚠️  No jobs in queue';
  END IF;
END $$;

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ All processing functions fixed with SECURITY DEFINER!';
  RAISE NOTICE '🔧 Functions updated:';
  RAISE NOTICE '   - queue_multimedia_processing';
  RAISE NOTICE '   - update_processing_status';
  RAISE NOTICE '   - get_next_processing_job';
  RAISE NOTICE '   - cleanup_old_processing_jobs';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Worker should now be able to process jobs!';
END $$;

