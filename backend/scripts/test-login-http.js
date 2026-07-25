const http = require('http');

const makeLoginRequest = (cred) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email: cred.email, password: cred.password });

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, cred });
        } catch (e) {
          resolve({ status: res.statusCode, error: body, cred });
        }
      });
    });

    req.on('error', (err) => resolve({ error: err.message, cred }));
    req.write(data);
    req.end();
  });
};

const testHttpLogins = async () => {
  const credentials = [
    { role: 'Super Admin', email: 'admin@workflowx.com', password: 'Admin123' },
    { role: 'HR Admin', email: 'hr@workflowx.com', password: 'Hradmin123' },
    { role: 'Project Manager', email: 'pm@workflowx.com', password: 'Project123' },
    { role: 'Employee', email: 'employee@workflowx.com', password: 'Employee123' },
  ];

  console.log('================ TESTING HTTP API LOGINS ================');
  for (const cred of credentials) {
    const res = await makeLoginRequest(cred);
    if (res.status === 200 && res.data?.success && res.data?.token) {
      console.log(`✅ [${cred.role}] ${cred.email} | HTTP 200 OK | Token: ${res.data.token.substring(0, 20)}...`);
    } else {
      console.log(`❌ [${cred.role}] ${cred.email} | HTTP ${res.status} | Error:`, res.data || res.error);
    }
  }
  console.log('=========================================================');
};

testHttpLogins();
