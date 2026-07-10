import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { validatePhone, validatePassword, validateRequired } from '@/utils/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, surname, phone, password } = body;

    // Validate fields
    if (!validateRequired(name) || !validateRequired(surname) || !validateRequired(phone) || !validateRequired(password)) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    if (!validatePhone(phone)) {
      return NextResponse.json({ error: 'Geçersiz telefon numarası formatı.' }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Şifre en az 8 karakter olmalıdır.' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanSurname = surname.trim();

    // Check if phone exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Telefon numarası zaten kayıtlı.' }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password.trim(), salt);

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: cleanName,
          surname: cleanSurname,
          phone: cleanPhone,
          password_hash,
        },
      ])
      .select('id, name, surname, phone, created_at')
      .single();

    if (insertError) {
      console.error('Insert Error:', insertError);
      return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu.' }, { status: 500 });
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
