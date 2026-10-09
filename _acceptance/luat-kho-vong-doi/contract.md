---
schema_version: 1
feature: Luật thứ bảy «vong-doi» của scripts/luat-kho — máy bắt mô hình có hai cột cất, thủ tục list lẫn bản đã cất, và xoá vĩnh viễn không kiểm bản đã lưu trữ — và cả bộ luật kho chạy ở CI Acceptance
slug: luat-kho-vong-doi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-09
design_doc: _acceptance/luat-kho-vong-doi/design.md
---

# Acceptance Contract: luat-kho-vong-doi

## Context

Chuẩn `docs/vong-doi.md` (chủ kho duyệt 07/10) cấm ba điều mà máy đo được, nhưng hiện chỉ người soát giữ. Bộ luật kho
`scripts/luat-kho/do-cay.mjs` có sáu luật và chưa chạy ở CI nào: đo onehub `532e3317` (08/10) thấy cây đỏ luật
`cach-ly-hai-agent` do #321 mà không kiểm tra nào chặn. Ngày 09/10 chủ kho chốt ba câu: (1) điều «danh sách lẫn bản đã cất»
chỉ đo phương thức liệt kê (`list*`) của app Nest; (2) máy không đo nút giao diện, chỉ đo xoá vĩnh viễn ở máy chủ phải từ
chối bản chưa lưu trữ; (3) vi phạm cũ của `AgentDefinition` vào nền theo tệp, để E5 dọn.

## Criteria

- AC-1: Given `packages/db/prisma/schema.prisma` có một mô hình mang cả hai cột `archivedAt` và `deletedAt`, When chạy
  thước, Then in `DO vong-doi: packages/db/prisma/schema.prisma:<dòng model> mo hinh <Tên> co hai cach cat` và thoát 1;
  mô hình chỉ có một trong hai cột thì không đỏ.
- AC-2: Given một phương thức của app Nest có tên bắt đầu bằng `list` gọi `.<mô hình>.findMany(` trên mô hình có
  `archivedAt` trong schema, When phương thức đó (hoặc một hàm `this.<tên>` cùng lớp mà nó gọi trực tiếp) không nhắc
  `archivedAt` hay `archivedFilter`, Then thước in `DO vong-doi: <tệp>:<dòng findMany> list lan ban da cat: <mô hình>` và
  thoát 1; có nhắc ở chính phương thức hoặc ở hàm `this.*` một bước (như `buildWhere` → `archivedFilter`) thì xanh.
- AC-3: Given `findMany` trên mô hình có `archivedAt` nằm trong phương thức KHÔNG tên `list*`, hoặc trên mô hình không có
  `archivedAt`, hoặc trong tệp kiểm (`test/`, `*.spec.ts`), hoặc ngoài app Nest, When chạy thước, Then không có dòng đỏ
  `vong-doi` cho lời gọi đó.
- AC-4: Given một phương thức của app Nest gọi `.<mô hình>.delete(` hay `.deleteMany(` trên mô hình có `archivedAt`, When
  phương thức đó và các hàm `this.*` cùng lớp nó gọi trực tiếp không nhắc `archivedAt`, Then thước in `DO vong-doi:
  <tệp>:<dòng> xoa vinh vien khong kiem da luu tru: <mô hình>` và thoát 1; kiểm ở chính phương thức hoặc qua một hàm phụ
  một bước (như `purgeDepartment` → `lyDoKhongXoa`) thì xanh.
- AC-5: Given cây onehub hiện tại, When chạy `node scripts/luat-kho/do-cay.mjs --du-luat`, Then dòng `vong-doi` báo XANH
  với nền đúng ba chỗ — hai của `AgentDefinition` (dòng model trong schema, lời `findMany` của `list` trong
  `agent-definitions.service.ts`) và lời `fieldDefinition.delete` của `FieldsService.delete` trong `fields.service.ts`
  (vi phạm thật thấy ở S3, ghi ở sổ quyết định) —, mỗi chỗ ghi trong `scripts/luat-kho/cau-hinh.mjs` theo tệp và chữ của dòng; dọn một
  chỗ khỏi mã thì thước in `NEN THUA vong-doi: …` cho chỗ đó.
- AC-6: Given thiếu `schema.prisma` hoặc không có app Nest, When chạy thước với `--du-luat`, Then in `KHONG DO DUOC: thieu
  luat: vong-doi` và thoát 2; không cờ thì in `KHONG AP DUNG: vong-doi — …` và sáu luật kia vẫn chạy.
