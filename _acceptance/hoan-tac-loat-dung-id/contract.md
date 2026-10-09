---
schema_version: 1
feature: «Hoàn tác hàng loạt đúng bản đã cất» — lưu trữ và khôi phục hàng loạt trả danh sách id thật sự đã đổi trạng thái; Hoàn tác chỉ khôi phục những bản đó, báo thật số bản không về được, toast không in câu lỗi máy chủ thô
slug: hoan-tac-loat-dung-id
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-10-10-hoan-tac-loat-dung-id-design.md
approved_by:
approved_at:
---

# Acceptance Contract: hoan-tac-loat-dung-id

## Context

Hàng V2d của đợt `sau-14-10`, dãy P2, ưu tiên 3.05, sau V2 `vong-doi-mot-cach-cat` (#346) và E4. Từ Ngoài-1, 2, 3 của V2 (cùng
gốc); anh chọn «mở hợp đồng mới» ở Cổng 2 lúc 2026-10-09T16:34:54Z (luật 26). Hôm nay `runBulk` chỉ trả số đếm, nên «Hoàn tác»
của V2 gửi lại cả danh sách đã chọn: khôi phục luôn bản người khác đã cất, báo xanh khi có bản không về được, và toast lưu trữ một
phần in câu lỗi tiếng Anh thô của máy chủ.

## Criteria

- AC-1: Given một danh sách id gồm bản đang dùng, bản đã lưu trữ từ trước và id không tồn tại, của cá nhân, công ty hay thoả thuận, When gọi lưu trữ hàng loạt qua thủ tục tRPC thật trên máy chủ thật, Then kết quả trình duyệt nhận được mang danh sách `changedIds` đúng bằng các bản đang dùng vừa được cất; `succeeded` bằng số phần tử của danh sách đó, bản đã lưu trữ từ trước tính vào `skipped` và giữ nguyên ngày lưu trữ cũ, id không tồn tại tính vào `failed`; khôi phục hàng loạt trả `changedIds` theo cùng luật (chỉ bản đang lưu trữ vừa được khôi phục). (cross-layer)
- AC-2: Given toast «Hoàn tác» sau lưu trữ hàng loạt ở ba bảng, When bấm «Hoàn tác», Then lời gọi khôi phục hàng loạt mang đúng `changedIds` của lần lưu trữ đó — không mang bản đã lưu trữ từ trước, không mang id hỏng — đúng một lần; trên máy chủ thật, một bản người khác đã cất trước khi mình lưu trữ hàng loạt vẫn ở trạng thái đã lưu trữ sau khi mình bấm «Hoàn tác». (cross-layer)
- AC-3: Given «Hoàn tác» chạy xong, When kết quả khôi phục có bản không khôi phục được, Then toast không phải toast thành công thuần: nó nói số bản đã khôi phục và số bản không khôi phục được, chỉ tới mục «Đã lưu trữ», và không chứa thông điệp lỗi của máy chủ; khi mọi bản khôi phục được thì toast «Đã khôi phục n …» như V2; khi lời gọi thất bại hẳn thì giữ câu «Chưa hoàn tác được…» của V2.
- AC-4: Given lưu trữ hàng loạt có bản bị bỏ qua (đã lưu trữ từ trước hay không còn), When toast hiện, Then toast nói số bản đã lưu trữ và số bản bị bỏ qua bằng chữ của sản phẩm, không chứa thông điệp lỗi của máy chủ; khi không bản nào thật sự được cất thì toast không có nút «Hoàn tác» và cũng không chứa thông điệp lỗi của máy chủ.
- AC-5: Given giao diện tiếng Anh, When một trong các toast ở AC-3, AC-4 hiện, Then chữ là bản tiếng Anh từ tệp chữ (cặp en/vi do messages-guard giữ), không ký tự tiếng Việt có dấu.
- AC-6: Given bản chạy thật của cây này, ba cá nhân trong một danh sách đang mở, trong đó một bản bị người khác lưu trữ trước khi mình bấm, When chọn cả ba, lưu trữ hàng loạt, rồi bấm «Hoàn tác» ở khổ 1440, Then toast lưu trữ nói 2 bản đã lưu trữ và 1 bản bị bỏ qua, không có chữ tiếng Anh thô; sau «Hoàn tác» bảng hiện đúng hai bản đó, không hiện bản thứ ba, bản người khác đã cất vẫn ở mục «Đã lưu trữ» (đối chiếu cơ sở dữ liệu).

