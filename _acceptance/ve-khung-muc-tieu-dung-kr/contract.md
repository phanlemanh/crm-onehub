---
schema_version: 1
feature: Trưởng đơn vị đi ‹ › trong ngăn KR mở từ bảng Họp tuần sang một KR thuộc mục tiêu khác, bấm «Về khung mục tiêu» và mở đúng mục tiêu của KR đang xem
slug: ve-khung-muc-tieu-dung-kr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-30T03:41:40Z
design_doc: _acceptance/ve-khung-muc-tieu-dung-kr/design.md
---

# Acceptance Contract: ve-khung-muc-tieu-dung-kr

## Context

Ngăn KR mở từ bảng Họp tuần đi ‹ › theo thứ tự bảng (HT2 `hop-tuan-tren-bang` AC-5), qua KR của nhiều mục tiêu. Ngăn
xếp bản ghi trên đường dẫn giữ mục tiêu của KR đầu tiên ở tầng dưới, nên sau khi sang KR của mục tiêu khác, nút quay lại
ở đầu ngăn mở mục tiêu của KR đầu, và liên kết tên mục tiêu ở dòng phụ đề chồng thêm một khung thay vì quay về. Vòng này
giữ tầng dưới là mục tiêu của KR đang xem sau mỗi lần ‹ ›.

Source input: hàng HT6 `docs/plan/lo-trinh-okr.json` · Cổng Đáng `_acceptance/ve-khung-muc-tieu-dung-kr/opportunity.md`
(chủ kho 30/10, `build`) · mục Ngoài-4 ở Cổng Bằng chứng HT2, sổ `_acceptance/hop-tuan-tren-bang/decisions.jsonl`
`d-20261028T114723Z-27`.

Đo bằng DOM dựng `HopTuan` và `RecordSheetHost` thật trên dữ liệu parse bằng schema thật; đọc đường dẫn và khung đang mở.

Dữ liệu chung của mọi tiêu chí: bảng Họp tuần thứ tự A (mục tiêu mt-1) · B (mt-2) · C (mt-1) ở Đang bàn, D · E (mt-1) ở
Còn lại; mt-1 có KR A, C, D, E; mt-2 có KR B.

## Criteria

- AC-1: Given ngăn KR A mở từ bảng Họp tuần (đường dẫn `record=objective:mt-1,kr:A`, đếm «1/5 · theo thứ tự bảng»), When
  bấm › sang B, Then đường dẫn là `record=objective:mt-2,kr:B`, `thuTuKr` giữ nguyên, đếm «2/5»; When bấm nút quay lại ở
  đầu ngăn, Then khung mục tiêu mt-2 mở (không phải mt-1) và đường dẫn là `record=objective:mt-2`.
- AC-2: Given ngăn KR B mở sau một lần › từ A như AC-1, When bấm ‹, Then đường dẫn là `record=objective:mt-1,kr:A`; When
  từ A bấm › hai lần (qua B tới C), Then đường dẫn là `record=objective:mt-1,kr:C` và nút quay lại mở khung mt-1.
- AC-3: Given ngăn KR B mở sau một lần › từ A, When nhìn dòng phụ đề, Then liên kết tên mục tiêu trỏ mt-2; When bấm nó,
  Then khung mt-2 mở và đường dẫn là `record=objective:mt-2` — một mục, không chồng thêm khung. And Given KR B không tải
  được (máy chủ trả không tìm thấy), When từ ngăn A bấm › rồi bấm nút «Về khung mục tiêu» của trạng thái không thấy KR,
  Then khung mt-2 mở và đường dẫn là `record=objective:mt-2`.
- AC-4: Given ngăn KR C mở từ bảng, When bấm › sang D (cùng mt-1), Then đường dẫn là `record=objective:mt-1,kr:D` và nút
  quay lại mở khung mt-1 — đi trong cùng mục tiêu không đổi tầng dưới.
