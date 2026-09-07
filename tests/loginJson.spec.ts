import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { LoginData } from './types/login';

test.use({ screenshot: 'only-on-failure', video: 'retain-on-failure' });

const dataPath = path.resolve(__dirname, '../testData/loginData.json');
const datasets: LoginData[] = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

test.describe('Login Tests - JSON DDT', () => {
  for (const data of datasets) {
    test(`Login Validation - ${data.username}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(data.username, data.password);

      if (data.expectedResult === 'locked') {
        const err = await loginPage.getErrorMessage();
        expect(err, 'Expected locked user error to appear').not.toBeNull();
        expect(err?.toLowerCase(), 'Locked user error text').toContain('locked out');
      } else {
        await expect(page).toHaveURL(/.*inventory.html/);
        expect(await loginPage.isInventoryVisible(), 'Inventory should be visible after login').toBe(true);
      }
    });
  }
});
