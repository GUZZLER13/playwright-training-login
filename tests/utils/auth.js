import path from 'path';

export async function login(page) {
  // On construit le chemin absolu vers le fichier
  const filePath = `file://${path.resolve('index.html')}`;
  await page.goto(filePath);
  
  await page.getByTestId('email').fill('test@test.com');
  await page.getByTestId('password').fill('test');
  await page.getByTestId('submit').click();
  
  // On attend que l'URL contienne contact.html
  await page.waitForURL('**/contact.html');
}