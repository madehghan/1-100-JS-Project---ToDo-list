document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodo');
    const todoList = document.getElementById('todoList');
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let draggedItem = null;

    // Load todos from local storage
    loadTodos();

    // Add new todo
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Drag and drop event listeners
    todoList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('todo-item')) {
            draggedItem = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    todoList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('todo-item')) {
            e.target.classList.remove('dragging');
            draggedItem = null;
        }
    });

    todoList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const todoItem = e.target.closest('.todo-item');
        if (todoItem && todoItem !== draggedItem) {
            e.dataTransfer.dropEffect = 'move';
            const rect = todoItem.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            
            if (e.clientY < midY) {
                todoItem.style.borderTop = '2px solid var(--orange-color)';
                todoItem.style.borderBottom = 'none';
            } else {
                todoItem.style.borderBottom = '2px solid var(--orange-color)';
                todoItem.style.borderTop = 'none';
            }
        }
    });

    todoList.addEventListener('drop', (e) => {
        e.preventDefault();
        const todoItem = e.target.closest('.todo-item');
        if (todoItem && todoItem !== draggedItem) {
            // Remove visual indicators
            todoItem.style.borderTop = 'none';
            todoItem.style.borderBottom = 'none';

            const todosArray = Array.from(todoList.children);
            const draggedIndex = todosArray.indexOf(draggedItem);
            const droppedIndex = todosArray.indexOf(todoItem);

            // Update todos array
            const [movedTodo] = todos.splice(draggedIndex, 1);
            todos.splice(droppedIndex, 0, movedTodo);

            // Update DOM
            if (draggedIndex < droppedIndex) {
                todoItem.parentNode.insertBefore(draggedItem, todoItem.nextSibling);
            } else {
                todoItem.parentNode.insertBefore(draggedItem, todoItem);
            }

            saveTodos();
        }
    });

    function addTodo() {
        const todoText = todoInput.value.trim();
        if (todoText) {
            const todo = {
                id: Date.now(),
                text: todoText,
                completed: false
            };
            todos.push(todo);
            saveTodos();
            renderTodo(todo);
            todoInput.value = '';
        }
    }

    function renderTodo(todo) {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.draggable = true;
        todoItem.dataset.id = todo.id;
        if (todo.completed) {
            todoItem.classList.add('completed');
        }

        todoItem.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span>${todo.text}</span>
            </div>
            <div>
                <button class="delete-btn">حذف</button>
            </div>
        `;

        // Add checkbox event
        const checkbox = todoItem.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => {
            todo.completed = checkbox.checked;
            todoItem.classList.toggle('completed');
            saveTodos();
        });

        // Add delete event
        todoItem.querySelector('.delete-btn').addEventListener('click', () => {
            todos = todos.filter(t => t.id !== todo.id);
            todoItem.remove();
            saveTodos();
        });

        todoList.appendChild(todoItem);
    }

    function loadTodos() {
        todos.forEach(todo => renderTodo(todo));
    }

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
}); 