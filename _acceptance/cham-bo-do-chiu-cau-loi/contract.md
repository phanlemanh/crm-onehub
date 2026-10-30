---
schema_version: 1
feature: E15 của tro-ly-doc-kho coi lượt đủ mã là đã đo, ghi câu lỗi model vào cột riêng, có trần
slug: cham-bo-do-chiu-cau-loi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: approved
design_doc: _acceptance/cham-bo-do-chiu-cau-loi/design.md
approved_by: Phan Le Manh
approved_at: 2026-10-30
---

# Acceptance Contract: cham-bo-do-chiu-cau-loi

## Context

Hàng F34 của «OKR» (`docs/plan/lo-trinh-okr.json`). Script chấm E15 của `tro-ly-doc-kho` trả mã 2 khi một câu lỗi
model (~2% lượt hỏi), nên bộ tạm ~96 câu hầu như không bao giờ đo xong và E15 đỏ sẵn trên `onehub`. Chủ kho ký Cổng
Đáng `build` (19/10) và chốt ở phiên V3 ngày 30/10 «a, 5%»: trần 5% số câu của lượt, tối thiểu 1; tiêu chí đã ký
của F12 `eval-model-that-dung-luc` đổi lời theo.

Source input: hàng F34 · `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`, `cham-bo-do.ts`, `quyet-do.spec.ts` ·
`_acceptance/eval-model-that-dung-luc/contract.md` AC-1, AC-6, AC-7, AC-12 · tiền lệ
`_acceptance/bo-cau-hoi-mau/decisions.jsonl` d-20261013T024242Z-12.

## Criteria

- AC-1: Given một lượt chấm có N câu (cả lượt kho lẫn lượt Zalo), When tính trần câu lỗi, Then trần là `max(1, floor(N × 5 / 100))` đọc từ một hằng `CHAM_BO_DO.tranLoi` của `quyet-do.ts`: N = 96 → 4, 60 → 3, 40 → 2, 20 → 1, 10 → 1, 1 → 1; And năm ngưỡng của E15 (0,8 / 0,8 / 0,9 / 0,1 / 0) không đổi.
- AC-2: Given số câu `loi` của lượt không vượt trần (kể cả 0), When `ketLuan` chấm, Then mã là 0 hay 1 theo ngưỡng tính trên các câu còn lại (câu `loi` không vào tử hay mẫu số chỉ số nào), không phải 2; And kết luận có đúng một dòng «cau loi model: <n>/<N> (<id>, …) · tran <t> · dungTrang <a> · tuChoiDung <b> · chuyenQuyDinh <c> · chuyenNham <d>» với số câu lỗi của từng chỉ số, không có ngoặc id khi n = 0; And trần tính trên cả lượt, không theo phần kho hay phần Zalo: 3 câu lỗi cùng ở phần kho của lượt 96 câu vẫn dưới trần 4.
- AC-3: Given số câu `loi` vượt trần, When `ketLuan` chấm, Then mã 2 với dòng duy nhất «KHONG DO DUOC: <n> cau loi vuot tran <t> (<id>, …)»; And kế hoạch hỏi lại rỗng.
- AC-4: Given lượt một có câu `loi` dưới trần và một chỉ số rơi vào vùng xám, When E15 lập kế hoạch hỏi lại, Then hỏi lại đúng bộ câu của chỉ số đó như lượt không lỗi; And lượt hỏi lại có câu `loi` vượt trần của chính nó thì kết luận gộp là mã 2.
- AC-5: Given tệp chấm từng câu của một lượt, When kiểm đủ mã, Then hai dòng cùng `(lượt, id)` cho mã 2 «KHONG DO DUOC: trung ma <lượt>:<id>»; And ở lượt đo đầy đủ — hàm chấm lượt mà `cham-bo-do.ts` gọi nhận danh sách câu đã hỏi làm tham số bắt buộc — một câu đã hỏi mà không có dòng cho mã 2 «KHONG DO DUOC: thieu ma <lượt>:<id>»; And tệp đủ mã, không trùng thì kết luận đi theo AC-2, AC-3.
- AC-6: Given bản sao tệp lượt mẫu `_acceptance/tro-ly-doc-kho/rang/mau-luot-that` (có câu c33 lỗi ở lượt Zalo), When chạy `cham-bo-do.ts --cham-lai <bản sao>`, Then lệnh không thoát 2, in dòng «cau loi model: 1/<N> (c33) …» và bốn dòng chỉ số; And thêm vào bản sao đủ câu lỗi để vượt trần thì lệnh thoát 2 với dòng «KHONG DO DUOC: <n> cau loi vuot tran <t>»; And thêm một dòng trùng mã thì lệnh thoát 2 «trung ma».
- AC-7: Given hồ sơ đã ký `eval-model-that-dung-luc`, When vòng này xong, Then AC-1, AC-6, AC-7, AC-12 của nó nói «câu `loi` vượt trần» thay cho «có câu `loi`»; `expected` của các eval đo chúng, `rang/cham-lai.mjs` và cặp đột biến e của `rang/dot-bien.mjs` đo đúng lời mới; sổ của nó có một dòng `fix` mang `decided_by: Phan Le Manh`; And mọi lệnh máy không gọi model của các hồ sơ đã ký dùng hàm của `quyet-do.ts` hay gọi `cham-bo-do.ts` (ma trận 20 khoá viết trước trong E7: `bo-cau-hoi-mau`, `eval-model-that-dung-luc`, `zalo-tro-ly-kho-chi-dan`, `re-mo-hinh-mac-dinh`, `sua-sau-chay-that`, `model-theo-vai-do-lai`) giữ đúng mã nền đo trước vòng — 18 khoá xanh vẫn xanh, hai khoá đỏ sẵn không đổi mã; And `rang/cham-lai.mjs` của F12 chạy trên một thư mục lượt dựng từ mẫu thì thoát 0.
- AC-8: Given mỗi phép đo mới của vòng (trần, dòng câu lỗi, vượt trần, đủ mã, chấm lại), When phá đúng chỗ trong một bản sao cây (trần luôn 0; bỏ điều kiện vượt trần; bỏ kiểm trùng mã; bỏ dòng câu lỗi), Then bài tương ứng đỏ với thông điệp ghim riêng; And bản lành của từng bài xanh trước khi phá.

