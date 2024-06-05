const userPassword = 'puntos'; // La contraseña para los usuarios
const devPassword = 'topsecret'; // La contraseña para los desarrolladores
const authForm = document.getElementById('authForm');
const passwordInput = document.getElementById('password');
const authSection = document.getElementById('authSection');
const emailSection = document.getElementById('emailSection');
const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('email');
const mainSection = document.getElementById('mainSection');
const usersList = document.getElementById('usersList');
const registerButton = document.getElementById('registerButton');
const registerSection = document.getElementById('registerSection');
const registerForm = document.getElementById('registerForm');
const registerNameInput = document.getElementById('registerName');
const registerEmailInput = document.getElementById('registerEmail');
const registerMediaInput = document.getElementById('registerMedia');
const backToLoginButton = document.getElementById('backToLoginButton');
const changeMediaSection = document.getElementById('changeMediaSection');
const changeMediaForm = document.getElementById('changeMediaForm');
const changeMediaInput = document.getElementById('changeMediaInput');

let users = JSON.parse(localStorage.getItem('users')) || [];
let isAdmin = false;
let loggedInUser = null;

// Manejo del botón de registro
registerButton.addEventListener('click', () => {
    authSection.style.display = 'none';
    registerSection.style.display = 'block';
});

// Manejo del botón de volver
backToLoginButton.addEventListener('click', () => {
    registerSection.style.display = 'none';
    authSection.style.display = 'block';
});

// Manejo del formulario de registro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userName = registerNameInput.value.trim();
    const userEmail = registerEmailInput.value.trim();
    const userMedia = registerMediaInput.files[0];
    const userMediaType = userMedia.type.startsWith('image') ? 'img' : 'video';

    if (!isUserExist(userEmail) && userName && userEmail && userMedia) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const user = {
                name: userName,
                email: userEmail,
                points: 0,
                media: event.target.result,
                mediaType: userMediaType,
                lastMediaChange: null // Nuevo campo para el registro del último cambio de media
            };
            users.push(user);
            saveUsers();
            alert('Usuario registrado exitosamente.');
            registerForm.reset();
            registerSection.style.display = 'none';
            authSection.style.display = 'block';
        };
        reader.readAsDataURL(userMedia);
    } else {
        alert('El correo electrónico ya está registrado o los datos son inválidos.');
    }
});

// Manejo del formulario de autenticación
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();
    if (password === userPassword) {
        isAdmin = false;
        authSection.style.display = 'none';
        emailSection.style.display = 'block';
    } else if (password === devPassword) {
        isAdmin = true;
        authSection.style.display = 'none';
        emailSection.style.display = 'block';
    } else {
        alert('Contraseña incorrecta.');
    }
});

// Manejo del formulario de email
emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (isUserExist(email)) {
        loggedInUser = getUserByEmail(email);
        emailSection.style.display = 'none';
        mainSection.style.display = 'block';
        changeMediaSection.style.display = 'block';
        if (isAdmin) {
            renderUsersList();
        } else {
            renderUserProfile(loggedInUser);
        }
    } else {
        alert('El correo electrónico no está registrado.');
    }
});

// Manejo del formulario de cambio de media
changeMediaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newMedia = changeMediaInput.files[0];
    const newMediaType = newMedia.type.startsWith('image') ? 'img' : 'video';
    const currentDate = new Date();

    if (newMedia && loggedInUser) {
        if (canChangeMedia(loggedInUser, currentDate)) {
            const reader = new FileReader();
            reader.onload = function (event) {
                loggedInUser.media = event.target.result;
                loggedInUser.mediaType = newMediaType;
                loggedInUser.lastMediaChange = currentDate.toISOString(); // Actualizar la fecha del último cambio
                saveUsers();
                alert('Media cambiada exitosamente.');
                if (isAdmin) {
                    renderUsersList();
                } else {
                    renderUserProfile(loggedInUser);
                }
            };
            reader.readAsDataURL(newMedia);
        } else {
            alert('No puedes cambiar la media hasta que pasen 3 días desde el último cambio.');
        }
    } else {
        alert('No se pudo cambiar la media. Por favor, inténtalo de nuevo.');
    }
});

function renderUsersList() {
    usersList.innerHTML = '';
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';

        const userMedia = document.createElement(user.mediaType);
        userMedia.className = 'user-media';
        userMedia.src = user.media;
        if (user.mediaType === 'video') {
            userMedia.controls = true;
        }
        userCard.appendChild(userMedia);

        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <p><strong>Nombre:</strong> ${user.name}</p>
            <p><strong>Correo electrónico:</strong> ${user.email}</p>
            <p><strong>Puntos:</strong> <span class="points">${user.points}</span></p>
        `;
        userCard.appendChild(userInfo);

        const userActions = document.createElement('div');
        userActions.className = 'user-actions';
        userActions.innerHTML = `
            <button class="btn addPointsBtn">Añadir puntos</button>
            <button class="btn removePointsBtn">Quitar puntos</button>
        `;
        userCard.appendChild(userActions);

        const addPointsBtn = userActions.querySelector('.addPointsBtn');
        const removePointsBtn = userActions.querySelector('.removePointsBtn');

        addPointsBtn.addEventListener('click', () => {
            user.points += 10000;
            saveUsers();
            renderUsersList();
        });

        removePointsBtn.addEventListener('click', () => {
            user.points -= 10000;
            saveUsers();
            renderUsersList();
        });

        usersList.appendChild(userCard);
    });
}

function renderUserProfile(user) {
    usersList.innerHTML = '';

    const userCard = document.createElement('div');
    userCard.className = 'user-card';

    const userMedia = document.createElement(user.mediaType);
    userMedia.className = 'user-media';
    userMedia.src = user.media;
    if (user.mediaType === 'video') {
        userMedia.controls = true;
    }
    userCard.appendChild(userMedia);

    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <p><strong>Nombre:</strong> ${user.name}</p>
        <p><strong>Correo electrónico:</strong> ${user.email}</p>
        <p><strong>Puntos:</strong> <span class="points">${user.points}</span></p>
    `;
    userCard.appendChild(userInfo);

    usersList.appendChild(userCard);
}

function isUserExist(email) {
    return users.some(user => user.email === email);
}

function getUserByEmail(email) {
    return users.find(user => user.email === email);
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function canChangeMedia(user, currentDate) {
    if (!user.lastMediaChange) return true;
    const lastChangeDate = new Date(user.lastMediaChange);
    const differenceInDays = (currentDate - lastChangeDate) / (1000 * 60 * 60 * 24);
    return differenceInDays >= 3;
}
