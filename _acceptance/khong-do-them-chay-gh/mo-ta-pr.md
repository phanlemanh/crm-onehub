## Tóm tắt

Hàng F26 của lộ trình OKR (Ngoài-3 của `chuyen-goi-dieu-phoi`, chủ kho chọn «mở hợp đồng mới» 12/10).

Phép đo «không đỏ thêm» của `chuyen-goi-dieu-phoi` (E10) dựng bản clone của `HEAD` và merge-base. Bản clone có `origin` là
đường cục bộ và đứng ở `HEAD` tách, nên `gpct_nen_gop` và `gpct_luot_that` — hai lệnh cần `gh` — thoát 2 ở cả hai cây
và bị tính «đỏ sẵn»; phép đo báo xanh dù luồng ấy hỏng.

- `datNenBan` (trong `_acceptance/chuyen-goi-dieu-phoi/rang/chung.mjs`): bản đặt `onehub` về sha như cũ, chép URL
  `origin` của cây gốc và đứng trên branch cùng tên với cây gốc (cây gốc tách thì bản cũng tách).
- Bàn đo thêm cờ `--chi <khoá,…>` (không cờ thì chạy như cũ) và in dòng `chay:` trước khi dựng bản.
- Gộp PR #396: kiểm chéo đêm dựng lại cây khi checkout của bước phân loại hỏng, checkout `--force`, `ly_do` mang stderr
  của git (luật 24 của đợt lo-trinh-tin-hieu).

## Giới hạn

`gpct_luot_that` đòi PR mở của branch đang đứng. Ở lượt kiểm chéo đêm hay trên `onehub` nó vẫn thoát 2 ở cả hai cây —
đúng như ở cây gốc, và đúng hành vi đã khai của E11 `giam-phut-ci-nhap-t1`.

## Khối giao diện

Không có — vòng chỉ chạm thước dưới `_acceptance/` và `scripts/kiem-cheo/`.

## Ghim lại

PR chạm `_acceptance/chuyen-goi-dieu-phoi/rang/**` và `scripts/kiem-cheo/**`: các hồ sơ đã ký có `paths` khớp (ít nhất
`chuyen-goi-dieu-phoi`, `kiem-cheo-sau-gop`) cần ghim lại trước gộp.

Hồ sơ: `_acceptance/khong-do-them-chay-gh/`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