## Coverage

- Quét bằng `morphological-scan` (`_acceptance/hoan-tac-loat-dung-id/coverage-scan.md`), preset `test-matrix`.
- Trục A — loại bản ghi: cá nhân | công ty | thoả thuận [thước CE: ba service có `bulkArchive`/`bulkRestore` — SUY-TỪ-REPO: `apps/api/src/{contacts,companies,deals}/*.service.ts`] — AC-1, AC-2 đo đủ ba loại.
- Trục B — trạng thái từng id trong lô: đang dùng | đã lưu trữ từ trước | không tồn tại [thước CE: nhánh của `archive`/`restore` và `runBulk` — SUY-TỪ-REPO: `apps/api/src/crm/bulk.ts`] — AC-1, AC-2, AC-4.
- Trục C — kết cục Hoàn tác: về đủ | về thiếu | lỗi hẳn [thước CE: kết quả `bulkRestore` và `onError` — SUY-TỪ-REPO; NGÀNH: NN/g heuristic #9 «Help users recognize, diagnose, and recover from errors» (thông báo lỗi bằng ngôn ngữ người dùng, nói đúng vấn đề)] — AC-3.
- Trục D — ngôn ngữ × khổ: vi | en | 1440 — en ở AC-5, 1440 ở AC-6.

## Đường đo

- Thước: số bản đã lưu trữ từ trước bị «Hoàn tác» khôi phục (mong 0) · số từ: bài máy chủ thật `apps/api/test/hoan-tac-loat-dung-id.spec.ts` và răng màn E (AC-6) · bảo đảm bởi: AC-1, AC-2, AC-6
- Thước: số toast lưu trữ/hoàn tác chứa thông điệp lỗi máy chủ (mong 0) · số từ: bài DOM `apps/app/test/hoan-tac-loat-dung-id.dom.tsx` và răng màn · bảo đảm bởi: AC-3, AC-4, AC-6
- Thước: số lần «Hoàn tác» báo thành công thuần khi có bản không về được (mong 0) · số từ: bài DOM · bảo đảm bởi: AC-3

## Out of scope

- Kanban thoả thuận — không có chọn nhiều hay thao tác hàng loạt (`deals-board.tsx`), nên không có «Hoàn tác» hàng loạt.
- Lưu trữ từng bản từ menu ngăn — một id, đã có «Hoàn tác» đúng bản (K6b); không đổi.
- Xoá vĩnh viễn hàng loạt, đổi người phụ trách hàng loạt, đổi giai đoạn hàng loạt — cùng `runBulk` nhưng không có «Hoàn tác»; chỉ đổi chỗ in thông điệp thô nếu dùng chung hàm báo (không hứa).
- Danh sách liên quan lọc bản đã cất — V2a.
- Dải báo và vùng khoá thành mảnh dùng chung — `dai-luu-tru-dung-chung`.

## Notes

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi (Lưu trữ → Khôi phục → Xoá vĩnh viễn); (2) «Lịch sử» — không đổi; (3) Danh sách mặc định — không đổi.
- **Thay một lời hứa đã ký (cần anh duyệt ở Cổng 1):** AC-1 của V2 `vong-doi-mot-cach-cat` hứa «Hoàn tác gọi khôi phục hàng loạt … với đúng danh sách id vừa gửi đi lưu trữ». V2d đổi thành «đúng danh sách id thật sự đã cất» (AC-2 ở đây). Bài kiểm đã ký `apps/app/test/vong-doi-mot-cach-cat.dom.tsx` (E1 của V2) sẽ được sửa fixture cho đúng hình kết quả mới (có `changedIds`) và assert ids theo luật mới; V2 được ghim lại sau khi gộp. Đơn `cham-tep` P2-60.
- Ranh giới: ba `*.contracts.ts`, `messages/crm.ts` và các tệp kiểm nằm ngoài mục ranh giới của hàng — đơn `cham-tep` P2-60.
