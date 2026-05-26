import { expect, Page, test } from '@playwright/test';

const URL = process.env.URL as string;
const EMAIL = process.env.EMAIL as string;
const PASSWORD = process.env.PASSWORD as string;

const PROJECT_MODELS = ['building', 'operation', 'project'] as const;

/** Closes onboarding / newsletter modals that block the dashboard. */
async function dismissBlockingModals(page: Page) {
  const welcomeSkip = page
    .getByTestId('onboarding-welcome-skip')
    .or(page.getByRole('link', { name: 'Je connais déjà, passer' }));

  try {
    await welcomeSkip.waitFor({ state: 'visible', timeout: 10_000 });
    await welcomeSkip.click();
    await expect(welcomeSkip).toBeHidden();
  } catch {
    // Onboarding already completed for this account/session.
  }

  const optinDismiss = page
    .getByTestId('optin-dismiss')
    .or(page.getByRole('button', { name: "Pas pour l'instant" }));

  if (await optinDismiss.isVisible()) {
    await optinDismiss.click();
    await expect(optinDismiss).toBeHidden();
  }

  // Skipping welcome sets onboarding collapsed, which auto-opens #user-menu
  // (see UserMenu.tsx) and its backdrop blocks dashboard clicks.
  const userMenu = page.locator('#user-menu');
  try {
    await userMenu.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    // Menu did not auto-open (onboarding already completed).
  }
  if (await userMenu.isVisible()) {
    await page.keyboard.press('Escape');
    await expect(userMenu).toBeHidden();
  }
}

test('it can reach SEEDS staging and perform basic actions', async ({ page }) => {  await page.goto(URL);
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
  await dismissBlockingModals(page);
  await expect(page.getByTestId('dashboard-create-building')).toBeVisible();

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
