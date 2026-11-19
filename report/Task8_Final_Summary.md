# Task 8 - Final Summary

**Group members:** Ahmad Kazmi (24P-3011), Ahmad (24P-3040), Abdullah (24P-3067)
**Application:** Campus Library (Flask), http://127.0.0.1:5000 | **Environment:** Windows 11 Pro, Chrome 157, Node 24.18, Java 1.8, JMeter 5.6.3

## Techniques applied
| Area | Technique | Where |
|------|-----------|-------|
| Black-box | Equivalence Partitioning, Boundary Value Analysis (phone number) | `report/Task1_BlackBox_Testing.pdf` (BB-01 to BB-10) |
| Black-box | Decision Table (reservation logic), State Transition (session states), Scenario-Based, Error Guessing | Task 1 (BB-11 to BB-27) |
| White-box | Control flow graph, cyclomatic complexity V(G) = 6 (three methods), 6 basis paths with test cases for `reserve()` | `report/Task2_WhiteBox_Testing.pdf` |
| UI automation | Selenium WebDriver (JavaScript), data-driven tests | `selenium/` |
| API testing | Postman collection run with Newman | `postman/` |
| Performance | JMeter load, workload, threads-versus-loops and assertion tests | `jmeter/` |

## Results
| Item | Outcome |
|------|---------|
| Test cases (TC01-TC12) | **12/12 PASS** |
| Selenium automated checks | **24/24 PASS** (A1 login 7/7, A2 reservations 9/9, A3 data-driven 8/8) |
| Postman / Newman | **6/6 requests PASS, 17/17 assertions PASS** (4 GET, 2 POST; the app has no PUT/PATCH/DELETE routes) |
| JMeter | B1, E1-E4, C1-C3: all samples returned HTTP 200, **0 % errors**; B4 assertions 2/2 PASS (200 for book 1, 404 for book 99999) |
| Black-box cases | 27 cases derived; expected results confirmed on the running app |
| White-box paths | 6/6 basis paths executed with the expected result |

## Defects
- **Application defects: none observed.**
- **One test-environment issue (ENV-001):** Chrome's "password found in a data breach" popup intermittently blocked Selenium clicks. It was fixed by disabling the password manager and leak detection in the test driver. Details in `report/Task3_Defect_Report.md`.
- One observation, not a defect: the server trims spaces in the username, so `"student1 "` logs in successfully.

## JMeter key finding
The server was **not saturated at 20 concurrent users**: average response time stayed flat at about 4-6 ms (P95 6 ms) from 1 to 20 threads with no errors. Throughput (about 10-12 requests/s in E2-E4) was set by the ramp-up rate, not by server capacity. Equal request counts in C1-C3 behave differently because threads add concurrency and ramp-up, while loops and samplers add sequential work. JMeter and Flask shared one machine, so the numbers are only indicative.

## Overall assessment
The Campus Library application met every tested requirement: authentication, search, reservation rules (11-digit phone, duplicate and unavailable rejection), logout and protected-route behaviour, and its REST API behaved correctly under the tested loads. Testing was broad (black-box, white-box, UI, API and performance) and all evidence is reproducible from the scripts in this repository. The main limitation is the small, single-machine, development-server setup, so the results do not predict behaviour under production-scale load.
