async function getEventDate() {
    const doc = await firebase.firestore().collection("config").doc("eventDate").get();
    return doc.exists ? doc.data().date : calculateNextSecondSunday();
}

async function setEventDate(date) {
    await firebase.firestore().collection("config").doc("eventDate").set({ date });
}

function calculateNextSecondSunday() {
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    
    let firstDay = new Date(year, month, 1).getDay();
    let secondSunday = (firstDay === 0 ? 8 : 15 - firstDay);

    return new Date(year, month, secondSunday).toISOString();
}
