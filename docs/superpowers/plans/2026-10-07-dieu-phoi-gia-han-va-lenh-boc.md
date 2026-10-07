# dieu-phoi-gia-han-va-lenh-boc — kế hoạch

Hợp đồng: `_acceptance/dieu-phoi-gia-han-va-lenh-boc/contract.md` (duyệt 07/10). Design:
`docs/superpowers/specs/2026-10-07-dieu-phoi-gia-han-va-lenh-boc-design.md`.

Ba task, chạy tuần tự (task 3 đột biến mã của task 1–2, nên không độc lập).

## Task 1 — tệp trả lời gia hạn hỏng không làm đứng nhịp

- Files: `scripts/dieu-phoi/phat-lich.mjs`, `scripts/dieu-phoi/test/gia-han-va-lenh-boc.test.mjs` (ca T1–T4)
- Làm: thêm `docTraLoi(thuMuc, ten)` và `doiTraLoiHong(thuMuc, p, ly_do)`; tệp vắng → `null`; JSON hỏng → dời
  `tra-loi/hong/<id>.json`, sự kiện `tra-loi-hong` (`tep`, `ly_do` «JSON hỏng: …», `can_phan: true`), trả `null`;
  hợp lệ mà không phải object → như trên với `ly_do` «không phải object». `apGiaHan` gọi `docTraLoi` thay `docJson`.
- Verify: `node --test scripts/dieu-phoi/test/gia-han-va-lenh-boc.test.mjs` (T1–T4 xanh); phá-thử: đổi lại `docJson`
  trần → T1 đỏ.
- Phục vụ: E1–E4, E7–E10.
- independent: false

## Task 2 — lệnh bọc giữ nhịp tách biến môi trường đứng trước

- Files: `scripts/dieu-phoi/giu-nhip.mjs`, cùng tệp test (ca T5–T6)
- Làm: `tachBien(lenh)` tách các từ đầu khớp `^[A-Za-z_][A-Za-z0-9_]*=` thành `bien`, phần còn lại `conLai`;
  `chayGiuNhip` spawn `conLai` với `env: { ...process.env, ...bien }`; khối chính thoát 2 với dòng cách dùng khi
  `conLai` rỗng. `hook-chan-s4.mjs` giữ nguyên.
- Verify: cùng lệnh test (T5–T6 xanh) + `bun run test:dieu-phoi`; phá-thử: bỏ `...bien` khỏi env → T5, T6 đỏ mã 3.
- Phục vụ: E5, E6, E11, E12.
- independent: false

## Task 3 — bộ đột biến của vòng

- Files: `_acceptance/dieu-phoi-gia-han-va-lenh-boc/rang/dot-bien.mjs`
- Làm: cùng khuôn `dieu-phoi-hai-tang/rang/dot-bien.mjs` (đối chứng dương trên bản chép, `MOC VANG`, «ca ghim ∈ tập
  đỏ», `SONG`), bảy đột biến G1–G7 ghim đúng ca theo `evals.yaml`.
- Verify: `node _acceptance/dieu-phoi-gia-han-va-lenh-boc/rang/dot-bien.mjs` exit 0; phá-thử: đổi ghim của một
  đột biến sang ca nó không làm đỏ → exit 1 `SONG`.
- Phục vụ: E7–E12.
- independent: false

Kết: `bun run test:dieu-phoi`, thước `dph_ranh_gioi` (E13, E14).
