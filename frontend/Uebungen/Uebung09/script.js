document.getElementById("registration-form").addEventListener("submit", function(event) {
    event.preventDefault();

    let hasErrors = false;

    const fullname = document.getElementById("fullname");
    const fullnameError = document.getElementById("fullname-error");
    if (!fullname.value.trim()) {
        fullnameError.textContent = "Bitte geben Sie Ihren vollständigen Namen ein.";
        hasErrors = true;
    } else {
        fullnameError.textContent = "";
    }

    const email = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailPattern.test(email.value)) {
        emailError.textContent = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
        hasErrors = true;
    } else {
        emailError.textContent = "";
    }

    const password = document.getElementById("password");
    const passwordError = document.getElementById("password-error");
    if (password.value.length < 8) {
        passwordError.textContent = "Das Passwort muss mindestens 8 Zeichen lang sein.";
        hasErrors = true;
    } else {
        passwordError.textContent = "";
    }

    const confirmPassword = document.getElementById("confirm-password");
    const confirmPasswordError = document.getElementById("confirm-password-error");
    if (confirmPassword.value !== password.value) {
        confirmPasswordError.textContent = "Die Passwörter stimmen nicht überein.";
        hasErrors = true;
    } else {
        confirmPasswordError.textContent = "";
    }

    const birthdate = document.getElementById("birthdate");
    const birthdateError = document.getElementById("birthdate-error");
    if (!birthdate.value) {
        birthdateError.textContent = "Bitte geben Sie Ihr Geburtsdatum ein.";
        hasErrors = true;
    } else {
        birthdateError.textContent = "";
    }

    const country = document.getElementById("country");
    const countryError = document.getElementById("country-error");
    if (!country.value) {
        countryError.textContent = "Bitte wählen Sie ein Land aus.";
        hasErrors = true;
    } else {
        countryError.textContent = "";
    }

    const terms = document.getElementById("terms");
    const termsError = document.getElementById("terms-error");
    if (!terms.checked) {
        termsError.textContent = "Sie müssen die allgemeinen Geschäftsbedingungen akzeptieren.";
        hasErrors = true;
    } else {
        termsError.textContent = "";
    }

    if (!hasErrors) {
        document.getElementById("summary-fullname").textContent = fullname.value;
        document.getElementById("summary-email").textContent = email.value;
        document.getElementById("summary-birthdate").textContent = birthdate.value;
        document.getElementById("summary-country").textContent = country.options[country.selectedIndex].text;

        document.getElementById("summary-section").style.display = "block";
    }
});

document.getElementById("reset-button").addEventListener("click", function() {
    document.getElementById("registration-form").reset();

    document.getElementById("summary-section").style.display = "none";

    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach(error => error.textContent = "");
});

let startTime;
let endTime;

function logEvent(eventType, eventDetails = '') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${eventType}: ${eventDetails}`);
}

document.addEventListener('DOMContentLoaded', () => {
    startTime = new Date();
    logEvent('Formular geladen', 'Startzeit aufgezeichnet');
});

document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('focus', (event) => {
        logEvent('Fokus erhalten', `Input-Feld ID: ${event.target.id}`);
    });

    input.addEventListener('blur', (event) => {
        logEvent('Fokus verloren', `Input-Feld ID: ${event.target.id}`);
    });

    input.addEventListener('input', (event) => {
        logEvent('Interaktion', `Input-Feld ID: ${event.target.id}, Wert: ${event.target.value}`);
    });
});

document.getElementById("registration-form").addEventListener("submit", function(event) {
    endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;

    logEvent('Formular abgeschickt', `Zeit zum Ausfüllen: ${timeTaken} Sekunden`);

    let hasErrors = false;
    let formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        if (element.value === '') {
            logEvent('Fehler', `Leer: ${element.id}`);
            hasErrors = true;
        }
    });

    if (hasErrors) {
        event.preventDefault();
    } else {
        logEvent('Formular erfolgreich abgeschickt');
    }
});

document.getElementById("reset-button").addEventListener("click", function() {
    document.getElementById("registration-form").reset();
    logEvent('Formular zurückgesetzt', 'Alle Eingabefelder wurden zurückgesetzt');
    
    document.getElementById("summary-section").style.display = "none";

    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach(error => error.textContent = "");
});