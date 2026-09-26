# Chiều đỏ và đối chứng của thước — S3, 2026-09-26

Máy: Mac mini, Bun 1.3.12, env đo đọc từ `.github/workflows/ci.yml`, mỗi lệnh một cơ sở
dữ liệu riêng qua `bun run test --`.

## E1 — cùng thước trên bản trước vá (`--ban-sha 679432a0`)

Lệnh: `bun run test -- "bun _acceptance/khoa-con-bat-xa-tran/rang/do-thoi-gian.mjs --ban-sha 679432a0"` → mã 1.

```
tep do: ban 679432a0 (ban sao) · 17 ca · tran 1250ms · 10 luot
luot 1: seed 1708953481 · ma 0 · 17 ca · 0 do · khoa-con-bat 1734ms · 0 tien trinh bun test khac
luot 2: seed 113937507 · ma 0 · 17 ca · 0 do · khoa-con-bat 1475ms · 0 tien trinh bun test khac
luot 3: seed 4018504512 · ma 0 · 17 ca · 0 do · khoa-con-bat 1447ms · 0 tien trinh bun test khac
luot 4: seed 7142218 · ma 0 · 17 ca · 0 do · khoa-con-bat 1706ms · 0 tien trinh bun test khac
luot 5: seed 930298088 · ma 0 · 17 ca · 0 do · khoa-con-bat 1609ms · 0 tien trinh bun test khac
luot 6: seed 1667415061 · ma 0 · 17 ca · 0 do · khoa-con-bat 1667ms · 0 tien trinh bun test khac
luot 7: seed 1532419389 · ma 0 · 17 ca · 0 do · khoa-con-bat 1720ms · 0 tien trinh bun test khac
luot 8: seed 391535385 · ma 0 · 17 ca · 0 do · khoa-con-bat 1872ms · 0 tien trinh bun test khac
luot 9: seed 3926384341 · ma 0 · 17 ca · 0 do · khoa-con-bat 1710ms · 0 tien trinh bun test khac
luot 10: seed 3861748222 · ma 0 · 17 ca · 0 do · khoa-con-bat 1455ms · 0 tien trinh bun test khac
OK 10 seed doi mot khac nhau
HONG khoa-con-bat vuot 1250ms o luot 1: 1734ms
HONG khoa-con-bat vuot 1250ms o luot 2: 1475ms
HONG khoa-con-bat vuot 1250ms o luot 3: 1447ms
HONG khoa-con-bat vuot 1250ms o luot 4: 1706ms
HONG khoa-con-bat vuot 1250ms o luot 5: 1609ms
HONG khoa-con-bat vuot 1250ms o luot 6: 1667ms
HONG khoa-con-bat vuot 1250ms o luot 7: 1720ms
HONG khoa-con-bat vuot 1250ms o luot 8: 1872ms
HONG khoa-con-bat vuot 1250ms o luot 9: 1710ms
HONG khoa-con-bat vuot 1250ms o luot 10: 1455ms
do-thoi-gian: 10 hong
```

Đối chứng dương trên cây sau vá (`c39a92a8`), cùng lệnh không `--ban-sha` → mã 0, 10/10
lượt, `khoa-con-bat` 575–754ms, trong lúc các phiên khác chạy 0–7 tiến trình `bun test`.

## E2, E3, E5-(1) — bản sao đột biến

Mỗi nhóm chạy bản sao nguyên vẹn làm đối chứng dương trước; mọi dòng dưới là kết quả
thật của `pha-thu.mjs` ở S3.

| Nhóm | Bản sao | Mã | Thông điệp ghim |
|---|---|---|---|
| lech-hang | nguyên vẹn, `-t khoa-con-bat` | 0 | — |
| lech-hang | bo-lo-cuoi | 1 | ma tran tRPC song song lech danh sach thu tuc |
| lech-hang | dao-thu-tu | 1 | ma tran tRPC song song lech danh sach thu tuc |
| lech-hang | rest-bo-dau | 1 | ma tran REST song song lech danh sach duong |
| con-thanh-vien | nguyên vẹn | 0 | — |
| con-thanh-vien | con-thanh-vien | 1 | tRPC: khoa con bat cua nguoi ngoai van qua duoc |
| bo-qua-lo | nguyên vẹn, `-t theo-lo` | 0 | — |
| bo-qua-lo | bo-qua-lo | 1 | bo chia lo mac dinh chay nhieu hon mot luot |

Khung từ chối: chạy trần (Bun tự nạp `.env`, DB `crm_test`) → mã 2 «co so du lieu
crm_test khong phai co so du lieu rieng cua luot».

## E4, E5-(2) — tự kiểm trong cùng lần chạy

`soi-tep.mjs khong-noi-tran` → 25 đạt, tự kiểm 2/2 (thêm `15_000` vào `khoa-con-bat` →
bắt «test khoa-con-bat co tran rieng»; thêm `--timeout 15000` vào script test → bắt
«apps/api/package.json script test co --timeout»).
`soi-tep.mjs tuan-tu` → 7 đạt, tự kiểm 1/1 (thêm `LO_SONG_SONG` vào `doi-chung-thanh-vien`
→ bắt «doi-chung-thanh-vien goi ma tran song song»).

## Tải máy lúc đo

Các số giờ ở mục E1 đo lúc 05:00–05:10 ngày 26/09, khi máy chạy song song hai
repin-lane và một S4 của phiên khác. Phiên điều phối đo được loadavg 12.8 trên 14 lõi
quanh lúc đó; bản thân lượt đo KHÔNG ghi loadavg. Từ sau S3, `do-thoi-gian.mjs` in loadavg
ở từng lượt, và lượt S4 được xếp lúc máy rảnh. Tỉ lệ bản cũ/bản mới (~2.5×) đo trên cùng
máy trong cùng khung giờ nên ít phụ thuộc tải hơn số tuyệt đối.
