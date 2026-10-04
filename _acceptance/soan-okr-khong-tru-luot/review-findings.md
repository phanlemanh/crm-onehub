# Review findings: soan-okr-khong-tru-luot (round 2)

## Trong hợp đồng

Không có phát hiện nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The status-500 cutoff is written twice, once as a file-local constant and once inline, instead of living in CUA_OKR**
  Người dùng thấy gì: Mốc phân biệt Trợ lý bị lỗi với Trợ lý từ chối lượt được viết ở hai nơi. Nếu sau này ai đổi một nơi mà quên nơi kia, câu hiện trên màn có thể không khớp với loại lỗi thật; hiện tại hai nơi đang khớp nhau.
  file: `apps/app/app/(app)/[slug]/okr/soan/loi-cua.ts`
  severity: medium
  Đề xuất: known-limits

- **loi-cua.ts adds a second error-body parser that silently replaces parse failures with {}**
  Người dùng thấy gì: Khi phản hồi lỗi từ cửa Trợ lý có dạng lạ, màn không báo là không đọc được mà lặng lẽ xử lý như lỗi thường. Người dùng vẫn thấy một câu lý do hợp lý theo loại lỗi, chỉ là khó phân biệt chuyện lạ này khi cần dò lỗi.
  file: `apps/app/app/(app)/[slug]/okr/soan/loi-cua.ts`
  severity: low
  Đề xuất: known-limits

- **After the 45-second timeout, «Thử lại» stops the turn and quietly sends nothing**
  Người dùng thấy gì: Khi Trợ lý im quá 45 giây rồi người dùng bấm «Thử lại», lượt đang chạy bị dừng nhưng tin không được gửi lại, và chỗ báo lỗi biến mất mà không nói gì. Người dùng tưởng đã thử lại nhưng thực tế không có gì xảy ra, phải tự gõ lại.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (tuyên quét lớp, sàn ma trận không viết tay): sàn E8 rút từ chính các mảng nó kiểm nên không bao giờ đỏ**
  Người dùng thấy gì: Bài kiểm tra màn «Thử lại» tự đếm số ca của chính nó, nên nếu ai đó xoá bớt một ca thì bài vẫn xanh. Màn chạy đúng hôm nay, nhưng lưới an toàn có thể mỏng đi mà không ai hay.
  file: `apps/app/test/soan-okr-thu-lai.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): E9 đọc «soLuot sau bấm = 0» mà không có bằng chứng cú bấm đã gửi POST qua cửa**
  Người dùng thấy gì: Phép thử trên màn thật chưa chứng minh rằng bấm «Thử lại» đã thật sự gửi lại một lượt. Nếu nút không gửi gì thì số lượt vẫn bằng 0 và phép thử vẫn xanh, nên có thể che một lỗi.
  file: `_acceptance/soan-okr-khong-tru-luot/rang/thu-lai-man-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định có mặt thay cho quan hệ): ca từ chối có tên trong E8 chỉ kiểm phần tử [data-tu-choi], không kiểm câu có tên**
  Người dùng thấy gì: Bài kiểm tra chỉ chắc chắn có một khung báo từ chối hiện ra, chứ không chắc nội dung câu trong đó đúng. Nếu câu bị đổi thành câu chung chung thì bài vẫn xanh.
  file: `apps/app/test/soan-okr-thu-lai.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
