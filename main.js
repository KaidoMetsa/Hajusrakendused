
// Tasks:

var tasks = [];
let lastTaskId = 1;
let taskList;
let addTask;
let loginButton;
let logoutButton;
let usernameInput;
let passwordInput;

// Lehe laadimisel käivitatud taskid
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        taskList = document.querySelector('#task-list');
        addTask = document.querySelector('#add-task');
        loginButton = document.querySelector('#login-submit');
        logoutButton = document.querySelector('#logout-submit');
        usernameInput = document.querySelector('#username');
        passwordInput = document.querySelector('#password');

        // Lisame sisse login ja logout nupule kuulajad
        loginButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Keelame vormi vaikimisi käitumise, et lehte ei värskendataks
            console.log('login klikitud');
            await login(usernameInput.value, passwordInput.value);
            refreshTasks();
        });

        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Keelame vormi vaikimisi käitumise, et lehte ei värskendataks
            console.log('logout klikitud');
            logout();
            refreshTasks();
        });

        // Lae olemasolevad taskid lehe laadimisel
        await loadInExistingTasks();

        // Renderda iga ülesanne
        tasks.forEach(renderTask);

        // Uue taski lisamise nupule kuulaja
        addTask.addEventListener('click', async () => {
            const task = await createTask(); // Lokaalselt loome uue ülesande
            const taskRow = createTaskRow(task); // Loome uue HTML-i ülesande elemendi, mille saame lehele lisada
            taskList.appendChild(taskRow); // Lisame ülesande lehele
        });
    });
}

// Järgmine rida kontrollib hetkel olemasolevat tokenit, kui pole sisse logitud, siis on null, kui sisse logitud, siis kuvatakse token konsoolis
if (typeof localStorage !== 'undefined') {
    console.log(localStorage.getItem('token'));
}

// Funktsioon sisselogimiseks
async function login(username, password) {
    console.log('this');
    if (typeof localStorage === 'undefined') {
        console.log('localStorage is not available in this environment');
        return;
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "username": username,
        "password": password
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    // Saadame päringu sisselogimiseks
    await fetch("https://demo2.z-bit.ee/users/get-token", requestOptions)
        .then(response => response.json())
        .then(result => {
            localStorage.setItem('token', result.access_token);
        })
        .catch(error => console.log('viga', error));
}


// Lae sisse olemasolevad ülesanded
async function loadInExistingTasks() {
    try {
        // Saame API päringuga olemasolevad ülesanded
        const result = await sendAPIRequest('read', 'tasks', null, null, null, true);
        tasks = result.map(task => ({
            id: task.id,
            name: task.title,
            completed: task.marked_as_done
        }));
    } catch (error) {
        console.error('Viga ülesannete laadimisel:', error);
    }
}

// Renderda ülesanne
function renderTask(task) {
    const taskRow = createTaskRow(task);
    taskList.appendChild(taskRow);
}

// Loo uus ülesanne
function createTask() {
    lastTaskId++;
    const task = {
        name: 'Ülesanne ' + lastTaskId,
        completed: false
    };
    sendAPIRequest('create', 'tasks', null, task.name);
    return task;
}

// Saada API päring
async function sendAPIRequest(operation, requestPath, taskId, taskTitle, taskIsCompleted, returnFetchResponseResult) {
    let URL = `https://demo2.z-bit.ee`;

    // Lisame URL-ile vastavalt antud id ja path VÕI ainult path
    if (requestPath != null && taskId != null) {
        URL = [URL, requestPath, taskId].join('/');
        console.log(URL);
    } else if (requestPath != null && taskId == null) {
        URL = [URL, requestPath].join('/');
        console.log(URL);
    }

    const token = localStorage.getItem('token');

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (token) {
        myHeaders.append("Authorization", `Bearer ${token}`);
    }

    const result = await fetch(URL, createRequestOptions(operation, taskTitle, taskIsCompleted))
        .then(response => response.json())
        .catch(error => console.log('viga', error));

    if (returnFetchResponseResult) {
        return result;
    }
}

// Funktsioon API päringu valikute loomiseks
function createRequestOptions(operation, title, isCompleted) {
    var myHeaders = new Headers();

    // Määrame autoriseerimise tokeni
    const token = localStorage.getItem('token');
    if (token) {
        myHeaders.append("Authorization", `Bearer ${token}`);
    }
    console.log(`Bearer ${localStorage.getItem('token')}`);

    switch (operation) {
        case 'create':
            myHeaders.append("Content-Type", "application/json");
            var callBody = JSON.stringify({
                "title": title,
                "desc": ""
            });
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: callBody,
                redirect: 'follow' // konstant (selle rakenduse jaoks)
            };
            return requestOptions;
        case 'read':
            var callBody;
            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                body: callBody,
                redirect: 'follow' // konstant (selle rakenduse jaoks)
            };
            return requestOptions;
        case 'update':
            myHeaders.append("Content-Type", "application/json");
            var callBody = JSON.stringify({
                "title": title,
                "marked_as_done": isCompleted
            });
            var requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: callBody,
                redirect: 'follow'
            };
            return requestOptions;
        case 'delete':
            var raw;
            var requestOptions = {
                method: 'DELETE',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            return requestOptions;
        default:
            console.log("Ei leia sobivat päiset !")
            break;
    }
}

// Funktsioon loomaks ülesande rida
function createTaskRow(task) {
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute('data-template');

    const name = taskRow.querySelector("[name='name']");
    name.value = task.name;
    name.addEventListener('blur', () => {
        sendAPIRequest('update', 'tasks', task.id, name.value);
    });

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.completed;

    checkbox.addEventListener('change', async (event) => {
        console.log('Checkbox oleku muutus:', event.target.checked);
        task.completed = event.target.checked;
        await sendAPIRequest('update', 'tasks', task.id, name.value, task.completed);

        // Lisage siia kood, mis muudab checkboxi olekut vastavalt muudetud ülesande olekule
        checkbox.checked = task.completed;
    });

    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', async () => {
        taskList.removeChild(taskRow);
        tasks.splice(tasks.indexOf(task), 1);
        await sendAPIRequest('delete', 'tasks', task.id);
    });

    return taskRow;
}

// Funktsioon väljalogimiseks
function logout() {
    localStorage.removeItem('token');
}

// Uus funktsioon ülesannete värskendamiseks
async function refreshTasks() {
    // Kui kasutaja on sisse logitud, siis uuenda ülesandeid
    if (isLoggedIn()) {
        // Eemalda kõik olemasolevad ülesanded
        while (taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }

        // Lae uuesti ülesanded
        await loadInExistingTasks();

        // Renderda iga ülesanne
        tasks.forEach(renderTask);
    } else {
        // Kui kasutaja pole sisse logitud, siis peida ülesanded
        taskList.innerHTML = '';
    }
}

// Uus funktsioon, mis kontrollib, kas kasutaja on sisse logitud
function isLoggedIn() {
    const token = localStorage.getItem('token');
    // Lisage siia veel lisatingimusi vastavalt teie autentimise süsteemile
    return token !== null && token !== 'undefined';
}
