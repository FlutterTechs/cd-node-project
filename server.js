const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

app.use(express.json());

// In-memory tasks database
let tasks = [
  { id: 1, title: 'Learn Docker and CI/CD basics' },
  { id: 2, title: 'Build a small Node.js application' },
  { id: 3, title: 'Write integration tests for the API' }
];

// Serve the Single Page application HTML inline
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimal Task Planner</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0a0404;
      --card-bg: rgba(28, 10, 10, 0.65);
      --border-color: rgba(239, 68, 68, 0.12);
      --text-main: #fef2f2;
      --text-muted: #fca5a5;
      --primary: #ef4444;
      --primary-hover: #dc2626;
      --danger: #f97316;
      --danger-hover: #ea580c;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-color);
      background-image: radial-gradient(circle at 50% 0%, #7f1d1d 0%, var(--bg-color) 100%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
    }

    .container {
      width: 100%;
      max-width: 480px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(16px);
      border-radius: 1.25rem;
      padding: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 50px rgba(239, 68, 68, 0.03);
    }

    header {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(to right, #ffffff, #fecaca);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.25rem;
    }

    .subtitle {
      font-size: 0.85rem;
      color: #fca5a5;
      opacity: 0.85;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    input[type="text"] {
      flex: 1;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-main);
      font-family: inherit;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.25);
    }

    .btn {
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.25rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn:active {
      transform: translateY(0);
    }

    .task-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1rem;
      background: rgba(239, 68, 68, 0.03);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      transition: all 0.2s ease;
      animation: fadeIn 0.3s ease;
    }

    .task-item:hover {
      background: rgba(239, 68, 68, 0.06);
      border-color: rgba(239, 68, 68, 0.25);
    }

    .task-title {
      font-size: 0.925rem;
      font-weight: 500;
      color: var(--text-main);
    }

    .delete-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
      line-height: 1;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .delete-btn:hover {
      color: var(--danger);
      background: rgba(249, 115, 22, 0.15);
    }

    .empty-state {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
      padding: 2rem 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Task Planner</h1>
      <p class="subtitle">A simple single-page dashboard</p>
    </header>

    <div class="input-group">
      <input type="text" id="taskInput" placeholder="Add a new task..." autocomplete="off">
      <button class="btn" id="addBtn">Add</button>
    </div>

    <ul class="task-list" id="taskList">
      <!-- Tasks dynamically loaded here -->
    </ul>
  </div>

  <script>
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');

    // Load tasks from backend
    async function loadTasks() {
      try {
        const res = await fetch('/api/tasks');
        const tasks = await res.json();
        renderTasks(tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    }

    // Render tasks to the DOM
    function renderTasks(tasks) {
      taskList.innerHTML = '';
      if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">All tasks completed! 🎉</div>';
        return;
      }

      tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = \`
          <span class="task-title">\${escapeHTML(task.title)}</span>
          <button class="delete-btn" onclick="deleteTask(\${task.id})">&times;</button>
        \`;
        taskList.appendChild(li);
      });
    }

    // Add task
    async function addTask() {
      const title = taskInput.value.trim();
      if (!title) return;

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });
        if (res.ok) {
          taskInput.value = '';
          loadTasks();
        }
      } catch (err) {
        console.error('Error adding task:', err);
      }
    }

    // Delete task
    async function deleteTask(id) {
      try {
        const res = await fetch(\`/api/tasks/\${id}\`, {
          method: 'DELETE'
        });
        if (res.ok) {
          loadTasks();
        }
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
      );
    }

    // Event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });

    // Initial load
    loadTasks();
  </script>
</body>
</html>
  `);
});

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newTask = {
    id: Date.now(),
    title
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.json({ success: true });
});

app.listen(PORT, HOST, () => {
  const localAddress = HOST === '0.0.0.0' ? 'localhost' : HOST;
  const networkAddress = getNetworkAddress();
  console.log(`=========================================`);
  console.log(`  Server running at:`);
  console.log(`  - Local:   http://${localAddress}:${PORT}`);
  if (networkAddress) {
    console.log(`  - Network: http://${networkAddress}:${PORT}`);
  }
  console.log(`=========================================`);
});
