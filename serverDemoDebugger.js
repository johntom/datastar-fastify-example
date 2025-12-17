// serverDemo.js - Ultra simple debug version
const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/formbody'));

let tasks = [
  { id: 1, text: 'Task 1', completed: false },
  { id: 2, text: 'Task 2', completed: false }
];

function renderTasks() {
  return tasks.map(t => 
    `<li style="padding: 10px; border: 1px solid #ccc; margin: 5px;"><span>${t.text}</span><button data-on-click="@post('/todos/${t.id}/toggle')">Toggle</button></li>`
  ).join('');
}

fastify.get('/', async (request, reply) => {
  const tasksHtml = renderTasks();
  
  return reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Debug Todo</title>
      <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js"></script>
      <style>
        body { 
          font-family: Arial; 
          max-width: 600px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f0f0f0;
        }
        .container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        input {
          padding: 10px;
          width: 70%;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 4px;
        }
        button {
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover { background: #45a049; }
        ul { list-style: none; padding: 0; }
        .debug { 
          background: yellow; 
          padding: 10px; 
          margin: 10px 0;
          border: 2px solid orange;
        }
      </style>
    </head>
    <body>
      <div class="container" data-signals="{input: ''}">
        <h1>Debug Todo List</h1>
        
        <div class="debug">
          <strong>Debug Info:</strong><br>
          Signal value: "<span data-text="$input"></span>"<br>
          Character count: <span data-text="$input.length"></span>
        </div>
        
        <div style="margin: 20px 0;">
          <input 
            data-bind-input 
            placeholder="Type here..."
          />
          <button data-on-click="console.log('Clicked! Value:', $input); $input.trim() ? @post('/todos') : alert('Please type something')">
            Add Todo
          </button>
        </div>
        
        <ul id="todo-list">
          ${tasksHtml}
        </ul>
      </div>
      
      <script>
        console.log('=== PAGE LOADED ===');
        console.log('Datastar available:', typeof window.Datastar);
        
        // Check CSS
        setTimeout(() => {
          const container = document.querySelector('.container');
          const bg = window.getComputedStyle(container).backgroundColor;
          console.log('Container background:', bg);
          console.log('CSS working:', bg !== 'rgba(0, 0, 0, 0)');
        }, 100);
        
        // Listen for ALL Datastar events
        ['datastar-sse', 'datastar-fetch'].forEach(eventType => {
          document.addEventListener(eventType, (evt) => {
            console.log('🔔 ' + eventType.toUpperCase() + ':', evt.detail.type, evt.detail);
          });
        });
        
        // Watch for tasks container changes
        const observer = new MutationObserver(() => {
          console.log('✨ DOM CHANGED! Task count:', document.querySelectorAll('#todo-list li').length);
        });
        const todoList = document.getElementById('todo-list');
        if (todoList) {
          observer.observe(todoList, { childList: true, subtree: true });
        }
      </script>
    </body>
    </html>
  `);
});

fastify.post('/todos', async (request, reply) => {
  console.log('\n=== POST /todos RECEIVED ===');
  console.log('Body:', request.body);
  
  const signals = request.body.datastar || request.body;
  const text = (signals.input || '').trim();
  
  console.log('Input text:', text);
  
  if (!text) {
    console.log('Empty text!');
    return reply.status(400).send({ error: 'Empty' });
  }
  
  const newTask = {
    id: Date.now(),
    text: text,
    completed: false
  };
  
  tasks.push(newTask);
  console.log('Task added:', newTask);
  console.log('Total tasks:', tasks.length);
  
  const html = renderTasks().replace(/\n/g, ' ');
  
  const response = 
    'event: datastar-patch-elements\n' +
    'data: selector #todo-list\n' +
    'data: mode inner\n' +
    `data: elements ${html}\n\n` +
    'event: datastar-patch-signals\n' +
    'data: signals {"input":""}\n\n';
  
  console.log('Sending SSE response\n');
  
  return reply
    .type('text/event-stream')
    .header('Cache-Control', 'no-cache')
    .send(response);
});

fastify.post('/todos/:id/toggle', async (request, reply) => {
  const id = parseInt(request.params.id);
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  
  return reply
    .type('text/event-stream')
    .header('Cache-Control', 'no-cache')
    .send(
      'event: datastar-patch-elements\n' +
      'data: selector #todo-list\n' +
      'data: mode inner\n' +
      `data: elements ${renderTasks()}\n\n`
    );
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('\n✅ Server at http://localhost:3000\n');
});