// Primero se definen las clases
class Task{
    constructor(id, description){ // Constructor de la clase Task
        this.id = id;
        this.description = description;
    }

    // Métodos getter y setter para la descripción
    getDescription(){
        console.log("Cogiendo la descripción de la tarea: " + this.description); // Console log para debug
        return this.description;
    }

    setDescription(newDescription){
        console.log("Cambiando la descripción de la tarea: " + newDescription); // Console log para debug
        this.description = newDescription;
    }
}

class TaskManager{
    constructor(){ // Constructor de la clase TaskManager
        this.tasks = this.loadCookies(); // Cargar las tareas desde las cookies al iniciar
    }

    addTask(description){
        const id = this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1; // Generar un ID a partir de operador ternario. Obtiene el último elemento, coge su ID y le suma 1, si no hay le pone 1 directamente
        const newTask = new Task(id, description);
        this.tasks.push(newTask); // Añadir la nueva tarea a la lista
        this.saveCookies(); // Guardar las tareas en las cookies
    }

    deleteTask(id){ // Eliminar una tarea por ID
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveCookies();
    }

    editTask(id, newDescription){ // Editar la descripción de una tarea por ID
        const task = this.tasks.find(task => task.id === id);
        if(task){
            task.setDescription(newDescription);
            this.saveCookies();
        }
    }

    saveCookies(){ // Guardar las tareas en las cookies
        const expires = new Date(); // Se le mete un expires para que al cerrar el navegador no se borren las cookies
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // Expira en 7 días
        const cookie = document.cookie 
            .split('; ') // Separar las cookies
            document.cookie = "tasks=" + encodeURIComponent(JSON.stringify(this.tasks)) + "; expires=" + expires.toUTCString() + "; path=/"; // JSON.stringify convierte un objeto JavaScript en una cadena JSON
    } // EncodeURIComponent codifica una cadena para que el navegador la interprete

    loadCookies(){ // Cargar las tareas desde las cookies
        const cookies = document.cookie
        .split('; ')
        .find(row => row.startsWith('tasks='));

        return cookies
        ? JSON.parse(decodeURIComponent(cookies.split('=')[1])).map(taskData => new Task(taskData.id, taskData.description)) // JSON.parse convierte una cadena JSON en un objeto JavaScript 
        : [];
    } // El decodeURIComponent decodifica la cadena para cargarla como JSON
}

// Segundo: se declaran las variables
const manager = new TaskManager(); // Instancia del gestor de tareas
const tableBody = document.getElementById("taskTableBody"); // Cuerpo de la tabla donde se mostrarán las tareas
const taskInput = document.getElementById("taskInput"); // Input para la descripción de la tarea
const taskModal = new bootstrap.Modal(document.getElementById('taskModal')); // Modal para añadir o editar  las tareas
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')); // Modal para eliminar tareas

let taskDeletingId = null; // Variable para almacenar la ID de la tarea a eliminar
let taskEditingId = null; // Variable para almacenar la ID de la tarea a editar

// Tercer0: se definen las funciones

// Funcion para renderizar las tareas en la tabla
function renderTasks(){
    tableBody.innerHTML = ""; // Limpiar el contenido actual de la tabla
    manager.tasks.forEach(task => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.getDescription()}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-btn" data-id="${task.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${task.id}">Delete</button>
            </td>
        `;

        tableBody.appendChild(row); // Crea nodos (de fila) y los añade a la estructura DOM https://developer.mozilla.org/es/docs/Web/API/Node/appendChild
    });
}
renderTasks(); // Llamar a la función para renderizar las tareas inicialmente

// Funcion para editar una tarea
function editTask(id){
    const task = manager.tasks.find(task => task.id === id);
    taskInput.value = task.getDescription();
    taskEditingId = id;
    taskModal.show();
}

// Funcion para confirmar la eliminación de una tarea
function confirmDeleteTask(id){
    taskDeletingId = id;
    deleteModal.show();
}


// Cuarto: se definen los eventos

tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
        editTask(Number(e.target.dataset.id));
    }

    if (e.target.classList.contains("delete-btn")) {
        confirmDeleteTask(Number(e.target.dataset.id));
    }
});

// Evento para el botón "Add Task"

document.querySelector("#taskModal .btn-primary").addEventListener("click", () => {
    const description = taskInput.value.trim(); // Coge el input y le hace trim

    if(description === ""){
        alert("You must enter a description to a task.");
        return;
    }

    if(taskEditingId === null){
        manager.addTask(description);
    } else {
        manager.editTask(taskEditingId, description);
        taskEditingId = null;
    }

    taskInput.value = "";
    taskModal.hide();
    renderTasks(); // Volver a renderizar las tareas para actualizar la tabla al añadir o editar una tarea
});

document.querySelector("#deleteModal .btn-primary").addEventListener("click", () => {
    manager.deleteTask(taskDeletingId);
    deleteModal.hide();
    renderTasks(); // Volver a renderizar las tareas para actualizar la tabla al eliminar una tarea
});

renderTasks(); // Llamada final para renderizar las tareas
