'use strict';

const neeoapi = require('neeo-sdk');
const controller = require('./controller');

const discoveryInstructions = {
  headerText: 'Chromecast support',
  description: 'Alpha release'
};

// first we set the device info, used to identify it on the Brain
const customCCDevice = neeoapi.buildDevice('chromecast test')
  .setManufacturer('Marlon de Boer')
  .addAdditionalSearchToken('chromecast testing')
  .setType('ACCESSOIRE')

  // Then we add the capabilities of the device
  .addButton({ name: 'toggle', label: 'toggle' })
  .addButtonHander(controller.onButtonPressed)
  
  .enableDiscovery(discoveryInstructions, controller.discoverLiteDevices);

function startSdkExample(brain) {
  console.log('- Start server');
  neeoapi.startServer({
    brain,
    port: 6336,
    name: 'simple-adapter-one',
    devices: [customCCDevice]
  })
  .then(() => {
    console.log('# READY, use the mobile app to search for your newly added adapter!');
  })
  .catch((error) => {
    //if there was any error, print message out to console
    console.error('ERROR!', error.message);
    process.exit(1);
  });
}

const brainIp = process.env.BRAINIP;
if (brainIp) {
  console.log('- use NEEO Brain IP from env variable', brainIp);
  startSdkExample(brainIp);
} else {
  console.log('- discover one NEEO Brain...');
  neeoapi.discoverOneBrain()
    .then((brain) => {
      console.log('- Brain discovered:', brain.name);
      startSdkExample(brain);
    });
}
