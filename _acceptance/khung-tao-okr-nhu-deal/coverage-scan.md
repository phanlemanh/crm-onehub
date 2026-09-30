# Quét độ phủ — khung-tao-okr-nhu-deal

## Ngữ cảnh

- Sản phẩm: OneHub Center, khu OKR — chân sản phẩm: đào repo (`CONTEXT.md`, `docs/settings.md` «Tạo mới và hỏi lại», `create-deal-sheet.tsx`, `hop-thoai-kr.tsx`, `hop-thoai-muc-tieu.tsx`, `objective-sheet.tsx`) · chân ngành: [NGÀNH: Carbon Design System — Create flows] (hộp thoại cho một hai ô; ngăn bên khi cần thấy trang phía sau; tearsheet cho tạo phức tạp).

## Trục

- **Trục A — màn:** Tạo Mục tiêu (trang Theo đơn vị) · Sửa Mục tiêu (khung Mục tiêu) · Tạo KR (khung Mục tiêu) · Sửa KR (khung Mục tiêu, hoặc «Mở KR này» từ cột góp ý)  [thước CE: mọi chỗ gọi `HopThoaiMucTieu`/`HopThoaiKr` — SUY-TỪ-REPO: `objective-sheet.tsx`, `theo-don-vi/theo-don-vi.tsx`]
- **Trục B — phần của khung:** đầu · thân cuộn · chân (thứ tự nút, nút gửi tắt) · trạng thái mở trên URL · giữ thay đổi chưa lưu · cột góp ý (hẹp ↔ rộng)  [thước CE: `docs/settings.md` «Tạo mới và hỏi lại»; `create-deal-sheet.tsx`; [NGÀNH: Carbon Create flows]]
- **Trục C — khổ:** 1440 · 1024 · 1023 · 390  [thước CE: bộ khổ của E1/E11 `the-gop-y-okr` — SUY-TỪ-REPO: `_acceptance/the-gop-y-okr/contract.md` AC-1, AC-11]
- **Trục D — đường vào/ra:** bấm nút · mở thẳng bằng URL (tải lại) · Esc · bấm ngoài · «Huỷ» · dấu X · lưu xong · «Mở KR này»  [thước CE: luật `giu-thay-doi` của `packages/ui` và AC-8 `the-gop-y-okr`]

## Core

1. A×B(đầu, chân, thân) × C(1440, 390): bốn màn cùng khung với ngăn tạo deal — cùng phía, cùng bề ngang khi không có cột, cùng chân.
2. B(chân) cho MỌI ngăn: «Huỷ» trái · nút chính phải từ 640 px, xếp dọc nút chính trên dưới 640 — sửa một chỗ trong `packages/ui`, mọi chỗ gọi theo.
3. A × B(URL) × D(bấm, URL, đóng): mở ghi khoá trên URL, tải lại mở đúng ngăn đúng đích, đóng xoá khoá, đóng khung Mục tiêu thì khoá mất.
4. B(cột) × C(1440, 1024, 1023, 390): ngăn rộng khi cột mở, cột 380 px cạnh form từ 1024, xếp dưới form dưới 1024, không tràn ngang ở 390; đóng cột về cỡ thường.
5. B(giữ) × D(Esc, bấm ngoài, Huỷ, X, bấm trong cột): hỏi lại khi còn sửa chưa lưu; bấm trong cột không đóng ngăn.
6. D(«Mở KR này»): ngăn Mục tiêu đóng, ngăn KR đúng KR mở, URL đổi theo.
7. Không đổi dữ liệu: các bài kiểm sẵn có của hai hộp xanh sau khi chỉ đổi chỗ bám vỏ.
8. Hồ sơ đã ký bám vỏ hộp thoại (`tro-ly-okr-de-xuat`, `the-gop-y-okr`) sửa phép đo theo và ghim lại.

## Later

- Ngăn cập nhật tuần của KR (`hop-thoai-cap-nhat-kr.tsx`) và các hộp OKR khác (Căn chỉnh, Mang sang, Nhập) — xét theo luật ba ô ở lượt riêng.
- Chuyển thân ngăn tạo deal và các ngăn tạo khác sang thành phần thân ngăn mới — cùng hình, chỉ gom mã.
- Bỏ dấu X ở ngăn tạo theo [NGÀNH: Carbon Create flows] — đổi mọi ngăn tạo, không riêng OKR.

## Never

- Tearsheet (ngăn phủ gần hết màn) cho KR — Carbon dành cho tạo phức tạp nhiều bước; KR là một form.
- Đổi dữ liệu, thủ tục API, tác tử, bộ kiểm, vết, hoàn tác — ranh giới của chủ kho.

## Cross-cutting áp mọi ô Core

- Không `className` ở chỗ gọi để đổi cỡ ngăn; biến thể nằm trong `packages/ui`.
- Nhãn và tên truy cập của nút giữ nguyên để thước của 9b và `the-gop-y-okr` chỉ đổi chỗ bám.
