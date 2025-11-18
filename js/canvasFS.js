document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".canvasContainer");
    const canvas = document.querySelector(".renderCanvas");
    const btn = document.getElementById("fullscreenBtn");

    if (!container || !btn) {
        console.error("Elements not found");
        return;
    }

    btn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener("fullscreenchange", () => {
        if (document.fullscreenElement) {
            // Fullscreen is on
            container.classList.add("fullscreen");
            canvas.classList.add("fullscreen");
        } else {
            // Fullscreen is off
            container.classList.remove("fullscreen");
            canvas.classList.remove("fullscreen");
        }
    });
});