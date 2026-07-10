import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signUserToken } from '@/lib/jwt';
import { validatePhone, validateRequired } from '@/utils/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!validateRequired(phone) || !validateRequired(password)) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    if (!validatePhone(phone)) {
      return NextResponse.json({ error: 'Geçersiz telefon numarası formatı.' }, { status: 400 });
    }

    const cleanPhone = phone.trim();

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id, name, surname, phone, password_hash, created_at')
      .eq('phone', cleanPhone)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Telefon numarası veya şifre hatalı.' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password.trim(), user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Telefon numarası veya şifre hatalı.' }, { status: 401 });
    }

    // Generate JWT
    const token = signUserToken(user.id);

    // Create response
    const response = NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        created_at: user.created_at
      }
    }, { status: 200 });

    // Set HTTP-only cookie
    // Max age in seconds: 7 days
    const maxAge = 7 * 24 * 60 * 60;
    const isHttps = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';
    
    response.cookies.set('gbs-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
