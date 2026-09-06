# Phát hiện — vòng 4

Hai làn chấm, **không mục nào TRONG hợp đồng**. Mười mục dưới đây đều ngoài phạm
vi 16 tiêu chí đã duyệt — việc của người ở Cổng Bằng chứng.

Bốn mục đầu do lượt máy nêu, sáu mục sau do lượt lái trình duyệt nêu. Ba mục
(Ngoài-4, Ngoài-9, Ngoài-10) là quan sát về chính bộ đo hoặc về môi trường dev,
không phải khuyết tật sản phẩm — vẫn để người quyết chứ không tự gạt đi.

## Trong hợp đồng

## Ngoài hợp đồng

- **E13 khai ba bài, kho chỉ có hai — vế «chưa gọi ai thì tỷ lệ là null» không có chân**
  file: `apps/api/test/campaigns.spec.ts`
  severity: medium
  Người dùng thấy gì: Nếu con số tỷ lệ trả lời của một chiến dịch chưa ai gọi hỏng thành 0% thay vì để trống, không phép đo nào của vòng này bắt được. `answerRate` chỉ được khẳng định đúng một lần, ở ca đã có lượt gọi.
  Đề xuất: known-limits

- **E5 khai bài «lọc được», kho chỉ khẳng định cái cờ**
  file: `apps/api/test/listing-fields.spec.ts`
  severity: medium
  Người dùng thấy gì: Bộ đo chứng minh chín trường sàn được đánh dấu là lọc-được, nhưng không lần nào thực sự lọc danh bạ theo một trường sàn. Nếu việc lọc hỏng, phép đo vẫn xanh.
  Đề xuất: known-limits

- **Lệnh chấm `tt_api` bỏ sót tệp kiểm giữ chân 500 mục của AC-1**
  file: `_acceptance/config.yaml`
  severity: low
  Người dùng thấy gì: Không ảnh hưởng người dùng. Chân đo «nhận trọn một lô 500 mục qua HTTP thật» vẫn chạy, nhưng nhờ bộ kiểm toàn kho gánh chứ không nhờ lệnh chấm của hồ sơ. Sửa lệnh thì bằng chứng nói đúng thứ nó đo.
  Đề xuất: known-limits

- **Mục Ngoài-21 trong giới hạn đã biết có vẻ đã cũ**
  file: `_acceptance/tiep-thi-tuyen-doi-tac/contract.md`
  severity: low
  Người dùng thấy gì: Không ảnh hưởng người dùng. Giới hạn đã ký ghi rằng bài kiểm nạp dữ liệu chỉ đếm bản ghi, nhưng bài đó nay đối chiếu đủ ma trận chín trường. Danh sách giới hạn đang mô tả sản phẩm nặng hơn thực tế.
  Đề xuất: known-limits

- **Thay đổi ở menu góc nhìn không có khung hình nào chứng minh trên màn**
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
  severity: medium
  Người dùng thấy gì: Không ảnh hưởng người dùng. Bản sửa làm góc nhìn đang được chiến dịch dùng hiện dòng lý do thay cho nút xoá; năm chặn của làn lái không lần nào mở menu «Bảng xem», nên bằng chứng thị giác cho thay đổi đó không có. Chỉ có bằng chứng mức API.
  Đề xuất: known-limits

- **Ba mã trạng thái của E15 dùng chung một tệp ảnh, trùng từng byte**
  file: `_acceptance/tiep-thi-tuyen-doi-tac/evidence`
  severity: low
  Người dùng thấy gì: Không ảnh hưởng người dùng. Ba tên tệp gợi ba lần chụp riêng nhưng thực tế là một lần; nội dung khung hình đó có đủ cả ba thứ nên không sai, chỉ là hồ sơ nói quá số lần chụp.
  Đề xuất: known-limits

- **Tệp đường dây `E6-network.txt` còn là của vòng 3**
  file: `_acceptance/tiep-thi-tuyen-doi-tac/evidence/E6-network.txt`
  severity: low
  Người dùng thấy gì: Không ảnh hưởng người dùng. Vì tệp không được ghi lại, mọi khối bằng chứng khai «không đọc được đường dây» thay vì «sạch». Bằng chứng khiêm tốn hơn thực tế, không phóng đại.
  Đề xuất: known-limits

- **Hàng đối chứng luôn hiện «Thành viên —» trong mọi khung hình**
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: low
  Người dùng thấy gì: Dải «Mọi chiến dịch khác» để trống ô số thành viên trong khi ba ô kia có số. Hợp đồng không đòi số đó, nhưng người đọc màn có thể tưởng con số hỏng chứ không phải cố ý bỏ trống.
  Đề xuất: known-limits

- **Thanh điều hướng bên vẫn trộn tiếng Anh với một mục tiếng Việt**
  file: `apps/app/components/app-icon-rail.tsx`
  severity: low
  Người dùng thấy gì: Thanh bên in Overview · Chat · Companies · Contacts · Deals · Chiến dịch · Settings. Đúng như Ngoài-11 đã ký nhận ở vòng 3; ghi lại vì nó nằm ngay cạnh hai màn vòng này sửa.
  Đề xuất: known-limits

- **Lớp phủ nhà phát triển che góc dưới-trái mọi khung hình bằng chứng**
  file: `_acceptance/tiep-thi-tuyen-doi-tac/evidence`
  severity: low
  Người dùng thấy gì: Không ảnh hưởng người dùng thật. Huy hiệu đỏ của máy chủ dev đè lên dòng đếm cuối bảng ở hầu hết ảnh, và ở một ảnh đè lên đúng chữ thông báo lỗi. Ảnh bằng chứng là ảnh máy chủ dev, không phải bản dựng phát hành.
  Đề xuất: known-limits
