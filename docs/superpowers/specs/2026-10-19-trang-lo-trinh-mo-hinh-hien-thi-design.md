# Trang Lộ trình đọc mô hình hiển thị — thiết kế (LT1f)

Hồ sơ: `_acceptance/trang-lo-trinh-mo-hinh-hien-thi/` · hàng LT1f `docs/plan/lo-trinh-okr.json` · đợt
`lo-trinh-tin-hieu`, dãy L1 · Cổng Đáng: build, Phan Le Manh 19/10.

## Vấn đề

Kit 2.33.0 (nhận ở #483) đưa luật hiển thị của khối Mốc về MỘT chỗ: bộ vẽ `LO-TRINH.html` tính `moHinhHienThi` và ghi
năm khoá vào khối dữ liệu — `hang[].ten_hien_thi`, `moc[].hien`, `moc[].viec_hien`, `moc[].con_lai`,
`lo_trinh[].chua_hen_moc`. Mục 4 phần «crm, theo thứ tự» của CHANGELOG 2.33.0: «Trang Lộ trình trong sản phẩm đọc năm
khoá mô hình hiển thị thay vì tự lọc, kèm một ca đối chiếu trang với tập hiển thị của khối».

Trang Lộ trình của CRM hôm nay đã có khuôn đọc mang năm khoá (#483) nhưng không dùng khoá nào: `phangViec` tự gán mốc
đầu tiên chứa mã, `XemMoc` tự lọc mốc có việc và tự gom việc không mốc, mọi chỗ hiện tên việc đọc `cau_giao`, bộ lọc
mốc liệt mốc có `hang` không rỗng. Đo 19/10 trên `LO-TRINH.html` của cây: ba lộ trình, 194 việc, 23 mốc — luật tự lọc
và năm khoá cho ra cùng tập. Hai luật trùng nhau hôm nay là may: luật của trang và luật của kit là hai nguồn sự thật,
lần đầu kit đổi luật (hay một hàng có câu giao rỗng, một mốc gắn mã không có hàng, một mã trùng) thì trang CRM và
`LO-TRINH.html` nói hai điều khác nhau về cùng một lộ trình.

## Cách làm (đã chọn)

1. **Một hàm ở biên đọc** `apps/app/lib/lo-trinh/mo-hinh.ts` — `moHinhCua(lo)` trả về cho một lộ trình: mốc của từng mã
   (mốc mà `viec_hien` liệt mã), tập mã chưa hẹn mốc, tập mốc hiện, số còn lại / tổng của mốc, và `coMoHinh`. Khối mang
   mô hình (mọi mốc có `hien` khác `null` và mọi việc có `ten_hien_thi` khác `null`) → đọc thẳng năm khoá. Khối đời trước
   (bản chụp cũ trong cơ sở dữ liệu, tệp đóng gói cũ) → giữ đúng luật tự lọc hôm nay — CHANGELOG 2.33 cho phép: «bộ đọc
   của kho tiêu thụ giữ luật lọc riêng của mình tới khi trang được vẽ lại».
2. **Mọi chỗ của trang đi qua hàm đó**: `phangViec` (cột Mốc của bảng, bảng cột, ngăn hồ sơ, bộ lọc «Chưa hẹn mốc», cờ
   trễ), `XemMoc` (mốc hiện, việc dưới mốc, nhóm chưa hẹn mốc), `tuyChonLoc` và danh sách chọn mốc của bộ lọc (chỉ mốc
   hiện). Năm khoá liệt MÃ, không liệt hàng: hai hàng cùng mã đều hiện dưới mốc của mã (trang không lọc thêm ngoài
   khoá); `LO-TRINH.html` chỉ liệt hàng đầu — giới hạn đã khai ở Notes hợp đồng, 0 mã trùng lúc đo.
3. **Tên việc là `ten_hien_thi`** (vắng thì `cau_giao` như cũ) ở bảng, bảng cột, dòng việc của kiểu xem Mốc, tiêu đề ngăn
   hồ sơ; ô tìm kiếm khớp cả tên hiển thị.
4. **Dòng số của mốc** đọc `con_lai` và độ dài `viec_hien`: «còn n/m việc» (kèm «· k đã giao» khi có, k = m − n), hoặc
   «đã giao đủ m việc» — giống từng chữ dòng số của `LO-TRINH.html` (bộ vẽ tính k cùng cách). Tiếng Anh (chữ mới, kit
   không có): «n of m left» · «k delivered» · «All m delivered», theo giọng ngắn của nhãn tiếng Anh sẵn có («No milestone
   yet»). Đặt là một dòng chữ phụ ngay dưới dòng tên lộ trình của mốc, ở mọi bề rộng. Số là của mốc, không đổi theo bộ
   lọc của người xem.
5. **Cờ vàng «khối chưa mang mô hình hiển thị»** không bật hộp «Trang có thể thiếu một phần»: khối mới không mang cờ ấy;
   khối cũ được đọc bằng luật cũ nên phần trang hiện vẫn đúng, và câu của hộp («dữ liệu mới hơn trang») sai với khối cũ.
   Cùng tiền lệ cờ «chưa có giờ máy» của LT1e (`canhBaoChoTrang` trong `doc-trang.ts`).

Bỏ: (a) bỏ luật cũ, chỉ đọc khoá — chết vì bản chụp đời trước trong cơ sở dữ liệu điền `hien: null`, `chua_hen_moc: []`,
trang sẽ hiện 0 mốc; (b) trang tự tính lại `moHinhHienThi` bằng bản chép TS — đúng cái hai-nguồn-sự-thật cần bỏ.

## Không gian tiêu chí (quét hình thái)

- Ngữ cảnh: chân sản phẩm [SUY-TỪ-REPO: apps/app/components/lo-trinh/xem-moc.tsx] [SUY-TỪ-REPO:
  scripts/lo-trinh.mjs] · chân ngành [NGÀNH: Linear — project milestones, việc không thuộc mốc nào gom dưới «No
  milestone»; mốc đếm việc xong / tổng].
- Trục A — nguồn khối: tệp đóng gói mới | tệp đóng gói cũ | bản chụp mới | bản chụp cũ [thước CE: hai đường đọc của
  `doc-trang.ts`].
- Trục B — khoá: `ten_hien_thi` | `hien` | `viec_hien` | `con_lai` | `chua_hen_moc` [thước CE: CHANGELOG 2.33.0 «năm
  khoá»].
- Trục C — chỗ hiện: kiểu xem Mốc | bảng | bảng cột | ngăn hồ sơ | bộ lọc mốc | tìm kiếm [SUY-TỪ-REPO:
  apps/app/components/lo-trinh/].
- Trục D — ca dữ liệu: khoá khớp luật cũ | khoá lệch luật cũ | câu giao rỗng | mốc gắn mã không có hàng.
- Core: khoá thắng luật cũ ở việc→mốc (AC-1) · mốc hiện + dòng số (AC-2) · chưa hẹn mốc (AC-3) · tên ở mọi chỗ (AC-4) ·
  đối chiếu khối thật (AC-5) · khối cũ và bản chụp (AC-6) · màn thật (AC-7).
- Later: hiện cờ «hai việc cùng mã» trên trang (kit đã có cờ `ma-trung` ở «Cần sửa») · tên ngắn trên thẻ bảng cột.
- Never: trang tự tính mô hình hiển thị — kit là nguồn duy nhất.

## Đối trọng chuẩn nội

`feature_loop.ui_standards_skill: web-design-guidelines` — đã nạp ở S1; soát cuối S3 (19/10) bộ luật Vercel lên
`xem-moc.tsx`, `dong-lien-quan.tsx`, `bang-cot.tsx`, `ho-so-viec.tsx`: số dùng chữ số và `tabular-nums`, tên người nhập
mang `translate="no"`, tên rỗng có lối lùi — đạt. Một điều có từ trước, không do vòng này: nhóm «Chưa hẹn mốc» liệt tới 99
việc mà không ảo hoá danh sách (luật «trên 50 mục») — để ngoài phạm vi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Lộ trình → «Xem theo mốc» → mỗi mốc hiện ngày, tên, dòng «còn n/m việc», việc chưa giao theo tên → nhóm «Chưa
  hẹn mốc n» ở cuối, bấm «Xem» mở danh sách → bấm một việc mở ngăn hồ sơ (điểm ra: ngăn hồ sơ).
- Biên: mốc đã giao đủ (vòng đời «Tất cả») → «đã giao đủ m việc»; mốc khai trong kế hoạch mà không việc nào thuộc → không
  hiện, không vào bộ lọc; việc có câu giao rỗng → tên hiển thị từ kit (tên ngắn → tên → mã), không dòng trống.
- Lỗi & quay lại: khối đời trước → trang hiện như hôm nay, không hộp cảnh báo mới; khối hỏng → `VungTaiLoi` như cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lộ trình · Xem theo mốc | Thấy mỗi mốc còn bao nhiêu việc, việc nào chưa hẹn mốc | thanh bên / ngăn hồ sơ |
| Lộ trình · Bảng, bảng cột | Đọc việc theo tên hiển thị, lọc theo mốc | thanh bên / ngăn hồ sơ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-moc-con-viec | Xem theo mốc | Dòng mốc + «còn 3/5 việc · 2 đã giao» + việc lọc được | bấm việc |
| ST-moc-giao-du | Xem theo mốc | «đã giao đủ 4 việc» (chỉ khi vòng đời cho thấy việc đã giao) | không |
| ST-moc-chua-hen | Xem theo mốc | «Chưa hẹn mốc 7» gập, nút «Xem» | mở nhóm |
| ST-moc-trong | Xem theo mốc | `KhungTrong` «không khớp» như cũ | xoá bộ lọc |
| ST-moc-khoi-cu | mọi kiểu xem | Như hôm nay, không hộp cảnh báo «khối chưa mang mô hình» | không |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dòng số của mốc không đổi theo bộ lọc (số của mốc); danh sách việc dưới mốc vẫn theo bộ lọc như cũ.
- Tên mốc, tên việc, tên lộ trình mang `translate="no"`; số dùng `tabular-nums`.
- Dòng số là dòng riêng dưới tên lộ trình ở mọi bề rộng (375 và 1280), không cuộn ngang.
- Chữ: vi «còn 3/5 việc · 2 đã giao» · «đã giao đủ 4 việc»; en «3 of 5 left · 2 delivered» · «All 4 delivered».

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Timeline` (ReUI, `packages/ui`) | dùng | khung kiểu xem Mốc đã có |
| `Collapsible` + `SectionHeading` | dùng | nhóm «Chưa hẹn mốc» đã có |
| `Item` (`DongLienQuan`) | dùng | dòng việc đã có, chỉ đổi nguồn tên |
| chữ phụ `text-muted-foreground text-xs` | dùng | dòng số cùng kiểu dòng tên lộ trình ngay trên |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi khuôn — trang đã là danh sách việc + ngăn hồ sơ (LT1, LT1b); vòng này chỉ đổi nguồn dữ liệu và thêm một
dòng chữ phụ, một khuôn khả dĩ duy nhất nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
