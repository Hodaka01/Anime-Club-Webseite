document.addEventListener("DOMContentLoaded", function () {
    const menuContainer = document.querySelector(".menu-container");

    menuContainer.addEventListener("click", function (event) {
        // Toggle die Klasse "active", um Dropdown zu zeigen/zu verstecken
        menuContainer.classList.toggle("active");
        event.stopPropagation(); // Verhindert, dass andere Klicks das Dropdown schließen
    });

    document.addEventListener("click", function () {
        // Schließt das Dropdown, wenn außerhalb des Menüs geklickt wird
        menuContainer.classList.remove("active");
    });
});
