# Page de connexion d’entraînement Playwright

Ce projet propose deux pages statiques destinées aux ateliers Playwright :

- `index.html` : page de connexion avec identifiants déterministes (`test@test.com` / `test`).  
  - Un `fetch` explicite est déclenché à chaque soumission pour observer l’activité réseau côté tests.  
  - Les éléments de formulaire disposent d’attributs `data-testid` stables et de messages d’erreur présents en permanence dans le DOM.

**Identifiants de démonstration**

- Email : `test@test.com`
- Mot de passe : `test`

- `contact.html` : formulaire de contact accessible après authentification réussie.  
  - Tous les champs sont obligatoires et un honeypot discret bloque les soumissions automatiques.  
  - Chaque envoi déclenche un `fetch` `GET` vers `https://example.com/?source=contact&length=<...>` qui répond en `200 OK`, idéal pour un `page.waitForResponse()` dans Playwright.

## Le honeypot en pratique

- **But** : champ invisible qui piège les robots remplissant tout automatiquement. Un humain ne le voit pas et le laisse vide, mais un bot naïf le remplit et l’envoi est bloqué.  
- **Implémentation** : dans `contact.html`, le bloc `<div class="honeypot" aria-hidden="true">` contient l’input `data-testid="contact-honeypot"`. Deux protections le rendent invisibles pour l’utilisateur :
  - Le CSS lui applique `position: absolute; left: -10000px;` pour l’éloigner loin de la fenêtre.  
  - L’attribut `aria-hidden="true"` signale aux technologies d’assistance de l’ignorer.  
  Lorsque l’on soumet le formulaire, le script vérifie `contactHoneypotInput.value.trim()` ; si quelque chose est saisi, on affiche “La soumission a été bloquée.” et on arrête le traitement.  
- **Test Playwright** :  
  - Cas humain : remplir les champs visibles, laisser le honeypot vide → la requête `fetch` part (réponse `200 OK` sur `example.com`) et le succès apparaît.  
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
1. `tests/utils/auth.ts` : helper `async function login(page)` qui renseigne les identifiants valides et soumet le formulaire.
2. `tests/login.spec.ts` : scénarios propres à la page de connexion.
3. `tests/contact.spec.ts` : scénarios propres au formulaire de contact.

*Indice : centraliser la séquence de connexion dans `login(page)` évite de la dupliquer dans chaque spec.*

### Scénarios à automatiser (6 au total)
1. **Affichage initial – connexion** : vérifier structure, labels, messages globaux masqués, présence des `data-testid`.
2. **Validations client – connexion** : email vide, email invalide, mot de passe vide (paramétrer ou décliner en sous-cas).
3. **Échec de connexion** : identifiants incorrects → bannière “Identifiants invalides”, message mot de passe, requête `GET https://example.com/` observée.
4. **Connexion réussie + redirection** : identifiants valides → bannière succès, requête `GET https://example.com/`, navigation vers `contact.html`.
5. **Contact – parcours humain** : via `login(page)`, remplir tous les champs, laisser le honeypot vide, attendre `GET https://example.com/?source=contact…` (statut 200), vérifier message succès et reset.
6. **Contact – parcours robot (honeypot)** : remplir `data-testid="contact-honeypot"` avant submit → message “La soumission a été bloquée.”, absence de succès.

### Livrables attendus
- Le code Playwright pour les 3 fichiers ci-dessus.
- Une note succincte expliquant :
  - pourquoi ces 6 scénarios couvrent les risques essentiels,
  - en quoi les tests réalisés sont robustes,
  - pourquoi le HTML fourni est adapté à cette automatisation.
- Un mini retour d’expérience (≤1 page) décrivant :
  - l’usage de `waitForRequest` / `waitForResponse`,
  - la gestion des attentes liées à l’accessibilité (`aria-live`, `aria-invalid`, etc.),
  - quels hooks Playwright il mettrait en place en premier et le bénéfice attendu pour la suite de tests.
