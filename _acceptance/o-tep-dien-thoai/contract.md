---
schema_version: 1
feature: "Ô Tệp trên phiếu đọc được ở khổ điện thoại: vùng kéo thả không bóp chữ, nhãn trường hiện trọn"
slug: o-tep-dien-thoai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by: manh
approved_at: 2026-10-22T15:00:40Z
design_doc: docs/superpowers/specs/2026-10-22-o-tep-dien-thoai-design.md
---

# Acceptance Contract: o-tep-dien-thoai

## Context

Sửa sau DA19 `truong-tep` (#532, lên production 22/10). Lái tay trên www.onehub.center ở khổ 375: trong ô Tệp của phiếu
thoả thuận, vùng kéo thả `NguonKeoTha` đặt nút «Chọn tệp» cạnh khối chữ trong cột giá trị hẹp của `DetailSheetProperty`
(cột nhãn 6.5rem), nên «Kéo tệp vào đây» và mô tả xuống từng từ một dòng; nhãn trường dài bị cắt («Hợp đồng (thử D…»).
Ở 1280 gọn. Hộp tải nguồn của Kho tài liệu là người dùng thứ hai của `NguonKeoTha`.

Không có hồ sơ cơ hội: đây là sửa lỗi bố cục của một hàng đã giao, không phải việc mới của lộ trình.

Source input: câu giao của phiên mở vòng · `docs/design.md` · design doc · `coverage-scan.md`.

## Criteria

- AC-1: Given phiếu một thoả thuận có trường Tệp, ô chưa có tệp, khổ 375, When mở phiếu và cuộn tới ô Tệp, Then trong
  khung nét đứt nút «Chọn tệp» nằm trên khối chữ, dòng «Kéo tệp vào đây» nằm trên một dòng, mô tả
  «PDF, DOCX, PNG, JPG · tối đa 20 MB · 10 tệp» không quá hai dòng, và khối chữ rộng ít nhất ba phần tư khung.
- AC-2: Given cùng phiếu ở khổ 375 với trường Tệp mang nhãn dài «Hợp đồng (thử DA19 khổ hẹp)», When mở phiếu, Then nhãn
  hiện trọn chữ (không cắt), nằm trên phần giá trị, và phần giá trị bắt đầu cùng lề trái với nhãn.
- AC-3: Given phiếu ở khổ 375 với ô Tệp đã có một tệp, When mở phiếu, Then trang không cuộn ngang và dòng tệp cùng khung
  nét đứt nằm trọn trong bề ngang phiếu.
- AC-4: Given cùng phiếu ở khổ 1280, When mở phiếu, Then hàng Tệp như trước vòng: nhãn ở cột trái cạnh phần giá trị, và
  trong khung nét đứt nút «Chọn tệp» nằm cùng hàng với khối chữ.
- AC-5: Given Kho tài liệu với kho nguồn bật, When mở hộp tải nguồn ở khổ 1280 rồi ở khổ 375, Then ở 1280 nút «Chọn tệp»
  cùng hàng với khối chữ như trước vòng; ở 375 dòng «Kéo tệp vào đây» trên một dòng, mô tả không quá hai dòng, và hộp
  không cuộn ngang.
- AC-6: Given các bài DOM của vùng kéo thả và ô Tệp, When chạy chúng, Then chọn tệp, thả tệp, từ chối sai kiểu hay quá
  cỡ, khoá kèm lý do và mô tả cho trình đọc màn hình đều như trước vòng.

## Coverage

Trục, Core và cắt ở `coverage-scan.md`: nơi dùng (phiếu | hộp tải nguồn) × bề rộng chỗ chứa (375 | 1280) × trạng thái
vùng (thường | tắt | lỗi | đang kéo), cộng nhãn ngắn | dài ở phiếu. Thước CE: danh sách nơi import `NguonKeoTha`, WCAG 2.2
SC 1.4.10 Reflow, biến thể `trangThai` của thành phần. Core bốn ô → AC-1–AC-5; trạng thái tắt, lỗi, đang kéo chỉ đổi màu
nên giữ bằng bài DOM (AC-6).

## Out of scope

- Cắt chữ nhãn ở các hàng khác của phiếu — cột nhãn 6.5rem là luật chung của mọi hàng.
- Các hàng `wide` khác của phiếu (lý do thua, cuộc hẹn kế, «Cũng ở đây»).
- Chữ, kiểu tệp nhận, giới hạn cỡ và quyền mở tệp của ô Tệp.

## Notes
