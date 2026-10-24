# Phá thử chiều đỏ — tieu-diem-sau-hop-xoa-tin-hieu

Ngày 24/10/2026, cây `feat/tieu-diem-sau-hop-xoa-tin-hieu` trên đỉnh `61ed839a2` + mã của S3 (chưa commit lúc chạy).
Mỗi dòng: sửa hỏng một bản (bản gốc chép ra rồi chép lại sau), chạy đúng ô của eval bằng `-t`, đòi mã thoát khác 0 VÀ
thông điệp ghim có trong đầu ra. Đối chứng dương: cả bộ xanh trước và sau (36 pass, số khẳng định đúng công thức).

| Eval | Bản hỏng | Ô chạy | Kết quả |
|---|---|---|---|
| E1 | `onCloseAutoFocus` chỉ `preventDefault` | `tdx-giu-lai: giu-lai/giua/1280` | đỏ «tieu diem roi ve dau trang sau giu lai» |
| E1 | `phanTuHien` luôn trả phần tử đầu DOM | `tdx-giu-lai: esc/cuoi/375` | đỏ «tieu diem toi ban an» |
| E1 | bỏ hẳn `onCloseAutoFocus` (Radix tự trả) | cả `tdx-giu-lai` | 16/16 ô đỏ «…sau giu lai» / «…sau esc» |
| E2 | bỏ trả tiêu điểm khi đóng và sau lỗi | `tdx-hong: 409/vi/1280` | đỏ «tieu diem roi ve dau trang sau xoa hong» |
| E2 | nuốt lỗi (không đặt câu xoá hỏng) | `tdx-hong: 409/vi/1280` | đỏ «xoa hong khong noi vi sao» |
| E3 | sau lỗi cố ý bỏ tiêu điểm (`blur`) | `tdx-hong: mang/vi/375` | đỏ «tieu diem roi ve dau trang sau xoa hong» |
| E3 | `dangXoa` không về null | `tdx-hong: mang/vi/375` | đỏ «xoa hong khong xoa lai duoc» (lượt đầu treo vì khẳng định in cả phần tử DOM — đã đổi mọi khẳng định trên phần tử sang đúng/sai) |
| E4 | trả tiêu điểm vô điều kiện sau lỗi | `tdx-cho: tu-doi-roi-hong/1280` | đỏ «giat tieu diem khoi cho nguoi dung da doi» |
| E4 | xác nhận thì không trả tiêu điểm (`moTu = null`) | `tdx-cho: cho-dung-yen/1280` | đỏ «tieu diem roi ve dau trang luc cho xoa» |
| E4 | `phanTuHien` luôn trả phần tử đầu DOM | `tdx-cho: cho-dung-yen/375` | đỏ «tieu diem toi ban an» |
| E4 | áp điều kiện để-yên cho ca xoá xong | `tdx-cho: tu-doi-roi-xong/1280` | đỏ «xoa xong khong toi dong ke» |
| E5 | bỏ hẳn `onCloseAutoFocus` (chiều đỏ TH6 tự khai) | `sgt-tieu-diem` | **XANH** — bài TH6 không bắt ca này (lượt làm mới vẫn dời tiêu điểm); chiều đỏ đổi, xem dòng dưới |
| E5 | bỏ `requestAnimationFrame(() => dieuTieuDiem(ke))` | `sgt-tieu-diem: o a` | đỏ «tieu diem roi ve dau trang sau xoa» |
| E7 | thêm `--tep packages/ui/src/components/confirm-dialog.tsx` | `ranh-gioi.mjs` | mã 1 «vong sua tieu diem cham vung cam: packages/ui/src/components/confirm-dialog.tsx» |
