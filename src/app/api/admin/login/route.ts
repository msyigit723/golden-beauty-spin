import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signAdminToken } from '@/lib/jwt';
import { validateRequired } from '@/utils/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!validateRequired(username) || !validateRequired(password)) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    const cleanUsername = username.trim();

    // Find admin
    const { data: admin } = await supabase
      .from('admins')
      .select('id, username, password_hash')
      .eq('username', cleanUsername)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı.' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password.trim(), admin.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı.' }, { status: 401 });
    }

    // Generate Admin JWT
    const token = signAdminToken(admin.id);

    // Create response
    const response = NextResponse.json({ 
      admin: {
        id: admin.id,
        username: admin.username,
      }
    }, { status: 200 });

    // Set HTTP-only cookie
    // Max age in seconds: 8 hours
    const maxAge = 8 * 60 * 60;
    const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    
    response.cookies.set('gbs-admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return response;
  } catch (error) {
    console.error('Admin Login API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
