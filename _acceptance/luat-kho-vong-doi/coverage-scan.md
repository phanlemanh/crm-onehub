# Quét không gian AC — luat-kho-vong-doi (preset test-matrix)

## Ngữ cảnh
- Sản phẩm: thước tĩnh `scripts/luat-kho/do-cay.mjs` của crm-onehub, thêm luật thứ bảy «vong-doi» — chân sản phẩm:
  [SUY-TỪ-REPO: docs/vong-doi.md] [SUY-TỪ-REPO: scripts/luat-kho/do-cay.mjs] [SUY-TỪ-REPO: packages/db/prisma/schema.prisma]
  [SUY-TỪ-REPO: apps/api/src/trpc/list-input.ts] [SUY-TỪ-REPO: apps/api/src/to-chuc/to-chuc.service.ts] · ba câu chủ kho
  chốt 09/10 (chỉ thủ tục list; không đo nút, đo xoá vĩnh viễn ở máy chủ; vi phạm cũ AgentDefinition vào nền).
- Chân ngành: [NGÀNH: Semgrep — luật tĩnh có baseline, chỉ báo vi phạm mới trong CI] · [NGÀNH: ArchUnit — luật kiến trúc
  chạy như bài kiểm, có «freeze» vi phạm cũ] · [NGÀNH: gem `discard` của Rails — một cột cất `discarded_at`, scope mặc
  định loại bản đã cất, khuyên không dùng song song với xoá mềm kiểu `paranoia`].

## Trục
- Trục A — điều luật: (c) hai cột cất trên một mô hình | (b) `list*` lẫn bản đã cất | (a) xoá vĩnh viễn không kiểm đã
  cất [thước CE: ba câu chủ kho chốt + `docs/vong-doi.md` mục «Máy chủ» và «Ba cách dọn»]
- Trục B — hình dạng mã của một vi phạm/không vi phạm: kiểm trực tiếp trong phương thức | kiểm qua hàm phụ `this.*` cùng
  lớp (một bước) | kiểm qua hai bước trở lên | không kiểm [thước CE: đo onehub 532e3317 — `purgeDepartment` →
  `lyDoKhongXoa`; `list` → `buildWhere` → `archivedFilter`]
- Trục C — phạm vi tệp: mã app Nest | tệp kiểm (`test/`, `*.spec.ts`) | app khác (agent, app web) | mô hình không có
  `archivedAt` [thước CE: `ungDung()` của do-cay nhận app theo nội dung; 11 mô hình có `archivedAt` trong schema]
- Trục D — kết cục của thước: xanh | đỏ vi phạm mới | vi phạm trong nền | nền thừa | không đo được (thiếu schema / app
  Nest) [thước CE: khuôn sáu luật hiện có — XANH/DO/NEN THUA/KHONG AP DUNG/KHONG DO DUOC]

## Core
1. A(c) × đỏ khi mô hình có `archivedAt` và `deletedAt`; nền giữ `AgentDefinition` — chuẩn cấm thẳng, đo bằng schema.
2. A(b) × B trực tiếp/một bước × xanh khi có `archivedFilter`/`archivedAt`; × không kiểm → đỏ — lời chốt câu 1.
3. A(b) × phương thức không tên `list*` gọi `findMany` → không xét (đối chứng chặn oan) — 85 lời gọi tra cứu nội bộ.
4. A(a) × B trực tiếp/một bước → xanh; không kiểm → đỏ — lời chốt câu 2, ca thật `purgeDepartment`.
5. C mô hình không có `archivedAt`, tệp kiểm, app không phải Nest → không xét — giữ thước khỏi chặn oan.
6. D: nền theo tệp + «NEN THUA» khi vi phạm cũ được dọn; thiếu schema/app Nest → «KHONG AP DUNG», `--du-luat` → mã 2.
7. Tự gài: mỗi điều (a)(b)(c) một ca đỏ và một ca đối chứng xanh trên bản gương — khuôn chiều đỏ của do-cay.
8. Chạy cả bộ luật trong `acceptance.yml`; thời gian thước dài thêm ≤ 2′ (ngưỡng CHẾT của hồ sơ cơ hội).

## Later
- A(b)/(a) × B hai bước trở lên (hàm phụ gọi hàm phụ) — chưa có ca thật; mở khi gặp.
- A(b) × danh sách lẫn bản đã cất ở app web (lọc phía khách) — chuẩn đặt luật ở máy chủ.
- Kết cục nghiệp vụ (`closedAt`, `status`) đúng cách (không phải cột cất) — chuẩn chưa nêu dấu hiệu máy đọc được.

## Never
- A(a) nút «Xoá» trên giao diện cho bản ghi có lịch sử — chủ kho chốt: «lịch sử» là phán xét của người, máy không đo.
- Bộ chữ (Xoá / Lưu trữ / Xoá vĩnh viễn) — từ điển, không phải luật mã.

## Cross-cutting áp mọi ô Core
- Nhận mô hình cất từ chính `schema.prisma` (không liệt tay) và app Nest theo nội dung `package.json`.
- Thông điệp đỏ ghim `DO vong-doi: <tệp>:<dòng> <điều>` — cùng khuôn sáu luật.
- Vi phạm cũ chỉ qua được nhờ nền theo tệp và chữ từng dòng trong `cau-hinh.mjs`.
