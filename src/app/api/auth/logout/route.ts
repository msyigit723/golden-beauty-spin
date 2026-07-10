import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({ message: 'Başarıyla çıkış yapıldı.' }, { status: 200 });
  const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
  
  response.cookies.set('gbs-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  
  return response;
}
