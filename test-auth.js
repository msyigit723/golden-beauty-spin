const http = require('http');

async function runTests() {
  const baseUrl = 'http://localhost:3000/api/auth';
  const testPhone = '05' + Math.floor(100000000 + Math.random() * 900000000); // Random unique valid phone
  const testPassword = 'Password123!';

  console.log('--- STARTING AUTH MODULE INTEGRATION TESTS ---');
  console.log('Testing with phone:', testPhone);

  try {
    // 1. REGISTER
    console.log('\n[1] Testing Registration...');
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration',
        surname: 'Test',
        phone: testPhone,
        password: testPassword
      })
    });
    const regBody = await regRes.json();
    if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regBody)}`);
    console.log('Registration SUCCESS:', regBody);

    // 2. LOGIN
    console.log('\n[2] Testing Login...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testPhone,
        password: testPassword
      })
    });
    const loginBody = await loginRes.json();
    if (loginRes.status !== 200) throw new Error(`Login failed: ${JSON.stringify(loginBody)}`);
    
    // Extract the JWT cookie
    const setCookieHeader = loginRes.headers.get('set-cookie');
    if (!setCookieHeader || !setCookieHeader.includes('gbs-token')) {
      throw new Error('Login failed: gbs-token cookie not set in response headers');
    }
    console.log('Login SUCCESS:', loginBody);
    console.log('Cookie Set:', setCookieHeader);

    // Parse the cookie for subsequent requests
    const tokenCookie = setCookieHeader.split(';')[0]; // "gbs-token=..."

    // 3. GET CURRENT USER (/me)
    console.log('\n[3] Testing Current User (/me)...');
    const meRes = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Cookie': tokenCookie
      }
    });
    const meBody = await meRes.json();
    if (meRes.status !== 200) throw new Error(`/me failed: ${JSON.stringify(meBody)}`);
    console.log('/me SUCCESS:', meBody);

    // 4. LOGOUT
    console.log('\n[4] Testing Logout...');
    const logoutRes = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Cookie': tokenCookie
      }
    });
    const logoutBody = await logoutRes.json();
    if (logoutRes.status !== 200) throw new Error(`Logout failed: ${JSON.stringify(logoutBody)}`);
    
    const logoutCookieHeader = logoutRes.headers.get('set-cookie');
    if (!logoutCookieHeader || !logoutCookieHeader.includes('gbs-token=;')) {
      throw new Error('Logout failed: Cookie not cleared. ' + logoutCookieHeader);
    }
    console.log('Logout SUCCESS:', logoutBody);

    console.log('\n--- ALL TESTS PASSED SUCCESSFULLY ---');
    process.exit(0);

  } catch (error) {
    console.error('\n!!! TEST FAILED !!!\n', error);
    process.exit(1);
  }
}

runTests();
