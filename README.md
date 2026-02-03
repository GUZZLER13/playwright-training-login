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
  - Chaque envoi provoque un `fetch` `POST` vers `https://example.com/contact`, indépendamment de la réponse.

## Le honeypot en pratique

- **But** : champ invisible qui piège les robots remplissant tout automatiquement. Un humain ne le voit pas et le laisse vide, mais un bot naïf le remplit et l’envoi est bloqué.  
- **Implémentation** : dans `contact.html`, le bloc `<div class="honeypot" aria-hidden="true">` contient l’input `data-testid="contact-honeypot"`. Deux protections le rendent invisibles pour l’utilisateur :
  - Le CSS lui applique `position: absolute; left: -10000px;` pour l’éloigner loin de la fenêtre.  
  - L’attribut `aria-hidden="true"` signale aux technologies d’assistance de l’ignorer.  
  Lorsque l’on soumet le formulaire, le script vérifie `contactHoneypotInput.value.trim()` ; si quelque chose est saisi, on affiche “La soumission a été bloquée.” et on arrête le traitement.  
- **Test Playwright** :  
  - Cas humain : remplir les champs visibles, laisser le honeypot vide → la requête `fetch` part et le succès apparaît.  
  - Cas robot : `locator('[data-testid="contact-honeypot"]').fill('bot')` avant le submit → le message d’erreur global devient visible (`toBeVisible`) et aucun succès n’est signalé.

## Pourquoi c’est robuste pour Playwright

- **DOM stable** : les messages d’état existent dès le chargement et sont simplement masqués/affichés.  
- **Sélecteurs fiables** : des `data-testid` dédiés évitent de dépendre du style ou du texte visible.  
- **Logique déterministe** : aucune temporisation ou condition aléatoire, les validations produisent toujours le même résultat.  
- **Activité réseau contrôlée** : les requêtes `fetch` sont centralisées et triviales à intercepter avec `page.waitForRequest` ou `page.waitForResponse`.  
- **Accessibilité soignée** : attributs ARIA (`aria-live`, `aria-invalid`, `role="alert"`) facilitent les assertions sur l’état de l’interface.
