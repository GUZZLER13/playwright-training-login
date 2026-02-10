import { test, expect } from '@playwright/test';

test.describe('Tunnel Utilisateur Complet', () => {
  
  test('Parcours complet : Connexion -> Envoi Message -> Déconnexion', async ({ page }) => {
    // 1. ÉTAPE LOGIN
    await page.goto('/');
    await page.route('https://example.com/**', route => route.fulfill({ status: 200 }));
    
    await page.getByTestId('email').fill('test@test.com');
    await page.getByTestId('password').fill('test');
    await page.getByTestId('submit').click();

    // Vérification de la transition
    await expect(page).toHaveURL(/contact.html/);

    // 2. ÉTAPE CONTACT (On enchaîne directement sans recharger la page)
    await page.getByTestId('contact-name').fill('Jean Dupont');
    await page.getByTestId('contact-email').fill('jean@test.com');
    await page.getByTestId('contact-message').fill('Ceci est un test de flux complet.');
    await page.getByTestId('contact-submit').click();

    // Vérification finale
    await expect(page.getByTestId('contact-success')).toBeVisible();
  });
});