# Thước màn chữ của bo-chu-lap-keo-tha theo khoá kho nguồn — thiết kế

Ngày: 2026-09-28 · Hồ sơ: `_acceptance/man-chu-theo-khoa-kho-nguon/` · Hạng T2

## Vấn đề

PR #197 (`kho-nguon-khoa-rieng`, merge 2026-09-28) cho kho nguồn biến riêng
`KHO_TAI_LIEU_BLOB_TOKEN` (`BLOB_NGUON.bienKhoa` ở `packages/db/src/blob-nguon.ts`). Nút
`[data-tai-nguon]` trên màn Tài liệu khoá khi API trả `taiLieuNguon.trangThai.bat=false`, và
`bat` nay chỉ đọc biến mới. PR đó sửa bàn đo của `may-soan-de-xuat` (commit `f122f8ce`) nhưng
bỏ sót thước màn thật E6u của hồ sơ đã ký `bo-chu-lap-keo-tha`:

- `_acceptance/config.yaml`, khoá `executors.script.bclkt_man_chu`, vẫn đặt
  `BLOB_READ_WRITE_TOKEN=<giả>` trước `mot-luot.sh` — biến ấy không còn mở nút nào;
- `_acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs` nhắc tên cũ trong hai thông điệp tiền đề;
- lời mô tả E6u trong `_acceptance/bo-chu-lap-keo-tha/evals.yaml` cũng nói tên cũ.

Kết quả: trên máy không có khoá kho nguồn thật, thước thoát mã 2 «nut tai nguon khoa»; trên máy có khoá thật ở `.env` (Mac mini) thước xanh nhưng mở nút bằng khoá thật. E6u là
`ui-check`, không nằm trong làn ghim lại, nên CI không thấy.

## Cách làm

1. Lệnh `bclkt_man_chu` đặt `KHO_TAI_LIEU_BLOB_TOKEN=<giả>` thay cho biến cũ. Khoá giả chứ không
   dựa vào `.env`: thước chỉ mở hộp, không tải lên, nên không cần khoá thật, và lệnh chạy giống
   nhau trên mọi máy. Biến đặt sẵn thì `.env` không đè (phiên đo chuyển nguyên `process.env`
   sang API), nên khoá thật ở `.env` checkout chính không lọt vào phiên.
2. Không đặt `BLOB_READ_WRITE_TOKEN=` rỗng: `.env` checkout chính không có biến ấy, kho nguồn
   không đọc nó, và thước không chạm logo. `man-tai-nguon.mjs` đặt rỗng vì nó dựng Blob API giả
   cho cả tiến trình; thước này thì không.
3. Hai thông điệp của `man-chu.mjs` gọi tên `KHO_TAI_LIEU_BLOB_TOKEN`.
4. Lời mô tả E6u (bước và `expected`) đổi theo tên mới — tiền lệ `095f1dc1` sửa lời mô tả eval
   của một hồ sơ đã ký, kèm dòng sổ quyết định trong hồ sơ đó.
5. Một phép kiểm `rang/chieu-do-can-khoa.mjs` (khoá config `mctkkn_chieu_do`) chạy chiều đỏ của thước
   hai lần: với khoá giả phải đúng ghim, với khoá rỗng phải «ban sao thoat ma 2 (tien de thieu)».
   `chieuDo` dựng bản sao từ HEAD và kế thừa `process.env`, nên khoá phải do người gọi đặt; vế rỗng
   chứng minh vế giả đúng ghim nhờ khoá giả chứ không nhờ khoá thật của `.env`.
6. Một phép kiểm tĩnh `rang/ten-khoa.mjs` neo vào `BLOB_NGUON.bienKhoa`: lệnh và thông điệp của
   thước phải gọi đúng tên đang là khoá kho nguồn, và lệnh đặt nó bằng chữ nguyên văn (không mở rộng
   biến shell — `${KHO_TAI_LIEU_BLOB_TOKEN:-gia}` sẽ kéo khoá thật vào). Lần đổi tên sau sẽ đỏ ở phép kiểm máy này thay
   vì im tới khi có người chạy thước màn.
7. Một phép kiểm `rang/khoa-rong.mjs` chạy thước với `KHO_TAI_LIEU_BLOB_TOKEN=` rỗng tường minh,
   đòi bản thước tới được nút, mã 2 và thông điệp nút khoá gọi tên biến mới. Chiều đỏ (`--chieu-do`)
   chép `man-chu.mjs` vào `.acceptance-runs/man-chu-theo-khoa-kho-nguon/sao/` (cùng độ sâu ba thư mục
   nên gốc kho suy đúng), viết lại import `../../kho-tai-lieu/rang/man-lib.mjs` thành file URL tuyệt
   đối, giữ tên cũ trong thông điệp nút khoá, rồi chạy phép kiểm trên bản sao.

## Không làm

- Không sửa nút, API hay `blob-nguon.ts`.
- Không quét thước của các hồ sơ khác tìm tên cũ (`msd_blob_that` đặt `BLOB_READ_WRITE_TOKEN`
  có chủ ý — khoá logo giả).
- Không đổi hợp đồng đã ký của `bo-chu-lap-keo-tha`.

## Ghim lại

Vòng này chạm `rang/` và `evals.yaml` của hồ sơ đã ký `bo-chu-lap-keo-tha`. Chạy
`bash scripts/pre-merge-check.sh . --base origin/onehub` không `--slug`; chỉ ghim lại hồ sơ đó
khi lưới báo hoá cũ. E6u sẽ ở `evals_not_machine_touched` của lượt ghim — E1 của hồ sơ này chạy
đúng lệnh E6u ở S4 nên là bằng chứng màn cho lần đổi này.
