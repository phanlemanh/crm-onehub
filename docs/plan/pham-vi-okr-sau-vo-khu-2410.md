# Bản phạm vi — việc treo sau vỏ khu Mục tiêu và Họp tuần (24/10)

Chủ kho báo ngày 24/10, ở phiên HT1, rằng bối cảnh lúc mở hàng không được giữ lại: «Lối (b), nhưng tôi hỏi lúc
research tability đã quyết định như vậy, nhưng phiên này không giữ được gì từ quyết định research». Trong đợt
Điều phối – Thợ `vo-khu-muc-tieu`, nhiều quyết định chỉ nằm ở bốn chỗ: sổ `decisions.jsonl` của từng hồ sơ, sổ hỏi
đáp của đợt, ghi chú bàn giao ngoài kho và báo cáo artifact riêng tư. Bản này gom chúng vào kho và cắt phần việc
phát triển thành hàng của `docs/plan/lo-trinh-okr.json`.

Mỗi mục dưới ghi nguồn. «Ghi chú bàn giao» là tệp trong thư mục ghi chú chung của phiên giám sát vk
(`~/Library/Application Support/Claude/side-session-notes/local_0df64f3e…/`). Thư mục này ở ngoài kho, nên phần
cần giữ đã được chép vào đây.

## Tài liệu nghiên cứu đã có trong kho

