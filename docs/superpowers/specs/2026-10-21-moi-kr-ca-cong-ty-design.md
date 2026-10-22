# VK11 · Mọi KR cả công ty — thiết kế (21/10/2026)

Hàng VK11 (`moi-kr-ca-cong-ty`) của `docs/plan/lo-trinh-okr.json`, mã phạm vi `B5b` của
`docs/plan/pham-vi-okr-vo-khu-1810.md`. Câu giao: «Ban lãnh đạo bấm ô Trượt ở Báo cáo › Sức khoẻ và
đọc mọi KR đang trượt của cả công ty trong một danh sách lọc được theo đơn vị và người». Ngưỡng của
ô cơ hội: từ Sức khoẻ tới danh sách KR trượt trong một bấm, bộ lọc ghi trên đường dẫn.

Đầu vào thiết kế: bản mẫu `/proto/vo-khu-muc-tieu` (`2790552ac`, `man.tsx` — `ManSucKhoe`,
`ManMoiKr`), nhóm Báo cáo đã chốt 18/10 là «Sức khoẻ · Mọi KR · Sơ đồ».

## Hôm nay

- `/okr/suc-khoe` dựng trang Toàn cảnh (`toan-canh/page.tsx`): bốn ô số của `ToanCanh` (tiến độ,
  đơn vị công bố, đã cập nhật, tự tin thấp), bảng đơn vị, và với quản trị thêm mục «Chương trình OKR»
  (`SucKhoe`). Không ô nào bấm được; không ô nào đếm KR trượt.
- Tình trạng một KR đã có luật một chỗ: `tinhTrang(progress, expected, kind)` trong
  `packages/validation/src/okr-muc-tieu.ts`; `OkrXemService.khoiCuaToi` dùng nó cho KR của một người.
  Mục tiêu tham vọng và học tập không bao giờ «Trượt» (`CONTEXT.md`, mục Tình trạng).
- Đọc mục tiêu theo quyền người xem: `OkrService.docMucTieu(..., { nguCanh })` lọc bằng
  `dieuKienXemMucTieu`. Không cần sửa tệp T3 nào (`okr-access.service.ts`, `hien-thi.ts`,
  `okr-hien-thi.ts`) — chỉ gọi.
