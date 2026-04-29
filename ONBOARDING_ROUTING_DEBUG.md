# Onboarding Routing - Complete Flow Diagram

## After Payment - Expected Behavior

```
Pricing Page Selection
        ↓
    ┌─────────────────────┬──────────────────────┐
    │                     │                      │
    ↓ Regular Plan        ↓ Enterprise Plan      
(FMP-20, FMP-35, FM-70) (ENT_*, ENT-*)
    │                     │
    ↓                     ↓
Checkout ←────────────────┤
(planCode = FMP-35)       │
    │                     ↓
    ├──────→ /billing/success ←────┤
    │                               │
    │ Auto-redirect (subscription   │
    │ becomes ACTIVE)               │
    │                               │
    ↓                               ↓
session.subscription:           session.subscription:
  planCode: FMP-35               planCode: ENT_XXXXX
  planCategory: FULL_MANAGEMENT  planCategory: ENTERPRISE
  status: ACTIVE                 status: ACTIVE
    │                               │
    ↓                               ↓
/onboarding Router checks planCategory
    │                               │
    ├─────→ FULL_MANAGEMENT         │
    │          ↓                     │
    │   /onboarding/full-management │
    │                               │
    ├─────→ ENTERPRISE ←────────────┘
               ↓
        /onboarding/brand-brief
```

## Debug Checklist

When users are incorrectly routed:

1. **Check session.subscription in console:**
   ```javascript
   // Open browser DevTools → Console
   localStorage.getItem('session') // Check stored session
   ```

2. **Verify plan selection persistence:**
   ```javascript
   // Check what plan was selected
   localStorage.getItem('selectedPlanId')
   localStorage.getItem('selectedPlanMeta')
   ```

3. **Check API response from /api/user:**
   - Network tab → /api/user
   - Look for: `subscription.planCategory` field
   - Should be one of: "ENTERPRISE", "FULL_MANAGEMENT", "CALENDAR_ONLY", etc.

4. **Trace the redirect chain:**
   - Check Network tab → preserve log
   - Watch the redirect flow
   - See which route is being sent to

## Route Mapping (lib/onboarding-routes.ts)

```
Plan Category             → Route
────────────────────────────────────
ENTERPRISE                → /onboarding/brand-brief
FULL_MANAGEMENT           → /onboarding/full-management
CALENDAR_ONLY             → /onboarding/calendar
VISUAL_CALENDAR           → /onboarding/calendar
VISUAL_ADD_ON             → /onboarding/visual
```

## Common Issues & Solutions

### Issue: Always redirected to /onboarding/calendar

**Cause:** `session.subscription.planCategory` is null or undefined

**Solution:**
1. Check backend: is it setting planCategory correctly?
2. Verify plan code matches a known plan in the system
3. Check if subscription status is ACTIVE

### Issue: Enterprise users see /onboarding/full-management

**Cause:** Enterprise plans being converted to FULL_MANAGEMENT category (FIXED in v3)

**Solution:** ✓ Already fixed - verify page now uses ENTERPRISE category

### Issue: Infinite redirects between pages

**Cause:** Redirect logic checking isEnterprise vs planCategory inconsistently

**Solution:** ✓ Already fixed - consistent enterprise detection across all files
