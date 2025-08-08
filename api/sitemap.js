import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const siteUrl = process.env.VITE_APP_URL || process.env.SITE_URL || 'https://scan2tap.vercel.app';

    const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = (supabaseUrl && supabaseAnonKey)
      ? createClient(supabaseUrl, supabaseAnonKey)
      : null;

    let profilePaths = [];
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('slug, updated_at')
        .not('slug', 'is', null)
        .limit(2000);
      profilePaths = (data || []).map(p => ({
        loc: `${siteUrl}/${p.slug}`,
        lastmod: p.updated_at || new Date().toISOString()
      }));
    }

    const staticPaths = [
      { loc: `${siteUrl}/`, lastmod: new Date().toISOString() },
      { loc: `${siteUrl}/pricing`, lastmod: new Date().toISOString() },
      { loc: `${siteUrl}/contact`, lastmod: new Date().toISOString() }
    ];

    const urls = [...staticPaths, ...profilePaths];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send('');
  }
}

