#!/usr/bin/env node
/**
 * Update Supabase auth Site URL and Redirect URLs for Mod Cellular.
 * Requires: SUPABASE_ACCESS_TOKEN (Personal Access Token from supabase.com/dashboard/account/tokens)
 *
 * Usage: SUPABASE_ACCESS_TOKEN=your_pat node supabase-auth-urls.js
 */

const PROJECT_REF = 'cpgzsjqmkvhmshcvnyyf';
const SITE_URL = 'https://mod-cellular.netlify.app';

const REDIRECT_URLS = [
  'https://mod-cellular.netlify.app',
  'https://mod-cellular.netlify.app/',
  'https://mod-cellular.netlify.app/messages',
  'https://mod-cellular.netlify.app/dialer',
  'https://mod-cellular.netlify.app/wallet',
  'https://mod-cellular.netlify.app/settings',
  'https://mod-cellular.netlify.app/device-control',
];

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Error: SUPABASE_ACCESS_TOKEN required');
  console.error('Get one at: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function getAuthConfig() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function updateAuthConfig(body) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  console.log('Fetching current auth config...');
  const current = await getAuthConfig();
  console.log('Current site_url:', current.site_url);
  console.log('Current uri_allow_list:', current.uri_allow_list);

  const uriAllowList = (current.uri_allow_list || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const newList = [...new Set([...uriAllowList, ...REDIRECT_URLS])];

  console.log('\nUpdating Site URL and Redirect URLs...');
  const updated = await updateAuthConfig({
    site_url: SITE_URL,
    uri_allow_list: newList.join(','),
  });

  console.log('\nDone.');
  console.log('Site URL:', updated.site_url);
  console.log('Redirect URLs:', updated.uri_allow_list);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
