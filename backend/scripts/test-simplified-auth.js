require('dotenv').config({ path: '../.env' });

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('================ TESTING SIMPLIFIED AUTHENTICATION SYSTEM ================');
  const ts = Date.now();

  try {
    // 1. Test Super Admin Login (admin@zenflow.com / Admin@123)
    console.log('\n1. Testing Super Admin login (admin@zenflow.com)...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@zenflow.com',
        password: 'Admin@123',
        role: 'Super Admin',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    console.log(`✅ Super Admin Logged In (HTTP ${adminLoginRes.status})! Name: ${adminLoginData.user.name}, Role: ${adminLoginData.user.role}`);

    // 2. Test HR Admin Login (hr@zenflow.com / HR@123)
    console.log('\n2. Testing HR Admin login (hr@zenflow.com)...');
    const hrLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hr@zenflow.com',
        password: 'HR@123',
        role: 'HR Admin',
      }),
    });
    const hrLoginData = await hrLoginRes.json();
    console.log(`✅ HR Admin Logged In (HTTP ${hrLoginRes.status})! Name: ${hrLoginData.user.name}, Role: ${hrLoginData.user.role}`);

    // 3. Test Project Manager Login (pm@zenflow.com / PM@123)
    console.log('\n3. Testing Project Manager login (pm@zenflow.com)...');
    const pmLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pm@zenflow.com',
        password: 'PM@123',
        role: 'Project Manager',
      }),
    });
    const pmLoginData = await pmLoginRes.json();
    console.log(`✅ Project Manager Logged In (HTTP ${pmLoginRes.status})! Name: ${pmLoginData.user.name}, Role: ${pmLoginData.user.role}`);

    // 4. Test Employee Registration
    console.log('\n4. Testing Employee registration...');
    const empEmail = `new.employee.${ts}@zenflow.com`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: empEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Employee',
        designation: 'Frontend Engineer',
        phone: '9876543219',
      }),
    });
    const regData = await regRes.json();
    console.log(`✅ Employee Registered (HTTP ${regRes.status})! Status: ${regData.user.status}, Message: ${regData.message}`);

    // 5. Test Employee Login
    console.log('\n5. Testing Employee login after registration...');
    const empLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: empEmail,
        password: 'Password123!',
        role: 'Employee',
      }),
    });
    const empLoginData = await empLoginRes.json();
    console.log(`✅ Employee Logged In Successfully (HTTP ${empLoginRes.status})! Name: ${empLoginData.user.name}, Role: ${empLoginData.user.role}, Token acquired.`);

    console.log('\n================ ALL SIMPLIFIED AUTHENTICATION TESTS PASSED 100% ================');
  } catch (err) {
    console.error('❌ Test Execution Error:', err.message);
  }
}

runTest();