## Coverage

Quét tay ba trục (entry «bỏ coverage-scan» trong `decisions.jsonl`):

- Trục A — số câu lỗi so với trần: 0 (AC-2) · 1 … trần (AC-2, AC-6) · trần + 1 (AC-3, AC-6) · trần tối thiểu khi N nhỏ (AC-1).
- Trục B — đường chấm: lượt đo đầy đủ (AC-2, AC-3, AC-5) · lượt hỏi lại (AC-4) · `--cham-lai` (AC-6) · bộ đo của hồ sơ khác dùng chung hàm (AC-7).
- Trục C — tính toàn vẹn tệp: đủ mã (AC-5) · trùng mã (AC-5, AC-6) · thiếu mã (AC-5).
- Cross-cutting: ngưỡng không đổi (AC-1) · lời tiêu chí đã ký của F12 (AC-7) · chiều đỏ của mọi phép đo mới (AC-8).
- [GIẢ ĐỊNH] Tỉ lệ lỗi model ~2% (đo 13/10) còn đúng; trần 5% để chừa hơn gấp đôi.

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng; vòng là sửa thước, giá trị đọc ở lượt ghim E15 (entry «bỏ đường-đo» trong `decisions.jsonl`)

## Out of scope

- Không thử lại câu lỗi trong cùng lượt.
- Không đổi ngưỡng, bộ câu, luật dùng lại bản ghi 7 ngày, hay `evals.yaml`/hợp đồng của `tro-ly-doc-kho`.
- Không sửa `bo-cau-hoi-mau`, `zalo-hoi-okr-khong-chet`, `sua-sau-chay-that`: chúng chỉ được đo lại.

## Notes

- Ghim lại `tro-ly-doc-kho` rồi `eval-model-that-dung-luc` là bước cuối, sau Cổng Bằng chứng: PR chạm thư mục hai hồ
  sơ đã ký. Ghim `tro-ly-doc-kho` trước để lượt E15 thật sinh thư mục lượt mà thước chấm lại của F12 đọc. Ba vế chỉ đo
  được ở bước ghim, không ở Cổng Bằng chứng: E15 trên model thật, `cham-lai.mjs` của F12 trên lượt thật, và đủ tám
  cặp `dot-bien.mjs` của F12 (cặp h cần lượt thật). Cặp e của F12 có bản sao trong E8 (t6) để Cổng Bằng chứng thấy nó.
- Đỏ sẵn trên nền, ngoài phạm vi: `ssct_so_bo_mau` (mã 1) và `mtv_so` (mã 2) đo trên `onehub` bfca8a74a trước vòng.
- Thư mục `_acceptance/tro-ly-doc-kho/**` và `_acceptance/eval-model-that-dung-luc/**` nằm ngoài ranh giới dãy V3;
  giám sát đã duyệt `cham-tep` V3-1, V3-2, V3-4; `_acceptance/config.yaml` chỉ thêm dòng (V3-3).
