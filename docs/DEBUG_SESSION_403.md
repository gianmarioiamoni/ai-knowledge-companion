# Debug 403 Error - Session Authentication Issue

## ✅ Status: Database is OK!

The subscription is working correctly in the database:
- ✅ User: `gia.iamoni@tiscali.it` (ID: `05237d7e-320d-45ba-9499-94ef49e3be89`)
- ✅ Plan: Enterprise Monthly (Active until Dec 9, 2025)
- ✅ Image limit: 0/200
- ✅ `check_usage_limit` returns `can_create: true`

**The problem is NOT in the database!**

## 🔍 Root Cause

The **403 Forbidden** error is caused by a **session/authentication mismatch** between:
- Your browser session
- The API authentication check

## 🧪 Step 1: Check Your Current Session

1. **Open your app** in the browser
2. **Open DevTools** (F12)
3. **Go to Console tab**
4. **Run this command**:

```javascript
fetch('/api/debug/session')
  .then(r => r.json())
  .then(data => {
    console.log('=== SESSION DEBUG ===');
    console.log('Authenticated:', data.authenticated);
    console.log('Current User ID:', data.user?.id);
    console.log('Expected User ID:', data.expected_user_id);
    console.log('IDs Match:', data.user_id_matches);
    console.log('Email:', data.user?.email);
    console.log('Can Upload Images:', data.subscription_check?.can_create);
    console.log('\nFull data:', data);
  });
```

## 📊 Expected Results

### ✅ **If Everything is OK:**

```javascript
{
  authenticated: true,
  user: {
    id: "05237d7e-320d-45ba-9499-94ef49e3be89",
    email: "gia.iamoni@tiscali.it"
  },
  user_id_matches: true,
  subscription_check: {
    can_create: true,
    max_allowed: 200
  }
}
```

**Solution:** The session is correct! The problem must be in the upload flow itself.
→ Go to **Step 2B**

### ❌ **If User ID Doesn't Match:**

```javascript
{
  authenticated: true,
  user: {
    id: "SOME-OTHER-ID",  // ← Different from expected
    email: "other@email.com"
  },
  user_id_matches: false
}
```

**Solution:** You're logged in as the wrong user!
→ Go to **Step 2A**

### ❌ **If Not Authenticated:**

```javascript
{
  authenticated: false,
  error: "No user found"
}
```

**Solution:** You're not logged in!
→ Go to **Step 2A**

---

## 🔧 Step 2A: Fix Authentication (If IDs Don't Match)

### Option 1: Logout and Login Again

1. Click **Logout** in your app
2. **Clear browser data**:
   - Open DevTools (F12)
   - Go to **Application** tab
   - Click **Clear site data** (bottom left)
   - Confirm
3. **Close and reopen** the browser
4. Go to your app
5. **Login** with: `gia.iamoni@tiscali.it`
6. Go back to **Step 1** to verify

### Option 2: Manual Session Cleanup

Run this in the browser console:

```javascript
// Clear all auth data
localStorage.clear();
sessionStorage.clear();

// Clear Supabase auth tokens
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ Cleared all auth data. Please reload and login again.');
```

Then:
1. **Reload the page** (Ctrl/Cmd + Shift + R)
2. **Login** again
3. Go back to **Step 1**

---

## 🔧 Step 2B: Fix Upload Flow (If Session is Correct)

If the session is correct but upload still fails, check the **upload API logs**:

### 1. Check Server Logs

In the terminal where `npm run dev` is running, look for:

```
📤 Uploading image file: ...
❌ Upload error: ...
```

**Copy the full error** and share it.

### 2. Check Browser Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try uploading an image
4. Find the **`/api/multimedia/upload`** request
5. Click on it
6. Go to **Response** tab
7. **Copy the error response**

### 3. Test Direct Upload

Run this in the browser console:

```javascript
async function testImageUpload() {
  // Create a tiny test image (1x1 pixel PNG)
  const blob = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
    .then(r => r.blob());
  
  const formData = new FormData();
  formData.append('file', blob, 'test.png');
  formData.append('mediaType', 'image');
  
  console.log('🧪 Testing upload...');
  
  const response = await fetch('/api/multimedia/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  console.log('Status:', response.status);
  console.log('Response:', data);
  
  if (response.ok) {
    console.log('✅ UPLOAD SUCCESSFUL!');
  } else {
    console.log('❌ UPLOAD FAILED:', data.error);
  }
  
  return data;
}

testImageUpload();
```

---

## 🎯 Common Solutions

### Problem: "Unauthorized" or auth.uid() is null

**Cause:** Session expired or not properly set

**Solution:**
1. Logout
2. Clear site data
3. Login again

### Problem: "No active subscription found"

**Cause:** The API can't find the subscription for the current user

**Solution:**
1. Verify you're logged in as `gia.iamoni@tiscali.it`
2. Run `/api/debug/session` to check user ID
3. If user ID doesn't match `05237d7e-320d-45ba-9499-94ef49e3be89`, logout and login again

### Problem: Session is correct but still 403

**Cause:** Possible caching or middleware issue

**Solution:**
1. Hard reload: Ctrl/Cmd + Shift + R
2. Restart the dev server: `npm run dev`
3. Try in incognito/private window

---

## 📋 Quick Checklist

Before testing upload:

- [ ] Run `/api/debug/session` - verify `authenticated: true`
- [ ] Verify `user_id_matches: true`
- [ ] Verify `email: "gia.iamoni@tiscali.it"`
- [ ] Verify `subscription_check.can_create: true`
- [ ] Hard reload browser (Ctrl/Cmd + Shift + R)
- [ ] Try upload

---

## 🚨 If Nothing Works

1. **Restart everything:**
   ```bash
   # Stop the dev server (Ctrl+C)
   # Clear node modules cache
   rm -rf .next
   # Restart
   npm run dev
   ```

2. **Check environment variables:**
   - Verify `.env.local` has correct Supabase credentials
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

3. **Try a different browser:**
   - Sometimes browser extensions interfere
   - Test in incognito/private mode

4. **Check Supabase Dashboard:**
   - Go to **Authentication → Users**
   - Verify `gia.iamoni@tiscali.it` exists
   - Check if there are multiple users with similar emails

---

## 📞 Debug Output Template

If you need help, run these and share the output:

```javascript
// 1. Session check
fetch('/api/debug/session').then(r => r.json()).then(console.log)

// 2. Test upload
async function testUpload() {
  const blob = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==').then(r => r.blob());
  const formData = new FormData();
  formData.append('file', blob, 'test.png');
  const response = await fetch('/api/multimedia/upload', { method: 'POST', body: formData });
  return { status: response.status, data: await response.json() };
}
testUpload().then(console.log)
```

Also share:
- Server terminal logs (where `npm run dev` runs)
- Browser console errors
- Network tab response for `/api/multimedia/upload`

---

## 🗑️ Cleanup After Debugging

**IMPORTANT:** After you fix the issue, delete this debug endpoint:

```bash
rm src/app/api/debug/session/route.ts
```

This endpoint exposes sensitive user information and should not be in production!

