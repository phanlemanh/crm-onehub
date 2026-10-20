# Ngăn KR một chỗ — design (VK7, ngan-kr-mot-cho)

Hàng VK7 của `docs/plan/lo-trinh-okr.json` (gộp mã B1 và B1b của `docs/plan/pham-vi-okr-vo-khu-1810.md`), đợt chạy
`vo-khu-muc-tieu`, dãy V3. Cổng Đáng ký `build` 19/10 11:09Z. Giám sát đôn hàng lên trước VK6 ngày 20/10 vì VK7 không
đứng trên VK2, và VS8 (`ngan-ban-ghi-giu-danh-tinh`, #498) đã gộp nên luật 20 hết ràng buộc.

## Vấn đề

Câu giao: «Trưởng đơn vị bấm một KR ở bất kỳ đâu và mở cùng một ngăn KR, bấm Cập nhật ở đầu ngăn hay ngay trên dòng KR,
thấy điểm mới nằm đâu so với đích, rồi sang KR kế mà không đóng ngăn». Ngưỡng: «Cập nhật một KR từ trang bộ OKR trong 3
bấm; mọi lối bấm vào KR mở cùng một ngăn».

Hôm nay bấm vào một KR ra bốn nơi:

| Lối | Mở |
|---|---|
| Dòng KR ở trang đơn vị, nút «Việc» trong bảng KR của ngăn mục tiêu, thẻ KR trên sơ đồ | `KrSheet` (`kr`) — chỉ có tab Việc, Bằng chứng; không có Cập nhật |
| Con số của KR trong bảng KR (`data-so-kr`) | `SoKrSheet` (`so-kr`) — bản ghi sau con số |
| Khối KR ở Tổng quan, Của tôi, họp tuần (`useMoDienBien`) | ngăn mục tiêu, tab «Diễn biến» chọn sẵn KR |
| Menu «…» trên dòng KR của ngăn mục tiêu → Cập nhật | hộp `HopThoaiCapNhatKr` |

Cập nhật một KR từ trang đơn vị mất 6 bấm: tên mục tiêu → «…» → Cập nhật → gõ số (ô chưa có tiêu điểm, phải bấm) → mức
tự tin → Gửi. Hộp cập nhật chỉ có một dòng chữ «lần trước · đích · chênh», không có hình.

## Hướng

`KrSheet` trở thành **ngăn KR duy nhất**, dựng theo `NganKr` của bản mẫu `vo-khu-muc-tieu` (`2790552ac`, chỉ đọc):

- **Đầu ngăn**: tên mục tiêu là liên kết mở ngăn mục tiêu; tên KR; đếm «n/N» và hai nút ‹ › sang KR trước, KR kế trong
  cùng mục tiêu (thứ tự `position` — đúng thứ tự bảng KR); nút **Cập nhật** (`primary`) khi người xem được cập nhật KR
  này (`canEditKr`, cùng cổng với mục «…» hôm nay).
- **Thân ngăn**: ô số Hiện tại (so với đích) và Tiến độ (so với kỳ vọng), thanh tiến độ có vạch kỳ vọng; **Lịch sử cập
  nhật** có đồ thị `TargetLineChart` và danh sách lần cập nhật; **Việc và bằng chứng** (hai tab của `KrSheet` hôm nay);
  **Số và nguồn** (nội dung của `SoKrSheet`); **Chi tiết** (phụ trách, hạn, kiểu).
- **Sang KR kế**: `thayDinh({ kind: "kr", id })` của `useRecordStack` — ngăn mục tiêu nằm dưới giữ nguyên, ngăn không
  đóng, `RecordSheetHost` không bị gỡ (AC-1 của VS8).
- **Cập nhật ở đầu ngăn** mở `HopThoaiCapNhatKr` (giữ nguyên hộp và các thuộc tính `data-*` mà hồ sơ đã ký đo). Gửi
  xong ngăn vẫn mở và số mới hiện.
- **Cập nhật trên dòng KR**: bảng KR ở trang đơn vị (sẽ là trang bộ OKR khi VK3 xong) có nút «Cập nhật» hiện sẵn trên
  mỗi dòng mà người xem được cập nhật, như cột cuối của bản mẫu; mở đúng hộp ấy. Mục «…» → Cập nhật vẫn còn, cùng hộp.
- **3 bấm**: Cập nhật trên dòng (1) → ô giá trị đã có tiêu điểm, gõ số → chọn mức tự tin (2) → Gửi (3).
- **Hộp xem trước**: gõ giá trị thì đồ thị hiện điểm mới (nét đứt) cạnh lịch sử và đường đích, kèm tiến độ mới tính
  bằng `tienDoKr` của `packages/validation`. KR mốc: hiện Xong / Chưa xong cạnh đích. Giá trị sai thì không vẽ điểm.
- **Mọi lối khác** mở `{ kind: "kr", id }`: con số trong bảng KR mở ngăn KR ở mục Số và nguồn; khối KR ở Tổng quan, Của
  tôi, họp tuần mở ngăn KR (đồ thị ở mục Lịch sử). Tab «Diễn biến» của ngăn mục tiêu vẫn còn cho người xem cả mục tiêu.

Không thêm thủ tục API. Dữ liệu: `okr.canhKr` (ngăn hôm nay), `okr.objective` (danh sách KR theo thứ tự, đã có trong
cache khi mở từ ngăn mục tiêu), truy vấn lịch sử mà tab Diễn biến đang dùng, `okr.banGhiChiSo`/`okr.lichSuSo` cho Số và
nguồn. Ghi: `okr.moCapNhat` + `okr.guiCapNhat` như hộp hôm nay.

Không chạm `record-sheet-host.tsx`, `record-stack.ts`, `nap-san-khi-mo-ngan.tsx` (hồ sơ VS8 và `ve-sinh-do-san-onehub`
đo chúng).

## Phương án đã loại

- **Gộp hộp cập nhật vào thân ngăn (sửa tại chỗ).** Thêm một nơi cập nhật thứ hai khác hộp; hồ sơ `cap-nhat-tuan-okr`
  đã ký đo đường hộp. Hộp giữ nguyên, ngăn chỉ mở nó.
- **Ngăn KR mới thay `KrSheet`.** Hai ngăn cho một vật đúng là lỗi cần gỡ; `KrSheet` đã là `kind: "kr"` của chồng ngăn.
- **Đổi `RecordSheetHost` để có ‹ › chung cho mọi loại ngăn.** Ngoài phạm vi hồ sơ VS8 đã ký («Đổi API của
  RecordSheetHost» nằm ở Out of scope của nó); `thayDinh` đã đủ.
- **Đổi giá trị `entry` của `okr.moCapNhat` để tách nút trên dòng khỏi nút đầu ngăn.** Ngưỡng 3 bấm đo trên màn, không
  đo bằng dữ liệu đo lường; đổi lược đồ chạm `packages/validation` và API mà không lời hứa nào cần.

## Câu chỉ người có (lên thẻ Cổng Phạm vi)

- **Hỏi-1 — gộp cả lối con số và lối diễn biến vào ngăn KR, và chuyển thước hồ sơ đã ký?** Ngưỡng nói «mọi lối». Hai lối
  ấy đang được hồ sơ đã ký đo: `okr-to-chuc-va` (E2, E3), `so-okr-tu-chay` (E14, E16) cho ngăn số; `toan-canh-okr` và
  `cua-toi-ba-phan` cho lối diễn biến. Luật tạm 18/10 cấm máy tự sửa thước hồ sơ đã ký. Máy khuyên: gộp cả hai, chuyển
  thước theo khuôn luật 21 như chủ kho đã cho VK6 (đổi đúng chỗ hoặc khai nghỉ `superseded_by`, đo hai chiều, dòng sổ
  `fix` mang `decided_by`, `cham-tep`). Lối khác: chỉ gộp các lối đang mở `kr` và thêm Cập nhật — giá: còn ba nơi, vế
  «mọi lối» của ngưỡng không đạt.
- **Hỏi-2 — ‹ › đi trong một mục tiêu hay cả bộ OKR?** Bản mẫu đếm «2/4» trong một mục tiêu. Máy khuyên: trong một mục
  tiêu, hết thì nút tắt — khớp bản mẫu, thứ tự đã có sẵn. Lối khác: đi qua cả bộ OKR theo thứ tự trang — tiện khi cập
  nhật cả tuần, nhưng thứ tự trên trang do người dùng sắp lại và cần thêm dữ liệu của trang.

- **Hỏi-3 — ngưỡng 3 bấm cho KR mốc?** Với KR mốc, chọn «Xong» là một bấm, nên đường thành 4 bấm (Cập nhật, Xong, tự
  tin, Gửi). Máy khuyên: ngưỡng 3 bấm áp cho KR số (tăng tới, giảm tới), KR mốc 4 bấm — chọn Xong chính là giá trị. Lối
  khác: mặc định «Xong» khi mở hộp của KR mốc chưa xong để còn 3 bấm — giá: bấm nhầm là ghi «Xong» không chủ ý.
- **Hỏi-4 — đo ngưỡng trên trang đơn vị hôm nay?** Ngưỡng nói «từ trang bộ OKR», trang ấy là VK3, chưa dựng (đứng trên
  VK2). Máy khuyên: đo trên trang đơn vị `/okr/theo-don-vi` — chính bảng mà VK3 đổi tên và dựng lại — và chuyển ràng buộc
  cho VK3: bảng KR mới mang nút «Cập nhật» trên dòng mở đúng hộp này. Lối khác: chờ VK3 rồi mới làm VK7 — giá: dãy V3
  đứng tới khi VK2 và VK3 gộp.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trang đơn vị › dòng KR › «Cập nhật» → hộp cập nhật, ô giá trị có tiêu điểm → gõ số, đồ thị hiện điểm mới →
  chọn mức tự tin → Gửi → hộp đóng, dòng KR hiện số mới (điểm ra: trang đơn vị).
- Suôn sẻ, ngăn: bấm tên KR ở bất kỳ đâu → ngăn KR → «Cập nhật» ở đầu → gửi → ngăn vẫn mở với số mới → ‹ › sang KR kế
  → lặp lại (điểm ra: đóng ngăn).
- Biên: KR mốc; người xem không được cập nhật (không nút); KR đầu hay cuối (nút tắt); mục tiêu một KR (không ‹ ›, không
  đếm); chu kỳ đã khép hay KR đã bỏ (không nút Cập nhật).
- Lỗi & quay lại: ngăn tải hỏng → `VungTaiLoi` có thử lại; KR không thấy → câu báo trong ngăn; gửi hỏng → hộp giữ giá
  trị đã gõ và báo lỗi, như hôm nay.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn KR | Xem và cập nhật một KR, sang KR kế | mọi lối bấm KR / hộp cập nhật, ngăn mục tiêu, KR kế |
| Hộp cập nhật KR | Ghi một lần cập nhật, thấy điểm mới so với đích | nút trên dòng, nút đầu ngăn, «…» / chỗ đã mở |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ngan-kr-mo | Ngăn KR | đầu ngăn (mục tiêu, tên KR, n/N, ‹ ›, Cập nhật), ô số, lịch sử có đồ thị, việc, số và nguồn, chi tiết | Cập nhật, sang KR kế |
| ST-ngan-kr-chi-doc | Ngăn KR | như trên, không nút Cập nhật | đọc, sang KR kế |
| ST-ngan-kr-dau-cuoi | Ngăn KR | KR đầu: ‹ tắt; KR cuối: › tắt | bấm nút còn lại |
| ST-ngan-kr-dang-tai | Ngăn KR | khung xương cùng hình, đầu ngăn giữ tên KR nếu đã biết | chờ |
| ST-ngan-kr-loi | Ngăn KR | `VungTaiLoi` «Không tải được KR» | thử lại |
| ST-ngan-kr-khong-thay | Ngăn KR | «Không tìm thấy KR này, hoặc bạn không có quyền xem.» | đóng ngăn |
| ST-hop-cap-nhat-xem-truoc | Hộp cập nhật | đồ thị lịch sử + điểm mới nét đứt + đường đích, tiến độ mới | chọn tự tin, Gửi |
| ST-hop-cap-nhat-sai | Hộp cập nhật | lỗi chữ dưới ô, không điểm mới | sửa số |
| ST-dong-kr-cap-nhat | Trang đơn vị | nút «Cập nhật» trên dòng KR được cập nhật | bấm |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- ‹ › có `aria-label` «KR trước», «KR kế»; phím ← → khi tiêu điểm ở đầu ngăn không đổi KR (tránh nuốt phím của ô số).
- Sang KR kế giữ tiêu điểm trên nút vừa bấm; số đếm đọc cho trình đọc màn hình.
- Hộp cập nhật mở với tiêu điểm ở ô giá trị; Enter trong ô không gửi khi chưa chọn mức tự tin.
- Dưới `md` ngăn là `Drawer` (như `DetailSheet` hôm nay); nút trên dòng nằm trong danh sách `Item`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KrSheet`, `DetailSheet`, `DetailSheetHeader` | mở rộng | ngăn KR có sẵn; `DetailSheetHeader` đã có ô `actions` |
| `HopThoaiCapNhatKr`, `OGiaTri` | mở rộng | thêm tiêu điểm và đồ thị xem trước, giữ hộp |
| `TargetLineChart` | dùng | đã có đường đích và nét «lẽ ra»; thêm điểm mới bằng dữ liệu |
| `StatGroup`, `StatCard`, `Progress variant="neutral"` | dùng | nếp «Ô số tổng quan», vạch kỳ vọng |
| `SectionHeading`, `Item`, `Button size="icon-sm"` | dùng | bản mẫu |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — bảng KR là danh sách, ngăn KR là chi tiết có ‹ › đi trong danh sách; lượt rà Tability 18/10
(`vi_sao` của VK7) ghi một ngăn KR, «Create check-in» ở đầu, ‹ › sang KR kế.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đường đo

Ngưỡng có hai vế, đo bằng máy trên cây: số bấm từ trang đơn vị tới lần cập nhật đã ghi (AC-7, E10 đếm bấm thật trên màn)
và mọi lối bấm KR mở `{ kind: "kr" }` (AC-1). Không có code đo mới.

## Đã đọc

`AGENTS.md`, `CLAUDE.md`, `docs/design.md`, `CONTEXT.md`, `docs/plan/pham-vi-okr-vo-khu-1810.md` (B1, B1b), luật đợt và
`LUAT-rieng.md` (luật 7, 19, 20), bản mẫu `vo-khu-muc-tieu` ở `2790552ac` (`NganKr`, bảng KR), hồ sơ VS8
`ngan-ban-ghi-giu-danh-tinh`.
