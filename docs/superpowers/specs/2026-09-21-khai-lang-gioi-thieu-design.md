# Khai lang cho đoạn tiếng Anh trên tấm hồ sơ — thiết kế

Hồ sơ: `_acceptance/khai-lang-gioi-thieu/`. Gốc: `_acceptance/nhan-ung-dung-noi-tieng-viet`, AC-7 và AC-14.

## Vấn đề

Trên prod `ff3fb8bf`, đoạn giới thiệu tiếng Anh của tấm hồ sơ công ty nằm trong
`<p>` không có `lang`, dưới một tổ tiên khai `lang="vi"`. Trình đọc màn hình đọc
đoạn đó bằng giọng tiếng Việt.

## Cách làm

Mã rút nguyên từ PR #65 (nguồn: `9409080d`, `bab60026`, `1f9feb69`, `a4eaf7a8`).

- **Một nguyên thuỷ ở `packages/ui`:** `ForeignText({ lang, className, children })`
  dựng một `<span lang>`. Theo luật kho, thành phần dùng chung sống ở `packages/ui`.
- **`MetaLine` nhận phần có tiếng:** kiểu `MetaPart = { text, lang? }` thay chuỗi
  trần. Phần có `lang` đi qua `ForeignText`. Khử trùng lặp vẫn chạy trên chữ đã
  hạ chữ thường, không tính tiếng.
- **Mười chỗ gọi:** đoạn giới thiệu và ngành trên tấm hồ sơ công ty, tóm tắt trên
  tấm cá nhân, dòng thời gian, bước giai đoạn, bảng công ty, bảng điều khiển bán
  hàng, và tấm tạo thoả thuận — mọi giá trị tiếng Anh do máy ghi.
- **Hạ tầng bài kiểm:** `packages/ui` thêm `@types/bun`, `@types/jsdom` và soi hai
  tệp test bằng `check-types`; `setup-dom.ts` đặt mọi thuộc tính toàn cục
  `configurable` để tệp kiểm sau ghi đè được `window` (hệ quả: `sign-out.spec.ts`
  dùng `defineProperty`).

Loại phương án: nhận dạng tiếng theo nội dung chuỗi. Các ô này do máy ghi bằng
tiếng Anh, nên khai cứng rẻ và đúng; dữ liệu người nhập nằm ngoài phạm vi.

## Không đổi gì nhìn thấy được

`<span lang>` không đổi bố cục, chữ hay màu. Vì vậy ô này bỏ nghi thức S1-D, bỏ
đặc tả UX và bỏ khung chụp màn — mỗi việc bỏ có dòng sổ riêng.

## Đo

Hai bài kiểm của kho, chạy trong lệnh cổng: `packages/ui/test/khai-tieng.spec.tsx`
và `apps/app/test/khai-tieng-metaline.spec.tsx`. Chỗ gọi không có phép đo máy —
giới hạn có tên trong hợp đồng; răng đo chỗ gọi (`mot-duong`) ở lại PR #65.
