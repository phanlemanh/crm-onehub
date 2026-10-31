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

- AC-1: Given người đã chốt (dòng `chot_nguong` mang tên người trong sổ của hồ sơ này — ở Cổng Phạm vi hay Cổng Bằng chứng tuỳ Hỏi-1) và công cụ bỏ nhãn đã chạy, When chạy `start-scan` của kit trên đỉnh nhánh, Then không hồ sơ nào có mặt người dùng cuối còn mang cờ `nguong-chua-chot`, trừ hồ sơ có tên trong dòng sổ `ngoai_ac1` mang tên người (Hỏi-2, Hỏi-3 chọn b); bộ đọc ngưỡng của kit xếp đúng ba mẫu đối chứng. Chốt ở Cổng Bằng chứng thì AC-1 chấm lại ngay sau chốt, trước lượt ghim.
- AC-2: Given 51 `opportunity.md` so với gốc ed4e85288, When đối chiếu từng ô ngưỡng với bảng đề xuất, Then mỗi ô có dòng bảng mang đúng giá trị của dòng ấy, mỗi dòng máy soạn có nguồn số và căn cứ, dòng «chuẩn hoá» mang đúng chữ cũ của hồ sơ (đọc bằng bộ đọc rộng: nhãn «SỐNG:»/«CHẾT:», dòng thụt, nhãn sau `[đề xuất]`) và giữ nhãn cũ, ô không có dòng bảng không đổi ngoài việc bỏ nhãn, không ô nào bị gắn lại `[đề xuất]` khi trước không có, và không dòng nào ngoài bốn ô bị thêm hay gỡ.
- AC-3: Given một ô mất nhãn `[đề xuất]` so với gốc hay so với bảng, When đọc sổ quyết định của hồ sơ F39, Then sổ có dòng chốt mang tên người (`decided_by`) phủ hồ sơ ấy; máy không tự bỏ nhãn.
- AC-4: Given bảng đề xuất, When đọc mọi ô SỐNG và CHẾT máy soạn (cả ô thay đề xuất kit tự sinh), Then mỗi ô đo giá trị cho người dùng (không phải tiêu chí dựng hay eval máy), nêu một con số hay điều quan sát cụ thể, và nguồn số là thứ có thật (sự kiện ở `docs/telemetry.md`, bảng/cột ở `schema.prisma`, hay phiên nghiệm thu có số người). (judgment)
- AC-6: Given 51 hồ sơ sau khi áp bảng, When đọc Timebox bằng `timeboxDate` của kit, Then mỗi hồ sơ có một ngày không trước ngày chạy, trừ hồ sơ có tên trong dòng sổ `mien_timebox` mang tên người.
- AC-5: Given F37 đã gộp và lượt ghim lại đã chạy, When đọc dòng `repin` cuối của 51 hồ sơ, Then dòng ấy trùng `verified_commit`, có sau lần sửa `opportunity.md` của hồ sơ, và mọi bộ kiểm cùng eval máy thoát 0.

## Coverage

- Trục hồ sơ: 51 hồ sơ có mặt người dùng cuối mang cờ [thước CE: start-scan 31/10 lọc theo coNguoiDungCuoi, khớp từng tên ranh giới F39]
- Trục trạng thái ô: trống cả bốn (29) · thiếu một phần (9) · đủ chữ còn nhãn (13) [thước CE: thresholdState và bulletOf của kit]
- Trục khuôn chữ cũ: đúng khuôn · sai khuôn (8 hồ sơ «chuẩn hoá khuôn», giữ chữ và nhãn) [thước CE: bộ đọc rộng docRong so với bulletOf của kit]
- Trục nguồn của ô cũ: người viết · kit tự sinh theo mẫu «đã đạt «X» chưa?» (8 hồ sơ, máy soạn lại) [thước CE: mẫu câu của S0-MO-O]
- Trục timebox: còn hạn · đã qua · không ra ngày (17 hồ sơ — Hỏi-4) [thước CE: timeboxDate của kit]
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
