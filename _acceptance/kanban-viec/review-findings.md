## Trong hợp đồng

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): 'thả thật' trong board.dom.tsx là KanbanMoveEvent tự ráp, không do Kanban sinh ra**
  file: `packages/ui/test/board.dom.tsx:21`
  severity: high
  AC: AC-4
  source: measurement
  detail: thaThat() bắt prop onMove của Kanban qua mock.module rồi tự gọi kanbanProps.onMove({ event: { active: { id: cardId } } as KanbanMoveEvent["event"], activeContainer: from, activeIndex: 0, overContainer: to, overIndex: toIndex }). Tên cột nguồn, cột đích và overIndex đều do test đưa vào, activeIndex luôn là 0, và `event` được ép kiểu (cast). Bên sinh thật của sự kiện này là handleDragEnd trong packages/ui/src/components/reui/kanban.tsx (khoảng dòng 419-437): hàm đó tự suy activeContainer/overContainer bằng findContainer, và đặt overIndex = độ dài cột khi `over` là một cột. Đoạn code đó không chạy ở ca nào. Ca mới 'board-can-drop: thả thật qua đường kéo của Board' vì thế chỉ đo boardDrop với đầu vào đúng khuôn mà Board.handleMove đọc. Nếu findContainer trả sai cột hoặc overIndex sai khi thả vào cột rỗng, ca này vẫn xanh. evals.yaml (E-board, dòng 42) hứa 'mô phỏng kéo bằng KeyboardSensor (Space, ArrowRight, Space)', nhưng nửa 'thả' chưa bao giờ đi qua dnd-kit. Bài nhấc thẻ bằng phím (nhac/tha) chỉ bấm Space rồi Escape, nên không sinh lần thả nào.
  rationale: AC-4 đòi kéo bằng bàn phím (Tab, Space, mũi tên phải, Space) đưa việc sang Đang làm; ca thả này không đi qua dnd-kit nên không chứng được vế đó.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): mọi lần 'kéo' trong viec-bang.dom.tsx đi qua KanbanMoveEvent tự ráp; ca 'kv: keo phim sai' không có phím nào**
  file: `apps/app/test/viec-bang.dom.tsx:228`
  severity: high
  AC: AC-4
  source: measurement
  detail: thaThat(cardId, from, to, toIndex = 0) gọi thẳng kanbanProps.onMove({ event: { active: { id } }, activeContainer: from, activeIndex: 0, overContainer: to, overIndex }). Cột nguồn và cột đích do test tự khai, không do Kanban suy từ vị trí thẻ. Hàm này được dùng cho assert 'kv: keo phim sai' (thaThat("d","DANG_LAM","CHO_DANH_GIA")), cho hai assert 'kv: canDrop khong noi' / 'kv: doi chung canDrop hong' (thaThat("v",...,"XONG") và thaThat("w",...,"DANG_LAM")), cho ca thẻ chờ khoá tay kéo, và cho cả ba ca kv-man-tra-ve. evals.yaml E4b (dòng 50) hứa 'Kéo W bằng phím (Space, ArrowRight, Space) gọi viec.keo với trangThai DANG_LAM và nguon bang-keo'. Thực tế test không gửi phím nào trong lần kéo đó: đoạn handleDragEnd của kanban.tsx (findContainer, overIndex) bị bỏ qua hoàn toàn. Vì vậy một hồi quy khiến kéo bằng phím hay chuột trên màn thật không tới được viec.keo vẫn để E4b xanh. Phím Space chỉ xuất hiện ở bước nhấc thẻ để đọc data-khong-nhan, rồi Escape, nên không có lần thả nào đi qua dnd-kit.
  rationale: AC-4 nêu rõ lối phím Space, mũi tên, Space ghi vết nguồn bang-keo; test không gửi phím nào ở lần thả nên vế này chưa được chứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **viec.bang và viec.con đọc tiêu đề việc cha mà không qua dieuKienXemViec, nên lộ tiêu đề của việc riêng (r1)**
  Người dùng thấy gì: Sau khi người giao gỡ việc cha khỏi thoả thuận, người được giao việc con vẫn thấy tiêu đề của việc cha dù đó đã thành việc riêng họ không được xem. Bấm vào tiêu đề đó thì báo không tìm thấy.
  file: `apps/api/src/viec/viec-bang.service.ts`
  severity: high
  Đề xuất: new-contract

