# Kế hoạch thi công: thuoc-tro-ly-okr-khong-lot

Hồ sơ: `_acceptance/thuoc-tro-ly-okr-khong-lot/` · thiết kế: `docs/superpowers/specs/2026-10-15-thuoc-tro-ly-okr-khong-lot-design.md`.
Cổng Phạm vi ký 15/10 (Phan Le Manh). Bốn câu hỏi theo khuyến nghị: giữ `do-tre.sql`, bỏ đường nền, không đọc được
số dư thì cảnh báo và đo tiếp, sửa tên kho ở `taoKho` dùng chung.

Mã của vòng viết cùng lúc với thước ở S1 (commit `dc4f14276`), vì cả ba tiêu chí là thước của hồ sơ đã ký
`tro-ly-okr-de-xuat`, không chạm mã sản phẩm. Kế hoạch dưới đây đối chiếu từng việc với vật đã có.

| Việc | Tệp | AC | Eval | Trạng thái |
| --- | --- | --- | --- | --- |
| Đọc số dư `/v1/credits`, chặn mã 2 khi ≤ 0, cảnh báo khi không đọc được, thiếu khoá thì không gọi mạng | `_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs` (`soDuGateway`, `chanSoDu`) | AC-1 | E1, E1b | xong |
| Gọi chặn số dư ở đầu `do-tre.mjs` và `eval-gop-y.mjs` | `do-tre.mjs`, `eval-gop-y.mjs` | AC-1 | E1b | xong |
| Mọi lượt hỏng thì thoát 2 kèm dòng lỗi model nguyên văn | `do-tre.mjs` (`laHongHet`, `hongHet`) | AC-2 | E2, E3 | xong |
| Tên kho đo theo cây ở `taoKho`/`xoaKho` | `phien-tro-ly.mjs` (`tenKhoTheoCay`) | AC-3 | E4 | xong |
| Thước: ma trận số dư, ma trận hỏng, khoá sai chạy thật, số dư âm qua máy giả, kho hai cây | `_acceptance/thuoc-tro-ly-okr-khong-lot/rang/` | AC-1..3 | E1–E4 | xong |

Sau S4: ghim lại `tro-ly-okr-de-xuat` (E22/E24 gọi model thật) ở đỉnh cây sắp gộp, theo lượt khoá `ghim-lai` của đợt r2.