- AC-5: Given đường dẫn chép tay có tầng dưới không phải mục tiêu của KR trước —
  `record=objective:mt-2,kr:C&thuTuKr=<bảng>` (C thuộc mt-1) — When bấm › sang D (mt-1), Then đường dẫn là
  `record=objective:mt-1,kr:D`. And Given ngăn KR A mở không qua bảng (`record=objective:mt-1,kr:A`, không `thuTuKr`),
  When bấm › trong các KR của mt-1, Then tầng dưới vẫn `objective:mt-1` và nút quay lại mở khung mt-1.
- AC-6: Given đã sửa, When chạy bộ bài kiểm của kho, Then mọi bài kiểm sẵn có của ngăn KR, bảng Họp tuần và ngăn xếp bản
  ghi (trong đó `hop-tuan-tren-bang.dom.tsx`, `ngan-kr-mot-cho.dom.tsx`) vẫn xanh, cùng `check-types`, `lint`, `build`.

## Coverage

Quét theo trục (skill `morphological-scan`, preset test-matrix; bản quét ở `coverage-scan.md`):

- Trục A — hướng đi: › · ‹ · nhiều bước liên tiếp [thước CE: hai nút `kr-ke`, `kr-truoc` của `DauNganHanhDong`] →
  AC-1, AC-2.
- Trục B — mục tiêu của KR đích so với KR đang xem: khác · cùng [thước CE: thứ tự bảng trộn mục tiêu, dữ liệu chung] →
  AC-1, AC-2, AC-4.
- Trục C — tầng dưới trước khi đi: mục tiêu của KR đang xem · mục tiêu khác (đường dẫn chép tay) · thứ khác không phải
  mục tiêu [thước CE: hai lối vào ngăn KR — `lotDuoi` và đường dẫn có sẵn] → AC-1, AC-5; thứ khác không phải mục tiêu
  đi cùng luật với AC-5 (một nhánh mã), không ca riêng.
- Trục D — nguồn thứ tự: bảng Họp tuần · trong một mục tiêu [thước CE: `useThuTuHopTuan` trả bảng hay `null`] → AC-1,
  AC-5.
- Trục E — lối về: nút quay lại ở đầu ngăn · liên kết tên mục tiêu ở phụ đề · nút «Về khung mục tiêu» khi KR không tải
  được [thước CE: ba lối đọc tầng dưới trong `kr-sheet.tsx`] → AC-1, AC-3.
- Cắt ngang: không hồi quy → AC-6.

## Đường đo

- «Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR
  đang xem» · số từ: bài DOM `vkm-qua-muc-tieu` đọc `[data-okr-sheet]` sau khi bấm nút quay lại · bảo đảm bởi: AC-1.

## Out of scope

- Đổi hình, chữ hay chỗ của nút quay lại, liên kết tên mục tiêu, đếm «n/tổng» — không đổi gì người thấy ngoài đích đến.
- ‹ › theo thứ tự bảng khi mở ngăn từ chỗ khác ngoài Họp tuần — VK7 AC-2 giữ nguyên (sổ HT2 `d-20261027T131457Z-5`).
- Số lần ghi đường dẫn và mục lịch sử trình duyệt của mỗi lần ‹ › — vòng này không đổi cách ghi (`replace`) và không đo
  nó (sổ quyết định).
- Ngăn xếp có nhiều tầng mục tiêu (mục tiêu cha mở trước rồi mục tiêu con rồi KR): chỉ tầng ngay dưới KR đi theo.

## Notes

- Không loại bản ghi mới, không nút xoá, không trạng thái kết thúc — ba câu của `docs/vong-doi.md` không áp.
- «Về khung mục tiêu» trong câu đã ký đọc là lối về nói chung: đo cả ba lối (Trục E).
- Không API, không migration, không chữ mới trong tệp chữ dùng chung.
- Chạm ngoài ranh giới của dãy, đã xin và được duyệt: `record-stack.ts`, `thu-tu-hop-tuan.ts` (yêu cầu `V1-1`); tệp thử
  mới và khoá lệnh trong `_acceptance/config.yaml`, chỉ thêm dòng (yêu cầu `V1-2`).
