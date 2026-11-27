# Smart Campus · Comparing code-based and low-code development

Software Engineering, Lesson 12 · Practice work 12 · 27 November 2026 · Semey Madiyar

Both implementations passed the eight common acceptance cases. The JavaScript tests exercise the code-based rule engine and the exported Appsmith button and result bindings. Chrome also exercised the code-based form end to end. Six student screenshots document separate observations in the Appsmith interface.

[Published Appsmith application](https://m-semey.appsmith.com/app/smart-campus-low-code/page1-6b09b04ea367592a116f5083?branch=master&environment=production) · [Offline HTML demo](export/Smart-Campus.html) · [Appsmith Git export](export/Appsmith.bundle)

## 1. Frozen baseline

The final Practice 11 prototype displayed Room A101 with a fixed reference time of 09:00, an unblocked room and one fictional booking from 10:00 to 11:00. Its form accepted start and end minutes. A valid request beginning at 11:00 could touch the end of the booking. Its optional explanation panel followed the deterministic decision. The Practice 12 comparison uses the same clock and booking. The new controls express the end as start plus duration and expose the blocked flag for testing.

The SHA-256 of the original standalone Practice 11 demo was `84ccdc51debedb699d5f3558b46be7941c888dccaa0e0e0789be82d7c87d12f5`. Before creating the new form, the existing Practice 11 suites passed 53 Node tests and 29 Python tests. The two suites exercise separate implementations. [Original screen](evidence/practice11-baseline.png)

## 2. Shared requirements

As a student, I want to enter the time and length of a class so I can tell whether Room A101 is free and understand the decision. Inputs are start and duration in whole minutes, room status and the fixed booking. Outputs are an availability boolean, a reason code and a visible message. For invalid input, availability is false and the message explains the correction.

| Criterion | Acceptance condition |
|---|---|
| AC1 | Start is strictly later than the reference minute 540. |
| AC2 | Duration is a whole number from 1 through 120 minutes. |
| AC3 | Overlap makes the room unavailable. Intervals touching only at an endpoint are allowed. |
| AC4 | A blocked room is unavailable even for an otherwise free interval. |
| AC5 | Show a clear decision and preserve the existing bookings. |
| AC6 | Show actionable feedback for invalid input. The inherited one-day model permits starts 0–1439 and ends through 1440. |

## 3–4. Implementations

**Code-based.** The Practice 11 overlap rule and fixed data were adapted for a standalone JavaScript implementation. The rule engine exposes validation, the decision function and the read-only fixture. The form handler displays the returned message using textContent. On narrow screens, the two inputs stack. The exported HTML opens directly in a browser. [Source](../code-based/) · [Rules screenshot](evidence/code-rules.png) · [Desktop](evidence/code-desktop.png) · [390-pixel mobile screen](evidence/code-mobile.png)

**Low-code.** Appsmith supplies the two numeric inputs, switch, button and result card. The button runs a JavaScript binding and stores only the last decision in nonpersistent application state. Editing an input invalidates the displayed decision. The fixed booking is encoded in the button and displayed in a text widget. A future change to the booking must update both places. The six screenshots show actual widget output. The Node test uses a small stand-in for the Appsmith runtime. [Widget configuration](../pages/Page1/widgets/RoomCheckerContainer/)

## 5. Test results

Start is minutes after midnight. All inputs below use Room A101 and the booking 10:00–11:00.

| Case | Start / duration / blocked | Expected | Code-based Chrome | Appsmith JS binding | Appsmith UI evidence |
|---|---|---|---|---|---|
| T1 free, inclusive maximum | 720 / 120 / off | Available | Available, 12:00–14:00 | AVAILABLE | [Observed](evidence/appsmith-duration-120.png) |
| T2 overlap | 630 / 30 / off | Unavailable, overlap | Overlap | OVERLAP | No screenshot supplied |
| T3 blocked | 660 / 30 / on | Unavailable, blocked | Room blocked | BLOCKED | [Observed](evidence/appsmith-blocked.png) |
| T4 zero duration | 720 / 0 / off | Duration error | 1–120 required | DURATION | No screenshot supplied |
| T5 above maximum | 660 / 121 / off | Duration error | 1–120 required | DURATION | [Observed](evidence/appsmith-duration-121.png) |
| T6 past | 510 / 30 / off | Start after 09:00 required | Past start rejected | PAST_TIME | No screenshot supplied |
| T7 adjacent | 660 / 30 / off | Available | Available, 11:00–11:30 | AVAILABLE | [Observed](evidence/appsmith-adjacent.png) |
| T8 read-only | Compare booking before and after T1–T7 | 10:00–11:00 throughout | Same before and after | Booking widget unchanged, only decision key stored | Same booking visible across supplied frames |

### Appsmith screenshot observations

| Start | Duration | Blocked | Message on screen |
|---:|---:|---|---|
| 660 | 30 | Off | Available — Room A101 is free from 11:00 to 11:30. |
| 660 | 30 | On | Unavailable — Room A101 is blocked. |
| 660 | 121 | Off | Enter a duration of 1 to 120 whole minutes. |
| 720 | 120 | Off | Available — Room A101 is free from 12:00 to 14:00. |
| −720 | 30 | Off | [Enter a whole start minute from 0 to 1439.](evidence/appsmith-negative-start.png) |
| 1439 | 30 | Off | [The interval must end by midnight.](evidence/appsmith-midnight.png) |

Reproduce the common test with Node.js 22 from the repository root: `node --test tests/checker.test.cjs`. The ninth test groups extra boundaries, missing fields and stale results. [JavaScript test](../tests/checker.test.cjs) · [TAP output](evidence/javascript-tests.txt) · [Chrome output](evidence/code-browser.txt)

## 6. Engineering comparison

| Criterion | Code-based | Appsmith |
|---|---|---|
| Functional coverage | 8/8 common cases in JS and Chrome | 8/8 common cases in the JS binding harness. Four required scenarios and two additional boundaries have UI screenshots. |
| Setup and implementation | Reused the existing fixture and rules. Evidence setup finished at 22:17:09; form and rules were in place at 22:17:46 (about 0.6 min elapsed between checkpoints). | Git initialization to first interface commit took 4 min 17 s. First interface commit to working decisions took 8 min 43 s, including draft synchronization. |
| Debugging and testing | Common Node suite ran in 0.09 s. Browser verification also exercised the mobile view. Active repair time was not separately recorded. | Git synchronization required reconciling a draft. Result-card test feedback exposed an encoding error in a test fixture, corrected before publication. Six UI captures span 1 min 21 s. Active debugging and testing totals were not separately recorded. |
| Customization and integrations | Form layout, messages and rules are editable as HTML/CSS/JS. The frozen bookings array drives both the decision and the summary. | Widget properties expose layout and controls. Button and result expressions contain application-specific logic. No external connector is needed for this fixture. |
| Review, versioning and portability | Source and tests support line-by-line Git review. The standalone HTML export runs offline. | Widget JSON and bindings support Git review. Restoring the editor experience requires Appsmith. The Git bundle preserves the tested application revision. |
| Security and hosting | Local execution, text-only output and no network dependency in the exported app. Access to a hosted copy would depend on its host. | Appsmith manages the hosted login. A fresh signed-out browser reached the sign-in screen. Workspace roles and account billing were not independently inspected. |
| Ongoing cost | Local execution requires no hosting subscription. Public hosting was not measured. | No paid feature was identified in the submitted workflow. Actual plan, limits and future hosting cost are unverified. |

The timing entries are elapsed checkpoints and measured test execution, not a controlled comparison of human effort. No unresolved functional failure was observed in the common cases. One submission-access limitation remains: the published Appsmith URL requires sign-in in a fresh browser.

**Recommendation.** Choose the code-based version for this one-room checker. Both implementations met the tested contract, but a reviewer can run the exported HTML offline, and the code-based version keeps the displayed and evaluated booking in one place. Appsmith is a reasonable choice when the team already works in its editor and needs to adjust the screen visually.

## 7. Security review and AI use

| Review item | Evidence and finding |
|---|---|
| Validation and output | Both implementations check integer minutes and bounds. The code-based UI renders textContent. Appsmith displays messages built from fixed text and validated numbers. |
| Injection, connectors and data | The exercise uses fictional room data. The submitted source contains no database query or datasource configuration. Decisions do not write bookings. |
| Permissions and sharing | The repository is public. A signed-out request to the Appsmith demo reached the workspace login. Editor and connector grants require owner-side review. |
| Secrets | The app inputs, button binding and HTML export do not require a token or password. The shared test screenshots show fictional data. |
| Dependencies and updates | The standalone implementation uses browser APIs. Browser updates remain the device owner's responsibility. Appsmith runtime updates are platform-managed; the project owner should rerun the shared suite and check the deployed UI after updates. |
| Safe runtime checks | Chrome exercised valid and invalid input, blocking, overlap, mobile layout and unchanged bookings. Appsmith runtime evidence consists of the supplied six screenshots. No third-party scanning was performed. |

**AI-use reflection.** OpenAI Codex desktop 26.1120.6357.0 (GPT-6) helped implement the two interfaces, write the shared JavaScript tests, and draft this report. The evidence comes from actual test runs and the student's Appsmith screenshots. The distinction mattered for negative start: the screenshot shows an out-of-range error, while the separate 08:30 case exercises the past-time rule.

## Submission files

Open the [offline HTML demo](export/Smart-Campus.html) in a browser. To restore the Appsmith Git export use `git clone -b master submission/export/Appsmith.bundle appsmith-checker` from the repository root. The bundle is a verified Git export at revision 4e58fd6. The hosted link and repository are included above and in the submission email draft.
