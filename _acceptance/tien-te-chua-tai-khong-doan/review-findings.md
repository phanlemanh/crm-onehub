## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **The same setting has two names: «đồng tiền mặc định» in the create sheet and «đồng tiền báo cáo» in quick add, and CONTEXT.md has neither**
  Người dùng thấy gì: Người dùng có thể thấy hai tên gọi khác nhau cho cùng một cài đặt tiền tệ tuỳ theo họ đang tạo thoả thuận ở tấm nào, dễ nhầm không biết cần sửa cài đặt ở đâu.
  file: `apps/app/lib/messages/deals.ts`
  severity: medium
  Đề xuất: new-contract

- **Real-screen probe exits 1 (read as 'feature broken') on any unexpected exception, instead of 2 (could not measure)**
  Người dùng thấy gì: Nếu công cụ kiểm tra tự động gặp trục trặc bất ngờ trong lúc đo, nó có thể báo nhầm là tính năng đang hỏng dù sản phẩm vẫn hoạt động đúng, khiến người quyết định hiểu sai tình trạng thực tế.
  file: `_acceptance/tien-te-chua-tai-khong-doan/rang/man-that.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — ma trận không viết trước: số khẳng định của soi-ma so với con số suy ra từ chính danh sách nó lặp**
  Người dùng thấy gì: Bài kiểm tra tự động cho tính năng này có thể tự nới lỏng theo thời gian mà không ai nhận ra, nên các lần sửa sau này có nguy cơ không còn được kiểm tra đầy đủ như tưởng.
  file: `_acceptance/tien-te-chua-tai-khong-doan/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).