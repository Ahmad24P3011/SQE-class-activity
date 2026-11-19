# Campus Library System - QA Project

**Student:** Ahmad Kazmi | **Roll No.:** 24P-3011 | **Course:** Software Quality Engineering

## Description
This repository holds the test work for the supplied Campus Library Book Reservation System, a Flask web app with login/logout, book search, availability and reservations (11-digit phone required; unavailable and duplicate reservations are rejected). The project contains black-box and white-box test designs, Selenium WebDriver UI automation (JavaScript, Chrome), a Postman/Newman API collection, JMeter performance tests, test-case/defect documentation and a final summary. The application source itself is provided by the instructor and is **not** included here.

## Prerequisites
| Tool | Version used |
|------|--------------|
| Python (for the supplied Flask app) | 3.14 |
| Node.js + npm | 24.x |
| Google Chrome | 157 (ChromeDriver is fetched automatically by Selenium Manager) |
| Java | 1.8 (JRE/JDK 8 or newer) |
| Apache JMeter | 5.6.3 |
| Postman (GUI) or Newman (CLI, `npm i -g newman`) | Newman 6.x |

## Setup
**1. Start the Flask app** (from the supplied `Library_QA_Activity/app` folder, Windows):
```
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py --reset      # restores the initial data (stop the app first with Ctrl+C)
python app.py              # serves http://127.0.0.1:5000
```
Reset the app (`python app.py --reset`) before every reservation test run, and never while tests are running.

**2. Selenium dependencies**
```
cd selenium
npm install
```
**3. JMeter** - open any plan from `jmeter/` via *File > Open* in the JMeter GUI (`jmeter` command or `bin\jmeter.bat`).
**4. Postman** - *Import* `postman/CampusLibrary_API.postman_collection.json` and `postman/CampusLibrary_API.postman_environment.json`, then select the "Campus Library - Local" environment.

## How to run
| Suite | Command (run from the folder shown) |
|-------|-------------------------------------|
| Selenium A1 login | `cd selenium` then `node login_tests.js` |
| Selenium A3 data-driven | `node login_data_test.js` (reads `login_cases.json`) |
| Selenium A2 reservations (reset the app first) | `node reservation_tests.js` |
| JMeter, one experiment (headless) | `cd jmeter` then `jmeter -n -t Workload_E3.jmx -l results/E3.jtl` (delete the old `.jtl` first) |
| Newman (Postman) | `newman run postman/CampusLibrary_API.postman_collection.json -e postman/CampusLibrary_API.postman_environment.json` |

JMeter plans and result files: B1 `GET_Books_Load_Test.jmx` -> `B1_basic_load.jtl`; E1-E4 `Workload_E1-E4.jmx` -> `E1-E4.jtl`; C1-C3 `Threads_vs_Loops_C1-C3.jmx` -> `C1-C3.jtl`; B4 `Response_Code_Assertions.jmx` -> `B4_assertions.jtl`.

## Folder structure
```
24P-3011_CampusLibrary_QA/
|-- README.md
|-- .gitignore
|-- git_history.txt              (git log output)
|-- selenium/
|   |-- common.js  login_tests.js  login_data_test.js  reservation_tests.js
|   |-- login_cases.json  package.json  package-lock.json
|   |-- logs/                    (PASS/FAIL results, CSV + TXT)
|   `-- screenshots/             (10 PNG, including negative scenarios)
|-- jmeter/
|   |-- *.jmx                    (9 test plans)
|   `-- results/*.jtl            (9 raw result files)
|-- postman/
|   |-- CampusLibrary_API.postman_collection.json
|   |-- CampusLibrary_API.postman_environment.json
|   `-- newman_run.txt
|-- data/
|   |-- test_cases_completed.csv          (TC01-TC12)
|   `-- performance_results_completed.csv
`-- report/
    |-- QA_Test_Report.pdf               (Selenium + JMeter report)
    |-- Task1_BlackBox_Testing.pdf
    |-- Task2_WhiteBox_Testing.pdf
    |-- Task3_Defect_Report.md
    `-- Task8_Final_Summary.md
```

## Test results summary
| Area | Result |
|------|--------|
| Selenium | **24/24 PASS** (A1 7/7, A2 9/9, A3 8/8) |
| Test cases | **12/12 PASS** (TC01-TC12) |
| Postman / Newman | 6/6 requests, 17/17 assertions PASS |
| JMeter | 8 performance experiments (B1, E1-E4, C1-C3), **0 errors**; B4 status-code assertions 2/2 PASS |
| Defects | No application defects; 1 test-environment issue (Chrome password-leak popup), see `report/Task3_Defect_Report.md` |
