# Image Support - Manual Setup Steps

## ⚠️ IMPORTANT: Supabase Setup Required

The image feature is now fully implemented in code, but requires **manual configuration in Supabase** to work.

## Step 1: Run SQL Migration

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in the left sidebar
3. Create a **New query**
4. Copy and paste the contents of: `sql/31_image_support.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify all commands executed successfully (green checkmarks)

**What this does:**
- Creates storage policies for images bucket
- Updates MIME type constraints
- Adds `get_user_images()` function
- Creates performance indexes

## Step 2: Create Images Storage Bucket

1. Go to **Supabase Dashboard** → Your Project
2. Click **Storage** in the left sidebar
3. Click **Create a new bucket** button
4. Configure as follows:

| Setting | Value |
|---------|-------|
| **Name** | `images` |
| **Public** | `false` (keep private) |
| **File size limit** | `10485760` (10 MB) |
| **Allowed MIME types** | (see below) |

**Allowed MIME types:**
```
image/jpeg
image/jpg
image/png
image/gif
image/webp
```

5. Click **Create bucket**

## Step 3: Verify Storage Policies

After creating the bucket and running the SQL migration, verify policies are active:

1. Go to **Storage** → **images** bucket
2. Click on **Policies** tab
3. You should see 3 policies:
   - ✅ **Users can view own images** (SELECT)
   - ✅ **Users can upload own images** (INSERT)
   - ✅ **Users can delete own images** (DELETE)

If policies are missing, re-run the SQL migration script.

## Step 4: Test the Feature

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Login to your application

3. Navigate to `/multimedia`

4. Click on the **Images** tab

5. Try uploading an image:
   - Drag-and-drop an image file
   - Or click "Browse Files"
   - Click "Upload All"

6. Verify:
   - Image appears in the grid below
   - Status shows "Completed"
   - You can view the full image
   - You can delete the image

## Step 5: Test Tutor Association

1. Go to any tutor edit page

2. Scroll to **Multimedia** section

3. Click **Add Multimedia**

4. Select one or more images from the picker

5. Click **Add (N)**

6. Verify images appear in the tutor's multimedia list

## Troubleshooting

### Error: "Failed to upload image"
**Cause:** Storage bucket doesn't exist or RLS policies are not active

**Solution:**
1. Check bucket exists in Supabase Storage
2. Verify bucket name is exactly `images`
3. Re-run SQL migration to create policies

### Error: "403 Forbidden"
**Cause:** RLS policies not allowing user access

**Solution:**
1. Check you're logged in
2. Verify policies allow INSERT for authenticated users
3. Check storage bucket is not public

### Images not appearing after upload
**Cause:** API endpoint not finding files

**Solution:**
1. Check browser console for errors
2. Verify `/api/multimedia?mediaType=image` returns data
3. Check files exist in Supabase Storage under `images/{user_id}/`

### "Bucket not found"
**Cause:** Typo in bucket name or bucket not created

**Solution:**
1. Ensure bucket name is exactly `images` (lowercase)
2. Verify bucket exists in Storage dashboard

## Additional Notes

- Images are stored under `images/{user_id}/{uuid}_{filename}`
- Maximum file size: 10 MB
- Supported formats: JPG, JPEG, PNG, GIF, WebP
- Images count towards subscription limits:
  - **Trial:** 0 images
  - **Pro:** 100 images
  - **Enterprise:** Unlimited

## Need Help?

If you encounter issues:
1. Check Supabase logs (Logs → Database or Storage)
2. Review browser console for frontend errors
3. Verify all setup steps were completed
4. See `docs/IMAGE_SUPPORT_IMPLEMENTATION.md` for detailed documentation

---

**Setup Status:** 
- [x] Code implementation (COMPLETE)
- [ ] SQL migration (MANUAL - follow Step 1)
- [ ] Storage bucket creation (MANUAL - follow Step 2)
- [ ] Feature testing (MANUAL - follow Step 4-5)

