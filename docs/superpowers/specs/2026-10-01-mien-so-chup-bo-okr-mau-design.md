# Miễn luật «sổ chụp chỉ thêm» cho công cụ dev `okr:mau` — thiết kế

Ngày 01/10/2026 · hồ sơ `_acceptance/mien-so-chup-bo-okr-mau/` · hạng T2

## 1. Vấn đề

Eval E8 của hồ sơ đã ký `so-okr-tu-chay` chạy
`bun _acceptance/so-okr-tu-chay/rang/soi-ma.mjs --ca chi-them`. Trên `origin/onehub`
(9c65f368) lệnh này thoát 1 với hai vi phạm:

- `okrSoChup bị sửa: apps/api/scripts/okr-mau/nap.ts:146 (deleteMany)`
- `okrSoChup tạo ngoài chỗ được phép: apps/api/scripts/okr-mau/nap.ts:549 (createMany trong napTrong)`

Hai dòng đó vào kho ở commit e3e2f252f (28/09) của hồ sơ `bo-okr-mau`. Hồ sơ này
**đòi** cả tạo lẫn xoá:

- AC-3 đòi mỗi KR mẫu nguồn CRM có đúng sáu bản chụp;
- AC-7 và AC-8 đòi nạp lại và `--xoa` không để sót hàng nào trỏ tới thực thể mẫu.

Ngược lại, AC-4 và AC-14 của `so-okr-tu-chay` (ký 26–27/09) cấm mọi lối sửa hoặc xoá
bản chụp, và chỉ cho tạo ở ba chỗ. Khoá ngoại tới KR là `ON DELETE RESTRICT`, nên
muốn xoá KR mẫu thì phải xoá bản chụp của nó trước. Hai hợp đồng đã ký mâu thuẫn
nhau, và ô đỏ nằm im vì chưa ai ghim lại `so-okr-tu-chay` kể từ commit đó.

## 2. Quyết định của chủ kho

Ngày 01/10, chủ kho chọn hướng (a): luật «chỉ thêm» miễn cho công cụ dev
`okr:mau`. Hướng (b), sửa `okr:mau`, bị loại vì hai lẽ. Thứ nhất, không có lối tạo
hay xoá hợp lệ nào. Thứ hai, nhịp chụp 00:05 của tác tử vẫn ghi bản chụp cho KR mẫu
trên máy dev, nên `--xoa` sẽ vướng khoá ngoại. Vì vậy (b) cũng phải mở lại một hồ
sơ đã ký (`bo-okr-mau`), và còn làm hoá cũ eval của khoảng 22 hồ sơ phủ `apps/**`.

## 3. Vì sao miễn là an toàn

Mọi đường chạy thật của lệnh đều đi qua hai chốt đã có phép đo riêng ở `bo-okr-mau`:

1. `apps/api/scripts/okr-mau.ts` gọi `kiemDuocNap(process.env)` rồi
   `process.exit(OKR_MAU.ma.chan)` **trước khi** `await import("./okr-mau/lenh")`.
   Chốt này từ chối mọi máy chủ không cục bộ, cũng như `NODE_ENV=production` và
   `VERCEL_ENV=production|preview`, và không có cờ vượt (AC-9 của `bo-okr-mau`).
2. `napBoOkrMau` và `xoaBoOkrMau` gọi `kiemOkrThat(tx)` trong giao dịch, trước
   `xoaTrong` hay `napTrong`. Hàm này từ chối kho có chu kỳ, mục tiêu hay KR không
   mang tiền tố `mau-okr-` (AC-10 của `bo-okr-mau`).

Từ hai chốt đó suy ra: kho mà công cụ được phép chạm không có KR thật, nên cũng
không có bản chụp thật nào để xoá nhầm. Lệnh xoá lại lọc theo tập id mẫu
(`{ keyResultId: K }`). Lời hứa của `so-okr-tu-chay` là về lịch sử số thật; lời hứa
ấy vẫn đứng nguyên.

## 4. Thiết kế thước

Mọi thay đổi nằm trong `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`. Không tệp
`apps/` hay `packages/` nào bị chạm.

### 4.1 Bảng miễn

