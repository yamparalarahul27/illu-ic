# Graphics Lab — App Architecture & Implementation Plan

## Overview

Two entry paths after the splash screen:
- **Login as Admin** → email-validated admin mode (role-gated features)
- **Launch App** → frictionless user mode (view + comment only)

---

## 1. Entry Flow

```
SplashScreen
    └── EntryScreen (new)
          ├── [Login as Admin] → /admin/login
          └── [Launch App]    → /dashboard (user mode)
```

**File:** `src/app/entry/page.tsx` *(or replace current `src/app/page.tsx`)*

```tsx
// Two centered buttons
// "Login as Admin"  → router.push("/admin/login")
// "Launch App"      → router.push("/dashboard")
```

---

## 2. Roles & Permissions

### Role Hierarchy

| Role | Notes |
|---|---|
| `SUPERADMIN` | Hardcoded: `shaina@equicomtech.com` |
| `MANAGER` | Admin — review & comment only |
| `CREATOR` | Admin — upload, delete, update, assign name tags, comment |
| `QA` | Admin — review & comment only |
| `DEVELOPER` | Admin — review & comment only |
| `USER` | Public — view & comment only (no login) |

### Permission Matrix

| Feature | SUPERADMIN | MANAGER | CREATOR | QA | DEVELOPER | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View assets | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Comment | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload asset | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Delete asset | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Update/edit asset | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Assign name tags | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Assign status tags | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| See Upload/Delete UI | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| View admin requests | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage users & roles | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Give admin access | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 3. Database Schema

### `admins` table
```sql
id          uuid primary key default gen_random_uuid()
email       text unique not null
name        text
role        text check (role in ('MANAGER','CREATOR','QA','DEVELOPER'))
status      text default 'active' check (status in ('active','inactive'))
created_at  timestamptz default now()
```

### `admin_requests` table
```sql
id          serial primary key
name        text not null
email       text not null
team        text
reason      text
status      text default 'pending' check (status in ('pending','approved','rejected'))
created_at  timestamptz default now()
```

### `illustrations` table *(add new columns)*
```sql
-- existing: id, name, image, image_url, dark_image_url, created_at
status      text default 'IN_PROGRESS'
            check (status in ('CONFIRMED','IN_PROGRESS','UNDER_REVIEW','REMOVED'))
name_tag    text  -- free tag assigned by CREATOR/SUPERADMIN
```

### `comments` table *(unchanged)*
```sql
id, illustration_id, user_name, user_email, user_team, text, timestamp
```

---

## 4. Route Structure

```
/                       → EntryScreen (Login as Admin | Launch App)
/admin/login            → AdminLoginScreen
/admin/dashboard        → SuperAdmin dashboard (requests, users, role mgmt)
/dashboard              → User/Admin shared dashboard (4 category cards)
/library/illustrations  → Illustrations library (role-gated features)
```

---

## 5. Admin Login Flow

**File:** `src/app/admin/login/page.tsx`

### States
```
ENTER_EMAIL → VALIDATING → SUCCESS | NOT_FOUND
NOT_FOUND   → [Try Again | Request Access]
REQUEST_FORM → submitted
```

### Logic (`src/lib/admin.ts`)
```ts
// Step 1: validate email
async function validateAdminEmail(email: string): Promise<AdminUser | null> {
  if (email.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
    return { email, role: 'SUPERADMIN', name: 'Shaina' };
  }
  const { data } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'active')
    .maybeSingle();
  return data ?? null;
}
```

### UI States
```tsx
// State: ENTER_EMAIL
<input placeholder="Enter your email" />
<button>Continue</button>

// State: NOT_FOUND
<p>Email not recognised.</p>
<button onClick={() => setState('ENTER_EMAIL')}>Try Again</button>
<button onClick={() => setState('REQUEST_FORM')}>Request Access</button>

// State: REQUEST_FORM
<input name="name" />
<input name="email" />        // pre-filled
<input name="team" />
<textarea name="reason" />
<button>Submit Request</button>

// State: SUCCESS → store admin session → redirect to /dashboard
localStorage.setItem('graphicsLabAdminSession', JSON.stringify({ email, role, name }))
```

---

## 6. Session & Auth Hook

**File:** `src/hooks/useSession.ts`
```ts
export type UserRole = 'SUPERADMIN' | 'MANAGER' | 'CREATOR' | 'QA' | 'DEVELOPER' | 'USER';

export interface AppSession {
  mode: 'admin' | 'user';
  role: UserRole;
  name: string;
  email: string;
}

export function useSession(): AppSession {
  // Read from localStorage
  const admin = localStorage.getItem('graphicsLabAdminSession');
  if (admin) {
    const { email, role, name } = JSON.parse(admin);
    const r: UserRole = email === SUPER_ADMIN_EMAIL ? 'SUPERADMIN' : role;
    return { mode: 'admin', role: r, name, email };
  }
  // User mode — may or may not have commented before
  const user = localStorage.getItem('graphicsLabCommentUser');
  const { name = '', email = '' } = user ? JSON.parse(user) : {};
  return { mode: 'user', role: 'USER', name, email };
}
```

