/**
 * Master test runner
 * Runs all example tests sequentially
 */

'use strict';

const { spawn } = require('child_process');

async function runTestFile(testFile, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running ${description}...`);
  console.log('='.repeat(60));

  return new Promise((resolve, reject) => {
    const testProcess = spawn('node', [testFile], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✓ ${description} completed successfully`);
        resolve();
      } else {
        reject(new Error(`${description} failed with code ${code}`));
      }
    });

    testProcess.on('error', (err) => {
      reject(new Error(`Failed to run ${description}: ${err.message}`));
    });
  });
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('DATASTAR FASTIFY EXAMPLE TEST SUITE');
  console.log('='.repeat(60));

  const tests = [
    { file: 'run-tests-basic.js', description: 'Basic Example Tests' },
    { file: 'run-tests-todo.js', description: 'Todo Example Tests' }
  ];

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    try {
      await runTestFile(test.file, test.description);
      passed++;
    } catch (error) {
      failed++;
      failures.push({ test: test.description, error: error.message });
      console.error(`\n✗ ${test.description} failed:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailed tests:');
    failures.forEach(f => {
      console.log(`  - ${f.test}: ${f.error}`);
    });
  }

  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    throw new Error(`${failed} test suite(s) failed`);
  }
}

runAllTests()
  .then(() => {
    console.log('✓ All test suites passed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Test suites failed:', error.message, '\n');
    process.exit(1);
  });