```js
const TEP_NAP_MAU = "apps/api/scripts/okr-mau/nap.ts";
const TEP_LOI_VAO_MAU = "apps/api/scripts/okr-mau.ts";
const MIEN_BO_MAU = [
  { tep: TEP_NAP_MAU, ham: "napTrong", cach: TAO },
  { tep: TEP_NAP_MAU, ham: "xoaTrong", cach: new Set(["deleteMany"]) },
];
```

Một lời gọi được miễn khi đúng tệp, đúng hàm bao quanh (`hamBaoQuanh`), đúng lối, **và**
bốn chốt đều đạt. Ô được miễn in một dòng `mien <tệp>:<dòng> <lối> trong <hàm>`, không
im lặng. Những lối sau vẫn là vi phạm ở mọi chỗ, kể cả trong hàm được miễn:
`update*`, `upsert`, `delete` (một hàng), SQL thô, và các lối lồng `soChup.*`.

### 4.2 Bốn chốt — đọc AST, không chạy mã

| Chốt | Đạt khi | Câu ghim khi vỡ |
| --- | --- | --- |
| C1 | `deleteMany` được miễn có đối số đầu là object có `where`, và `where` là object có khoá `keyResultId` | `miễn bộ mẫu không áp: deleteMany trong xoaTrong không lọc keyResultId` |
| C2 | `okr-mau.ts` có lời gọi `kiemDuocNap(…)`, có một `if` cấp tệp mà nhánh `then` gọi `process.exit`, cả hai đứng trước `import("./okr-mau/lenh")`; tệp không nhập tĩnh `./okr-mau/lenh` hay `./okr-mau/nap` | `miễn bộ mẫu không áp: apps/api/scripts/okr-mau.ts không chặn bằng kiemDuocNap trước khi nạp ./okr-mau/lenh` |
| C3 | Trong `nap.ts`, mỗi lời gọi `xoaTrong(…)`/`napTrong(…)` có một lời gọi `kiemOkrThat(…)` đứng trước nó trong cùng hàm gần nhất (kể cả hàm mũi tên không tên); tên `xoaTrong`/`napTrong` không xuất hiện ở chỗ nào khác ngoài khai báo và lời gọi đó; không tệp nào khác dưới `okr-mau/` nhắc hai tên này | `miễn bộ mẫu không áp: <hàm> gọi <xoaTrong\|napTrong> mà không gọi kiemOkrThat trước`; mỗi lần tên xuất hiện ngoài khai báo và lời gọi có chốt (gán, truyền làm giá trị, nhập hay gọi từ tệp khác dưới `okr-mau/`): `miễn bộ mẫu không áp: <tệp>:<dòng> dùng <tên> ngoài lời gọi có chốt` |
| C4 | Không tệp nào (trừ test) ngoài `apps/api/scripts/okr-mau.ts` và `apps/api/scripts/okr-mau/` nhập (tĩnh, động, `require`, `export … from`) một đường kết thúc bằng `okr-mau/nap` hay `okr-mau/lenh` | `miễn bộ mẫu không áp: <tệp> nhập okr-mau/<nap\|lenh> từ ngoài công cụ okr:mau` |

Chốt vỡ thì miễn **không áp cho cả bảng**: hai lời gọi trở lại thành vi phạm với câu
cũ («bị sửa» / «tạo ngoài chỗ được phép»), cộng thêm một dòng câu ghim của chốt. Riêng
C1 là chốt của từng lời gọi: nó chỉ làm `deleteMany` vỡ miễn.

Trường hợp `nap.ts` vắng (công cụ bị gỡ) thì không còn gì để miễn, bốn chốt không được
tính, và thước in `chot mien bo mau: khong ap (khong co nap.ts)`.

### 4.3 Cờ `--thay`

`--ca chi-them` nhận thêm `--thay <đường-trong-kho>=<đường-thật>`, lặp được nhiều lần.
Cờ này đưa vào `caChiThem` đúng tấm bản đồ `thay` mà `--chieu-do` vẫn dùng bên trong,
và áp cho cả phần đọc chốt. Có nó, phép đo chiều đỏ ở hồ sơ mới gọi **chính lệnh của
E8** trên bản sao bị phá, thay vì chép logic thước ra một nơi khác.

### 4.4 Đầu ra

