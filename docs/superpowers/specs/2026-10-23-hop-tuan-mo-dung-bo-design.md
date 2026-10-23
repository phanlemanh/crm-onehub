# Họp tuần mở đúng bộ — thiết kế (HT1)

Hàng HT1 `hop-tuan-mo-dung-bo` của `docs/plan/lo-trinh-okr.json` (đợt `okr-hop-tuan-2210`, phủ H1 · H2 · H4 của
`docs/plan/pham-vi-okr-hop-tuan-2210.md`). Câu giao: «Trưởng đơn vị bấm Họp tuần và vào thẳng bảng của bộ OKR mình
dẫn, thấy hàng số của tuần ở đầu; bộ chưa có KR công bố hay chu kỳ chưa chạy thì màn nói đúng lý do và chỉ sang đơn vị
có KR».

Viết trên mã của VK3 `trang-bo-okr` (nhánh cục bộ `feat/trang-bo-okr`, `f9278f844`, đã ký Cổng Bằng chứng 23/10,
chưa gộp `onehub`). HT1 đứng trên VK3: S3 chờ VK3 gộp. Đọc trước khi viết: `AGENTS.md`, `docs/api.md` (mục OKR,
cây tổ chức), `docs/design.md`, `CONTEXT.md` (Đơn vị, Trưởng đơn vị, Họp tuần, Bộ OKR), hồ sơ VK3 và VK8
`bo-okr-co-so`, `.agents/skills/web-design-guidelines` (khoá `feature_loop.ui_standards_skill` — skill là bài soát mã,
áp ở S3/S4 lên tệp vòng chạm; ở S1 chỉ nạp các luật trạng thái rỗng, tiêu điểm, nhãn truy cập).

## Hiện trạng (đã đọc)

- `okr.hopTuan({ cycleId, unit })` lọc mục tiêu `cong-bo` theo `dieuKienDonVi`: `goc` → `level: "onehub"`
  (`apps/api/src/okr/okr-xem.service.ts:160-161`). Bộ OneHub production không có KR công bố, nên `tatCa` rỗng và
  `tuanDau = tatCa.every(...)` ra `true` (`:586`). Màn rơi vào `ST-hoptuan-tuandau` «Chưa có lần cập nhật nào để bàn»,
  dòng `[data-tom-tat-hop]` in «đã cập nhật 0/0 KR» (`hop-tuan.tsx:230-249`).
- Không có trạng thái «bộ chưa có KR công bố» hay «chu kỳ chưa chạy» — cả hai rơi vào nhánh `tuanDau`.
- Đường vào Họp tuần (trên VK3):
  - thẻ con `the-con.tsx:20-35` luôn mang `donOkr` của bộ đang xem (kể cả `goc`);
  - tin sáng `apps/agent/agent/lib/nhac-ke-hoach.ts:183-190` mang `donOkr=pb:<id>`;
  - liên kết cũ `/okr/theo-don-vi?xemOkr=hop-tuan` và `/okr/bo-okr?xemOkr=hop-tuan` không kèm đơn vị: `next.config.ts`
    chuyển giữ chuỗi truy vấn. VK3 AC-7 cho cái sau mở bộ OneHub (`page.tsx`: `unit = don ?? goc`).
  - Thanh bên khu Mục tiêu không có mục Họp tuần (`tab-okr.ts` `NHOM_THANH_BEN`).
- Sau VK3 mọi chỗ dựng liên kết tới bộ OneHub ghi `donOkr=goc` tường minh (VK3 AC-7, bài E11 `tbo-lien-ket`). Vì vậy
  một URL Họp tuần **không có `donOkr`** chỉ còn đến từ liên kết cũ hay liên kết gõ tay — không còn là «chọn OneHub».
