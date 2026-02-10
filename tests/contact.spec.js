import { test, expect } from '@playwright/test';
import { login } from './utils/auth.js';

test.describe('Page de contact', () => {
  test.beforeEach(async ({ page }) => {
    // Intercepter l'appel fetch vers example.com (utilisé par le formulaire de contact)
    await page.route('https://example.com/**', route => route.fulfill({ status: 200 }));
    // Utiliser le helper pour se connecter et arriver sur contact.html
    await login(page);
  });

  test('5. Contact – parcours humain', async ({ page }) => {
    await page.getByTestId('contact-name').fill('Jean Dupont');
    await page.getByTestId('contact-email').fill('jean@test.com');
    await page.getByTestId('contact-message').fill('Ceci est un message de test.');

    await page.getByTestId('contact-submit').click();

    // Vérifier que le message de succès apparaît et que le champ nom est vidé
    await expect(page.getByTestId('contact-success')).toBeVisible();
    await expect(page.getByTestId('contact-name')).toHaveValue('');
  });

  test('6. Contact – parcours robot (honeypot)', async ({ page }) => {
    await page.getByTestId('contact-name').fill('Robot');
    await page.getByTestId('contact-email').fill('bot@test.com');
    await page.getByTestId('contact-message').fill('Bip Boop');
    
    // Remplir le champ invisible (honeypot) pour simuler un robot
    await page.getByTestId('contact-honeypot').fill('Je suis un bot');

    await page.getByTestId('contact-submit').click();

    // Vérifier que l'erreur de blocage apparaît
    await expect(page.getByTestId('contact-error')).toBeVisible();
    await expect(page.getByTestId('contact-error')).toContainText('bloquée');
    await expect(page.getByTestId('contact-success')).toBeHidden();
  });
});