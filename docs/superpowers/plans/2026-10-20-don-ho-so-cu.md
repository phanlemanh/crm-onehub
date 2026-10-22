# Kế hoạch thi công — don-ho-so-cu (F35)

Hợp đồng: `_acceptance/don-ho-so-cu/contract.md` (duyệt 20/10 12:28Z, Hỏi-1 và Hỏi-2 theo khuyến nghị).
Mọi thước nằm dưới `_acceptance/don-ho-so-cu/rang/`, chạy bằng `bun` từ gốc kho, gốc kho suy từ vị trí script.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Danh sách việc đã ký có bằng chứng cũ, kèm vì sao cũ | `rang/chung.mjs`, `rang/kiem-ke.mjs` | AC-1 (kiểm kê đúng lưới) |
| Các việc cần chạy lại được chia lô dưới trần máy | `rang/lo.mjs`, `rang/kiem-lo.mjs` | AC-2 (lô đủ, không trùng) |
| Mỗi việc đỏ có đúng một cách xử, có lượt chạy làm bằng | `rang/khuon-xu-ly.mjs`, `rang/so-xu-ly.mjs` | AC-4 (sổ xử lý đúng khuôn) |
| Sửa phép đo chỉ chạm thước của chính việc đó, có hai chiều và chữ duyệt | `rang/sua-thuoc.mjs` | AC-5, AC-8 (nghi thức luật 23) |
| Việc đã ký chỉ đổi sổ; việc đỏ không bị chạm | `rang/cay-ho-so.mjs` | AC-6 (cây hồ sơ) |
| Cuối vòng mọi việc tươi hoặc có dòng xử lý | `rang/doi-chieu.mjs` | AC-3 (đối chiếu) |
| Mười hai ca gọi tên đều xong | `rang/ca-goi-ten.mjs` | AC-7 (ca gọi tên) |
| PR qua cổng gộp như CI | `rang/cong-gop.mjs` | AC-9 (cổng gộp) |

## Task

1. **chung + kiểm kê** — `chung.mjs`: `GOC`, `CA_GOI_TEN` (12), `kiemKe({root, slugs})` chạy `scripts/pre-merge-check.sh`
   không `--base` (toàn kho, hoặc từng `--slug`), rút `VIOLATION … evidence is stale` và NOTE lý do. `kiem-ke.mjs --sha`
   ghi `kiem-ke.json`; `--tu-kiem` là E1. Verify: `bun rang/kiem-ke.mjs --tu-kiem`. independent: false (nền của mọi task).
2. **lô** — `lo.mjs` (sinh `lo.json` từ `kiem-ke-goc.json`, ước phút từ số lệnh eval máy), `kiem-lo.mjs` (E2).
   independent: true.
3. **sổ xử lý** — `khuon-xu-ly.mjs` (zod), `so-xu-ly.mjs` (E4). independent: true.
4. **sửa thước** — `sua-thuoc.mjs` (kiểm E5, `--lan-chu` E8, `--ghi` chụp PR đang chờ). independent: true.
5. **cây hồ sơ** — `cay-ho-so.mjs` (E6). independent: true.
6. **đối chiếu, ca gọi tên, cổng gộp** — `doi-chieu.mjs` (E3), `ca-goi-ten.mjs` (E7), `cong-gop.mjs` (E9).
   independent: false (dùng task 1, 3).
7. **chạy** — sau khi #508 (nhận kit 2.33.1) gộp: kiểm kê gốc → lô → mỗi lô một nhánh `chore/don-ho-so-cu-lo-<n>`,
   lượt `ghim-lai`, làn `--tung-ho-so --write`, hoàn lại hồ sơ đỏ, lưu JSON làn vào `lan/`, PR lô; xử hồ sơ đỏ; cuối
   vòng `giu-tuoi`, đối chiếu. Phục vụ mọi AC.

Mỗi thước mới có cặp hai chiều trên cùng dữ liệu (vật lành xanh, vật phá đỏ đúng thông điệp ghim) — thiếu cặp là task
chưa xong.
