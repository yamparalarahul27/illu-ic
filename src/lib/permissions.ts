export type UserRole = 'SUPERADMIN' | 'MANAGER' | 'CREATOR' | 'QA' | 'DEVELOPER' | 'USER';

export const SUPER_ADMIN_EMAIL = 'shaina@equicomtech.com';

export const ADMIN_ROLES: UserRole[] = ['MANAGER', 'CREATOR', 'QA', 'DEVELOPER'];

export const can = {
  upload:           (role: UserRole) => ['SUPERADMIN', 'CREATOR'].includes(role),
  delete:           (role: UserRole) => ['SUPERADMIN', 'CREATOR'].includes(role),
  update:           (role: UserRole) => ['SUPERADMIN', 'CREATOR'].includes(role),
  assignNameTag:    (role: UserRole) => role !== 'USER',
  assignStatusTag:  (role: UserRole) => role === 'SUPERADMIN',
  seeAdminUI:       (role: UserRole) => role !== 'USER',
  seeAdminDashboard:(role: UserRole) => role === 'SUPERADMIN',
  manageUsers:      (role: UserRole) => role === 'SUPERADMIN',
  resolveComment:   (role: UserRole) => role !== 'USER',
  comment:          (_role: UserRole) => true,
};

export type AssetStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'REMOVED';

export const STATUS_CONFIG: Record<AssetStatus, { label: string; color: string; bg: string }> = {
  CONFIRMED:    { label: 'Confirmed',    color: '#16a34a', bg: '#dcfce7' },
  IN_PROGRESS:  { label: 'In Progress',  color: '#2563eb', bg: '#dbeafe' },
  UNDER_REVIEW: { label: 'Under Review', color: '#d97706', bg: '#fef3c7' },
  REMOVED:      { label: 'Removed',      color: '#db2777', bg: '#fce7f3' },
};

export const NAME_TAGS = ['Auth', 'Home', 'Trading', 'Market', 'Wallet'] as const;
export type NameTag = typeof NAME_TAGS[number];
export const NAME_TAG_CONFIG: Record<NameTag, { color: string; bg: string }> = {
  Auth:    { color: '#2563eb', bg: '#dbeafe' },
  Home:    { color: '#059669', bg: '#d1fae5' },
  Trading: { color: '#7c3aed', bg: '#ede9fe' },
  Market:  { color: '#d97706', bg: '#fef3c7' },
  Wallet:  { color: '#0891b2', bg: '#e0f2fe' },
};

export const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SUPERADMIN: { label: 'Super Admin', color: '#7c3aed', bg: '#ede9fe' },
  MANAGER:    { label: 'Manager',     color: '#0369a1', bg: '#e0f2fe' },
  CREATOR:    { label: 'Creator',     color: '#059669', bg: '#d1fae5' },
  QA:         { label: 'QA',          color: '#d97706', bg: '#fef3c7' },
  DEVELOPER:  { label: 'Developer',   color: '#7c3aed', bg: '#ede9fe' },
};
