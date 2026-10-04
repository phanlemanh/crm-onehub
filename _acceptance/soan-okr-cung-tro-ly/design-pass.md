---
slug: soan-okr-cung-tro-ly
at: 2026-09-30T03:40:00Z
route: http://localhost:3910/proto/soan-okr-cung-tro-ly
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options: http://localhost:3910/proto/soan-okr-cung-tro-ly?state=ST-soan-hep
divergence: skipped — khuôn «hội thoại cạnh bảng nháp» đã chốt ở tài liệu bối cảnh chủ kho duyệt 30/09 (mục 2b) và chủ kho chỉ tab Tác nhân của deal làm mẫu vỏ; chỗ rẽ duy nhất còn lại (ô đích nằm dưới thẻ KR hay lồng trong thẻ) là giới hạn của thành phần, đưa thành finding Nhóm 2
ds_skill: web-design-guidelines
states: [ST-soan-nut, ST-soan-nut-tiep, ST-soan-nut-an, ST-soan-nut-het-cuoc, ST-soan-nut-het-tran, ST-soan-mo-dau, ST-soan-thieu-boi-canh, ST-soan-dang-tra-loi, ST-soan-ban-nhap, ST-soan-dong-sua, ST-soan-dong-da-quyet, ST-soan-sua-qua-chat, ST-soan-dong-bi-loai, ST-soan-loi, ST-soan-het-luot, ST-soan-dua-vao-xac-nhan, ST-soan-dua-vao-thieu-dich, ST-soan-da-dua-vao, ST-soan-dua-vao-loi, ST-soan-hep, ST-cuoc-danh-sach, ST-cuoc-rong, ST-tochuc-mo-ta, ST-tochuc-chuc-danh, ST-kho-tao-chien-luoc, ST-kho-duyet-canh-bao, ST-kho-duyet-qua-tran, ST-caidat-nac-soan, ST-sodo-soan, ST-sodo-soan-rong, ST-sodo-soan-ngan]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 7
deferred: 7
---
# design-pass — soan-okr-cung-tro-ly

Bản mẫu chạy trong chính ứng dụng sau cờ `PROTO_ROUTE=1`, trên máy chủ dev của cây này
(cổng 3910), dựng bằng thành phần thật của `packages/ui` (`Sheet size="2xl"`, AI Elements
`Conversation`/`Message`, thẻ góp ý `ProposedChange`, `ConfirmDialog`, `Field`, `InputGroup`,
`Tabs`, `Alert`, `Item`, `SimpleTable`, `Empty`) trên khung ứng dụng OKR dùng chung của các
bản mẫu OKR (`ban-mau-okr/phan-chung.tsx`, thêm tham số chu kỳ tuỳ chọn). Dữ liệu giả của
phòng Kinh doanh miền Bắc, Hải Đăng Logistics, Quý 1 · 2027; không đường ghi. Chụp bằng
`rang/chup-proto.mjs` (puppeteer, 1280 và 375, sáng và tối); 0 trạng thái tràn ngang. Soát
bằng bộ luật `web-design-guidelines` (bản tải 30/09) và `docs/design.md`, `docs/chat-ui.md`.

Chỗ chưa rõ để chủ kho nhìn: ở 375 ngăn chiếm gần hết bề ngang, còn một dải hẹp bên trái
(ảnh `ST-soan-hep--mobile-375.png`) — đúng cách `Sheet` bên phải hoạt động, không phải lỗi.

## Ma trận capture

