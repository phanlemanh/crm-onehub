---
schema_version: 1
feature: Mỗi hồ sơ có mặt giao diện chờ Cổng Giá trị có ngưỡng điền xong, để phiên nghiệm thu mở được
slug: nguong-gia-tri-mat-giao-dien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: draft
design_doc: docs/superpowers/specs/2026-10-31-nguong-gia-tri-mat-giao-dien-design.md
approved_by:
approved_at:
---

# Acceptance Contract: nguong-gia-tri-mat-giao-dien

## Context

`start-scan` ngày 31/10 trên `onehub` ed4e85288: 67 hồ sơ mang cờ «ngưỡng chưa chốt», 51 trong số đó có mặt người dùng
cuối (đúng 51 tệp `opportunity.md` ở ranh giới F39). Ngưỡng còn trống hay còn nhãn `[đề xuất]` thì skill
`uat-session` không mở được phiên nghiệm thu. Đếm theo ô: 29 hồ sơ trống cả bốn ô, 9 hồ sơ thiếu một phần, 13 hồ sơ đã
đủ chữ nhưng còn nhãn `[đề xuất]`. Luật 41 của đợt: máy đề xuất, người chốt; không đổi ngưỡng sau khi đã có số đo.

Source input: hàng F39 của `docs/plan/lo-trinh-okr.json`; ô cơ hội `_acceptance/nguong-gia-tri-mat-giao-dien/opportunity.md`;
bảng đề xuất `_acceptance/nguong-gia-tri-mat-giao-dien/bang-de-xuat.md` (bản máy đọc: `rang/bang-de-xuat.json`).

## Criteria

- AC-1: Given ngưỡng đã chốt, When chạy `start-scan` của kit trên đỉnh nhánh, Then không hồ sơ nào có mặt người dùng cuối còn mang cờ `nguong-chua-chot`; và bộ đọc ngưỡng của kit xếp đúng ba mẫu đối chứng (ô trống → chưa chốt, `[đề xuất]` → đề xuất, đủ chữ → chốt).
- AC-2: Given 51 `opportunity.md` so với gốc ed4e85288, When đối chiếu từng ô ngưỡng với bảng đề xuất, Then ô máy soạn khớp bảng từng chữ (có hay không nhãn `[đề xuất]`), mỗi dòng bảng có nguồn số và căn cứ, ô đã có chữ không đổi ngoài việc bỏ nhãn, và không dòng nào ngoài bốn ô đổi — trừ hồ sơ «viết lại khuôn» khai tên trong bảng.
- AC-3: Given một ô mất nhãn `[đề xuất]` so với gốc hay so với bảng, When đọc sổ quyết định của hồ sơ F39, Then sổ có dòng chốt mang tên người (`decided_by`) phủ hồ sơ ấy; máy không tự bỏ nhãn.
- AC-4: Given bảng đề xuất, When đọc mọi ô SỐNG và CHẾT máy soạn, Then mỗi ô nêu một con số hay điều quan sát cụ thể, và nguồn số là thứ có thật trong kho (sự kiện ở `docs/telemetry.md`, bảng dữ liệu, hay phiên nghiệm thu có số người). (judgment)
- AC-5: Given F37 đã gộp và lượt ghim lại đã chạy, When đọc dòng `repin` cuối của 51 hồ sơ, Then dòng ấy trùng `verified_commit`, có sau lần sửa `opportunity.md` của hồ sơ, và mọi bộ kiểm cùng eval máy thoát 0.

## Coverage

- Trục hồ sơ: 51 hồ sơ có mặt người dùng cuối mang cờ [thước CE: start-scan 31/10 lọc theo coNguoiDungCuoi, khớp từng tên ranh giới F39]
- Trục trạng thái ô: trống cả bốn (29) · thiếu một phần (9) · đủ chữ còn nhãn (13) [thước CE: thresholdState và bulletOf của kit]
- Trục khuôn chữ cũ: đúng khuôn · sai khuôn (9 hồ sơ «viết lại khuôn») [thước CE: nhãn ngoài bốn nhãn của khuôn hay dòng thụt]
- Trục người quyết: máy đề xuất · người chốt (AC-3) [thước CE: luật 41 của đợt]
- Trục hồ sơ đã có quyết khác: loc-don-vi-khong-tu-dong, lo-trinh-ten-va-build — Hỏi-2, Hỏi-3

## Đường đo

- Thước: số hồ sơ có mặt người dùng cuối mang cờ ngưỡng chưa chốt · số từ: `start-scan` qua thước E1 · bảo đảm bởi: AC-1

## Out of scope

- 16 hồ sơ mang cờ mà không có mặt người dùng cuối — thuộc B6 (khai «không đo được», PR riêng).
- Đọc số thật cho các ngưỡng — việc của phiên nghiệm thu sau khi chốt, không phải việc dựng.
- Sửa các mục khác của `opportunity.md` (Vấn đề, Giả định, Cổng Đáng).
- Sửa kit để nhận nhãn rút gọn «SỐNG:», «CHẾT:» — chuẩn hoá chữ ở hồ sơ thay vì nới bộ đọc.

## Notes

- Sửa `opportunity.md` của hồ sơ đã ký làm hồ sơ hoá cũ (thử 31/10 bằng pre-merge-check trên bản sao: VIOLATION [gon-dau-trang-lay-y-kien] evidence is stale). 51 hồ sơ đi chung lượt ghim sau F37 với F38 và nhánh dot-2.
- `va-lo-ro-vai-chi-okr`: nhánh dot-2 sửa dòng Timebox ngay cạnh ba ô F39 bỏ nhãn — F39 gộp sau dot-2.
