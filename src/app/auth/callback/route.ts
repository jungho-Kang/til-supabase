import { NextRequest, NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSideClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // 여기가 추가된 에러 메시지 반환 부분입니다
      return new Response("❌ Supabase 인증 에러: " + error.message, {
        status: 500,
      });
    }

    // 성공 시 정상 리디렉션 처리
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // code 값 자체가 없는 경우
  return new Response("❌ 인증 코드 없음 (Missing ?code=)", {
    status: 400,
  });
}
