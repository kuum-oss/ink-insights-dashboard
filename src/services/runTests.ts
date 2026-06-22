#!/usr/bin/env node

import { runDatabaseTests, runValidationTests, runBusinessLogicTests } from './tests';

async function main() {
  console.log('====================================');
  console.log('📋 Ink Insights - Комплексные тесты');
  console.log('====================================\n');

  const dbResult = runDatabaseTests();
  const validationResult = runValidationTests();
  const logicResult = runBusinessLogicTests();

  const totalPassed = dbResult.passed + validationResult.passed + logicResult.passed;
  const totalFailed = dbResult.failed + validationResult.failed + logicResult.failed;
  const totalTests = totalPassed + totalFailed;

  console.log('====================================');
  console.log('📊 ИТОГОВЫЙ РЕЗУЛЬТАТ');
  console.log('====================================');
  console.log(`✓ Пройдено: ${totalPassed}/${totalTests} тестов`);
  console.log(`✗ Провалено: ${totalFailed}/${totalTests} тестов`);
  console.log(`Успешность: ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`);

  if (totalFailed === 0) {
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    process.exit(0);
  } else {
    console.log('❌ Некоторые тесты не прошли.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Ошибка при запуске тестов:', err);
  process.exit(1);
});
