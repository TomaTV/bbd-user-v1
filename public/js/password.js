// Fonction générique pour ajouter des écouteurs d'événements
function addInputListener(elementId, callback) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('input', callback);
    }
}

// Ajouter des écouteurs d'événements pour les champs de mot de passe
addInputListener('password', function () {
    checkPasswordStrength(this.value);
});

addInputListener('confirm_password', function () {
    checkPasswordMatch(this.value);
});

// Fonction pour vérifier si les mots de passe correspondent
function checkPasswordMatch(confirmPassword) {
    const password = document.getElementById('password')?.value;
    const confirmMessage = document.getElementById('confirm-message');

    confirmMessage.innerHTML = password === confirmPassword
        ? 'Les mots de passe correspondent.'
        : 'Les mots de passe ne correspondent pas.';

    confirmMessage.classList.toggle('invalid', password !== confirmPassword);
}

// Fonction pour vérifier la force du mot de passe
function checkPasswordStrength(password) {
    const strengthMessage = document.getElementById('strength-message');

    if (!strengthMessage) {
        return;
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 8) {
        strengthMessage.innerHTML = 'Faible : le mot de passe doit contenir au moins 8 caractères.';
        strengthMessage.classList.remove('medium', 'strong');
        strengthMessage.classList.add('weak');
        return;
    }

    // Vérifier la présence de lettres majuscules
    if (!/[A-Z]/.test(password)) {
        strengthMessage.innerHTML = 'Moyen : le mot de passe doit contenir au moins une lettre majuscule.';
        strengthMessage.classList.remove('weak', 'strong');
        strengthMessage.classList.add('medium');
        return;
    }

    // Vérifier la présence de lettres minuscules
    if (!/[a-z]/.test(password)) {
        strengthMessage.innerHTML = 'Moyen : le mot de passe doit contenir au moins une lettre minuscule.';
        strengthMessage.classList.remove('weak', 'strong');
        strengthMessage.classList.add('medium');
        return;
    }

    // Vérifier la présence de chiffres
    if (!/\d/.test(password)) {
        strengthMessage.innerHTML = 'Moyen : le mot de passe doit contenir au moins un chiffre.';
        strengthMessage.classList.remove('weak', 'strong');
        strengthMessage.classList.add('medium');
        return;
    }

    // Vérifier la présence de caractères spéciaux
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strengthMessage.innerHTML = 'Moyen : le mot de passe doit contenir au moins un caractère spécial.';
        strengthMessage.classList.remove('weak', 'strong');
        strengthMessage.classList.add('medium');
        return;
    }

    // Si toutes les conditions sont remplies, le mot de passe est fort
    strengthMessage.innerHTML = 'Fort : le mot de passe est sécurisé.';
    strengthMessage.classList.remove('weak', 'medium');
    strengthMessage.classList.add('strong');
}

// Fonction pour afficher le message d'erreur
function displayErrorMessage(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = message;
    errorMessage.style.display = message ? 'block' : 'none';
}

// Fonction pour valider le formulaire de connexion
function validateLoginForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        displayErrorMessage('Veuillez remplir tous les champs.');
        return false; // Empêche la soumission du formulaire si des champs sont vides
    }

    return true; // Permet la soumission du formulaire si tout est valide
}

document.addEventListener('DOMContentLoaded', function () {
    const errorMessage = document.getElementById('error-message'); // Ajout de cette ligne

    // Lire les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    // Afficher un message d'erreur si le paramètre 'error' est présent
    if (errorParam) {
        // Personnalisez le message d'erreur en fonction du paramètre 'error'
        let errorMessageText = 'Erreur : ';

        switch (errorParam) {
            case 'invalid':
                errorMessageText += 'Nom d\'utilisateur ou mot de passe incorrect.';
                break;
            // Ajoutez d'autres cas selon vos besoins

            default:
                errorMessageText += 'Une erreur s\'est produite.';
                break;
        }

        errorMessage.innerHTML = errorMessageText;
        errorMessage.style.display = 'block';
    }
    
    // Ouverture menu
    const accountInfo = document.getElementById('account-info');
    const accountMenu = document.getElementById('account-menu');

    accountInfo.addEventListener('click', function () {
        accountMenu.style.display = accountMenu.style.display === 'none' ? 'block' : 'none';
    });
});

// Click menu
document.getElementById('dropdown-icon').addEventListener('click', function() {
    var accountMenu = document.getElementById('account-menu');
    var dropdownIcon = document.getElementById('dropdown-icon');

    accountMenu.classList.toggle('opened');
    accountMenu.classList.toggle('closed');
    dropdownIcon.style.transform = accountMenu.classList.contains('opened') ? 'rotate(180deg)' : 'rotate(0deg)';
});