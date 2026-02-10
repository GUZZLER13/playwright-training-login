# Page de connexion d’entraînement Playwright

**Projet déployé sur :** [https://nimble-youtiao-9ed66b.netlify.app/](https://nimble-youtiao-9ed66b.netlify.app/)

Ce projet propose deux pages statiques destinées aux ateliers Playwright :

- `index.html` : page de connexion avec identifiants déterministes (`test@test.com` / `test`).  
  - Un `fetch` vers `/api/login.json` (fichier local) est déclenché à chaque soumission pour observer l’activité réseau côté tests.  
  - Les éléments de formulaire disposent d’attributs `data-testid` stables et de messages d’erreur présents en permanence dans le DOM.

**Identifiants de démonstration**

- Email : `test@test.com`
- Mot de passe : `test`

- `contact.html` : formulaire de contact accessible après authentification réussie.  
  - Tous les champs sont obligatoires et un honeypot discret bloque les soumissions automatiques.  
  - Chaque envoi déclenche un `fetch` `GET` vers `/api/contact.json?source=contact&length=<...>` (fichier local, pas de dépendance externe) qui répond en `200 OK`, idéal pour un `page.waitForResponse()` dans Playwright.

## Le honeypot en pratique

- **But** : champ invisible qui piège les robots remplissant tout automatiquement. Un humain ne le voit pas et le laisse vide, mais un bot naïf le remplit et l’envoi est bloqué.  
- **Implémentation** : dans `contact.html`, le bloc `<div class="honeypot" aria-hidden="true">` contient l’input `data-testid="contact-honeypot"`. Deux protections le rendent invisibles pour l’utilisateur :
  - Le CSS lui applique `position: absolute; left: -10000px;` pour l’éloigner loin de la fenêtre.  
  - L’attribut `aria-hidden="true"` signale aux technologies d’assistance de l’ignorer.  
  Lorsque l’on soumet le formulaire, le script vérifie `contactHoneypotInput.value.trim()` ; si quelque chose est saisi, on affiche “La soumission a été bloquée.” et on arrête le traitement.  
- **Test Playwright** :  
  - Cas humain : remplir les champs visibles, laisser le honeypot vide → la requête `fetch` part (réponse `200 OK` sur `/api/contact.json`) et le succès apparaît.  
  - Cas robot : `locator('[data-testid="contact-honeypot"]').fill('bot')` avant le submit → le message d’erreur global devient visible (`toBeVisible`) et aucun succès n’est signalé.

## Pourquoi c’est robuste pour Playwright

- **DOM stable** : les messages d’état existent dès le chargement et sont simplement masqués/affichés.  
- **Sélecteurs fiables** : des `data-testid` dédiés évitent de dépendre du style ou du texte visible.  
- **Logique déterministe** : aucune temporisation ou condition aléatoire, les validations produisent toujours le même résultat.  
- **Activité réseau contrôlée** : les requêtes `fetch` sont centralisées et triviales à intercepter avec `page.waitForRequest` ou `page.waitForResponse`.  
- **Accessibilité soignée** : attributs ARIA (`aria-live`, `aria-invalid`, `role="alert"`) facilitent les assertions sur l’état de l’interface.

## Exercice Playwright

Objectif : couvrir les deux pages avec une suite Playwright exploitant leur conception “test-friendly”.

### Structure des fichiers attendue
1. `tests/utils/auth.js` : helper `async function login(page)` qui renseigne les identifiants valides et soumet le formulaire.
2. `tests/login.spec.js` : scénarios propres à la page de connexion.
3. `tests/contact.spec.js` : scénarios propres au formulaire de contact.

*Indice : centraliser la séquence de connexion dans `login(page)` évite de la dupliquer dans chaque spec.*

### Scénarios à automatiser (6 au total)

Pour les requêtes réseau (scénarios 3, 4 et 5), utiliser `waitForRequest` ou `waitForResponse` pour attendre et vérifier l’appel (URL, statut 200). Ne pas remplacer la requête par un mock (`page.route()`).

1. **Affichage initial – connexion** : vérifier structure, labels, messages globaux masqués, présence des `data-testid`.
2. **Validations client – connexion** : email vide, email invalide, mot de passe vide (paramétrer ou décliner en sous-cas).
3. **Échec de connexion** : identifiants incorrects → bannière “Identifiants invalides”, message mot de passe. Le login déclenche un fetch vers `/api/login.json` (fichier local), observable avec `waitForRequest` ou `waitForResponse`.
4. **Connexion réussie + redirection** : identifiants valides → navigation vers `contact.html`, vérifier la réponse 200 sur la navigation (`waitForResponse` sur `contact.html`). Pas de dépendance à une API externe.
5. **Contact – parcours humain** : via `login(page)`, remplir tous les champs, laisser le honeypot vide, attendre la réponse 200 sur `/api/contact.json` (`waitForResponse`), vérifier message succès et reset.
6. **Contact – parcours robot (honeypot)** : remplir `data-testid="contact-honeypot"` avant submit → message “La soumission a été bloquée.”, absence de succès.

### Couverture des scénarios

| Scénario | Fichier | Test | Type |
|----------|---------|------|------|
| 1. Affichage initial | `login.spec.js` | 1. Affichage initial | ✓ |
| 2a. Champs vides | `login.spec.js` | 2a. Champs vides | Négatif |
| 2b. Email invalide | `login.spec.js` | 2b. Email invalide | Négatif |
| 3. Échec de connexion | `login.spec.js` | 3. Échec de connexion | Négatif |
| 4. Connexion réussie | `login.spec.js` | 4. Connexion réussie | ✓ |
| 5. Contact parcours humain | `contact.spec.js` | 5. Contact parcours humain | ✓ |
| 6. Contact honeypot | `contact.spec.js` | 6. Contact honeypot | Négatif |
| Bonus – Validation contact | `contact.spec.js` | Bonus – Validation formulaire contact | Négatif |

### Livrables attendus
- Le code Playwright pour les 3 fichiers ci-dessus.
- Une note succincte expliquant :
  - pourquoi ces 6 scénarios couvrent les risques essentiels,
  - en quoi les tests réalisés sont robustes,
  - pourquoi le HTML fourni est adapté à cette automatisation.
- Un mini retour d’expérience (≤1 page) décrivant :
  - l’usage de `waitForRequest` / `waitForResponse`,
  - la gestion des attentes liées à l’accessibilité (`aria-live`, `aria-invalid`, etc.),
  - quels hooks Playwright tu mettrais en place en premier et quel bénéfice cela apporterait à la suite de tests.