- Ngăn KR một chỗ (VK7, #525): `useMoNganKr()` của `components/crm/record-sheet/dien-bien-kr.ts`.

## Làm gì

1. **API** — một thủ tục chỉ đọc `okr.moiKr({ cycleId, loc })` trong `OkrXemService`. Nguồn dòng: mục
   tiêu `cong-bo` của chu kỳ, cấp OneHub · bộ phận · phòng ban, đọc theo quyền người xem (`docMucTieu`
   với `nguCanh`). Mỗi KR một dòng: KR, mục tiêu, đơn vị, người phụ trách, tiến độ, vạch kỳ vọng, tình
   trạng (cùng luật với `khoiCuaToi`: KR mốc là `moc-xong`/`moc-chua`). Trả `rows` (đã lọc), `total`,
   `facetCounts` cho ba mặt lọc. Một hàm thuần `locMoiKr` trong `apps/api/src/okr/moi-kr.ts` lọc và đếm —
   cùng hàm cho ô số và cho danh sách, nên số ở ô bằng số dòng.
2. **Ô Trượt** — `ToanCanh` thêm ô «KR trượt» vào cuối `StatGroup`, số lấy từ
   `okr.moiKr` (`facetCounts.tinhTrang` của `truot`), bấm sang `/okr/moi-kr?tinhTrangKr=truot` giữ `kyOkr`.
   `StatCard` chưa có dạng liên kết: thêm biến thể trong `packages/ui` (bậc 5 của «Vẽ tay là bậc cuối»).
3. **Trang Mọi KR** — `/okr/moi-kr` (thư mục `okr/moi-kr/`), mục «Mọi KR» trong nhóm Báo cáo giữa
   Sức khoẻ và Sơ đồ. Hàng chip Tình trạng phía trên `DataTable`; mặt lọc Đơn vị và Người phụ trách
   của `DataTable`; cả ba ghi lên đường dẫn bằng `nuqs`. Bấm một dòng mở ngăn KR của VK7 trên chính trang.

## Lựa chọn (sổ ghi căn cứ từng dòng)

- **Ai thấy** — mọi thành viên thấy trang và ô; mỗi người chỉ thấy KR của OKR mình được xem. Toàn
  cảnh đã mở cho mọi vai; khoá riêng cho «ban lãnh đạo» là một vai chưa có trong `OkrAccessService`.
  → Hỏi-1 (khuyên: mở cho mọi vai theo quyền xem).
- **Lọc theo đơn vị** — chọn một bộ phận thì gồm cả phòng ban dưới nó, như cây ở Toàn cảnh. → Hỏi-2
  (khuyên: gồm đơn vị con).
- **KR của mục tiêu cá nhân** — không vào danh sách «cả công ty», như Toàn cảnh và Sức khoẻ đã bỏ cấp
  cá nhân (`khoaCuaMucTieu` trả `null`). → Hỏi-3 (khuyên: không gồm).
- **Ô nào bấm được** — chỉ thêm một ô «KR trượt» bấm được; các ô hiện có giữ nguyên. Bản mẫu đổi cả
  hàng ô thành Đúng nhịp · Chậm nhịp · Trượt · Cập nhật — đó là việc dựng lại Sức khoẻ, không phải
  việc của hàng này. → Hỏi-4 (khuyên: một ô).
- **Tình trạng là hàng chip** `ToggleGroup` nhiều lựa chọn phía trên bảng, như bản mẫu, theo luật «Chip
  lọc» của `docs/design.md`; Đơn vị và Người là mặt lọc của `DataTable` (nhiều giá trị, đổi theo công
  ty). Cả ba ghi lên đường dẫn bằng `nuqs`.
- **Đã bỏ không vào** — chuẩn `docs/vong-doi.md`: danh sách chính chỉ hiện thứ đang dùng.
- **Nháp không vào** — vạch kỳ vọng đếm từ ngày công bố (`kyVongTheoNgay(publishedAt, …)`), nháp không
  có tình trạng. → Hỏi-5 (khuyên: chỉ mục tiêu đã công bố).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên › Báo cáo › Sức khoẻ → bấm ô «KR trượt» → Mọi KR đã lọc «Trượt» (điểm ra: bấm
  một KR mở ngăn KR, đóng ngăn về đúng danh sách đã lọc).
- Biên: chu kỳ không có KR trượt (ô «0», bấm vẫn sang danh sách, câu rỗng nói rõ «Không KR nào đang
  trượt»); người xem hẹp chỉ thấy KR mình được xem, số ở ô đếm đúng phần ấy; đổi chu kỳ ở đầu thanh bên
  thì danh sách đổi theo, bộ lọc giữ.
- Lỗi & quay lại: tải lỗi → `VungTaiLoi` có nút thử lại, tiêu đề trang vẫn còn; lọc không khớp →
  `Empty` có nút «Bỏ lọc».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Sức khoẻ (`/okr/suc-khoe`) | thấy sức khoẻ cả công ty, nhảy vào chỗ trượt | thanh bên / Mọi KR |
| Mọi KR (`/okr/moi-kr`) | đọc mọi KR cả công ty, lọc theo tình trạng, đơn vị, người | thanh bên, ô KR trượt / ngăn KR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-moikr-cho | Mọi KR | tiêu đề, mô tả, khung xương bảng | chờ |
| ST-moikr-loi | Mọi KR | `VungTaiLoi` «Không tải được danh sách KR» | Thử lại |
| ST-moikr-chuachuky | Mọi KR | `ChuaChuKy` như các màn khác của khu | tạo / chọn chu kỳ |
| ST-moikr-rong | Mọi KR | `Empty` «Chu kỳ này chưa có KR nào đã công bố» | về Bộ OKR |
| ST-moikr-khongkhop | Mọi KR | `Empty` «Không KR nào khớp bộ lọc» + Bỏ lọc | bỏ lọc |
| ST-moikr-codulieu | Mọi KR | bảng KR · Mục tiêu/Đơn vị · Phụ trách · Tiến độ · Tình trạng | lọc, mở KR |
| ST-suckhoe-otruot | Sức khoẻ | ô «KR trượt» với số, là một liên kết | bấm |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ba mặt lọc là tham số đường dẫn `tinhTrangKr`, `donViKr`, `nguoiKr` (`nuqs`, nhiều giá trị); tải lại,
  chép đường dẫn hay bấm lùi cho đúng danh sách ấy. Các mặt kết hợp theo «và», giá trị trong một mặt
  theo «hoặc».
- Số đếm trong mỗi chip là chữ phụ `text-muted-foreground tabular-nums`; số trong mặt lọc theo luật
  `facetCounts` của `DataTable` (như Bộ OKR). Số của một mặt đếm trên tập đã lọc theo hai mặt kia.
- Dưới `md` ẩn cột Phụ trách và Tiến độ; tình trạng luôn là chấm kèm chữ (`PaceIndicator`), không chỉ màu.
- Tên KR, mục tiêu, đơn vị, người là dữ liệu người nhập: `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DataTable` + mặt lọc | dùng | danh sách có lọc Đơn vị, Người theo `docs/design.md` |
| `ToggleGroup` | dùng | chip Tình trạng theo luật «Chip lọc», như bản mẫu |
| `PaceIndicator` | dùng | chấm tình trạng KR đã có ở `okr-status.tsx` |
| `StatCard` | mở rộng (biến thể liên kết trong `packages/ui`) | ô số hiện không bấm được; không bọc `Link` tô tay ở chỗ gọi |
| `AreaSidebarItem` | dùng | mục mới của nhóm Báo cáo |
| ngăn KR (`useMoNganKr`) | dùng | một ngăn cho mọi chỗ bấm KR (VK7) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — bản mẫu `ManMoiKr` đã là danh sách mở ngăn KR, và Tability (báo cáo 18/10)
dẫn ô Off track trên trang chủ tới All data › Key Results đã lọc.
<!-- UX-SPEC-TEMPLATE>>> -->

## Thước đo ngưỡng

- «Một bấm»: bàn đo màn mở `/okr/suc-khoe`, bấm đúng ô «KR trượt», kiểm đường đã ở `/okr/moi-kr` với
  `tinhTrangKr=truot` và bảng chỉ có dòng «Trượt» — không bước trung gian.
- «Bộ lọc trên đường dẫn»: mở thẳng một đường mang ba mặt lọc, bảng ra đúng tập dòng ấy.
