---
slug: may-soan-de-xuat
at: 2026-09-28T06:30:00Z
route: http://localhost:3300/proto/may-soan-de-xuat
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (khong-dong-bo tren anh, gui kem the Cong Pham vi)
options:
divergence: skipped — khuôn danh-sách-chi-tiết đã có từ lượt 1 và bản mẫu lượt 0 vẽ sẵn hai trạng thái; điểm còn mở (tick từng khẳng định trước khi duyệt) là quyết định phạm vi, đưa lên thẻ Cổng Phạm vi thay vì bày phương án hình
ds_skill: web-design-guidelines
states: [ST-tai-nguon, ST-duyet-ban-may-soan]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 0
deferred: 9
---
# design-pass — may-soan-de-xuat

Bản mẫu là module `kho-tai-lieu` của lượt 0, dựng bằng component `@crm/ui` thật trong khung
giả tĩnh của CRM (`KhungUngDung`). Lượt này chỉ thêm một mục `catalog.ts` slug
`may-soan-de-xuat` trỏ cùng module với hai trạng thái của lượt 2. Không sửa module: nó là
phòng trưng bày chung của mọi lượt Kho tài liệu, sửa cho lượt 2 sẽ đổi luôn trạng thái lượt 1
đã duyệt — nên mọi lệch dưới đây ghi thành phát hiện cho màn thật, không vá trên bản mẫu.

Bước 2 của màn duyệt (sau «Đã đọc nguồn») xem trực tiếp trên bản chạy ở 1280; công cụ chụp
của kho không bấm được nên ma trận chỉ có bước 1.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-tai-nguon | desktop-1280 | light | evidence/design-pass/ST-tai-nguon--desktop-1280.png |
| ST-tai-nguon | mobile-375 | light | evidence/design-pass/ST-tai-nguon--mobile-375.png |
| ST-tai-nguon | desktop-1280 | dark | evidence/design-pass/ST-tai-nguon--desktop-1280--dark.png |
| ST-duyet-ban-may-soan | desktop-1280 | light | evidence/design-pass/ST-duyet-ban-may-soan--desktop-1280.png |
| ST-duyet-ban-may-soan | mobile-375 | light | evidence/design-pass/ST-duyet-ban-may-soan--mobile-375.png |
| ST-duyet-ban-may-soan | desktop-1280 | dark | evidence/design-pass/ST-duyet-ban-may-soan--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: static-frame` — bản mẫu đã nằm trong khung CRM (thanh trên, thanh biểu tượng có mục «Tài liệu», thanh tab Trang · Chờ duyệt · Nguồn · Sức khoẻ).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Không vá gì: module dùng chung với lượt 1 (xem đầu sổ).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- F1 · Vùng kéo thả ghi «Máy đọc file, tìm các trang liên quan» — trái thiết kế (người tải chọn một đích, máy không tìm trang). Màn thật: «Kéo tệp vào đây, hoặc chọn tệp · Word (.docx) hoặc PDF, tới 20 MB»; «file» đổi «tệp».
- F2 · Vùng kéo thả là `div` viền đứt nét tự dựng (dấu hiệu vẽ tay theo `docs/design.md`). Màn thật: tra ReUI `file-upload`/dropzone theo năm bậc, không có thì dựng thành phần trong `packages/ui`.
- F3 · Bảng nguồn có cột «Lớp dữ liệu» — phân lớp ngoài phạm vi lượt này. Màn thật: bỏ cột, thêm «Trang đích».
- F4 · Trạng thái nguồn trên bản mẫu («Hai máy đọc lệch 3 chỗ có số», «1 chỗ mâu thuẫn») thuộc OCR và thẻ mâu thuẫn — ngoài phạm vi. Màn thật chỉ có năm chữ: Máy đang soạn · Đã soạn · Cần gõ tay · Chưa soạn được · (đã có) Nguồn này đã có.
- F5 · Hộp «Tải nguồn lên» với bước chọn đích (trang mới hay cập nhật trang đang dùng) chưa có trên bản mẫu — Cổng Phạm vi duyệt phần này bằng chữ (Đặc tả UX mục 1–3).
- F6 · 375: bảng nguồn cuộn ngang, cột người tải bị cắt. Màn thật: ở 390 mỗi nguồn một dòng `Item` (tên tệp, trạng thái, trang đích), không bảng.
- F7 · Màn duyệt vẽ «Bậc 2 · hai người duyệt», «Có mâu thuẫn» và thẻ chọn cách xử lý mâu thuẫn — ngoài phạm vi. Màn thật bỏ.
- F8 · Bước 2 trên bản mẫu xếp dọc một cột; thiết kế và lộ trình hứa «nguồn cạnh nhau» ở ≥1024. Màn thật: hai cột ở 1440, hai thẻ ở 390 (AC-11). Bước 1 bản mẫu chỉ hiện một đoạn nguồn; màn thật hiện chữ nguồn có đoạn trích tô nền.
- F9 · Bước 2 bản mẫu có «Đối chiếu từng khẳng định» với ô tick «Bắt buộc» cho từng số (nghiên cứu 8.4). Hợp đồng hiện KHÔNG hứa tick bắt buộc — quyết ở Cổng Phạm vi: thêm vào AC-11 (Duyệt khoá tới khi tick hết khẳng định có số) hay để sau.
