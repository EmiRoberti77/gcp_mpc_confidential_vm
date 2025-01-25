import axios from 'axios';

const ip = '34.168.8.100';
async function main() {
  console.log(`VM External IP: ${ip}`);
  console.log('Sending encrypted inputs to the Confidential VM...');

  const party1Input = 15;
  const party2Input = 25;

  // Step 4: Send encrypted data to the Confidential VM
  const response = await axios.post(`http://${ip}:8080/mpc`, {
    party1: encryptInput(party1Input),
    party2: encryptInput(party2Input),
  });

  console.log('Encrypted inputs processed by the Confidential VM...');
  const result = decryptOutput(response.data.result);

  console.log(`The result of the secure computation is: ${result}`);
}

function encryptInput(input: number): string {
  // Replace this with real encryption logic
  return Buffer.from(input.toString()).toString('base64');
}

function decryptOutput(output: string): number {
  // Replace this with real decryption logic
  return parseInt(Buffer.from(output, 'base64').toString('ascii'), 10);
}

// Run the program
main().catch((err) => {
  console.error('Error during MPC execution:', err);
});