- Dữ liệu người xem: `OkrAccessService.quyen` có `quanTriChuongTrinh`, `truongBoPhan`, `truongPhongBan`,
  `phongBanChinh` (`okr-access.service.ts:74-104`). Thứ tự «đơn vị bạn dẫn» của màn Của tôi là `thuTuDan`: bộ phận
  trước, rồi phòng ban, theo thứ tự cây (`phan-don-vi-dan.tsx:67-92`).

## Thiết kế

### 1. Bộ mặc định của Họp tuần (H1)

Hàm thuần `boHopTuan({ access, cay, userId })` ở `packages/validation/src/okr-bo-hop-tuan.ts` chọn đúng một đơn vị
(ở gói chung để bài API dựng dữ liệu thật qua `okr.access` và `org.tree` gọi đúng hàm trang gọi). Đầu vào là
`okr.access` (`canManageProgram`, `headOf`) và `org.tree` (`people[].primaryDepartmentId`, thứ tự cây). Thứ tự chọn:

1. Người xem dẫn ít nhất một đơn vị → đơn vị đầu tiên theo `thuTuDan` (bộ phận trước phòng ban, thứ tự cây). Áp cả
   khi người xem là quản trị (Hỏi-1).
2. Quản trị chương trình không dẫn đơn vị nào → bộ OneHub (`goc`).
3. Thành viên có phòng ban chính còn trong cây → phòng ban chính (`pb:<id>`).
4. Còn lại → `goc`.

Mỗi kết quả mang `nguon` (`dan` · `quan-tri` · `phong-ban-chinh` · `goc`) cho bài kiểm, không hiện trên màn. «Trưởng
đã rời» không cần nhánh riêng: `headOf` đọc từ cây, mà cây chỉ tính trưởng còn là thành viên của đơn vị
(`docs/api.md`, mục cây tổ chức).

Trang `okr/theo-don-vi/page.tsx` (máy chủ) chuyển hướng khi `xemOkr = hop-tuan` và URL **không có** `donOkr`. Trang
đọc `okr.access` và `org.tree` như các thủ tục nó đã nạp sẵn, gọi `boHopTuan` rồi `duongChuyenHopTuan` (`okr/theo-don-vi/chuyen-hop-tuan.ts`), rồi `redirect()` sang cùng đường, thêm
`donOkr=<khoá>` và giữ `kyOkr`. Không thêm thủ tục API: luật «A server page computes» của `AGENTS.md`.

- URL có `donOkr` (kể cả `goc`) không bao giờ bị chuyển: người đã chọn bộ thì xem bộ ấy.
- Đọc `okr.access` hay `org.tree` hỏng → trang ném lỗi lên vùng lỗi của khu, không rơi về bộ OneHub.
- Các kiểu xem khác không kèm `donOkr` giữ luật VK3 (bộ OneHub) — ngoài phạm vi.

Chuyển ở máy chủ, không ở khách: không có khoảnh khắc hiện bảng OneHub rồi nhảy; URL sau khi vào chép gửi được; thẻ
con, Quay lại và `kyOkr` chạy như mọi bộ khác (VK3 AC-5). `okr.moHopTuan` ghi vết mở họp đúng đơn vị trưởng dẫn, nên
thước `ty-le-mo-hop-tuan.sql` đếm được lần mở từ thanh bên.

### 2. Mục «Họp tuần» trên thanh bên (H1, «từ thanh bên»)

Thêm mục `hop-tuan` vào nhóm OKR của `NHOM_THANH_BEN`, ngay dưới «Bộ OKR»: href `/okr/bo-okr?xemOkr=hop-tuan`, thêm
`kyOkr` khi URL đang có, không bao giờ mang `donOkr`. Bấm → máy chủ chuyển sang bộ của người xem (mục 1).

Trạng thái mở: «Họp tuần» mở khi đường là `/okr/bo-okr` và `xemOkr = hop-tuan` (mọi bộ); «Bộ OKR» mở ở các trang
`/okr/bo-okr` còn lại. Mỗi lúc đúng một mục mang `aria-current="page"`. Từ `md` là một mục của thanh dọc; dưới `md`
là một mục của hàng cuộn ngang mà `AreaSidebar` tự dựng — không dựng thêm bản điện thoại (`docs/design.md`).

