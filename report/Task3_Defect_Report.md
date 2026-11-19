# Task 3 - Test Execution Summary and Defect Report

**Group members:** Ahmad Kazmi (24P-3011), Ahmad (24P-3040), Abdullah (24P-3067)
**Application under test:** Campus Library (Flask) at http://127.0.0.1:5000 | **Browser:** Chrome 157 | **OS:** Windows 11 Pro

---

## 1. Test Execution Summary

Source: `data/test_cases_completed.csv` (executed with Selenium WebDriver; evidence in `selenium/logs/` and `selenium/screenshots/`).

| ID | Feature | Input | Expected | Status |
|----|---------|-------|----------|--------|
| TC01 | Login | valid credentials | Login successful | PASS |
| TC02 | Login | wrong username | Invalid username or password | PASS |
| TC03 | Login | wrong password | Invalid username or password | PASS |
| TC04 | Login | empty credentials | Required field validation | PASS |
| TC05 | Logout | logout after login | Protected route inaccessible | PASS |
| TC06 | Search | Software Testing | Matching results | PASS |
| TC07 | Search | nonsense-title-xyz | No matching books | PASS |
| TC08 | Reservation | available book, valid phone | Reservation successful | PASS |
| TC09 | Reservation | unavailable book | Reservation rejected | PASS |
| TC10 | Reservation | invalid phone | Validation error | PASS |
| TC11 | Reservation | same book twice | Duplicate rejected | PASS |
| TC12 | Search | `' OR 1=1 --` | Treated as literal string, 0 results | PASS |

| Metric | Count |
|--------|-------|
| Test cases executed | 12 |
| Passed | 12 |
| Failed | 0 |
| Blocked / not run | 0 |
| Pass rate | 100 % |

Related totals: Selenium automated checks 24/24 PASS (A1 7/7, A2 9/9, A3 8/8); JMeter experiments B1, E1-E4, C1-C3 with 0 % errors; B4 assertions 2/2 PASS.
Negative scenarios (TC02, TC03, TC07, TC09, TC10, TC11, TC12) are marked PASS because the application rejected the input as required.

---

## 2. Defect Report Template

The template used for every issue found during testing:

| Field | Description |
|-------|-------------|
| Defect ID | Unique identifier (DEF-nnn, or ENV-nnn for environment issues) |
| Title | One-line summary |
| Module / Feature | Part of the application affected |
| Test case | Related test case ID |
| Environment | OS, browser, tool versions, application URL |
| Steps to reproduce | Numbered, minimal steps |
| Expected result | What the requirement says should happen |
| Actual result | What actually happened |
| Severity | Critical / High / Medium / Low (impact on the system) |
| Priority | High / Medium / Low (urgency of the fix) |
| Status | New / Open / Fixed / Retested / Closed / Rejected / Environment issue |
| Type | Application defect / Test-environment issue / Test-script issue |
| Evidence | Logs, screenshots, files |

---

## 3. Defects Found

No defects observed in the application under test. One test-environment issue was observed (Chrome password-leak popup intermittently blocking automation); documented below for completeness.

### ENV-001 - Chrome "password found in a data breach" popup blocks automated clicks

| Field | Value |
|-------|-------|
| Defect ID | ENV-001 |
| Title | Chrome password-leak popup intermittently interrupts Selenium login tests |
| Module / Feature | Test environment (Chrome browser), affects Login automation |
| Test case | A1-07 (logout / protected access), A2-05b (invalid phone), A3 TC06 (student2 login) |
| Environment | Windows 11 Pro; Chrome 157.0.8103.79; selenium-webdriver 4.51.0; app at http://127.0.0.1:5000 |
| Steps to reproduce | 1. Start the app and run `node login_tests.js` in `selenium/` with the default Chrome profile settings. 2. The test logs in with the demo password `Library@123`. 3. Chrome shows a "The password you just used was found in a data breach" popup. 4. Later clicks or waits in the same run fail. |
| Expected result | Login flow completes and all 24 checks pass without browser interference. |
| Actual result | Intermittently the popup swallowed the next click, so tests failed with `Waiting for element to be located By(css selector, *[id="flash"])` (6/7, 7/8 and 8/9 PASS in repeat runs). The application itself behaved correctly (verified with direct HTTP requests). |
| Severity | Low (no impact on the application; test reliability only) |
| Priority | Medium (had to be fixed to get reliable evidence) |
| Status | Environment Issue - Closed. Not an application defect. |
| Type | Test-environment issue |
| Resolution | `selenium/common.js` starts Chrome with the password manager and leak detection disabled (`credentials_enable_service=false`, `profile.password_manager_leak_detection=false`, `--disable-features=PasswordLeakDetection`). After this change, all suites passed (7/7, 8/8, 9/9). |
| Evidence | `selenium/logs/*_results.csv`, `report/QA_Test_Report.pdf` section 5 |

### Observations (not defects)

- A username with a trailing space (`"student1 "`) logs in successfully because the server trims whitespace. The requirements do not forbid this; recorded as an observation (see Task 1, BB-25).
- JMeter marks HTTP 404 as a failed sample by default. The B4 plan therefore uses "Ignore Status" on the 404 assertion; this is tool behaviour, not an application issue.
