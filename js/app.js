const API = 'http://' + window.location.hostname + ':8080';
$(document).ready(function() {
    checkAuth();
    
});

function checkAuth(){
    const token = localStorage.getItem('token');
    if(token){
        $('#main-content').show();
        $('#welcome-screen').css('display', 'none');
        $('#nav-buttons').hide();
        $('#nav-user').show();
        $('#user-email').text(localStorage.getItem('email'));
        $('#welcome-card').removeClass('slide-left slide-right').addClass('active');
        $('#login-card, #register-card').removeClass('active').addClass('slide-right');
        loadTasks();
    } else {
        $('#main-content').hide();
        $('#welcome-screen').css('display', 'flex');
        $('#nav-buttons').show();
        $('#nav-user').hide();
    }
}

function login(){
    const email = $('#login-email').val();
    const password = $('#login-password').val();

    $.ajax({
        url: API + '/api/auth/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function(response) {
            localStorage.setItem('token', response);
            localStorage.setItem('email', email);
            $('#welcome-screen').css('display', 'none');
            $('#login-card').removeClass('active').addClass('slide-right');
            $('#welcome-card').removeClass('slide-left').addClass('active');
            checkAuth();
        },
        error: function(){
            $('#login-error').show().text('Неверный email или праоль');
        }
    });
}

function register(){
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        $('#reg-error').show().text('Введите корректный email');
        return;
    }

    if (password.length < 4) {
        $('#reg-error').show().text('Пароль минимум 4 символов');
        return;
    }

    $.ajax({
        url: API + '/api/auth/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({email, password}),
    success: function(response) {
        localStorage.setItem('token', response);
        localStorage.setItem('email', email);
        checkAuth();
    },
        error: function(xhr) {
            $('#reg-error').show().text(xhr.responseJSON.message);
        }
    });
}

function showLogin() {
    $('#welcome-card').removeClass('active').addClass('slide-left');
    $('#register-card').removeClass('active').addClass('slide-right');
    setTimeout(function() {
        $('#login-card').removeClass('slide-right').addClass('active');
    }, 50);
}

function showRegister() {
    $('#welcome-card').removeClass('active').addClass('slide-left');
    $('#login-card').removeClass('active').addClass('slide-right');
    setTimeout(function() {
        $('#register-card').removeClass('slide-right').addClass('active');
    }, 50);
}

function showWelcome() {
    $('#login-card').removeClass('active').addClass('slide-right');
    $('#register-card').removeClass('active').addClass('slide-right');
    setTimeout(function() {
        $('#welcome-card').removeClass('slide-left').addClass('active');
    }, 50);
}
function showAddTask(){
    $('#task-title').val('');
    $('#task-description').val('');
    $('#addTaskModal').modal('show');
}



function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    checkAuth();
}

function loadTasks() {
    const token = localStorage.getItem('token');
   

    $.ajax({
        url: API + '/api/tasks',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer '+ token
        },
        success: function(tasks){
            $('#pending-tasks').empty();
            $('#done-tasks').empty();
        
            $.each(tasks, function(index, task){
               var tasksItem = $(
    '<div class="card mb-2">' +
        '<div class="card-body d-flex justify-content-between align-items-center" onclick="toggleExpand(' + task.id + ')" style="cursor:pointer">' +
            '<span>' + task.title + '</span>' +
            '<div>' +
                '<button class="btn btn-success btn-sm" onclick="event.stopPropagation(); toggleDone(' + task.id + ', ' + task.done + ')"><i class="bi bi-check-lg"></i></button>' +
                '<button class="btn btn-warning btn-sm ms-1" onclick="event.stopPropagation(); showEdit(' + task.id + ', \'' + task.title + '\')"><i class="bi bi-pencil"></i></button>' +
                '<button class="btn btn-danger btn-sm ms-1" onclick="event.stopPropagation(); deleteTask(' + task.id + ')"><i class="bi bi-trash"></i></button>' +
            '</div>' +
        '</div>' +
        '<div class="task-description" id="desc-' + task.id + '" style="display:none">' +
            '<div class="px-3 pb-3 text-white opacity-75">' + (task.description || 'Нет описания') + '</div>' +
        '</div>' +
    '</div>'
);

                if(task.done == true){
                    $('#done-tasks').append(tasksItem);
                }else {
                    $('#pending-tasks').append(tasksItem);
                }
            } );

        }

    })
}


function createTask(){
    const title = $('#task-title').val();
    const description = $('#task-description').val();
    const token = localStorage.getItem('token');
    
    $.ajax({ 
        url: API + '/api/tasks',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({title, description}),
        headers: {
            'Authorization': 'Bearer '+ token
        },
        success: function(){
            bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
             $('#addTaskModal').modal('hide');
             $('body').removeClass('modal-open');
             $('.modal-backdrop').remove();
            loadTasks();
        }
        
    })
}

function deleteTask(id){
    const token = localStorage.getItem('token');

    $.ajax({
        url: API +'/api/tasks/'+id,
        method: 'DELETE',
        headers: {
        'Authorization': 'Bearer '+ token
        },
        success: function(){
            loadTasks();
        }

    })
}

function toggleDone(id, done){
    const token = localStorage.getItem('token');

    $.ajax({
        url: API +'/api/tasks/'+id,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({done: !done}),
        headers: {
        'Authorization': 'Bearer '+ token
        },
        success: function(){
            loadTasks();
        }
    })
}

function showEdit(id, title){
    $('#edit-task-id').val(id);
    $('#edit-task-title').val(title);
    $('#editTaskModal').modal('show');
}

function saveEdit(){
    const id = $('#edit-task-id').val();
    const title = $('#edit-task-title').val();
    const description = $('#edit-task-description').val();
    const token = localStorage.getItem('token');
 
    $.ajax({
        url: API + '/api/tasks/'+id,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({title, description}),
        headers: {
            'Authorization': 'Bearer '+token
        },
        success: function(){
            $('#editTaskModal').modal('hide');
            loadTasks();
        }
    })
}
function toggleExpand(id) {
    $('#desc-' + id).slideToggle(200);
}