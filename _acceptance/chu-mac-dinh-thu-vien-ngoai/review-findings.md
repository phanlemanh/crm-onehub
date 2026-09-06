# Phát hiện của vòng chấm — chu-mac-dinh-thu-vien-ngoai

Vòng chấm ngày 06/09, chạy tuần tự từng lệnh.

## Trong hợp đồng

Bốn lỗi bắt được trong lúc thi công, tất cả đã vá — và **cả bốn đều do chính phép
đo của vòng bắt, không do người đọc lại**.

- **Bốn con số neo trong hợp đồng đều sai** — AC: AC-2, AC-3, AC-8.
  Chúng đến từ phép đếm tay của người viết: `79→76` component (đếm cũ tính cả file
  không phải `.tsx`), `35→37` bọc, `20→30` bọc-mà-không-đọc. Và định nghĩa «bọc»
  phải đổi từ *danh sách tên gói gõ tay* — đúng thứ thiết kế nói sẽ trôi — sang
  *một định danh nhập từ gói ngoài và được VẼ RA như một thẻ JSX*.
- **Neo sai lần thứ hai** — AC: AC-2, AC-3.
  Vá `sonner` xong thì chính nó rời khỏi nhóm bọc-mà-không-đọc: `15→16` và
  `30→29`. Chân là bên phát hiện.
- **Bộ chạy vòng chấm đếm thiếu** — AC: (hạ tầng của vòng).
  Nó kết luận PASS trong khi một suite đang đỏ, vì chỉ đếm eval mà không đếm suite.
  Đã sửa: suite đỏ ép verdict xuống PENDING-JUDGMENT.
- **Mẫu trong bảng khai thoát dấu chéo dư một tầng** — AC: AC-1.
  Dòng theo mẫu không khớp chuỗi nào, nên 23 ngày bị báo là chuỗi lạ. Chân đúng,
  bản khai sai.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Bộ chấm bản vẽ của `packages/ui` đòi một ca cho mỗi component đọc bảng dịch**
  Người dùng thấy gì: không thấy gì — nhưng vòng này vừa làm một component bắt đầu đọc bảng dịch, và cái thước có sẵn ấy lập tức đỏ vì thiếu ca vẽ. Đã thêm ca; ghi lại vì đó là một ràng buộc chưa được nêu trong hợp đồng của vòng.
  file: `packages/ui/test/render-diff.spec.tsx`
  severity: P2
  Đề xuất: known-limits — ràng buộc đúng và đã thoả; ghi để vòng sau biết trước rằng thêm một chỗ đọc kho chuỗi kéo theo một ca vẽ
- **Bốn màn trong bản khai không phủ được các component chỉ hiện sau khi bấm**
  Người dùng thấy gì: mười component — hộp thoại, menu, ngăn kéo, chú giải — chỉ vẽ ra sau khi người bấm, nên phép đo trên màn không bao giờ nhìn tới chúng; nếu một trong số đó mang chữ tiếng Anh của thư viện thì vòng này không thấy.
  file: `_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json`
  severity: P1
  Đề xuất: new-contract — cần một chân lái từng component ra màn; vòng này khai giới hạn thành bảng đếm được có chiều đỏ, nhưng khai không thay được đo

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
