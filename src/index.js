// Cloudflare Worker: locked-down CORS proxy for Barnes & Noble store pages only
export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const target = new URL(request.url).searchParams.get('url') || '';
    let host = '';
    try { host = new URL(target).hostname; } catch {}
    if (host !== 'stores.barnesandnoble.com') {
      return new Response('404 NOT FOUND', { status: 400, headers: cors });
    }

    const res = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (poet-tracker)', 'Accept': 'text/html' },
      redirect: 'follow',
      // cache found pages for an hour, "not found" only 5 min so new events show up fast
      cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 3600, '404': 300, '500-599': 0 } }
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};