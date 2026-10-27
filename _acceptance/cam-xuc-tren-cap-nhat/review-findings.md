## Trong hợp đồng

- **Hình dạng 4 (chỉ có assert âm): capNhatGanDay của H chỉ kiểm «không có Lg», không có đối chứng dương trong cùng lần gọi**
  file: `apps/api/test/okr-cam-xuc.spec.ts:610`
  severity: high
  AC: AC-6
  source: measurement
  detail: E6 hứa «capNhatGanDay của H không có Lg». Assert duy nhất là `expect(cng.rows.some((r) => r.checkInId === G.lanId)).toBe(false)`. Cùng lần đọc đó không kiểm `cng.rows` có chứa M.lanId, dù H đã thả trên Lm ở beforeAll và Lm phải hiện. Vì vậy chỉ cần capNhatGanDay trả rỗng cho H, hay Lg rơi ra ngoài trang đầu (lần gọi chỉ truyền `{ cycleId: ky }`, mà kỳ `ky` đã có nhiều lần cập nhật do các describe trước gieo) là assert âm này vẫn xanh. Như vậy nó không chứng minh được bộ lọc quyền xem đang chạy. Lần gọi hopTuan ngay phía trên có đối chứng dương (`dM` có H), nhưng capNhatGanDay thì không.

- **Hình dạng 5 (tuyên cả lớp nhưng chỉ có một điểm): đếm truy vấn của cx-ba-cho tuyên cho ba thủ tục, nhưng dữ liệu thêm vào chỉ làm tăng số dòng của capNhatGanDay**
  file: `apps/api/test/okr-cam-xuc.spec.ts:505`
  severity: high
  AC: AC-3
  source: measurement
  detail: E3 hứa số truy vấn của cả ba thủ tục (capNhatGanDay, hopTuan, dienBien) không tăng theo số lần cập nhật. Chiều đỏ khai là «bản sao đọc tóm tắt mỗi dòng một truy vấn -> đỏ». Vòng thêm dữ liệu (dòng 505–537) gửi 30 lần cập nhật cho đúng k1 và k2, và mọi lần đều ở `2026-10-20T0x` (`luc(\`2026-10-20T0${4 + (i % 5)}...\`)`). hopTuan trả một dòng cho mỗi KR, nên trước và sau vẫn đúng 2 dòng (k1, k2). dienBien(k1) trả một điểm cho mỗi tuần; mọi lần mới rơi vào tuần 2026-10-19, tuần đã có t3, nên trước và sau vẫn đúng 2 điểm. Một bản sao làm N+1 theo dòng trong hopTuan hay theo điểm trong dienBien vì thế có cùng số truy vấn trước và sau, và `expect(sau).toEqual(truoc)` vẫn xanh. Chỉ capNhatGanDay thật sự thay đổi số dòng. Ma trận tăng dữ liệu cần tăng chiều riêng của từng thủ tục: thêm KR có lần cập nhật cho hopTuan, thêm tuần cho dienBien.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cột okrCamXuc.loai đọc từ DB không được parse; giá trị lạ bị bỏ qua im lặng**
  Người dùng thấy gì: Hôm nay mọi cảm xúc đều được ghi qua đường kiểm chặt nên người dùng không thấy gì sai. Nếu sau này đổi hay bỏ một loại cảm xúc, những cảm xúc cũ thuộc loại đó sẽ lặng lẽ biến mất khỏi số đếm mà không báo lỗi.
  Căn cứ: Chưa gây hại cho ai lúc này, chỉ phát sinh khi sau này đổi bộ cảm xúc, và lúc đó sửa kèm là rẻ.
  file: `packages/db/src/okr-cam-xuc.ts`
  severity: low
  Đề xuất: known-limits

- **Clicks inside the reaction popover reach the row's click handler and open the KR sheet on the Recent updates screen**
  Người dùng thấy gì: Ở màn Cập nhật gần đây, khi đang đọc danh sách tên người đã thả cảm xúc trong bảng, chạm vào chỗ không phải nút có thể làm ngăn chi tiết KR bật ra giữa chừng. Người dùng đóng ngăn đó rồi mở lại bảng là đọc tiếp được.
  Căn cứ: Gây phiền khi đọc tên chứ không mất hay lộ dữ liệu, người dùng tự đóng ngăn và thử lại được.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt thay cho quan hệ): ca cx-tha không phân biệt được thứ tự LOAI_CAM_XUC với thứ tự theo số giảm**
  Người dùng thấy gì: Sản phẩm vẫn xếp các cảm xúc dưới một lần cập nhật theo thứ tự cố định, nhưng bài kiểm hiện không bắt được nếu sau này ai đó đổi sang xếp theo số người. Khi đó người dùng sẽ thấy thứ tự chip nhảy lung tung.
  Căn cứ: Chưa sai với người dùng hôm nay, chỉ là lưới bảo vệ về sau còn hở, và bổ sung ca kiểm là việc rẻ.
  file: `apps/api/test/okr-cam-xuc.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận viết trước): lệnh cx_quyen chạy ma-tran-trpc, mà tập so sánh của bài đó rút từ chính router; danh sách viết tay chứa okr.thaCamXuc nằm ở bài sang-kien-an không được chạy**
  Người dùng thấy gì: Việc người mang vai chỉ OKR thả được cảm xúc vẫn có bài kiểm, nhưng lệnh nghiệm thu đã khai không chạy bài đó. Nếu sau này quyền này bị đổi nhầm, lượt nghiệm thu có thể vẫn xanh.
  Căn cứ: Quyền hiện đúng và có bài kiểm riêng, chỗ hở chỉ ở lệnh nghiệm thu, không ảnh hưởng người dùng hôm nay.
  file: `apps/api/test/vai-chi-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