### 3. Hàng số của tuần (H4)

Thay dòng chữ nhỏ `[data-tom-tat-hop]` bằng `StatGroup` bốn `StatCard` (`packages/ui`, như Toàn cảnh
`toan-canh.tsx:291-303`), đặt đầu thẻ Họp tuần, trên khối Tóm tắt tuần của HT4 và trên bảng:

| Ô | Giá trị | Mô tả |
| --- | --- | --- |
| Đã cập nhật | `daCapNhat/tongKr` | «Tuần dd/mm» (thứ Hai của tuần, giờ VN) |
| Đáng bàn | `dangBan.length` | «KR cần bàn tuần này» |
| Tự tin thấp | số dòng `dangBan ∪ conLai` có `tuTin = "thap"` | «theo lần cập nhật mới nhất» |
| Ngày còn lại | ngày lịch VN từ hôm nay tới `endsOn`, tính cả hai đầu | «Kết thúc dd/mm» |

Ngày còn lại theo đúng luật VK8 AC-2 (đã duyệt): trước ngày bắt đầu «—» với «Bắt đầu dd/mm»; hôm nay là ngày kết thúc
«1»; đã qua «0» với «Đã kết thúc dd/mm». Hàm thuần `oSoHop(d, chuKy, homNay)` ở `okr/o-so-hop.ts` dựng bốn ô; không
ô nào in `NaN`, `undefined` hay số âm. Không thêm thủ tục: mọi số đọc từ `okr.hopTuan` và chu kỳ đang xem.

Hàng số chỉ hiện khi bộ có KR công bố (`tongKr > 0`) — màn «0/0» là đúng thứ vòng này gỡ. Lúc tải: bốn ô khung xương
cùng hình. Lúc lỗi: giữ vùng lỗi `ST-hoptuan-loi` hôm nay (một vùng lỗi cho cả thẻ, có Thử lại).

Gặp VK8: VK8 AC-3 viết «hàng số chỉ có ở thẻ OKR» (bốn ô của bộ: Ngày còn lại · Tiến độ · KR đã cập nhật · KR tự tin
thấp). Hàng của Họp tuần là hàng khác — số của tuần, có «Đáng bàn», không có Tiến độ — nên mang dấu riêng
`[data-hang-so-hop]`, không dùng dấu của VK8. Ai gộp sau dùng lại hàm ngày còn lại của người gộp trước (một luật, một
hàm). Hỏi-3 xin chủ kho chốt lời AC-3 của VK8; Hỏi-4 xin chốt ô «Tự tin thấp» là một số.

### 4. Màn rỗng nói đúng lý do (H2)

Hàm thuần `lyDoRong({ hop, chuKy, homNay })` ở `okr/ly-do-rong.ts` chọn lý do, xét theo thứ tự, trước nhánh
`tuanDau` của hôm nay:

- `chu-ky-chua-chay` — chu kỳ ở pha `lap-ke-hoach` hoặc hôm nay (giờ VN) trước `startsOn`, và chưa KR nào có lần cập
  nhật.
- `chua-kr-cong-bo` — `tongKr = 0`.
- `chua-ai-cap-nhat` — `tongKr > 0` và `tuanDau` (nhánh hôm nay).
- `null` — còn lại.

API đổi đúng một dòng: `okr.hopTuan` trả `tuanDau = tongKr > 0 && mọi KR chưa có lần cập nhật` — `every` trên mảng
rỗng thôi ra `true`. Không thêm, không bớt khoá. Bài API đã ký chỉ khẳng định `tuanDau: false` cho bộ có KR
(`okr-toan-canh.spec.ts:840`), và fixture DOM đã ký dựng tay đầu ra nên không đổi. Màn vẫn xét `tongKr = 0` trước
`tuanDau`.

