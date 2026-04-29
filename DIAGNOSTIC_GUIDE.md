# 🔍 Onboarding Routing - Diagnostic Guide

I've added debug logging to help identify why you're being redirected to `/onboarding/calendar`.

**The issue is likely in the BACKEND** - not returning the correct `planCategory` in the session after payment.

## Quick Test Steps

### 1. Open Browser Developer Tools
- **Windows/Linux:** Press `F12` or `Ctrl+Shift+I`
- **Mac:** Press `Cmd+Option+I`

### 2. Clear Console and Start Fresh
- Go to the **Console** tab
- Click the ⭕ icon to clear all logs
- Type `localStorage.clear()` and press Enter
- Refresh the page (F5 or Cmd+R)

### 3. Follow the Flow
```
1. Go to pricing page → Select a plan (Full Management or Enterprise)
2. Complete checkout → Make the payment
3. Watch the browser console for logs
```

### 4. Screenshot the Console Output

Take a screenshot of what you see in the console. You should see logs like:

```
[BillingSuccess] Redirecting from Success Page
  ✓ subscription.planCode: ???
  ✓ subscription.planCategory: ???  ← THIS IS KEY!
```

---

## 🎯 Key Values to Check

### THE CRITICAL VALUE: `subscription.planCategory`

**Expected values:**
- `"ENTERPRISE"` → Should go to `/onboarding/brand-brief` ✓
- `"FULL_MANAGEMENT"` → Should go to `/onboarding/full-management` ✓
- `"CALENDAR_ONLY"` → Would go to `/onboarding/calendar`

**If you see:**
- ❌ `null` or `undefined` → Backend didn't return planCategory
- ❌ `"CALENDAR_ONLY"` when you selected Full Management → Backend returned wrong category
- ✓ The correct value → Frontend routing should work

---

## What to Tell Me

After following the steps above, please share:

1. **Screenshot of console output** (most important!)
2. **What plan you selected** (Full Management, Enterprise, etc.)
3. **What `subscription.planCode` showed**
4. **What `subscription.planCategory` showed** (THE KEY!)
5. **Where you ended up** (/onboarding/calendar, /onboarding/brand-brief, etc.)

Example:
```
I selected: Full Management (FMP-35)
subscription.planCode: FMP-35
subscription.planCategory: CALENDAR_ONLY ← WRONG! Should be FULL_MANAGEMENT
Ended up at: /onboarding/calendar
```

---

## If planCategory is Missing or Wrong

This is a **BACKEND issue**, not frontend. The backend needs to:
1. Correctly map the plan code (FMP-35, ENT_XXXXX, etc.) to the right category
2. Return that category in the session response
3. Make sure it's set immediately after payment, not delayed

---

## Additional Debug: Check Network Tab

You can also check what the API is actually returning:

1. Open DevTools → **Network** tab
2. Click **"Preserve log"** checkbox
3. Refresh page and complete payment
4. Look for requests to `/api/auth/me` or `/api/user`
5. Click on one of those requests
6. Go to **Response** tab
7. Look for: `subscription.planCategory`

This shows exactly what the backend is sending to the frontend.
