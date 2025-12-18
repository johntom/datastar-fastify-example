# Testing Guide

This directory contains automated tests for the Datastar Fastify example applications, following the same pattern as the `datastar-fastify-sdk` test suite.

## Test Structure

The test suite is organized as follows:

```
datastar-fastify-example/
├── examples/
│   ├── basic.js          # Basic example server
│   └── todo.js           # Todo app example server
├── test-basic.js         # Test client for basic.js
├── test-todo.js          # Test client for todo.js
├── run-tests-basic.js    # Test runner for basic.js
├── run-tests-todo.js     # Test runner for todo.js
└── run-all-tests.js      # Master test runner
```

## Running Tests

### Run All Tests

```bash
npm test
```

This will run all test suites sequentially and provide a summary of results.

### Run Individual Test Suites

**Test the basic.js example:**
```bash
npm run test:basic
```

**Test the todo.js example:**
```bash
npm run test:todo
```

### Run Test Components Manually

If you need more control, you can run components separately:

**1. Start a server manually:**
```bash
node examples/basic.js
# or
node examples/todo.js
```

**2. Run the test client in another terminal:**
```bash
node test-basic.js
# or
node test-todo.js
```

## Test Coverage

### Basic Example Tests (`test-basic.js`)

Tests for `examples/basic.js`:

1. **Increment Counter** - Tests GET `/api/increment`
   - Verifies SSE response with updated count signal

2. **Decrement Counter** - Tests GET `/api/decrement`
   - Verifies count decrements correctly

3. **Reset** - Tests POST `/api/reset`
   - Verifies both count and message signals reset

4. **Update Message** - Tests POST `/api/update-message`
   - Verifies signal updates and element patching
   - Tests request body signal reading

5. **Execute Script (Alert)** - Tests GET `/api/alert`
   - Verifies script execution event

6. **Console Log** - Tests GET `/api/console-log`
   - Verifies console.log script execution
   - Tests element appending

7. **Time Stream** - Tests GET `/api/time-stream`
   - Verifies long-lived SSE connections
   - Confirms multiple patch events over time

### Todo Example Tests (`test-todo.js`)

Tests for `examples/todo.js`:

1. **Create Todo** - Tests POST `/api/todos`
   - Verifies todo creation with signals and elements
   - Extracts todo ID for subsequent tests

2. **Create Empty Todo** - Tests POST `/api/todos` with empty text
   - Verifies validation error handling

3. **Toggle Todo Completion** - Tests POST `/api/todos/:id/toggle`
   - Verifies todo state updates

4. **Filter Todos (All)** - Tests POST `/api/todos/filter/all`
   - Verifies filter signal and list re-render

5. **Filter Todos (Active)** - Tests POST `/api/todos/filter/active`
   - Tests active filter functionality

6. **Filter Todos (Completed)** - Tests POST `/api/todos/filter/completed`
   - Tests completed filter functionality

7. **Clear Completed** - Tests POST `/api/todos/clear-completed`
   - Verifies removal of completed todos

8. **Delete Todo** - Tests DELETE `/api/todos/:id`
   - Verifies todo deletion and element removal

## Test Pattern

The tests follow the same pattern as the `datastar-fastify-sdk` test suite:

### Test Runner Pattern

1. **Spawn the server** process
2. **Wait for startup** by monitoring stdout for ready message
3. **Run the test client** that makes HTTP requests
4. **Verify SSE responses** contain expected events and data
5. **Clean up** by killing the server process

### Test Client Pattern

Each test client:
- Makes HTTP requests to server endpoints
- Includes `datastar-request: true` header
- Reads SSE response streams
- Validates response format and content
- Reports pass/fail status

### SSE Response Validation

Tests verify that responses contain:
- Correct Content-Type: `text/event-stream`
- Expected Datastar event types:
  - `datastar-patch-signals`
  - `datastar-patch-elements`
  - `datastar-execute-script`
  - `datastar-remove-elements`
- Correct signal/element data

## Adding New Tests

To add tests for a new example:

1. **Create test client** (e.g., `test-newfeature.js`):
   ```javascript
   async function testNewFeature() {
     const baseUrl = 'http://127.0.0.1:PORT';

     // Test your endpoints
     const response = await fetch(`${baseUrl}/api/endpoint`, {
       headers: { 'datastar-request': 'true' }
     });

     // Read and validate SSE stream
     const reader = response.body.getReader();
     // ... validation logic
   }
   ```

2. **Create test runner** (e.g., `run-tests-newfeature.js`):
   ```javascript
   const server = spawn('node', ['examples/newfeature.js']);
   // Wait for server startup
   // Run test client
   // Clean up
   ```

3. **Add to master runner** (`run-all-tests.js`):
   ```javascript
   const tests = [
     // ... existing tests
     { file: 'run-tests-newfeature.js', description: 'New Feature Tests' }
   ];
   ```

4. **Update package.json**:
   ```json
   "scripts": {
     "test:newfeature": "node run-tests-newfeature.js"
   }
   ```

## Debugging Tests

### Enable Verbose Logging

The servers use Fastify's logger. To see detailed logs:

1. Modify the test runner to use `stdio: 'inherit'` for server process
2. Or add logging in the test client

### Common Issues

**Server doesn't start:**
- Check if port is already in use
- Increase timeout in test runner
- Verify example file path is correct

**Tests timeout:**
- Server may not be sending proper SSE response format
- Check server is registered with datastar plugin
- Verify response headers (Content-Type, Cache-Control, etc.)

**SSE parsing errors:**
- Ensure proper SSE format: `event: name\\ndata: value\\n\\n`
- Check for double newlines at end of events
- Verify JSON in data lines is valid

## CI/CD Integration

To integrate with CI/CD:

```bash
# In your CI pipeline
npm install
npm test
```

The test runner exits with code 0 on success, 1 on failure, making it suitable for automated testing.

## Test Dependencies

Tests use only Node.js built-in modules:
- `child_process` - For spawning server processes
- `fetch` - For HTTP requests (Node 18+)

No additional test frameworks are required.

## Further Reading

- [Datastar Documentation](https://data-star.dev)
- [Datastar Fastify SDK](https://github.com/johntom/datastar-fastify-sdk)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
