---
schema_version: 1
feature: Người phụ trách KR mở hộp cập nhật và thấy lần cập nhật trước — ngày, số, mức tự tin, ghi chú — cùng câu hỏi gợi ý cho ô ghi chú, trước khi gửi
slug: hop-cap-nhat-lan-truoc
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-10-22-hop-cap-nhat-lan-truoc-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-22T06:22:05Z
---

# Acceptance Contract: hop-cap-nhat-lan-truoc

## Context

Hộp cập nhật KR có điền sẵn số hiện tại và nhắc mức tự tin lần trước, nhưng không có ngày và ghi chú của lần cập nhật
trước — người viết không biết tuần trước đã hứa gì. Vòng này thêm khối «Lần cập nhật trước» đầu hộp (ngày giờ, số,
mức tự tin, ghi chú) và ba câu hỏi gợi ý dưới ô ghi chú. Dữ liệu đọc từ vết cập nhật của mục tiêu và `okr.dienBien`
sẵn có; không thêm thủ tục, không đổi khuôn đầu ra.

Source input: hàng HT3 `docs/plan/lo-trinh-okr.json` (PR #543) · bản phạm vi `docs/plan/pham-vi-okr-hop-tuan-2210.md`
mã H6 · ô Cổng Đáng `_acceptance/hop-cap-nhat-lan-truoc/opportunity.md`.

## Criteria

- AC-1: Given KR đã có lần cập nhật, When người phụ trách mở hộp cập nhật của KR từ ngăn KR, phiếu mục tiêu hay bảng
  theo đơn vị, Then không bấm thêm gì, đầu hộp có khối «Lần cập nhật trước» mang ngày và giờ (giờ Việt Nam, dạng
  `15/10, 09:30`), số theo kiểu KR (số kèm đơn vị, phần trăm, hay «Xong»/«Chưa xong» cho KR mốc), chấm và nhãn mức tự
  tin, và ghi chú nguyên văn; ghi chú không bị trình duyệt dịch. Chữ phụ dưới ô giá trị gọi số hiện tại của KR là
  «Hiện tại», nên khi số hiện tại khác số của lần cập nhật (KR có nguồn số máy) hộp không có hai số khác nhau cùng mang
  chữ «Lần trước».
- AC-2: Given KR chưa có lần cập nhật nào, When mở hộp, Then không có khối «Lần cập nhật trước» và không có câu trống
  thay nó; Given lần trước không có ghi chú, Then khối có ngày, số, mức tự tin và không có dòng ghi chú.
- AC-3: Given một KR có nhiều lần cập nhật, kể cả hai lần trong cùng một tuần và một lần do trưởng đơn vị ghi hộ, When
  mở hộp, Then ngày, số, mức tự tin và ghi chú trong khối là của đúng một lần — lần gửi sau cùng — khớp hàng
  `OkrCheckIn` mới nhất của KR trong cơ sở dữ liệu. (cross-layer)
- AC-4: Given người phụ trách vừa gửi một lần cập nhật từ hộp, When mở lại hộp của cùng KR, Then khối «Lần cập nhật
  trước» là lần vừa gửi (số, mức tự tin, ghi chú vừa nhập), không phải lần cũ hơn. (cross-layer)
- AC-5: Given hộp cập nhật đang mở, When nhìn ô ghi chú, Then dưới ô có ba câu hỏi gợi ý (tiếng Việt và tiếng Anh);
  ô vẫn một dòng, tối đa 200 ký tự; ô ghi chú trên trang «Cập nhật tuần của tôi» không đổi.
- AC-6: Given ghi chú lần trước đang tải hoặc tải hỏng, When nhìn khối, Then ngày, số và mức tự tin vẫn hiện; lúc
  tải dòng ghi chú là khung xương một dòng; lúc hỏng là câu «Không tải được ghi chú lần trước.» và nút «Thử lại» (bấm
  thì tải lại và ghi chú hiện); trong cả hai lúc người vẫn gửi được cập nhật.
- AC-7: Given hộp cập nhật của một KR có ghi chú lần trước dài 200 ký tự, When mở ở khổ 375 và 1440, Then khối và ô
  ghi chú đọc trọn — ghi chú xuống dòng, không tràn ngang, nút «Gửi cập nhật» thấy và bấm được.

## Coverage

Quét tay theo trục (không qua skill `morphological-scan`: một màn, một khối, không gian nhỏ).

- Trục A — lịch sử của KR: chưa có lần nào | một lần có ghi chú | một lần ghi chú rỗng | nhiều lần, hai lần cùng tuần
  | lần sau cùng ghi hộ [thước CE: `okr-cap-nhat.service.ts` — mỗi lần một `OkrCheckIn` và một dòng vết] → AC-1, AC-2,
  AC-3.
- Trục B — kiểu KR: số có đơn vị | phần trăm | mốc [thước CE: `KIEU_KR`, `giaTri` của `bang-kr.tsx`; bốn kiểu số còn
  lại định dạng cùng nhánh với «số có đơn vị»] → AC-1.
- Trục C — trạng thái tải ghi chú: đang tải | hỏng | xong [thước CE: `docs/design.md` mục «Chờ tải và lỗi tải»] →
  AC-6.
- Trục D — thời điểm: trước khi gửi | ngay sau khi gửi rồi mở lại → AC-4.
- Trục E — chỗ mở hộp: ngăn KR | phiếu mục tiêu | bảng theo đơn vị — cùng một `useCapNhatKr`, và `mo(mt, kr)` nhận
  kiểu `okr.objective` có `trail` ở cả ba chỗ (bảng theo đơn vị đọc `okr.objective` trước khi mở,
  `theo-don-vi/bang.tsx:258-268`), đo một chỗ là đủ → AC-1.
- Trục F — số KR đổi ngoài lần cập nhật: không | có (nguồn số máy đưa số hiện tại khác số lần cập nhật) → AC-1.
- Trục G — lúc gửi lần trước: giữa tuần | sát nửa đêm thứ Hai giờ VN (Chủ nhật giờ UTC) → AC-3.
- Cắt ngang: khổ 375 và 1440 (AC-7), tiếng Anh của chữ mới (AC-5, E5), ô ghi chú trang Cập nhật tuần không đổi (AC-5).

## Đường đo

- Thước: mở hộp của KR đã có lần cập nhật thì thấy ghi chú lần trước mà không bấm thêm; KR chưa có lần nào thì không
  có khối trống · số từ: bài kiểm DOM và API của vòng trên dữ liệu viết trước, và lượt `ui-check` trên bộ OKR mẫu
  (`bun run okr:mau`) · bảo đảm bởi: AC-1, AC-2, AC-3.

## Out of scope

- Trang «Cập nhật tuần của tôi»: không thêm khối lần trước, không thêm câu gợi ý.
- Tên người ghi lần trước và dấu «ghi hộ» trong khối.
- Ô ghi chú nhiều dòng hay nâng giới hạn 200 ký tự (`CONTEXT.md`: «một dòng ghi chú»).
- Bấm khối để mở lịch sử cập nhật của KR.

## Notes

- Không loại bản ghi mới, không nút xoá, không trạng thái kết thúc — ba câu của `docs/vong-doi.md` không áp.
- Đường nền hạ tầng chưa chạy: phiên S1–S3 ngoài dãy không xin khoá `duong-nen` (luật đợt); dãy V2 chạy trước S4.
- Hỏi-1 (câu hỏi gợi ý), Hỏi-2 (bỏ design-pass) và Hỏi-3 (chỗ đặt khối) chờ chủ kho ở Cổng Phạm vi — xem
  `decisions.jsonl`.
