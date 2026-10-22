# Manual Verification Checklist — Task 29 Acceptance

**Project:** Drug Path Visualiser — BioLumen
**Frontend URL:** `http://localhost:5174`
**Backend API URL:** `http://localhost:3000/api/v1`
**Browser Requirements:** Any modern evergreen browser (Chrome, Edge, Firefox, Safari)

---

## 1. End-to-End User Verification Checklist

### Workflow 1: Anonymous Learner Exploration
- [ ] 1. Open `http://localhost:5174/` in your browser.
- [ ] 2. Confirm the **BioLumen** light healthcare aesthetic, top navigation bar, and hero text: *"See the Journey of a Medicine Inside Your Body"*.
- [ ] 3. Click **Explore 3D Pathway** or navigate to `http://localhost:5174/explore`.
- [ ] 4. Select **Ibuprofen**.
- [ ] 5. Confirm the interactive 3D human skeleton displays with anatomical station nodes (Oral Cavity, Stomach, Small Intestine, Liver, Bloodstream, Target Sites, Kidneys).
- [ ] 6. Click on the **Oral Cavity** station. Confirm the station inspection drawer opens showing clinical descriptions, physiological role, defined terms, and key takeaways.

### Workflow 2: Before Food / After Food Regimen Switching
- [ ] 7. In the 3D explorer, locate the **Regimen Toggle** (Before Food vs After Food).
- [ ] 8. Click **Before Food**: Confirm $T_{\max}$ reflects **0.75 hours** (rapid absorption).
- [ ] 9. Click **After Food**: Confirm $T_{\max}$ shifts to **2.50 hours** and the condition description explains delayed gastric emptying.
- [ ] 10. Switch medicine to **Regular Human Insulin**: Confirm $T_{\max}$ remains **0.50 hours** under both Before Food and After Food regimens (food independence).

### Workflow 3: Diagnostic Quiz Taking & Server-Side Grading
- [ ] 11. Click **Quiz** in the navigation header or open `http://localhost:5174/quiz?drug=ibuprofen`.
- [ ] 12. Confirm 5 clinical questions load for Ibuprofen.
- [ ] 13. Select an answer for each question (Q1 through Q5).
- [ ] 14. Click **Submit Assessment**.
- [ ] 15. Confirm the assessment results card displays:
  - Genuine server-evaluated percentage score.
  - Pass/Fail status banner (Passing threshold: 70%).
  - Detailed scientific rationale and clinical explanation for each question.

### Workflow 4: Progress Page & Assessment History
- [ ] 16. Click **View Progress** or navigate to `http://localhost:5174/progress`.
- [ ] 17. Confirm your completed quiz attempt appears immediately in the candidate assessment logs.
- [ ] 18. Confirm the candidate identity chip displays your active user name / account.
- [ ] 19. Confirm no hardcoded dummy logs (`log-ibuprofen-0*`) appear.

### Workflow 5: Candidate Authentication & Persisted Progress
- [ ] 20. Navigate to `http://localhost:5174/login`.
- [ ] 21. Log in with an authenticated user (or register a new candidate account).
- [ ] 22. In the 3D explorer, select and complete nodes.
- [ ] 23. Reload the page and open `http://localhost:5174/progress`.
- [ ] 24. Confirm completed stations and quiz attempts persist across reloads from PostgreSQL.

### Workflow 6: Administrator Content Portal
- [ ] 25. Open `http://localhost:5174/admin/content` (requires administrator login).
- [ ] 26. Confirm catalog metrics appear (4 medicines, 27 nodes, pathway edges).
- [ ] 27. Update a station's key takeaway and save changes.
- [ ] 28. Return to public learner mode (`http://localhost:5174/explore?drug=ibuprofen`) and inspect that station to confirm the updated takeaway appears.
