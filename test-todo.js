/**
 * Test client for todo.js example
 * Tests the todo CRUD operations and SSE responses
 */

'use strict';

async function testTodo() {
  const baseUrl = 'http://127.0.0.1:3001';
  let createdTodoId = null;

  console.log('\n=== Testing todo.js example ===\n');

  // Test 1: Create a new todo
  console.log('=== Test 1: Create Todo ===');
  try {
    const testTodoText = 'Test todo from automated test';
    const response = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'datastar-request': 'true'
      },
      body: JSON.stringify({
        datastar: {
          newTodoText: testTodoText,
          filter: 'all'
        }
      })
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

    // Extract todo ID from the response
    const idMatch = result.match(/id="todo-([^"]+)"/);
    if (idMatch) {
      createdTodoId = idMatch[1];
      console.log(`Created todo with ID: ${createdTodoId}`);
    }

    if (result.includes('datastar-patch-signals') &&
        result.includes('datastar-patch-elements') &&
        result.includes('newTodoText') &&
        result.includes(testTodoText)) {
      console.log('✓ Create todo test passed\n');
    } else {
      throw new Error('Expected signals and elements patches with new todo');
    }
  } catch (error) {
    console.error('✗ Create todo test failed:', error.message);
    throw error;
  }

  // Test 2: Create todo with empty text (should fail)
  console.log('=== Test 2: Create Empty Todo (Should Fail) ===');
  try {
    const response = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'datastar-request': 'true'
      },
      body: JSON.stringify({
        datastar: {
          newTodoText: '',
          filter: 'all'
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

    if (result.includes('error') && result.includes('Please enter a todo')) {
      console.log('✓ Empty todo validation test passed\n');
    } else {
      throw new Error('Expected error message for empty todo');
    }
  } catch (error) {
    console.error('✗ Empty todo validation test failed:', error.message);
    throw error;
  }

  // Test 3: Toggle todo completion (if we have a created todo)
  if (createdTodoId) {
    console.log('=== Test 3: Toggle Todo Completion ===');
    try {
      const response = await fetch(`${baseUrl}/api/todos/${createdTodoId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'datastar-request': 'true'
        },
        body: JSON.stringify({
          datastar: {
            filter: 'all'
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

      if (result.includes('datastar-patch-elements') &&
          result.includes(`todo-${createdTodoId}`)) {
        console.log('✓ Toggle todo test passed\n');
      } else {
        throw new Error('Expected element patch for toggled todo');
      }
    } catch (error) {
      console.error('✗ Toggle todo test failed:', error.message);
      throw error;
    }
  }

  // Test 4: Filter todos - all
  console.log('=== Test 4: Filter Todos (All) ===');
  try {
    const response = await fetch(`${baseUrl}/api/todos/filter/all`, {
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
        result.includes('datastar-patch-elements') &&
        result.includes('filter')) {
      console.log('✓ Filter todos (all) test passed\n');
    } else {
      throw new Error('Expected signals and elements patches for filter');
    }
  } catch (error) {
    console.error('✗ Filter todos test failed:', error.message);
    throw error;
  }

  // Test 5: Filter todos - active
  console.log('=== Test 5: Filter Todos (Active) ===');
  try {
    const response = await fetch(`${baseUrl}/api/todos/filter/active`, {
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
        result.includes('"filter":"active"')) {
      console.log('✓ Filter todos (active) test passed\n');
    } else {
      throw new Error('Expected signals patch with active filter');
    }
  } catch (error) {
    console.error('✗ Filter todos (active) test failed:', error.message);
    throw error;
  }

  // Test 6: Filter todos - completed
  console.log('=== Test 6: Filter Todos (Completed) ===');
  try {
    const response = await fetch(`${baseUrl}/api/todos/filter/completed`, {
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
        result.includes('"filter":"completed"')) {
      console.log('✓ Filter todos (completed) test passed\n');
    } else {
      throw new Error('Expected signals patch with completed filter');
    }
  } catch (error) {
    console.error('✗ Filter todos (completed) test failed:', error.message);
    throw error;
  }

  // Test 7: Clear completed todos
  console.log('=== Test 7: Clear Completed Todos ===');
  try {
    const response = await fetch(`${baseUrl}/api/todos/clear-completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'datastar-request': 'true'
      },
      body: JSON.stringify({
        datastar: {
          filter: 'all'
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

    if (result.includes('datastar-patch-elements')) {
      console.log('✓ Clear completed test passed\n');
    } else {
      throw new Error('Expected elements patch for cleared todos');
    }
  } catch (error) {
    console.error('✗ Clear completed test failed:', error.message);
    throw error;
  }

  // Test 8: Delete todo (if we have a created todo that wasn't cleared)
  // Note: The todo may have been deleted in Test 7 (Clear Completed), so we accept 404
  if (createdTodoId) {
    console.log('=== Test 8: Delete Todo ===');
    try {
      const response = await fetch(`${baseUrl}/api/todos/${createdTodoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'datastar-request': 'true'
        },
        body: JSON.stringify({
          datastar: {
            filter: 'all'
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

      // Accept either success (200 with remove/patch) or 404 (already deleted)
      if (response.status === 404 ||
          result.includes('datastar-remove-elements') ||
          result.includes('datastar-patch-elements')) {
        console.log('✓ Delete todo test passed\n');
      } else {
        throw new Error('Expected remove/patch elements or 404 for deleted todo');
      }
    } catch (error) {
      console.error('✗ Delete todo test failed:', error.message);
      throw error;
    }
  }

  console.log('=== All todo.js tests completed successfully ===\n');
}

testTodo().catch((error) => {
  console.error('\n✗ Test suite failed:', error.message);
  process.exit(1);
});
