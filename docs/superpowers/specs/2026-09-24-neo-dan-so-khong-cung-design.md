# Neo dân số không cứng — design

Ngày: 2026-09-24 · Hồ sơ: `neo-dan-so-khong-cung` · Hạng: T2 · Gốc: `e22d8288` (onehub sau PR #95)

## Vấn đề

`_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs dan-so` (hồ sơ đã ký
`chan-lai-component-ra-man`, AC-1) ghim ba con số: `NEO = { file, mac_dinh, dong_bang_cu }`.
`file` là số tệp `.ts/.tsx` dưới `packages/ui/src` · `apps/app/components` ·
`apps/app/lib` · `apps/app/app`. Mọi PR thêm hay xoá tệp nguồn làm nó lệch, lệnh cổng
`cl_tieng_viet_den_man` đỏ, và làn ghim lại hồ sơ gốc bị chặn. Sổ ghi sáu lần canh tay:
389 → 398 → 388 → 460 → 472 → 478. Không lần nào vì có chuỗi tiếng Anh mới nấp.

Hai neo kia là tín hiệu thật: `mac_dinh` (số giá trị mặc định là chuỗi có chữ) chỉ
đổi khi ai đó thêm một chuỗi cần phân nhóm; `dong_bang_cu` gần như không đổi.

## Cách sửa

Một tệp sản phẩm: `lai-ra-man.mjs`.

- **Bỏ `file` khỏi `NEO`.** Số tệp vẫn in ra, không còn ghim.
- **Thay bằng quan hệ «git ⊆ bộ duyệt».** Lấy `git ls-files` dưới bốn thư mục gốc,
  chỉ lọc đuôi `.ts/.tsx` — KHÔNG lọc theo `LOAI_TRU`, để phía git độc lập với danh sách
  loại trừ của bộ duyệt (dùng chung thì một `LOAI_TRU` nới nhầm làm cả hai phía cùng mất
  tệp và quan hệ vẫn đúng). Đo 24/09: 0 tệp git theo dõi nằm trong thư mục bị loại, và
  git thấy 478 = bộ duyệt 478. Mọi tệp trong danh sách git phải có trong `docFile()`. Thiếu → mã 1, dòng `BO-SOT: <n> tep git theo
  doi ma bo duyet khong thay: <duong dan>…`. Tệp chưa theo dõi (đang viết dở, tệp sinh
  khi dựng) không làm đỏ, vì chúng không ở phía git.
- **Không đọc được phía git** → mã 2 `KHONG DO DUOC`, không xanh im: không phải kho git;
  `git rev-parse --show-toplevel` khác gốc đang đo (thư mục nằm trong kho khác); hoặc
  git trả danh sách rỗng trong khi bộ duyệt thấy tệp.
- **Giữ nguyên** `mac_dinh`, `dong_bang_cu`, và «tập nguồn rỗng → mã 2».

Hợp đồng đã ký của `chan-lai-component-ra-man` không sửa. Sổ quyết định của nó nhận một
dòng `revisit` trỏ sang hồ sơ này: phần «đỏ khi neo `file` lệch» của AC-1 được thay.

## Cách chứng

`_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs --ca <ca>`:

- Dựng bản sao từ các tệp git đang theo dõi (nội dung ở cây làm việc), nối
  `node_modules`, rồi `git init` + commit trong bản sao để bản sao có phía git riêng.
- Chiều đỏ: thay `lai-ra-man.mjs` của bản sao bằng bản ở `e22d8288`.
- Mỗi ca in `DUNG|SAI <ban> — <thông điệp ghim>` và dòng cuối
  `DO-NEO KET LUAN: <n> DUNG, <m> SAI — ma thoat <x>`.

## Không làm

- Không đổi `mac_dinh` hay `dong_bang_cu` thành quan hệ — chúng là dây báo có nghĩa.
- Không đổi `docFile()` sang đọc từ git — bộ duyệt vẫn đi đĩa; git chỉ là phía đối chiếu.
- Không sửa hai lỗi AC-2/AC-4 còn mở của #91 (đã đóng).
