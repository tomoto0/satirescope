import { encryptReversible, decryptReversible } from './server/crypto.ts';

/**
 * Test encryption and decryption functionality
 */
async function testCrypto() {
  console.log('Starting crypto tests...\n');

  // Test data
  const testData = [
    'my-api-key-12345',
    'my-api-secret-67890',
    'access-token-abcdef',
    'access-secret-ghijkl',
  ];

  try {
    for (const data of testData) {
      console.log(`Testing: ${data}`);

      // Encrypt
      const encrypted = encryptReversible(data);
      console.log(`  Encrypted: ${encrypted.substring(0, 20)}...`);

      // Decrypt
      const decrypted = decryptReversible(encrypted);
      console.log(`  Decrypted: ${decrypted}`);

      // Verify
      if (decrypted === data) {
        console.log(`  ✓ PASS: Encryption/Decryption works correctly\n`);
      } else {
        console.log(`  ✗ FAIL: Decrypted value doesn't match original\n`);
      }
    }

    console.log('All crypto tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testCrypto();
