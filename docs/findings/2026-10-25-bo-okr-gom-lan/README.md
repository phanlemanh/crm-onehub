# Bộ OKR của một bộ phận gom cả bộ OKR của các phòng ban con

Điều tra ngày 25/10/2026, chỉ đọc. Nền: `onehub` ở `ca3c1a8ef` (sau #562 VK3 `trang-bo-okr`).

Chủ kho báo (nguyên văn): «…/okr/bo-okr?donOkr=bp:cmufcvj0r000104jpq7cc0yxy&kyOkr=… đang gom tất cả bộ okr khác của
bộ phận vào một nơi điều này làm rối, tôi muốn chỉ bộ okr của đối tượng đó».

**Quyết định — chủ kho 25/10, nguyên văn «Đồng ý hết theo khuyến nghị, mở PR»:**

| Câu | Chọn | Ghi vào đâu |
| --- | --- | --- |
| Q1 | (a) | hàng VK19 |
| Q2 | (a) | hàng VK19 |
| Q3 | (a) VK19 sau HT1 | hàng VK19 |
| Q4 | duyệt | hàng VK19 |
| Q5 | (a) | ghi chú SV1 |
| Q6 | duyệt | `docs/vong-doi.md` |
| Q7 | duyệt | VK15 thu về «Góp vào» |
| Q8 | có | PR này |

Luật mới nằm ở `docs/design.md` «Thứ tự một màn» và «Hàng công cụ».

## Tóm tắt

- **Nguyên nhân**: `dieuKienDonVi` ở `apps/api/src/okr/okr-xem.service.ts:168-179`. Với `bp:<id>` nó trả
  `OR [ {level: bo-phan, divisionId: id}, {level: phong-ban, departmentId in <mọi phòng ban của bộ phận>} ]`.
  Bốn thẻ con của trang một bộ đọc qua hàm này, nên cả bốn đều gom.
- **Hành vi này đã được ký**, nhưng trước khi có khái niệm «Bộ OKR». Hồ sơ `toan-canh-okr` AC-1 (ký 25/09) hứa
  `okr.danhSach(bp:B)` gồm mục tiêu của B **và** của P1, P2. Thước E1 của hồ sơ đó có chiều đỏ ngược lại: «bản
  sao bỏ mở rộng bộ phận sang phòng ban con → đỏ». Lúc ấy màn là «Theo đơn vị», có cây đơn vị.
- **Sau đó luật đổi mà không ai rà lại hàm này**. `CONTEXT.md` (chốt 18/10) định nghĩa Bộ OKR là «các mục tiêu
  và KR của **một** đơn vị trong một chu kỳ». VK3 `trang-bo-okr` AC-3 (ký 21/10) hứa «bảng mục tiêu là của **đúng**
  đơn vị ấy». Thước E5 của VK3 chỉ đo một phòng ban và OneHub, và so với chính `okr.danhSach`. Vì thế nó không
  bao giờ thấy chuyện gom ở một bộ phận.
- **Chưa ai sửa**. Không nhánh, không PR mở, không worktree nào đổi `dieuKienDonVi` (băm của hàm giống nhau ở cả
  12 worktree). Ngược lại, HT1 `hop-tuan-mo-dung-bo` (Cổng 1 duyệt 24/10, đang S3) **dựa vào** hành vi gộp và thêm
  chiều đỏ giữ nó cho `hopTuan`.
- **Kiến nghị**: một bộ chỉ là mục tiêu của chính đơn vị đó, ở mọi thẻ con. Phòng ban con đi qua khối «Đơn vị
  trực thuộc» đã có sẵn dưới bảng. Mở hàng mới **VK19 `bo-okr-chi-don-vi`** (fix, T2), đứng sau khi HT1 gộp.

## 1. Hành vi hiện tại, truy từ màn tới truy vấn

| Bước | Chỗ | Điều xảy ra |
| --- | --- | --- |
| Đường dẫn | `apps/app/next.config.ts:84-85` | `/okr/bo-okr` được rewrite sang `/okr/theo-don-vi` |
| Giải `donOkr` | `okr/okr-search-params.ts:42-55` | `bp:<id>` → `{loai:"bp", id}`. `bp` = **bộ phận** (Division, «Khối …»), `pb` = **phòng ban** (Department), `nguoi` = một người, `goc` = OneHub |
| Trang | `okr/theo-don-vi/page.tsx:66-75` | có `donOkr` thì nạp sẵn `okr.countByUnit` và `okr.danhSach({unit})` |
| Router | `apps/api/src/okr/okr.router.ts:1293-1297` | `danhSach` → `OkrXemService.danhSach` |
| Service | `apps/api/src/okr/okr-xem.service.ts:282-283` | `goc = AND[cycleId, dieuKienDonVi(unit, q)]` |
| **Điều kiện đơn vị** | **`okr-xem.service.ts:168-179`** | `bp` → bộ phận **cộng mọi phòng ban con** (lấy từ `q.cay.divisions[].departments`) |
| So sánh | `okr-xem.service.ts:180-181` | `pb` → đúng `level: phong-ban, departmentId`. Không gom gì |
| So sánh | `okr-xem.service.ts:166-167` | `goc` → chỉ `level: onehub`. Không gom bộ phận nào |

Vậy `goc` và `pb` cho đúng một đơn vị, còn **riêng `bp` gom**. Có bốn chỗ gọi hàm này, mỗi chỗ là một thẻ con:

| Thẻ con | Thủ tục | Dòng |
| --- | --- | --- |
| OKR (bảng) | `okr.danhSach` | `okr-xem.service.ts:282` |
| Việc | `okr.viecCuaBo` | `okr-xem.service.ts:465` |
| Họp tuần | `okr.hopTuan` | `okr-xem.service.ts:657` |
| Chấm điểm | `okr.bangCham` | `okr-khep.service.ts:630` |

### Vì sao trên màn thấy rối

- Bảng không có cột đơn vị. `BangDonVi` (`theo-don-vi/bang.tsx`) không hiện mục tiêu thuộc phòng ban nào, và
  nhóm «Đã bỏ» được gọi với `hienDonVi={false}` (`theo-don-vi.tsx:304`). Mục tiêu của bốn phòng nằm lẫn với mục
  tiêu của Khối mà không có dấu phân biệt.
- Cùng các phòng ban ấy hiện **hai lần**: một lần lẫn trong bảng, một lần trong khối «Đơn vị trực thuộc» ngay dưới
  (`DonViCon`, `theo-don-vi.tsx:306-310`). Mỗi thẻ trong khối dẫn sang bộ riêng của phòng đó, với số mục tiêu riêng.
- Số đếm lệch nhau giữa hai trang:
  - Trang danh sách Bộ OKR lấy cột «Mục tiêu» từ `okr.countByUnit` (`okr.service.ts:2027`). Hàm đó đếm theo khoá
    đúng một đơn vị (`khoaDonViDong`, `don-vi.ts:26-38`).
  - Mở bộ ấy ra thì bảng và chân bảng (`ChanBang`, `theo-don-vi.tsx:275`) đếm cả phòng ban con.
- Ngay trong một hàng của danh sách Bộ OKR (`bo-okr.ts:45-47`) đã có lệch:
  - cột «Mục tiêu» là số **riêng** (`countByUnit`);
  - cột «Tiến độ» và «KR tự tin thấp» là số **gộp** (`toanCanh`, hàng bộ phận cộng con).
  - VK3 AC-1 ký đúng như vậy.

### Trên bộ OKR mẫu (`apps/api/scripts/okr-mau/cong-ty.json`)

| Bộ | Mục tiêu riêng | Mục tiêu hiện khi mở bộ hôm nay |
| --- | --- | --- |
| Khối Kinh doanh | 1 | 1 + 14 của Kinh doanh miền Bắc (3), miền Nam (4), Chăm sóc đối tác (3), Marketing (4) |
| Khối Vận hành | 1 | 1 + 10 của Kho vận (4), Điều phối vận tải (3), Sản phẩm số (3) |
| Khối Hỗ trợ | 0 | 10 của Tài chính (3), Nhân sự (3), Pháp chế (4). Danh sách Bộ OKR ghi 0 mục tiêu cho bộ này |

(Số tính trên mọi mục tiêu của tệp mẫu. Lọc trạng thái và quyền xem có thể bớt vài mục.)

### Tái hiện

Đã chạy thước đã ký `tco_danh_sach` của hồ sơ `toan-canh-okr`, trên CSDL dùng-một-lần (`crm_mvn87txyxygm_test`,
đã drop sau khi chạy). Không chạm kho chung `crm`, không đăng nhập production:

```
bun run test -- "cd apps/api && bun test test/okr-toan-canh.spec.ts -t danh-sach"
 1 pass · 0 fail · 52 expect() calls
```

Ca «bp gồm con» khẳng định `okr.danhSach(bp:B)` = `{B1, P1a, P1b}`. Trong đó B1 là mục tiêu của bộ phận, P1a và P1b
là của phòng ban P1 (`apps/api/test/okr-toan-canh.spec.ts:130, 215-216`). Đây chính là hành vi chủ kho thấy. Chưa
đo màn bằng trình duyệt: hàm phía máy chủ là nguồn duy nhất của tập mục tiêu, và màn chỉ vẽ `rows` nó trả về.

## 2. Đối chiếu ý định: được hứa hay là lỗi?

| Ngày | Nguồn | Nói gì |
| --- | --- | --- |
| 25/09 | `_acceptance/toan-canh-okr/contract.md` AC-1 (signed-off) | `okr.danhSach` với `bp:B` «gồm mục tiêu của B **và** của P1, P2 mà KHÔNG có P3». Eval E1 có chiều đỏ: bỏ mở rộng sang con → đỏ |
| 26/09 | commit `ae34dbeaf` | «okr.danhSach — lọc theo đơn vị ở máy chủ, **bộ phận gồm phòng ban con**» — viết `dieuKienDonVi` như nay |
| 25/09, 04/10 | `toan-canh-okr` AC-5, `man-okr-truoc-r1` R1m-6 | Gộp ở **bảng Toàn cảnh** (hàng bộ phận cộng con). Chủ kho 04/10: «giữ cách đếm, nói rõ». Lời hứa này thuộc màn tổng hợp, không thuộc trang một bộ |
| 18/10 | `CONTEXT.md` mục **Bộ OKR** | «các mục tiêu và KR của **một** đơn vị trong một chu kỳ»; **Đơn vị** = một bộ phận hoặc một phòng ban |
| 21/10 | `_acceptance/trang-bo-okr/contract.md` AC-3 (signed-off) | «bảng mục tiêu là của **đúng đơn vị ấy**». E5 chỉ đo một phòng ban và OneHub, so với chính `okr.danhSach`, nên mù với bộ phận |
| 24/10 | `CONTEXT.md` mục **Tôi dẫn** | «trưởng một bộ phận **không kéo theo** các phòng ban con» |
| 24/10 | HT1 `hop-tuan-mo-dung-bo` AC-6 (approved, chưa ký) | «Họp tuần của bộ phận **gồm cả phòng ban con**». Gap-probe P1 thêm chiều đỏ «`hopTuan(bp)` bỏ phòng ban con → đỏ» (`htmb-toan-canh: bp:B liet 3, hopTuan 0`) |

Kết luận:

- Hành vi gom **không phải lỗi gõ**. Nó là một lời hứa đã ký từ 25/09, khi màn còn là «Theo đơn vị» có cây.
- Từ 18/10, «Bộ OKR» là vật trung tâm của khu và mang nghĩa một đơn vị. Lời hứa 25/09 nay **mâu thuẫn** với
  từ điển và với AC-3 đã ký của VK3. Không có dòng sổ hay quyết định nào của chủ kho giữ gộp cho trang một bộ.
- Memory `quyet-dinh-da-chot.md` và `dot-okr-hop-tuan-2210.md` không có quyết định nào về gộp phòng ban con. Bài
  học «thử trước với `donOkr` của đúng phòng» (`dot-okr-hop-tuan-2210.md`) giải thích vì sao mọi lần đo đều đi qua
  `pb:`.
- Các tài liệu khác nói rõ trường hợp tương tự đều chọn **không kéo con**: Tôi dẫn (24/10), luật trưởng bộ phận ở
  VK3 AC-2.
- Tability, nguồn học của «Bộ OKR», cũng để mỗi plan đứng riêng.

## 3. Đã có ai sửa chưa

- **PR mở** (`gh pr list --state open --base onehub`): #563 F28, #560 SV6, #553 HT4, #531 TH1, #509, #499, #486,
  #439. Không PR nào chạm `okr-xem.service.ts` hay `okr-khep.service.ts:630`.
- **Nhánh từ xa**: không nhánh nào trong 107 nhánh có diff vào `okr-xem.service.ts` so với `origin/onehub`. Kiểm
  riêng bốn nhánh:
  - `feat/so-do-toan-vung`: chỉ chạm `theo-don-vi/page.tsx`, `theo-don-vi.tsx`, `hang-cong-cu.tsx` (bỏ Cây căn
    chỉnh). Không chạm điều kiện đơn vị.
  - `feat/hop-tuan-mo-dung-bo`: không chạm `dieuKienDonVi`, nhưng **khoá hành vi gộp** cho `hopTuan` (AC-6, chiều đỏ
    E8).
  - `fix/bam-kr-mo-chi-tiet-kr`: không chạm.
  - `feat/tom-tat-tuan-dang-cho`: chỉ chạm `tro-ly.service.ts`.
- **Worktree cục bộ**: phần thân `dieuKienDonVi` có cùng một băm (`7a7e1aac`) ở cả 12 worktree. Không ai đang sửa
  dở chỗ này.
- **Phiên**: tìm trong transcript bằng «dieuKienDonVi bộ phận bỏ phòng ban con», «bỏ phòng ban con», «gom tất cả bộ
  okr». Chỉ thấy các phiên HT1 và SV6 nhắc chiều đỏ giữ gộp, cộng chính tin báo của chủ kho.
- **Lộ trình** (`docs/plan/lo-trinh-okr.json`): không hàng VK/HT/SV/NM nào gánh việc này. VK15 `cot-phai-bo-okr`
  chỉ chuyển «Đơn vị trực thuộc» và «Góp vào» sang cột phải, không đổi tập mục tiêu của bảng. Mã lớn nhất hiện có
  là VK18.

## 4. Kiến nghị

### Hành vi đúng

- `donOkr=bp:<id>` cho **chỉ mục tiêu cấp bộ phận của bộ phận đó**, như `pb:` và `goc` đang làm. Áp đều cho bốn
  thẻ con OKR · Họp tuần · Việc · Chấm điểm: thẻ con là các phần của **một** vật (`docs/design.md` «Thanh bên khu
  và thẻ con»).
- Phòng ban con hiện bằng **liên kết sang**, không lẫn vào bảng và không mở thành nhóm riêng. Khối «Đơn vị trực
  thuộc» (`DonViCon`) đã có sẵn dưới bảng, với số mục tiêu riêng từng phòng, nên **không cần khối giao diện mới**.
  VK15 sau này chuyển khối ấy sang cột phải.
- Bộ phận chưa có mục tiêu riêng (Khối Hỗ trợ trong bộ mẫu) thì câu rỗng nói «<Khối> chưa có mục tiêu riêng trong
  <chu kỳ>», và «Đơn vị trực thuộc» vẫn hiện ngay dưới. Đây cùng lối với F03 của Họp tuần.
- **Toàn cảnh giữ gộp.** Đó là màn tổng hợp, và lời hứa đã ký (`toan-canh-okr` AC-5, quyết định 04/10) vẫn đúng ở
  đó. Riêng hàng bộ phận ở **danh sách Bộ OKR** thì nên lấy tiến độ và KR tự tin thấp của **riêng** đơn vị, cho
  khớp cột «Mục tiêu». Đây là câu hỏi Q2 ở cuối.

### Đổi tối thiểu

1. `apps/api/src/okr/okr-xem.service.ts:168-179`: nhánh `bp` thành `{ level: "bo-phan", divisionId: unit.id }`.
   Tham số `q` của `dieuKienDonVi` khi đó thừa ở mọi nhánh. Bỏ nó kéo theo sửa bốn chỗ gọi: `:282`, `:465`,
   `:657`, `okr-khep.service.ts:630`.
2. Nếu Q2 chọn số riêng: `apps/api/src/okr/bo-okr.ts:45-47` đọc tiến độ và tự tin của riêng đơn vị thay vì
   `toanCanh.hang`. Hàng `toanCanh` của bộ phận là số đã gộp. Cần một số «riêng» mới từ `toan-canh.ts`, hàm hiện
   chỉ phơi số gộp (xem cách gộp kiểu `gopSucKhoe`, `toan-canh.ts:184-189`).
3. Câu rỗng cho bộ phận chưa có mục tiêu riêng: chuỗi trong `okrMessages` và nhánh `Rong` (`theo-don-vi.tsx:285-290`).

Không đổi lược đồ, không migration. Module `okr` không thuộc đường T3 → **T2**.

### Hồ sơ đã ký sẽ đỏ (cần dòng sổ `fix` `decided_by` chủ kho và cặp đo hai chiều)

| Hồ sơ | Thước | Vì sao đỏ | Cách giữ |
| --- | --- | --- | --- |
| `toan-canh-okr` (ký 25/09) | E1 `tco_danh_sach`, `okr-toan-canh.spec.ts:130-230` | Ca «bp gồm con» kỳ vọng `{B1,P1a,P1b}` và `total 3`. `facetCounts` viết trước tính cả con. Chiều đỏ của E1 khẳng định đúng điều mình muốn bỏ | Đổi **AC-1 đã ký** (luật chứ không chỉ chuỗi), viết lại bảng viết trước, lật chiều đỏ |
| `gop-y-dung-cho` | `apps/api/test/gop-y-dung-cho.spec.ts:75-76, 406-445` | Trưởng bộ phận và quản trị đọc mục tiêu phòng ban M1, M2 qua `bp:BP_KD`. Bản đổi trả rỗng (`rows ≥ 3`, «đúng hai Mục tiêu» đỏ) | Đổi `DON_VI` sang `pb:` của phòng chứa M1, M2. Ý của thước (đếm góp ý chờ) không đổi |
| `tro-ly-okr-tom-tat` | eval chạy lại `okr-toan-canh.spec.ts` | Kéo theo đỏ của E1 | Theo bản sửa E1 |
| `toan-canh-okr` | `okr-toan-canh-hieu-nang.spec.ts:143-150` | Đếm truy vấn với `bp` — nhiều khả năng vẫn xanh (ít hàng hơn) | Chạy lại để xác nhận |
| `trang-bo-okr` | E5, `man-bo-okr-du-lieu.mjs` | Không đỏ: chỉ đo `pb` và `goc`, so với `okr.danhSach` | Nên **thêm** ca bộ phận vào E5 để AC-3 hết mù |
| HT1 `hop-tuan-mo-dung-bo` (approved, S3) | AC-6 «Họp tuần của bộ phận gồm cả phòng ban con», E8 chiều đỏ `hopTuan(bp)` bỏ con | Nếu Q1 chọn (a) thì luật này lật | Xem Q3: để HT1 gộp trước, VK19 lật sau. Hoặc báo HT1 bỏ phụ thuộc ngay |

`docs/plan/lo-trinh-okr.json` và `CONTEXT.md` không cần đổi nghĩa. `CONTEXT.md` đã nói đúng; chỉ cần thêm một câu ở
mục Bộ OKR: «bộ của một bộ phận không gồm bộ của phòng ban con; Toàn cảnh mới cộng dồn».

### Hàng lộ trình

Nên mở hàng mới, không gộp vào hàng đang làm:

- **HT1** đã qua Cổng 1 và đang S3. Đổi luật ở đó là mở lại Cổng 1, và làm chậm HT1 (mốc hạn `m-1026ht` 26/10).
- **VK15** là việc dựng giao diện cột phải, có bước proto và design-pass. Còn đây là sửa một điều kiện truy vấn,
  cộng sửa thước đã ký, không có giao diện mới. Gộp vào thì việc nhỏ phải chờ việc lớn.
- Đề xuất: **VK19 `bo-okr-chi-don-vi`**, nhánh `fix/bo-okr-chi-don-vi`, `dung_tren: ["HT1"]`. Câu giao: «Trưởng
  khối mở bộ OKR của khối mình chỉ thấy mục tiêu của khối, còn các phòng nằm ở Đơn vị trực thuộc». Đặt **trước**
  VK15 để cột phải dựng trên tập mục tiêu đúng.

## 5. Câu hỏi cho chủ kho

```text
Q1 Phạm vi: bộ của một bộ phận bỏ gộp phòng ban con ở (a) mọi thẻ con — OKR, Họp tuần, Việc, Chấm điểm — hay (b) chỉ thẻ OKR? Chọn: ___
   Khuyến nghị (a): một bộ là một đơn vị (CONTEXT.md 18/10); họp cả khối thì đi qua Đơn vị trực thuộc hoặc Toàn cảnh.
Q2 Danh sách Bộ OKR, hàng bộ phận: cột Tiến độ và KR tự tin thấp (a) đổi sang số riêng của bộ phận cho khớp cột Mục tiêu, hay (b) giữ số gộp như Toàn cảnh? Chọn: ___
   Khuyến nghị (a): hàng đọc liền một mạch; Toàn cảnh vẫn giữ gộp.
Q3 Hàng: (a) hàng mới VK19 bo-okr-chi-don-vi đứng sau HT1, (b) gộp vào HT1 (mở lại Cổng 1), hay (c) gộp vào VK15? Chọn: ___
   Khuyến nghị (a): không làm chậm HT1 (hạn 26/10), sửa nhỏ không phải chờ proto của VK15.
Q4 Đổi AC-1 đã ký của toan-canh-okr («bp:B gồm cả P1, P2») thành «chỉ mục tiêu của B», và đổi đơn vị trong thước gop-y-dung-cho từ bp:BP_KD sang pb: — duyệt? ___
   Khuyến nghị: duyệt. Mỗi hồ sơ một dòng sổ fix decided_by chủ kho, đo hai chiều.
```

## 6. Bốn màn, bốn chỗ đặt lọc

Chủ kho gửi sáu ảnh production ngày 25/10. Nhận xét nguyên văn: «ux/ui lộn xộn… viết lại luật ux/ui để những màn
sinh ra ko tự làm theo mỗi kiểu như vậy».

Luật cũ (`docs/design.md` «Chip lọc») chỉ nói chip trông ra sao. Nó không nói chip **nằm ở đâu**, một tập con là
lọc hay là nhóm, và đi sang đơn vị khác bằng đường nào. Mỗi vòng tự trả lời ba câu đó theo một kiểu.

| # | Màn | Chỗ lệch | Mã | Luật mới | Hàng gánh |
| --- | --- | --- | --- | --- | --- |
| 1 | Của tôi | «Following (3)» là nhóm gập dưới bảng, trong khi Bộ OKR dùng chip Đang theo dõi | `okr/cua-toi.tsx:64` (`NhomDangTheoDoi`) | Tập con của cùng danh sách là giá trị lọc, không là nhóm gập | SV1 (Của tôi chỉ liệt KR) — xem Q5 |
| 2a | Trang một bộ | Ba đường đi sang đơn vị khác: dòng vị trí, ô chọn đơn vị trên hàng công cụ, lưới «Units below» dưới bảng | `theo-don-vi/vi-tri-bo.tsx`, `theo-don-vi/chon-don-vi.tsx`, `theo-don-vi/theo-don-vi.tsx:306` | Đổi sang vật cùng loại chỉ qua dòng vị trí, mắt xích cuối mở menu | VK19 (mục 4), thay nửa «trực thuộc» của VK15 |
| 2b | Trang một bộ | «Dropped (3)» gập giữa bảng và lưới đơn vị | `theo-don-vi/theo-don-vi.tsx:301-305`, đúng luật cũ `docs/vong-doi.md` | Đã bỏ là nút bật tắt cuối hàng công cụ | VK19 — xem Q6 |
| 3 | All KRs | Chip trạng thái dính thành một thanh, nằm một hàng riêng; Lọc và Cột ở một hàng khác | `okr/moi-kr/moi-kr.tsx:113-121` (`spacing={0}`) | Một kiểu chip, một hàng công cụ | NM2 |
| 4 | Map | Chip lọc nằm trong `Card` của sơ đồ | `okr/cay-can-chinh.tsx:218-242` | Mọi lọc ở hàng công cụ, ngoài `Card` | VK6 `so-do-toan-vung` đã tách `LocSoDoDonVi` ra ngoài; kiểm lại sau khi VK6 gộp, còn lệch thì vào NM2 |

Luật đã viết (chưa commit) ở ba tệp:

- `docs/design.md`:
  - mục mới «Thứ tự một màn» và «Hàng công cụ»;
  - thêm cách đi thứ ba «Dòng vị trí» vào «Thanh bên khu và thẻ con»;
  - bốn dòng mới trong bảng «Dấu hiệu vẽ tay».
- `docs/vong-doi.md`: dòng «Danh sách có nhóm», chuyển từ dòng gập sang nút trên hàng công cụ.
- `CONTEXT.md`: mục «Bỏ · Dùng lại», sửa cùng ý.

Hồ sơ đã ký sẽ phải đổi khi các hàng trên làm theo luật mới:

- **VK3 `trang-bo-okr`**:
  - AC-10 đã ghi «ô chọn đơn vị» là chỗ lệch bản mẫu được chấp nhận;
  - AC-7 hứa «liên kết Đơn vị con mang `donOkr=goc`».
- **HT1** AC-6: danh sách «Đơn vị có KR» trong màn rỗng. Đó là nội dung của màn rỗng, không phải lưới điều hướng
  thường trực, nên **có thể giữ**. Ghi ra để Cổng 2 của HT1 không bị bắt nhầm.
- Mọi thước đếm `NhomDaBo`, `[data-don-vi-con]`, `[data-chip-tinh-trang]`.

Luật trong tài liệu chỉ được kiểm bằng mắt ở review, và chính vì thế bốn màn trên đã lọt. Muốn màn mới không tự chế
nữa thì phải có máy bắt: một luật `anti-slop` trong `tools/oxlint` cấm
- `ToggleGroup` có `spacing={0}` trong `apps/app`;
- `ToggleGroup` nằm trong `CardContent`;
- `Collapsible` mà nhãn có số đếm, đặt sau một bảng.

Việc này thuộc NM2.

```text
Q5 Của tôi, «Đang theo dõi»: (a) bỏ khỏi Của tôi, theo dõi xem ở Bộ OKR › Đang theo dõi, hay (b) thành chip trên hàng công cụ của Của tôi? ___
   Khuyến nghị (a): Của tôi giữ đúng nghĩa việc của tôi; một khái niệm một chỗ.
Q6 Đổi luật vong-doi 07/10: «Đã bỏ (n)» thành nút bật tắt cuối hàng công cụ thay dòng gập — duyệt? ___
   Khuyến nghị duyệt (đã viết nháp); bảng lớn đã làm vậy với «Đã lưu trữ».
Q7 Đơn vị trực thuộc: menu ở mắt xích cuối dòng vị trí, bỏ ô chọn đơn vị và lưới «Units below», VK15 chỉ còn khối «Góp vào» — duyệt? ___
   Khuyến nghị duyệt, làm cùng VK19 vì bỏ gộp phòng ban con cần sẵn đường sang bộ của phòng.
Q8 Mở PR docs nháp «docs/luat-hang-cong-cu» cho ba tệp luật ngay bây giờ? ___
   Khuyến nghị có: luật lên trước để VK15, VK19, NM2 và các vòng mới viết theo.
```

## Ghi chú vận hành

- Không sửa mã, không commit, không đẩy, không chạm khoá S4, không chạy ghim lại.
- Để chạy thước, đã chép `.env` của checkout chính vào worktree này. Tệp nằm trong `.gitignore`, và lệnh
  `bun run db:generate` cũng chạy trong worktree này. CSDL thử `crm_mvn87txyxygm_test` đã tự drop.
- Đã đọc: `CLAUDE.md`, `AGENTS.md`, `docs/design.md`, `CONTEXT.md` (Bộ OKR, Đơn vị, Tôi dẫn), hợp đồng và sổ của
  `trang-bo-okr`, `toan-canh-okr`, `man-okr-truoc-r1`, `hop-tuan-mo-dung-bo`, hai findings 18/10 và 22/10, hai
  memory nêu trong đề.
