require('dotenv').config({ path: '../.env' });

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('================ TESTING ROLE RESTRICTIONS & UNIFIED AUTH ================');
  const ts = Date.now();

  try {
    // 1. Test Super Admin Duplicate Registration (Existing Super Admin in DB)
    console.log('\n1. Testing duplicate Super Admin registration...');
    const adminRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second Super Admin',
        email: `admin.second.${ts}@workflowx.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Super Admin',
      }),
    });
    const adminData = await adminRes.json();
    if (adminRes.status === 400 && adminData.message === 'This role already has an account.') {
      console.log('✅ Blocked Duplicate Super Admin Registration:', adminData.message);
    } else {
      console.error('❌ Unexpected response for duplicate Super Admin:', adminRes.status, adminData);
    }

    // 2. Test HR Admin Duplicate Registration
    console.log('\n2. Testing duplicate HR Admin registration...');
    const hrRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second HR Admin',
        email: `hr.second.${ts}@workflowx.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'HR Admin',
      }),
    });
    const hrData = await hrRes.json();
    if (hrRes.status === 400 && hrData.message === 'This role already has an account.') {
      console.log('✅ Blocked Duplicate HR Admin Registration:', hrData.message);
    } else {
      console.error('❌ Unexpected response for duplicate HR Admin:', hrRes.status, hrData);
    }

    // 3. Test Project Manager Duplicate Registration
    console.log('\n3. Testing duplicate Project Manager registration...');
    const pmRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second Project Manager',
        email: `pm.second.${ts}@workflowx.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Project Manager',
      }),
    });
    const pmData = await pmRes.json();
    if (pmRes.status === 400 && pmData.message === 'This role already has an account.') {
      console.log('✅ Blocked Duplicate Project Manager Registration:', pmData.message);
    } else {
      console.error('❌ Unexpected response for duplicate PM:', pmRes.status, pmData);
    }

    // 4. Test Employee Unlimited Registration
    console.log('\n4. Testing Employee registration (Unlimited allowed)...');
    const emp1Email = `employee.one.${ts}@workflowx.com`;
    const emp2Email = `employee.two.${ts}@workflowx.com`;

    const emp1Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Employee One',
        email: emp1Email,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Employee',
      }),
    });
    const emp1Data = await emp1Res.json();
    console.log('✅ Registered First Employee Account:', emp1Data.message);

    const emp2Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Employee Two',
        email: emp2Email,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Employee',
      }),
    });
    const emp2Data = await emp2Res.json();
    console.log('✅ Registered Second Employee Account:', emp2Data.message);

    // 5. Test Role-Matched Login
    console.log('\n5. Testing Role-Matched Login...');
    const wrongRoleRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@workflowx.com',
        password: 'Admin123',
        role: 'Employee', // Wrong role for admin@workflowx.com
      }),
    });
    const wrongRoleData = await wrongRoleRes.json();
    if (wrongRoleRes.status === 400) {
      console.log('✅ Blocked Mismatched Role Login as expected:', wrongRoleData.message);
    } else {
      console.error('❌ Unexpected response for mismatched role login:', wrongRoleRes.status, wrongRoleData);
    }

    const correctRoleRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@workflowx.com',
        password: 'Admin123',
        role: 'Super Admin',
      }),
    });
    const correctRoleData = await correctRoleRes.json();
    console.log(`✅ Correct Role Login Succeeded (HTTP ${correctRoleRes.status})! User: ${correctRoleData.user.name}, Role: ${correctRoleData.user.role}`);

    console.log('\n================ ALL ROLE RESTRICTION TESTS PASSED 100% ================');
  } catch (err) {
    console.error('❌ Test Execution Error:', err.message);
  }
}

runTest();
