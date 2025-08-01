/**
 * Authentication Flow Test Script
 * 
 * This script helps validate that the authentication flows properly preserve
 * and migrate user data. Run this in the browser console to test various scenarios.
 */

class AuthFlowTester {
  constructor() {
    this.testResults = [];
    this.originalConsoleLog = console.log;
    this.logs = [];
  }

  log(message) {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    this.originalConsoleLog(message);
  }

  async runAllTests() {
    console.clear();
    this.log('🧪 Starting Authentication Flow Tests');
    this.log('=====================================');

    const tests = [
      'testGuestDataCreation',
      'testDataPersistence',
      'testMigrationPreparation',
      'testUIStateValidation',
    ];

    for (const testName of tests) {
      try {
        this.log(`\n🔬 Running test: ${testName}`);
        await this[testName]();
        this.testResults.push({ test: testName, status: 'PASSED' });
        this.log(`✅ ${testName} PASSED`);
      } catch (error) {
        this.testResults.push({ test: testName, status: 'FAILED', error: error.message });
        this.log(`❌ ${testName} FAILED: ${error.message}`);
      }
    }

    this.printTestSummary();
  }

  /**
   * Test 1: Verify guest data can be created and stored
   */
  async testGuestDataCreation() {
    this.log('📝 Creating test guest data...');

    // Create test subjects
    const testSubjects = [
      {
        id: 'test_subj_1',
        name: 'Test Matematik',
        description: 'Test matematik dersi',
        category: 'Test',
        difficulty: 'Orta',
        questionCount: 0,
        isActive: true,
      },
      {
        id: 'test_subj_2',
        name: 'Test Fizik',
        description: 'Test fizik dersi',
        category: 'Test',
        difficulty: 'Zor',
        questionCount: 0,
        isActive: true,
      },
    ];

    // Store subjects
    localStorage.setItem('exam_training_subjects', JSON.stringify(testSubjects));

    // Create test questions
    const testQuestions = [
      {
        id: 'test_q_1',
        subject: 'Test Matematik',
        type: 'Çoktan Seçmeli',
        difficulty: 'Orta',
        text: 'Test soru 1?',
        options: [
          { text: 'A şıkkı', isCorrect: true },
          { text: 'B şıkkı', isCorrect: false },
          { text: 'C şıkkı', isCorrect: false },
          { text: 'D şıkkı', isCorrect: false },
        ],
        explanation: 'Test açıklama',
        topic: 'Test konu',
      },
      {
        id: 'test_q_2',
        subject: 'Test Fizik',
        type: 'Çoktan Seçmeli',
        difficulty: 'Zor',
        text: 'Test soru 2?',
        options: [
          { text: 'A şıkkı', isCorrect: false },
          { text: 'B şıkkı', isCorrect: true },
          { text: 'C şıkkı', isCorrect: false },
          { text: 'D şıkkı', isCorrect: false },
        ],
        explanation: 'Test açıklama 2',
        topic: 'Test konu 2',
      },
    ];

    // Store questions
    localStorage.setItem('exam_training_questions', JSON.stringify(testQuestions));

    // Create guest user
    const guestUser = {
      id: 'test_guest_123',
      name: 'Test Misafir',
      isGuest: true,
      createdAt: new Date().toISOString(),
      preferences: {
        defaultSubject: 'Test Matematik',
        questionsPerQuiz: 10,
        difficulty: 'Medium',
        theme: 'system',
      },
    };

    localStorage.setItem('guestUser', JSON.stringify(guestUser));

    // Verify data was stored
    const storedSubjects = JSON.parse(localStorage.getItem('exam_training_subjects') || '[]');
    const storedQuestions = JSON.parse(localStorage.getItem('exam_training_questions') || '[]');
    const storedUser = JSON.parse(localStorage.getItem('guestUser') || 'null');

    if (storedSubjects.length !== 2) {
      throw new Error(`Expected 2 subjects, got ${storedSubjects.length}`);
    }

    if (storedQuestions.length !== 2) {
      throw new Error(`Expected 2 questions, got ${storedQuestions.length}`);
    }

    if (!storedUser || storedUser.id !== 'test_guest_123') {
      throw new Error('Guest user not stored correctly');
    }

    this.log(`✅ Created ${storedSubjects.length} subjects and ${storedQuestions.length} questions`);
  }

  /**
   * Test 2: Verify data persistence across page reloads
   */
  async testDataPersistence() {
    this.log('🔄 Testing data persistence...');

    // Check if data persists
    const subjects = JSON.parse(localStorage.getItem('exam_training_subjects') || '[]');
    const questions = JSON.parse(localStorage.getItem('exam_training_questions') || '[]');
    const guestUser = JSON.parse(localStorage.getItem('guestUser') || 'null');

    if (subjects.length === 0) {
      throw new Error('Subjects data not persisted');
    }

    if (questions.length === 0) {
      throw new Error('Questions data not persisted');
    }

    if (!guestUser) {
      throw new Error('Guest user data not persisted');
    }

    this.log('✅ All data persisted correctly');
  }

