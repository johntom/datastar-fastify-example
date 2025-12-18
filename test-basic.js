/**
 * Test client for basic.js example
 * Tests the various endpoints and SSE responses
 */

'use strict';

async function testBasic() {
  const baseUrl = 'http://127.0.0.1:3000';

  console.log('\n=== Testing basic.js example ===\n');

  // Test 1: Increment counter
  console.log('=== Test 1: Increment Counter ===');
  try {
    const response = await fetch(`${baseUrl}/api/increment`, {
      method: 'GET',
      headers: {
        'datastar-request': 'true'
      }
    });

    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    console.log('Response:\n', result);

    if (result.includes('datastar-patch-signals') && result.includes('count')) {
      console.log('✓ Increment test passed\n');
    } else {
      throw new Error('Expected signals patch with count');
    }
  } catch (error) {
    console.error('✗ Increment test failed:', error.message);
    throw error;
  }

  // Test 2: Decrement counter
  console.log('=== Test 2: Decrement Counter ===');
  try {
    const response = await fetch(`${baseUrl}/api/decrement`, {
      method: 'GET',
      headers: {
        'datastar-request': 'true'
      }
    });

    console.log('Status:', response.status);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    console.log('Response:\n', result);

    if (result.includes('datastar-patch-signals') && result.includes('count')) {
      console.log('✓ Decrement test passed\n');
    } else {
      throw new Error('Expected signals patch with count');
    }
  } catch (error) {
    console.error('✗ Decrement test failed:', error.message);
    throw error;
  }

  // Test 3: Reset
  console.log('=== Test 3: Reset ===');
  try {
    const response = await fetch(`${baseUrl}/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'datastar-request': 'true'
      },
      body: JSON.stringify({})
    });

    console.log('Status:', response.status);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    console.log('Response:\n', result);

    if (result.includes('datastar-patch-signals') &&
        result.includes('count') &&
        result.includes('message')) {
      console.log('✓ Reset test passed\n');
    } else {
      throw new Error('Expected signals patch with count and message');
    }
  } catch (error) {
    console.error('✗ Reset test failed:', error.message);
    throw error;
  }

  // Test 4: Update message
  console.log('=== Test 4: Update Message ===');
  try {
    const testMessage = 'Test message from client';
    const response = await fetch(`${baseUrl}/api/update-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'datastar-request': 'true'
      },
      body: JSON.stringify({
        datastar: {
          message: testMessage
        }
      })
    });

    console.log('Status:', response.status);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    console.log('Response:\n', result);

    if (result.includes('datastar-patch-signals') &&
        result.includes('datastar-patch-elements') &&
        result.includes('message')) {
      console.log('✓ Update message test passed\n');
    } else {
      throw new Error('Expected signals and elements patches');
    }
  } catch (error) {
    console.error('✗ Update message test failed:', error.message);
    throw error;
  }

  // Test 5: Execute script (alert)
  console.log('=== Test 5: Execute Script (Alert) ===');
  try {
    const response = await fetch(`${baseUrl}/api/alert`, {
      method: 'GET',
      headers: {
        'datastar-request': 'true'
      }
    });

    console.log('Status:', response.status);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    console.log('Response:\n', result);

    // In Datastar RC.6, scripts are executed via patch-elements with <script> tags
    if (result.includes('datastar-patch-elements') && result.includes('alert')) {
      console.log('✓ Execute script test passed\n');
    } else {
      throw new Error('Expected script execution via patch-elements');
    }
  } catch (error) {
    console.error('✗ Execute script test failed:', error.message);
    throw error;
  }

  // Test 6: Console log
  console.log('=== Test 6: Console Log ===');
  try {
    const response = await fetch(`${baseUrl}/api/console-log`, {
      method: 'GET',
      headers: {
        'datastar-request': 'true'
      }
    });

    console.log('Status:', response.status);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    console.log('Response:\n', result);

    // In Datastar RC.6, scripts are executed via patch-elements with <script> tags
    if (result.includes('datastar-patch-elements') && result.includes('console.log')) {
      console.log('✓ Console log test passed\n');
    } else {
      throw new Error('Expected script execution via patch-elements with console.log');
    }
  } catch (error) {
    console.error('✗ Console log test failed:', error.message);
    throw error;
  }

  // Test 7: Time stream (long-lived connection)
  console.log('=== Test 7: Time Stream ===');
  try {
    const response = await fetch(`${baseUrl}/api/time-stream`, {
      method: 'GET',
      headers: {
        'datastar-request': 'true'
      }
    });

    console.log('Status:', response.status);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let patchCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;

      // Count patch events
      const patches = chunk.match(/event: datastar-patch-elements/g);
      if (patches) {
        patchCount += patches.length;
      }
    }

    console.log('Response:\n', result);
    console.log(`Received ${patchCount} patch events`);

    if (patchCount >= 5 && result.includes('server-time')) {
      console.log('✓ Time stream test passed\n');
    } else {
      throw new Error('Expected multiple time patches');
    }
  } catch (error) {
    console.error('✗ Time stream test failed:', error.message);
    throw error;
  }

  console.log('=== All basic.js tests completed successfully ===\n');
}

testBasic().catch((error) => {
  console.error('\n✗ Test suite failed:', error.message);
  process.exit(1);
});