124 ảnh: mỗi trạng thái trong `states` × {desktop-1280, mobile-375} × {light, dark}, tên
`evidence/design-pass/<state>--<breakpoint>[--dark].png`. Bảng dưới liệt các ảnh neo của
từng nhóm; ảnh còn lại cùng khuôn tên.

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-soan-nut | desktop-1280 | light | evidence/design-pass/ST-soan-nut--desktop-1280.png |
| ST-soan-nut-an | desktop-1280 | light | evidence/design-pass/ST-soan-nut-an--desktop-1280.png |
| ST-soan-mo-dau | desktop-1280 | light | evidence/design-pass/ST-soan-mo-dau--desktop-1280.png |
| ST-soan-thieu-boi-canh | desktop-1280 | light | evidence/design-pass/ST-soan-thieu-boi-canh--desktop-1280.png |
| ST-soan-ban-nhap | desktop-1280 | light | evidence/design-pass/ST-soan-ban-nhap--desktop-1280.png |
| ST-soan-ban-nhap | desktop-1280 | dark | evidence/design-pass/ST-soan-ban-nhap--desktop-1280--dark.png |
| ST-soan-sua-qua-chat | desktop-1280 | light | evidence/design-pass/ST-soan-sua-qua-chat--desktop-1280.png |
| ST-soan-dua-vao-thieu-dich | desktop-1280 | dark | evidence/design-pass/ST-soan-dua-vao-thieu-dich--desktop-1280--dark.png |
| ST-soan-dua-vao-xac-nhan | desktop-1280 | light | evidence/design-pass/ST-soan-dua-vao-xac-nhan--desktop-1280.png |
| ST-soan-da-dua-vao | desktop-1280 | light | evidence/design-pass/ST-soan-da-dua-vao--desktop-1280.png |
| ST-soan-hep | mobile-375 | light | evidence/design-pass/ST-soan-hep--mobile-375.png |
| ST-cuoc-danh-sach | desktop-1280 | light | evidence/design-pass/ST-cuoc-danh-sach--desktop-1280.png |
| ST-tochuc-mo-ta | desktop-1280 | light | evidence/design-pass/ST-tochuc-mo-ta--desktop-1280.png |
| ST-kho-duyet-canh-bao | desktop-1280 | light | evidence/design-pass/ST-kho-duyet-canh-bao--desktop-1280.png |
| ST-caidat-nac-soan | desktop-1280 | light | evidence/design-pass/ST-caidat-nac-soan--desktop-1280.png |
| ST-sodo-soan | desktop-1280 | light | evidence/design-pass/ST-sodo-soan--desktop-1280.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu render trong khung ứng dụng OKR thật sau cờ
  dev, người duyệt thấy đường vào (Theo đơn vị › khung đơn vị › nút) và đường ra (Theo đơn
  vị với các Mục tiêu nháp) ngay trên bản bấm được.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Hàng «Trợ lý OKR đang soạn…» bọc `role="status"` + `aria-live="polite"` để trình đọc màn báo trạng thái chờ.
- Nút trong dải nhắc và trong thông báo «đã tạo» đưa vào slot `AlertAction`, bỏ khoảng cách tự đặt.
- Nút Tiếp/Xem ở danh sách cuộc có `aria-label` kèm ngày của cuộc, phân biệt từng hàng.
- Bỏ `tabIndex={0}` trên thẻ nháp (nhóm không tương tác, tiêu điểm vô hình).
- Placeholder «Bằng trần thường…» kết thúc bằng dấu ba chấm.
- Danh sách dòng trong ngăn một cuộc dựng bằng `Item` thay cho `div` viền tay.
- Ngày, tiền, số hiển thị đi qua `Intl` (vi-VN) thay chuỗi viết cứng; giá trị hiển thị giữ nguyên.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `PromptInput` (AI Elements) chưa có trong cây: ô soạn tạm dựng bằng `Textarea` + nút gửi — S3 kéo bằng CLI và nối vào màn thật cùng thay đổi (cổng mồ côi).
- `Suggestion`/`Suggestions` (AI Elements) chưa có: gợi ý trả lời tạm là `Button variant="outline" size="sm"` — S3 kéo bằng CLI.
- Thẻ nháp lồng: `ProposedChange` không có chỗ đặt khối (ô nhập, nhãn trạng thái) trong thân thẻ, nên hai ô Khởi điểm · Đích đứng NGAY DƯỚI thẻ KR và nhãn «vừa sửa · vừa chuyển · đã bỏ» nhét vào `label`. S3 thêm biến thể `ProposedChange` có slot `fields` và prop `tag` ở `packages/ui`. **Chủ kho quyết ở Cổng Phạm vi:** chấp nhận bố cục «ô dưới thẻ» cho bản duyệt, hay đòi lồng trong thẻ trước khi duyệt.
- Khoảng cách trên `ConversationContent`/`MessageContent` đặt bằng `className` (gap) — cần prop/biến thể ở `packages/ui` hoặc bỏ.
- Nút điều hướng dọc «đang chọn» tô bằng `className` trên `Button variant="ghost"` (tiền lệ ở khung OKR dùng chung) — cần biến thể có tên, gỡ luôn tiền lệ.
- `Empty className="rounded-lg border"` đổi kiểu viền (gốc nét đứt) — cần biến thể viền liền hoặc chấp nhận nét đứt.
- Tiêu đề mục `<h3>`/`<h4>` tự đặt cỡ chữ — cần thành phần tiêu đề mục trong `packages/ui`.
