# Sơ đồ quanh một mục tiêu — thiết kế (DH5)

Hàng DH5 của `docs/plan/lo-trinh-okr.json`, đợt `okr-dieu-huong-1410` (mã D5), mốc m-1021dh. Cổng Đáng ký
`build` 15/10 (`_acceptance/so-do-quanh-muc-tieu/opportunity.md`): ≥ 2/3 trưởng đơn vị dự phiên nghiệm thu nói đúng
KR công ty mà mục tiêu góp vào trong ≤ 10 giây kể từ lúc bấm «Xem quanh mục tiêu».

Dựng trên khung vẽ `FlowMap` của DH4 (`so-do-can-chinh-don-vi`, nhánh đã gộp vào nhánh này ở `1dd99f536`): giữ
`focusId` (đèn đường đi khi rê chuột qua `pathAround`), `centerId` (lia tới một nút), `FlowMapNode`/`FlowMapCard`,
`FlowMapEdgeData.kind` = `lien | dut | an`. Vòng này KHÔNG sửa `flow-map.tsx` hay `flow-layout.ts`.

## Vấn đề

Ngăn chi tiết mục tiêu chỉ trả lời «góp vào đâu» một bậc lên (khu «Đường lý do», `KhuGopVao`), không có gì cho
«ai góp vào mục tiêu này»; hàng bảng chỉ ghi «góp vào n chỗ». Muốn biết mục tiêu phòng ban đỡ KR nào của công ty
phải lần tay qua cây căn chỉnh của cả kỳ.

## Cách làm

### Dữ liệu — truy vấn `okr.quanhMucTieu({ objectiveId })`

- Hàm thuần mới `gopQuanhMucTieu(mts, tamId)` ở `apps/api/src/okr/quanh-muc-tieu.ts`; service
  `OkrXemService.quanhMucTieu(userId, objectiveId)` đọc kỳ của mục tiêu rồi gọi `OkrService.mucTieuCuaCay(userId,
  cycleId)` — đúng tập mục tiêu (đã lọc quyền, gộp kỳ cha và kỳ con có góp vào) mà cây căn chỉnh dùng cho cùng người
  xem. Không đọc `OkrAlignment` theo đường riêng, không sửa `can-chinh.ts` (rào `cay-can-chinh-co-ly-do`).
- Mục tiêu tâm không có trong tập ấy (không tồn tại hoặc người xem không thấy) → `NOT_FOUND`, cùng mã với
  `okr.objective`.
- **Phía trên — đi lên tới hết.** Từ tâm, với mỗi căn chỉnh của một mục tiêu X trên đường: đích là KR k của mục tiêu
  P → nút k và nút P, cạnh P→k (KR của mục tiêu) và k→X (góp); đích là mục tiêu P → cạnh P→X. Lặp với P cho tới khi
  không còn căn chỉnh nào. Mỗi mục tiêu, mỗi KR là MỘT nút dù nhiều đường đi qua nó (tập đã thăm) — đó là «góp hai
  chỗ hiện một lần», và cũng là thứ chặn vòng lặp căn chỉnh nếu dữ liệu có. Chỉ KR nằm trên đường mới thành nút; các
  KR khác của P không vẽ.
- **Phía dưới — một bậc.** Mọi KR của tâm (cạnh tâm→k), và mọi mục tiêu C có căn chỉnh tới tâm (cạnh tâm→C) hoặc tới
  một KR k của tâm (cạnh k→C). Không đi xuống bậc hai. C đã nằm phía trên (vòng lặp) thì bỏ cạnh xuống đó.
- **Đích nằm ngoài tập đọc được.** Căn chỉnh của một mục tiêu trên đường mang id đích; đích không có trong tập `mucTieuCuaCay` của người xem (mục tiêu giới hạn) thì bỏ hẳn — không nút, không cạnh, không tên — dù đích nằm phía trên hay phía dưới.
- **Góp lên công ty.** Đầu ra mang sẵn danh sách `gopLenCongTy`: mọi KR phía trên thuộc mục tiêu cấp `onehub` mà
  một cạnh góp đi xuống từ nó, và mọi mục tiêu cấp `onehub` phía trên nhận cạnh góp thẳng (không qua KR — ghi
  `kr: null`). Tâm là mục tiêu cấp `onehub` → `laCongTy: true`, danh sách rỗng. Danh sách này là câu trả lời trực
  tiếp cho ngưỡng 10 giây — màn in nó thành một dòng trên khung vẽ.
