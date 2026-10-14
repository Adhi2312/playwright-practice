import { test, expect, Page } from '@playwright/test';

async function createTasks(
  page: Page,
  taskNames: string[]
): Promise<void> {
  const input = page.getByPlaceholder(
    'What needs to be done?'
  );

  for (const taskName of taskNames) {
    await input.fill(taskName);
    await input.press('Enter');
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/');
});

test('user can add multiple tasks', async ({ page }) => {
  await createTasks(page, [
    'task 1',
    'task 2',
    'task 3'
  ]);

  const allTasks = page.getByTestId('todo-item');

  await expect(allTasks).toHaveCount(3);

  await expect(allTasks).toHaveText([
    'task 1',
    'task 2',
    'task 3'
  ]);
});

test('user can mark a task as completed', async ({ page }) => {
  await createTasks(page, [
    'task 1',
    'task 2',
    'task 3'
  ]);

  const taskTwo = page
    .getByTestId('todo-item')
    .filter({ hasText: 'task 2' });

  const taskTwoCheckbox = taskTwo.getByRole('checkbox');

  await taskTwoCheckbox.check();

  await expect(taskTwoCheckbox).toBeChecked();

  await expect(
    taskTwo.getByTestId('todo-title')
  ).toHaveText('task 2');
});

test('user can delete a task', async ({ page }) => {
  await createTasks(page, [
    'task 1',
    'task 2',
    'task 3'
  ]);

  const allTasks = page.getByTestId('todo-item');

  await expect(allTasks).toHaveCount(3);

  const taskOne = allTasks.filter({
    hasText: 'task 1'
  });

  await taskOne.hover();

  const deleteButton = taskOne.locator(
    'button.destroy'
  );

  await deleteButton.click();

  await expect(taskOne).toHaveCount(0);
  await expect(allTasks).toHaveCount(2);
});

test('user can filter active tasks', async ({ page }) => {
  await createTasks(page, [
    'task 1',
    'task 2',
    'task 3'
  ]);

  const allTasks = page.getByTestId('todo-item');

  const taskTwo = allTasks.filter({
    hasText: 'task 2'
  });

  await taskTwo.getByRole('checkbox').check();

  await page
    .getByRole('link', {
      name: 'Active',
      exact: true
    })
    .click();

  await expect(allTasks).toHaveCount(2);

  await expect(
    allTasks.filter({ hasText: 'task 1' })
  ).toBeVisible();

  await expect(
    allTasks.filter({ hasText: 'task 3' })
  ).toBeVisible();

  await expect(
    allTasks.filter({ hasText: 'task 2' })
  ).toHaveCount(0);
});

test('user can filter completed tasks', async ({ page }) => {
  await createTasks(page, [
    'task 1',
    'task 2',
    'task 3'
  ]);

  const allTasks = page.getByTestId('todo-item');

  const taskTwo = allTasks.filter({
    hasText: 'task 2'
  });

  await taskTwo.getByRole('checkbox').check();

  await page
    .getByRole('link', {
      name: 'Completed',
      exact: true
    })
    .click();

  await expect(allTasks).toHaveCount(1);

  const completedTask = allTasks.filter({
    hasText: 'task 2'
  });

  await expect(completedTask).toBeVisible();

  await expect(
    completedTask.getByRole('checkbox')
  ).toBeChecked();

  await expect(
    allTasks.filter({ hasText: 'task 1' })
  ).toHaveCount(0);

  await expect(
    allTasks.filter({ hasText: 'task 3' })
  ).toHaveCount(0);
});

test('empty tasks cannot be created', async ({ page }) => {
  const input = page.getByPlaceholder(
    'What needs to be done?'
  );

  const allTasks = page.getByTestId('todo-item');

  // Empty value
  await input.press('Enter');

  await expect(allTasks).toHaveCount(0);

  // Whitespace-only value
  await input.fill('   ');
  await input.press('Enter');

  await expect(allTasks).toHaveCount(0);

  // Confirm that valid input still works
  await input.fill('valid task');
  await input.press('Enter');

  await expect(allTasks).toHaveCount(1);

  await expect(
    allTasks.getByTestId('todo-title')
  ).toHaveText('valid task');
});