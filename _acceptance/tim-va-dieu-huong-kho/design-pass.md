---
slug: tim-va-dieu-huong-kho
at: 2026-09-28T23:12:00Z
route: http://localhost:3300/proto/tim-va-dieu-huong-kho
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (khong-dong-bo tren anh, gui kem the Cong Pham vi)
options:
divergence: skipped — khuôn danh-sách-chi-tiết đã có từ lượt 1, bản mẫu lượt 0 vẽ sẵn hai trạng thái; hai điểm lệch (⌘K là nhóm trong hộp toàn app, khối «Trang nhắc tới» đặt dưới nội dung) là quyết định đã ghi ở thiết kế, đưa lên thẻ Cổng Phạm vi
ds_skill: web-design-guidelines
states: [ST-tim-nhanh, ST-suc-khoe]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 0
deferred: 7
---
# design-pass — tim-va-dieu-huong-kho

Bản mẫu là module `kho-tai-lieu` của lượt 0, dựng bằng component `@crm/ui` thật trong khung
giả tĩnh của CRM. Lượt này chỉ thêm mục `catalog.ts` slug `tim-va-dieu-huong-kho` trỏ cùng
module với hai trạng thái của lượt 3. Không sửa module: nó là phòng trưng bày chung của mọi
lượt Kho tài liệu, sửa cho lượt 3 sẽ đổi luôn trạng thái lượt 1 và 2 đã duyệt — nên mọi lệch
dưới đây là phát hiện cho màn thật, không vá trên bản mẫu (cùng cách lượt 2).

Ba bề mặt của lượt không có trạng thái bản mẫu: khối «Trang nhắc tới trang này», lọc theo
đơn vị và chủ, hộp chèn liên kết. Người duyệt duyệt chúng bằng mục «Đặc tả UX» của thiết kế;
ảnh tham chiếu `tham-chieu-ST-doc-trang--desktop-1280.png` cho thấy màn đọc hiện có (khối
backlink của bản mẫu không hiện ở phạm vi lượt 1).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-tim-nhanh | desktop-1280 | light | evidence/design-pass/ST-tim-nhanh--desktop-1280.png |
| ST-tim-nhanh | mobile-375 | light | evidence/design-pass/ST-tim-nhanh--mobile-375.png |
| ST-tim-nhanh | desktop-1280 | dark | evidence/design-pass/ST-tim-nhanh--desktop-1280--dark.png |
| ST-suc-khoe | desktop-1280 | light | evidence/design-pass/ST-suc-khoe--desktop-1280.png |
| ST-suc-khoe | mobile-375 | light | evidence/design-pass/ST-suc-khoe--mobile-375.png |
| ST-suc-khoe | desktop-1280 | dark | evidence/design-pass/ST-suc-khoe--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: static-frame` — bản mẫu đã nằm trong khung CRM (thanh trên, thanh biểu tượng có mục «Tài liệu», thanh tab Trang · Chờ duyệt · Nguồn · Sức khoẻ).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Không có: module dùng chung, không vá trên bản mẫu.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Hộp ⌘K của bản mẫu là hộp riêng của kho, lọc theo tên phía trình duyệt, nhóm theo loại, không đoạn trích. Màn thật: nhóm «Tài liệu» trong `QuickSwitcher` toàn app, kết quả từ `taiLieu.tim` xếp theo độ khớp, mỗi dòng có đoạn trích phần khớp đậm (AC-1, AC-3).
- Ô rỗng của ⌘K bản mẫu hứa «Câu hỏi này sẽ vào hàng «chưa có trang»» — tính năng không có ở lượt nào đã duyệt. Màn thật: «Không có trang nào khớp.».
- Dòng Sức khoẻ chỉ có tên trang, không bấm được. Màn thật: tên là liên kết tới màn đọc, kèm chủ trang và chi tiết của danh sách (ngày hết hạn, số bản chờ, chữ liên kết gãy, số trang nhắc) (AC-7, AC-8).
- Sức khoẻ bản mẫu dựng tay bằng `h3` và `ul` — màn thật dùng `Card`/`CardTitle` và `Item` theo bảng «Dấu hiệu vẽ tay» của `docs/design.md`.
- Bản mẫu có danh sách «Cụt: không dẫn đi đâu» — ngoài lượt (hợp đồng Out of scope); câu dẫn «Danh sách này đi trước đồ thị toàn kho» là lời nội bộ, bỏ ở màn thật.
- Khổ 375: hàng nút đầu kho (Tìm nhanh · Tải nguồn lên · Trang mới) chạm mép phải, nút «Trang mới» có nguy cơ tràn ngang. Màn thật: hàng nút xuống dòng hoặc thu nút phụ; E3u, E8u đo «không cuộn ngang ở 390».
- Khối «Trang nhắc tới trang này», bộ lọc đơn vị/chủ và hộp chèn liên kết không có trạng thái bản mẫu — duyệt bằng chữ ở «Đặc tả UX»; hình thật lần đầu thấy ở ảnh của E3u, E4u, E5u, E8u.
