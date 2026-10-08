---
schema_version: 1
slug: kara-trang-thai-toan-crm
feature: «Ở mọi nơi, lỗi tải không còn hiện như chưa có gì; lưu trữ bản ghi có Hoàn tác»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: K6b
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

Mở từ hàng K6b của «OKR» (`docs/plan/lo-trinh-okr.json`), dãy P2 của đợt `sau-14-10`, sau K4
`khung-ban-ghi-kara` (#306, gộp 08/10 → onehub 1596ad65). Chủ kho ký `build` cho K6b cùng 15 hàng khác
lúc 2026-10-07T13:13:50Z («Ký build cả 16 hàng», luật 16 của LUAT.md đợt); ngưỡng dưới đây do máy soạn
và được giữ nguyên khi ký.

Nguồn: `.acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/khao-sat-dong-nhat.md` mục 5–6 và 12,
`.acceptance-runs/dieu-phoi-1410/nguon/khao-sat-lo-trinh/de-xuat-lo-trinh.md` hàng K6b (C4a, C4b, C4c,
C5a, bốn việc chữ).

## Vấn đề & ai gặp

«Ở mọi nơi, lỗi tải không còn hiện như chưa có gì; lưu trữ bản ghi có Hoàn tác»

Người gặp: mọi người dùng mở ngăn bản ghi và màn OKR hằng ngày. Khảo sát 04/10 trên production, kiểm lại
trên onehub 1596ad65 ngày 08/10:

- **Lỗi hiện như rỗng.** Dòng thời gian của ngăn bản ghi (`components/crm/timeline/timeline.tsx`) không xử
  lý lỗi: tải hỏng thì hiện «chưa có hoạt động» (C4a). Hoạt động web (`website-activity.tsx`) trả `null` cả
  khi tải lẫn khi lỗi (C4b). Kế hoạch của cá nhân (`contact-plans.tsx`) trả `null` khi đang tải và khi rỗng,
  nên cả mục biến mất (C4c). Người dùng không phân biệt được «chưa có gì» với «không tải được».
- **Tóm tắt tuần không nói Kara đang làm** (C5a): `khoi-tom-tat.tsx` chỉ có khung xương khi chờ, không có
  trạng thái «Kara đang…» như các chỗ Kara khác (ai-ux §7).
- **Lưu trữ bản ghi không có Hoàn tác**: lưu trữ thoả thuận, cá nhân, công ty (`record-actions.tsx`) chỉ
  hiện toast «Đã lưu trữ…»; lưu trữ đơn vị và khuôn kế hoạch trong Cài đặt thì có «Hoàn tác».
- **Ba việc chữ**: toast tạo bản ghi «<tên> added.» viết cứng tiếng Anh trong `create-contact-sheet.tsx`,
  `create-company-sheet.tsx`, `create-deal-sheet.tsx`; «Sửa Mục tiêu» (`okr-gop-y.ts`) cạnh «Sửa mục tiêu»
  (`okr.ts`); «Cảm ơn, đã ghi» (`okr-toan-canh.ts`) không nói điều gì xảy ra tiếp.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: khi một vùng con của ngăn bản ghi hay tóm tắt tuần tải hỏng, người dùng có thấy
  «không tải được» kèm «Thử lại» thay vì một khoảng trống hay «chưa có gì»; và lỡ lưu trữ một bản ghi thì
  có lấy lại được ngay bằng Hoàn tác không?
- Kết quả nào là SỐNG: lái thử người lạ gây lỗi tải ở dòng thời gian, hoạt động web, kế hoạch cá nhân và tóm
  tắt tuần, lần nào cũng gặp trạng thái lỗi có «Thử lại»; lưu trữ rồi Hoàn tác đưa bản ghi về đúng chỗ; thước
  máy đếm 0 nhánh `return null` khi tải hay lỗi trong các vùng con của ranh giới và 0 toast «added.» viết cứng.
- Kết quả nào là CHẾT: còn một vùng con của ranh giới nuốt lỗi thành rỗng hay biến mất; hoặc Hoàn tác lưu
  trữ không đưa bản ghi về trạng thái trước.
- Timebox: 1,5 ngày máy theo lộ trình, mốc 09/11.
