# Lượt 8d OKR — sửa UX sau lái thử 8c

Ngày 2026-09-30 · slug `ux-lai-thu-8c-okr` · T2 · nhánh `feat/ux-lai-thu-8c-okr`

## Vì sao

Buổi lái thử 8c ngày 30/09 trên app thật, với bộ OKR mẫu «Hải Đăng Logistics», cho thấy ba
tính năng mới chạy đúng, nhưng người dùng vẫn gặp ba loại bất ngờ:

- nội dung kín không có dấu ở danh sách;
- gỡ người thì sinh OKR mồ côi mà không ai được báo trước;
- bị từ chối sau khi đã bấm xác nhận.

Ngoài ra có năm chỗ luồng duyệt và cây đơn vị không khớp với điều người dùng thấy. Chủ kho
chọn gom ba điểm mức Cao và năm điểm mức Vừa của báo cáo thành lượt này. Thiết kế được duyệt
trong phiên ngày 30/09 với bốn lựa chọn máy khuyên.

**Luật máy chủ giữ nguyên.** Lượt này đưa luật có sẵn ra trước mắt người dùng: thêm trường
vào đầu ra API và một truy vấn xem trước. Không bảng mới, không migration.

## Tám điểm

1. **Nhãn «Giới hạn» ở mọi danh sách.**
   - `mucTieuOutput` (dùng cho `mine`, `byUnit`, `danhSach`), nút cây căn chỉnh và mục OKR mồ
     côi thêm `hienThi` và `soNguoiXem`. Họp tuần không hiện mục tiêu giới hạn cho ai (luật
     số gộp của 8c) nên không cần nhãn.
   - Nhãn khoá của khung (`NhanGioiHan` ở `record-sheet/objective-hien-thi.tsx`) chuyển vào
     `packages/ui` thành thành phần nhận chữ nhãn và chữ gợi ý qua prop.
   - Khung và bốn danh sách cùng dùng thành phần đó. Ở danh sách, nhãn không mở hộp mức hiển
     thị: danh sách chỉ đọc.
2. **Hộp gỡ người.**
   - Khi mở, hộp đọc `okr.transferPreview({ fromUserId })`, cùng phép đếm luồng «Chuyển
     OKR…» đang dùng.
   - `kr + mucTieu > 0`: hộp nêu «Người này đang phụ trách N KR và M mục tiêu ở kỳ đang mở
     — chuyển OKR trước để chúng không thành OKR mồ côi», nút chính là «Chuyển OKR…» (mở hộp
     chuyển OKR có sẵn), nút «Gỡ» vẫn bấm được ở dạng huỷ.
   - Bằng 0: hộp như cũ. Đọc lỗi: hộp nêu một dòng «Chưa đọc được OKR của người này» và vẫn
     cho gỡ.
   - Cảnh báo, không chặn: người đã nghỉ phải gỡ được ngay.
3. **Báo trước điều kiện chặn.**
   - (a) Mục tiêu nháp chưa có KR và ô duyệt bật: nút «Gửi duyệt» ở đầu khung và trong dải
     «bị trả lại» khoá. Một dòng chữ hiện rõ ngay dưới nút: «Thêm ít nhất một KR trước khi
     gửi duyệt». Hộp hỏi lại không mở.
   - (b) Hộp lưu trữ phòng ban gọi truy vấn mới `org.luuTruXemTruoc({ id })` khi mở. Truy vấn trả
     `{ lyDo: string[] }` từ CHÍNH hàm kiểm mà `org.archiveDepartment` dùng (tách thành
     `lyDoChanLuuTru` trong `to-chuc.service.ts`): còn nằm trong khuôn đang dùng, còn người có
     phòng ban chính, còn OKR ở kỳ đang mở. Hộp nêu mọi lý do; «Lưu trữ» khoá khi có lý do;
     lý do OKR kèm «Chuyển OKR…»; xem trước lỗi thì nêu một dòng và vẫn cho bấm.
   - (c) Hộp «Chuyển OKR» gọi truy vấn mới `okr.chuyenDonViXemTruoc`, nhận cùng input với
     `okr.chuyenDonVi`, trả `{ canhBao: string | null }` bằng CHÍNH hàm `canhBaoTran` mà mutation
     dùng, ngay khi chọn nơi nhận và mỗi khi đổi tập chọn. Chuyển OKR hôm nay chỉ cảnh báo khi
     vượt trần, kể cả khi chương trình đặt «Chặn, không ghi» — lượt này không đổi luật đó.
