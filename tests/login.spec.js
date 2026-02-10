const { test, expect } = require('@playwright/test');

test.describe('Connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Affichage initial', async ({ page }) => {
    const ids = ['login-form', 'email', 'password', 'submit', 'global-error', 'global-success', 'email-error', 'password-error'];
    for (const id of ids) {
      await expect(page.getByTestId(id)).toBeAttached();
    }
  });

  test('2a. Champs vides', async ({ page }) => {
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
  });

  test('2b. Email invalide', async ({ page }) => {
    await page.getByTestId('email').fill('aaa');
    await page.getByTestId('password').fill('test');
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('email-error')).toContainText(/format/i);
  });

  test('3. Échec de connexion', async ({ page }) => {
    await page.context().clearCookies();
    // On écoute la requête sortante vers httpbin
    const requestPromise = page.waitForRequest(req => req.url().includes('httpbin.org'));
    
    await page.getByTestId('email').fill('inconnu@test.com');
    await page.getByTestId('password').fill('mauvais');
    await page.getByTestId('submit').click();

    await requestPromise; // Vérifie que le fetch a bien été tenté
    await expect(page.getByTestId('global-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toContainText(/correspondent pas/);
  });

  test('4. Connexion réussie', async ({ page, context }) => {
  await context.clearCookies();
  await context.clearPermissions();
  await page.getByTestId('email').fill('test@test.com');
  await page.getByTestId('password').fill('test');

  const [request, response] = await Promise.all([
    page.waitForRequest(req => req.url().includes('httpbin.org/get')),
    page.waitForResponse(res => res.url().includes('contact.html') && res.status() === 200),
    page.getByTestId('submit').click(),
  ]);

  expect(request).toBeDefined(); 
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/contact\.html/);
});
});