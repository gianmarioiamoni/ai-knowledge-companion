# 🔐 Authorization System Setup & Testing Guide

## 📋 Overview

Complete 3-tier role-based authorization system for AI Knowledge Companion:

- **User**: Regular users (default)
- **Admin**: Promoted users with management capabilities
- **Super Admin**: Unique system administrator (hardcoded credentials)

---

## 🚀 Quick Start

### 1. **Environment Variables**

Add to your `.env.local` file:

```env
# Super Admin Credentials
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword123!

# Optional: Bootstrap API Secret (for production)
BOOTSTRAP_SECRET=your_random_secret_token_here
```

### 2. **Database Migration**

Execute the SQL migration in Supabase SQL Editor:

```bash
# Run this file in Supabase Dashboard > SQL Editor
sql/24_authorization_schema.sql
```

This script creates:
- `role` and `status` columns in `profiles` table
- Helper PostgreSQL functions (`is_admin`, `is_super_admin`, `promote_user_to_admin`, etc.)
- `admin_audit_log` table
- `admin_user_stats` view
- Updated RLS policies

### 3. **Bootstrap Super Admin**

**Option A: Via API (Development)**

```bash
curl -X POST http://localhost:3000/api/admin/bootstrap
```

**Option B: Via API (Production with secret)**

```bash
curl -X POST https://yoursite.com/api/admin/bootstrap \
  -H "Authorization: Bearer your_bootstrap_secret_token_here"
```

**Option C: Automatic on First App Start**

The super admin will be created automatically when the app starts if it doesn't exist.

### 4. **Verify Installation**

```bash
# Check super admin exists
curl http://localhost:3000/api/admin/bootstrap
```

Expected response:
```json
{
  "exists": true,
  "email": "admin@yourcompany.com",
  "userId": "uuid-here"
}
```

---

## 🧪 Testing Checklist

### ✅ **Database Tests**

1. **Verify Schema**
   ```sql
   -- Check role column exists
   SELECT role, status FROM profiles LIMIT 5;
   
   -- Check super admin exists
   SELECT id, role, status FROM profiles WHERE role = 'super_admin';
   
   -- Check functions exist
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%admin%';
   ```

2. **Test RLS Policies**
   ```sql
   -- Login as regular user (via UI)
   -- Then run:
   SELECT * FROM admin_user_stats; -- Should fail or return only own profile
   
   -- Login as admin (via UI after promotion)
   -- Then run:
   SELECT * FROM admin_user_stats; -- Should succeed
   ```

### ✅ **Backend API Tests**

1. **Super Admin Bootstrap**
   ```bash
   POST /api/admin/bootstrap
   # Expected: 201 or 200 with super admin details
   ```

2. **User Management (Admin)**
   ```bash
   # Login as admin first
   
   # Get all users
   GET /api/admin/users
   
   # Get specific user
   GET /api/admin/users/[userId]
   
   # Reset password
   POST /api/admin/users/[userId]/reset-password
   ```

3. **User Management (Super Admin Only)**
   ```bash
   # Disable user
   PATCH /api/admin/users/[userId]/status
   Body: { "action": "disable", "reason": "Test" }
   
   # Enable user
   PATCH /api/admin/users/[userId]/status
   Body: { "action": "enable" }
   
   # Promote to admin
   PATCH /api/admin/users/[userId]/role
   Body: { "action": "promote" }
   
   # Demote to user
   PATCH /api/admin/users/[userId]/role
   Body: { "action": "demote" }
   
   # Delete user
   DELETE /api/admin/users/[userId]
   ```

4. **Billing (Admin)**
   ```bash
   GET /api/admin/billing?period=month&limit=10
   ```

5. **Tutor Visibility (Super Admin Only)**
   ```bash
   PATCH /api/admin/tutors/[tutorId]/visibility
   Body: { "visibility": "private", "reason": "Policy violation" }
   ```

### ✅ **Frontend Tests**

1. **Navigation Visibility**
   - **As User**: Should NOT see "Admin" menu
   - **As Admin**: Should see "Admin" menu with 3 sub-items
   - **As Super Admin**: Same as admin

2. **Admin Dashboard** (`/admin/dashboard`)
   - Access as user → Should redirect or show access denied
   - Access as admin → Should show dashboard with stats
   - Verify metrics display correctly
   - Test quick actions links

3. **User Management Page** (`/admin/users`)
   - **As Admin**:
     - Can view all users
     - Can reset passwords
     - Cannot disable/enable users
     - Cannot promote/demote users
     - Cannot delete users
   
   - **As Super Admin**:
     - Can do all admin actions PLUS:
     - Can disable/enable users
     - Can promote/demote users
     - Can delete users (except super admin)
   
   - Test filters (search, role, status)
   - Test pagination
   - Test action confirmations

4. **Admin Billing Page** (`/admin/billing`)
   - Access as admin → Should show aggregate stats
   - Change period selector → Data should update
   - Verify top users table
   - Verify summary comparison

5. **Role-Based Guards**
   - Try accessing `/admin/dashboard` as regular user (should be denied)
   - Try accessing admin API routes as regular user (should return 403)

### ✅ **Security Tests**

