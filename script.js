document.addEventListener("DOMContentLoaded", function () {
    const mitgliedListe = document.getElementById("mitglied-liste");
    const mitglieder = JSON.parse(localStorage.getItem("mitglieder")) || [];

    function renderMitglieder() {
        mitgliedListe.innerHTML = "";
        mitglieder.forEach((mitglied, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${mitglied.name} - Genres: ${mitglied.genre} - Lieblingsanime: ${mitglied.anime} 
                            <button onclick="löschenMitglied(${index})">Löschen</button>`;
            mitgliedListe.appendChild(li);
        });
    }

    window.hinzufügenMitglied = function () {
        const name = document.getElementById("mitglied-name").value;
        const genre = document.getElementById("mitglied-genre").value;
        const anime = document.getElementById("mitglied-anime").value;

        if (name.trim() !== "") {
            mitglieder.push({ name, genre, anime });
            localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
            renderMitglieder();
            document.getElementById("mitglied-name").value = "";
            document.getElementById("mitglied-genre").value = "";
            document.getElementById("mitglied-anime").value = "";
        }
    };

    window.löschenMitglied = function (index) {
        mitglieder.splice(index, 1);
        localStorage.setItem("mitglieder", JSON.stringify(mitglieder));
        renderMitglieder();
    };

    renderMitglieder();
});
