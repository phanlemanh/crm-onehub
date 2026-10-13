---
slug: viec-chung
at: 2026-10-13T00:35:14Z
route: http://localhost:3300/proto/viec-chung
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (gói ảnh gửi kèm thẻ Cổng Phạm vi; bản bấm được chạy ở cổng 3300 trên máy M5 cho ai muốn bấm)
options: http://localhost:3300/proto/viec-chung?state=ST-khoi-viec-ban-ghi và ?state=ST-khoi-viec-phuong-an-tron (Hỏi-1, lời khuyên ghim trên trạng thái thứ hai)
divergence: opened
ds_skill: web-design-guidelines
states: [ST-viec-cua-toi-co-viec, ST-viec-cua-toi-cho-tai, ST-viec-cua-toi-rong, ST-viec-cua-toi-loi, ST-khung-viec-nguoi-thuc-hien, ST-khung-viec-nguoi-giao-cho-danh-gia, ST-khung-viec-chi-xem, ST-khung-viec-lich-su, ST-khung-viec-da-khep, ST-o-soan-viec, ST-o-soan-viec-loi, ST-khoi-viec-ban-ghi, ST-khoi-viec-ban-ghi-rong, ST-khoi-viec-phuong-an-tron]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 5
deferred: 2
---
# design-pass — viec-chung

Bản mẫu render trong host thật của kho sau cờ `PROTO_ROUTE`, ghép từ component thật của `@crm/ui` và khung
`PageShell`/`DetailSheet` của app — dữ liệu giả, không đường ghi. Máy chủ dev riêng ở cổng 3300 (cấu hình
`proto-cay-nay`), không đụng máy chủ của cây khác. Chụp bằng ego-browser, giả lập sáng/tối qua ưu tiên màu của hệ
thống (app theo `defaultTheme="system"`). Luật nạp: `docs/design.md`, `docs/vong-doi.md`, chuẩn
`web-design-guidelines` (bản Vercel tải 13/10).

Trạng thái ST-viec-cua-toi-dien-thoai của đặc tả UX là ST-viec-cua-toi-co-viec ở khổ 375 — không thành trạng thái
riêng của bản mẫu vì cùng một cây DOM.

## Bước phân kỳ

Một quyết định có hai hướng khả dĩ: chỗ đứng của việc trên thẻ Hoạt động (Hỏi-1 của sổ quyết định).

- **Khối ghim** (trục: vị trí theo việc phải làm) — động cơ: việc là thứ phải làm, nên đứng trên mọi sự kiện; đánh
  đổi: người quen đọc theo thời gian phải nhìn hai chỗ. Trạng thái `ST-khoi-viec-ban-ghi`. **Máy khuyên.**
- **Trộn vào dòng sự kiện** (trục: vị trí theo thời gian tạo) — động cơ: một dòng thời gian duy nhất; đánh đổi: việc
  tạo tuần trước trôi khỏi tầm mắt, và dòng thời gian phải đọc hai nguồn với con trỏ mới. Trạng thái
  `ST-khoi-viec-phuong-an-tron`, lời khuyên ghim ngay trên trạng thái.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-viec-cua-toi-co-viec | mobile-375 | light | evidence/design-pass/ST-viec-cua-toi-co-viec--mobile-375--light.png |
