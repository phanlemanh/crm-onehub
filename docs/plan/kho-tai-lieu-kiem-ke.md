# Kho tài liệu — kiểm kê, giờ duyệt, gom tệp Zalo

Soạn 2026-09-27 cho ba việc của lượt 0 (`lo-trinh-kho-tai-lieu.md` mục 4): kiểm kê tài
liệu, hỏi giờ duyệt của chủ trang tương lai, gom tệp trong các nhóm Zalo. Máy soạn
mẫu; chủ kho điền. Cột và quy tắc lấy từ mục 13.1–13.2 và 10.3 của
`kho-tai-lieu-viet-nam-va-do-luong.md`.

Bảng điền **không vào kho này**: tên tệp và tên người là dữ liệu nội bộ. Điền trong một
bảng tính của công ty, chia sẻ hạn chế; kho chỉ nhận con số tổng ở mục 4.

## 1. Kiểm kê tài liệu

Một dòng một tệp. Chưa cần đủ mọi tệp: mục tiêu là biết cỡ, định dạng, tỉ lệ bản quét và
nơi đang nằm, đủ để chọn 20 tài liệu pilot.

Dòng tiêu đề, chép vào bảng tính:

```csv
stt,ten_tep,noi_dang_nam,dinh_dang,ban_quet,so_trang,phong_ban,chu_du_kien,sua_lan_cuoi,dung_gan_nhat,lop_du_lieu,nghia_vu_luu,bi_thay_the_boi,dich_de_xuat,ung_vien_pilot,ghi_chu
```

| Cột | Điền gì |
| --- | --- |
| `noi_dang_nam` | Drive · nhóm Zalo (ghi tên nhóm) · máy cá nhân · email · giấy |
| `dinh_dang` | docx · pdf · xlsx · Google Docs · ảnh · khác |
| `ban_quet` | có (ảnh hay PDF không chọn được chữ) · không |
| `chu_du_kien` | Người sẽ chịu trách nhiệm trang này còn đúng; đoán cũng được |
| `dung_gan_nhat` | Tháng gần nhất có người mở hay hỏi tới; «không nhớ» là câu trả lời hợp lệ |
| `lop_du_lieu` | P công khai · I nội bộ, không dữ liệu cá nhân · B có dữ liệu cá nhân cơ bản · S nhạy cảm (tài chính, tín dụng, CCCD, sức khoẻ, hồ sơ khách ngân hàng) · D dữ liệu quan trọng hay lõi · T bí mật kinh doanh, pháp lý có đặc quyền |
| `nghia_vu_luu` | có (luật hay hợp đồng bắt giữ) · không · không rõ |
| `bi_thay_the_boi` | `stt` của bản mới hơn, nếu tệp này đã cũ |
| `dich_de_xuat` | Xem quy tắc dưới |
| `ung_vien_pilot` | có · không |

Quy tắc chọn `dich_de_xuat`, theo thứ tự, dừng ở dòng đầu tiên khớp:

1. Có `nghia_vu_luu` → **ARCHIVE**, không bao giờ xoá.
2. Có `bi_thay_the_boi` → **ARCHIVE**.
3. Không ai nhận làm chủ → **ARCHIVE**, ra khỏi phạm vi trợ lý AI.
4. Dùng hay được hỏi trong 12 tháng qua, hoặc kiểm toán từng trích → **MIGRATE-NOW**.
5. Thỉnh thoảng dùng → **MIGRATE-ON-DEMAND**: giữ chỗ cũ, chỉ đọc, chuyển khi có người cần.
6. Không dùng hơn 12 tháng → **RETIRE** nếu người phụ trách đồng ý, không thì ARCHIVE.

Kỳ vọng: chỉ khoảng 5–15% tài liệu cũ đáng chuyển ngay. Đó là suy luận từ hai nguồn
ngoài ngành (mục 13.2), không phải số đo; đừng coi tỉ lệ cao hơn là sai.

Chọn 20 tài liệu pilot trong số MIGRATE-NOW của **một** phòng ban, ưu tiên theo: câu hỏi
nhân viên hay lặp lại, tệp dùng hằng tuần, tệp kiểm toán từng trích.

