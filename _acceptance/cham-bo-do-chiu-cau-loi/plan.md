# Kế hoạch thi công — cham-bo-do-chiu-cau-loi

Hợp đồng đã duyệt 30/10 (Phan Le Manh). Mọi task tuần tự trong một cây: các task cùng chạm `quyet-do.ts` hay đọc
nó, nên không task nào `independent: true`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Lượt đo có vài câu lỗi dưới trần ra đạt hay không đạt, kèm dòng đếm câu lỗi | `quyet-do.ts` (`tranCauLoi`, `ketLuan`) | AC-1 (trần), AC-2 (dưới trần), AC-3 (vượt trần) |
| Lượt hụt hay trùng câu báo không đo được | `quyet-do.ts` (`kiemDuMa`, `chamLuotDu`), `cham-bo-do.ts` | AC-5 (đủ mã) |
| Hỏi lại chạy cả khi lượt đầu có câu lỗi dưới trần | `quyet-do.ts` (`keHoachHoiLai`, `ketHoiLai`) | AC-4 (hỏi lại) |
| Bằng chứng của lượt nói luật trần | `cham-bo-do.ts` | AC-2 |
| Bộ đo F12 đo đúng lời mới | hồ sơ `eval-model-that-dung-luc` | AC-7 (F12) |
| Mỗi phép đo mới đã thấy đỏ | `rang/dot-bien.mjs` của vòng | AC-8 (phá thử) |

## Task 1 — trần và kết luận
- Files: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`, `quyet-do.spec.ts`.
- `CHAM_BO_DO.tranLoi = { phanTram: 5, toiThieu: 1 }`; `tranCauLoi(soCau)`; `ketLuan` dùng trần, thêm dòng câu lỗi.
- Spec: describe `tran-loi` mới (E1, E2, E3); sửa `nhan-loi` (ca hai câu lỗi trên năm câu nay là «vượt trần 1»),
  `vung-xam` (E4), `nhan-loi zalo` (c33 dưới trần).
- Verify: `bun test _acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`. Phục vụ E1–E4.

## Task 2 — đủ mã
- Files: `quyet-do.ts`, `quyet-do.spec.ts`, `cham-bo-do.ts`.
- `kiemDuMa(dong, mong?)`; `chamTungCau` bắt trùng; `chamLuotDu(tungCau, cauDaHoi, nguong)` với `cauDaHoi` bắt buộc;
  `cham-bo-do.ts` gọi `chamLuotDu` ở lượt một và hỏi lại.
- Spec: describe `du-ma` (E5). Verify: như Task 1 cộng `bun run check-types` phần agent. Phục vụ E5.

## Task 3 — chấm lại trên mẫu
- Files: `_acceptance/cham-bo-do-chiu-cau-loi/rang/cham-lai-mau.mjs`; câu mô tả bằng chứng trong `cham-bo-do.ts`.
- Verify: `bun _acceptance/cham-bo-do-chiu-cau-loi/rang/cham-lai-mau.mjs`. Phục vụ E6.

## Task 4 — F12 theo lời mới
- Files: `_acceptance/eval-model-that-dung-luc/{contract.md,evals.yaml,decisions.jsonl,rang/cham-lai.mjs,rang/dot-bien.mjs}`.
- AC-1, AC-6, AC-7, AC-12 đổi lời; expected E1, E6, E7, E13 theo; `cham-lai.mjs` ca 2 tách dưới trần / vượt trần,
  round-trip đếm thêm dòng câu lỗi; cặp e đổi chuỗi; dòng sổ `fix` mang `decided_by`.
- Verify: các lệnh `emtdl_*` không gọi model. Phục vụ E7, E7j.

## Task 5 — ma trận hồ sơ khác và phá thử
- Files: `_acceptance/cham-bo-do-chiu-cau-loi/rang/{f12-xanh.mjs,dot-bien.mjs}`.
- Verify: chạy cả hai, mỗi cặp phá thử đỏ đúng câu ghim. Phục vụ E7, E8.
