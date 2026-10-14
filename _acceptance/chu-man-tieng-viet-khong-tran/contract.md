---
schema_version: 1
feature: "Breadcrumb đọc tiếng Việt với trình đọc màn hình; mô tả kiểu trường ở Cài đặt › Trường không tràn ở khổ 360"
slug: chu-man-tieng-viet-khong-tran
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-13T23:01:51Z
design_doc: docs/superpowers/specs/2026-10-13-chu-man-tieng-viet-khong-tran-design.md
---

# Acceptance Contract: chu-man-tieng-viet-khong-tran

## Context

Hàng NM4 của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2. Hai tồn đọng loại hành vi từ lượt kiểm chéo F25
(#355, `docs/plan/phan-loai-do-kiem-cheo.md`): nhãn trợ năng `aria-label="breadcrumb"` tiếng Anh ở
`packages/ui/src/components/breadcrumb.tsx`, và nhãn kiểu ở danh sách Cài đặt › Trường tràn ô khoảng 70 px ở
khổ 360 vì ô rộng cố định 72 px mà chữ là câu mô tả dài của kiểu. Hạng T2: chỉ chạm `packages/ui` và `apps/app`.

Source input: hàng NM4 (`cau_giao`, `ghi_chu`) · `opportunity.md` (Cổng Đáng ký build 12/10) ·
`docs/plan/phan-loai-do-kiem-cheo.md` · `CONTEXT.md` · design doc.

## Criteria

- AC-1: Given `Breadcrumb` của `packages/ui` dựng trong giao diện tiếng Việt, When trình đọc màn hình đọc vùng điều hướng, Then `nav` mang `aria-label="Vị trí trang"`; When giao diện tiếng Anh, Then `aria-label="Breadcrumb"`; When người gọi truyền `aria-label` riêng, Then nhãn của người gọi thắng.
- AC-2: Given mã nguồn `packages/ui/src` và `apps/app`, When quét mọi tệp `.tsx`, Then không còn thuộc tính `aria-label="breadcrumb"` viết cứng, và chuỗi nhãn breadcrumb chỉ sống trong `packages/ui/src/lib/messages.ts` (vi và en).
- AC-3: Given danh sách trường ở Cài đặt › Trường có trường của đủ mười kiểu, When dựng ở vi và ở en, Then nhãn kiểu của mỗi hàng là tên ngắn của kiểu theo bảng «Bảng tên ngắn» ở design doc (vi: «Chữ», «Chữ dài», «Số», «Ngày», «Ô đánh dấu», «Chọn», «Người», «URL», «Email», «Số điện thoại»; en: «Text», «Long text», «Number», «Date», «Checkbox», «Select», «User», «URL», «Email», «Phone») và không chứa dấu «—».
- AC-4: Given trình sửa trường, When mở ô «Kiểu», Then mỗi lựa chọn vẫn đọc câu mô tả đầy đủ hiện có (vd «Chọn — một trong danh sách cố định», «Select — one of a fixed list»); câu dài không bị đổi hay cắt.
- AC-5 (judgment): Given bản dựng thật của cây chạy trong phiên đo, có mười trường mười kiểu và một trường tên dài (từ 60 ký tự) gieo qua `fields.create`, When chụp Cài đặt › Trường ở 360 và 1280, vi và en, Then máy đo được mọi nhãn kiểu có độ rộng chữ không vượt độ rộng ô (`scrollWidth ≤ clientWidth`), mọi ô nhãn kiểu rộng ít nhất 72 px (không hẹp hơn hôm nay), mép phải mọi ô nhãn kiểu bằng nhau trong 1 px, ô nhãn kiểu nằm trọn trong hàng của nó, trang không cuộn ngang (`scrollWidth` của trang ≤ bề rộng khổ), và tên trường dài bị cắt (`scrollWidth > clientWidth`) trong khi nhãn kiểu cùng hàng trọn chữ, và `nav` breadcrumb ở chi tiết chiến dịch mang `aria-label` «Vị trí trang» (vi) và «Breadcrumb» (en); và người xem thấy nhãn kiểu trọn chữ, mép phải thẳng cột, tên trường cắt trước nhãn kiểu.

## Coverage

Quét tay theo khuôn test-matrix của `morphological-scan` (bài toán nhỏ, hai lỗi đã gọi tên).

- Trục bề mặt: nhãn trợ năng breadcrumb | nhãn kiểu ở hàng danh sách trường | câu kiểu ở ô chọn của trình sửa | câu kiểu ở dòng gợi ý trường [thước CE: mọi chỗ gọi `Breadcrumb` và `fieldTypeLabel` theo `git grep` trên 481547ec2]
- Trục ngôn ngữ: vi | en [thước CE: `Locale` của kho chỉ có hai giá trị]
- Trục khổ: 360 | 1280 [thước CE: 360 là khổ đo được lỗi ở F25; 1280 giữ nhịp cột]
- Core: breadcrumb × vi/en (AC-1, AC-2, AC-5); hàng danh sách × vi/en × 360/1280 (AC-3, AC-5); ô chọn trình sửa × vi/en (AC-4, giữ nguyên).
- Later: dòng gợi ý trường — chữ phụ đã tự cắt, không tràn ô; nhãn trợ năng tiếng Anh khác của `packages/ui`.

## Out of scope

- Nhãn trợ năng tiếng Anh khác trong `packages/ui` ngoài breadcrumb — chưa kiểm kê, không thuộc câu giao.
- Câu mô tả dài ở ô chọn kiểu và ở dòng gợi ý trường — giữ nguyên.
- Đổi bố cục hàng danh sách trường (chiều cao, thứ tự cột) — chỉ đổi chữ và độ rộng tối thiểu của ô nhãn kiểu.

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng (hàng dựng); xem sổ quyết định.

## Notes

- Hồ sơ mở từ hàng NM4 sau khi NM1 (#388) gộp vào `onehub` 481547ec2.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-14:
  - Ngoài-2: Ô nhãn kiểu ở danh sách trường vẫn chỉnh độ rộng ngay tại chỗ dùng thay vì là kiểu dựng sẵn của bộ giao diện chung; đổi kiểu nhãn sau này phải sửa nhiều chỗ hơn.