| ST-viec-cua-toi-co-viec | mobile-375 | dark | evidence/design-pass/ST-viec-cua-toi-co-viec--mobile-375--dark.png |
| ST-viec-cua-toi-co-viec | desktop-1280 | light | evidence/design-pass/ST-viec-cua-toi-co-viec--desktop-1280--light.png |
| ST-viec-cua-toi-co-viec | desktop-1280 | dark | evidence/design-pass/ST-viec-cua-toi-co-viec--desktop-1280--dark.png |
| ST-viec-cua-toi-cho-tai | mobile-375 | light | evidence/design-pass/ST-viec-cua-toi-cho-tai--mobile-375--light.png |
| ST-viec-cua-toi-cho-tai | mobile-375 | dark | evidence/design-pass/ST-viec-cua-toi-cho-tai--mobile-375--dark.png |
| ST-viec-cua-toi-cho-tai | desktop-1280 | light | evidence/design-pass/ST-viec-cua-toi-cho-tai--desktop-1280--light.png |
| ST-viec-cua-toi-cho-tai | desktop-1280 | dark | evidence/design-pass/ST-viec-cua-toi-cho-tai--desktop-1280--dark.png |
| ST-viec-cua-toi-rong | mobile-375 | light | evidence/design-pass/ST-viec-cua-toi-rong--mobile-375--light.png |
| ST-viec-cua-toi-rong | mobile-375 | dark | evidence/design-pass/ST-viec-cua-toi-rong--mobile-375--dark.png |
| ST-viec-cua-toi-rong | desktop-1280 | light | evidence/design-pass/ST-viec-cua-toi-rong--desktop-1280--light.png |
| ST-viec-cua-toi-rong | desktop-1280 | dark | evidence/design-pass/ST-viec-cua-toi-rong--desktop-1280--dark.png |
| ST-viec-cua-toi-loi | mobile-375 | light | evidence/design-pass/ST-viec-cua-toi-loi--mobile-375--light.png |
| ST-viec-cua-toi-loi | mobile-375 | dark | evidence/design-pass/ST-viec-cua-toi-loi--mobile-375--dark.png |
| ST-viec-cua-toi-loi | desktop-1280 | light | evidence/design-pass/ST-viec-cua-toi-loi--desktop-1280--light.png |
| ST-viec-cua-toi-loi | desktop-1280 | dark | evidence/design-pass/ST-viec-cua-toi-loi--desktop-1280--dark.png |
| ST-khung-viec-nguoi-thuc-hien | mobile-375 | light | evidence/design-pass/ST-khung-viec-nguoi-thuc-hien--mobile-375--light.png |
| ST-khung-viec-nguoi-thuc-hien | mobile-375 | dark | evidence/design-pass/ST-khung-viec-nguoi-thuc-hien--mobile-375--dark.png |
| ST-khung-viec-nguoi-thuc-hien | desktop-1280 | light | evidence/design-pass/ST-khung-viec-nguoi-thuc-hien--desktop-1280--light.png |
| ST-khung-viec-nguoi-thuc-hien | desktop-1280 | dark | evidence/design-pass/ST-khung-viec-nguoi-thuc-hien--desktop-1280--dark.png |
| ST-khung-viec-nguoi-giao-cho-danh-gia | mobile-375 | light | evidence/design-pass/ST-khung-viec-nguoi-giao-cho-danh-gia--mobile-375--light.png |
| ST-khung-viec-nguoi-giao-cho-danh-gia | mobile-375 | dark | evidence/design-pass/ST-khung-viec-nguoi-giao-cho-danh-gia--mobile-375--dark.png |
| ST-khung-viec-nguoi-giao-cho-danh-gia | desktop-1280 | light | evidence/design-pass/ST-khung-viec-nguoi-giao-cho-danh-gia--desktop-1280--light.png |
| ST-khung-viec-nguoi-giao-cho-danh-gia | desktop-1280 | dark | evidence/design-pass/ST-khung-viec-nguoi-giao-cho-danh-gia--desktop-1280--dark.png |
| ST-khung-viec-chi-xem | mobile-375 | light | evidence/design-pass/ST-khung-viec-chi-xem--mobile-375--light.png |
| ST-khung-viec-chi-xem | mobile-375 | dark | evidence/design-pass/ST-khung-viec-chi-xem--mobile-375--dark.png |
| ST-khung-viec-chi-xem | desktop-1280 | light | evidence/design-pass/ST-khung-viec-chi-xem--desktop-1280--light.png |
| ST-khung-viec-chi-xem | desktop-1280 | dark | evidence/design-pass/ST-khung-viec-chi-xem--desktop-1280--dark.png |
| ST-khung-viec-lich-su | mobile-375 | light | evidence/design-pass/ST-khung-viec-lich-su--mobile-375--light.png |
| ST-khung-viec-lich-su | mobile-375 | dark | evidence/design-pass/ST-khung-viec-lich-su--mobile-375--dark.png |
| ST-khung-viec-lich-su | desktop-1280 | light | evidence/design-pass/ST-khung-viec-lich-su--desktop-1280--light.png |
| ST-khung-viec-lich-su | desktop-1280 | dark | evidence/design-pass/ST-khung-viec-lich-su--desktop-1280--dark.png |
| ST-khung-viec-da-khep | mobile-375 | light | evidence/design-pass/ST-khung-viec-da-khep--mobile-375--light.png |
| ST-khung-viec-da-khep | mobile-375 | dark | evidence/design-pass/ST-khung-viec-da-khep--mobile-375--dark.png |
| ST-khung-viec-da-khep | desktop-1280 | light | evidence/design-pass/ST-khung-viec-da-khep--desktop-1280--light.png |
| ST-khung-viec-da-khep | desktop-1280 | dark | evidence/design-pass/ST-khung-viec-da-khep--desktop-1280--dark.png |
| ST-o-soan-viec | mobile-375 | light | evidence/design-pass/ST-o-soan-viec--mobile-375--light.png |
| ST-o-soan-viec | mobile-375 | dark | evidence/design-pass/ST-o-soan-viec--mobile-375--dark.png |
| ST-o-soan-viec | desktop-1280 | light | evidence/design-pass/ST-o-soan-viec--desktop-1280--light.png |
| ST-o-soan-viec | desktop-1280 | dark | evidence/design-pass/ST-o-soan-viec--desktop-1280--dark.png |
| ST-o-soan-viec-loi | mobile-375 | light | evidence/design-pass/ST-o-soan-viec-loi--mobile-375--light.png |
| ST-o-soan-viec-loi | mobile-375 | dark | evidence/design-pass/ST-o-soan-viec-loi--mobile-375--dark.png |
| ST-o-soan-viec-loi | desktop-1280 | light | evidence/design-pass/ST-o-soan-viec-loi--desktop-1280--light.png |
| ST-o-soan-viec-loi | desktop-1280 | dark | evidence/design-pass/ST-o-soan-viec-loi--desktop-1280--dark.png |
| ST-khoi-viec-ban-ghi | mobile-375 | light | evidence/design-pass/ST-khoi-viec-ban-ghi--mobile-375--light.png |
| ST-khoi-viec-ban-ghi | mobile-375 | dark | evidence/design-pass/ST-khoi-viec-ban-ghi--mobile-375--dark.png |
| ST-khoi-viec-ban-ghi | desktop-1280 | light | evidence/design-pass/ST-khoi-viec-ban-ghi--desktop-1280--light.png |
| ST-khoi-viec-ban-ghi | desktop-1280 | dark | evidence/design-pass/ST-khoi-viec-ban-ghi--desktop-1280--dark.png |
| ST-khoi-viec-ban-ghi-rong | mobile-375 | light | evidence/design-pass/ST-khoi-viec-ban-ghi-rong--mobile-375--light.png |
| ST-khoi-viec-ban-ghi-rong | mobile-375 | dark | evidence/design-pass/ST-khoi-viec-ban-ghi-rong--mobile-375--dark.png |
| ST-khoi-viec-ban-ghi-rong | desktop-1280 | light | evidence/design-pass/ST-khoi-viec-ban-ghi-rong--desktop-1280--light.png |
| ST-khoi-viec-ban-ghi-rong | desktop-1280 | dark | evidence/design-pass/ST-khoi-viec-ban-ghi-rong--desktop-1280--dark.png |
| ST-khoi-viec-phuong-an-tron | mobile-375 | light | evidence/design-pass/ST-khoi-viec-phuong-an-tron--mobile-375--light.png |
| ST-khoi-viec-phuong-an-tron | mobile-375 | dark | evidence/design-pass/ST-khoi-viec-phuong-an-tron--mobile-375--dark.png |
| ST-khoi-viec-phuong-an-tron | desktop-1280 | light | evidence/design-pass/ST-khoi-viec-phuong-an-tron--desktop-1280--light.png |
| ST-khoi-viec-phuong-an-tron | desktop-1280 | dark | evidence/design-pass/ST-khoi-viec-phuong-an-tron--desktop-1280--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu chạy trong host thật, khung bản ghi là `DetailSheet` thật của app.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dòng quá hạn trộn chấm đỏ với nhãn «Chưa làm» → chấm trạng thái theo trạng thái; dấu trễ (`toneTheoNghia("hong")`) chuyển sang cột Hạn.
- Người giao hay người thực hiện trùng người xem hiện «Tôi» ở danh sách và khối việc.
- Nội dung thẻ Hoạt động và thẻ Lịch sử dính mép khung → đặt trong `DetailSheetSection` để nhận lề của khung.
- Dòng lịch sử ở khổ 375 tách tên người và việc đã làm thành hai cột → gộp vào một dòng chữ.
- Khung việc của người giao tô màu chính cho «Huỷ» → màu chính chỉ cho «Xong» (hành động mình muốn), «Làm lại» và «Huỷ» là nút viền.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- «Huỷ» không có nghĩa nào trong `toneTheoNghia` (`packages/ui/src/lib/status-tone.ts`): bản mẫu hiện «Đã huỷ» bằng chữ mờ, không chấm. Muốn có chấm thì thêm một nghĩa «đã khép không làm» vào `packages/ui` — tệp dùng chung, phải báo #375 trước. Đề xuất: giữ chữ mờ ở lượt này.
- Dòng gập «Đã xong (n)» / «Đã huỷ (n)» chưa có mảnh chung (`docs/vong-doi.md` mục «Danh sách mặc định hiện gì», cột «Mảnh dùng» để trống) — bản mẫu ghép `Collapsible` + `Button` ghost. Đề xuất: dựng tạm trong `apps/app/components/viec/`, chuyển vào `packages/ui` khi khu thứ hai cần.
