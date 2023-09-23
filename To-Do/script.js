// Initialize an empty array to store tasks
let tasks = [];

// Define an asynchronous function to fetch tasks from an API
async function fetchTasks() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// Initialize the app
async function init() {
  // Check if tasks are stored in local storage
  const storedTasks = localStorage.getItem('tasks');

  if (storedTasks) {
    
    tasks = JSON.parse(storedTasks);
  } else {
    
    const fetchedTasks = await fetchTasks();
    tasks = fetchedTasks.map(task => ({
      id: task.id,
      task: task.title,
      category: task.userId % 4 === 0 ? 'Work' : 'Personal',
      stage: task.completed ? 'Finished' : 'New',
    }));
    
    // Save tasks to local storage
    saveTasks();
  }

  // Set up event listeners for category tabs
  setupCategoryTabs();

  // Display tasks based on the active category tab
  const selectedCategory = document.querySelector('.tabs li.active');
  if (selectedCategory) {
    showCategory(selectedCategory.innerText);
  }
}

// Function to save tasks to local storage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to add a new task
async function addTask() {
 
  const taskInput = document.getElementById('task');
  const categorySelect = document.getElementById('category');
  const stageSelect = document.getElementById('stage');
  const task = taskInput.value.trim();
  const category = categorySelect.value;
  const stage = stageSelect.value;

  if (task !== '') {
    // Create a new task object with an ID, task name, category, and stage
    const newTask = {
      id: tasks.length + 1, // Assign a unique ID (incremental)
      task,
      category,
      stage,
    };

    // Add the new task to the 'tasks' array
    tasks.push(newTask);

    // Clear input fields
    taskInput.value = '';
    categorySelect.value = 'Work'; // Default category to 'Work'
    stageSelect.value = 'New'; // Default stage to 'New'

    // Save tasks to local storage
    saveTasks();

    // Add the new task to the API
    await addTaskToAPI(newTask);

    // Refresh the task list for the selected category
    const selectedCategory = document.querySelector('.tabs li.active');
    if (selectedCategory) {
      showCategory(selectedCategory.innerText);
    }
  }
}

// Function to add a task to the API
async function addTaskToAPI(task) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      body: JSON.stringify(task),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding task to API:', error);
    return null;
  }
}

// Function to remove a task
async function removeTask(id) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);

    // Save tasks to local storage
    saveTasks();

    // Remove the task from the API
    await deleteTaskFromAPI(id);

    // Refresh the task list for the selected category
    const selectedCategory = document.querySelector('.tabs li.active');
    if (selectedCategory) {
      showCategory(selectedCategory.innerText);
    }
  }
}

// Function to delete a task from the API
async function deleteTaskFromAPI(id) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: 'DELETE',
    });
    if (response.status === 200) {
      return true; // Task deleted successfully
    } else {
      return false; // Task deletion failed
    }
  } catch (error) {
    console.error('Error deleting task from API:', error);
    return false;
  }
}

// Function to edit a task
async function editTask(id, newText) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].task = newText;

    // Save tasks to local storage
    saveTasks();

    // Update the task in the API
    await updateTaskInAPI(id, tasks[taskIndex]);

    // Refresh the task list for the selected category
    const selectedCategory = document.querySelector('.tabs li.active');
    if (selectedCategory) {
      showCategory(selectedCategory.innerText);
    }
  }
}

// Function to update the stage of a task
async function updateStage(id, newStage) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].stage = newStage;

    // Save tasks to local storage
    saveTasks();

    // Update the task's stage in the API
    await updateTaskInAPI(id, tasks[taskIndex]);

    // Refresh the task list for the selected category
    const selectedCategory = document.querySelector('.tabs li.active');
    if (selectedCategory) {
      showCategory(selectedCategory.innerText);
    }
  }
}

// Function to update a task in the API
async function updateTaskInAPI(id, updatedTask) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: 'PUT', 
      body: JSON.stringify(updatedTask),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (response.status === 200) {
      return true; // Task updated successfully
    } else {
      return false; // Task update failed
    }
  } catch (error) {
    console.error('Error updating task in API:', error);
    return false;
  }
}

// Function to show tasks for a specific category
function showCategory(category) {
  const categoryContainer = document.getElementById('categoryContainer');
  categoryContainer.innerHTML = '';

  // Filter tasks by category
  const filteredTasks = tasks.filter(task => task.category === category);

  // Create a section for the category
  const categorySection = document.createElement('div');
  categorySection.className = 'category-section';

  // Loop through filtered tasks and create list items for each task
  filteredTasks.forEach((task) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span contenteditable="true" data-id="${task.id}">${task.task}</span>
      <span>${task.stage}</span>
      <button onclick="updateStage(${task.id}, 'New')">To New</button>
      <button onclick="updateStage(${task.id}, 'Ongoing')">To Ongoing</button>
      <button onclick="updateStage(${task.id}, 'Finished')">To Finished</button>
      <button onclick="removeTask(${task.id})">Delete</button>
    `;

    // Add an event listener for updating task text when blurred
    li.querySelector('span').addEventListener('blur', (event) => {
      const newText = event.target.textContent.trim();
      const taskId = parseInt(event.target.getAttribute('data-id'));

      if (newText !== '') {
        editTask(taskId, newText);
      }
    });

    // Append the list item to the category section
    categorySection.appendChild(li);
  });

  // Append the category section to the category container
  categoryContainer.appendChild(categorySection);
  categoryContainer.style.display = 'block';
}

// Function to toggle the active state of category tabs
function toggleActiveTab(tab) {
  const tabs = document.querySelectorAll('.tabs li');
  tabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
}

// Function to set up event listeners for category tabs
function setupCategoryTabs() {
  document.querySelectorAll('.tabs li').forEach(tab => {
    tab.addEventListener('click', () => {
      toggleActiveTab(tab);
      const selectedCategory = tab.innerText;
      showCategory(selectedCategory);
    });
  });
}

// Call init to fetch tasks when the app loads
init();
