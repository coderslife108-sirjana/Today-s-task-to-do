"use strict";

const STORAGE_KEY = "chalk-todo-tasks";

const form = document.getElementById("addForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("list");

const emptyMessage = document.getElementById("emptyMsg");
const countLabel = document.getElementById("countLabel");
const clearDoneButton = document.getElementById("clearDone");
const dateLabel = document.getElementById("dateLabel");

const tabs = document.querySelectorAll(".tab");

let tasks = [];
let currentFilter = "all";

/* -------------------------
Date
------------------------- */

function showDate() {
const today = new Date();

dateLabel.textContent = today.toLocaleDateString(undefined, {
weekday: "short",
month: "short",
day: "numeric"
});
}

/* -------------------------
Storage
------------------------- */

function loadTasks() {
try {
const savedTasks = localStorage.getItem(STORAGE_KEY);

tasks = savedTasks
  ? JSON.parse(savedTasks)
  : [];


} catch (error) {
console.error("Could not load tasks:", error);
tasks = [];
}
}

function saveTasks() {
try {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify(tasks)
);
} catch (error) {
console.error("Could not save tasks:", error);
}
}

/* -------------------------
Task ID
------------------------- */

function createId() {
return (
Date.now().toString(36) +
Math.random().toString(36).substring(2, 8)
);
}

/* -------------------------
Filter tasks
------------------------- */

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

/* -------------------------
Render
------------------------- */

function renderTasks() {
const filteredTasks = getFilteredTasks();

list.innerHTML = "";

if (filteredTasks.length === 0) {
showEmptyMessage();
} else {
hideEmptyMessage();

filteredTasks.forEach((task) => {
  list.appendChild(createTaskElement(task));
});


}

updateCount();
}

/* -------------------------
Create task element
------------------------- */

function createTaskElement(task) {
const item = document.createElement("li");

item.className = "task-item";

if (task.done) {
item.classList.add("done");
}

/* Checkbox */

const checkbox = document.createElement("input");

checkbox.type = "checkbox";
checkbox.className = "checkbox";
checkbox.checked = task.done;

checkbox.setAttribute(
"aria-label",
Mark "${task.text}" as ${ task.done ? "active" : "done" }
);

checkbox.addEventListener("change", () => {
toggleTask(task.id);
});

/* Text */

const text = document.createElement("span");

text.className = "task-text";
text.textContent = task.text;

/* Delete button */

const deleteButton = document.createElement("button");

deleteButton.type = "button";
deleteButton.className = "delete-btn";
deleteButton.innerHTML = "×";

deleteButton.setAttribute(
"aria-label",
Delete "${task.text}"
);

deleteButton.addEventListener("click", () => {
deleteTask(task.id);
});

item.appendChild(checkbox);
item.appendChild(text);
item.appendChild(deleteButton);

return item;
}

/* -------------------------
Empty message
------------------------- */

function showEmptyMessage() {
emptyMessage.style.display = "block";

if (tasks.length === 0) {
emptyMessage.textContent =
"Nothing here yet — add your first task.";
} else {
emptyMessage.textContent =
"No tasks in this view.";
}
}

function hideEmptyMessage() {
emptyMessage.style.display = "none";
}

/* -------------------------
Task count
------------------------- */

function updateCount() {
const remainingTasks = tasks.filter(
(task) => !task.done
).length;

countLabel.textContent =
${remainingTasks} ${ remainingTasks === 1 ? "left" : "left" };
}

/* -------------------------
Add task
------------------------- */

function addTask(text) {
const taskText = text.trim();

if (!taskText) {
return;
}

const newTask = {
id: createId(),
text: taskText,
done: false
};

tasks.unshift(newTask);

saveTasks();
renderTasks();
}

/* -------------------------
Toggle task
------------------------- */

function toggleTask(id) {
const task = tasks.find(
(task) => task.id === id
);

if (!task) {
return;
}

task.done = !task.done;

saveTasks();
renderTasks();
}

/* -------------------------
Delete task
------------------------- */

function deleteTask(id) {
tasks = tasks.filter(
(task) => task.id !== id
);

saveTasks();
renderTasks();
}

/* -------------------------
Clear completed tasks
------------------------- */

function clearCompletedTasks() {
tasks = tasks.filter(
(task) => !task.done
);

saveTasks();
renderTasks();
}

/* -------------------------
Add form
------------------------- */

form.addEventListener("submit", (event) => {
event.preventDefault();

addTask(input.value);

input.value = "";
input.focus();
});

/* -------------------------
Clear completed
------------------------- */

clearDoneButton.addEventListener(
"click",
clearCompletedTasks
);

/* -------------------------
Tabs
------------------------- */

tabs.forEach((tab) => {
tab.addEventListener("click", () => {
tabs.forEach((button) => {
button.classList.remove("active");
button.setAttribute(
"aria-selected",
"false"
);
});

tab.classList.add("active");

tab.setAttribute(
  "aria-selected",
  "true"
);

currentFilter = tab.dataset.filter;

renderTasks();


});
});

/* -------------------------
Start application
------------------------- */

showDate();
loadTasks();
renderTasks();