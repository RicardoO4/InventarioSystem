import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const RUTAS_PUBLICAS = ["/login", "/auth"];

function esRutaPublica(pathname: string): boolean {
  return RUTAS_PUBLICAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );
}

function conCookies(origen: NextResponse, destino: NextResponse): NextResponse {
  origen.cookies.getAll().forEach((cookie) => destino.cookies.set(cookie));
  return destino;
}

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request: { headers: requestHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
      },
    },
  });

  // IMPORTANTE: no ejecutar código entre createServerClient y getClaims().
  let autenticado = false;
  try {
    const { data } = await supabase.auth.getClaims();
    autenticado = Boolean(data?.claims?.sub);
  } catch {
    autenticado = false;
  }

  const { pathname } = request.nextUrl;

  if (!autenticado && !esRutaPublica(pathname)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return conCookies(supabaseResponse, NextResponse.redirect(url));
  }

  if (autenticado && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return conCookies(supabaseResponse, NextResponse.redirect(url));
  }

  return supabaseResponse;
}
