---
schema_version: 1
feature: câu khai t1Only và dòng «nặng» của pre-push nói đúng luật đã cài; phép đo lịch sử tách ca bộ phân loại sập
slug: pre-push-cau-va-nhan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: Manh Phan
approved_at: 2026-10-22T03:31:55Z
design_doc: docs/superpowers/specs/2026-10-22-pre-push-cau-va-nhan-design.md
---

# Acceptance Contract: pre-push-cau-va-nhan

## Context

Cổng Bằng chứng của `pre-push-phan-rieng-pr` (PR #536, Manh Phan ký 22/10) nhận năm mục ngoài hợp đồng làm Known
limits. Vòng này dọn ba mục: câu `t1Only.vi_sao` tả sai vế so ở đầu nhánh từ xa (Ngoài-1, Ngoài-4); dòng «nặng» gọi tệp
dưới `.github/` là «tệp ngoài T1» (Ngoài-2); `rang/lich-su.mjs` đếm ca bộ phân loại sập là khớp (Ngoài-3). Luật của
hook không đổi. Thuật ngữ (nền, tập xét, tệp của onehub, dòng «nặng») theo hợp đồng và thiết kế 21/10.

## Criteria

- AC-1: Given `.githooks/gate-shape.json` sau vòng này, When đọc `t1Only.vi_sao`, Then câu nói đúng mục «Luật mới» của
  thiết kế 21/10: lần đẩy mang commit mới của onehub chỉ xét phần PR tự thêm, với nền = `merge-base(đỉnh,
  <remote>/onehub)`; ở đỉnh so với nền, ở đầu nhánh từ xa so với `merge-base(nền, sha từ xa)`; tệp của onehub không
  tính; tập xét rỗng hoặc chỉ T1 thì bỏ; tệp mã, `t1_ma_doc`, `.github/**` trong phần PR tự thêm vẫn chạy đủ — và không
  câu nào nói ngược mã. Câu cũ «không khác bản onehub tại merge-base(đỉnh, <remote>/onehub)» không còn; mọi khoá khác của
  tệp giữ nguyên giá trị.
- AC-2: Given lần đẩy có tệp của onehub và tập xét nặng vì có tệp dưới `.github/` (`quyetDinh` trả `cham-github`), When
  `scripts/pre-push-t1.mjs` phân loại, Then stdout rỗng và stderr đúng một dòng
  `pre-push: phần PR tự thêm (<n> tệp; <k> tệp của onehub không tính) có tệp dưới .github/ (<các tệp dưới .github/>) — chạy đủ năm bước.`
  — cả khi tệp `.github/` là T1 (`.github/*.md`) và khi tập xét có cả tệp mã; danh sách chỉ gồm tệp dưới `.github/`.
  Dòng «nặng» vì `t1-ma-doc` hay vì tệp mã, và mọi dòng khác, như trước vòng từng byte.
- AC-3: Given bộ phân loại sập (stderr có `không phân loại được`) ở một lần gộp, When `rang/lich-su.mjs` chạy, Then nó in
  `sap <sha 9 ký tự>: …` cho lần gộp đó, không đếm là khớp, và thoát 1; với bộ phân loại thật, nó vẫn in `dat lich-su`
  với số đếm 6 / 38 / 412.
- AC-4: Given hai hồ sơ đã ký `pre-push-t1` và `pre-push-phan-rieng-pr`, When soát sau vòng này, Then `.githooks/pre-push`
  giống từng byte bản `origin/onehub`, mỗi neo byte mà hai răng `dot-bien.mjs` cấy đột biến xuất hiện đúng một lần, cả
  hai răng đột biến bắt đủ ca, và bài kiểm `pre-push-t1.spec.ts`, `t1-ma-doc.spec.ts`, `push-ghim-lai-t1.spec.ts` xanh
  với số ca hai ma trận viết trước không đổi (18, 16).

## Coverage

- Không quét không gian (câu hỏi phạm vi trong `decisions.jsonl`): bốn mục đã có tên từ Cổng Bằng chứng, ba chỗ
  sửa; trục duy nhất đáng kể là lý do nặng của `quyetDinh` trên tập xét — `cham-github` | `t1-ma-doc` |
  `co-tep-nang` [thước CE: các nhánh của `quyetDinh` trong `.github/scripts/phan-loai.mjs`] → AC-2 (G14 ba biến thể,
  G10, G3, `dong-gop (c)`).

## Đường đo

Không có ngưỡng: vòng không đi từ Cổng Đáng (không có `opportunity.md`).

## Out of scope

- Ngoài-5 của Cổng Bằng chứng 22/10 (ghim nội dung lời hứa mới ở răng `ho-so-cu.mjs`) — theo khuyến nghị của câu hỏi
  phạm vi ở Cổng Phạm vi.
- Đổi luật của bộ phân loại, `quyetDinh`, `.githooks/pre-push`, `verify-gate-shape.mjs`, hay khoá nào khác của
  `gate-shape.json`.
- Ca #523 (`LO-TRINH.html` kéo nặng) — vẫn để vòng sau như Hỏi-2 của `pre-push-phan-rieng-pr`.

## Notes

- Hồ sơ `pre-push-phan-rieng-pr` và `pre-push-t1` ghim lại trong cùng PR. Ô E9 (judgment `vi_sao`) của
  `pre-push-phan-rieng-pr` bị chạm bởi câu mới: E1 của hồ sơ này chấm lại đúng câu hỏi đó, thêm ý vế đầu từ xa (Hỏi ở
  Cổng Phạm vi: có cần thêm một lượt chấm lại riêng cho hồ sơ cũ không).
