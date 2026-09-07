import path from 'path';
import { test, expect } from '@playwright/test';
import { readExcelSync } from './utils/excelReader';
import { LoginPage } from './pages/LoginPage';
import { LoginData } from './types/login';

test.use({ screenshot: 'only-on-failure', video: 'retain-on-failure' });

const excelPath = path.resolve(__dirname, '../testData/testData.xlsx');
const datasets: LoginData[] = readExcelSync(excelPath);

test.describe('Login Tests - Excel DDT', () => {
  for (const data of datasets) {
    test(`Login Validation - ${data.username}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(data.username, data.password);

      if (data.expectedResult === 'locked') {
        const err = await loginPage.getErrorMessage();
        expect(err, 'Expected locked user error to appear').not.toBeNull();
        expect(err?.toLowerCase(), 'Locked user error text').toContain('locked out');

        await expect(page).not.toHaveURL(/.*inventory.html/);
        expect(await loginPage.isInventoryVisible(), 'Inventory must not be visible for locked user').toBe(false);

        const usernameVisible = await page.locator('input[name="user-name"]').isVisible();
        expect(usernameVisible, 'Username input should remain visible after locked login attempt').toBe(true);
      } else {
        await expect(page).toHaveURL(/.*inventory.html/);
        expect(await loginPage.isInventoryVisible(), 'Inventory should be visible after login').toBe(true);
      }
    });
  }
});