- AC-7: Given mỗi lượt thước, When phần tự gài chạy trên bản gương tmpdir, Then có ca đỏ cho từng điều (AC-1, AC-2, AC-4)
  và ca đối chứng xanh cho từng lối thoát (một cột, `archivedFilter` qua hàm phụ, kiểm qua hàm phụ, phương thức không tên
  `list*`); một ca không bắt hoặc bắt nhầm thì thước thoát 2 «thuoc hong, khong tin duoc».
- AC-8: Given `.github/workflows/acceptance.yml`, When một PR vào `onehub` chạy CI, Then có một job cài phụ thuộc rồi chạy
  đúng lệnh `node scripts/luat-kho/do-cay.mjs --du-luat`; thước thoát khác 0 thì job đỏ.
- AC-9: Given cây onehub, When đo thời gian thước trước và sau khi thêm luật thứ bảy, Then lượt đầy đủ (gồm tự gài) dài
  thêm không quá 2 phút.

## Coverage

- Trục A — điều luật: (c) hai cột cất | (b) `list*` lẫn bản đã cất | (a) xoá vĩnh viễn không kiểm đã cất [thước CE: ba câu
  chủ kho chốt 09/10 + `docs/vong-doi.md`]
- Trục B — hình dạng kiểm: trực tiếp | một bước qua `this.*` | hai bước trở lên | không kiểm [thước CE: đo onehub
  `532e3317` — `purgeDepartment` → `lyDoKhongXoa`, `list` → `buildWhere`]
- Trục C — phạm vi: app Nest | tệp kiểm | app khác | mô hình không có `archivedAt` [thước CE: `ungDung()` của do-cay; 11 mô
  hình có `archivedAt`]
- Trục D — kết cục thước: xanh | đỏ mới | trong nền | nền thừa | không đo được [thước CE: khuôn sáu luật hiện có]
- Core → AC: A(c) → AC-1; A(b)×B → AC-2; A(b) ngoài `list*` và C → AC-3; A(a)×B → AC-4; D nền → AC-5; D không đo
  được → AC-6; tự gài → AC-7; CI → AC-8; giá thời gian → AC-9. Bản quét: `coverage-scan.md`.
- [NGÀNH: Semgrep, ArchUnit, gem `discard`] là đối chiếu khuôn (baseline vi phạm cũ, một cột cất), không phải yêu cầu.

## Đường đo

- «luật chạy ở CI mọi PR vào onehub» · danh sách lượt workflow Acceptance của PR vào `onehub` 14 ngày sau gộp, mỗi lượt có
  job luật kho · AC-8.
- «0 lần chặn oan» · đếm dòng nền `vong-doi` mới thêm vào `cau-hinh.mjs` sau ngày gộp kèm lý do «đúng chuẩn» · AC-2,
  AC-3, AC-4.
- «mọi ca phá thử bị bắt ở mọi lượt» · dòng `chieu do N/N` trong nhật ký job · AC-7.
- «thước dài thêm ≤ 2 phút» · E4 tại máy (trung vị HEAD so với gốc `532e33175`); ở CI: thời lượng bước luật kho của PR
  đầu tiên chạy nó làm số nền, so với 14 ngày sau · AC-9.

## Out of scope

- Nút «Xoá» trên giao diện cho bản ghi đã có lịch sử — «lịch sử» là phán xét của người (chủ kho chốt 09/10).
- Danh sách lẫn bản đã cất ở phương thức không tên `list*`, ở app web, hay qua hai bước hàm phụ trở lên.
- Kết cục nghiệp vụ (`closedAt`, trạng thái) — chuẩn chưa nêu dấu hiệu máy đọc được.
- Dọn vi phạm `AgentDefinition` — việc của E5 `tac-nhan-va`.
- Sửa vi phạm `cach-ly-hai-agent` có sẵn trên onehub (từ #321) — việc của dãy P3; xem câu hỏi ở Notes.

## Notes

- Phụ thuộc: job CI mới (AC-8) chạy CẢ bảy luật, nên nó đỏ chừng nào onehub còn vi phạm `cach-ly-hai-agent` của #321
  (`apps/agent/test/giai-doan-agent.integration.spec.ts:4`). Đã báo giám sát giao P3 sửa (P4-40, 08/10). Vòng này không
  đưa vi phạm đó vào nền. Điều kiện vào S4: bản sửa của P3 nằm trong HEAD; chưa có thì lượt chấm BLOCKED có tên «chờ bản
  sửa #321», không REJECT.
- Ba câu vòng đời của `docs/vong-doi.md` không áp: vòng này không tạo loại bản ghi hay trạng thái kết thúc nào.
