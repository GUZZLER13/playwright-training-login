const { test, expect } = require('@playwright/test');
const { login } = require('./utils/auth');

test.describe('Contact', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('5. Contact parcours humain', async ({ page }) => {
  await page.getByTestId('contact-name').fill('Jean');
  await page.getByTestId('contact-email').fill('jean@test.com');
  await page.getByTestId('contact-message').fill('Hello');

  const [request] = await Promise.all([
    page.waitForRequest(req => req.url().includes('source=contact')),
    page.getByTestId('contact-submit').click(),
  ]);

  expect(request.url()).toContain('source=contact');
  
  await expect(page.getByTestId('contact-success')).toBeVisible();
  await expect(page.getByTestId('contact-name')).toHaveValue('');
});

  test('6. Contact honeypot', async ({ page }) => {
    await page.getByTestId('contact-name').fill('Robot');
    await page.getByTestId('contact-email').fill('bot@test.com');
    await page.getByTestId('contact-message').fill('Bip Boup');
    await page.getByTestId('contact-honeypot').fill('Je suis un bot');

    await page.getByTestId('contact-submit').click();

    await expect(page.getByTestId('contact-error')).toBeVisible();
    await expect(page.getByTestId('contact-error')).toContainText('bloquée');
    await expect(page.getByTestId('contact-success')).toBeHidden();
  });

  test('Bonus – Validation formulaire contact', async ({ page }) => {
    // On ne remplit pas le nom
    await page.getByTestId('contact-email').fill('test@test.com');
    await page.getByTestId('contact-message').fill('Hello');
    
    await page.getByTestId('contact-submit').click();
    
    await expect(page.getByTestId('contact-name-error')).toBeVisible();
    await expect(page.getByTestId('contact-name-error')).toContainText(/indiquer votre nom/);
  });
});