# Quét không gian AC — o-tep-dien-thoai

Preset: `test-matrix` (Zwicky box, bốn bước).

## Ngữ cảnh

- Sản phẩm: CRM OneHub — chân sản phẩm: đào repo (hai nơi dùng `NguonKeoTha` theo `grep`, `docs/design.md` mục «Trường»).
- Chân ngành: WCAG 2.2 SC 1.4.10 Reflow — nội dung đọc được ở 320 CSS px mà không cuộn hai chiều; vùng kéo thả của
  ReUI `c-file-upload` (gốc của `NguonKeoTha`, hồ sơ `nguon-keo-tha-reui`) xếp nút và chữ thành cột ở chỗ hẹp.

## Trục

- A — Nơi dùng: ô Tệp trên phiếu (cột giá trị của `DetailSheetProperty`) | hộp tải nguồn Kho tài liệu (`Dialog`)
  [SUY-TỪ-REPO: apps/app/components/crm/fields/o-tep.tsx, apps/app/app/(app)/[slug]/tai-lieu/hop-tai-nguon.tsx]
  [thước CE: danh sách tệp import `@crm/ui/components/nguon-keo-tha` — hai nơi dùng, hai bài DOM]
- B — Bề rộng chỗ chứa vùng: hẹp (khổ 375) | rộng (khổ 1280)
  [thước CE: NGÀNH WCAG 1.4.10 Reflow; hai khổ đo của `_acceptance/truong-tep/rang/do-man.mjs`]
- C — Trạng thái vùng: thường | tắt kèm lý do | lỗi | đang kéo
  [SUY-TỪ-REPO: packages/ui/src/components/nguon-keo-tha.tsx — biến thể `trangThai`]
- D — Nhãn trường (chỉ A = phiếu): ngắn | dài [SUY-TỪ-REPO: apps/app/components/detail-sheet.tsx — `PROPERTY_LABEL` cắt chữ]

## Không gian

2 × 2 × 4 = 16 ô, cộng 2 ô nhãn của phiếu. Ô «hộp tải nguồn × tắt» có nghĩa (nút mở hộp bị khoá trước, nên hộp không mở
được khi tắt) → gạch: không tới được.

## Core

1. Phiếu × hẹp × thường × nhãn dài — ô hỏng người dùng đã thấy trên production 22/10.
2. Phiếu × rộng × thường — không được lùi ở 1280, nơi hôm nay đã gọn.
3. Hộp tải nguồn × hẹp × thường — người dùng thứ hai của cùng thành phần, đổi chung một chỗ.
4. Hộp tải nguồn × rộng × thường — không được lùi.

## Later

- Phiếu × hẹp × tắt / lỗi / đang kéo — `trangThai` chỉ đổi màu viền và nền, không đổi bố cục; dòng lý do tắt và lỗi
  nằm ngoài khung nét đứt. Hành vi các trạng thái này giữ bằng bài DOM (AC-6).

## Never

- Bản mẫu `/proto` riêng cho vùng kéo thả — màn thật đo được ở cả hai khổ, proto chỉ là bản sao của nó.

## Cross-cutting áp mọi ô Core

- Không cuộn ngang ở khổ 375.
- Hành vi chọn tệp, thả tệp, khoá và mô tả cho trình đọc màn hình không đổi.
