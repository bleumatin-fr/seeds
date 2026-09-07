import { expect, Page, test } from '@playwright/test';

const URL = process.env.URL as string;
const EMAIL = process.env.EMAIL as string;
const PASSWORD = process.env.PASSWORD as string;

/**
 * Production (e0c5012 / v2.0.20) has no data-testid hooks.
 * Create-button labels come from dashboardText.createButton in ProjectsUtils.
 */
const PROJECT_MODELS = [
  { createLabel: 'bâtiment / site', modalTitle: 'Création bâtiment' },
  { createLabel: 'fonctionnement', modalTitle: 'Création fonctionnement' },
  { createLabel: 'projet', modalTitle: 'Création projet' },
] as const;

/** Closes onboarding / newsletter modals that block the dashboard. */
async function dismissBlockingModals(page: Page) {
  const welcomeSkip = page.getByRole('link', {
    name: 'Je connais déjà, passer',
  });

  try {
    await welcomeSkip.waitFor({ state: 'visible', timeout: 10_000 });
    await welcomeSkip.click();
    await expect(welcomeSkip).toBeHidden();
  } catch {
    // Onboarding already completed for this account/session.
  }

  const optinDismiss = page.getByRole('button', {
    name: "Pas pour l'instant",
  });

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

test('it can reach SEEDS production and perform basic actions', async ({
  page,
}) => {
  await page.goto(URL);
  await page.waitForURL(`${URL}/authentication`);

  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Autoriser et fermer' }).click();
  await page
    .getByRole('button', { name: 'Autoriser et fermer' })
    .waitFor({ state: 'detached' });

  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(`${URL}/authentication/login`);

  await page.getByLabel('Adresse email').fill(EMAIL);
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: "S'authentifier" }).click();
  await page.waitForURL(URL);
  await page.waitForLoadState('networkidle');
  await dismissBlockingModals(page);

  await expect(page.getByText('bâtiment / site').first()).toBeVisible();

  for (const { createLabel, modalTitle } of PROJECT_MODELS) {
    await page.getByText(createLabel, { exact: true }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: modalTitle }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(
      page.getByRole('heading', { name: modalTitle }),
    ).toBeHidden();
  }
});
