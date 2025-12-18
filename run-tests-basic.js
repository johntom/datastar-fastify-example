/**
 * Test runner for basic.js example
 * Starts the server, runs tests, and cleans up
 */

'use strict';

const { spawn } = require('child_process');

async function runTests() {
  console.log('Starting basic.js example server...');

  // Start the server
  const server = spawn('node', ['examples/basic.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Wait for server to start
  await new Promise((resolve, reject) => {
    const timeoutId = global.setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 10000);

    server.stdout.on('data', (data) => {
      const output = data.toString();
      // Look for the log message that indicates server is ready
      if (output.includes('Server running at http://localhost:3000') ||
          output.includes('Server listening at')) {
        global.clearTimeout(timeoutId);
        console.log('✓ Basic example server started successfully\n');
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      const output = data.toString();
      // Only log actual errors, not debug info
      if (output.includes('ERROR') || output.includes('Error')) {
        console.error('Server error:', output);
      }
    });

    server.on('error', (err) => {
      global.clearTimeout(timeoutId);
      reject(err);
    });
  });

  // Give the server a moment to fully initialize
  await new Promise(resolve => global.setTimeout(resolve, 1000));

  // Run the tests
  console.log('Running basic.js tests...\n');
  const testProcess = spawn('node', ['test-basic.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  await new Promise((resolve, reject) => {
    testProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    testProcess.on('error', reject);
  });

  // Clean up
  console.log('\nShutting down basic.js server...');
  server.kill();

  // Wait for server to shut down
  await new Promise((resolve) => {
    server.on('close', () => {
      console.log('✓ Server stopped');
      resolve();
    });

    // Force kill if it doesn't stop gracefully
    global.setTimeout(() => {
      server.kill('SIGKILL');
      resolve();
    }, 2000);
  });
}

runTests()
  .then(() => {
    console.log('\n✓ All basic.js tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  });