- **Số việc con trên thẻ bảng (con.tong, conMo) đếm cả việc con người xem không thấy, lệch với viec.con (r1)**
  Người dùng thấy gì: Thẻ trên bảng có thể ghi số việc con nhiều hơn số người xem thật sự thấy trong khung việc, và hộp hỏi lại khi đóng việc cha có thể nói «còn n việc con» lệch với danh sách. Con số này còn tiết lộ có việc riêng của người khác.
  file: `apps/api/src/viec/viec-bang.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách cột bảng và nguồn kéo được khai ba chỗ, không theo luật một nguồn hằng cho mỗi khu (r1)**
  Người dùng thấy gì: Danh sách bốn cột của bảng và hai nguồn kéo được viết lặp ở nhiều nơi trong mã. Người dùng không thấy khác gì, nhưng sau này đổi thứ tự cột phải nhớ sửa đủ các chỗ.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **className đổi khoảng cách của ItemGroup ở chỗ gọi (r1)**
  Người dùng thấy gì: Một vài chỗ trên màn Việc được dựng tay thay vì dùng thành phần chung. Người dùng nhìn không khác, chỉ làm giao diện khó giữ đồng nhất về sau.
  file: `apps/app/components/viec/muc-viec-con.tsx`
  severity: low
  Đề xuất: wont-fix

- **Đóng hay huỷ việc cha trong khung việc bỏ qua bước hỏi lại khi truy vấn việc con còn đang chờ hoặc bị lỗi (r1)**
  Người dùng thấy gì: Nếu bấm «Xong» hoặc «Huỷ» ngay lúc danh sách việc con chưa kịp tải hoặc tải lỗi, việc cha bị đóng luôn mà không hỏi lại dù còn việc con đang mở.
  file: `apps/app/components/viec/khung-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **MucViecCon nuốt lỗi tải: truy vấn việc con lỗi thì cả mục biến mất, không báo gì (r1)**
  Người dùng thấy gì: Khi mạng hỏng lúc mở khung việc, mục «Việc con» và nút «Thêm việc con» biến mất mà không báo lỗi hay nút thử lại, người dùng dễ tưởng việc này không có việc con.
  file: `apps/app/components/viec/muc-viec-con.tsx`
  severity: low
  Đề xuất: known-limits

- **Kéo thả trong cột có hơn 200 thẻ bị zod từ chối, mất luôn cả bước đổi trạng thái (r1)**
  Người dùng thấy gì: Với người có cột trên 200 việc, mọi lần kéo thẻ vào cột đó đều lỗi, thẻ bật về chỗ cũ và hiện thông báo kỹ thuật khó hiểu. Chỉ gặp ở người có rất nhiều việc.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): «mặc định là danh sách» chỉ kiểm không có bảng, không kiểm danh sách hiện ra (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động cho việc mở Việc của tôi mà không chọn gì thì ra danh sách còn lỏng: trang trắng hay lỗi vẫn có thể qua. Sản phẩm có thể vẫn đúng, chỉ là chưa có bằng chứng chặt.
  file: `apps/app/test/viec-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét ma trận toàn phần viết trước, nhưng đáp án sinh lại theo đúng luật của sản phẩm; số assert = 100 luôn đúng) (r1)**
  Người dùng thấy gì: Bài kiểm tự động cho 100 tổ hợp người và trạng thái tính đáp án bằng chính luật của sản phẩm, nên nếu luật sai thì bài kiểm sai theo. Chưa thấy hành vi sai nào ở người dùng, chỉ là bằng chứng chưa độc lập.
  file: `apps/api/test/viec-bang.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
