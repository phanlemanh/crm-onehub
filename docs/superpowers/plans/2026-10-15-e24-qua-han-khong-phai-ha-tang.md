# Kế hoạch thi công: e24-qua-han-khong-phai-ha-tang

Hồ sơ `_acceptance/e24-qua-han-khong-phai-ha-tang/` · thiết kế
`docs/superpowers/specs/2026-10-15-e24-qua-han-khong-phai-ha-tang-design.md`. Cổng Phạm vi ký 15/10 (Phan Le Manh), Hỏi-1 theo
khuyến nghị: chỉ quá hạn hết mới là trễ.

| Task | Việc | Tệp | AC | Eval | Verify | Độc lập |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | `chayLuot` ghi `quaHan`; `laHongHet` không chặn khi mọi lượt hỏng đều quá hạn; nhánh ngưỡng in dòng «luot qua … — tinh la do tre» | `_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs` | AC-1, AC-2 | E1, E2, E3 | `bun test ./_acceptance/e24-qua-han-khong-phai-ha-tang/rang/kiem.test.ts ./_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts` | có |
| T2 | Thước chạy thật hai bản sao (hạn ép 1 ms) và một lượt khoá sai hạn 180 s | `_acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs` | AC-1, AC-2 | E1, E3 | `bun …/qua-han.mjs` và `--khong-qua-han` | không (sau T1) |

Phá-thử: ma trận E2 đỏ ở ô «20 qua han» trước T1 (đã chạy); bản trước vòng trong E1 là chiều đỏ của AC-1.

Sau S4: ghim lại `tro-ly-okr-de-xuat` (E24 gọi model thật) và `thuoc-tro-ly-okr-khong-lot` ở đỉnh cây sắp gộp.