Danh sách «Đơn vị có KR» chỉ có ở bộ OneHub: các bộ phận và các phòng ban chưa xếp vào bộ phận có hàng `okr.toanCanh`
cùng khoá với `soKr > 0`, theo thứ tự cây. Mỗi mục: tên, `soKr`, `daCapNhat`. Hàng bộ phận gồm cả phòng ban con, nên
bộ phận chỉ có KR ở phòng ban con vẫn được liệt, và bấm vào tới Họp tuần của bộ phận — có đủ KR ấy (cùng
`dieuKienDonVi`).

Bộ phận hay phòng ban không thể rỗng mà có đơn vị con có KR: Họp tuần của bộ phận đã gồm phòng ban con. Hai bộ ấy khi
rỗng có liên kết «Xem mọi bộ OKR» về trang danh sách giữ `kyOkr`; bộ OneHub mà không đơn vị nào có KR cũng vậy.

`okr.toanCanh` đã bỏ mục tiêu hạn chế với người xem không thấy (`docs/api.md`, mục OKR), nên danh sách không đếm và
không gọi tên chúng. Thủ tục này chỉ được gọi trong nhánh rỗng, ở một thành phần con riêng `DonViCoKr`. Nhánh có dữ
liệu không đổi số truy vấn, và các bài DOM đã ký mock `useTRPC` không có `toanCanh` chỉ chạm thủ tục ấy khi dựng bộ
rỗng (AC-10 soát).

Màn:

| `rong.lyDo` | Câu | Hành động |
| --- | --- | --- |
| `chu-ky-chua-chay` | «Chu kỳ <tên> bắt đầu dd/mm — Họp tuần có số từ tuần đầu của chu kỳ.» | không |
| `chua-kr-cong-bo` | «<tên bộ> chưa có KR công bố trong <tên chu kỳ>.» | bộ OneHub: danh sách «Đơn vị có KR» (`Item`, mỗi mục: tên, «n KR · đã cập nhật m», liên kết tới Họp tuần của đơn vị ấy giữ `kyOkr`); bộ khác hoặc danh sách rỗng → liên kết «Xem mọi bộ OKR» về trang danh sách của VK3 giữ `kyOkr` |
| `chua-ai-cap-nhat` | câu `tuanDau` hôm nay («Chưa có lần cập nhật nào để bàn» + mô tả) | hàng số hiện, `0/<tongKr>` |

