const { exec } = require('child_process');
const os = require('os');

// Get all local IP addresses to display
const getLocalIpAddresses = () => {
  const interfaces = os.networkInterfaces();
  const ipAddresses = [];

  // Find all non-internal IPv4 addresses
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddresses.push({
          name: ifname,
          address: iface.address
        });
      }
    });
  });

  return ipAddresses.length > 0 ? ipAddresses : [{ name: 'localhost', address: '127.0.0.1' }];
};

// Get IP addresses
const networkInterfaces = getLocalIpAddresses();

// Display connection information
console.log('\n===== CHAT UI APP =====');
console.log('\nNetwork Interfaces:');

networkInterfaces.forEach(interface => {
  console.log(`- ${interface.name}: ${interface.address}`);
});

console.log('\nTo use this app from different computers:');
console.log(`1. On this computer, run: npm run dev`);
console.log(`2. From other computers, open a web browser and navigate to one of these URLs:`);

networkInterfaces.forEach(interface => {
  console.log(`   http://${interface.address}:3000`);
});

console.log('\nServer is running on port 7777');

console.log('\nIf WiFi connections work but Ethernet doesn\'t:');
console.log('- Try using your computer\'s hostname instead:');
console.log(`   http://${os.hostname()}:3000`);
console.log('\n=======================\n');

// Install dependencies if needed
console.log('Checking dependencies...');
exec('npm install concurrently', (error) => {
  if (error) {
    console.error('Error installing dependencies:', error);
    return;
  }
  console.log('Dependencies installed successfully!');
  console.log('\nYou can now start the app with: npm run dev');
});