- Cạnh mang `loai: "cua" | "gop"`; khung vẽ dùng `lien` cho cả hai (KR nhỏ hơn mục tiêu nên phân biệt bằng hình
  thẻ, không bằng nét — nét đứt đã mang nghĩa «góp chéo» ở DH4).

### Màn — trang `/<slug>/okr/quanh-muc-tieu/<objectiveId>`

- Trang riêng, không phải trạng thái của Toàn cảnh: Toàn cảnh là vật của DH4 đang ở bước chấm — sửa nó làm hoá cũ
  bằng chứng DH4. Trang chi tiết đứng ngoài thanh thẻ năm mục của khu Mục tiêu, như trang soạn.
- `page.tsx` dựng `PageShell` với tiêu đề «Sơ đồ quanh mục tiêu» và một câu mô tả; thân là thành phần khách.
- Thân, từ trên xuống: dòng «Đang xem quanh: <tên mục tiêu>» · dòng góp lên công ty («Góp lên công ty qua KR «…»
  của mục tiêu «…»», nhiều chỗ thì liệt kê; «Đây là mục tiêu cấp công ty»; «Không thấy đường lên công ty trong phạm vi bạn xem được.» — câu đúng cả khi chưa gắn căn chỉnh lẫn khi đường lên đi qua mục tiêu người xem không thấy, và không lộ mục tiêu ẩn) · một câu
  chú thích («Phía trên: những gì mục tiêu này góp vào. Phía dưới: KR của nó và những mục tiêu góp vào nó. Rê chuột
  lên một thẻ để làm nổi đường đi.») · khung vẽ cao 600px, `focusId` = `centerId` = tâm.
- Thẻ mục tiêu: tên, đơn vị, tiến độ; mục tiêu cấp công ty mang nhãn «Công ty». Thẻ KR nhỏ hơn: tên, tiến độ; KR của
  mục tiêu công ty cũng mang nhãn «Công ty». Thẻ tâm `active`.
- Bấm (hoặc Enter/Space) một thẻ mục tiêu → mở ngăn chi tiết của mục tiêu đó (`openRecord objective`); thẻ KR → ngăn
  KR (`openRecord kr`). Ngăn có nút «Xem quanh mục tiêu» nên người lần tiếp lên được.
- Dưới `md`: không dựng khung vẽ; cùng dữ liệu thành danh sách `Item variant="outline"` bốn nhóm theo thứ tự đọc:
  «Góp vào» (phía trên, từ công ty xuống), «Mục tiêu này», «KR của nó», «Góp vào nó».

### Lối vào — nút trong ngăn chi tiết mục tiêu

- `ObjectiveSheet` thêm một nút viền «Xem quanh mục tiêu» ở hàng `actions` (trước «Theo dõi»), là `Link` tới trang
  trên — Cmd/Ctrl-bấm mở thẻ mới được. Hiện với mọi mục tiêu đọc được; không đổi khu «Đường lý do» hay tab
  «Căn chỉnh».
- Giá: tệp ngăn nằm trong `paths` của 32 eval máy thuộc 13 hồ sơ đã ký — chạy lại hết ở mỗi lượt chấm (AC-12). Lối
  không chạm ngăn (liên kết từ dòng «góp vào n chỗ» ở hàng bảng mục tiêu, `khoi-muc-tieu.tsx`) chỉ kéo 5 eval nhưng
  lệch câu giao «lối vào từ ngăn chi tiết mục tiêu» — câu hỏi cho người ở Cổng Phạm vi (sổ, Hỏi-1).

### Chữ

Khối chữ mới ở `apps/app/lib/messages/okr-quanh.ts` (vi + en), không thêm vào `okr.ts` — tệp đó nằm trong `paths` của
16 hồ sơ đã ký và DH1, DH4 cùng sửa. Tên mục tiêu, KR, đơn vị mang `translate="no"`. Không có chữ AI nào (luật một tên
«Kara», `docs/ai-ux.md` §1, không áp vì vòng không có phần Kara).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: ngăn chi tiết mục tiêu → bấm «Xem quanh mục tiêu» → trang sơ đồ, tâm ở giữa, dòng «Góp lên công ty qua KR
  «…»» trên khung (điểm ra: bấm một thẻ mở ngăn chi tiết của nó; nút «Xem quanh mục tiêu» trong ngăn đó đổi tâm).
