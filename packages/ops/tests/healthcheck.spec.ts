import { expect, test } from '@playwright/test';

const URL = process.env.URL as string;
const EMAIL = process.env.EMAIL as string;
const PASSWORD = process.env.PASSWORD as string;

const PROJECT_MODELS = ['building', 'operation', 'project'] as const;

test('it can reach SEEDS staging and perform basic actions', async ({ page }) => {
  await page.goto(URL);
  await page.waitForURL(`${URL}/authentication`);

  await page.waitForLoadState('networkidle');
  await page.locator('#cookie-consent-accept').click();
  await page
    .locator('#cookie-consent-accept')
    .waitFor({ state: 'detached' });

  await page.getByTestId('authentication-login-link').click();
  await page.waitForURL(`${URL}/authentication/login`);

  await page.getByTestId('login-email').fill(EMAIL);
  await page.getByTestId('login-password').fill(PASSWORD);
  await page.getByTestId('login-submit').click();
  await page.waitForURL(URL);
  await page.waitForLoadState('networkidle');

  for (const model of PROJECT_MODELS) {
    await page.getByTestId(`dashboard-create-${model}`).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByTestId(`create-project-modal-${model}`),
    ).toBeVisible();
    await page.getByTestId('create-project-cancel').click();
    await expect(
      page.getByTestId(`create-project-modal-${model}`),
    ).toBeHidden();
  }
});
