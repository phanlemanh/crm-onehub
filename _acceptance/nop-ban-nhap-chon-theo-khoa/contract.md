---
schema_version: 1
feature: Ca «Mục tiêu đã nhận» của nop-ban-nhap chọn dòng theo khoá bản nháp, không theo createdAt — hết đỏ ngẫu nhiên trên CI
slug: nop-ban-nhap-chon-theo-khoa
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-04T02:31:06Z
design_doc: docs/superpowers/specs/2026-10-04-nop-ban-nhap-chon-theo-khoa-design.md
---

# Acceptance Contract: nop-ban-nhap-chon-theo-khoa

## Context

`apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`, ca «Mục tiêu đã nhận: đổi tên qua chat
không tạo dòng thứ hai cùng khoá…», chọn Mục tiêu sẽ đánh dấu «nhan» bằng `orderBy: { createdAt: "asc" }`.
Mọi dòng của một lần nộp được ghi bằng một `createMany` trong một transaction nên mang chung một
`createdAt`; giữa `m1` và `m3`, Postgres trả theo vị trí vật lý. CI run 37169842118 (PR #240) đỏ
một lần đúng chỗ này: `giu: []`, `m1` thêm tên «Đối tác miền Bắc gắn bó thêm hai năm». Tại chỗ:
15 lượt cả tệp bằng Bun 1.3.12 → đỏ 1; dời bản ghi `m1` bằng một lần cập nhật không-HOT → đỏ tất định.

Source input: prompt (phiên 2026-10-04, chủ kho giao: tái hiện, chọn theo khoá bản nháp, rà ca cùng mẫu).

## Criteria

- AC-1: Given một lần nộp `tron()` của ca «Mục tiêu đã nhận», When đọc các dòng nó ghi, Then mọi dòng mang đúng một giá trị `createdAt` — thứ tự theo `createdAt` không phân biệt được `m1` với `m3`.
- AC-2: Given bản sao của ca mà ngay sau lần nộp đầu, bản ghi `m1` bị dời ra sau `m3` (cập nhật không-HOT `cuocSoanId` → `NULL` → giá trị cũ) và `findFirst` theo `createdAt` đã trả một dòng khác `m1`, When chạy ca với bộ chọn theo khoá của hồ sơ này, Then ca xanh.
- AC-3: Given cùng bản sao và cùng phép dời của AC-2, When chỉ thay bộ chọn bằng bộ chọn `orderBy: { createdAt: "asc" }` cũ, Then ca đỏ đúng chữ ký CI 37169842118: `"giu": []` và `m1` có thêm tên «Đối tác miền Bắc gắn bó thêm hai năm».
- AC-4: Given spec đã sửa, không dời bản ghi nào, When chạy cả tệp `nop-ban-nhap.integration.spec.ts` qua `bun run test --` bằng Bun 1.3.12, Then mọi ca xanh.
- AC-5: Given hai cây `apps/agent-okr/test` và `packages/*/test`, When quét `orderBy: { createdAt` đứng một mình bằng regex chịu xuống dòng, Then còn đúng 3 chỗ, cùng ở `nop-ban-nhap.integration.spec.ts`; và Given cùng cây nhưng trong bộ nhớ trả bộ chọn cũ vào spec, When quét lại, Then đếm được 4 — bộ quét thấy đúng chỗ đã sửa.
- AC-6: Given bảng rà trong design doc, spec đã sửa, `nop-ban-nhap.ts` và schema bản nháp `okr-cuoc-soan.ts`, When đối chiếu, Then ca «Mục tiêu đã nhận» chọn theo khoá `m1`, ba chỗ `orderBy: { createdAt` còn lại không để thứ tự trong một lần nộp quyết định kết quả, và lập luận «mã sản phẩm không cần đổi» đứng trên khoá phụ `id` của `docDaQuyet` — không dựa vào tính duy nhất của khoá bản nháp, điều schema không bảo đảm. (judgment)

## Coverage

- Trục A — thứ tự vật lý của `m1` so với `m3` sau lần nộp đầu: `m1` trước | `m1` sau [thước CE: bản ghi mới chèn theo thứ tự ghi; cập nhật không-HOT dời bản ghi ra cuối — đo tại chỗ trên Postgres của kho]
- Trục B — bộ chọn của ca: theo `createdAt` | theo khoá bản nháp [thước CE: hai bộ chọn có trong `rang/dao-thu-tu.mjs`]
- Core → AC: nguồn của sự bằng nhau → AC-1 · `m1` sau × theo khoá → AC-2 · `m1` sau × theo `createdAt` → AC-3 · `m1` trước × theo khoá (đường thường của CI) → AC-4 · các chỗ cùng mẫu → AC-5 (máy đếm) · AC-6 (người đọc lập luận)
- Ô `m1` trước × theo `createdAt` là đường xanh cũ — không cần đo lại.
- Quét không gian bằng skill `morphological-scan` đã bỏ — sổ quyết định ghi lý do; hai trục trên liệt tay.

## Out of scope

- Không đổi mã sản phẩm: `nop-ban-nhap.ts`, `packages/db`, `packages/validation` giữ nguyên (lý do ở design doc mục «Mã sản phẩm: không đổi»).
- Không sửa ba chỗ `orderBy: { createdAt` còn lại của tệp spec — thứ tự ở đó không quyết định kết quả trong một lần nộp.
- Không rà `orderBy: { createdAt }` trong mã sản phẩm `apps/agent` hay `apps/api` — ngoài phạm vi chủ kho giao.
- Không thêm phép dời bản ghi vào chính spec: phép dời sống trong bản sao của răng.
- Không chặn bản nháp có hai Mục tiêu (hay hai KR cùng cha) trùng `khoa`: schema `banNhap` hiện cho qua, `docDaQuyet` khi đó giữ dòng `id` nhỏ hơn. Đó là khe kiểm đầu vào của sản phẩm, đề xuất mở việc riêng.

## Notes

- Răng `rang/quet-mau.mjs` (E5) đỏ khi ai thêm một `orderBy: { createdAt` đơn vào hai cây đã quét — có chủ đích: lượt ghim lại buộc trả lời «dòng ghi chung một lần?».
- Răng `rang/dao-thu-tu.mjs` ghi bản sao vào `.acceptance-runs/nop-ban-nhap-chon-theo-khoa/sao-<chiều>-<pid>/`, xoá trong `finally`; mỗi lượt có DB `crm_<id>_test` riêng.
