import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  const response = NextResponse.redirect(
    new URL("/dashboard", requestUrl.origin)
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split(";")
            .map((cookie) => {
              const [name, ...rest] = cookie.trim().split("=");
              return {
                name,
                value: rest.join("="),
              };
            }) || [];
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Google OAuth / PKCE callback
  if (code) {
    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);

      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    return response;
  }

  // Email verification callback
  if (tokenHash && type) {
    const { error } =
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as
          | "signup"
          | "invite"
          | "recovery"
          | "email"
          | "email_change",
      });

    if (error) {
      console.error("Email verification error:", error);

      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "Email verification failed. Please try again."
          )}`,
          requestUrl.origin
        )
      );
    }

    return response;
  }

  return NextResponse.redirect(
    new URL("/login", requestUrl.origin)
  );
}