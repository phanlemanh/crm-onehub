# Ca kiểm lưu trữ và khôi phục không còn đỏ ngẫu nhiên — thiết kế

Hàng F33 (mã tạm) của dãy P4, đợt r2. Cổng Đáng: «Cổng Đáng F33: build» (chủ kho, 16/10 15:08:22Z).

## Vì sao

`apps/api/test/tai-lieu-luu-tru.spec.ts` có hai ca đếm sự kiện của một trang sau một lần duyệt:

- dòng 213 (ma trận duyệt lưu trữ): kỳ vọng `{ LUU_TRU: 1, CU: 1 }`;
- dòng 287 (khôi phục): kỳ vọng `{ KHOI_PHUC: 1 }`.

Cả hai lấy mốc `const moc = new Date(Date.now() - 1)` ngay sau khi tạo đề xuất, rồi đếm sự kiện có `luc > moc`
(`suKienSau`, dòng 70). `luc` do Postgres đặt (`@default(now())` ở `model TaiLieuSuKien`), `moc` do đồng hồ của tiến
trình kiểm đặt. Sự kiện DE_XUAT sinh khi tạo đề xuất mà rơi vào đúng mili-giây cuối (hoặc đồng hồ Postgres nhanh hơn
một chút) thì có `luc > moc` và bị đếm thành sự kiện của lần duyệt — ca đỏ với `DE_XUAT: 1` thừa. #413 đã vấp ở
pre-push.

Dòng đỏ nguyên văn của #413: **chưa rõ** — không tìm thấy nhật ký trong kho hay trong các cây (16/10); mô tả lấy từ
câu giao của giám sát (ca 290 «khoi-phuc», sự kiện DE_XUAT cùng mili-giây). Ca 213 dùng đúng cơ chế đếm `luc > moc`
nên được xếp cùng lớp theo suy luận từ mã; chưa thấy nó đỏ.

## Cách làm

- Bỏ mốc đồng hồ: trước hành động, chụp tập id sự kiện hiện có của trang; sau hành động, đếm các sự kiện có id NGOÀI
  tập đó. Không đồng hồ nào tham gia, nên lệch đồng hồ hay trùng mili-giây đều không đổi kết quả.
- Sửa cả hai ca (213, 287) — cùng cơ chế, cùng tệp.
- Thêm ca `tlkp-dem` cho chính hàm đếm, trên cùng dữ liệu: gieo một sự kiện DE_XUAT có `luc` ở tương lai (giả lập
  trùng mili-giây hay đồng hồ Postgres chạy trước) TRƯỚC khi chụp; cách đếm theo mốc giờ cũ phải đếm nhầm nó (đối
  chứng: dữ liệu gieo thật sự kích được lỗi), cách đếm theo id phải không đếm; và một sự kiện sinh SAU khi chụp phải
  được đếm (đối chứng dương cho hàm mới). Cách đếm theo mốc giờ cũ chỉ sống trong thân ca `tlkp-dem`.
- Thêm ca `tlkp-tinh` quét mã nguồn: thân hai ca khôi phục và ma trận duyệt lưu trữ phải chụp id trước lệnh duyệt rồi
  đếm bằng id; trong thân hai ca, và trong cả tệp trừ thân `tlkp-dem` và `tlkp-tinh`, không còn mốc đồng hồ nào
  (`Date.now()` theo sau là dấu trừ, chịu được khoảng trắng) và không còn lời gọi hàm đếm theo mốc.

Không đổi mã sản phẩm nào; chỉ `apps/api/test/tai-lieu-luu-tru.spec.ts`.

## Đo

- Bộ kiểm `tai-lieu-luu-tru.spec.ts` xanh (hai ca đã sửa + ca mới).
- `tlkp-dem`: chiều đỏ là chính cách đếm cũ trên cùng dữ liệu gieo; đối chứng dương là sự kiện sinh sau khi chụp.
- `tlkp-tinh`: chiều đỏ trên ba chuỗi mẫu — `Date.now()-1` không dấu cách, thân ca gọi hàm đếm theo mốc, thân ca chụp id
  SAU lệnh duyệt — và một bản sao của thân ca 287 có chép dòng đối chứng vào; mỗi mẫu ghim thông điệp.

## Ngoài phạm vi

- Năm tệp kiểm API khác cũng dùng mốc `Date.now() - 1` (`dieu-phoi.spec.ts`, `giai-doan-bao-cao.spec.ts`,
  `moi-phia-ke-hoach.spec.ts`, `slack-connection.spec.ts`, `tai-lieu-hoi-suc-khoe.spec.ts`) — câu giao chỉ nêu tệp
  này; chưa thấy chúng đỏ ngẫu nhiên.
- Mã sản phẩm của Kho tài liệu — hành vi đúng, chỉ phép đếm trong bài kiểm sai.
