## Trong hợp đồng

- **Hình dạng 4 (âm-tính-một-mình): «thả vào cột cấm thì viec.keo gọi 0 lần» không bao giờ thật sự thả**
  AC: AC-4
  file: `apps/app/test/viec-bang.dom.tsx:400`
  severity: high
  detail: E4b hứa: kéo V (chuyenDuoc []) bằng phím sang cột Xong thì viec.keo gọi 0 lần. Ở dòng 400-429, test chỉ nhấn Space để nhấc thẻ, đọc data-khong-nhan, rồi nhấn Escape để huỷ. Thẻ không được thả xuống, nên Board không bao giờ đi qua handleMove → boardDrop(…, { canDrop, reorder }). Phép kiểm `truocKeo !== 1` chỉ đếm lại lần gọi onMove trực tiếp cho thẻ 'd' ở dòng 370. Lần đó cũng không qua đường kéo, nên đối chứng dương «W kéo sang DANG_LAM» đúng như E4b ghi chưa từng chạy. Huỷ bằng Escape thì không gọi keo, bất kể canDrop. Phía packages/ui cũng hổng tương tự: board.dom.tsx (dòng 98-104, ca board-can-drop) chỉ gọi thẳng hàm thuần boardDrop, không mô phỏng KeyboardSensor (Space, ArrowRight, Space) như E4 hứa. Nếu Board.handleMove (board.tsx:178-189) thôi truyền canDrop cho boardDrop, cả E4 lẫn E4b vẫn xanh. Đột biến (m) chỉ bắt được vì boardProps.canDrop bị mất, không bắt được trường hợp đường thả bỏ qua canDrop.
  source: measurement

- **Hình dạng 4 (âm-tính-một-mình / mệnh đề rỗng): ca rỗng dùng .every trên NodeList có thể rỗng**
  AC: AC-1
  file: `apps/app/test/viec-bang.dom.tsx:328`
  severity: medium
  detail: Dòng 328-331: `[...querySelectorAll("[data-board-column]")].every(c => c.textContent?.includes(V.bang.rongCot))`. Nếu ở trạng thái rỗng bảng không dựng cột nào (ví dụ chỉ dựng một Empty chung, hoặc chưa tải xong), mảng rỗng và .every trả true, nên 'kv: rong sai' không bao giờ ném. Test không kiểm có đúng bốn cột trước khi kiểm chữ «Chưa có việc» trong từng cột. Lời hứa của E1b là «mỗi cột».
  source: measurement

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): dòng Xong cũ chỉ kiểm có chữ «3»**
  AC: AC-1
  file: `apps/app/test/viec-bang.dom.tsx:298`
  severity: medium
  detail: E1b hứa: cuối cột Xong có liên kết dẫn sang kiểu Danh sách, nêu số việc còn lại. Đây là quan hệ n = tong của cột Xong trừ số thẻ đang hiện, cộng đích đến là kiểu xem danh sách. Dòng 298-300 chỉ kiểm `xongCu?.textContent?.includes("3")` với fixture tongXong=4 và một thẻ. Test không bấm nút để xem URL có rời xemViec=bang không (nút gọi onXemDanhSach → setXem("danh-sach")). Nó cũng không đối chiếu con số với tong và số thẻ: một chuỗi khác tình cờ chứa «3» vẫn qua.
  source: measurement

- **Hình dạng 4 (âm-tính-một-mình): nhóm Đang theo dõi «không tay kéo» đúng cả khi bảng không dựng thẻ nào**
  AC: AC-4
  file: `apps/app/test/viec-bang.dom.tsx:455`
  severity: medium
  detail: Dòng 455-460 mount ?nhomViec=dang-theo-doi rồi chỉ kiểm số [data-slot="kanban-item-handle"] và [data-chuyen-sang] bằng 0. Test không kiểm trong chính lần mount đó có thẻ nào [data-the-viec] được dựng. Đối chứng ở dòng 463-470 dùng một lần mount khác (giao-cho-toi), nên không chứng minh được nhóm theo dõi có dựng thẻ. Nếu bảng theo dõi chưa tải hoặc không dựng thẻ, phép kiểm âm vẫn xanh.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **viec.bang và viec.con đọc tiêu đề việc cha mà không qua dieuKienXemViec, nên lộ tiêu đề của việc riêng**
  Người dùng thấy gì: Sau khi người giao gỡ việc cha khỏi thoả thuận, người được giao việc con vẫn thấy tiêu đề của việc cha dù đó đã thành việc riêng họ không được xem. Bấm vào tiêu đề đó thì báo không tìm thấy.
  file: `apps/api/src/viec/viec-bang.service.ts`
  severity: high
  Đề xuất: new-contract

