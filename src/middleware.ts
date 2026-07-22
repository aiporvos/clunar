import { defineMiddleware } from 'astro:middleware';

const LOGIN_PATH = '/tiendanube/login';
const LOGOUT_PATH = '/tiendanube/logout';
const API_PROTECTED = '/api/tiendanube-checklist';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isLoginOrLogout = pathname === LOGIN_PATH || pathname === LOGOUT_PATH;
  const isProtectedPage = pathname === '/tiendanube' && !isLoginOrLogout;
  const isProtectedApi = pathname === API_PROTECTED;

  if ((isProtectedPage || isProtectedApi) && !isLoginOrLogout) {
    const authed = await context.session?.get('tiendanube_auth');
    if (!authed) {
      if (isProtectedApi) {
        return new Response(JSON.stringify({ ok: false, error: 'No autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect(LOGIN_PATH);
    }
  }

  return next();
});
