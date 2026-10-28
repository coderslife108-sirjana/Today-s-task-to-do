"use strict";

const STORAGE_KEY = "chalk-todo-tasks";

const form = document.getElementById("addForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("list");
const emptyMessage = document.getElementById("emptyMsg");
const countLabel = document.getElementById("countLabel");
const clearDoneButton = document.getElementById("clearDone");
const dateLabel = document.getElementById("dateLabel");
const statusMessage = document.getElementById("statusMsg");
const tabs = document.querySelectorAll(".tab");

let tasks = [];
let currentFilter = "all";
let editingTaskId = null;

function showDate() {
  dateLabel.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function showStatus(message) {
  statusMessage.textContent = message;
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) {
      tasks = [];
      return;
    }

    const parsedTasks = JSON.parse(savedTasks);
    if (!Array.isArray(parsedTasks) || !parsedTasks.every((task) =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.done === "boolean"
    )) {
      throw new Error("Saved tasks have an invalid format.");
    }

    tasks = parsedTasks;
  } catch (error) {
    console.error("Could not load tasks:", error);
    tasks = [];
    showStatus("Saved tasks could not be loaded. You can still add new tasks.");
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    showStatus("");
  } catch (error) {
    console.error("Could not save tasks:", error);
    showStatus("Your change could not be saved in this browser.");
  }
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getFilteredTasks() {
  return tasks.filter((task) => {
    if (currentFilter === "active") {
      return !task.done;
    }
    if (currentFilter === "done") {
      return task.done;
    }
    return true;
  });
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  list.replaceChildren();

  if (filteredTasks.length === 0) {
    emptyMessage.textContent = tasks.length === 0
      ? "Nothing here yet — add your first task."
      : "No tasks in this view.";
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
    filteredTasks.forEach((task) => {
      list.appendChild(createTaskElement(task));
    });
  }

  const remainingTasks = tasks.filter((task) => !task.done).length;
  countLabel.textContent = `${remainingTasks} left`;

  if (editingTaskId) {
    const editInput = list.querySelector(".edit-input");
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  if (task.done) {
    item.classList.add("done");
  }

  if (task.id === editingTaskId) {
    item.appendChild(createEditForm(task));
    return item;
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.done ? "active" : "done"}`);
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "edit-btn";
  editButton.textContent = "edit";
  editButton.setAttribute("aria-label", `Edit "${task.text}"`);
  editButton.addEventListener("click", () => {
    editingTaskId = task.id;
    showStatus("");
    renderTasks();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  item.append(checkbox, text, editButton, deleteButton);
  return item;
}

function createEditForm(task) {
  const editForm = document.createElement("form");
  editForm.className = "edit-form";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = task.text;
  editInput.maxLength = 140;
  editInput.required = true;
  editInput.setAttribute("aria-label", "Edit task");

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "edit-action";
  saveButton.textContent = "save";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "edit-action cancel-btn";
  cancelButton.textContent = "cancel";
  cancelButton.addEventListener("click", () => {
    editingTaskId = null;
    renderTasks();
  });

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateTask(task.id, editInput.value);
  });

  editForm.append(editInput, saveButton, cancelButton);
  return editForm;
}

function addTask(text) {
  const taskText = text.trim();
  if (!taskText) {
    return;
  }

  tasks.unshift({ id: createId(), text: taskText, done: false });
  saveTasks();
  renderTasks();
}

function updateTask(id, text) {
  const taskText = text.trim();
  if (!taskText) {
    return;
  }

  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return;
  }

  task.text = taskText;
  editingTaskId = null;
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return;
  }

  task.done = !task.done;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  if (editingTaskId === id) {
    editingTaskId = null;
  }
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

clearDoneButton.addEventListener("click", clearCompletedTasks);

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-selected", "false");
    });

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    currentFilter = tab.dataset.filter;
    editingTaskId = null;
    renderTasks();
  });
});

showDate();
loadTasks();
renderTasks();