- Biên: tâm ở kỳ quý góp lên KR công ty ở kỳ năm (`mucTieuCuaCay` gộp kỳ cha); tâm là mục tiêu công ty (không có gì phía trên); tâm chưa góp vào đâu và không ai góp vào (chỉ tâm + KR);
  đường lên bị cắt vì người xem không thấy một mục tiêu phía trên (đường dừng ở đó, không nhắc gì tới mục tiêu ẩn; dòng góp lên công ty dùng cùng câu với ca chưa gắn).
- Lỗi & quay lại: truy vấn hỏng → `VungTaiLoi` có nút thử lại; mục tiêu không tồn tại hoặc không được xem → câu «Không
  tìm thấy mục tiêu này, hoặc bạn không có quyền xem.» kèm liên kết về Toàn cảnh; quay lại bằng nút lùi của trình
  duyệt.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Sơ đồ quanh mục tiêu | Cho thấy mục tiêu góp lên KR công ty nào và ai góp vào nó | Nút trong ngăn chi tiết mục tiêu / ngăn chi tiết của thẻ được bấm |
| Ngăn chi tiết mục tiêu (đã có) | Thêm lối vào sơ đồ | Mọi chỗ mở ngăn / trang sơ đồ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-quanh-mac-dinh | Sơ đồ quanh mục tiêu | Tâm giữa khung, phía trên tới KR công ty, phía dưới KR + mục tiêu góp vào; dòng «Góp lên công ty qua KR «…»» | Rê chuột theo đường, bấm thẻ |
| ST-quanh-ro-chuot | Sơ đồ quanh mục tiêu | Thẻ và cạnh ngoài đường đi qua thẻ đang rê mờ đi | Đọc đường |
| ST-quanh-cong-ty | Sơ đồ quanh mục tiêu | Tâm là mục tiêu công ty; dòng «Đây là mục tiêu cấp công ty» | Xem ai góp vào |
| ST-quanh-chua-len | Sơ đồ quanh mục tiêu | Dòng «Không thấy đường lên công ty trong phạm vi bạn xem được.» | Mở ngăn xem tab Căn chỉnh |
| ST-quanh-dang-tai | Sơ đồ quanh mục tiêu | Khung xương cùng hình, chữ cho trình đọc «Đang tải sơ đồ…» | Chờ |
| ST-quanh-loi | Sơ đồ quanh mục tiêu | `VungTaiLoi` «Không tải được sơ đồ» + nút thử lại | Thử lại |
| ST-quanh-khong-thay | Sơ đồ quanh mục tiêu | «Không tìm thấy mục tiêu này, hoặc bạn không có quyền xem.» + liên kết về Toàn cảnh | Về Toàn cảnh |
| ST-quanh-hep | Sơ đồ quanh mục tiêu (< md) | Danh sách bốn nhóm thay khung vẽ | Bấm dòng mở ngăn |
| ST-ngan-nut-quanh | Ngăn chi tiết mục tiêu | Nút viền «Xem quanh mục tiêu» ở hàng hành động | Bấm sang trang sơ đồ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ là phần tử bấm được bằng phím (Enter/Space), vòng tiêu điểm `focus-visible`; ba nút phóng của khung có
  `aria-label` (của DH4).
- `prefers-reduced-motion`: lia tới tâm không có hiệu ứng (khung DH4 đã xử).
- Tên dài: `line-clamp-2` trong thẻ, `min-w-0` ở con flex.
- Trạng thái đang tải và lỗi báo qua `aria-live="polite"`; chữ chờ kết thúc bằng «…».

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `FlowMap`, `FlowMapNode`, `FlowMapCard` (DH4) | dùng | Khung vẽ dùng chung, đèn đường đi có sẵn |
| `PageShell`, `VungTaiLoi`, `Item`, `Badge`, `Button`, `Skeleton` | dùng | Nếp màn trong app (`docs/design.md`) |
| Thẻ mục tiêu / thẻ KR của sơ đồ | ghép | `FlowMapCard` + tiến độ + `Badge` «Công ty» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: hiển nhiên từ câu giao — một mục tiêu làm tâm, phía trên thứ nó góp vào, phía dưới thứ góp vào nó; Tability
tách Dependencies Map (quanh một mục) khỏi Strategy Map (theo đơn vị), đã ghi ở lượt rà 14/10 của đợt.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Lý do căn chỉnh trên đường nối (đã có ở khu «Đường lý do» của ngăn, một bậc).
- Đi xuống quá một bậc; sửa căn chỉnh từ sơ đồ; lối vào từ sơ đồ đơn vị của DH4.
- Đổi `FlowMap`/`flow-layout`, Toàn cảnh, khu «Đường lý do», tab «Căn chỉnh», `can-chinh.ts`.
