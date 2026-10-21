# Một nút tạo mục tiêu — thiết kế (VK9)

Hàng VK9 của `docs/plan/lo-trinh-okr.json`, mốc «Vỏ khu Mục tiêu 26/10», đứng trên VK2 (#516, đã gộp).
Ô Cổng Đáng: `_acceptance/mot-nut-tao-muc-tieu/opportunity.md` (ký 19/10).

## Vấn đề

Sau VK2, bốn màn có đầu trang của khu (Của tôi, Bộ OKR, Lấy ý kiến, Sức khoẻ) cùng dựng một hàng nút
(`HanhDongKhu`, `okr/hanh-dong-khu.tsx`): «Hỏi Kara» · nút «…» chỉ chứa «Nhập từ bảng tính» · nhóm «Soạn OKR
cùng Kara» kèm nút «i» (chỉ ở pha lập kế hoạch) · «Thêm mục tiêu» (nút chính). Thêm «Bắt đầu từ mẫu» và «Viết
mục tiêu tay» nằm trong ngăn tạo mục tiêu. Kết quả: các đường tạo mục tiêu nằm rải ở đầu trang, trong menu,
trong ngăn; và nút chính «Thêm mục tiêu» hiện cả ở Lấy ý kiến và Sức khoẻ — hai màn chỉ đọc mục tiêu — trái nếp
«Trang chỉ đọc không có nút chính» của `docs/design.md`.

Tability làm khác: một nút mở hộp chọn đường (ghi ở `vi_sao` của hàng VK9; báo cáo rà UX 18/10 không mở được
từ phiên này, nên thiết kế dựa trên câu giao, bản phạm vi `docs/plan/pham-vi-okr-vo-khu-1810.md` mục B3 và mã).

## Thiết kế

**Đầu trang.** Hàng nút đầu trang chỉ còn: «Hỏi Kara» (viền, như hôm nay, theo luật «một nút gọi Kara chính
mỗi màn» của `docs/ai-ux.md`) và — chỉ ở Của tôi và Bộ OKR — «Thêm mục tiêu» (nút chính, giữ
`data-nut="them-muc-tieu"`). Nút «…» và nhóm Soạn rời đầu trang ở mọi pha. Lấy ý kiến, Sức khoẻ, Sơ đồ và sơ
đồ quanh một mục tiêu không có nút tạo nào. Nút bấm trong thân trang (mở lượt Lấy ý kiến, Xuất kỳ ở Sức khoẻ)
không đổi.

**Hộp chọn đường.** «Thêm mục tiêu» mở một `Dialog` của `packages/ui`: tiêu đề «Thêm mục tiêu», câu mô tả
gọi tên đơn vị đích (đơn vị Bộ OKR đang xem; ở Của tôi là đơn vị `donDich` chọn — đúng đơn vị nút hôm nay
nhắm tới). Thân là một `ItemGroup` bốn dòng, mỗi dòng là một nút trọn dòng (`Item asChild` bọc `<button>`) có
biểu tượng, tiêu đề, một câu mô tả:

1. **Tự viết** — mở ngăn tạo mục tiêu (`HopThoaiMucTieu`) như hôm nay.
2. **Từ mẫu** — mở ngăn ở bước chọn mẫu (`ChonMau` của `okr/tu-mau.tsx`).
3. **Từ bảng tính** — mở hộp nhập (`HopThoaiNhapOkr`).
4. **Soạn cùng Kara** — mang dấu Kara (`KaraMark`); mở cuộc soạn (`okr.soanMo`) trong khung bản ghi; có cuộc
   đang mở thì dòng thành «Tiếp cuộc đang soạn» và mở lại cuộc đó.

Bấm một dòng là đi luôn: không đường nào ghi gì lúc chọn — mỗi đường mở hộp riêng của nó, nơi người còn huỷ
được. Đường nào không đi được thì (theo khuyến nghị của Hỏi-3; lối khác là ẩn như nút Soạn hôm nay) dòng vẫn hiện, khoá (`aria-disabled`), câu mô tả thay bằng lý do: Từ mẫu khi
cấp của đơn vị đích chưa có mẫu; Soạn cùng Kara khi chu kỳ không ở pha lập kế hoạch hoặc một trong các khoá của
`NutSoan` hôm nay (hết cuộc, hết trần tháng, chưa bật cho đơn vị, chưa cấu hình). Câu lý do lấy từ cùng bảng
chữ khoá của `NutSoan`, thêm đúng một câu mới cho pha.

**Một chỗ chọn.** Ngăn tạo mục tiêu bỏ nút «Bắt đầu từ mẫu»; bước mẫu bỏ «Viết mục tiêu tay», giữ «Chọn mẫu
khác». Muốn đổi đường thì đóng ngăn rồi chọn lại trong hộp.

**Đường dẫn.** Hộp chọn ghi trên đường dẫn bằng `nuqs` như mọi hộp tạo của kho (`SEARCH_PARAM.dialog.create`
của deals/contacts), tải lại vẫn mở. Tên tham số, cách mã hoá đường và việc ánh xạ `?create=true`/`?nhapOkr=true`
cũ chốt ở S2 — chỉ khu OKR phát hai tham số này (đã quét `apps/app`, `apps/api`, `apps/agent`).

**Của tôi.** Hộp chọn mở tại chỗ. Tự viết, Từ mẫu, Từ bảng tính chuyển sang Bộ OKR của đơn vị đích với hộp của
đường đó mở — như nút hôm nay đã dẫn sang `/okr/bo-okr?donOkr=<đích>&create=true` — để mục tiêu vừa tạo hiện
ngay trong danh sách của đơn vị. Soạn cùng Kara mở khung bản ghi tại chỗ (khung bản ghi sống ở mọi màn).

**Quyền.** Không đổi: `useQuyenKhu` chọn đơn vị đích và quyền; người không sửa được đơn vị đích thấy «Thêm mục
tiêu» khoá kèm dòng lý do (`khoaTao.*`). Mở thẳng đường dẫn hộp chọn hay một đường khi không có quyền: tham số
bị gỡ (`BoKhoaUrl`, như `NganTaoMucTieu` và `HopNhapTheoUrl` hôm nay), không hộp nào mở.

**Không đổi API.** Bốn đường gọi đúng các thủ tục hôm nay: `okr.createObjective`, `okr.taoTuMau`,
`okr.previewImport`/`okr.applyImport`, `okr.soanMo`.

## Rủi ro đã thấy

- **Thước hồ sơ đã ký.** 11 hồ sơ đã ký có thước đọc đầu trang cũ hay bấm đường cũ (`them-cach`,
  `nhap-bang-tinh` dạng mục menu, `data-nhom-soan` ở đầu trang, «Thêm mục tiêu» mở thẳng ngăn, «Bắt đầu từ mẫu»
  trong ngăn): `canh-kr-okr`, `cau-truc-to-chuc`, `cua-toi-ba-phan`, `dat-okr-trong-crm`,
  `dieu-huong-khu-muc-tieu`, `khung-okr-truoc-r1`, `okr-loai-hoc-tap`, `okr-soat-anh-luot-3`, `okr-to-chuc-va`,
  `soan-okr-trong-khung`, `trang-don-vi-mot-bang`. Luật tạm 18/10 cấm máy tự sửa thước hồ sơ đã ký → câu hỏi Hỏi-1
  ở Cổng Phạm vi.
- **Tệp chữ chung.** `apps/app/lib/messages/okr*.ts` thuộc làn Mac Studio (luật 19). Luật 7: chỉ thêm dòng;
  khoá thôi dùng (`khoaTao.themCach`, có thể `nhapBangTinh`, `tuMau.vietTay`) phải gỡ bằng yêu cầu `cham-tep` nếu
  bộ canh chữ (`messages-guard`) đòi.
- **Bài DOM của kho đang canh hàng nút cũ** (`okr-dau-trang-khu.dom.tsx`, `khung-okr-truoc-r1.dom.tsx`,
  `okr-to-chuc-va.dom.tsx`, `okr-cua-toi-ba-phan.dom.tsx`, `khung-tao-okr.dom.tsx`, `okr-canh-kr.dom.tsx`) — chúng
  là tệp kiểm mà eval của hồ sơ đã ký gọi, nên đi cùng Hỏi-1.
- **Đường nền chưa chạy.** Phiên S1 này nằm ngoài các dãy của đợt nên không xin khoá `duong-nen`; dãy nhận hàng
  chạy đường nền trước S3.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bộ OKR của đơn vị mình → «Thêm mục tiêu» → hộp chọn → chọn một đường → hộp của đường ấy (ngăn
  tạo, ngăn từ mẫu, hộp nhập, khung soạn) → lưu → mục tiêu nháp hiện trong Bộ OKR (điểm ra: Bộ OKR của đơn vị đích).
- Từ Của tôi: «Thêm mục tiêu» → hộp chọn tại chỗ → Tự viết / Từ mẫu / Từ bảng tính chuyển sang Bộ OKR của đơn vị
  đích với hộp đường ấy mở; Soạn cùng Kara mở khung bản ghi tại chỗ.
- Biên: đơn vị đích chưa có mẫu → dòng Từ mẫu khoá kèm lý do; chu kỳ ngoài pha lập kế hoạch hay Kara bị khoá →
  dòng Soạn khoá kèm lý do; có cuộc soạn đang mở → dòng thành «Tiếp cuộc đang soạn».
- Lỗi & quay lại: không có quyền → nút khoá kèm dòng lý do, đường dẫn mở thẳng bị gỡ tham số; quyền đang tải →
  nút ở khung chờ như hôm nay; đổi ý ở hộp của một đường → đóng hộp ấy rồi bấm «Thêm mục tiêu» chọn lại; Esc ở
  hộp chọn → đóng, focus về nút.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đầu trang Của tôi, Bộ OKR | mở việc tạo mục tiêu bằng một nút | thanh bên khu / hộp chọn đường |
| Đầu trang Lấy ý kiến, Sức khoẻ, Sơ đồ | đọc, không tạo | thanh bên khu / — |
| Hộp chọn đường | chọn một trong bốn đường tạo | nút «Thêm mục tiêu» / hộp của đường đã chọn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dau-trang-tao-duoc | Của tôi, Bộ OKR | «Hỏi Kara» viền · «Thêm mục tiêu» nút chính | bấm «Thêm mục tiêu» |
| ST-dau-trang-khoa | Của tôi, Bộ OKR | «Thêm mục tiêu» khoá, dòng lý do dưới tiêu đề (`khoaTao.*`) | đọc lý do, nhờ trưởng đơn vị |
| ST-dau-trang-dang-tai | Của tôi, Bộ OKR | khung chờ ở chỗ nút như hôm nay | chờ |
| ST-dau-trang-chi-doc | Lấy ý kiến, Sức khoẻ, Sơ đồ | không nút tạo, không nút chính | đọc |
| ST-hop-bon-duong | Hộp chọn | tiêu đề, câu đơn vị đích, bốn dòng mở được | bấm một dòng |
| ST-hop-mau-khoa | Hộp chọn | dòng Từ mẫu khoá, lý do «chưa có mẫu cho cấp này» | chọn đường khác |
| ST-hop-soan-khoa | Hộp chọn | dòng Soạn cùng Kara khoá, lý do theo khoá (pha, hết cuộc, hết trần, chưa bật, chưa cấu hình) | chọn đường khác |
| ST-hop-soan-tiep | Hộp chọn | dòng «Tiếp cuộc đang soạn» | mở lại cuộc đang soạn |
| ST-hop-dien-thoai | Hộp chọn ở 375 | hộp vừa màn, bốn dòng đọc trọn | bấm một dòng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mỗi dòng là một `<button>` thật: Tab đi qua bốn dòng theo thứ tự, Enter/Space chọn; dòng khoá mang
  `aria-disabled` và vẫn đọc được lý do (không `disabled` làm mất focus và lý do). Không `autoFocus` trên điện thoại.
- Esc và nút đóng: đóng hộp, xoá tham số đường dẫn, trả focus về «Thêm mục tiêu» (Dialog của Radix).
- Hộp mở ghi trên đường dẫn (`nuqs`); tải lại giữ hộp mở; quay lại của trình duyệt đóng hộp.
- Chữ: mọi chữ mới qua `apps/app/lib/messages`, có cả tiếng Việt và tiếng Anh; nhãn qua phép thử «xoá một chữ»
  của `CLAUDE.md`; tên đơn vị là dữ liệu người nhập, không dịch, mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Dialog`, `DialogHeader`, `DialogTitle`, `DialogDescription` | dùng | hộp mặc định của `packages/ui` |
| `ItemGroup`, `Item asChild`, `ItemMedia`, `ItemTitle`, `ItemDescription` | ghép | cùng khuôn `ChonMau` (`okr/tu-mau.tsx`) — danh sách chọn trong khu đã dùng |
| `Item` — kiểu dòng khoá | mở rộng (nếu thiếu) | `Item` chưa có kiểu cho nút `aria-disabled`; thêm biến thể ở `packages/ui`, không `className` tại chỗ |
| `KaraMark` | dùng | dấu tia sáng của dòng Soạn cùng Kara (`docs/ai-ux.md` mục 2) |
| `Button` | dùng | «Thêm mục tiêu» giữ nút chính sẵn có |

Bậc «vẽ tay là bậc cuối»: dừng ở bậc 1 (`packages/ui`); đã tra `item`, `dialog`, `radio-group`, `field`,
`dropdown-menu`, `pick-list-dialog` — không có ChoiceCard hay SplitButton, và không cần.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: một điểm vào (hộp chọn) toả ra bốn đường độc lập, mỗi đường có hộp riêng — đúng mô tả «một nút mở hộp
chọn đường» của Tability ở `vi_sao` hàng VK9. Không tra mẫu thị trường thêm: khuôn hiển nhiên từ câu giao; wizard
bị loại vì không có bước chung giữa bốn đường.
<!-- UX-SPEC-TEMPLATE>>> -->