```
so tep .ts/.tsx da soi (tru test/): <n>
chot mien bo mau: C1 dat · C2 dat · C3 dat · C4 dat
tao  apps/agent/agent/lib/okr-chup.ts:80 createMany trong ghiBangTinh
mien apps/api/scripts/okr-mau/nap.ts:549 createMany trong napTrong
tao  apps/api/src/okr/okr-so.service.ts:324 create trong ghiSoKr
tao  packages/db/src/okr-chi-so.ts:446 createMany trong chupKrCrm
mien apps/api/scripts/okr-mau/nap.ts:146 deleteMany trong xoaTrong
…
tong loi goi tao okrSoChup: 4
vi pham: 0
```

## 5. Phép đo hai chiều

Ba tệp trong `_acceptance/mien-so-chup-bo-okr-mau/rang/`. Mỗi tệp suy gốc kho từ vị trí
của chính nó, và đọc lệnh của E8 nguyên văn từ khoá
`executors.script.sot_soi_chi_them` trong `_acceptance/config.yaml`, không chép tay.

- `xanh.mjs` (AC-1) chạy lệnh trên cây thật, rồi so bằng quan hệ:
  - dòng chốt có đúng bốn `dat`;
  - đúng hai dòng `mien`, với số dòng rút từ `nap.ts`;
  - đúng ba dòng `tao` với cặp (tệp, hàm).
- `do-mien.mjs` chép tệp thật vào `tmpdir`, phá bản sao, rồi gọi lệnh kèm `--thay`.
  - Đối chứng dương chạy trước.
  - `--ca ngoai` (AC-2): mười ô lối ghi ngoài cặp (hàm, lối) được miễn.
  - `--ca chot` (AC-3): mười ba ô, mỗi ô vỡ đúng một vế của một chốt (C1×2, C2×3, C3×4, C4×4).
  - `--ca cu` (AC-4): `--chieu-do` cũ vẫn 2/2, và `--ca` sai vẫn thoát 2.
  - Mỗi ô ghim câu nguyên văn kèm số dòng trên bản sao. Ô chốt còn so nguyên dòng chốt
    (đúng một `vo`) và kiểm quan hệ hai lời gọi của `nap.ts` quay lại thành vi phạm.
- `van-ban.mjs` (AC-5) rút bảng `DUOC_TAO` và `MIEN_BO_MAU` từ mã nguồn thước, rồi đối
  chiếu với hợp đồng, E8 và `docs/api.md`. Chiều đỏ chạy trên bản thật của ba tệp ở 9c65f368.
- `pham-vi.mjs` (AC-7) gom tệp của mọi commit chạm hồ sơ, không lọc theo thông điệp. Khi
  nhánh chưa gộp, nó gom thêm `diff` từ `merge-base`. Đối chứng âm là commit e3e2f252f.

## 6. Văn bản

- **Hợp đồng `so-okr-tu-chay`:** câu cuối AC-4 và vế `okrSoChup` của AC-14 thêm «trừ công
  cụ dev `okr:mau` (`apps/api/scripts/okr-mau/nap.ts`, `napTrong`/`xoaTrong`) khi bốn
  chốt đạt». Notes thêm một dòng «Sửa đổi 01/10» trỏ hồ sơ này. Frontmatter và chữ ký
  không đổi.
- **`evals.yaml` của `so-okr-tu-chay`, E8:** `expected` nêu bảng miễn, bốn chốt và dòng `mien`.
- **`docs/api.md`, đoạn «`okrSoChup` is append-only history»:** câu «Rows are written in
  three places only» đổi thành ba chỗ của sản phẩm cộng công cụ dev có chốt; câu «fails
  on any … delete* … outside tests» thêm vế miễn.
- **Sổ quyết định của `so-okr-tu-chay`:** thêm một dòng `revisit` trỏ quyết định 01/10.

## 7. Sau khi gộp

Chạy `repin-lane.mjs --slug so-okr-tu-chay --write` ở đỉnh `onehub`. Đã biết từ 01/10:
E12/E14 thoát 2 vì «hôm nay quá gần đầu quý», còn E23/E25 thoát 2 vì đo `diff` của
vòng cũ. Làn có thể không xanh vì những lý do không thuộc vòng này. Nếu vậy thì báo
chủ kho, không vượt, không ký mù.

## 8. Đặc tả UX

Bỏ — vòng không chạm giao diện (sổ quyết định).
