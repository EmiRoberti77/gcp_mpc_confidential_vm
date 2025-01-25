import { InstancesClient, ZoneOperationsClient } from '@google-cloud/compute';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';
import fs from 'fs';

async function createConfidentialVM() {
  const keyFile = path.join(__dirname, '..', 'key.json');
  console.log('Service Account Key File:', keyFile);

  if (!fs.existsSync(keyFile)) {
    console.error('Error:', keyFile, 'not found');
    return;
  }

  const projectId = 'gketest-448214';
  const zone = 'us-west1-a';
  const instanceName = 'emi-mpc-confidential-vm';

  const auth = new GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const instancesClient = new InstancesClient({ auth });
  const zoneOperationsClient = new ZoneOperationsClient({ auth });

  const vmConfig = {
    project: projectId,
    zone: zone,
    instanceResource: {
      name: instanceName,
      machineType: `zones/${zone}/machineTypes/n2d-standard-4`, // Adjust machine type as needed
      disks: [
        {
          boot: true,
          initializeParams: {
            sourceImage:
              'projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts', // Example: Ubuntu 20.04
          },
        },
      ],
      networkInterfaces: [
        {
          name: 'global/networks/default', // Default VPC network
          accessConfigs: [
            {
              name: 'External NAT', // Required for external IP
              type: 'ONE_TO_ONE_NAT',
            },
          ],
        },
      ],
      confidentialInstanceConfig: {
        enableConfidentialCompute: true, // This enables Confidential VM
      },
    },
  };

  try {
    console.log('Creating Confidential VM...');
    const [operation] = await instancesClient.insert(vmConfig);
    console.log(`VM creation initiated. Operation: ${operation.name}`);

    // Wait for the operation to complete
    let status: any = '';
    while (status !== 'DONE') {
      console.log('Waiting for operation to complete...');
      const [updatedOperation] = await zoneOperationsClient.get({
        project: projectId,
        zone: zone,
        operation: operation.name!,
      });

      status = updatedOperation.status!;
      console.log(`Current operation status: ${status}`);

      if (status === 'DONE') {
        console.log('Operation completed successfully.');
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before checking again
    }

    console.log('Confidential VM created successfully.');
  } catch (error) {
    console.error('Error creating Confidential VM:', error);
  }
}

createConfidentialVM();
