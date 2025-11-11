/**
 * Direct test of image upload to identify the exact error
 * Run with: npx tsx test-image-upload-direct.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testImageUpload() {
  console.log('🧪 Testing Image Upload...\n')

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 1. Check if user is authenticated
  console.log('1️⃣ Checking authentication...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('❌ Not authenticated:', authError?.message)
    console.log('\n💡 Login first in your browser, then run this script again')
    return
  }
  
  console.log('✅ Authenticated as:', user.email)
  console.log('   User ID:', user.id)

  // 2. Check subscription
  console.log('\n2️⃣ Checking subscription...')
  const { data: subscription, error: subError } = await supabase
    .rpc('check_usage_limit', {
      p_user_id: user.id,
      p_resource_type: 'image'
    })
  
  if (subError) {
    console.error('❌ Subscription check failed:', subError.message)
    return
  }
  
  console.log('Subscription check result:', subscription)
  
  if (!subscription || subscription.length === 0) {
    console.error('❌ No subscription data returned')
    return
  }
  
  const limitCheck = subscription[0]
  console.log(`✅ Can create: ${limitCheck.can_create}`)
  console.log(`   Current: ${limitCheck.current_count}/${limitCheck.max_allowed}`)
  console.log(`   Message: ${limitCheck.message}`)
  
  if (!limitCheck.can_create) {
    console.error('❌ Limit reached!')
    return
  }

  // 3. Check if images bucket exists
  console.log('\n3️⃣ Checking images bucket...')
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
  
  if (bucketsError) {
    console.error('❌ Failed to list buckets:', bucketsError.message)
    return
  }
  
  const imagesBucket = buckets.find(b => b.id === 'images')
  if (!imagesBucket) {
    console.error('❌ Images bucket not found!')
    return
  }
  
  console.log('✅ Images bucket exists:', imagesBucket.name)

  // 4. Try to upload a test file
  console.log('\n4️⃣ Testing upload...')
  
  // Create a simple test image file (1x1 pixel PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )
  
  const fileName = `test-${Date.now()}.png`
  const filePath = `${user.id}/${fileName}`
  
  console.log('Uploading to:', filePath)
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, testImageBuffer, {
      contentType: 'image/png',
      upsert: false
    })
  
  if (uploadError) {
    console.error('❌ Upload failed:', uploadError.message)
    console.error('   Error details:', JSON.stringify(uploadError, null, 2))
    return
  }
  
  console.log('✅ Upload successful!')
  console.log('   Path:', uploadData.path)
  
  // 5. Clean up - delete test file
  console.log('\n5️⃣ Cleaning up...')
  const { error: deleteError } = await supabase.storage
    .from('images')
    .remove([filePath])
  
  if (deleteError) {
    console.warn('⚠️  Failed to delete test file:', deleteError.message)
  } else {
    console.log('✅ Test file deleted')
  }
  
  console.log('\n🎉 ALL TESTS PASSED!')
  console.log('\nIf this works but the UI doesn\'t, the problem is in the frontend or API route.')
}

// Run the test
testImageUpload().catch(console.error)