**Permission helpers:** `src/lib/permissions.ts`
```ts
export const can = {
  upload:          (role: UserRole) => ['SUPERADMIN','CREATOR'].includes(role),
  delete:          (role: UserRole) => ['SUPERADMIN','CREATOR'].includes(role),
  update:          (role: UserRole) => ['SUPERADMIN','CREATOR'].includes(role),
  assignNameTag:   (role: UserRole) => ['SUPERADMIN','CREATOR'].includes(role),
  assignStatusTag: (role: UserRole) => role === 'SUPERADMIN',
  seeAdminUI:      (role: UserRole) => role !== 'USER',
  seeAdminRequests:(role: UserRole) => role === 'SUPERADMIN',
  manageUsers:     (role: UserRole) => role === 'SUPERADMIN',
  comment:         (_role: UserRole) => true,
};
```

---

## 7. Asset Status Tags

Applied per illustration by SUPERADMIN only.

| Tag | Color | Hex |
|---|---|---|
| CONFIRMED | Green | `#22c55e` |
| IN PROGRESS | Blue | `#3b82f6` |
| UNDER REVIEW | Yellow | `#f59e0b` |
| REMOVED | Pink | `#ec4899` |

**UI:** Small pill badge on each `IllustrationCard` bottom-left corner.
**Edit:** Superadmin sees a status dropdown in the `IllustrationSidePanel`.

```tsx
// IllustrationCard — status badge
{illustration.status && (
  <div style={{ backgroundColor: STATUS_COLORS[illustration.status], ... }}>
    {illustration.status.replace('_', ' ')}
  </div>
)}
```

---

## 8. Name Tags (CREATOR role)

CREATORs can assign a name tag to each asset from a predefined set. Stored in `illustrations.name_tag`.

Name tags are a free-text field set by the CREATOR. Displayed as a small label on the side panel.

```tsx
// In IllustrationSidePanel — visible to CREATOR + SUPERADMIN
<input
  placeholder="Assign name tag..."
  value={illustration.name_tag || ''}
  onChange={...}
  onBlur={() => supabase.from('illustrations').update({ name_tag }).eq('id', id)}
/>
```

---

## 9. Superadmin Dashboard (`/admin/dashboard`)

Tabs:
1. **Users** — list all admins, their role, status. Assign/change role. Deactivate.
2. **Requests** — pending admin requests with approve/reject.
3. **Add Admin** — input email + name + assign role → insert into `admins`.

```tsx
// Tab: Users
admins.map(admin => (
  <Row>
    <Avatar /> <Name /> <Email />
    <RoleSelect value={admin.role} onChange={updateRole} />    // MANAGER|CREATOR|QA|DEVELOPER
    <StatusToggle active={admin.status === 'active'} />
  </Row>
))

// Tab: Requests
requests.map(req => (
  <Row>
    <Name /> <Email /> <Team /> <Reason />
    <RoleSelect />      // assign role on approval
    <ApproveButton />
    <RejectButton />
  </Row>
))

// Tab: Add Admin
<input placeholder="Name" />
<input placeholder="Email" />
<RoleSelect />
<button>Add Admin</button>
```

---

## 10. User Mode — Comment Auth Popup

Triggered on first comment click if `localStorage.getItem('graphicsLabCommentUser')` is null.

```tsx
// CommentAuthPopup — shown only once
<Popup>
  <button onClick={onClose} style={{ position:'absolute', top:16, right:16 }}>✕</button>
  <h3>Before you comment...</h3>
  <input name="name"  placeholder="Full Name"    required />
  <input name="email" placeholder="Email"        required />
  <input name="team"  placeholder="Team"         required />
  <button type="submit">Continue</button>
</Popup>

// On submit → localStorage.setItem('graphicsLabCommentUser', JSON.stringify(data))
// Subsequent comment clicks → go straight to CommentPopup
```

---

## 11. Key File Changes Summary

| File | Change |
|---|---|
| `src/app/page.tsx` | Replace with EntryScreen (2 buttons) |
| `src/app/admin/login/page.tsx` | New — admin login flow (email → validate → success/not-found/request) |
| `src/app/admin/dashboard/page.tsx` | New — superadmin dashboard (users, requests, add admin) tabs |
| `src/lib/admin.ts` | Add `validateAdminEmail`, `updateAdminRole`, `deactivateAdmin` |
| `src/lib/permissions.ts` | New — `can.*` permission helpers |
| `src/hooks/useSession.ts` | New — unified session hook (admin vs user mode) |
| `src/types/illustration.ts` | Add `status` and `name_tag` fields |
| `src/components/IllustrationSidePanel.tsx` | Add status tag selector (superadmin), name tag input (creator) |
| `src/app/library/illustrations/components/IllustrationCard.tsx` | Add status badge pill |
| `src/components/illustration-panel/AuthPopup.tsx` | Remove admin request; become user identity only with ✕ close |
| `src/components/Navbar.tsx` | Read from `useSession`; show Admin Dashboard link for admins |
| `src/app/library/illustrations/components/SearchControlBar.tsx` | Gate upload/delete on `can.seeAdminUI(role)` |

---

## 12. Implementation Order

1. **DB migrations** — add `status`, `name_tag` to `illustrations`; ensure `admins` has `role` + `status` columns
2. **`src/lib/permissions.ts`** — permission helpers
3. **`src/hooks/useSession.ts`** — unified session
4. **EntryScreen** — replace `src/app/page.tsx`
5. **Admin login** — `src/app/admin/login/page.tsx`
6. **Superadmin dashboard** — `src/app/admin/dashboard/page.tsx` (3 tabs)
7. **Update Navbar** — read session, show correct links
8. **Update IllustrationSidePanel** — status tag (superadmin), name tag (creator)
9. **Update IllustrationCard** — status badge
10. **Update SearchControlBar** — use `can.*` helpers
11. **Update AuthPopup** — user identity only, add ✕ close button
