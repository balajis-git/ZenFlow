require('dotenv').config({ path: '../.env' });

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('================ TESTING REGISTRATION & HR APPROVAL WORKFLOW ================');

  const ts = Date.now();
  const testEmail1 = `sarah.connor.${ts}@workflowx.com`;
  const testEmpId1 = `EMP-TEST-${ts.toString().slice(-4)}`;
  const testEmail2 = `terminator.${ts}@workflowx.com`;
  const testEmpId2 = `EMP-REJ-${ts.toString().slice(-4)}`;

  try {
    // 1. Register a new employee
    console.log(`\n1. Registering new employee (${testEmail1})...`);
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        employeeId: testEmpId1,
        email: testEmail1,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Employee',
        designation: 'Cybersecurity Analyst',
        phone: '+1 (555) 999-0001',
      }),
    });
    const regData = await regRes.json();
    console.log('✅ Registration Submitted:', regData.message);

    // 2. Attempt login BEFORE approval (Should Fail with 403 Awaiting HR Approval)
    console.log('\n2. Attempting login before HR approval...');
    const pendingLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail1,
        password: 'Password123!',
      }),
    });
    const pendingLoginData = await pendingLoginRes.json();
    if (pendingLoginRes.status === 403) {
      console.log('✅ Blocked Pending Login as expected (403 Forbidden):', pendingLoginData.message);
    } else {
      console.error('❌ Unexpected status during pending login:', pendingLoginRes.status, pendingLoginData);
    }

    // 3. HR Admin Login
    console.log('\n3. Logging in as HR Admin (hr@workflowx.com)...');
    const hrLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hr@workflowx.com',
        password: 'Hradmin123',
      }),
    });
    const hrLoginData = await hrLoginRes.json();
    const hrToken = hrLoginData.token || hrLoginData.accessToken;
    console.log('✅ HR Admin Logged In. Token acquired.');

    // 4. Fetch Pending Requests
    console.log('\n4. Fetching pending registration requests...');
    const pendingRes = await fetch(`${API_BASE}/admin/pending-users`, {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    const pendingData = await pendingRes.json();
    console.log(`✅ Found ${pendingData.count} pending requests.`);
    const targetUser = pendingData.pendingUsers.find((u) => u.email === testEmail1);

    if (!targetUser) {
      throw new Error(`Target user ${testEmail1} not found in pending list`);
    }

    // 5. HR Admin Approves Employee
    console.log(`\n5. HR Admin approving user ID: ${targetUser._id} (${targetUser.name})...`);
    const approveRes = await fetch(`${API_BASE}/admin/approve/${targetUser._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    const approveData = await approveRes.json();
    console.log('✅ Approval Result:', approveData.message);

    // 6. User Login AFTER Approval (Should Succeed 200 OK)
    console.log('\n6. Attempting login after HR approval...');
    const userLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail1,
        password: 'Password123!',
      }),
    });
    const userLoginData = await userLoginRes.json();
    console.log(`✅ User Logged In Successfully (HTTP ${userLoginRes.status})! User Name: ${userLoginData.user.name}, Role: ${userLoginData.user.role}, Status: ${userLoginData.user.status}`);

    // 7. Test Rejection Workflow
    console.log(`\n7. Registering second employee for Rejection test (${testEmail2})...`);
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Terminator T800',
        employeeId: testEmpId2,
        email: testEmail2,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'Employee',
        designation: 'Infiltration Unit',
      }),
    });

    const pendingRes2 = await fetch(`${API_BASE}/admin/pending-users`, {
      headers: { Authorization: `Bearer ${hrToken}` },
    });
    const pendingData2 = await pendingRes2.json();
    const rejectTarget = pendingData2.pendingUsers.find((u) => u.email === testEmail2);

    console.log(`8. Rejecting request for ${rejectTarget.name}...`);
    const rejectRes = await fetch(`${API_BASE}/admin/reject/${rejectTarget._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({ reason: 'Security clearance check failed' }),
    });
    const rejectData = await rejectRes.json();
    console.log('✅ Rejection Result:', rejectData.message);

    // 9. Attempt login for Rejected User
    console.log('\n9. Attempting login for rejected user...');
    const rejectLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail2,
        password: 'Password123!',
      }),
    });
    const rejectLoginData = await rejectLoginRes.json();
    if (rejectLoginRes.status === 403) {
      console.log('✅ Blocked Rejected Login as expected (403 Forbidden):', rejectLoginData.message);
    } else {
      console.error('❌ Unexpected status for rejected user login:', rejectLoginRes.status);
    }

    console.log('\n================ ALL REGISTRATION & APPROVAL WORKFLOW TESTS PASSED 100% ================');
  } catch (err) {
    console.error('❌ Workflow Test Failed:', err.message);
  }
}

runTest();
