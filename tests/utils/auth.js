const { expect } = require('@playwright/test');

async function login(page) {
  await page.goto('/');
  await page.getByTestId('email').fill('test@test.com');
  await page.getByTestId('password').fill('test');
  
  // On attend que l'URL change vers contact.html suite au clic
  await Promise.all([
    page.waitForURL(/contact.html/),
    page.getByTestId('submit').click()
  ]);
}

module.exports = { login };