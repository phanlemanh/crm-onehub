# Review findings: trang-thai-tin-hieu-song (round 2)

## Trong hợp đồng

- **Lệnh đo bỏ sót thông báo khi bản chụp mang sha của commit không chạm LO-TRINH.html, rồi báo nhầm là «thiếu»**
  file: `scripts/tin-hieu/do-bao-doi-cho.ts:92`
  severity: medium
  AC: AC-8
  source: bugs
  detail: Vòng này `ghepLanDoi` lấy giờ commit cho `lucCommit` từ danh sách `commit`. Danh sách đó là kết quả `git log --first-parent ... -- LO-TRINH.html`, nên chỉ chứa commit chạm vào tệp lộ trình. Nhưng sha nằm trong khoá thông báo là `vao.sha` của bản chụp, và bản chụp lấy `git rev-parse HEAD` ở scripts/ban-chup-lo-trinh/day.ts:126. Workflow .github/workflows/ban-chup-lo-trinh.yml chạy khi một lần push lên onehub có chạm LO-TRINH.html, và chạy cả qua `workflow_dispatch`. Có hai trường hợp HEAD không chạm tệp đó: (1) một lần push gồm nhiều commit mà commit cuối không sửa LO-TRINH.html; (2) chạy lại bằng tay qua workflow_dispatch sau khi lần đẩy trước hỏng, đúng đường cứu thường dùng. Khi đó `lucCommit.get(t.sha)` trả về undefined và `t.sha !== l.sha`, nên thông báo đã gửi thật bị loại khỏi `phu`. Lần đổi chỗ bị gắn cờ `BAO_DOI_CHO_DO.thieu`, và KẾT LUẬN ra «không đạt» dù người gửi đã nhận thông báo. Cách sửa: dựng `lucCommit` từ mọi commit first-parent của nhánh kể từ `tu`, bỏ pathspec, hoặc đọc giờ commit của từng `t.sha` bằng `git show -s --format=%cI`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 3 (lời hứa là quan hệ giữa hai giá trị, nhưng bài so một giá trị với chính nó): ở E2, phép so «trang Tín hiệu chọn nguồn giống trang Lộ trình» không bao giờ gọi bộ đọc của trang Lộ trình**
  Người dùng thấy gì: Hai trang tín hiệu và trang Lộ trình có thể chọn khác nguồn dữ liệu trong một trường hợp hiếm là bản chụp lưu bị hỏng một phần, và bài kiểm tự động hiện không bắt được chỗ lệch này. Người dùng có thể thấy chỗ cũ của tín hiệu ở trang này nhưng chỗ mới ở trang kia.
  Căn cứ: Chỉ xảy ra khi dữ liệu bản chụp hỏng một phần, hiếm; hậu quả nhẹ (chỗ hiển thị cũ hơn một nhịp, tự hết khi có bản chụp kế tiếp), không mất dữ liệu, và bổ sung bài kiểm sau này rẻ.
  file: `apps/app/test/tin-hieu-nguon.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Nhánh này thêm một trang bằng chứng vào hồ sơ đã ký của tính năng khác (gom-tin-hieu-tu-chay) (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bản giao mang theo một trang bằng chứng của tính năng gom tín hiệu đã ký mà người ký chưa từng xem. Người dùng không thấy gì khác đi, nhưng hồ sơ đã ký kia có thể bị coi là lệch.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; gỡ tệp khỏi nhánh là việc rẻ nhưng thuộc dọn nhánh, không thuộc tính năng này.
  file: `_acceptance/gom-tin-hieu-tu-chay/evidence-page.html`
  severity: medium
  Đề xuất: known-limits

- **Luật «không bao giờ lùi» của bản chụp nay có hai bản cài đặt, và docs/api.md còn tả cách cũ (r1)**
  Người dùng thấy gì: Hiện có hai đường cùng ghi bản chụp lộ trình và tài liệu mô tả cách cũ. Người dùng chưa thấy lỗi nào, nhưng về sau hai đường có thể lệch nhau.
  Căn cứ: Hậu quả nhẹ và chỉ phát sinh khi sau này sửa một trong hai đường; người dùng không gặp, sửa sau không đắt.
  file: `apps/api/src/lo-trinh/tin-hieu-doi-cho.ts`
  severity: low
  Đề xuất: known-limits

- **Lệnh đo đưa dữ liệu chưa kiểm khuôn từ `git show` thẳng vào `choTinHieu` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi dữ liệu lấy từ lịch sử git sai khuôn, lệnh đo của chủ kho sẽ dừng với lỗi khó hiểu thay vì báo rõ là không đọc được. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ chủ kho gặp, chạy lại là biết; không mất dữ liệu và không ảnh hưởng thông báo gửi cho người dùng.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: low
  Đề xuất: known-limits

- **Phép đo báo đổi chỗ nuốt lỗi đọc tệp, rồi kết luận «đạt» với mã thoát 0 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu lịch sử lộ trình không đọc được, lệnh đo của chủ kho có thể báo «đạt» thay vì báo hỏng, làm chủ kho tưởng mọi thông báo đều đúng hạn.
  Căn cứ: Chỉ ảnh hưởng phép đo sau một tháng của chủ kho, không ảnh hưởng người dùng cuối; chủ kho tự kiểm lại được khi thấy kết quả lạ.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng có ô không đo thật): ô hang-khac trong ma trận 18 ô của E6 so hàm với chính nó (r1)**
  Người dùng thấy gì: Một trong các chỗ của tín hiệu chưa có phép kiểm so nhãn thông báo với nhãn trên trang, nên nhãn có thể lệch mà bài kiểm vẫn xanh.
  Căn cứ: Chỉ là một chỗ hiếm trong số chín, lệch chỉ là sai chữ chứ không mất dữ liệu, và người dùng báo được, sửa rẻ.
  file: `apps/app/test/thong-bao-cau.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
