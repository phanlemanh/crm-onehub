---
schema_version: 1
feature: Người phụ trách KR mở Của tôi hay bấm tin nhắc 08:30, thấy các KR cần cập nhật tuần này, bấm một KR thì ngăn KR mở trong bộ OKR của nó và cập nhật bằng hộp một KR
slug: cua-toi-chi-liet-kr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-10-28-cua-toi-chi-liet-kr-design.md
approved_by:
approved_at:
---

# Acceptance Contract: cua-toi-chi-liet-kr

## Context

Chủ kho chốt «Lối (b)» ngày 24/10: cập nhật KR chỉ đi qua bộ OKR như Tability. Trên onehub `39448ab1d` còn hai
đường: bảng cập nhật hàng loạt ở Của tôi (`okr/phan-can-cap-nhat.tsx` → `BangCapNhat`, mở bằng nút hay bằng
`?tu=nhac` · `?tu=viec-cua-toi`) và hộp một KR từ ngăn KR. Tin nhắc 08:30 dẫn tới `/okr?tu=nhac`. Vòng này để lại
một đường: Của tôi chỉ liệt KR cần cập nhật, bấm một KR mở nó trong bộ OKR của nó, cập nhật bằng hộp một KR. Kèm
quyết định 25/10 (Q5 a): bỏ «Đang theo dõi (n)» khỏi Của tôi. Vòng lật hồ sơ đã ký DH3 `cua-toi-ba-phan` (#443);
các eval bị thay liệt ở design doc mục «Hồ sơ đã ký mà vòng này thay».

Source input: hàng SV1 `docs/plan/lo-trinh-okr.json` · `docs/plan/pham-vi-okr-sau-vo-khu-2410.md` §1 · ô Cổng Đáng
`_acceptance/cua-toi-chi-liet-kr/opportunity.md` · bản mẫu `/proto/cua-toi-chi-liet-kr`.

## Criteria

- AC-1: Given người phụ trách có KR chưa cập nhật tuần này ở chu kỳ đang chạy, When mở Của tôi (kể cả bằng đường dẫn
  cũ mang `?tu=nhac` hay `?tu=viec-cua-toi`), Then phần «Cần cập nhật tuần này» liệt đúng các KR đó — mỗi KR một dòng
  bấm được mang tên KR, «đơn vị · mục tiêu», số hiện tại và lần cập nhật trước — và trang không có ô nhập, không nút
  «Cập nhật N KR», không «Sửa lần gửi», không mở lượt cập nhật nào.
- AC-2: Given phần «Cần cập nhật tuần này» có KR thuộc bộ của một phòng ban, When bấm dòng KR đó, Then trình duyệt tới
  trang bộ OKR của đúng đơn vị chứa mục tiêu của KR, đúng chu kỳ của mục tiêu, và ngăn KR của chính KR đó mở sẵn với
  nút «Cập nhật». (cross-layer)
- AC-3: Given một đường `/okr/kr/<id>`, When người mở xem được KR đó, Then được chuyển như AC-2; When KR không có, đã
  lưu trữ hay người không xem được mục tiêu của nó, Then được chuyển về Của tôi với ngăn KR báo không thấy KR, không
  lộ tên đơn vị hay tên KR.
- AC-4: Given tin nhắc 08:30 loại cập nhật KR, When tin gửi qua Zalo, Slack hay hiện trong hộp thông báo web, Then một
  KR chờ → liên kết `/okr/kr/<id>` của KR đó; từ hai KR → `/okr` (Của tôi); không liên kết nào mang `?tu=`.
  (cross-layer)
- AC-5: Given danh sách việc OKR có việc «Cập nhật», When bấm nút của việc đó, Then đích theo đúng luật số KR của AC-4.
- AC-6: Given mọi màn của app, When người cập nhật một KR, Then chỉ có một đường: ngăn KR hay dòng KR › «Cập nhật» mở
  hộp cập nhật một KR; không màn nào dựng bảng cập nhật hàng loạt (`BangCapNhat`, `CapNhatTuan`) hay mở lượt cập
  nhật với lối `nhac`, `viec-cua-toi`, `cua-toi`; và một lần gửi qua hộp đó đưa KR ra khỏi «Cần cập nhật tuần này»
  và khỏi tin nhắc 08:30 kế tiếp của người đó. (cross-layer)
- AC-7: Given người dùng đang theo dõi mục tiêu của người khác, When mở Của tôi, Then không có mục gập «Đang theo dõi
  (n)»; mục «Đã bỏ» vẫn như cũ.
- AC-8: Given phần «KR bạn phụ trách» của Của tôi hay khối «KR của tôi» ở Tổng quan, When bấm tên một KR (kể cả KR
  của một chu kỳ đã qua), Then mở như AC-2, tới bộ của đúng chu kỳ của mục tiêu. (theo Hỏi-2 — chủ kho chọn giữ mở
  tại chỗ thì AC này đổi thành «mở ngăn KR ngay trên trang đang đứng», như SV6.)
- AC-9: Given phần «Cần cập nhật tuần này», When dữ liệu đang tải, tải hỏng, người không phụ trách KR nào, hay đã cập
  nhật đủ tuần, Then lần lượt thấy khung xương giữ tiêu đề phần · «Chưa tải được phần này» kèm «Thử lại» · câu không
  phụ trách KR · câu đã đủ tuần kèm lời «sửa thì mở KR đó».
- AC-10: Given các eval của hồ sơ đã ký đo hành vi vòng này bỏ (bảng ở design doc), When vòng sẵn sàng gộp, Then mỗi ô
  bị thay khai `status: not-run` + `superseded_by: cua-toi-chi-liet-kr#AC-<n>` trỏ một AC có thật của hợp đồng này, và
  design doc nêu đúng từng `<hồ sơ>/<ô>`; không ô nào trong bảng còn đo hành vi cũ mà không khai.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, gọn) trên không gian lối vào việc cập nhật một KR:

- Trục lối vào: Của tôi › Cần cập nhật · Của tôi › KR bạn phụ trách · Tổng quan › KR của tôi · tin Zalo · tin Slack · hộp thông báo web · việc
  OKR «Cập nhật» · liên kết cũ `?tu=` · ngăn KR · dòng KR trong bộ [thước CE: `grep LOI_VAO`, `duongTrongApp`,
  `openRecord({kind:"kr"})` trên onehub `39448ab1d`] → AC-1, AC-8, AC-4, AC-5, AC-1, AC-6.
- Trục số KR chờ: 0 · 1 · nhiều [thước CE: `soKr` của `viecOkr` okr-cap-nhat] → AC-9, AC-4, AC-5.
- Trục quyền và tồn tại của KR khi bấm: xem được · đã lưu trữ · đã xoá · hết quyền → AC-2, AC-3.
- Trục trạng thái tải của phần: đang tải · hỏng · rỗng · đủ · có KR → AC-9, AC-1.
- Trục khổ: 1280 · 375 → eval ui-check của AC-1, AC-2.
- Trục sau khi cập nhật: KR rời danh sách · KR rời tin nhắc kế · KR chưa cập nhật vẫn còn → AC-6.
- Trục chu kỳ của KR khi bấm: chu kỳ đang chạy · chu kỳ đã qua → AC-2, AC-8.
- Later: dọn `BangCapNhat`, `CapNhatTuan`, các giá trị `LOI_VAO` đã thôi dùng (design doc mục 7). Never: hộp cập nhật
  hàng loạt (`modals.bulkCheckin` của Tability — chủ kho bỏ 24/10).

## Đường đo

- Ngưỡng «Của tôi không còn bảng cập nhật hàng loạt» — đo bằng AC-1 (DOM) và AC-6 (quét mã).
- Ngưỡng «tin nhắc, Của tôi, ngăn KR và dòng bộ OKR đều mở cùng hộp một KR» — AC-2, AC-4, AC-5, AC-6, AC-8.
- Ngưỡng «bấm tin nhắc «N KR chờ» tới KR chứ không tới `/okr?tu=nhac`» — AC-4; số nhiều KR theo Hỏi-1.
- Ngưỡng «bỏ Đang theo dõi khỏi Của tôi» (ghi chú hàng, Q5 a) — AC-7.

## Out of scope

- Xoá `BangCapNhat`, `CapNhatTuan` và giá trị `nhac` · `viec-cua-toi` · `cua-toi` của `LOI_VAO` — năm hồ sơ đã ký đo
  chúng; dọn là hàng riêng.
- Đổi hộp cập nhật một KR, ngăn KR hay thứ tự ‹ › của ngăn (HT2, HT5, SV7 giữ).
- Đổi giờ, kênh hay điều kiện gửi tin nhắc 08:30; đổi nội dung câu tin ngoài liên kết và nhãn liên kết.
- Liệt từng KR thành một liên kết riêng trong tin nhiều KR (lối khác của Hỏi-1).
- Đường ghi lần cập nhật KR ngoài khu OKR: tra 28/10 trên `39448ab1d` không có — `guiCapNhat` chỉ được gọi ở
  `okr/hop-thoai-cap-nhat-kr.tsx` và `okr/cap-nhat-tuan/cap-nhat-tuan.tsx`; Tổng quan chỉ có danh sách việc OKR
  (AC-5) và khối «KR của tôi» (AC-8).

## Notes

- Hỏi-1 (chủ kho quyết): tin nhiều KR dẫn tới Của tôi (máy khuyên) hay tới KR đầu tiên, hay tin liệt từng KR.
- Hỏi-2 (chủ kho quyết): «KR bạn phụ trách» (Của tôi) và «KR của tôi» (Tổng quan) đổi sang mở trong bộ (máy khuyên)
  hay giữ mở ngăn tại chỗ như SV6.
- Bản chụp `apps/agent/test/fixtures/tin-nhac-truoc-tb1.json` đụng `bam-kr-mo-chi-tiet-kr` E6 — xử qua `cham-tep` ở
  S3 (design doc).
- Xoá khoá chữ thôi dùng ở `apps/app/lib/messages/okr.ts` cần `cham-tep` (tệp chữ chung, luật 7 của đợt).