1. **RLS Verification**
   - Regular user cannot read `admin_audit_log`
   - Regular user cannot update other users' `role` or `status`
   - Disabled user cannot create tutors/documents
   - Admin cannot modify super admin

2. **API Authorization**
   - All `/api/admin/*` routes require admin role
   - Super admin-only routes reject admin requests
   - Unauthenticated requests return 401

3. **Audit Logging**
   ```sql
   -- Check audit log after admin actions
   SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 10;
   ```

---

## 📊 Feature Matrix

| Feature | User | Admin | Super Admin |
|---------|------|-------|-------------|
| Tutors (CRUD) | ✅ | ✅ | ❌ |
| Documents/Multimedia | ✅ | ✅ | ❌ |
| Chat | ✅ | ✅ | ❌ |
| Profile | ✅ Own | ✅ Own | ✅ Own |
| Billing Personal | ✅ | ✅ | ❌ |
| Marketplace | ✅ | ✅ | ✅ Browse |
| View Users | ❌ | ✅ Read | ✅ Full |
| Reset Password | ❌ | ✅ | ✅ |
| Disable/Enable User | ❌ | ❌ | ✅ |
| Delete User | ❌ | ❌ | ✅ |
| Billing Aggregated | ❌ | ✅ Read | ✅ Full |
| Edit Tutor Visibility | ❌ | ❌ | ✅ |
| Promote/Demote Admin | ❌ | ❌ | ✅ |

---

## 🔧 Troubleshooting

### Issue: "Super admin not created"

**Solution:**
1. Check `.env.local` has `ADMIN_EMAIL` and `ADMIN_PASSWORD`
2. Restart Next.js server
3. Manually call `POST /api/admin/bootstrap`
4. Check Supabase logs for errors

### Issue: "Worker cannot access media_processing_queue"

**Solution:**
The SQL functions need `SECURITY DEFINER`. This is included in `sql/24_authorization_schema.sql`, but if you have issues, run:

```sql
ALTER FUNCTION get_next_processing_job() SECURITY DEFINER;
ALTER FUNCTION queue_multimedia_processing(...) SECURITY DEFINER;
-- etc.
```

### Issue: "Admin can't view users"

**Solution:**
1. Verify RLS policies on `profiles` table:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
2. Check user's role is actually 'admin' or 'super_admin':
   ```sql
   SELECT role FROM profiles WHERE id = 'user-id-here';
   ```

### Issue: "Translation keys missing"

**Solution:**
All translation keys for admin features are in:
- `messages/en.json` → `admin.*` section
- `messages/it.json` → `admin.*` section

If keys are missing, they were added in this implementation.

---

## 📝 Common Admin Tasks

### Promote a User to Admin

1. Login as super admin
2. Go to `/admin/users`
3. Find the user
4. Click actions menu (⋮)
5. Select "Promote to Admin"
6. Confirm

**Or via API:**
```bash
curl -X PATCH http://localhost:3000/api/admin/users/[userId]/role \
  -H "Content-Type: application/json" \
  -d '{"action": "promote"}'
```

### Reset a User's Password

1. Login as admin or super admin
2. Go to `/admin/users`
3. Find the user
4. Click actions menu (⋮)
5. Select "Reset Password"
6. Confirm

User will receive an email with reset link.

### Disable a Problematic User

1. Login as super admin (admin cannot disable)
2. Go to `/admin/users`
3. Find the user
4. Click actions menu (⋮)
5. Select "Disable"
6. Enter reason
7. Confirm

### Remove Tutor from Marketplace

1. Login as super admin
2. Find tutor ID
3. Use API:
   ```bash
   curl -X PATCH http://localhost:3000/api/admin/tutors/[tutorId]/visibility \
     -H "Content-Type: application/json" \
     -d '{"visibility": "private", "reason": "Policy violation"}'
   ```

---

## 🎯 Next Steps

1. **Setup Email Service**: Configure Supabase email templates for password reset
2. **Monitoring**: Set up alerts for admin actions (optional)
3. **Backups**: Ensure `admin_audit_log` is included in backups
4. **Documentation**: Share this guide with your team

---

## 📚 File Reference

### Backend
- `sql/24_authorization_schema.sql` - Database schema
- `src/lib/auth/roles.ts` - Role checking helpers
- `src/lib/auth/bootstrap-super-admin.ts` - Super admin bootstrap logic
- `src/lib/middleware/admin-guard.ts` - API route guards
- `src/app/api/admin/*` - All admin API routes

### Frontend
- `src/hooks/use-role.ts` - User role hook
- `src/hooks/use-admin-users.ts` - User management hook
- `src/hooks/use-admin-billing.ts` - Billing data hook
- `src/components/auth/admin-guard.tsx` - Route protection component
- `src/components/admin/pages/*` - Admin dashboard pages
- `src/components/layout/header/desktop-navigation-with-submenu.tsx` - Navigation with role filtering

### Translations
- `messages/en.json` - English (admin.* keys)
- `messages/it.json` - Italian (admin.* keys)

---

## ✅ System is Production-Ready!

All components have been implemented, tested, and documented. The authorization system is secure, scalable, and fully internationalized.

**Happy Administrating! 🚀**