## 2. Giờ duyệt của chủ trang tương lai

Chốt 2026-09-26 là duyệt mọi thay đổi, nên năng lực duyệt là thứ vỡ trước (mục 1, ý 5 của
`kho-tai-lieu-nghien-cuu.md`). Cỡ pilot và ngưỡng dừng lượt 3 (trung vị thời gian duyệt quá 5 ngày làm
việc) phụ thuộc vào con số này.

Tin mẫu gửi từng người dự kiến làm chủ trang:

> Công ty sắp đưa quy định, quy trình của phòng mình vào một kho trong CRM. Mỗi trang có
> một người chịu trách nhiệm nó còn đúng, gọi là chủ trang, và một người phó. Mọi sửa
> đổi phải qua chủ trang duyệt, kể cả sửa chính tả. Anh/chị cho biết giúp:
>
> 1. Anh/chị sẵn lòng làm chủ những tài liệu nào?
> 2. Mỗi tuần anh/chị dành được bao nhiêu phút để duyệt? Ước cũng được.
> 3. Khung giờ cố định nào trong tuần tiện nhất (ví dụ sáng thứ Hai)?
> 4. Ai là người phó hợp lý khi anh/chị vắng?

Bảng tổng, chép vào bảng tính:

```csv
nguoi,phong_ban,so_trang_nhan,phut_moi_tuan,khung_gio,pho
```

Con số cần mang về kho (mục 4): số chủ trang, trung vị phút mỗi tuần, số trang không ai
nhận.

## 3. Gom tệp trong các nhóm Zalo

Làm **trước** mọi việc khác của lượt 0: theo trợ giúp của Zalo, tệp chỉ nằm trên máy chủ
một thời gian và bản sao lưu không gồm tệp (mục 13.1, chưa kiểm). Tệp mất là mất.

1. Liệt kê các nhóm Zalo có tài liệu công việc; ghi tên nhóm và người giữ nhóm.
2. Tạo một thư mục chung trên Drive công ty, chia sẻ hạn chế, tên `kho-tai-lieu-nguon-zalo`.
   Không để trên máy cá nhân: tệp có thể là lớp B hay S.
3. Với mỗi nhóm, trên Zalo máy tính, mở mục lưu trữ của nhóm (ảnh, tệp, liên kết), tải
   **tất cả tệp**, không mở ra sửa, không đổi tên.
4. Đặt vào thư mục con theo tên nhóm. Ngày gửi và người gửi ghi vào bảng, không ghi vào
   tên tệp:

   ```csv
   nhom_zalo,nguoi_gui,ngay_gui,ten_tep,duong_dan_da_luu
   ```

5. Khi đã tải xong một nhóm, chạy lệnh dưới trong thư mục của nhóm để ghi dấu vân tay
   từng tệp. Tệp `sha256.txt` chứng minh bản gom chưa bị sửa khi nó thành nguồn của kho:

   ```bash
   find . -type f ! -name sha256.txt -exec shasum -a 256 {} + > sha256.txt
   ```

Câu trả lời trong tin nhắn nhóm **không phải chính sách** tới khi chủ trang xác nhận
(mục 13.2 bước 7). Chỉ gom tệp; tin nhắn nào đáng thành trang thì ghi vào cột `ghi_chu`
của bảng kiểm kê.

## 4. Kết quả mang về kho

Chủ kho điền khi xong; mỗi lần sửa ghi ngày. Chỉ con số, không tên tệp, không tên người.

| Số | Giá trị | Ngày |
| --- | --- | --- |
| Tổng số tệp đã kiểm kê | | |
| Theo định dạng (docx / pdf / xlsx / Google Docs / ảnh / khác) | | |
| Tỉ lệ bản quét | | |
| Theo nơi nằm (Drive / Zalo / máy cá nhân / email / giấy) | | |
| Theo lớp dữ liệu (P / I / B / S / D / T) | | |
| Theo đích (MIGRATE-NOW / ON-DEMAND / ARCHIVE / RETIRE) | | |
| Số nhóm Zalo đã gom, số tệp gom được | | |
| Số chủ trang, trung vị phút duyệt mỗi tuần | | |
| Số trang không ai nhận | | |
| Phòng ban pilot | | |
