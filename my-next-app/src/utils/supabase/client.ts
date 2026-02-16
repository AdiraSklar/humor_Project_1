import { createBrowserClient, type CookieOptions } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(url, key, {
    cookies: {
      get(name: string) {
        const cookie = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
        return cookie ? cookie.split('=')[1] : undefined;
      },
      set(name: string, value: string, options: CookieOptions) {
        let cookieString = `${name}=${value}; path=${options.path || '/'}`;
        if (options.expires) {
          cookieString += `; expires=${options.expires.toUTCString()}`;
        }
        if (options.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
        }
        if (options.domain) {
          cookieString += `; domain=${options.domain}`;
        }
        if (options.secure) {
          cookieString += `; Secure`;
        }
        if (options.sameSite) {
          cookieString += `; SameSite=${options.sameSite}`;
        }
        document.cookie = cookieString;
      },
      remove(name: string, options: CookieOptions) {
        document.cookie = `${name}=; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:01 GMT; ${options.domain ? `domain=${options.domain}; ` : ''}${options.secure ? 'Secure; ' : ''}${options.sameSite ? `SameSite=${options.sameSite}; ` : ''}`;
      },
    },
  });
}