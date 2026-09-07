import { Page, Locator } from '@playwright/test';

export interface LoginData {
  testCaseId?: string;
  username: string;
  password: string;
  expectedResult: string;
}

export class LoginPage {
  private usernameInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  private errorMessage: Locator;
  private inventoryList: Locator;

  constructor(private page: Page) {
    this.usernameInput = page.locator('input[name="user-name"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('input[name="login-button"]');
    this.errorMessage = page.locator('h3[data-test="error"], .error-message-container h3');
    this.inventoryList = page.locator('.inventory_list');
  }

  async navigate() {
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.waitForLoadState('networkidle');
  }

  async enterUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    const navPromise = this.page.waitForNavigation({ url: /.*inventory.html/, waitUntil: 'load' }).catch(() => undefined);
    const inventoryPromise = this.inventoryList.waitFor({ state: 'visible' }).catch(() => undefined);
    const errorPromise = this.errorMessage.waitFor({ state: 'visible' }).catch(() => undefined);

    await this.loginButton.click();

    await Promise.race([navPromise, inventoryPromise, errorPromise]);
  }

  async login(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      if ((await this.errorMessage.count()) === 0) return null;
    }
    return (await this.errorMessage.textContent())?.trim() ?? null;
  }

  async isInventoryVisible(): Promise<boolean> {
    try {
      await this.inventoryList.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}
