---
schema_version: 1
feature: Trưởng đơn vị bấm Họp tuần và vào thẳng bảng của bộ OKR mình dẫn, thấy hàng số của tuần ở đầu; bộ chưa có KR công bố hay chu kỳ chưa chạy thì màn nói đúng lý do và chỉ sang đơn vị có KR
slug: hop-tuan-mo-dung-bo
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
design_doc: docs/superpowers/specs/2026-10-23-hop-tuan-mo-dung-bo-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-24
---

# Acceptance Contract: hop-tuan-mo-dung-bo

## Context

Production 22/10: bấm Họp tuần mà URL không kèm đơn vị thì bảng là của bộ OneHub. Bộ này không có KR công bố, nên màn
hiện «0/0 KR» và «Chưa có lần cập nhật nào để bàn», trong khi phòng của người xem đã cập nhật đủ
(`okr-xem.service.ts:160-161, :586`). Vòng này làm ba việc:

- Họp tuần không kèm đơn vị mở bộ người xem dẫn: máy chủ chuyển hướng. Không thêm mục «Họp tuần» trên thanh bên —
  như Tability, người ta vào bộ OKR của mình rồi bấm thẻ con Họp tuần (chủ kho chốt ở Cổng Phạm vi 24/10).
- Đầu thẻ Họp tuần có hàng bốn số của tuần.
- Màn rỗng nói đúng lý do và chỉ sang đơn vị trực thuộc có KR.

Viết trên mã của VK3 `trang-bo-okr` (đã ký, chưa gộp); S3 chờ VK3 gộp `onehub`.

