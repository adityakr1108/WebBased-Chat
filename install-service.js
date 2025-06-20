const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'ChatUI Service',
  description: 'The chat application service',
  script: path.join(__dirname, 'server.js'),
  nodeOptions: [],
  env: [{
    name: "NODE_ENV",
    value: "production"
  }]
});

// Listen for the "install" event
svc.on('install', function() {
  console.log('Service installed successfully!');
  svc.start();
});

// Install the service
svc.install();
