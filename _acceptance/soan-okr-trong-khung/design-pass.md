---
slug: soan-okr-trong-khung
at: 2026-10-09T08:31:08Z
route: http://localhost:3370/proto/soan-okr-trong-khung
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (anh-gui-kem, thao-luan)
options:
divergence: skipped — chủ kho đã chọn hướng trên hình phác ba trạng thái trong phiên 09/10 («đúng ý»)
ds_skill: web-design-guidelines
states: [ST-khung-dang-mo, ST-khung-hep-rong, ST-khung-dang-soan-dau, ST-khung-rong, ST-khung-rong-dang-soan, ST-khung-hoi-dong, ST-khung-khong-mo, ST-khung-chua-cau-hinh, ST-khung-da-dua-vao, ST-khung-dien-thoai]
breakpoints: [desktop-1440, desktop-1024, tablet-768, mobile-375]
themes: [light, dark]
patched: 7
deferred: 4
---
# design-pass — soan-okr-trong-khung

Bản mẫu ghép từ thành phần thật (`DetailSheet`, `DetailSheetHeader`, `KaraArtifact`, `KaraComposer`,
`KaraTranscript`, `KaraProposal`, `ConfirmDialog`, `Tabs`), dữ liệu giả của bản mẫu K2. App của chính cây
trên cổng 3370 (cwd đã kiểm), `PROTO_ROUTE=1`. Chụp bằng `rang/chup-proto.mjs`: 80 ảnh, 0 tràn ngang, 0 lỗi console.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-khung-chua-cau-hinh | 1024 | dark | evidence/design-pass/ST-khung-chua-cau-hinh--1024--dark.png |
| ST-khung-chua-cau-hinh | 1024 | light | evidence/design-pass/ST-khung-chua-cau-hinh--1024--light.png |
| ST-khung-chua-cau-hinh | 1440 | dark | evidence/design-pass/ST-khung-chua-cau-hinh--1440--dark.png |
| ST-khung-chua-cau-hinh | 1440 | light | evidence/design-pass/ST-khung-chua-cau-hinh--1440--light.png |
| ST-khung-chua-cau-hinh | 375 | dark | evidence/design-pass/ST-khung-chua-cau-hinh--375--dark.png |
| ST-khung-chua-cau-hinh | 375 | light | evidence/design-pass/ST-khung-chua-cau-hinh--375--light.png |
| ST-khung-chua-cau-hinh | 768 | dark | evidence/design-pass/ST-khung-chua-cau-hinh--768--dark.png |
| ST-khung-chua-cau-hinh | 768 | light | evidence/design-pass/ST-khung-chua-cau-hinh--768--light.png |
| ST-khung-da-dua-vao | 1024 | dark | evidence/design-pass/ST-khung-da-dua-vao--1024--dark.png |
| ST-khung-da-dua-vao | 1024 | light | evidence/design-pass/ST-khung-da-dua-vao--1024--light.png |
| ST-khung-da-dua-vao | 1440 | dark | evidence/design-pass/ST-khung-da-dua-vao--1440--dark.png |
| ST-khung-da-dua-vao | 1440 | light | evidence/design-pass/ST-khung-da-dua-vao--1440--light.png |
| ST-khung-da-dua-vao | 375 | dark | evidence/design-pass/ST-khung-da-dua-vao--375--dark.png |
| ST-khung-da-dua-vao | 375 | light | evidence/design-pass/ST-khung-da-dua-vao--375--light.png |
| ST-khung-da-dua-vao | 768 | dark | evidence/design-pass/ST-khung-da-dua-vao--768--dark.png |
| ST-khung-da-dua-vao | 768 | light | evidence/design-pass/ST-khung-da-dua-vao--768--light.png |
| ST-khung-dang-mo | 1024 | dark | evidence/design-pass/ST-khung-dang-mo--1024--dark.png |
| ST-khung-dang-mo | 1024 | light | evidence/design-pass/ST-khung-dang-mo--1024--light.png |
| ST-khung-dang-mo | 1440 | dark | evidence/design-pass/ST-khung-dang-mo--1440--dark.png |
| ST-khung-dang-mo | 1440 | light | evidence/design-pass/ST-khung-dang-mo--1440--light.png |
| ST-khung-dang-mo | 375 | dark | evidence/design-pass/ST-khung-dang-mo--375--dark.png |
| ST-khung-dang-mo | 375 | light | evidence/design-pass/ST-khung-dang-mo--375--light.png |
| ST-khung-dang-mo | 768 | dark | evidence/design-pass/ST-khung-dang-mo--768--dark.png |
| ST-khung-dang-mo | 768 | light | evidence/design-pass/ST-khung-dang-mo--768--light.png |
| ST-khung-dang-soan-dau | 1024 | dark | evidence/design-pass/ST-khung-dang-soan-dau--1024--dark.png |
| ST-khung-dang-soan-dau | 1024 | light | evidence/design-pass/ST-khung-dang-soan-dau--1024--light.png |
| ST-khung-dang-soan-dau | 1440 | dark | evidence/design-pass/ST-khung-dang-soan-dau--1440--dark.png |
| ST-khung-dang-soan-dau | 1440 | light | evidence/design-pass/ST-khung-dang-soan-dau--1440--light.png |
| ST-khung-dang-soan-dau | 375 | dark | evidence/design-pass/ST-khung-dang-soan-dau--375--dark.png |
| ST-khung-dang-soan-dau | 375 | light | evidence/design-pass/ST-khung-dang-soan-dau--375--light.png |
| ST-khung-dang-soan-dau | 768 | dark | evidence/design-pass/ST-khung-dang-soan-dau--768--dark.png |
| ST-khung-dang-soan-dau | 768 | light | evidence/design-pass/ST-khung-dang-soan-dau--768--light.png |
| ST-khung-dien-thoai | 1024 | dark | evidence/design-pass/ST-khung-dien-thoai--1024--dark.png |
| ST-khung-dien-thoai | 1024 | light | evidence/design-pass/ST-khung-dien-thoai--1024--light.png |
| ST-khung-dien-thoai | 1440 | dark | evidence/design-pass/ST-khung-dien-thoai--1440--dark.png |
| ST-khung-dien-thoai | 1440 | light | evidence/design-pass/ST-khung-dien-thoai--1440--light.png |
| ST-khung-dien-thoai | 375 | dark | evidence/design-pass/ST-khung-dien-thoai--375--dark.png |
| ST-khung-dien-thoai | 375 | light | evidence/design-pass/ST-khung-dien-thoai--375--light.png |
| ST-khung-dien-thoai | 768 | dark | evidence/design-pass/ST-khung-dien-thoai--768--dark.png |
| ST-khung-dien-thoai | 768 | light | evidence/design-pass/ST-khung-dien-thoai--768--light.png |
| ST-khung-hep-rong | 1024 | dark | evidence/design-pass/ST-khung-hep-rong--1024--dark.png |
| ST-khung-hep-rong | 1024 | light | evidence/design-pass/ST-khung-hep-rong--1024--light.png |
| ST-khung-hep-rong | 1440 | dark | evidence/design-pass/ST-khung-hep-rong--1440--dark.png |
| ST-khung-hep-rong | 1440 | light | evidence/design-pass/ST-khung-hep-rong--1440--light.png |
| ST-khung-hep-rong | 375 | dark | evidence/design-pass/ST-khung-hep-rong--375--dark.png |
| ST-khung-hep-rong | 375 | light | evidence/design-pass/ST-khung-hep-rong--375--light.png |
| ST-khung-hep-rong | 768 | dark | evidence/design-pass/ST-khung-hep-rong--768--dark.png |
| ST-khung-hep-rong | 768 | light | evidence/design-pass/ST-khung-hep-rong--768--light.png |
| ST-khung-hoi-dong | 1024 | dark | evidence/design-pass/ST-khung-hoi-dong--1024--dark.png |
| ST-khung-hoi-dong | 1024 | light | evidence/design-pass/ST-khung-hoi-dong--1024--light.png |
| ST-khung-hoi-dong | 1440 | dark | evidence/design-pass/ST-khung-hoi-dong--1440--dark.png |
| ST-khung-hoi-dong | 1440 | light | evidence/design-pass/ST-khung-hoi-dong--1440--light.png |
| ST-khung-hoi-dong | 375 | dark | evidence/design-pass/ST-khung-hoi-dong--375--dark.png |
| ST-khung-hoi-dong | 375 | light | evidence/design-pass/ST-khung-hoi-dong--375--light.png |
| ST-khung-hoi-dong | 768 | dark | evidence/design-pass/ST-khung-hoi-dong--768--dark.png |
| ST-khung-hoi-dong | 768 | light | evidence/design-pass/ST-khung-hoi-dong--768--light.png |
| ST-khung-khong-mo | 1024 | dark | evidence/design-pass/ST-khung-khong-mo--1024--dark.png |
| ST-khung-khong-mo | 1024 | light | evidence/design-pass/ST-khung-khong-mo--1024--light.png |
| ST-khung-khong-mo | 1440 | dark | evidence/design-pass/ST-khung-khong-mo--1440--dark.png |
| ST-khung-khong-mo | 1440 | light | evidence/design-pass/ST-khung-khong-mo--1440--light.png |
| ST-khung-khong-mo | 375 | dark | evidence/design-pass/ST-khung-khong-mo--375--dark.png |
| ST-khung-khong-mo | 375 | light | evidence/design-pass/ST-khung-khong-mo--375--light.png |
| ST-khung-khong-mo | 768 | dark | evidence/design-pass/ST-khung-khong-mo--768--dark.png |
| ST-khung-khong-mo | 768 | light | evidence/design-pass/ST-khung-khong-mo--768--light.png |
| ST-khung-rong | 1024 | dark | evidence/design-pass/ST-khung-rong--1024--dark.png |
| ST-khung-rong | 1024 | light | evidence/design-pass/ST-khung-rong--1024--light.png |
| ST-khung-rong | 1440 | dark | evidence/design-pass/ST-khung-rong--1440--dark.png |
| ST-khung-rong | 1440 | light | evidence/design-pass/ST-khung-rong--1440--light.png |
| ST-khung-rong | 375 | dark | evidence/design-pass/ST-khung-rong--375--dark.png |
| ST-khung-rong | 375 | light | evidence/design-pass/ST-khung-rong--375--light.png |
| ST-khung-rong | 768 | dark | evidence/design-pass/ST-khung-rong--768--dark.png |
| ST-khung-rong | 768 | light | evidence/design-pass/ST-khung-rong--768--light.png |
| ST-khung-rong-dang-soan | 1024 | dark | evidence/design-pass/ST-khung-rong-dang-soan--1024--dark.png |
| ST-khung-rong-dang-soan | 1024 | light | evidence/design-pass/ST-khung-rong-dang-soan--1024--light.png |
| ST-khung-rong-dang-soan | 1440 | dark | evidence/design-pass/ST-khung-rong-dang-soan--1440--dark.png |
| ST-khung-rong-dang-soan | 1440 | light | evidence/design-pass/ST-khung-rong-dang-soan--1440--light.png |
| ST-khung-rong-dang-soan | 375 | dark | evidence/design-pass/ST-khung-rong-dang-soan--375--dark.png |
| ST-khung-rong-dang-soan | 375 | light | evidence/design-pass/ST-khung-rong-dang-soan--375--light.png |
| ST-khung-rong-dang-soan | 768 | dark | evidence/design-pass/ST-khung-rong-dang-soan--768--dark.png |
| ST-khung-rong-dang-soan | 768 | light | evidence/design-pass/ST-khung-rong-dang-soan--768--light.png |

