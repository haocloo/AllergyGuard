import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// external
import { generateCodeVerifier, generateState } from "arctic";
import { github, google } from "@/lib/lucia/auth";
import { log } from "@/lib/logger";

export async function GET(request: NextRequest, { params }: { params: { provider?: string } }): Promise<NextResponse> {

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  let url: URL;

  const provider = params.provider;

  if (!provider) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  try {
    switch (provider) {
      case 'github':
        url = github.createAuthorizationURL(state, ['read:user', 'user:email']);
        break;
      case 'google':
        url = google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);
        url.searchParams.set('access_type', 'offline'); // only get refresh token when first sign in
        url.searchParams.set('prompt', 'consent'); // needed to get refresh token
        break;
      default:
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }
    const response = NextResponse.redirect(url);

  const cookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax" as const,
    };

    cookies().set("oauth_state", state, cookieOptions);
    cookies().set("code_verifier", codeVerifier, cookieOptions);

    return response;
  } catch (error) {
    log.error("Error in OAuth flow:", { message: error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
