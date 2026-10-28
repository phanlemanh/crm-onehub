---
schema_version: 1
feature: Trưởng đơn vị đi họp ngay trên bảng Họp tuần — mỗi KR hiện ghi chú mới nhất và mức đổi so với lần trước ở mọi khổ màn, cập nhật được ngay từ dòng, và ngăn KR mở từ bảng đi ‹ › theo thứ tự bảng
slug: hop-tuan-tren-bang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
design_doc: docs/superpowers/specs/2026-10-27-hop-tuan-tren-bang-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-27
---

# Acceptance Contract: hop-tuan-tren-bang

## Context

Bảng Họp tuần (sau HT1 #566) chưa đủ để họp trọn trên đó: dưới 1024px mất cột «Ghi chú mới nhất», không có mức đổi so
với lần trước, dòng chỉ mở ngăn KR, và ‹ › của ngăn đi trong một mục tiêu (`docs/findings/2026-10-22-hop-tuan/README.md`
F05, F06). Tability hiện câu phân tích mới nhất và mức đổi cho mọi KR, đi ‹ › qua mọi KR của plan, có nút check-in ở
từng KR. Vòng này làm bốn việc trên bảng Họp tuần và ngăn KR mở từ nó; mọi trạng thái tải, lỗi, rỗng của HT1 giữ nguyên.

Source input: hàng HT2 `docs/plan/lo-trinh-okr.json` · bản phạm vi `docs/plan/pham-vi-okr-hop-tuan-2210.md` mã H3, H5 ·
Cổng Đáng `_acceptance/hop-tuan-tren-bang/opportunity.md` (chủ kho 27/10 «build, giữ ngưỡng đề xuất») · bản mẫu
`/proto/hop-tuan-tren-bang`.

Đo bằng bài kiểm API trên CSDL thử, DOM dựng dữ liệu parse bằng schema thật, và phiên đo riêng của cây trên bộ OKR mẫu có
ca Họp tuần. Tiếng Việt, khổ 1440×900, 768×1024 và 375×812.

## Criteria

- AC-1: Given một bộ có KR công bố với lịch sử cập nhật thuộc chín ca — chưa lần nào · một lần · nhiều lần ở các tuần khác
  nhau · hai lần trong cùng tuần sau một lần ở tuần trước · hai lần trong cùng tuần mà trước đó không có lần nào · lần mới
  nhất bằng giá trị lần so · KR mốc · có lần mà chưa ghi chú bao giờ · ghi chú ở lần cũ hơn lần mới nhất — When gọi `okr.hopTuan`, Then mỗi dòng (cả `dangBan` lẫn `conLai`)
  mang thêm đúng bốn khoá `ghiChuNgay`, `donVi`, `giaTriMoi`, `mucDoi`, và:
  - `giaTriMoi` = `value` của lần cập nhật mới nhất, `null` khi chưa có lần nào;
  - `mucDoi` = `{ tu, den, ngayTruoc }` với `den` = `giaTriMoi`, `tu` = giá trị của lần cập nhật cuối thuộc một tuần (giờ
    Việt Nam) trước tuần của lần mới nhất, `ngayTruoc` = ngày của lần ấy; không có lần như vậy mà KR đã có từ hai lần trở
    lên thì `tu` là lần cập nhật đầu tiên của KR; chỉ một lần hay chưa lần nào thì `null` — ca hai lần trong tuần so với
    lần của tuần trước, không với lần liền trước (Hỏi-3);
  - `ghiChu` và `ghiChuNgay` là ghi chú khác rỗng mới nhất và ngày của lần mang nó, cùng `null` khi chưa có;
  - `donVi` = đơn vị của KR.

  Số khớp `OkrCheckIn` trong cơ sở dữ liệu; các khoá cũ của đầu ra giữ nguyên giá trị. (cross-layer)
- AC-2: Given bảng Họp tuần có dòng ở Đang bàn và Còn lại (Còn lại mở), When dựng ở khổ ≥1024, 768–1023 và <768, Then mọi
  dòng của cả hai phần hiện ghi chú mới nhất trong ngoặc «» kèm ngày dd/mm, hoặc «Chưa có ghi chú» khi `ghiChu` rỗng:
  ≥1024 ở cột «Ghi chú mới nhất»; 768–1023 dưới tên KR trong cột KR; <768 trong mục danh sách `Item` của KR. Ở mỗi khổ ghi
  chú và mức đổi của một dòng hiện đúng một lần (đo trên trình duyệt thật ở AC-8), và chữ ghi chú mang `translate="no"`.
- AC-3: Given dòng có `mucDoi` thuộc các ca tăng · giảm · không đổi · `null` mà đã có `giaTriMoi` · chưa có lần nào · KR
  mốc từ chưa xong sang xong · đơn vị `%` · đơn vị chữ (`đại lý`, `tỷ đồng`) · hai lần cùng tuần đầu, When dựng, Then ô mức đổi có hai dòng:
  - dòng trên: `+<chênh>` hay `−<chênh>` theo đơn vị của KR, «Chưa đổi», «Lần đầu cập nhật», hoặc «Chưa cập nhật»;
  - dòng dưới: «<trước> → <sau> · so với dd/mm» (hoặc «<sau> · so với dd/mm» khi chưa đổi, «<sau> · chưa có lần trước để
    so» khi lần đầu);

  số in qua `giaTri` của `okr/bang-kr.tsx` (KR mốc «Chưa xong → Xong»), không chuỗi nào chứa `NaN`, `undefined`, hay
  điểm tiến độ thay cho giá trị; «Lần đầu cập nhật» chỉ hiện khi KR có đúng một lần cập nhật. Ô mức đổi hiện ở mọi khổ: cột riêng từ 1024, dưới ghi chú ở khổ nhỏ hơn.
- AC-4: Given người xem cập nhật được KR K (`coNutCapNhat` đúng) và KR J thì không, When bảng dựng, Then dòng K có nút
  «Cập nhật» (tên truy cập «Cập nhật <tên K>»), dòng J không có; dòng không có ô nhập nào. When bấm nút trên dòng K, Then
  mở hộp cập nhật một KR `HopThoaiCapNhatKr` của đúng K và không mở ngăn KR; When gửi một giá trị và ghi chú, Then thêm
  đúng một `OkrCheckIn` của K, hộp đóng, đường dẫn vẫn là Họp tuần của bộ ấy (không chuyển trang), dòng K hiện ghi chú
  vừa gửi và mức đổi mới, ô «Đã cập nhật» của hàng số đổi theo. Nếu sau khi gửi K rời Đang bàn sang Còn lại đang gập
  thì Còn lại tự mở và tiêu điểm về nút «Cập nhật» của K ở vị trí mới (Hỏi-4). Nút trên dòng và nút đầu ngăn mở cùng
  một hộp. (cross-layer)
- AC-5: Given bảng có Đang bàn [A, B, C] và Còn lại [D, E], When bấm tên B trên bảng, Then ngăn KR của B mở với đếm «2/5»
  và chữ «theo thứ tự bảng»; ‹ đi A, › đi C; từ C › đi D (sang Còn lại, kể cả khi Còn lại đang gập); ở A ‹ tắt, ở E › tắt;
  bấm tên D thì đếm «4/5». Bảng chỉ một KR thì ngăn không có đếm và ‹ ›.
- AC-6: Given ngăn KR đang mở từ Họp tuần ở KR C, When tải lại trang, Then ngăn vẫn của C, vẫn đếm và đi theo thứ tự bảng.
  When đóng ngăn rồi mở KR C từ trang đơn vị, Của tôi hay Tổng quan, Then ngăn đếm và đi theo `position` trong mục tiêu,
  đúng tiêu chí AC-2 của VK7 `ngan-kr-mot-cho`. Given đường dẫn mang nguồn Họp tuần mà KR không có trong bảng (bị gỡ khỏi bộ), Then ngăn
  đi theo mục tiêu, không lỗi. Lối mở ngăn ở `hop-tuan.tsx` vẫn đi qua `useMoDienBien` — số lối mở ngăn KR trong
  `apps/app` không đổi.
- AC-7: Given ngăn KR mở từ Họp tuần ở KR B thuộc Đang bàn, When gửi cập nhật từ «Cập nhật» đầu ngăn và B rời Đang bàn
  sang Còn lại theo luật xếp, Then ngăn vẫn của B, đếm theo thứ tự bảng mới (vị trí của B trong Còn lại), ‹ › đi dòng kề
  theo thứ tự mới, và bảng sau ngăn đã xếp lại.
- AC-8: Given phiên đo trên bộ mẫu có ca Họp tuần, When mở Họp tuần của một phòng ban có dữ liệu ở 1440, 768 và 375, sáng
  và tối, mở Còn lại, rồi mở ngăn KR từ dòng thứ hai, Then:
  - mọi dòng Họp tuần có đúng một ghi chú mới nhất (hoặc «Chưa có ghi chú») và đúng một ô mức đổi đang hiện, và nút
    «Cập nhật» khi được cập nhật;
  - trang không cuộn ngang; nút «Cập nhật» của mọi dòng nằm trong khung nhìn theo chiều ngang; không nhãn, ghi chú hay mức
    đổi nào bị cắt;
  - ngăn mở từ dòng hai đếm «2/<số dòng>» và › đi dòng ba;
  - không chữ hay viền nào chìm vào nền ở cả hai nền.
- AC-9: Given bảng và ngăn, Then nhãn mới («Ghi chú mới nhất», «Mức đổi», «Chưa có ghi chú», «Chưa đổi», «Lần đầu cập
  nhật», «Chưa cập nhật», «so với», «theo thứ tự bảng») có ở tệp chữ tiếng Việt và tiếng Anh của khu OKR, không chuỗi cứng
  trong thành phần; đóng hộp cập nhật thì tiêu điểm về nút đã mở nó; ‹ › chuyển KR thì tiêu điểm về nút vừa bấm như VK7.
- AC-10: Given vòng này đã làm, When chạy eval máy của mọi hồ sơ đã ký có thước hay bài kiểm chạm `hop-tuan`, ngăn KR
  (`kr-sheet`), `okr-xem` hay nút cập nhật trên dòng, Then mọi mục không xấu hơn trên nền `origin/onehub` (mục đỏ sẵn trên
  nền in «đỏ sẵn trên nền»), và vòng này không sửa tệp thước hay bài kiểm nào của hồ sơ đã ký. Lớp phải có `ngan-kr-mot-cho`
  (đối chứng dương).

## Coverage

Quét theo trục (skill `morphological-scan`, preset entity-feature; bản quét ở `coverage-scan.md`):

- Trục A — phần của dòng: ghi chú mới nhất · mức đổi · nút Cập nhật · mở ngăn KR [thước CE: câu giao HT2 + bảng Tability
  §4 của `docs/findings/2026-10-22-hop-tuan/README.md`] → AC-2, AC-3, AC-4, AC-5.
- Trục B — khổ: <768 · 768–1023 · ≥1024 [thước CE: `bat_khi` HT2 (375, 768, 1440) + ranh `md`, `lg`] → AC-2, AC-3, AC-8.
- Trục C — lịch sử cập nhật: chưa lần nào · một lần · nhiều tuần · hai lần cùng tuần · hai lần cùng tuần đầu · không đổi
  · KR mốc · chưa ghi chú bao giờ · ghi chú cũ [thước CE: `LanCapNhat` ở `packages/db/src/okr-hop-tuan.ts` + luật tuần của `toan-canh-okr` AC-7] →
  AC-1, AC-3.
- Trục D — nơi mở ngăn: Đang bàn · Còn lại · tải lại · chỗ khác [thước CE: chín lối của VK7 E1] → AC-5, AC-6, AC-7.
- Cắt ngang: quyền cập nhật → AC-4; sau khi gửi → AC-4, AC-7; chữ, tiêu điểm → AC-9; sáng · tối → AC-8; hồ sơ đã ký →
  AC-10.
- Chân ngành: Tability, chụp thật 22/10.

## Đường đo

- «Ở 375, 768 và 1440 mọi dòng Họp tuần có ghi chú mới nhất» · số từ: bàn đo màn đếm dòng `[data-kr-hop]` và dòng có
  ghi chú hoặc «Chưa có ghi chú» ở ba khổ trên bộ mẫu, phải bằng nhau · bảo đảm bởi: AC-2, AC-8.
- «Cập nhật một KR từ bảng không phải rời bảng» · số từ: bàn đo màn bấm «Cập nhật» trên dòng, gửi, đọc đường dẫn trước và
  sau cùng số `OkrCheckIn` bằng SQL · bảo đảm bởi: AC-4.
- «‹ › trong ngăn mở từ bảng đi đúng thứ tự của bảng» · số từ: bàn đo màn mở ngăn từ dòng hai, bấm ›, so `[data-dem-kr]`
  và KR của ngăn với thứ tự `[data-kr-hop]` trên bảng · bảo đảm bởi: AC-5, AC-8.

## Out of scope

- Chế độ trình chiếu riêng (HT-C1, chân trời).
- Ô nhập trên dòng hay gửi nhiều KR một lần (Lối (b), `docs/design.md` «Bấm vào KR và cập nhật»).
- ‹ › theo thứ tự bảng khi mở ngăn từ chỗ khác ngoài Họp tuần — VK7 AC-2 giữ nguyên.
- Mức đổi của mức tự tin trên dòng (nhãn «Tụt» đã nói), lọc hay sắp bảng theo mức đổi.
- Thích và trả lời trên lần cập nhật (HT5), chi tiết một lần cập nhật (SV-C1).
- Đổi luật xếp Đang bàn / Còn lại.

## Notes

- Không loại bản ghi mới, không nút xoá, không trạng thái kết thúc — ba câu của `docs/vong-doi.md` không áp.
- Không migration: bốn khoá mới tính từ `OkrCheckIn` và KR đã đọc trong `okr.hopTuan`.
- AC-5 đổi AC-2 đã ký của VK7 chỉ ở đường mở từ Họp tuần — chủ kho cho phép 22/10 (comment trên #543, bản phạm vi
  `docs/plan/pham-vi-okr-hop-tuan-2210.md`). Không sửa hợp đồng hay thước của VK7.
- Hỏi-1 (thứ tự ‹ › qua cả bảng), Hỏi-2 (mức đổi theo giá trị của KR), Hỏi-3 (mốc so của mức đổi) và Hỏi-4 (KR đổi phần
  sau khi gửi từ dòng) chờ chủ kho ở Cổng Phạm vi — xem `decisions.jsonl`.
- Đường nền hạ tầng chưa chạy: phiên chưa ghi danh dãy V2 nên chưa xin được khoá `duong-nen`; dãy chạy trước S4.
- Design-pass đã chạy không đồng bộ trên bản mẫu `/proto/hop-tuan-tren-bang` — sổ phiên `design-pass.md`.
