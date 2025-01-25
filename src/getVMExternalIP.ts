import { InstancesClient } from '@google-cloud/compute';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';
import fs from 'fs';

async function getVmExternalIp(): Promise<string | undefined> {
  const keyFile = path.join(__dirname, '..', 'key.json');
  console.log('Key file:', keyFile);

  if (!fs.existsSync(keyFile)) {
    console.error('Error:', keyFile, 'not found');
    return undefined;
  }

  const projectId = 'gketest-448214'; // Your project ID
  const zone = 'us-west1-a'; // The zone where the VM is located
  const instanceName = 'emi-mpc-confidential-vm'; // Your VM name

  const auth = new GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const instancesClient = new InstancesClient({ auth });

  try {
    console.log(
      `Retrieving metadata for instance ${instanceName} in zone ${zone}...`
    );
    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });

    const networkInterface = instance.networkInterfaces?.[0];
    const externalIp = networkInterface?.accessConfigs?.[0]?.natIP;

    console.log('External IP:', externalIp);
    return externalIp || '';
  } catch (error) {
    console.error('Error retrieving VM external IP:', error);
    return undefined;
  }
}

getVmExternalIp().then((ip) => {
  if (ip) {
    console.log(`External IP: ${ip}`);
  } else {
    console.log('No external IP found.');
  }
});