## Cảnh ngữ-cảnh

- Không chụp cảnh riêng — xem dòng sổ quyết định «bỏ cảnh ngữ-cảnh — …». Bản mẫu dựng `DetailSheet` thật trên một trang
  nền giả «Theo đơn vị»; hành trình vào–ra đã được chủ kho duyệt trên hình phác ba trạng thái trong phiên.

## Vòng 2 — khuôn «dock» theo ReUI do chủ kho chỉ (09/10)

Chủ kho chỉ `ai-chat-2`, `-4`, `-6`, `-8`: trang và chat liền một bề mặt, không phí chỗ đầu. Đã chụp cả bốn (ảnh thu nhỏ
của ReUI và bản xem trước 1440 px của `ai-chat-2`). Cả bốn đặt trang trái, trợ lý phải. Bản mẫu đổi từ hai thẻ có viền
lồng trong khung (vòng 1) sang một bề mặt chia bằng một đường kẻ, mỗi ô một dòng đầu 44 px thẳng hàng.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Vòng 2: bỏ khung riêng của cả hai ô, khung ngoài bao trọn; một đường kẻ dọc chia bản nháp và Kara (khuôn `ai-chat-2`).
- Vòng 2: «Lượt n/12» rời đầu khung sang dòng đầu cột Kara cạnh dấu Kara; đầu khung còn «đơn vị · chu kỳ».
- Vòng 2: ô bản nháp nằm trong tab (khổ hẹp, điện thoại) bỏ chữ «Bản nháp» lặp tên tab, dòng phụ cắt gọn một dòng.

