---
schema_version: 1
feature: Trưởng phòng ban mở Họp tuần của phòng đã bật Tóm tắt tuần nhưng chưa có bản, và thấy bản đầu tiên tới lúc nào
slug: tom-tat-tuan-dang-cho
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-22-tom-tat-tuan-dang-cho-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-22T06:22:25Z
---

# Acceptance Contract: tom-tat-tuan-dang-cho

## Context

Phòng ở nấc «bật» của Tóm tắt tuần mà chưa có bản thì khối Tóm tắt tuần ở Họp tuần không hiện gì: `okr.troLyTomTat`
trả `ban: null, dangSoan: false, chuaCapNhat: false` và `KhoiTomTat` trả `null` (đo 22/10). Trưởng phòng không biết
tính năng đã bật. Vòng này cho khối một trạng thái chờ: một dòng nêu thứ, ngày, giờ bản đầu tiên tới, tính từ đúng lịch
xếp của tác tử; khi Kara tạm nghỉ thì nói tạm nghỉ tới bao giờ thay vì nêu một giờ sai.

Source input: hàng HT4 `docs/plan/lo-trinh-okr.json` (PR #543) · ô Cổng Đáng `_acceptance/tom-tat-tuan-dang-cho/opportunity.md` ·
bản phạm vi `docs/plan/pham-vi-okr-hop-tuan-2210.md` mã H7.

## Criteria

- AC-1: Given phòng ở nấc bật, chu kỳ đang chạy, phòng có ít nhất một Cập nhật tuần trong cửa sổ 7 ngày, phòng chưa
  từng có bản tóm tắt nấc bật trong chu kỳ, Kara sẵn sàng, When trưởng phòng mở Họp tuần của phòng trước giờ xếp của
  tuần, Then `okr.troLyTomTat` trả `choBan: { kieu: "toi-luc", luc }` và thẻ «Tóm tắt tuần của Kara» hiện một dòng
  «Kara gửi bản tóm tắt đầu tiên vào khoảng <giờ> <thứ>, <ngày/tháng> — sáng hôm sau ngày cập nhật <thứ cập nhật>.»
  thay vì không hiện gì; mở sẵn tới đúng `luc` thì khối tự hỏi lại một lần. (cross-layer)
- AC-2: Given một chu kỳ có ngày cập nhật bất kỳ trong bảy thứ, When đọc trạng thái chờ ở bất kỳ lúc nào trong tuần,
  Then `luc` là 06:00 giờ VN (`OKR_TOM_TAT.gioXep`) của ngày ngay sau một ngày có thứ bằng ngày cập nhật, và là lần
  như vậy sớm nhất còn ở sau lúc đọc.
- AC-3: Given `luc` mà API báo cho một phòng, và phòng có Cập nhật tuần trong cửa sổ 7 ngày tính tới `luc`, When lượt
  xếp thật của tác tử (`chayXepTomTat`) chạy với `dueAt` bằng `luc`, Then phòng có đúng một việc `okr-tom-tat-tuan` nấc
  bật; chạy với `dueAt` sớm hơn `luc` một ngày thì phòng không có việc nào; tới `luc` mà phòng không có cập nhật trong
  cửa sổ thì không có việc — đúng điều kiện «sáng hôm sau ngày cập nhật» mà dòng chờ nói. Giờ xếp và thứ cập nhật của
  một ngày xếp là một luật dùng chung giữa tác tử và đường đọc. (cross-layer)
- AC-4: Given hôm nay là ngày xếp của chu kỳ (hôm qua có thứ bằng ngày cập nhật) và giờ xếp đã qua, When việc
  `okr-tom-tat-xep` có `dueAt` đúng giờ đó chưa đóng, Then `choBan` là `{ kieu: "dang-xep" }`, dòng nói «Kara đang xếp
  bản tóm tắt đầu tiên — thường có trong vài phút.» và khối tự hỏi lại theo nhịp như lúc đang soạn; việc ấy đã đóng mà
  phòng chưa có bản (phòng bật sau giờ xếp) thì `choBan` là `toi-luc` của tuần sau; hôm nay không phải ngày xếp của chu
  kỳ thì việc xếp đang mở không đổi gì.
- AC-5: Given Kara hết trần tháng hoặc chưa có khoá mô hình, When đọc trạng thái chờ, Then `choBan` là
  `{ kieu: "tam-dung" }` kèm lý do và thẻ hiện `KaraState kind="off"`: hết trần → «Kara tạm nghỉ tóm tắt tuần tới
  01/<tháng sau>.»; chưa có khoá → «Kara chưa tóm tắt được: quản trị chưa nối mô hình AI.»; không giờ, không số tiền.
  Hết trần mà lần xếp kế rơi sang tháng sau thì vẫn là `toi-luc` (trần đã mở lại).
- AC-6: Given phòng ở nấc tắt, việc tắt, đơn vị chưa bật hay chế độ ẩn, hoặc phòng đã có bản nấc bật trong chu kỳ
  (đang hiện, bị giữ hay quá 8 ngày), hoặc chu kỳ không ở pha đang chạy, hoặc khối đang ở đang soạn hay chưa cập nhật,
  When mở Họp tuần, Then kết quả `okr.troLyTomTat` không có khoá `choBan` và khối hiện đúng như trước vòng (nấc khác
  bật: không hiện gì).
- AC-7: Given máy người xem ở múi giờ bất kỳ và locale vi hoặc en, When dòng chờ hiện, Then giờ, thứ, ngày tính theo
  `Asia/Ho_Chi_Minh`; chữ lấy từ `lib/messages` có bản en; ở khổ 375 và 1440 dòng nằm trọn trong thẻ và nhìn thấy được.

## Coverage

Quét bằng skill morphological-scan, tệp `_acceptance/tom-tat-tuan-dang-cho/coverage-scan.md`.

- Trục A — nấc của phòng: tắt | việc tắt | đơn vị chưa bật | chế độ ẩn | bật [thước CE: `nacCuaDonVi`,
  `packages/db/src/okr-tro-ly-danh-muc.ts`] → AC-1, AC-6
- Trục B — lịch sử bản trong chu kỳ: chưa từng | đang hiện | bị giữ hay không làm được | quá 8 ngày [thước CE:
  `docTomTatChoNguoiXem`, `packages/db/src/okr-tom-tat.ts`; `CONTEXT.md` «Tóm tắt tuần»] → AC-1, AC-6
- Trục C — lúc mở so với lượt xếp: trước giờ | đã tới giờ, lượt chưa xong | lượt đã xong, phòng không được xếp | đang
  soạn [thước CE: `xepTrongNgay`, `apps/agent/agent/lib/okr/lich-tom-tat.ts`] → AC-2, AC-3, AC-4, AC-6
- Trục D — Kara sẵn sàng: sẵn sàng | hết trần tháng | chưa có khoá [thước CE: `quaTranChung`,
  `packages/db/src/okr-tro-ly.ts`] → AC-5
- Cross-cutting: múi giờ, locale, khổ màn → AC-7. Chân ngành: Linear Pulse (lịch tóm tắt cố định, 7:00 giờ địa
  phương) — cận kề, không thấy dòng «bản kế tới lúc nào» ở đó.

## Đường đo

- Thước: phòng bật chưa có bản thấy dòng nêu giờ bản đầu tiên · số từ: bàn đo màn `rang/do-man.mjs` (E9) và bài kiểm
  API (E2) · bảo đảm bởi: AC-1
- Thước: dòng nói đúng giờ bản tới · số từ: bài kiểm cặp chạy lượt xếp thật ở giờ đã báo (E4) · bảo đảm bởi: AC-3

## Out of scope

- «Bản kế tiếp tới lúc nào» khi phòng đã có bản nấc bật nhưng tuần mới nhất bị giữ, không làm được hay quá 8 ngày.
- Báo qua tin nhắc buổi sáng hay Zalo rằng phòng vừa bật Tóm tắt tuần.
- Đổi giờ xếp hay ngày xếp của tác tử (chỉ dời luật sẵn có sang hàm dùng chung, hành vi xếp giữ nguyên).
- Màn Họp tuần ngoài khối Tóm tắt tuần (`hop-tuan.tsx` của VK3/HT1).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Khoá `choBan` là tuỳ chọn trong `troLyTomTatOutput`: các trạng thái cũ trả đúng ba khoá như trước, để bài kiểm đã
  ký `apps/agent/test/tro-ly-okr-tom-tat-duong-do.integration.spec.ts` (so `toEqual` ba khoá ở phòng chế độ ẩn) không
  phải sửa.
- Chạm `khoi-tom-tat.tsx`, `tro-ly.service.ts`, `packages/db/src/okr-tom-tat.ts`, `packages/validation/src/okr-tom-tat.ts`,
  `apps/agent/agent/lib/okr/lich-tom-tat.ts` (theo khuyến nghị Hỏi-2)
  — các tệp này nằm trong `paths` của hồ sơ đã ký (`tro-ly-okr-tom-tat` và vài hồ sơ Kara); dãy V3 xét ghim lại hay S4
  delta cho chúng khi nhận S4.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-24:
  - Ngoài-1: dòng «Kara đang xếp» không dùng khung trạng thái chung của Kara, nên trình đọc màn hình có thể không báo là đang chờ.
  - Ngoài-2: màn tự suy thứ cập nhật từ giờ xếp, nên nếu sau này đổi luật xếp ở máy chủ mà quên chỗ này thì câu sẽ ghi sai ngày cập nhật.
  - Ngoài-4: nếu đồng hồ máy người xem chạy nhanh hơn máy chủ, dòng chờ có thể đứng nguyên sau giờ xếp tới khi tải lại trang.
  - Ngoài-5: để một trang mở qua nhiều tuần thì lần «đang xếp» thứ hai có thể không tự đổi sang bản tóm tắt tới khi tải lại.
