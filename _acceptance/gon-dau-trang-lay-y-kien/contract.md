---
schema_version: 1
feature: Trên điện thoại 390×812, người góp ý mở Lấy ý kiến và thấy nút Gửi ngay trong màn đầu, không phải cuộn
slug: gon-dau-trang-lay-y-kien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-21T01:15:13Z
design_doc: docs/superpowers/specs/2026-10-21-gon-dau-trang-lay-y-kien-design.md
---

# Acceptance Contract: gon-dau-trang-lay-y-kien

## Context

Ở 390×812, nút «Gửi» của Lấy ý kiến nằm 957px (927px trên onehub trước VK2) — dưới màn đầu, người góp ý phải
cuộn mới thấy cách gửi. Vòng này cho hàng «còn được N ý · Gửi» bám đáy vùng cuộn khi khung soạn còn khuất, theo
nếp Cập nhật tuần, mà không đổi đầu trang hay các ô của khung soạn (hình đã ký của hồ sơ khác). Kèm bản vá Hỏi-1
của VK2 cho thước `dot-hoi-y-tuong-okr` để E12 bước 5 của hồ sơ ấy xanh lại.

Source input: hàng VK13 `docs/plan/lo-trinh-okr.json`; ô cơ hội `_acceptance/gon-dau-trang-lay-y-kien/opportunity.md`.

Đo màn trên phiên đo riêng của cây, bộ OKR mẫu (`bun run okr:mau`), tiếng Việt; khổ 390×812, 375×812 và 1280×800.

## Criteria

- AC-1: Given người góp ý (thành viên thường, còn được góp) mở Lấy ý kiến ở pha góp, khổ 390×812 và 375×812, When trang tải xong và chưa cuộn, Then nút «Gửi» của khung soạn hiện trọn trong khung nhìn (mép dưới ≤ chiều cao khung nhìn, mép trên ≥ 0, không bị phần tử khác che tại tâm nút).
- AC-2: Given cùng màn ở 390×812, When người cuộn tới cuối khung soạn, Then hàng «còn được N ý · Gửi» đứng ngay sau ô «Đo bằng gì» trong dòng chảy (mép trên hàng ≥ mép dưới ô Đo bằng gì) và không che ô nào.
- AC-3: Given khung soạn ở 390×812 chưa cuộn, When tiêu điểm lần lượt vào ô «Ý», «Vì sao (tuỳ chọn)», «Đo bằng gì» (Tab hay chạm), Then mép dưới ô đang nhận tiêu điểm ≤ mép trên hàng bám — ô không bị hàng che.
- AC-4: Given ô Ý có dưới 10 ký tự, ở 390×812 và 375×812, kể cả khi đã cuộn sao cho ô Ý khuất một phần dưới hàng bám, When người bấm Gửi, Then câu lỗi hiện dưới ô Ý như hôm nay, tiêu điểm chuyển về ô Ý, cả ô Ý lẫn câu lỗi nằm trên mép trên hàng bám, và không có lệnh gửi nào đi.
- AC-5: Given 1280×800, When mở cùng màn, Then nút Gửi đứng sau ô Đo bằng gì như trên onehub (lệch dọc ≤ 1px so với đo trên `origin/onehub` cùng dữ liệu mẫu), hàng không bám (`position` khác sticky), không có viền trên (border-top-width 0).
- AC-6: Given người đã góp đủ 3 ý, hoặc không có quyền góp, When mở Lấy ý kiến, Then không có hàng bám nào (không có khung soạn), màn như hôm nay.
- AC-7: Given hàng bám ở chế độ sáng và tối, When nội dung khung soạn cuộn dưới nó, Then hàng có nền đặc theo token nền trang và viền trên, chữ phía dưới không lộ qua hàng. (judgment)
- AC-8: Given bản vá `docs/plan/vo-khu-muc-tieu/dot-hoi-y-tuong-okr-hoi-1.patch` (Hỏi-1 của VK2, chủ kho đã cho) đã áp — chỉ gỡ phép đo thanh thẻ ngang, When chạy thước `dot-hoi-y-tuong-okr`, Then mọi dòng kiểm đạt, gồm E12 bước 5 «nút Gửi nằm trọn trong màn đầu»; và cùng thước đã vá chạy trên cây `origin/onehub` chỉ hỏng đúng ở E12 bước 5.
- AC-9: Given vòng này đã làm, When chạy eval máy của `dau-trang-okr-cho-nut-hoi-kara`, `duong-ly-do-muc-tieu`, `khung-man-chung` và bài `apps/app/test/okr-hoi-y.dom.tsx` trên cây của vòng và trên cây `origin/onehub`, Then không mục nào trên cây vòng xấu hơn trên nền (mục đỏ sẵn trên nền in «đỏ sẵn trên nền»), và không thước hay bài kiểm nào của các hồ sơ ấy bị sửa — hình đã ký của hồ sơ khác không đổi.

## Coverage

- Trục khổ màn: 390×812 · 375×812 · 1280×800 [thước CE: `DO` của `man-hoi-y.mjs` và khổ chuẩn của kho] — AC-1, AC-2, AC-3, AC-5
- Trục trạng thái khung soạn: dưới màn · trong màn · lỗi · đang gửi · đủ ý · không quyền — AC-1, AC-2, AC-4, AC-6 (đang gửi: hành vi nút có sẵn, không đổi)
- Trục cách vào ô: Tab · chạm · gửi sai — AC-3, AC-4
- Trục giao diện: sáng · tối — AC-7
- Trục hồ sơ đã ký chạm cùng màn: `dot-hoi-y-tuong-okr` · `dau-trang-okr-cho-nut-hoi-kara` · `duong-ly-do-muc-tieu` · `khung-man-chung` · `okr-hoi-y.dom.tsx` — AC-8, AC-9

## Đường đo

- Thước: nút «Gửi» trong màn đầu 390×812 · số từ: `guiDay` của `dot-hoi-y-tuong-okr` E12 bước 5 (`man-hoi-y.mjs`) · bảo đảm bởi: AC-1, AC-8
- Thước: hình đã ký của hồ sơ khác không đổi · số từ: mã thoát eval máy của bốn hồ sơ ở AC-9 · bảo đảm bởi: AC-9

## Out of scope

- Gọn đầu trang Mục tiêu (hàng nút, mô tả, dòng lý do) — đổi hình đã ký của ba hồ sơ khác.
- Gập ô «Vì sao», «Đo bằng gì» sau một nút mở — đổi hình đã ký của `okr-hoi-y.dom.tsx`.
- Đổi màn Cập nhật tuần sang thành phần hàng bám dùng chung.
- Huy hiệu số ý kiến của mục Lấy ý kiến trên thanh bên (hàng `huy-hieu-hoi-y-co-thuoc`).
- Hàng công cụ Bộ OKR một dòng khi có thanh bên (hàng `hang-cong-cu-bo-okr-mot-dong`).

## Notes

- Hàng bám là thành phần mới trong `packages/ui` (bậc 5 của `docs/design.md`); tra bậc 1–4 ghi ở mô tả PR. `SaveBar`
  (`packages/ui/src/components/save-bar.tsx`) là thanh lưu nổi cho thay đổi chưa lưu, không phải hàng hành động.