- **Số việc con trên thẻ bảng (con.tong, conMo) đếm cả việc con người xem không thấy, lệch với viec.con**
  Người dùng thấy gì: Thẻ trên bảng có thể ghi số việc con nhiều hơn số người xem thật sự thấy trong khung việc, và hộp hỏi lại khi đóng việc cha có thể nói «còn n việc con» lệch với danh sách. Con số này còn tiết lộ có việc riêng của người khác.
  file: `apps/api/src/viec/viec-bang.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách cột bảng và nguồn kéo được khai ba chỗ, không theo luật một nguồn hằng cho mỗi khu**
  Người dùng thấy gì: Danh sách bốn cột của bảng và hai nguồn kéo được viết lặp ở nhiều nơi trong mã. Người dùng không thấy khác gì, nhưng sau này đổi thứ tự cột phải nhớ sửa đủ các chỗ.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **className đổi khoảng cách của ItemGroup ở chỗ gọi**
  Người dùng thấy gì: Một vài chỗ trên màn Việc được dựng tay thay vì dùng thành phần chung. Người dùng nhìn không khác, chỉ làm giao diện khó giữ đồng nhất về sau.
  file: `apps/app/components/viec/muc-viec-con.tsx`
  severity: low
  Đề xuất: wont-fix

- **Đóng hay huỷ việc cha trong khung việc bỏ qua bước hỏi lại khi truy vấn việc con còn đang chờ hoặc bị lỗi**
  Người dùng thấy gì: Nếu bấm «Xong» hoặc «Huỷ» ngay lúc danh sách việc con chưa kịp tải hoặc tải lỗi, việc cha bị đóng luôn mà không hỏi lại dù còn việc con đang mở.
  file: `apps/app/components/viec/khung-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **MucViecCon nuốt lỗi tải: truy vấn việc con lỗi thì cả mục biến mất, không báo gì**
  Người dùng thấy gì: Khi mạng hỏng lúc mở khung việc, mục «Việc con» và nút «Thêm việc con» biến mất mà không báo lỗi hay nút thử lại, người dùng dễ tưởng việc này không có việc con.
  file: `apps/app/components/viec/muc-viec-con.tsx`
  severity: low
  Đề xuất: known-limits

- **Kéo thả trong cột có hơn 200 thẻ bị zod từ chối, mất luôn cả bước đổi trạng thái**
  Người dùng thấy gì: Với người có cột trên 200 việc, mọi lần kéo thẻ vào cột đó đều lỗi, thẻ bật về chỗ cũ và hiện thông báo kỹ thuật khó hiểu. Chỉ gặp ở người có rất nhiều việc.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): «mặc định là danh sách» chỉ kiểm không có bảng, không kiểm danh sách hiện ra**
  Người dùng thấy gì: Bài kiểm tự động cho việc mở Việc của tôi mà không chọn gì thì ra danh sách còn lỏng: trang trắng hay lỗi vẫn có thể qua. Sản phẩm có thể vẫn đúng, chỉ là chưa có bằng chứng chặt.
  file: `apps/app/test/viec-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét ma trận toàn phần viết trước, nhưng đáp án sinh lại theo đúng luật của sản phẩm; số assert = 100 luôn đúng)**
  Người dùng thấy gì: Bài kiểm tự động cho 100 tổ hợp người và trạng thái tính đáp án bằng chính luật của sản phẩm, nên nếu luật sai thì bài kiểm sai theo. Chưa thấy hành vi sai nào ở người dùng, chỉ là bằng chứng chưa độc lập.
  file: `apps/api/test/viec-bang.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