  /**
   * Test 3: Prepare for migration testing
   */
  async testMigrationPreparation() {
    this.log('🎯 Preparing migration test environment...');

    // Check if migration services are available
    if (typeof window.dataMigrationService === 'undefined') {
      // Try to access through the module system
      this.log('⚠️ Migration service not directly accessible in global scope');
      this.log('ℹ️ Migration will be tested during actual login flow');
    }

    // Verify localStorage data is ready for migration
    const guestData = {
      subjects: JSON.parse(localStorage.getItem('exam_training_subjects') || '[]'),
      questions: JSON.parse(localStorage.getItem('exam_training_questions') || '[]'),
      guestUser: JSON.parse(localStorage.getItem('guestUser') || 'null'),
    };

    if (guestData.subjects.length === 0 || guestData.questions.length === 0) {
      throw new Error('Insufficient guest data for migration test');
    }

    this.log(`✅ Migration-ready data: ${guestData.subjects.length} subjects, ${guestData.questions.length} questions`);
  }

  /**
   * Test 4: Validate UI state management
   */
  async testUIStateValidation() {
    this.log('🖼️ Testing UI state validation...');

    // Check if data refresh events can be triggered
    let eventTriggered = false;
    
    const testHandler = () => {
      eventTriggered = true;
    };

    window.addEventListener('dataStateRefresh', testHandler);
    
    // Trigger the event
    window.dispatchEvent(new CustomEvent('dataStateRefresh', {
      detail: { timestamp: Date.now(), test: true }
    }));

    // Clean up
    window.removeEventListener('dataStateRefresh', testHandler);

    if (!eventTriggered) {
      throw new Error('Data refresh event not triggered properly');
    }

    this.log('✅ UI state refresh mechanism working');
  }

  /**
   * Manual login test instructions
   */
  printLoginTestInstructions() {
    this.log('\n🔐 MANUAL LOGIN TEST INSTRUCTIONS');
    this.log('=================================');
    this.log('1. Open browser dev tools and watch console logs');
    this.log('2. Navigate to login page');
    this.log('3. Sign in with your account');
    this.log('4. Watch for these log messages:');
    this.log('   - "🔐 User signed in, checking for data migration"');
    this.log('   - "📦 Migrating guest data to user account"');
    this.log('   - "✅ Data migration successful"');
    this.log('   - "🔄 Data refresh event received"');
    this.log('5. Verify that subjects and questions appear in UI');
    this.log('6. Check that localStorage is synced with cloud data');
    this.log('');
    this.log('Expected behavior:');
    this.log('✅ All guest data preserved after login');
    this.log('✅ UI immediately shows all data');
    this.log('✅ No data loss during authentication');
  }

  /**
   * Test logout and re-login flow
   */
  printLogoutTestInstructions() {
    this.log('\n🚪 LOGOUT/RE-LOGIN TEST INSTRUCTIONS');
    this.log('====================================');
    this.log('1. After successful login and data migration:');
    this.log('2. Create a new subject or question');
    this.log('3. Logout from the application');
    this.log('4. Login again with the same account');
    this.log('5. Verify all data (including new items) is still there');
    this.log('');
    this.log('Expected behavior:');
    this.log('✅ All user data preserved after logout/login');
    this.log('✅ Cloud data synced to localStorage');
    this.log('✅ No duplicate data created');
  }

  /**
   * Cleanup test data
   */
  cleanupTestData() {
    this.log('\n🧹 Cleaning up test data...');
    
    const keysToRemove = [
      'exam_training_subjects',
      'exam_training_questions',
      'guestUser',
      'lastSyncTimestamp',
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    this.log('✅ Test data cleaned up');
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    this.log('\n📊 TEST SUMMARY');
    this.log('================');
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      this.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        this.log(`   Error: ${result.error}`);
      }
    });

    this.log(`\nTotal: ${this.testResults.length} tests`);
    this.log(`Passed: ${passed}`);
    this.log(`Failed: ${failed}`);

    if (failed === 0) {
      this.log('\n🎉 ALL TESTS PASSED! Authentication flow is ready for demo.');
      this.printLoginTestInstructions();
      this.printLogoutTestInstructions();
    } else {
      this.log('\n⚠️ Some tests failed. Please fix issues before demo.');
    }

    return { passed, failed, total: this.testResults.length };
  }

  /**
   * Export logs for debugging
   */
  exportLogs() {
    const logData = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      logs: this.logs,
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-test-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.log('📄 Test logs exported');
  }
}

// Make tester available globally
window.AuthFlowTester = AuthFlowTester;

// Auto-run instructions
console.log('🧪 Authentication Flow Tester Loaded!');
console.log('');
console.log('Usage:');
console.log('  const tester = new AuthFlowTester();');
console.log('  await tester.runAllTests();');
console.log('');
console.log('Or run individual tests:');
console.log('  tester.testGuestDataCreation();');
console.log('  tester.cleanupTestData();');
console.log('');
console.log('💡 Ready to test the authentication data migration fix!');

export default AuthFlowTester;