Source input: hàng HT1 `docs/plan/lo-trinh-okr.json` (PR #543) · bản phạm vi `docs/plan/pham-vi-okr-hop-tuan-2210.md`
mã H1, H2, H4 · ô Cổng Đáng `_acceptance/hop-tuan-mo-dung-bo/opportunity.md`.

Đo bằng bài kiểm API, DOM dựng dữ liệu riêng, và phiên đo riêng của cây trên bộ OKR mẫu có thêm ca Họp tuần. Tiếng
Việt, khổ 1440×900 và 375×812.

## Criteria

- AC-1: Given trưởng một phòng ban có KR công bố và đã cập nhật trong chu kỳ đang chạy, When mở
  `/okr/bo-okr?xemOkr=hop-tuan`, `/okr/bo-okr?xemOkr=hop-tuan&kyOkr=<id>` hay `/okr/theo-don-vi?xemOkr=hop-tuan`,
  Then trình duyệt tới `/okr/bo-okr` mang `donOkr=pb:<phòng ban ấy>`, `xemOkr=hop-tuan` và `kyOkr` như URL vào (có
  thì giữ, không thì không thêm); dòng vị trí là «Bộ OKR › <tên phòng ban>» (tiêu đề trang giữ «Mục tiêu» như cả
  khu, theo V1-19); trang không lúc nào hiện bảng của bộ OneHub. Bảng là của
  đúng phòng ban ấy: số đã cập nhật và tổng KR khớp số `OkrCheckIn` tuần này và số KR công bố trong cơ sở dữ liệu.
  (cross-layer)
- AC-2: Given ma trận người xem, When hàm chọn bộ `boHopTuan` chạy trên `okr.access` và `org.tree` thật của người
  xem, và khi mở Họp tuần không kèm đơn vị, Then bộ mở ra là:
  - trưởng bộ phận → bộ phận ấy;
  - người dẫn cả một bộ phận và một phòng ban → bộ phận;
  - người dẫn hai phòng ban → phòng ban đứng trước theo thứ tự cây;
  - quản trị chương trình không dẫn đơn vị nào → bộ OneHub;
  - quản trị đồng thời trưởng một phòng ban → phòng ban ấy;
  - thành viên không dẫn đơn vị, có phòng ban chính → phòng ban chính;
  - thành viên không có phòng ban chính → bộ OneHub;
  - người từng là trưởng nhưng đã rời phòng ban → không tính là dẫn (`okr.access` của họ không còn đơn vị ấy).

  Và URL có `donOkr` — kể cả `donOkr=goc` — không bao giờ bị chuyển: `donOkr=goc&xemOkr=hop-tuan` vẫn mở Họp tuần
  của bộ OneHub với mọi người xem. (cross-layer)
- AC-3: Given trưởng phòng ban P, chu kỳ đang chạy, When đi theo hai đường vào bộ của mình — (a) thanh bên «Bộ OKR»
  → lọc «Tôi dẫn» → bấm bộ P → bấm thẻ con «Họp tuần»; (b) «Của tôi» → thẻ «đơn vị bạn dẫn» P → bấm thẻ con «Họp
  tuần» — Then cả hai tới Họp tuần của bộ P: URL `/okr/bo-okr` mang `donOkr=pb:P`, `xemOkr=hop-tuan` và `kyOkr` của
  chu kỳ đang xem, dòng vị trí là «Bộ OKR › P». Thanh bên khu Mục tiêu không có mục «Họp tuần»: nhóm OKR giữ đúng «Bộ OKR», «Lấy ý
  kiến», và không liên kết nào trên thanh bên mang `xemOkr`.
- AC-4: Given thẻ Họp tuần của một bộ có KR công bố, When trang tải xong, Then đầu thẻ (trên khối Tóm tắt tuần và
  bảng) có đúng một hàng bốn ô `[data-hang-so-hop]`, theo thứ tự:
  - Đã cập nhật `daCapNhat/tongKr`, mô tả «Tuần dd/mm»;
  - Đáng bàn = số dòng `dangBan`;
  - Tự tin thấp = số dòng có mức tự tin mới nhất là thấp;
  - Ngày còn lại.

  Bốn giá trị khớp đầu ra `okr.hopTuan` và chu kỳ đang xem. Dòng chữ nhỏ `[data-tom-tat-hop]` không còn. Thẻ OKR,
  Việc, Sơ đồ, Chấm điểm không có `[data-hang-so-hop]`.
- AC-5: Given hàm dựng ô `oSoHop`, When:
  - chu kỳ chưa tới ngày bắt đầu;
  - hôm nay là ngày kết thúc;
  - đã qua ngày kết thúc;
  - không dòng nào tự tin thấp;
  - mọi dòng chưa có mức tự tin;

  Then Ngày còn lại lần lượt là «—» kèm «Bắt đầu dd/mm», «1», «0» kèm «Đã kết thúc dd/mm». Tự tin thấp là «0» ở hai
  ca sau. Không ô nào in `NaN`, `undefined` hay số âm. Ngày tính theo lịch giờ Việt Nam, cả lúc máy chạy ở UTC.
- AC-6: Given chu kỳ đang chạy và một bộ không có KR công bố, When mở thẻ Họp tuần của bộ ấy, Then màn có câu
  «<tên bộ> chưa có KR công bố trong <tên chu kỳ>.», không có hàng số, không có «0/0», không có câu «Chưa có lần cập
  nhật nào để bàn».

  Ở bộ OneHub, dưới câu là danh sách «Đơn vị có KR», theo thứ tự cây, gồm đúng các bộ phận và phòng ban chưa xếp
  vào bộ phận có ít nhất một KR công bố mà người xem được thấy. Bộ phận chỉ có KR ở phòng ban con vẫn được liệt. Mỗi mục có tên, số KR và số đã cập nhật tuần này khớp cơ sở dữ liệu, và là liên kết tới
  Họp tuần của đơn vị ấy giữ `kyOkr`.

  Mục tiêu hạn chế người xem không thấy thì không được đếm và không làm hiện tên đơn vị. Mỗi mục được liệt mở ra Họp tuần có
  KR: tổng KR và số đã cập nhật của Họp tuần ấy bằng đúng hai số in trên mục. Bộ phận hay phòng ban rỗng (Họp tuần của
  bộ phận gồm cả phòng ban con, nên con cũng rỗng), hoặc bộ OneHub không đơn vị nào có KR, thì chỗ danh sách là liên
  kết «Xem mọi bộ OKR» về trang danh sách giữ `kyOkr`. (cross-layer)
- AC-7: Given thẻ Họp tuần và đầu ra `okr.hopTuan` thật, When:
  - chu kỳ ở pha lập kế hoạch hoặc chưa tới ngày bắt đầu;
  - bộ có KR công bố mà chưa KR nào có lần cập nhật;
  - bộ có lần cập nhật;

  Then lần lượt:
  - lý do `chu-ky-chua-chay`: màn có câu «Chu kỳ <tên> bắt đầu dd/mm — Họp tuần có số từ tuần đầu của chu
    kỳ.», không hàng số;
  - lý do `chua-ai-cap-nhat`: màn có hàng số `0/<tongKr>` và câu «Chưa có lần cập nhật
    nào để bàn»;
  - không lý do rỗng: màn có hàng số và bảng.

  `okr.hopTuan` trả `tuanDau` = `false` cho bộ không có KR công bố, và màn xét `tongKr` = 0 trước `tuanDau`: bộ ấy
  đi nhánh AC-6, không bao giờ nhánh `chua-ai-cap-nhat`. Đầu ra `okr.hopTuan` không thêm, không bớt khoá nào.
  (cross-layer)
- AC-8: Given thẻ Họp tuần, When `okr.hopTuan` đang tải và khi nó lỗi, Then:
  - lúc tải: hàng số là bốn ô khung xương cùng hình; tiêu đề trang, dòng vị trí và hàng thẻ con còn nguyên;
  - lúc lỗi: vùng lỗi có nút Thử lại, bấm thì gọi lại `okr.hopTuan`.

  - nhánh bộ chưa có KR công bố, `okr.toanCanh` đang tải: câu lý do hiện ngay, chỗ danh sách là khung xương;
  - `okr.toanCanh` lỗi: câu lý do vẫn hiện, chỗ danh sách là vùng lỗi có Thử lại.

  Khi đọc `okr.access` hay `org.tree` ở máy chủ lỗi, trang không âm thầm mở bộ OneHub.
- AC-9: Given phiên đo trên bộ mẫu có ca Họp tuần, When mở thẻ Họp tuần của một phòng ban có dữ liệu và của một bộ
  chưa có KR công bố, ở khổ 1440 và 375, sáng và tối, Then:
  - ở 1440 bốn ô một hàng, ở 375 lưới hai cột hai hàng;
  - không nhãn ô nào bị cắt chữ, trang không cuộn ngang;
  - danh sách «Đơn vị có KR» đọc được, liên kết thấy được;
  - không chữ hay viền nào chìm vào nền.
- AC-10: Given vòng này đã làm, When chạy eval máy của mọi hồ sơ đã ký có thước hay bài kiểm chạm `hop-tuan`,
  `/okr/bo-okr` hay thanh bên khu Mục tiêu, Then mọi mục không xấu hơn trên nền `origin/onehub` (mục đỏ sẵn trên nền in
  «đỏ sẵn trên nền»). Mọi thay đổi trong thước của các hồ sơ ấy chỉ thuộc một lớp: đổi kỳ vọng «`xemOkr` trần mở bộ
  OneHub» thành «mở bộ của người xem» (VK3 E10).

  Mỗi hồ sơ bị đổi thước có một dòng sổ `fix` mang `decided_by` chủ kho và cặp đo hai chiều.

## Coverage

Quét theo trục (skill `morphological-scan`, preset entity-feature; bản quét ở `coverage-scan.md`):

- Trục A — người xem: trưởng phòng ban · trưởng bộ phận · dẫn bộ phận và phòng ban · dẫn hai phòng ban · quản trị
  không dẫn · quản trị kiêm trưởng · thành viên có phòng ban chính · thành viên không phòng ban · trưởng đã rời
  [thước CE: `okr-access.service.ts:80-104`] → AC-2.
- Trục B — đường vào: thanh bên «Bộ OKR» › Tôi dẫn › bộ › thẻ con · Của tôi › đơn vị bạn dẫn › thẻ con · thẻ con · liên kết trần `bo-okr` · liên kết cũ `theo-don-vi` · có/không `kyOkr` ·
  `donOkr=goc` tường minh · tin sáng `donOkr=pb:` → AC-1, AC-2, AC-3. Thẻ con và tin sáng luôn mang `donOkr` nên
  thuộc luật «không chuyển» của AC-2.
- Trục C — trạng thái bộ: chu kỳ chưa chạy · chưa KR công bố (có / không đơn vị trực thuộc có KR) · có KR chưa cập
  nhật · có cập nhật, không dòng đáng bàn · có cập nhật và dòng đáng bàn → AC-4, AC-6, AC-7.
- Cắt ngang:
  - tải (đang tải · lỗi `hopTuan` · lỗi `toanCanh` · lỗi đọc `okr.access` hay `org.tree`) → AC-8;
  - ngày của chu kỳ (trước bắt đầu · giữa · ngày cuối · đã qua) → AC-5;
  - quyền thấy (mục tiêu hạn chế ở đơn vị trực thuộc) → AC-6;
  - khổ 1440 · 375, sáng · tối → AC-9;
  - hồ sơ đã ký → AC-10.
- Chân ngành: Tability, chụp thật 22/10 (`docs/plan/pham-vi-okr-hop-tuan-2210.md`).

[CE chưa kiểm chứng] Hai ca không đo được trên bộ mẫu, chỉ đo bằng bài kiểm API: «dẫn hai phòng ban» và «trưởng đã
rời».

## Đường đo

- «Trưởng phòng mở Họp tuần từ thanh bên, từ thẻ con hay từ liên kết không kèm đơn vị đều tới bộ mình dẫn» · số từ:
  URL cuối và dòng vị trí đọc trong phiên đo — ba liên kết gõ thẳng, đường thanh bên «Bộ OKR» › Tôi dẫn › bộ mình › thẻ
  con Họp tuần, và đường Của tôi › đơn vị bạn dẫn › thẻ con Họp tuần; bài kiểm API của `boHopTuan` cho năm vai · bảo
  đảm bởi: AC-1, AC-2, AC-3. «Từ thanh bên» đọc là qua mục «Bộ OKR» của thanh bên, như Tability đi qua plan — chủ kho
  chốt 24/10 bỏ mục «Họp tuần» riêng. Thẻ con giữ bộ đang xem (VK3 AC-5) — Hỏi-2.
- «Không còn màn "0/0 KR" với câu "chưa có lần cập nhật" khi bộ của người xem đã có cập nhật» · số từ: chữ của màn
  trong phiên đo (bàn đo đếm chuỗi «0/0» và câu `tuanDau` trên bộ có cập nhật, phải 0), và bài kiểm `tuanDau` · bảo
  đảm bởi: AC-1, AC-6, AC-7.

## Out of scope

- Các kiểu xem khác (OKR, Việc, Sơ đồ, Chấm điểm) không kèm `donOkr` — vẫn mở bộ OneHub như VK3.
- Nhớ bộ người xem chọn lần trước.
- Mục «Họp tuần» riêng trên thanh bên (chủ kho bỏ 24/10 — đường vào như Tability, qua bộ OKR).
- Ô số bấm được để lọc bảng, số tuần trước hay xu hướng trong ô.
- Ghi chú mới nhất trên dòng, cập nhật từ dòng, ‹ › theo thứ tự bảng (HT2); chế độ trình chiếu (H9).
- Đổi tin sáng hay thông báo trong app (`apps/agent`).

## Notes

- Không loại bản ghi mới, không nút xoá, không trạng thái kết thúc — ba câu của `docs/vong-doi.md` không áp.
- Không migration, không thủ tục mới: bộ mặc định tính ở `page.tsx` từ `okr.access` và `org.tree`; danh sách đơn vị có
  KR đọc từ `okr.toanCanh`; lý do rỗng tính ở màn. API đổi đúng một chỗ: `tuanDau` của bộ rỗng thành `false`.
- Đường nền hạ tầng chưa chạy: phiên S1 ngoài dãy không giữ khoá `duong-nen` của đợt; dãy V2 chạy trước S4.
- Hỏi-1 (quản trị kiêm trưởng), Hỏi-2 (đổi AC-7 của VK3 và hai thước của nó; thẻ con giữ bộ đang xem), Hỏi-3 (VK8
  AC-3 và hàng số Họp tuần), Hỏi-4 (ô «Tự tin thấp») chờ chủ kho ở Cổng Phạm vi — xem `decisions.jsonl`.
- Design-pass đã chạy theo lời chủ kho ở Cổng Phạm vi (24/10): bản mẫu `/proto/hop-tuan-mo-dung-bo`, sổ phiên
  `design-pass.md`.
