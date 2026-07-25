const dns = require('dns').promises;

async function resolveAtlas() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    const addresses = await dns.resolveSrv('_mongodb._tcp.cluster0.qhrelhs.mongodb.net');
    console.log('SRV Addresses:', addresses);
  } catch (err) {
    console.error('SRV Resolve Error:', err);
  }
}

resolveAtlas();
