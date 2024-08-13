$(document).ready(function() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks(tasks);

    $('#addTaskBtn').click(function() {
        $('#taskModal').show();
    });

    $('.close').click(function() {
        $('#taskModal').hide();
    });

    $('#taskForm').submit(function(event) {
        event.preventDefault();
        let newTask = {
            id: Date.now(),
            title: $('#title').val(),
            description: $('#description').val(),
            deadline: $('#deadline').val(),
            state: 'not-started'
        };
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(tasks);
        $('#taskModal').hide();
        $('#taskForm')[0].reset();
    });

    function renderTasks(tasks) {
        $('#not-started-tasks, #in-progress-tasks, #completed-tasks').empty();
        tasks.forEach(task => {
            let taskCard = `
                <div class="task-card" id="${task.id}">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <p>Due: ${dayjs(task.deadline).format('MM/DD/YYYY')}</p>
                    <button class="delete-task">Delete</button>
                </div>
            `;
            if (task.state === 'not-started') {
                $('#not-started-tasks').append(taskCard);
            } else if (task.state === 'in-progress') {
                $('#in-progress-tasks').append(taskCard);
            } else if (task.state === 'completed') {
                $('#completed-tasks').append(taskCard);
            }

            // Color-code tasks
            const now = dayjs();
            const deadline = dayjs(task.deadline);
            if (now.isAfter(deadline)) {
                $(`#${task.id}`).css('background-color', 'red');
            } else if (deadline.diff(now, 'days') < 3) {
                $(`#${task.id}`).css('background-color', 'yellow');
            }

            // Add delete functionality
            $(`#${task.id} .delete-task`).click(function() {
                tasks = tasks.filter(t => t.id !== task.id);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(tasks);
            });
        });

        // Initialize draggable and droppable after rendering tasks
        $('.task-card').draggable({
            revert: 'invalid',
            stack: ".task-card"
        });

        $('.column').droppable({
            accept: '.task-card',
            drop: function(event, ui) {
                let taskId = ui.helper.attr('id');
                let newState = $(this).attr('id').replace('-tasks', '');
                tasks = tasks.map(task => {
                    if (task.id == taskId) {
                        task.state = newState;
                    }
                    return task;
                });
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(tasks);
            }
        });
    }
});
