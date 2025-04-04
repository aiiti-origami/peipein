const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const lineWidthSlider = document.getElementById("lineWidthSlider");
const eraserButton = document.getElementById("eraserButton");
const clearButton = document.getElementById("clearButton");
const shapeSelector = document.getElementById("shapeSelector");
const imageLoader = document.getElementById("imageLoader");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");

let isDrawing = false;
let isErasing = false;
let shape = "line";
let history = [];
let historyIndex = -1;

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!isDrawing) return;
    if (isErasing) {
        ctx.clearRect(e.offsetX - 5, e.offsetY - 5, 10, 10);
    } else {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
}

function endDrawing() {
    isDrawing = false;
    saveHistory();
}

function drawShape(e) {
    if (!isDrawing) return;
    const x = e.offsetX;
    const y = e.offsetY;
    const startX = history[historyIndex].x;
    const startY = history[historyIndex].y;
    const width = x - startX;
    const height = y - startY;

    switch (shape) {
        case "rect":
            ctx.strokeRect(startX, startY, width, height);
            break;
        case "circle":
            const radius = Math.sqrt(width * width + height * height);
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
    }
}

function saveHistory() {
    historyIndex++;
    if (historyIndex < history.length) {
        history = history.slice(0, historyIndex);
    }
    history.push({
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        x: event.offsetX,
        y: event.offsetY,
    });
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        ctx.putImageData(history[historyIndex].imageData, 0, 0);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        ctx.putImageData(history[historyIndex].imageData, 0, 0);
    }
}

canvas.addEventListener("mousedown", (e) => {
    if (shape === "line") {
        startDrawing(e);
    } else {
        startDrawing(e);
    }
});
canvas.addEventListener("mousemove", (e) => {
    if (shape === "line") {
        draw(e);
    } else {
        if (isDrawing) {
            ctx.putImageData(history[historyIndex].imageData, 0, 0);
            drawShape(e);
        }
    }
});
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("mouseout", endDrawing);

colorPicker.addEventListener("change", () => {
    ctx.strokeStyle = colorPicker.value;
});
lineWidthSlider.addEventListener("change", () => {
    ctx.lineWidth = lineWidthSlider.value;
});
eraserButton.addEventListener("click", () => {
    isErasing = !isErasing;
});
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
});
shapeSelector.addEventListener("change", () => {
    shape = shapeSelector.value;
});
imageLoader.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            saveHistory();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);

ctx.strokeStyle = colorPicker.value;
ctx.lineWidth = lineWidthSlider.value;
saveHistory();
