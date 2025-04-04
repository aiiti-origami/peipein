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
let startX = 0;
let startY = 0;

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.offsetX;
    startY = touch.offsetY;
    ctx.moveTo(startX, startY);
}

function draw(e) {
    if (!isDrawing) return;
    const touch = e.touches ? e.touches[0] : e;
    const currentX = touch.offsetX;
    const currentY = touch.offsetY;
    if (isErasing) {
        ctx.clearRect(currentX - 5, currentY - 5, 10, 10);
    } else if (shape === "line") {
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    } else {
        // For shapes, the drawing happens on mouseup/touchend
    }
}

function endDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    if (shape !== "line") {
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const x = touch.offsetX;
        const y = touch.offsetY;
        const width = x - startX;
        const height = y - startY;

        switch (shape) {
            case "rect":
                ctx.strokeRect(startX, startY, width, height);
                break;
            case "circle":
                const radius = Math.sqrt(width * width + height * height) / 2;
                const centerX = startX + width / 2;
                const centerY = startY + height / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
        }
    }
    saveHistory();
}

function saveHistory() {
    historyIndex++;
    if (historyIndex < history.length) {
        history = history.slice(0, historyIndex);
    }
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (history.length > 10) { // Limit history size for performance
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        ctx.putImageData(history[historyIndex], 0, 0);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        ctx.putImageData(history[historyIndex], 0, 0);
    }
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("mouseout", endDrawing);

// Touch events
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw, { passive: false }); // Prevent scrolling during drawing
canvas.addEventListener("touchend", endDrawing);
canvas.addEventListener("touchcancel", endDrawing);

colorPicker.addEventListener("change", () => {
    ctx.strokeStyle = colorPicker.value;
});
lineWidthSlider.addEventListener("change", () => {
    ctx.lineWidth = lineWidthSlider.value;
});
eraserButton.addEventListener("click", () => {
    isErasing = !isErasing;
    eraserButton.classList.toggle("active", isErasing); // Add visual feedback
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
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw to fill canvas
            saveHistory();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Allow loading the same image again
});
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);

ctx.strokeStyle = colorPicker.value;
ctx.lineWidth = lineWidthSlider.value;
saveHistory();
