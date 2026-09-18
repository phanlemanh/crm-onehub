
# Review Findings: loi-moi-da-huy-van-cho-vao (round 5)

## Trong hợp đồng

- **E10 đo BẢN KHAI hằng số, không đo ĐẦU RA của chỗ ghi mà AC-7 hứa (hình dạng 1)**
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml:80`
  severity: high
  AC: AC-7
  source: measurement
  detail: AC-7 nói về «mã ghi trạng thái kết thúc vào cơ sở dữ liệu ... neo vào một hằng CÓ TÊN, không neo vào VỊ TRÍ trong danh sách» — tức về apps/api/src/workspace/workspace.service.ts:342 và :409. E10 là eval DUY NHẤT gắn AC-7, nhưng cmd của nó (_acceptance/config.yaml:92) chỉ chạy `cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t hang-co-ten`. Bài `hang-co-ten` (packages/auth/test/loi-moi-ket-thuc.spec.ts:124-145) không import, không chạy, không quan sát workspace.service.ts một dòng nào — nó chỉ khẳng định bốn hằng mang bốn chuỗi literal. Vì vậy chiều đỏ thứ hai mà chính E10 khai — «trả chỗ ghi ở workspace.service.ts về chỉ số mảng RỒI đảo thứ tự mảng thì khối cho-phep-lai của apps/api đỏ» — do apps/api/test/workspace-thanh-vien.spec.ts:212-220 sinh ra, mà file đó KHÔNG nằm trong cmd của E10. Đột biến đó chạy E10 vẫn xanh. Thêm nữa, assert thứ hai trong vòng lặp (dòng 140-143) `TRANG_THAI_LOI_MOI.includes(hang)` là vòng vo: TRANG_THAI_LOI_MOI và bốn hằng được khai trong cùng packages/validation/src/invitation-status.ts:3-18 bằng đúng các chuỗi đó, nên nó không thể đỏ — trong khi E10 mô tả nó là «cả bốn đều nằm trong từ vựng của GÓI» (từ vựng gói chỉ được E5 đối chiếu, ở một eval khác).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **API contract re-declares the status vocabulary instead of deriving it from @crm/validation — the exact drift class this change exists to fix**
    Người dùng thấy gì: If someone later adds or renames a membership status, the settings screen could quietly start failing to load invitations instead of showing the correct status.
    file: `apps/api/src/workspace/workspace.contracts.ts`
    severity: high
    Đề xuất: known-limits

- **Legacy "cancelled" rows are never migrated, and a known legacy value is reported identically to garbage**
    Người dùng thấy gì: People who were removed before this update may keep triggering warning messages in the system logs every time an admin opens the team members page, or every time they try to sign back in.
    file: `packages/validation/src/invitation-status.ts`
    severity: high
    Đề xuất: known-limits

- **Vocabulary is only half-converted: every write and query site except the cancel path still uses bare string literals**
    Người dùng thấy gì: Some parts of the invite system still write status text by hand instead of using the shared definition, so a future change to statuses could behave inconsistently in different places.
    file: `apps/api/src/workspace/workspace.service.ts`
    severity: medium
    Đề xuất: known-limits

- **packages/auth blanket-re-exports the status vocabulary, creating a second import path through a server-only barrel with no consumer**
    Người dùng thấy gì: A second, currently unused way to reference invitation statuses exists in the code; if someone starts importing it from the wrong place later, it could break the app instead of showing the invite screen.
    file: `packages/auth/src/invitation-status.ts`
    severity: medium
    Đề xuất: known-limits

- **New acceptance test executors deviate from the file's own convention: pure unit specs are wrapped in the per-run-database harness**
    Người dùng thấy gì: Some automated checks run a little slower than necessary because they set up a full test database they don't actually need, adding minor extra time to each verification run.
    file: `_acceptance/config.yaml`
    severity: low
    Đề xuất: wont-fix

- **Gate-2 decision card is two rounds stale: tells the signer "9/9 đạt · bằng chứng đủ, không lỗi" while the evidence report says REJECT**
    Người dùng thấy gì: The approval summary currently claims everything passed with no issues, but the underlying evidence report says the opposite — approving from that summary risks signing off on a feature that actually failed its checks.
    file: `_acceptance/loi-moi-da-huy-van-cho-vao/card.html`
    severity: high
    Đề xuất: new-contract

- **evidence-page.html shows a PASS badge and only 9 evals with round-2 run_ids, contradicting the REJECT report**
    Người dùng thấy gì: The evidence page linked from the approval summary shows an all-clear result and is missing one of the required checks, so a reviewer would not see that a check actually failed or that a requirement wasn't covered.
    file: `_acceptance/loi-moi-da-huy-van-cho-vao/evidence-page.html`
    severity: high
    Đề xuất: new-contract

- **No migration for legacy "cancelled" rows although the writer switched to "canceled" — they now read as "unknown" and log an error on every read**
    Người dùng thấy gì: People who were removed before this update may keep showing up as generating errors in the system logs every time an admin opens the members page or that person tries to sign in again.
    file: `apps/api/src/workspace/workspace.service.ts`
    severity: medium
    Đề xuất: known-limits

- **cong-vao.integration.spec.ts still seeds the retired "cancelled", so the revoke integration eval no longer exercises the value the product writes**
    Người dùng thấy gì: A test meant to guarantee that revoking someone's invite after they've already joined doesn't remove them is checking that against outdated data, so it might not catch a future bug in that protection.
    file: `packages/auth/test/cong-vao.integration.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **allowEmail and removeMember still hardcode ["pending","accepted"] instead of CON_HIEU_LUC, giving the "still valid" set two sources of truth**
    Người dùng thấy gì: Two different places in the code independently decide which invite statuses still count as active; if that list changes in one place but not the other, people could end up double-invited or not properly removed when they should be.
    file: `apps/api/src/workspace/workspace.service.ts`
    severity: low
    Đề xuất: known-limits

- **E4: cữ liệu «dữ liệu cũ» là hằng viết tay trong chính module bên đọc, giá trị không bao giờ được ghim (hình dạng 2)**
    Người dùng thấy gì: The automated check meant to confirm old, legacy invite data is still safely rejected uses made-up test data rather than a value the system actually used to write, so it might not catch a real gap in handling old records.
    file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Cữ liệu «rút lời cho phép» ở cong-vao.integration.spec.ts hết round-trip với bên ghi sau lượt đổi ở workspace.service.ts (hình dạng 2)**
    Người dùng thấy gì: A test meant to guarantee that revoking someone's invite after they've already joined doesn't remove them is checking against a status value the system no longer actually writes, so it may not catch a future bug in that protection.
    file: `packages/auth/test/cong-vao.integration.spec.ts`
    severity: medium
    Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/13 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/workspace/workspace.contracts.ts, _acceptance/config.yaml, _acceptance/loi-moi-da-huy-van-cho-vao/card.html, _acceptance/loi-moi-da-huy-van-cho-vao/evidence-page.html, packages/auth/test/cong-vao.integration.spec.ts, _acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