Không màn nào in «0/0 KR». Hai trạng thái đầu không hiện hàng số; trạng thái thứ ba hiện.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: thanh bên «Họp tuần» (hay liên kết cũ không kèm đơn vị) → máy chủ chuyển sang `?donOkr=<bộ mình dẫn>&xemOkr=hop-tuan` → thẻ Họp tuần của bộ ấy, hàng số đầu thẻ, bảng đáng bàn (điểm ra: thẻ con khác của cùng bộ, hay ngăn KR).
- Biên: quản trị không dẫn đơn vị → bộ OneHub; bộ chưa có KR công bố → câu lý do + danh sách đơn vị có KR; chu kỳ chưa chạy → câu ngày bắt đầu; thành viên không dẫn → phòng ban chính.
- Lỗi & quay lại: `okr.hopTuan` hỏng → vùng lỗi có Thử lại; `okr.toanCanh` hỏng trong nhánh rỗng → câu lý do vẫn hiện, chỗ danh sách là vùng lỗi có Thử lại; đọc `okr.access` hay `org.tree` hỏng ở máy chủ → vùng lỗi của khu, không âm thầm mở OneHub.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ Họp tuần của một bộ | đi qua KR đáng bàn của tuần | thanh bên, thẻ con, tin sáng, liên kết cũ / ngăn KR, thẻ con khác, Họp tuần của đơn vị trực thuộc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hoptuan-tai | Thẻ Họp tuần | bốn ô khung xương + khung chờ bảng; tiêu đề, dòng vị trí, hàng thẻ con còn nguyên | chờ |
| ST-hoptuan-loi | Thẻ Họp tuần | «Không tải được bảng họp tuần.» + Thử lại (giữ nguyên hôm nay) | Thử lại |
| ST-hoptuan-chuky-chua-chay | Thẻ Họp tuần | «Chu kỳ <tên> bắt đầu dd/mm — Họp tuần có số từ tuần đầu của chu kỳ.»; không hàng số | đổi chu kỳ ở thanh bên |
| ST-hoptuan-chua-kr | Thẻ Họp tuần | «<bộ> chưa có KR công bố trong <chu kỳ>.» + danh sách «Đơn vị có KR» (chỉ bộ OneHub) hoặc «Xem mọi bộ OKR»; không hàng số | bấm một đơn vị → Họp tuần của nó |
| ST-hoptuan-donvi-tai | Thẻ Họp tuần (bộ chưa có KR) | câu lý do + ba dòng khung xương của danh sách | chờ |
| ST-hoptuan-donvi-loi | Thẻ Họp tuần (bộ chưa có KR) | câu lý do + «Không tải được các đơn vị có KR.» + Thử lại | Thử lại |
| ST-hoptuan-tuandau | Thẻ Họp tuần | hàng số `0/<n>` + «Chưa có lần cập nhật nào để bàn» | nhắc đội cập nhật |
| ST-hoptuan-yenang | Thẻ Họp tuần | hàng số + câu yên ắng hôm nay | xem «Còn lại» |
| ST-hoptuan-co-du-lieu | Thẻ Họp tuần | hàng số + bảng đáng bàn + «Còn lại» | mở ngăn KR |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bốn ô: 1440 một hàng bốn ô; 375 lưới hai cột hai hàng (hành vi `@container/stats` sẵn có của `StatGroup`); trang không cuộn ngang.
- Tên đơn vị và tên chu kỳ là dữ liệu người nhập: `translate="no"`.
- Liên kết trong danh sách «Đơn vị có KR» là `Link` thật (Tab tới, Enter mở), tên truy cập là tên đơn vị.
- Mục thanh bên: một `aria-current="page"` mỗi lúc; tiêu điểm thấy được theo `AreaSidebarItem`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `StatGroup`, `StatCard` | dùng | nếp «Ô số tổng quan» của `docs/design.md`, như Toàn cảnh |
| `Item` (`variant="outline"`) | dùng | danh sách mục ngắn, không cần `DataTable` |
| `Empty` | dùng | câu lý do của màn rỗng |
| `AreaSidebarItem` | dùng | mục mới của thanh bên khu |
| `Skeleton` | dùng | bốn ô khung xương |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: (ii) không tra công cụ — khuôn hiển nhiên: bản phạm vi ghi Tability đặt bốn ô số ở đầu plan
(`vi_sao` của HT1) và `docs/design.md` mục «Ô số tổng quan» đã chốt `StatGroup` cho hàng số đầu màn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chỗ giao với hàng khác

- **VK3 `trang-bo-okr` (đã ký, chưa gộp).**
  - AC-7 «`/okr/bo-okr?xemOkr=hop-tuan` mở bộ OneHub» đổi thành «mở bộ của người xem» (Hỏi-2).
  - Hai thước đã ký phải đổi:
    - E10 `tbo_man`: ca `xem-khong-don` kỳ vọng tiêu đề tên gốc.
    - E11 `tbo-lien-ket`: thanh bên chỉ được dẫn tới trang danh sách; mục mới mang `xemOkr=hop-tuan`.
  - Luật tạm «không tự sửa thước hồ sơ đã ký» → mỗi thay đổi đi qua dòng sổ `fix` mang `decided_by` chủ kho
    (AC-10), không sửa im.
