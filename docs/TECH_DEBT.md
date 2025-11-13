# 📋 Technical Debt & Code Quality Plan

## Current Status

### Build Configuration
- ✅ **Production builds** work correctly
- ⚠️ **ESLint** disabled during builds (`ignoreDuringBuilds: true`)
- ⚠️ **TypeScript** errors ignored during builds (`ignoreBuildErrors: true`)

### Code Quality Metrics

| Metric | Count | Priority |
|--------|-------|----------|
| ESLint errors (src/) | 115 | 🟡 Medium |
| TypeScript errors | 182 | 🟢 Low |
| `any` types | ~100+ | 🟡 Medium |

---

## 🎯 Improvement Plan

### Phase 1: Configuration & Tooling (✅ Completed)
- [x] Setup ESLint with TypeScript
- [x] Configure Prettier
- [x] Setup pre-commit hooks
- [x] Add `.eslintignore` for scripts

### Phase 2: Critical Fixes (🔄 In Progress)
**Priority:** Fix errors that impact functionality

#### TypeScript Errors to Fix First:
1. **Admin route handlers** - `roleInfo` implicit `any` type
   ```typescript
   // ❌ Before:
   ({ roleInfo }: { roleInfo: any })
   
   // ✅ After:
   ({ roleInfo }: { roleInfo: RoleInfo })
   ```
   Files affected: 6 admin routes

2. **Zod error handling** - `.errors` property doesn't exist
   ```typescript
   // ❌ Before:
   error.errors
   
   // ✅ After:
   error.issues
   ```
   Files affected: 3 routes

3. **JSX namespace** - Missing React import
   ```typescript
   // ✅ Add:
   import type { JSX } from 'react'
   ```
   Files affected: 1 file

#### ESLint Errors to Fix First:
1. **Explicit `any` types** - Replace with proper types
   Priority files:
   - `src/app/api/admin/reprocess-document/route.ts`
   - `src/app/api/chat/conversations/route.ts`
   - `src/app/api/chat/messages/route.ts`
   - `src/app/api/documents/process/route.ts`
   - `src/app/api/marketplace/route.ts`

### Phase 3: Gradual Cleanup (📋 Planned)
**Timeline:** Over next sprints

1. **Week 1-2:** Fix all admin route type errors (6 files)
2. **Week 3-4:** Fix Zod error handling (3 files)
3. **Week 5-6:** Replace top 20 `any` types
4. **Week 7-8:** Enable ESLint warnings (not errors)
5. **Week 9-10:** Enable TypeScript strict mode gradually

### Phase 4: Strict Mode (🔮 Future)
**Goal:** Enable strict TypeScript & ESLint

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    // ...
  }
}
```

```javascript
// next.config.ts
{
  eslint: {
    ignoreDuringBuilds: false, // ✅ Re-enable
  },
  typescript: {
    ignoreBuildErrors: false, // ✅ Re-enable
  }
}
```

---

## 📊 Error Breakdown

### ESLint Errors by Type

| Rule | Count | Severity |
|------|-------|----------|
| `@typescript-eslint/no-explicit-any` | ~100 | Warning |
| `@typescript-eslint/no-require-imports` | 15 | Info (scripts only) |

### TypeScript Errors by Category

| Category | Count | Notes |
|----------|-------|-------|
| Generated (`.next/types/`) | ~50 | Can ignore |
| Implicit `any` (`TS7031`) | ~30 | Fix with proper types |
| Zod `.errors` (`TS2339`) | ~10 | Change to `.issues` |
| Route handler types (`TS2345`) | ~20 | Fix middleware types |
| Other | ~72 | Various, low priority |

---

## 🛠️ Quick Fixes

### 1. Add `.eslintignore`
```
# Ignore generated files
.next/
node_modules/
out/
build/

# Ignore scripts (CommonJS)
scripts/
*.config.js
jest.config.js
```

### 2. Create Type Definitions

```typescript
// src/types/admin.ts
export interface RoleInfo {
  userId: string
  role: 'user' | 'admin' | 'super_admin'
  isSuperAdmin: boolean
  isAdmin: boolean
}
```

### 3. Fix Zod Error Handling

```typescript
// ❌ Before:
catch (error) {
  if (error instanceof z.ZodError) {
    return Response.json({ error: error.errors })
  }
}

// ✅ After:
catch (error) {
  if (error instanceof z.ZodError) {
    return Response.json({ 
      error: 'Validation failed',
      details: error.issues 
    })
  }
}
```

---

## 📈 Success Metrics

### Short-term (1-2 months)
- [ ] Reduce ESLint errors to < 50
- [ ] Reduce TypeScript errors to < 100
- [ ] Fix all critical `any` types in API routes

### Medium-term (3-6 months)
- [ ] Enable ESLint warnings in builds
- [ ] Reduce ESLint errors to < 20
- [ ] Fix all `any` types in core business logic

### Long-term (6+ months)
- [ ] Enable full TypeScript strict mode
- [ ] Re-enable ESLint errors in builds
- [ ] Zero ESLint/TypeScript errors
- [ ] Maintain code quality with pre-commit hooks

---

## ✅ Progress

### Completed (2024-11-13)
- [x] Created `.eslintignore` to exclude scripts
- [x] Created admin types (`RoleInfo`, `AdminContext`, etc.)
- [x] Fixed example admin route (`users/[userId]/status`) with proper types
- [x] Documented tech debt and improvement plan

### Example Fix Applied
```typescript
// File: src/app/api/admin/users/[userId]/status/route.ts

// ❌ Before:
export const PATCH = withSuperAdmin(
  async (request: NextRequest, { roleInfo }, context: RouteParams) => {
    //                            ^^^^^^^^ - implicit any

// ✅ After:
import { RoleInfo, UserRouteParams } from '@/types/admin'

export const PATCH = withSuperAdmin(
  async (request: NextRequest, { roleInfo }: { roleInfo: RoleInfo }, context: UserRouteParams) => {
    // Now fully typed!
```

### Next Files to Fix (Same Pattern)
Apply the same pattern to these 5 remaining admin routes:
- [ ] `src/app/api/admin/users/[userId]/role/route.ts`
- [ ] `src/app/api/admin/users/[userId]/reset-password/route.ts`
- [ ] `src/app/api/admin/users/[userId]/route.ts`
- [ ] `src/app/api/admin/tutors/[tutorId]/visibility/route.ts`
- [ ] Other admin routes as needed

## 🔄 Maintenance Strategy

### Weekly
- Review new code for `any` types
- Fix 5-10 existing errors using established patterns
- Apply same typing pattern to admin routes

### Sprint Review
- Track error count reduction
- Update this document
- Celebrate wins! 🎉

### Before Major Releases
- Run full lint check
- Fix critical errors
- Document known issues

---

## 🚨 Critical Issues (Fix ASAP)

None currently! All critical functionality works despite type issues.

---

## 💡 Best Practices Going Forward

1. **Never add `any` in new code** - Use `unknown` and type guards
2. **Use Zod for runtime validation** - Infer types from schemas
3. **Type API responses** - Create proper response types
4. **Test types** - Use `expectType<>()` in tests
5. **Document complex types** - Add JSDoc comments

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint Rules](https://typescript-eslint.io/rules/)
- [Zod Documentation](https://zod.dev/)
- [Next.js TypeScript](https://nextjs.org/docs/pages/building-your-application/configuring/typescript)

---

**Last Updated:** 2024-11-13  
**Status:** 🟡 In Progress  
**Next Review:** Sprint end

