# Họp tuần trên bảng — thiết kế (HT2 `hop-tuan-tren-bang`)

Hàng HT2 của `docs/plan/lo-trinh-okr.json`, đợt `okr-hop-tuan-2210` (bản phạm vi `docs/plan/pham-vi-okr-hop-tuan-2210.md`,
mã H3 và H5). Cổng Đáng: chủ kho 27/10 «build, giữ ngưỡng đề xuất» (`_acceptance/hop-tuan-tren-bang/opportunity.md`).
Viết trên `onehub` 5084ffe74, sau HT1 `hop-tuan-mo-dung-bo` (#566: dòng vị trí, hàng số đầu thẻ) và VK7 `ngan-kr-mot-cho`.

## Vấn đề

Trưởng đơn vị chưa họp trọn trên bảng Họp tuần (`docs/findings/2026-10-22-hop-tuan/README.md`, F05 và F06):

- Dưới 1024px cột «Ghi chú mới nhất» ẩn (`hop-tuan.tsx`, cột `hidden lg:table-cell`) và không có chỗ nào khác hiện nó.
- Không có mức đổi so với lần trước — người họp không thấy tuần này KR đi được bao nhiêu.
- Dòng bảng chỉ mở ngăn KR; muốn cập nhật phải mở ngăn rồi bấm «Cập nhật».
- ‹ › của ngăn KR đi theo các KR của một mục tiêu (`kr-sheet.tsx`, `DauNganHanhDong` dùng `mt.keyResults`), không theo
  thứ tự bảng đang họp.

Tability (chụp thật 22/10, `docs/findings/2026-10-22-hop-tuan/tab/`): trình chiếu hiện câu phân tích mới nhất cho mọi KR
kèm mức đổi, ngăn KR đi ‹ › «4 of 5» qua mọi KR của plan, nút Create check-in ở ngăn và ở từng trang.

## Hướng làm

1. **API `okr.hopTuan`** — mỗi dòng (cả `dangBan` lẫn `conLai`) thêm bốn trường: `ghiChuNgay` (ngày của lần mang ghi
   chú mới nhất), `donVi` (đơn vị của KR), `giaTriMoi` (giá trị lần mới nhất, `null` khi chưa có lần nào) và `mucDoi`. `mucDoi` là `{ tu, den, ngayTruoc }` khi có lần để so, `null` khi chưa. Lần để so
   là **lần cập nhật cuối thuộc một tuần trước tuần của lần mới nhất** — cùng luật với «tụt mức tự tin» của
   `toan-canh-okr` AC-7: KR cập nhật hai lần trong tuần vẫn hiện mức đổi của cả tuần. Giá trị so là giá trị của chính KR
   (`OkrCheckIn.value`), không phải điểm tiến độ. Không thêm khoá nào khác; các trường cũ giữ nguyên nghĩa.
2. **Dòng bảng** — một dòng mang: tên KR (bấm mở ngăn KR, như nay) · mục tiêu và người phụ trách · nhãn lý do · tiến độ
   và tự tin · ghi chú mới nhất kèm ngày · mức đổi · nút «Cập nhật». Từ 1024px ghi chú và mức đổi là hai cột; 768–1023
   chúng xếp dưới tên KR trong cột KR; dưới 768 bảng thành danh sách `Item` (nếp «Danh sách» của `docs/design.md`), mỗi
   mục mang đủ các phần trên. «Còn lại» dùng cùng dòng.
3. **Nút «Cập nhật» trên dòng** — mở đúng hộp cập nhật một KR (`useCapNhatKr` / `HopThoaiCapNhatKr`, như nút trên dòng
   của trang đơn vị); hiện khi `coNutCapNhat` đúng. Không ô nhập trên dòng, không gửi nhiều KR (luật «Bấm vào KR và cập
   nhật» của `docs/design.md`; Lối (b) 24/10). Gửi xong hộp đóng, người vẫn ở bảng; bảng và hàng số tải lại.
   `NutCapNhatDong` đang sống trong `theo-don-vi/bang.tsx` — dùng lần hai thì chuyển nó sang một tệp chung của khu OKR
   trước (luật «dùng lần thứ hai» của `docs/design.md`; nó gọi tRPC nên không vào được `packages/ui`).
4. **‹ › theo thứ tự bảng** — ngăn KR mở từ Họp tuần đếm «n/N» và đi ‹ › theo thứ tự bảng: các dòng Đang bàn rồi các dòng
   Còn lại (Hỏi-1). Họp tuần đánh dấu nguồn thứ tự trên đường dẫn (tham số của ngăn, xoá cùng ngăn); ngăn đọc danh sách từ
   chính truy vấn `okr.hopTuan` đã có trong bộ nhớ đệm — tải lại trang vẫn giữ thứ tự. Mở ngăn từ bất kỳ chỗ nào khác
   giữ AC-2 của VK7 (theo `position` trong mục tiêu). Lời gọi mở ngăn ở `hop-tuan.tsx` vẫn đi qua `useMoDienBien`: không
   thêm lối mở ngăn mới, nên thước `quet-loi.mjs` của VK7 (chín lối) không đổi.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Bộ OKR › bộ mình › thẻ con «Họp tuần» → đọc hàng số → đi từng dòng Đang bàn: đọc ghi chú mới nhất và mức đổi
  ngay trên dòng → bấm «Cập nhật» trên dòng nếu cần → hộp một KR → Gửi → về đúng bảng; hoặc bấm tên KR → ngăn KR → ‹ ›
  đi dòng kề theo thứ tự bảng (điểm ra: đóng ngăn, về bảng).
- Biên: KR chưa có lần cập nhật nào → «Chưa có ghi chú», mức đổi «Chưa cập nhật»; KR mới một lần → «Lần đầu cập nhật»;
  giá trị bằng lần trước → «Chưa đổi»; người xem không cập nhật được KR → dòng không có nút; KR mốc → mức đổi «Chưa xong →
  Xong».
- Lỗi & quay lại: gửi cập nhật hỏng → hộp giữ nguyên chữ đã gõ và báo lỗi như hộp hôm nay; `okr.hopTuan` hỏng → vùng lỗi
  có Thử lại (giữ HT1); ngăn mở bằng đường dẫn có nguồn Họp tuần mà KR không còn trong bảng → ngăn đi theo mục tiêu như
  VK7.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ Họp tuần | đi qua từng KR của tuần và cập nhật ngay tại chỗ | thẻ con của bộ / ngăn KR, hộp cập nhật một KR |
| Ngăn KR mở từ Họp tuần | xem một KR rồi sang KR kề theo bảng | dòng bảng / ‹ ›, «Cập nhật», đóng về bảng |
| Hộp cập nhật một KR | gửi một lần cập nhật | nút trên dòng hay đầu ngăn / về chỗ đã mở |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ht2-bang | Thẻ Họp tuần | hàng số; Đang bàn với ghi chú mới nhất, mức đổi, nút Cập nhật trên mọi dòng; Còn lại gập | đi từng dòng |
| ST-ht2-con-lai | Thẻ Họp tuần | Còn lại mở, cùng các phần như Đang bàn | đọc, cập nhật |
| ST-ht2-hop-cap-nhat | Hộp cập nhật một KR | lần trước, ô giá trị, mức đổi xem trước, tự tin, ghi chú | Gửi / Huỷ |
| ST-ht2-ngan-kr | Ngăn KR | «n/N · theo thứ tự bảng», ‹ ›, «Cập nhật», mức đổi, các lần cập nhật | ‹ › / Cập nhật / đóng |
| ST-ht2-hom-nay | Thẻ Họp tuần (so sánh) | màn onehub 5084ffe74: ghi chú ẩn dưới 1024, ‹ › trong một mục tiêu | — |
| ST-hoptuan-tai, ST-hoptuan-loi, ST-hoptuan-chuky-chua-chay, ST-hoptuan-chua-kr, ST-hoptuan-tuandau, ST-hoptuan-yenang | Thẻ Họp tuần | giữ nguyên HT1 | như HT1 |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ: ≥1024 bảng năm cột (KR · Tiến độ · Ghi chú mới nhất · Mức đổi · Cập nhật); 768–1023 bảng ba cột, ghi chú và mức
  đổi dưới tên KR; <768 danh sách `Item`. Trang không cuộn ngang ở mọi khổ.
- Mức đổi hai dòng: dòng trên phần chênh theo đơn vị của KR (`+3 đại lý`, `−0,09 tỷ đồng`, `Chưa đổi`, `Lần đầu cập nhật`);
  dòng dưới «trước → sau · so với dd/mm». Số in qua `giaTri` của `okr/bang-kr.tsx` (cùng cách trang đơn vị in giá trị KR:
  số theo locale, `%` dính số, đơn vị khác cách một khoảng, KR mốc «Chưa xong»/«Xong»), `tabular-nums`.
- Ghi chú là chữ người nhập: `translate="no"`, ngoặc «», kèm ngày dd/mm.
- Nút «Cập nhật» trên dòng có tên truy cập «Cập nhật <tên KR>»; đóng hộp thì tiêu điểm về nút đã mở.
- ‹ › đầu và cuối thứ tự bảng thì tắt; tiêu điểm theo nút như VK7.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `SimpleTable`, `Item` | dùng | nếp «Danh sách» của `docs/design.md`: bảng từ md, `Item variant="outline"` dưới md |
| `StatusIndicator`, `ConfidenceIndicator`, `Progress` | dùng | nhãn lý do, tự tin, tiến độ như hôm nay |
| `NutCapNhatDong` | mở rộng (chuyển sang tệp chung của khu OKR) | dùng lần hai; gọi tRPC nên không vào `packages/ui` |
| `HopThoaiCapNhatKr` | dùng | hộp cập nhật một KR duy nhất |
| `DauNganHanhDong` của ngăn KR | mở rộng | nhận danh sách thứ tự từ Họp tuần khi có nguồn |

Bậc «vẽ tay là bậc cuối»: dừng ở bậc 1 — mọi khối có sẵn trong `packages/ui` và khu OKR; không cài ReUI.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: (ii) không tra công cụ — khuôn hiển nhiên: bảng Họp tuần là danh sách, ngăn KR là chi tiết, ‹ › đi giữa các mục
của danh sách như Tability «4 of 5» (`docs/findings/2026-10-22-hop-tuan/tab/t07-trinh-chieu-mot-kr.jpg`).
<!-- UX-SPEC-TEMPLATE>>> -->

## Chỗ giao với hàng khác

- **VK7 `ngan-kr-mot-cho` (đã ký):** AC-2 «đếm theo `position` trong mục tiêu» đổi đúng ở đường mở từ Họp tuần — chủ kho
  cho phép 22/10 (comment #543). Không sửa hợp đồng hay thước của VK7; lối mở ngăn ở `hop-tuan.tsx` giữ nguyên, nên ma trận
  chín lối của E1 VK7 không đổi.
- **HT1 `hop-tuan-mo-dung-bo` (đã ký):** giữ hàng số, màn rỗng, tải và lỗi; thước HT1 đọc `[data-hang-so-hop]`,
  `[data-trang-thai]` — vòng này không đổi các dấu đó.
- **HT5 (dãy V3):** thêm thích và trả lời trên lần cập nhật — không chạm bảng Họp tuần.
- **SV-C1 (chân trời):** chi tiết một lần cập nhật — ngoài vòng.

## Rủi ro

- Ngăn KR nằm trong `RecordSheetHost`, ngoài cây của trang: danh sách thứ tự phải đi qua đường dẫn và bộ nhớ đệm truy vấn,
  không qua React context.
- `okr.hopTuan` nay đọc thêm giá trị lần trước: số truy vấn không đổi (đã đọc `lan` của mọi KR), chỉ thêm trường.
