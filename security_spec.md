# Security Specification for Smart Class Firestore Rules

## 1. Data Invariants
1. **Default Deny:** Any unauthenticated request or request to unspecified paths is strictly rejected.
2. **Administrative Override:** Administrative actions are strictly verified against the authenticated user profile (`profiles/$(request.auth.uid).data.role == 'ADMIN'`) or runtime admin email (`minhuyendb@gmail.com`).
3. **Role Immutability:** Users cannot promote their own roles (e.g. self-assigning `role: 'ADMIN'`) during profile creation or update.
4. **Teacher Boundaries:** Teachers can only create or update classes, attendance, assignments, and grades for classes they teach.
5. **Student Isolation:** Students can only read and write their own submissions. They cannot modify their scores, feedback, or grades of other students.
6. **Parent Protection:** Parents can only access records belonging to their linked children.
7. **Audit Immutability:** Audit log entries are strictly append-only (cannot be modified or deleted by non-admins).
8. **Schema Integrity:** Strings, arrays, and IDs must satisfy length, type, and character constraints.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Payload 1 (Self-Assigned Admin Role):**
   ```json
   { "id": "attacker_uid", "email": "attacker@test.com", "role": "ADMIN", "fullName": "Hacker" }
   ```
   *Expected:* PERMISSION_DENIED.

2. **Payload 2 (Student Spoofing Score):**
   ```json
   { "assignmentId": "asg-01", "studentId": "std-01", "score": 10.0, "status": "Đã chấm" }
   ```
   *Expected:* PERMISSION_DENIED (students cannot set score or grade).

3. **Payload 3 (Student Submitting for Another Student):**
   ```json
   { "assignmentId": "asg-01", "studentId": "std-02", "content": "Tampered submission" }
   ```
   *Expected:* PERMISSION_DENIED when `auth.uid` does not match `std-02`.

4. **Payload 4 (Ghost Field Injection):**
   ```json
   { "id": "cls-01", "name": "9A1", "isSystemSuperAdmin": true }
   ```
   *Expected:* PERMISSION_DENIED.

5. **Payload 5 (Oversized ID Denial of Wallet):**
   ```json
   { "id": "A".repeat(1500), "name": "Overflow Class" }
   ```
   *Expected:* PERMISSION_DENIED.

6. **Payload 6 (Unauthorized Grade Modification):**
   ```json
   { "gradeItemId": "gi-01", "studentId": "std-01", "score": 10.0 }
   ```
   *Expected:* PERMISSION_DENIED for student or unauthenticated users.

7. **Payload 7 (Audit Log Tampering):**
   ```json
   { "id": "log-01", "action": "Xóa dấu vết", "details": "Tampered log" }
   ```
   *Expected:* PERMISSION_DENIED on update.

8. **Payload 8 (Unauthenticated Attendance Session Creation):**
   ```json
   { "classId": "class-9a1", "date": "2026-10-30", "period": 1 }
   ```
   *Expected:* PERMISSION_DENIED without teacher authentication.

9. **Payload 9 (Oversized Content Injection):**
   ```json
   { "content": "X".repeat(200000) }
   ```
   *Expected:* PERMISSION_DENIED.

10. **Payload 10 (Direct Modification of System Alert Resolution):**
    ```json
    { "status": "RESOLVED", "unauthorizedBypass": true }
    ```
    *Expected:* PERMISSION_DENIED.

11. **Payload 11 (Teacher Impersonation by Student):**
    ```json
    { "teacherId": "user-teacher-01", "title": "Fake Homework" }
    ```
    *Expected:* PERMISSION_DENIED when called by student credentials.

12. **Payload 12 (Email Spoofing Without Email Verification):**
    ```json
    { "email": "minhuyendb@gmail.com", "email_verified": false }
    ```
    *Expected:* PERMISSION_DENIED.

## 3. Test Runner Specification
See `firestore.rules.test.ts` for automated test suites verifying all 12 invariants.
