import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iuhnbtcmllpqjwituaov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aG5idGNtbGxwcWp3aXR1YW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDI4MjMsImV4cCI6MjA4NDIxODgyM30.J30HRQ3R22aV0tUHELBo5UCMjhT1KesalZfzbcl2PS4'
);

// Title-case each word in a string
function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Normalize a label: title-case each path segment
function normalizeLabel(label) {
  return label.split(' / ').map(seg => titleCase(seg)).join(' / ');
}

async function fixTable(table) {
  const { data, error } = await supabase.from(table).select('id, name_tag');
  if (error) { console.error(`Error fetching ${table}:`, error.message); return; }

  let fixed = 0;
  for (const row of data) {
    if (!row.name_tag) continue;
    const normalized = normalizeLabel(row.name_tag);
    if (normalized !== row.name_tag) {
      const { error: updateErr } = await supabase.from(table).update({ name_tag: normalized }).eq('id', row.id);
      if (updateErr) {
        console.error(`  ❌ [${table}] id=${row.id}: ${updateErr.message}`);
      } else {
        console.log(`  ✅ [${table}] "${row.name_tag}" → "${normalized}"`);
        fixed++;
      }
    }
  }
  if (fixed === 0) console.log(`  ✓ [${table}] All labels already normalized.`);
}

console.log('Normalizing labels...\n');
await fixTable('illustrations');
await fixTable('icons');
console.log('\nDone.');
