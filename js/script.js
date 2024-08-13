$(document).ready(function() {
    // Load tasks from localStorage or initialize an empty array if none exist
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks(tasks); // Render the tasks on page load

    // Show the modal to add a new task when the "Add Task" button is clicked
    $('#addTaskBtn').click(function() {
        $('#taskModal').show();
    });

    // Hide the task modal when the close button is clicked
    $('.close').click(function() {
        $('#taskModal').hide();
    });

    // Handle the form submission to add a new task
    $('#taskForm').submit(function(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way
        let newTask = {
            id: Date.now(), // Unique task ID based on the current timestamp
            title: $('#title').val(),
            description: $('#description').val(),
            deadline: $('#deadline').val(),
            state: 'not-started' // Default state for a new task
        };
        tasks.push(newTask); // Add the new task to the tasks array
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save tasks to localStorage
        renderTasks(tasks); // Re-render the tasks with the new addition
        $('#taskModal').hide(); // Hide the modal after submitting
        $('#taskForm')[0].reset(); // Reset the form fields
    });

    // Function to render tasks in their respective columns
    function renderTasks(tasks) {
        // Clear the task columns before rendering updated tasks
        $('#not-started-tasks, #in-progress-tasks, #completed-tasks').empty();

        // Loop through each task and append it to the appropriate column
        tasks.forEach(task => {
            let taskCard = `
                <div class="task-card" id="${task.id}">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <p>Due: ${dayjs(task.deadline).format('MM/DD/YYYY')}</p>
                    <button class="delete-task">Delete</button>
                </div>
            `;

            // Append task to the correct column based on its state
            if (task.state === 'not-started') {
                $('#not-started-tasks').append(taskCard);
            } else if (task.state === 'in-progress') {
                $('#in-progress-tasks').append(taskCard);
            } else if (task.state === 'completed') {
                $('#completed-tasks').append(taskCard);
            }

            // Color-code tasks based on state or deadline proximity
            if (task.state === 'in-progress') {
                $(`#${task.id}`).css('background-color', 'yellow');
            } else if (task.state === 'completed') {
                $(`#${task.id}`).css('background-color', 'green');
            } else {
                const now = dayjs();
                const deadline = dayjs(task.deadline);
                if (now.isAfter(deadline)) {
                    $(`#${task.id}`).css('background-color', 'red');
                } else if (deadline.diff(now, 'days') < 3) {
                    $(`#${task.id}`).css('background-color', 'yellow');
                } else {
                    $(`#${task.id}`).css('background-color', 'white');
                }
            }

            // Add delete functionality for each task
            $(`#${task.id} .delete-task`).click(function() {
                tasks = tasks.filter(t => t.id !== task.id);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(tasks); // Re-render tasks after deletion
            });
        });

        // Make task cards draggable
        $('.task-card').draggable({
            revert: 'invalid',
            stack: ".task-card"
        });

        // Allow dropping task cards into different columns
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
                renderTasks(tasks); // Re-render tasks after state change
            }
        });
    }
});
