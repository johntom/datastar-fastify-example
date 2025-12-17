// minimal-test.js - Ultra simple test to diagnose the issue
const fastify = require('fastify')({ logger: true });

// Simple home page
fastify.get('/', async (request, reply) => {
  console.log('HOME PAGE REQUESTED');
  return reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Test</title>
      <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js?v=2"></script></script>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        button { padding: 10px 20px; margin: 10px 5px; font-size: 16px; cursor: pointer; }
        #result { 
          margin-top: 20px; 
          padding: 20px; 
          border: 2px solid #ccc; 
          min-height: 50px;
          background: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <h1>Server is working!</h1>
      
      <div data-signals="{test: 'initial', serverMessage: ''}">
        <p>Signal value: <span data-text="$test"></span></p>
        <p>Server message: <span data-text="$serverMessage"></span></p>
        <button data-on-click="$test = 'changed'">Change Signal (Local)</button>
        <button data-on-click="@get('/sse-test')">Test SSE (Server)</button>
      </div>
      
      <div id="result">
        <p>⏳ Waiting for SSE test... Click button above.</p>
      </div>
      
      <script>
        console.log('Page loaded, Datastar should be active');
        
        // Check if Datastar is available
        setTimeout(() => {
          console.log('Checking for Datastar...');
          console.log('window.ds:', typeof window.ds);
          console.log('window.Datastar:', typeof window.Datastar);
        }, 100);
        
        // Try BOTH window and document event listeners
        window.addEventListener('datastar-sse', (evt) => {
          console.log('🔔 (window) SSE Event:', evt.detail.type);
          console.log('   Full detail:', evt.detail);
        });
        
        document.addEventListener('datastar-sse', (evt) => {
          console.log('🔔 (document) SSE Event:', evt.detail.type);
          console.log('   Full detail:', evt.detail);
          
          // Show the argsRaw contents
          if (evt.detail.argsRaw) {
            console.log('   argsRaw:', JSON.stringify(evt.detail.argsRaw, null, 2));
          }
        });
        
        // Listen on the specific button element too
        document.body.addEventListener('datastar-sse', (evt) => {
          console.log('🔔 (body) SSE Event:', evt.detail.type, evt.detail);
        }, true); // Use capture phase
        
        // Also check what's in #result
        const resultDiv = document.getElementById('result');
        console.log('Initial #result content:', resultDiv.innerHTML);
        
        // Watch for ANY changes to #result
        const observer = new MutationObserver((mutations) => {
          console.log('✨ #result CHANGED!');
          console.log('   New content:', resultDiv.innerHTML);
        });
        observer.observe(resultDiv, { 
          childList: true, 
          subtree: true, 
          characterData: true,
          attributes: true 
        });
      </script>
    </body>
    </html>
  `);
});

// SSE test endpoint
fastify.get('/sse-test', async (request, reply) => {
  console.log('SSE TEST ENDPOINT HIT');
  
  const time = new Date().toLocaleTimeString();
  
  // Test BOTH signals and elements
  const response = 
    'event: datastar-patch-signals\n' +
    `data: signals {"serverMessage":"Server responded at ${time}"}\n\n` +
    'event: datastar-patch-elements\n' +
    'data: elements <div id="result"><h2 style="color: green;">SUCCESS!</h2><p>SSE working at ' + time + '</p></div>\n\n';
  
  console.log('Sending SSE response:');
  console.log(response);
  
  return reply
    .type('text/event-stream')
    .header('Cache-Control', 'no-cache')
    .header('Connection', 'keep-alive')
    .send(response);
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('\n========================================');
    console.log('TEST SERVER RUNNING ON PORT 3000');
    console.log('Open: http://localhost:3000');
    console.log('========================================\n');
  } catch (err) {
    console.error('ERROR STARTING SERVER:', err);
    process.exit(1);
  }
};

start();