4. **Cây đơn vị đếm theo quyền xem.**
   - `okr.countByUnit` đổi điều kiện từ `boGioiHan` sang `dieuKienXemMucTieu(nc)` của người
     gọi. Với mọi người và mọi đơn vị, số trên cây bằng độ dài danh sách `byUnit` của đơn vị
     đó.
   - Số thống kê (Sức khoẻ chương trình, tiến độ gộp, toàn cảnh) giữ luật 8c: không tính
     mục tiêu giới hạn cho bất kỳ ai.
5. **Hộp gửi duyệt nêu người duyệt.** `objectiveOutput` thêm `nguoiDuyetDuKien: { id, name } |
   null`. Trường có giá trị khi mục tiêu ở nháp, ô duyệt bật và người gọi có `quyen.guiDuyet`.
   Giá trị suy bằng đúng hàm `nguoiDuyet` mà `choDuyet.nguoiDuyet` dùng. Thân hộp thêm
   «<tên> sẽ duyệt.»
6. **Lần trả lại trước.**
   - `choDuyet` thêm `lanTraLaiTruoc: { lyDo, nguoi, luc } | null`: dòng vết `tra-lai` mới
     nhất đứng trước lần `gui-duyet` hiện tại.
   - Dải của người duyệt nêu «Lần trước <tên hoặc «bạn»> trả lại · <ngày>: <lý do>».
   - Bảng Vết hiện `note` của dòng `tra-lai` dưới tên hành động, như dòng «Thêm KR» hiện tên
     KR.
7. **Hạ «Công bố» sau khi trả lại.** Khi `traLaiGanNhat.nguoi.id` là người đang xem, nút «Công
   bố» ở đầu khung dùng biến thể `outline` thay biến thể chính. Người khác vẫn thấy như cũ.
8. **Khung xương khi tải.** Khung phải của «Theo đơn vị» hiện khung xương có `aria-busy` và
   dòng `sr-only` «Đang tải…» khi `byUnit` chưa có dữ liệu. Trạng thái «<đơn vị> chưa đặt OKR
   cho <chu kỳ>» chỉ hiện khi dữ liệu đã về và rỗng.

## Bốn lựa chọn đã duyệt

- Gỡ người: cảnh báo, không chặn.
- Hai loại con số tách biệt: cây đơn vị theo quyền xem; số thống kê giữ luật không tính giới
  hạn.
- «Công bố» sau khi trả lại: hạ về nút phụ, không ẩn.
- Nhãn khoá chuyển vào `packages/ui` trước khi dùng ở khu thứ hai (`docs/design.md`).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách mục tiêu → thấy nhãn «Giới hạn» → mở khung. Gỡ người → hộp nêu OKR đang
  phụ trách → «Chuyển OKR…» → chuyển → gỡ. Khung nháp → «Gửi duyệt» → hộp nêu người duyệt →
  gửi.
- Biên: người không có OKR mở thì hộp gỡ như cũ; mục tiêu chưa có KR thì nút gửi khoá; đơn vị
  nhận vượt trần thì cảnh báo trước khi chuyển.
- Lỗi & quay lại: đọc OKR của người sắp gỡ lỗi → một dòng, vẫn gỡ được; truy vấn xem trước
  chuyển lỗi → một dòng «Chưa kiểm được trần», nút chuyển vẫn bấm được và máy chủ vẫn kiểm.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách mục tiêu (Của tôi, Theo đơn vị, Cây căn chỉnh, OKR mồ côi) | cho biết mục tiêu nào là kín | khu OKR / khung mục tiêu |