| Tài liệu | Nội dung | Hàng dùng |
| --- | --- | --- |
| `docs/findings/2026-10-22-hop-tuan/README.md` | Lời chủ kho nguyên văn 22/10 và 24/10 (§1), hiện trạng và audit Họp tuần (§2–3), Tability thật không có trang họp hay trang cập nhật riêng (§4), 37 trang hướng dẫn Tability (§5), bảng «học trực tiếp» kèm hàng nhận (§6). Có 7 ảnh OneHub và 10 ảnh Tability. | HT1–HT5, SV1 |
| `docs/findings/2026-10-20-tability-nguon-du-lieu-kr.md` | Nguồn số tự cập nhật của KR (đã vào kho ở #520) | NS1–NS6 |
| Báo cáo UX khu Mục tiêu học từ Tability, https://claude.ai/artifact/AJuRPQDJK7ZB9GLKus6Tpj (riêng tư) | Vỏ, kiến trúc thông tin, tên gọi (đợt 18/10) | VK1–VK13 |
| `docs/plan/pham-vi-okr-vo-khu-1810.md`, `docs/plan/pham-vi-okr-hop-tuan-2210.md` | Hai bản phạm vi trước, đã cắt thành hàng | VK, HT |

## 1. «Lối (b)»: chỉ cập nhật một KR, qua bộ OKR

**Chủ kho chốt 24/10** ở phiên HT1, khi duyệt Cổng Phạm vi của `hop-tuan-mo-dung-bo`. Lời nguyên văn: «Lối (b)».
Câu hỏi 22/10 đã nêu hướng này: «Tôi nhớ Tability cập nhật trực tiếp trong bộ okr giúp đơn giản hóa chứ không có
trang riêng?». Nguồn: `docs/findings/2026-10-22-hop-tuan/README.md` §1, và ghi chú bàn giao
`HT1-hop-tuan-mo-dung-bo-ban-giao.md` mục «Sau duyệt (24/10)».

- Bỏ bảng cập nhật hàng loạt ở «Của tôi»: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx` → `BangCapNhat`.
  Lối vào nằm trong `LOI_VAO` ở `packages/validation/src/okr-cap-nhat.ts`: `nhac`, `viec-cua-toi`, `cua-toi`.
- «Của tôi» chỉ liệt KR cần cập nhật tuần này. Bấm một KR thì mở ngăn KR trong bộ OKR của nó.
- Tin nhắc 08:30 «N KR chờ cập nhật» hôm nay dẫn tới `/okr?tu=nhac`
  (`apps/agent/agent/lib/nhac-ke-hoach.ts:192-193`). Sau hàng này tin nhắc dẫn tới KR.
- Chỉ còn một đường cập nhật: hộp cập nhật một KR, mở từ ngăn KR hay từ dòng thẻ OKR (lối `sheet`).
- Quyết định này lật hàng đã ký DH3 `cua-toi-ba-phan` (#443, 15/10). DH3 hứa «gửi cập nhật tuần từ Của tôi mà
  không mở thẻ khác», nên các eval đo bảng hàng loạt của DH3 cần `superseded_by` trỏ hàng mới.
- Hàng mới đi sau HT2, vì HT2 đưa nút cập nhật lên dòng Họp tuần và đổi ‹ › của ngăn KR. Cùng ngày 24/10 chủ kho
  bỏ mục «Họp tuần» khỏi thanh bên. Đường vào Họp tuần đi như Tability: Bộ OKR › Tôi dẫn › bộ › thẻ con.
- Bản mẫu minh hoạ: `/proto/hop-tuan-mo-dung-bo`, commit `5ebcd43dc` trên `feat/hop-tuan-mo-dung-bo`. Bản mẫu có
  các trạng thái `ST-htmb-ngan-kr` (Cập nhật ở đầu ngăn), `ST-htmb-hop-cap-nhat` (hộp một KR, lần trước) và
  «Cần cập nhật tuần này» ở Của tôi. Ảnh ở `_acceptance/hop-tuan-mo-dung-bo/evidence/design-pass/` (48 ảnh).
  Đây chỉ là minh hoạ: phạm vi của HT1 không đổi.

**Căn cứ Tability:** «My focus» liệt KR của người dùng; việc cập nhật diễn ra trong ngăn KR. Xem ảnh `tab/t09-my-focus.jpg`
và `tab/t03-ngan-kr.jpg` của README. Mã app của Tability có một hộp cập nhật hàng loạt (`modals.bulkCheckin`, README §5).
Hộp này không phải lối chính trên màn, và chủ kho đã chọn bỏ nó.

## 2. VK9 `mot-nut-tao-muc-tieu`: hai mục «mở hợp đồng mới»

VK9 gộp ở #545. Chủ kho ký Cổng Bằng chứng 22/10 15:00Z, rồi ký lại 22:09Z sau vòng chấm 3. Hai mục ngoài hợp
đồng được chọn «mở hợp đồng mới» ở cả hai lượt ký. Nguồn: `_acceptance/mot-nut-tao-muc-tieu/decisions.jsonl`
(`d-20261022T150049Z-23`, `-29`, `d-20261022T220930Z-39`, `-45`) và `review-findings.md`.

- **Ngoài-3** (mức high): thước màn của các hồ sơ đã ký vẫn bấm lối VK9 đã gỡ mà không có `superseded_by`. Lối
  đã gỡ gồm menu «…», «Bắt đầu từ mẫu» và nhóm Soạn ở đầu trang. Phần lớn đã xử theo V2-20: chủ kho chọn «V2-20 b2»
  lúc 22/10 12:57Z, và bốn bàn đo đã sửa lối vào để đi qua hộp chọn. Bốn bàn đo đó là `man-canh-kr.mjs`, `man-okr.mjs`
  (dat-okr-trong-crm), `do-man.mjs` (okr-soat-anh-luot-3) và `man-dau-trang.mjs` (dieu-huong-khu-muc-tieu). Mỗi bàn
  đo có dòng sổ `fix` ngày 22/10. **Phần còn lại:** chưa có lượt quét nào chứng rằng không còn thước màn nào của hồ sơ
  đã ký bấm lối đã gỡ.
- **Ngoài-9** (mức high): đơn vị đã hết cuộc soạn trong kỳ thì lối «Các cuộc đã soạn» biến mất. Quyết định d-15 của
  VK9 muốn giữ đúng lối này. Tệp: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`.

Các mục khác của VK9 đã ghi Known limits. Một mục liên quan tới phần 3: Ngoài-6, «`useCoMau` gộp lúc đang tải và
lúc lỗi vào lý do khoá».

## 3. Chiều đỏ E16 của `canh-kr-okr` không còn bắt lỗi

Phát hiện lúc sửa thước theo V2-20 b2, ở dòng sổ `d-20261022T152758Z-39` của `_acceptance/canh-kr-okr/decisions.jsonl`,
decided_by Phan Le Manh. Nguyên văn: «--chieu-do E16 nay LOT vì dòng Từ mẫu của trưởng kho-van bị khoá theo bộ lọc
riêng của hộp».

Chiều đỏ của E16 dựng một bản sao danh sách mẫu phía màn không lọc theo đơn vị, và mong bước cuối đỏ, in tên mẫu lọt.
Từ VK9, hộp «Thêm mục tiêu» khoá dòng «Từ mẫu» theo bộ lọc của chính nó (`useCoMau` ở
`apps/app/app/(app)/[slug]/okr/hop-chon-duong.tsx`). Vì vậy bản sao lỗi không còn tới được màn chọn mẫu. E16 vẫn xanh,
nhưng thôi chứng rằng danh sách mẫu lọc đúng theo đơn vị.

## 4. VK6 `so-do-toan-vung`: hai mục «mở hợp đồng mới» cùng một gốc

VK6 chưa gộp. Nhánh `feat/so-do-toan-vung`, đỉnh cục bộ `cc12de94f` lúc 24/10 06:30. Chữ ký Cổng Bằng chứng là
`78bccd151` (22/10). Nguồn: `_acceptance/so-do-toan-vung/decisions.jsonl` trên nhánh đó (`d-20261022T145948Z-42`,
`-47`, decided_by Phan Le Manh) và `review-findings.md` vòng 4.

- **Ngoài-5:** `chuCuaEval` dùng regex cờ `/g` với `.test()` trong `filter`. Tệp thước khai trong `paths` bị rơi
  xen kẽ, và phần quét chuỗi bỏ (vế b) hụt mà không báo.
- **Ngoài-10:** cùng gốc. Regex `TEP_THUOC` có cờ `/g` dùng `.test()` trong `filter`, nên cứ hai tệp thước khai ở
  `paths` thì mất một.

Cả hai mục nằm ở `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs`. Đây là bộ rà xem hồ sơ cũ còn nhắc đường đã bỏ
hay không. `_acceptance/ngan-kr-mot-cho/rang/giu-ho-so.mjs` của VK7 có cùng tên, cần kiểm cùng lúc. Ngoài-9 của VK6
(`GIU.kiemDuong` thiếu đối chứng dương khung-man-chung) đã ghi Known limits, nhưng chạm đúng tệp này.

Bàn giao S3 của VK6 (ghi chú bàn giao `VK6-so-do-toan-vung-ban-giao.md`, 21/10) ghi thêm hai điều:

- VK6 bỏ Cây căn chỉnh, cách xem Sơ đồ của Sức khoẻ và trang Sơ đồ quanh mục tiêu riêng. Theo khuôn luật 21, VK6
  nghỉ 11 eval của hồ sơ đã ký, có `superseded_by` và bảng `rang/anh-xa-nghi.json`.
- Ba hàm phụ thừa (`focusDau`, `khoaTheoTenDon`, `dangCo`) còn trong `toan-canh-okr/rang/man-toan-canh.mjs`. Đây chỉ
  là cảnh báo biome.

## 5. Thước hồ sơ đã ký đỏ sẵn trên nền (V3-25, V3-27)

Nguồn: sổ đợt `.acceptance-runs/dieu-phoi-vo-khu-muc-tieu/yeu-cau/V3-25.json`, `tra-loi/V3-25.json`, `V3-27`, và
ghi chú bàn giao `V3-VK6-ghim-lai-do-san-nen.md` (22–23/10).

Sau khi VK6 ký, lượt ghim lại 10 hồ sơ đã ký đỏ 21 ô. Đối chiếu trên onehub `830d82e1f` thì mọi ô đều đã đỏ trên nền,
không ô nào do VK6. Các ô chia bốn lớp:

| Lớp | Ô | Cơ chế |
| --- | --- | --- |
| 1 | vo-khu-muc-tieu E4 E6 E10 E12 E13 E14 | #541 (VK11) thêm mục «Mọi KR», thước hứa năm mục |
| 2 | doi-nhan-khu-muc-tieu E10 | VK6 AC-6 gỡ ca Cây có chủ đích |
| 3 | cay-can-chinh E12 E13 · doi-nhan E8 · so-do-quanh E14 · trang-don-vi E12 E16 E18 | thước gắn ref nhánh đã xoá, gắn dải lượt hay ranh giới tệp |
| 4 | toan-canh-okr E3 E28 E29 · trang-don-vi E3 E4 E5 E17 | màn đỏ sẵn; trang-don-vi là giới hạn đã biết từ VK2 (`vo-khu-muc-tieu` d-20261020T224928Z-43) |

**Chủ kho chốt hai lần:**

- 22/10 22:14Z, nguyên văn «Đồng ý A» (V3-25). Theo đó: vo-khu sửa thước 5 → 6 mục; doi-nhan E10 khai `not-run`
  kèm `superseded_by so-do-toan-vung#AC-6`; thước dải lượt và màn đỏ sẵn khai `not-run` có lý do, **và mở một hàng
  sửa thước**.
- 22/10 22:18Z, nguyên văn «V3-27 B». Khai `not-run` bị luật hai vế 2.12.0 của kit chặn với 14 ô, vì báo cáo đã ký
  mang mã 0. Nên máy sửa thước tại chỗ từng ô: ref nhánh đổi sang sha, ranh giới bỏ tệp hồ sơ khác, nhãn
  «Toàn cảnh» đổi thành «Sức khoẻ», đoạn đột biến data-table sửa lại. Riêng trang-don-vi E3 E4 E5 E17 phải chẩn trước.

**Đã làm trên `feat/so-do-toan-vung`** (sẽ lên onehub cùng VK6): `7fd7e0d7c` (vo-khu 5 → 6), `e0d4984c7`,
`29f619823`, `d691d20ec` (V3-27 B), mỗi ô một dòng sổ `fix` decided_by Phan Le Manh. Sau đó trang-don-vi E3 E4 E5 E17
chạy qua `dvb_man_may` và cả bốn ô ra DUNG.

**Còn lại, thành hàng SV5:** hai ô màn chưa có chốt máy đúng.

- trang-don-vi E2 vẫn SAI «khoang lech 4px — KHOANG 1440: don vi 65px · Thoa thuan 69px». Sổ trang-don-vi
  `d-20261022T223644Z-59` ghi đây là giới hạn sản phẩm có thật ở khổ 1440.
- toan-canh-okr E10 E21 (ui-check) hỏng năm bước: thẻ số ra 5 thay vì 4 sau khi thêm Mọi KR, và breadcrumb. Sổ
  toan-canh `d-20261022T235101Z-55` ghi «chưa có chốt máy».

Lớp 3, tức thước gãy khi chính hồ sơ gộp, là bằng chứng cho F35 `don-ho-so-cu` (K-A của kit). Lớp này không cắt
lại ở đây.

## 6. Known limits đi cùng bản giao (không thành hàng)

**HT3 `hop-cap-nhat-lan-truoc`**, gộp #552 (`e6fd8405f`), ký Cổng Bằng chứng `67160cdd6`. Ba mục dưới ghi Known limits
ngày 23/10 ở `_acceptance/hop-cap-nhat-lan-truoc/decisions.jsonl`, `d-20261023T111749Z-20..22`:

- **Ngoài-4: tuần Việt Nam ở hai chỗ.** `tuanVN` trong `apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts` chép lại
  `dauTuanVN` của máy chủ thay vì dùng chung một hàm ở `packages/validation`.
- **Ngoài-5: lần mới nhất trùng giây.** `lanTruocTuVet` tính lại lần cập nhật cuối mà `krCapNhatTuSheet` đã tính.
  Khi hai lần trùng giờ, hai bản chọn khác nhau.
- **Ngoài-6: className trên ItemDescription.** `khoi-lan-truoc.tsx` dùng `className` đổi bố cục và khoảng cách của
  `ItemDescription`, trái `docs/design.md`.

Ngoài-4 và Ngoài-5 chạm cùng hàm với SV1. Phiên mở SV1 đọc ba mục này trước khi viết lại đường «lần trước».

Bàn giao S3 của HT3 ghi thêm một rủi ro: E7 chưa đo lối mở ngăn KR ở khổ 375. Nếu `[data-kr]` không hiện ở 375,
bàn đo rơi về `?record=kr:<id>`.

## 7. Bối cảnh Họp tuần giữ lại từ ghi chú bàn giao

- **Hiện trạng 22/10** (ghi chú bàn giao `hop-tuan-hien-trang.md`, đọc trên onehub `4830de27d`; bản đầy đủ ở README
  §2):
  - Cập nhật tuần (#153) và Bảng họp tuần (#157) lên production từ 26/09, không cờ.
  - Tóm tắt tuần (#226) có ba nấc theo phòng, mặc định `tat`.
  - Tin sáng dẫn tới `/okr/theo-don-vi?xemOkr=hop-tuan&donOkr=pb:…` (`apps/agent/agent/lib/nhac-ke-hoach.ts`). Đường
    này phải còn mở đúng thẻ sau khi VK3 gộp.
  - Chín thước màn của `cap-nhat-tuan-okr` đỏ trên nền (F28).
- **HT1** (ghi chú bàn giao `HT1-hop-tuan-mo-dung-bo-ban-giao.md`):
  - Bộ mặc định của Họp tuần tính ở `page.tsx` từ `okr.access` và `org.tree`, bằng hàm thuần `boHopTuan` ở
    `packages/validation`, không thêm thủ tục API.
  - Hỏi-2 của HT1: đổi VK3 AC-7 và một thước đã ký E10 (`tbo_man` ca xem-khong-don). Việc này cần dòng sổ `fix`
    decided_by chủ kho ở hồ sơ trang-bo-okr.
  - Hỏi-3: VK8 AC-3 «hàng số chỉ ở thẻ OKR». Hàng nào gộp sau dùng lại hàm ngày còn lại của hàng gộp trước.
  - HT2 cùng tệp `hop-tuan.tsx`, nên đi sau HT1.
- **VK9** (ghi chú bàn giao `VK9-mot-nut-tao-muc-tieu-ban-giao.md`):
  - Việc 7 làm đỏ khoảng 40 ca kiểm ở 10 hồ sơ đã ký. Ca nào cũng đo đúng hành vi VK9 gỡ, không ca nào đỏ vì lỗi thật.
  - Giám sát duyệt `cham-tep` xoá bốn khoá chữ chết.
  - Khi gộp sau VK6, khúc `okr.ts` cạnh `cayCanChinh` sẽ xung đột. Giữ cả hai lần xoá.

<!-- <<<PHAM-VI-MA -->
```
dot: okr-sau-vo-khu-2410
dang: lan-va
nguon: quyết định chủ kho treo trong đợt Điều phối – Thợ vo-khu-muc-tieu (21–24/10): «Lối (b)» ở Cổng Phạm vi HT1, «mở hợp đồng mới» ở Cổng Bằng chứng VK9 và VK6, «Đồng ý A» và «V3-27 B»; nghiên cứu ở docs/findings/2026-10-22-hop-tuan/README.md

- `LB` — «Lối (b)»: bỏ bảng cập nhật hàng loạt ở Của tôi; Của tôi chỉ liệt KR cần cập nhật, bấm mở ngăn KR trong bộ; tin nhắc 08:30 dẫn tới KR; chỉ còn hộp cập nhật một KR
- `N3` — VK9 Ngoài-3: không thước màn nào của hồ sơ đã ký còn bấm lối tạo mục tiêu đã gỡ mà thiếu superseded_by (phần còn lại sau V2-20 b2)
- `E16` — chiều đỏ E16 của canh-kr-okr đỏ lại khi danh sách mẫu phía màn không lọc theo đơn vị, dù hộp chọn đã khoá dòng Từ mẫu
- `N9` — VK9 Ngoài-9: đơn vị hết cuộc soạn trong kỳ vẫn mở được Các cuộc đã soạn
- `N5` — VK6 Ngoài-5: chuCuaEval của giu-ho-so không rơi tệp thước xen kẽ (regex cờ /g với .test())
- `N10` — VK6 Ngoài-10: TEP_THUOC của giu-ho-so không mất một nửa tệp thước khai ở paths, cùng gốc với N5
- `T25` — hàng sửa thước mà V3-25 «Đồng ý A» mở: thước màn trang-don-vi-mot-bang E2 và toan-canh-okr E10 E21 đo đúng vỏ khu
```
<!-- PHAM-VI-MA>>> -->
