---
schema_version: 1
feature: Ca «chủ cuối cùng» của api xanh bất kể trong workspace còn chủ lạ từ tệp khác — tiền đề «chu là chủ duy nhất» được lập tường minh trong ca và trả lại sau ca
slug: chu-cuoi-cung-tien-de
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: implemented
design_doc: docs/superpowers/specs/2026-09-23-chu-cuoi-cung-tien-de-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-23T07:40:00Z
---

# Acceptance Contract: chu-cuoi-cung-tien-de

## Context

Ca `apps/api/test/workspace-thanh-vien.spec.ts` › `chu-cuoi-cung` đỏ chập chờn trên CI
(19/09, 22/09, 2/2 lượt trên PR #88). Nguyên nhân: ca ngầm giả định trong workspace
không có chủ nào khác, còn `don()` chỉ dọn hàng của chính tệp. Đã tái hiện chắc chắn
bằng cách cài một chủ lạ trước ca. Vòng này sửa phép đo, không sửa sản phẩm. Commit
gốc là `058bb75f` (onehub sau khi merge #88).

Source input: prompt

## Criteria

- AC-1: Given trong `WORKSPACE_ID` có một member `owner` không thuộc tệp kiểm (chủ lạ), When chạy ca `chu-cuoi-cung`, Then ca được tính là passed (không skipped); và bản tệp kiểm ở `058bb75f` cùng chủ lạ đó thì đỏ với câu kỳ vọng ghim `The workspace needs an owner. Make someone else an owner first.`
- AC-2: Given chủ lạ như AC-1 cùng một member thường lạ (vai `member`), When ca `chu-cuoi-cung` chạy xong — kể cả khi ca đỏ — Then chủ lạ vẫn là `owner` và member lạ vẫn là `member` (ca trả lại đúng vai đã hạ, không đổi vai ai khác, không xoá hàng nào của tệp khác).
- AC-3: Given cơ sở dữ liệu của lượt không có chủ nào ngoài tệp kiểm (phép đo đếm và khẳng định số đó bằng 0 trước khi chạy), When chạy tệp `workspace-thanh-vien.spec.ts`, Then mọi ca xanh và tập ca không đổi so với `058bb75f`.
- AC-4: Given bản sao `apps/api` mà guard chủ cuối trong `WorkspaceService.removeMember` bị làm hỏng (cho gỡ khi chỉ còn một chủ) và workspace có chủ lạ như AC-1, When chạy ca `chu-cuoi-cung` đã sửa, Then ca đỏ với câu kỳ vọng ghim — ca không bị làm yếu đi, kể cả trong tình huống có chủ lạ.
- AC-5: Given diff từ `058bb75f` tới HEAD, When liệt kê tệp đổi ngoài `_acceptance/**` và các tệp T1 của kho (`risk_tiers.t1_skip_globs`), Then chỉ có `apps/api/test/workspace-thanh-vien.spec.ts`; và một danh sách mẫu có `apps/api/src/workspace/workspace.service.ts` bị phép đo gọi tên.
- AC-6: Given cây ở HEAD, When chạy kiểm kiểu, lint, lint:slop, suite test trừ gói `agent` và bản dựng của repo, Then cả năm thoát 0.

## Coverage

Không dùng skill morphological-scan: phạm vi là một ca kiểm và một tiền đề đã tái hiện
(xem entry `descope` trong `decisions.jsonl`).

- Trục có/không chủ lạ: có (AC-1, AC-2, AC-4) | không (AC-3)
- Trục chiều đo: dương — bản sửa xanh (AC-1, AC-3) | âm — bản gốc đỏ, guard hỏng thì đỏ, tệp sản phẩm bị gọi tên (AC-1, AC-4, AC-5)
- Trục hậu quả: tác dụng phụ lên dữ liệu tệp khác, cả khi ca xanh lẫn khi ca đỏ (AC-2) | toàn kho (AC-6)

## Out of scope

- Không tìm và sửa nguồn chủ lạ trên CI: máy dev không tái hiện được và chưa xác định được tệp nào để lại chủ.
- Không cho mỗi gói test một cơ sở dữ liệu riêng: chạm `packages/db` (T3), và không sửa được chủ lạ đến từ chính `apps/api`.
- Không đổi `WorkspaceService` hay luật chủ cuối cùng.
- Không sửa lượt `updateRole` (luật chủ cuối ở `workspace.service.ts:~485`): không có ca kiểm nào khẳng định nó.

## Notes

Không có bề mặt người nhìn; không eval thiết kế, không `ui-check`.
