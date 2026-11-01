# Kế hoạch — paths-chet-chin-ho-so (F38)

Hợp đồng duyệt 31/10, Hỏi-1 (a), Hỏi-2 (a).

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Chín hồ sơ đã ký thôi bị đòi ghim lại khi PR không chạm vật của chúng | dòng `paths:` của 9 `evals.yaml` | AC-1 (hết mục chết), AC-2 (chiều im), AC-3 (chiều cũ), AC-4 (đúng bảng), AC-5 (chỉ paths) |
| Sổ của gom-tin-hieu-tu-chay đọc được trọn | `decisions.jsonl` (đã sửa ở 9275d4eb6) | AC-6 (sổ đọc được) |
| Mười hồ sơ ghim lại trên test xanh | lượt ghim sau F37 | AC-7 (ghim lại) |

## Task 1 — áp bảng sửa (S3, ngay)

- Files: `_acceptance/<9 hồ sơ>/evals.yaml`
- `bun _acceptance/paths-chet-chin-ho-so/rang/ap-sua.mjs`
- Verify: E1 (`chet.mjs`) MUC CHET 0; E2–E3 (`hai-chieu.mjs`) 0 SAI; E4–E5 (`chi-paths.mjs`) 0 SAI; E6 (`so-hong.mjs`) 0 lỗi.

## Task 2 — sau F37 gộp

- Gộp `origin/onehub` vào nhánh; lượt ghim lại mười hồ sơ (chung lượt với nhánh dot-2, luật 37: chia nhóm suite, `--tran-phut`, `gia-han`).
- S4 với khoá s4 của đợt; E7 (`ghim.mjs`) phải xanh.