- Cột Kara bọc bằng cùng vỏ `KaraArtifact` với bản nháp thay `Card`: đầu, thân, chân (ô soạn) nằm trong một khung liền — sửa đúng chỗ «mất khung» chủ kho chỉ.
- Khung hẹp dùng cỡ `md` thay `sm`: ở `sm` (384 px) cột 380 px cộng lề tràn và viền phải bị cắt.
- Cột Kara kéo hết chiều cao ở khung hẹp (đứng một mình thì `flex-1`, trong hàng thì cố định bề ngang).
- Tiêu đề cột đổi «Trò chuyện» — «Kara» lặp với dấu Kara ngay dưới.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Chưa có cỡ sheet theo nội dung: bản mẫu dùng `md`/`2xl` có sẵn nên ở 1024 bản nháp chỉ còn ~270 px (`ST-khung-rong--1024`). S3 dựng cỡ `kara` trong `sheet.tsx` (trần `100% − 2rem`) — bản nháp ~560 px ở 1024 (AC-3, AC-10).
- Dưới 768 khung là ngăn kéo 88dvh (`ST-khung-dien-thoai--375`), chưa phủ toàn màn. S3 thêm biến thể phủ toàn màn trong `drawer.tsx` (AC-6).
- Bản mẫu vẽ dòng đầu và đường kẻ bằng `div` tại chỗ (vật liệu khung là scaffold): S3 dựng khung cột Kara ở tệp mới trong `packages/ui/src/components/kara/` và biến thể `docked` không viền cho `KaraArtifact` (AC-4, AC-10; giám sát: không sửa `kara/state.tsx`).
- Hộp hỏi khi đóng: lớp phủ của `AlertDialog` che hẳn khung phía sau (`ST-khung-hoi-dong`). Đề xuất giữ — người chỉ cần đọc câu hỏi; đổi lớp phủ là việc của `packages/ui` cho mọi hộp hỏi, ngoài phạm vi.
