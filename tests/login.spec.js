import { test, expect } from '@playwright/test';

test.describe('Page de connexion', () => {
  test.beforeEach(async ({ page }) => {
    // Intercepter l'appel fetch vers example.com pour éviter les blocages réseau
    await page.route('https://example.com/**', route => route.fulfill({ status: 200 }));
    // Aller à la racine (index.html) via le baseURL de la config
    await page.goto('/'); 
  });

  test('1. Affichage initial', async ({ page }) => {
    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('submit')).toBeEnabled();
  });

  test('2. Validations client (champs vides)', async ({ page }) => {
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('email-error')).toContainText('Veuillez renseigner');
  });

  test('3. Échec de connexion (mauvais identifiants)', async ({ page }) => {
    await page.getByTestId('email').fill('inconnu@test.com');
    await page.getByTestId('password').fill('mauvais');
    await page.getByTestId('submit').click();
    
    await expect(page.getByTestId('global-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
  });

  test('4. Connexion réussie et redirection', async ({ page }) => {
    await page.getByTestId('email').fill('test@test.com');
    await page.getByTestId('password').fill('test');
    await page.getByTestId('submit').click();

    await expect(page).toHaveURL(/contact.html/);
  });
});