| Hộp gỡ người | gỡ mà không sinh OKR mồ côi | Cài đặt › Thành viên / hộp chuyển OKR |
| Khung mục tiêu (đầu khung, dải duyệt, tab Vết) | gửi, duyệt, trả lại đúng người | danh sách / đóng khung |
| Hộp lưu trữ phòng ban | nói hết lý do chưa lưu trữ được | Cài đặt › Tổ chức / hộp chuyển OKR |
| Hộp chuyển OKR | chuyển mà biết trước trần | Tổ chức / đóng hộp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danhsach-gioi-han | Danh sách mục tiêu | nhãn khoá «Giới hạn» cạnh «Đã công bố»; rê chuột: «Chỉ người liên quan và 1 người xem có tên thấy» | mở khung |
| ST-gonguoi-co-okr | Hộp gỡ người | «Người này đang phụ trách 3 KR và 1 mục tiêu ở kỳ đang mở — chuyển OKR trước để chúng không thành OKR mồ côi»; «Chuyển OKR…» (chính), «Gỡ» (huỷ) | chuyển, hoặc gỡ vẫn |
| ST-gonguoi-dang-tai | Hộp gỡ người | dòng «Đang đọc OKR của người này…», «Gỡ» bấm được | chờ, gỡ |
| ST-gonguoi-loi | Hộp gỡ người | «Chưa đọc được OKR của người này» | gỡ |
| ST-guiduyet-khoa | Khung mục tiêu | «Gửi duyệt» khoá; dưới nút: «Thêm ít nhất một KR trước khi gửi duyệt» | thêm KR |
| ST-guiduyet-hoi | Hộp gửi duyệt | «Trần Quốc Bảo sẽ duyệt.» trong thân hộp | gửi, huỷ |
| ST-duyet-tra-lai-truoc | Khung mục tiêu (người duyệt) | «Lần trước bạn trả lại · 30/09: Thêm KR đo doanh thu…» trong dải | duyệt, trả lại |
| ST-vet-tra-lai | Tab Vết | dòng «Trả lại» có lý do ở dòng dưới | — |
| ST-congbo-phu | Khung mục tiêu (người vừa trả lại) | «Công bố» dạng nút phụ | — |
| ST-luutru-hai-dieu-kien | Hộp lưu trữ | «Chưa lưu trữ được» nêu hai dòng: «còn 3 mục tiêu ở kỳ đang mở» + «Chuyển OKR…», «còn 5 người có phòng ban chính ở đây»; «Lưu trữ» khoá | chuyển OKR, chuyển người |
| ST-luutru-khuon | Hộp lưu trữ | dòng «Phòng ban này còn nằm trong khuôn … — sửa khuôn trước»; «Lưu trữ» khoá | sửa khuôn |
| ST-luutru-loi | Hộp lưu trữ | «Chưa kiểm được điều kiện lưu trữ»; «Lưu trữ» bấm được | lưu trữ |
| ST-chuyen-vuot-tran | Hộp chuyển OKR | cảnh báo «Kinh doanh miền Nam sẽ có 6 mục tiêu ở Quý 4 — vượt trần 5» dưới ô nơi nhận | chuyển, bỏ chọn bớt |
| ST-theodonvi-dang-tai | Theo đơn vị · khung phải | khung xương cùng hình danh sách, `aria-busy` | chờ |
| ST-theodonvi-rong | Theo đơn vị · khung phải | «<đơn vị> chưa đặt OKR cho <chu kỳ>» — chỉ khi đã tải xong | thêm mục tiêu |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nhãn trong danh sách là `Badge` có `Tooltip`, không phải nút; biểu tượng khoá `aria-hidden`,
  nhãn đọc được qua `aria-label` gồm cả câu gợi ý.
- Lý do khoá nút gửi là chữ hiện, nối với nút qua `aria-describedby`, không chỉ ở chú thích
  khi rê chuột.
- Cảnh báo trần và dòng lỗi đọc OKR nằm trong vùng `aria-live="polite"`.
- Chữ đang tải kết thúc bằng «…».

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Nhãn khoá «Giới hạn» | mở rộng — chuyển từ `record-sheet` vào `packages/ui` | dùng ở khu thứ hai nên phải vào `packages/ui` trước (`docs/design.md`) |
| `ConfirmDialog` | dùng | hộp gỡ người và hộp gửi duyệt đã dựng trên nó |
| `Alert` | dùng | dải cảnh báo trần, điều kiện lưu trữ, dòng trả lại trước |
| `Skeleton` | dùng | khung xương «Theo đơn vị» |
| `Button` biến thể `outline` | dùng | hạ «Công bố» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không thêm màn nào; tám điểm nằm trên khu OKR đang theo khuôn danh sách → khung chi
tiết và trên các hộp của Cài đặt. Luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm chứng

- API (`apps/api/test/okr-ux-8d.spec.ts`), đo quan hệ chứ không đo chuỗi có mặt:
  - tập mục tiêu mang `hienThi: gioi-han` ở mỗi danh sách bằng tập mục tiêu giới hạn người đó
    xem được;
  - số trên cây bằng độ dài `byUnit` cho ba người xem và mọi đơn vị;
  - kết quả xem trước chuyển bằng kết quả mutation trên cùng ma trận trần;
  - `nguoiDuyetDuKien` bằng `choDuyet.nguoiDuyet` sau khi gửi;
  - `lanTraLaiTruoc` đúng lý do của lần trả lại trước;
  - điều kiện lưu trữ suy từ cây bằng kết quả máy chủ từ chối lưu trữ.
- Giao diện (`apps/app/test/okr-ux-8d.dom.tsx`): từng trạng thái của bảng trên, mỗi ca có
  chiều đỏ.
- Màn thật (`_acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs`, phiên đo trên bộ OKR mẫu):
  chụp các trạng thái của bảng.