- **VK8 `bo-okr-co-so` (đã duyệt phạm vi, chưa làm).** AC-3 «hàng số chỉ có ở thẻ OKR» đụng hàng số của Họp tuần (Hỏi-3). Hàm ngày còn lại dùng chung — ai gộp sau dùng lại.
- **HT2 `hop-tuan-tren-bang`.** Cùng `hop-tuan.tsx`, làm sau HT1 trên dãy V2. HT1 chỉ chạm đầu thẻ (hàng số) và các
  nhánh rỗng; HT2 chạm các dòng của bảng.
- **HT4 `tom-tat-tuan-dang-cho`.** Khối Tóm tắt tuần nằm dưới hàng số; HT1 không đổi `khoi-tom-tat.tsx`.
- **Tin sáng** `nhac-ke-hoach.ts` mang `donOkr=pb:` — không bị chuyển; HT1 không chạm `apps/agent`.

## Dữ liệu đo

Bộ OKR mẫu (`bun run okr:mau`) có OneHub mang KR công bố, nên thiếu ca «bộ chưa có KR công bố» và «chu kỳ chưa chạy»
trên màn. S3 thêm một ca vào bộ mẫu (`apps/api/scripts/okr-mau/ca-hop-tuan.ts`), qua đường ghi thật (service), theo
luật «Lộ trình là việc dựng» của `CLAUDE.md`:

- một chu kỳ `lap-ke-hoach` bắt đầu sau hôm nay;
- một chu kỳ đang chạy riêng của ca (chu kỳ con trong quý mẫu) mà bộ OneHub không có mục tiêu công bố, còn ít nhất hai
  bộ phận hay phòng ban chưa xếp có KR công bố và có lần cập nhật — màn production 22/10;
- trong chu kỳ đang chạy, một phòng ban có trưởng nhưng không KR công bố;
- một thành viên không dẫn đơn vị nào, có phòng ban chính; một quản trị không dẫn đơn vị nào.

Bài kiểm API và DOM dựng dữ liệu riêng, không dựa bộ mẫu.

## Ngoài phạm vi

- Các kiểu xem khác (OKR, Việc, Sơ đồ, Chấm điểm) không kèm `donOkr` vẫn mở bộ OneHub như VK3.
- Nhớ bộ người xem chọn lần trước — luật mặc định không đọc lịch sử.
- Ô số bấm được để lọc bảng; số tuần trước hay xu hướng trong ô.
- Ghi chú mới nhất và mức đổi trên dòng, cập nhật từ dòng, ‹ › theo thứ tự bảng (HT2); chế độ trình chiếu (H9).
- Đổi tin sáng hay thông báo trong app.
- Thêm khoá vào đầu ra `okr.hopTuan` hay thủ tục API mới (xem mục 1 và 4).

## Tệp dự kiến

- `packages/validation/src/okr-bo-hop-tuan.ts` — `boHopTuan` (mới).
- `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`, `theo-don-vi/chuyen-hop-tuan.ts` (mới) — chuyển hướng.
- `apps/app/app/(app)/[slug]/okr/tab-okr.ts`, `thanh-ben-muc-tieu.tsx` — mục thanh bên.
- `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`, `o-so-hop.ts` (mới), `ly-do-rong.ts` (mới), `don-vi-co-kr.tsx` (mới).
- `apps/app/lib/messages/okr-hop-tuan-bo.ts` (mới, vi và en) — không sửa `okr-toan-canh.ts` mà HT2, HT4 cùng chạm.
- `apps/api/src/okr/okr-xem.service.ts` — một dòng `tuanDau`.
- `apps/api/scripts/okr-mau/ca-hop-tuan.ts` (mới) — ca đo.
- Bài kiểm: `apps/api/test/hop-tuan-mo-dung-bo.spec.ts`, `apps/app/test/hop-tuan-mo-dung-bo.spec.ts`,
  `apps/app/test/hop-tuan-mo-dung-bo.dom.tsx`; bàn đo `_acceptance/hop-tuan-mo-dung-bo/rang/`.
