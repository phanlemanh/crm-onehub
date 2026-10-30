# Review findings: cap-nhat-trong-ngan-kr (round 1)

## Trong hợp đồng

- **Hình dạng 3 (assert tồn tại/tổng thay cho QUAN HỆ): răng thuoc-da-ky so TỔNG số lời gọi khẳng định giữa merge-base và HEAD, không so từng khẳng định**
  AC: AC-10
  file: `_acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs:83`
  severity: medium
  source: measurement
  detail: Lời hứa E10c là quan hệ theo từng khẳng định: «assertion mất mà ô không mang nhãn thay-loi-hua → đỏ», «so số expect()/khẳng định VÀ selector». Răng chỉ tính `mat = truoc - sau - thay`, trong đó truoc/sau là số lần regex `KHANG_DINH = /\b(?:expect|dong|bao|kiem|ghi|sai\.push|loi\.push|sai)\(/g` khớp trong cả tệp (dòng 24, 74-86). Thêm một khẳng định ở chỗ khác sẽ che một khẳng định bị mất, và không có bước so selector nào. Ví dụ có thật trong diff: hop-cap-nhat-lan-truoc.dom.tsx bỏ `loi.push("hct-tai: thieu ngay so tu tin khi dang tai ghi chu")` và `loi.push(`hct-khoi: khoi khong dung truoc o gia tri …`)`, lại thêm hai `loi.push(` mới. Số đếm vẫn 20→20 nên răng in «0 mat lang». Ma trận không có ô nào mang `[gỡ]` (grep ra 0), nên `thay` luôn bằng 0: răng xanh hoàn toàn nhờ số đếm thực bù trừ nhau, không nhờ đối chiếu với nhãn. Răng cũng không thấy phần lớn khẳng định trong các tệp này, vốn viết dạng phần tử mảng `cond || "msg"` hay khoá trong `toEqual({...})` (ví dụ ngan-kr-mot-cho đổi `capNhat: "default"` thành `capNhat: { nutChinhDau: 0, khoi: true }`). Đối chứng dương (`doiChungDuong`) chỉ xoá một `expect(` thuần, đúng loại mà phép đếm thấy được.
  rationale: AC-10 đòi không assertion nào mất mà không có nhãn «thay lời hứa»; finding chỉ ra assertion bị bỏ ở diff thật mà phép đếm tổng vẫn xanh, nên bảo đảm của AC-10 không đứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hằng số ngày/tuần đặt rời ở đầu tệp và quy tắc «đầu tuần VN» bị viết lại lần nữa phía client**
  Người dùng thấy gì: Hôm nay khối cập nhật vẫn quyết đúng mở hay thu theo tuần. Nhưng nếu sau này luật «tuần này» đổi ở một nơi mà quên nơi kia, khối có thể mở hay thu sai so với dữ liệu thật.
  Căn cứ: Chưa gây sai gì cho người dùng bây giờ, chỉ tăng nguy cơ lệch về sau; sửa lúc đó vẫn rẻ và không mất dữ liệu.
  file: `apps/app/components/crm/record-sheet/khoi-cap-nhat-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Gợi ý phím tắt là chữ phụ tự vẽ bằng span text-muted-foreground text-xs**
  Người dùng thấy gì: Dòng gợi ý phím tắt dưới form trông và hoạt động đúng, chỉ khác cách dựng so với chuẩn của kho nên hình dáng có thể lệch nhẹ với các màn khác.
  Căn cứ: Chỉ là lệch nếp giao diện, người dùng không mất gì và vẫn dùng được bình thường; sửa sau vẫn rẻ.
  file: `apps/app/components/crm/record-sheet/khoi-cap-nhat-kr.tsx`
  severity: low
  Đề xuất: wont-fix

- **Clicking the objective link in the KR sheet header throws away an unsent update without asking**
  Người dùng thấy gì: Đang gõ dở một cập nhật KR mà bấm tên mục tiêu ở đầu ngăn thì ngăn chuyển sang mục tiêu và phần đã gõ mất, không hỏi lại.
  Căn cứ: Mất phần nháp chưa gửi nhưng chỉ vài ô gõ tay, người dùng gõ lại được và không ảnh hưởng dữ liệu đã lưu; tuy vậy sửa không đắt nên nên cân nhắc.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Cancelling the ‹ › guard leaves CHUYEN_KR.huong set, so the next KR sheet moves focus to a nav button**
  Người dùng thấy gì: Trong một chuỗi thao tác hiếm, lần mở KR kế tiếp có thể đặt con trỏ vào nút ‹ › thay vì ô giá trị, người dùng phải bấm vào ô giá trị.
  Căn cứ: Chỉ lệch vị trí con trỏ một lần, không mất dữ liệu và người dùng tự bấm vào ô là xong.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ô (c) «biên tuần VN» của E1 tự ghi sẵn trường tuan, không tính từ luc**
  Người dùng thấy gì: Sát ranh giới tuần (khuya Chủ nhật, sáng Thứ hai giờ VN), nếu máy chủ tính tuần lệch thì khối có thể mở hay thu sai mà bài kiểm hiện tại không bắt được.
  Căn cứ: Chỉ ảnh hưởng một khoảng giờ hẹp mỗi tuần, nhầm chỉ làm khối mở hay thu sai chứ không mất dữ liệu, người dùng bấm mở lại được.
  file: `apps/app/test/cap-nhat-trong-ngan-kr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bản ghi giả guiCapNhat bỏ note, nên «dòng đầu Lịch sử mang ghi chú» luôn là chữ fixture tự sinh**
  Người dùng thấy gì: Nếu ghi chú gõ vào không hiện đúng ở dòng đầu Lịch sử, bài kiểm hiện tại sẽ không báo.
  Căn cứ: Đường lưu ghi chú đã được kiểm riêng nên rủi ro thấp; nếu có sai chỉ là hiển thị và người dùng tải lại là thấy bản thật.
  file: `apps/app/test/cap-nhat-trong-ngan-kr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assert âm tính một mình): E11 bước 9 «gửi → khối thu» chỉ kiểm khối "mo" biến mất, rồi điều hướng đi**
  Người dùng thấy gì: Nếu sau khi gửi ngăn KR đóng hẳn thay vì thu lại, thước màn cũ này vẫn báo xanh.
  Căn cứ: Lỗi sẽ không bị bắt ở thước này nhưng thước riêng của tính năng vẫn đo gửi xong ngăn còn mở; người dùng không bị ảnh hưởng thêm.
  file: `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): E18 bước 5 «hộp đóng → khối thu» chỉ kiểm khối "mo" vắng, rồi veSheetMucTieu tự mở lại ngăn**
  Người dùng thấy gì: Nếu sau khi gửi từ lối cập nhật tuần mà khối không thu lại đúng, hoặc ngăn đóng, thước màn cũ này vẫn báo xanh.
  Căn cứ: Là chỗ hở của một bài kiểm cũ, thước riêng của tính năng vẫn đo trạng thái sau gửi; không tác động trực tiếp đến người dùng.
  file: `_acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
