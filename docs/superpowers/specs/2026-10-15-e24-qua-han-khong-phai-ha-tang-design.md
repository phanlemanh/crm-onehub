# E24: lượt quá hạn là trễ, không phải «không đo được» — thiết kế

Hồ sơ `_acceptance/e24-qua-han-khong-phai-ha-tang/`, hạng T2, chỉ đổi thước của hồ sơ đã ký `tro-ly-okr-de-xuat`. Nguồn:
Ngoài-4 của `thuoc-tro-ly-okr-khong-lot`, chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 15/10 (sổ quyết định của hồ sơ
đó, dòng `d-20261015T050911Z-17`); giám sát r2 duyệt hàng mới P0-8.

## Lỗ đang có (sau #422)

`do-tre.mjs` coi mọi lượt có `hong` là một: lượt tác tử nộp hỏng (`hong:turn-failed`), lượt không mở được, và lượt chờ quá
`choMoiLuotMs` (180 s) chưa đóng. Khi CẢ 20 lượt đều quá hạn — tức Trợ lý OKR chậm hơn 3 phút mỗi lượt, đúng là một hồi quy độ
trễ — `laHongHet` vẫn chặn sớm và in «N/N luot hong (qua 180 s chua dong N) — khong phai do tre», mã 2. Bản trước #422 ra
KHONG DAT mã 1 ở cùng tình huống. Một lần trễ thật bị đọc thành lỗi hạ tầng.

## Cách sửa (chỉ thước)

- `chayLuot` ghi thêm `quaHan: true` khi `choXong` hết hạn (thay vì để người đọc suy từ chuỗi `lyDo`).
- `laHongHet(so)` chỉ đúng khi mọi lượt hỏng VÀ không lượt nào quá hạn. Lượt quá hạn đi tiếp vào nhánh ngưỡng như trước #422:
  tính `hongMs` (30 000 ms) vào p50/p90, nên 20/20 quá hạn ra KHONG DAT mã 1.
- Nhánh ngưỡng in thêm một dòng khi có lượt quá hạn: «<k>/<n> luot qua <s> s chua dong — tinh la do tre». Dòng này chỉ để
  người đọc biết nguồn của số lớn; nó KHÔNG thêm điều kiện trượt mới — ngưỡng p50/p90 quyết như cũ.

Mọi lượt hỏng do tác tử hay model mà không lượt nào quá hạn → giữ nguyên hành vi của `thuoc-tro-ly-okr-khong-lot` AC-2 (mã 2,
câu «khong phai do tre» kèm dòng lỗi model).

## Đo thế nào

- Ma trận `laHongHet` viết trước: hỏng hết không quá hạn → chặn; quá hạn hết, trộn quá hạn với hỏng, 1 quá hạn + 19 hỏng → không
  chặn; 19/20 hỏng, 0 lượt → không chặn.
- Chạy thật E24 `--lan 2` trên hai bản sao của `do-tre.mjs` — bản sửa và bản trước vòng (`1be143a82`) — cùng một chỗ vá: hạn chờ
  mỗi lượt ép về 1 ms trong bản sao, khoá Gateway sai (không tốn tiền). Bản sửa phải thoát 1 KHONG DAT với dòng «luot qua»; bản
  trước vòng phải thoát 2 «khong phai do tre». Vá trên bản sao, không thêm biến môi trường nào vào thước đã ký.

## Không làm

- Đổi hạn chờ 180 s, `hongMs`, ngưỡng p50/p90, hay `do-tre.sql`.
- Bắt một lượt quá hạn lẻ (1/20) thành trượt — ngưỡng p90 vẫn quyết.
- Sửa lời khai `expected` của E24 trong `tro-ly-okr-de-xuat/evals.yaml`.

## Hệ quả gộp

`do-tre.mjs` nằm trong `paths` của hai hồ sơ đã ký — `tro-ly-okr-de-xuat` (E24, gọi model thật, khoảng 35 phút và 1 USD) và
`thuoc-tro-ly-okr-khong-lot` (E2, E3; E3 chạy E24 thật với khoá sai, không tốn tiền) — nên PR phải ghim lại cả hai.

## Đặc tả UX

Không chạm màn nào — bỏ bằng dòng sổ `descope`.
