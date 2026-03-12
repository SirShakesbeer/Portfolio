function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData('text', ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const task = document.getElementById(data);
    const target = ev.target.closest("#start, #ziel, .aufgabenSpalte");
    if (target) {
        const task = document.getElementById(data);
        target.appendChild(task);

        if (target.id === "Done") {
            task.classList.add("done");
        } else {
            task.classList.remove("done");
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
	
	document.addEventListener('dragenter', function (event) {
		let dropziel = event.target.closest('#ziel');
		if (dropziel) {
			dropziel.classList.add('erreicht');
		}
	});

	document.addEventListener('dragover', function (event) {
		event.preventDefault();
	});

	document.addEventListener('dragleave', function (event) {
		let dropziel = event.target.closest('#ziel');
		let related = event.relatedTarget && event.relatedTarget.closest(
			"#ziel");
		if (dropziel != null && related == null) {
			dropziel.classList.remove('erreicht');
		}
	});

	document.addEventListener('drop', function (event) {
		event.preventDefault();
		let dropziel = event.target.closest('#ziel');
		if (dropziel) {
			let draggedId = event.dataTransfer.getData('Text');
			dropziel.appendChild(document.getElementById(draggedId));
		}
	});
});

let taskId = 0;

function createTask() {
    const text = document.getElementById("aufgabenText").value.trim();
    const color = document.getElementById("aufgabenFarbe").value;

    if (!text) return alert("Bitte einen Text eingeben!");

    const task = document.createElement("div");
    task.className = "task";
    task.id = `task-${taskId++}`;
    task.style.backgroundColor = color;
    task.draggable = true;
    task.ondragstart = drag;

    task.innerHTML = `
        <span>${text}</span>
        <div>
            <button class="btn btn-sm btn-warning" onclick="editTask('${task.id}')">Bearbeiten</button>
        </div>
    `;

    document.getElementById("Todo").appendChild(task);

    document.getElementById("aufgabenText").value = "";
    document.getElementById("aufgabenFarbe").value = "#000000";
    bootstrap.Modal.getInstance(document.getElementById("aufgabenModal")).hide();
}

function deleteTasks() {
    const trash = document.getElementById("Trash");
    while (trash.firstChild) {
        trash.removeChild(trash.firstChild);
    }
}

function editTask(id) {
    const task = document.getElementById(id);
    const text = prompt("Bearbeite die Aufgabe:", task.querySelector("span").textContent);
    const color = prompt("Ändere die Farbe (Hex-Farbcode):", task.style.backgroundColor);

    if (text) task.querySelector("span").textContent = text;
    if (color) task.style.backgroundColor = color;
}