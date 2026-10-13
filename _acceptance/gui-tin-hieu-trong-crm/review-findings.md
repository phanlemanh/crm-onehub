# Review findings: gui-tin-hieu-trong-crm

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A second, looser schema for the roadmap data that silently returns an empty map when parsing fails**
  Người dùng thấy gì: Nếu bản vẽ lộ trình đổi cách ghi các hàng, trang «Tín hiệu đã gửi» vẫn chạy nhưng nhãn trạng thái của mọi tín hiệu rơi về «Khác» và không có dòng nào báo là bản vẽ không đọc được.
  file: `packages/validation/src/tin-hieu.ts`
  severity: medium
  Đề xuất: known-limits

- **Real app shows the server's Vietnamese daily-limit sentence to English users; the English message is only used by the prototype**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh, khi gửi quá số tín hiệu cho phép trong ngày, sẽ thấy câu báo lỗi bằng tiếng Việt thay vì tiếng Anh.
  file: `apps/app/components/tin-hieu/nut-gui-tin-hieu.tsx`
  severity: medium
  Đề xuất: known-limits

- **Client component re-derives a signal's status, copying server logic**
  Người dùng thấy gì: Hiện chưa có gì sai với người dùng. Nếu sau này đổi chữ trạng thái ở một nơi mà quên nơi kia, tín hiệu vừa gửi trong phiên có thể hiện chữ khác với tín hiệu tải lại từ máy chủ.
  file: `apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx`
  severity: low
  Đề xuất: wont-fix

- **Pull-in script treats a broken tin_hieu block as "no placements" and inflates the not-yet-placed count**
  Người dùng thấy gì: Nếu phần tín hiệu trong bản vẽ lộ trình bị hỏng, con số «chưa có chỗ sau gom» chủ kho đọc được sẽ phình to như thể mọi tín hiệu cũ đều chưa được xử lý, mà không có cảnh báo nào.
  file: `scripts/tin-hieu/keo-ve.ts`
  severity: low
  Đề xuất: known-limits

- **Xoá tín hiệu thất bại bị nuốt im lặng — người dùng không thấy lỗi nào**
  Người dùng thấy gì: Nếu người dùng bấm Xoá đúng lúc đội sản phẩm vừa lấy tín hiệu về, hoặc mạng đứt, hộp hỏi đóng lại và tín hiệu vẫn còn đó mà không có lời giải thích nào.
  file: `apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx`
  severity: medium
  Đề xuất: known-limits

- **Lệnh kéo về: lỗi mạng hoặc phản hồi sai vỏ thoát mã 1, trùng với mã «tệp đã có mà khác byte»**
  Người dùng thấy gì: Khi máy chủ CRM không trả lời được lúc chủ kho chạy lệnh kéo tín hiệu về, lệnh báo lỗi theo cách giống hệt lỗi «tệp đã có mà nội dung khác», dễ làm chủ kho tìm sai nguyên nhân.
  file: `scripts/tin-hieu/keo-ve.ts`
  severity: low
  Đề xuất: known-limits

- **Tổng kết kéo về coi LO-TRINH.html hỏng như «chưa tín hiệu nào có chỗ», không cảnh báo**
  Người dùng thấy gì: Khi bản vẽ lộ trình không đọc được, dòng tổng kết vẫn in một con số «chưa có chỗ» trông như tồn đọng thật, và chủ kho không có dấu hiệu nào cho biết bản vẽ đã hỏng.
  file: `scripts/tin-hieu/keo-ve.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 + 2: ô «tệp không mang danh tính» ở vong-kit không bao giờ có danh tính để rò**
  Người dùng thấy gì: Phép kiểm dùng để bảo đảm tên, thư người gửi không lọt vào kho git có thể vẫn xanh ngay cả khi sau này một thay đổi làm lộ thông tin cá nhân của người gửi.
  file: `_acceptance/gui-tin-hieu-trong-crm/rang/vong-kit.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5: E10 khai ma trận hang-* × mọi nhom_trang_thai nhưng chỉ có 3 trong 8 ô**
  Người dùng thấy gì: Chỉ một phần các tổ hợp nhãn trạng thái được kiểm tự động, nên một nhãn sai ở tổ hợp chưa kiểm có thể tới tay người gửi mà không ai phát hiện.
  file: `apps/app/test/tin-hieu-trang-thai.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3: kiểu nút thao tác dòng ghim chữ «ghost»/«icon-xs», không so với nút của danh sách onboarding**
  Người dùng thấy gì: Nếu nút ⋮ của các danh sách khác đổi kiểu, nút ⋮ trên danh sách tín hiệu có thể lệch hẳn mà không có phép kiểm nào báo.
  file: `apps/app/test/tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: nút trên thanh đầu trang so với «outline» viết tay; vòng so với cụm lọc sẵn outline nên không đo được quan hệ**
  Người dùng thấy gì: Nút «Gửi tín hiệu» có thể lệch kiểu so với các nút cùng hàng nếu cả cụm đổi kiểu, mà bài kiểm vẫn không phản ứng đúng chỗ.
  file: `apps/app/test/tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: «tin hiệu bị xoá không thành tệp» chỉ có một assert âm, không đối chứng dương**
  Người dùng thấy gì: Phép kiểm «tín hiệu đã xoá không thành tệp» vẫn xanh kể cả khi lượt kéo về hỏng hoàn toàn và không ghi tệp nào, nên có thể bỏ sót việc mất tín hiệu.
  file: `scripts/tin-hieu/test/keo-ve.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: màn của tin hiệu «/okr?q=1#x» chỉ được kiểm âm (không có ?/#), không đối chứng giá trị đã làm sạch**
  Người dùng thấy gì: Phép kiểm chưa bảo đảm màn đang đứng được ghi đúng khi gửi tín hiệu; một lỗi làm mất hay cắt sai tên màn có thể lọt qua.
  file: `apps/api/test/tin-hieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: «keoVe sau khi xoá không có id đó» chỉ có assert âm trên phản hồi chưa được đối chứng**
  Người dùng thấy gì: Phép kiểm «tín hiệu đã xoá không bị kéo về» có thể xanh giả nếu lượt kéo về trả về danh sách rỗng do lỗi khác.
  file: `apps/api/test/tin-hieu.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5: E15 khai quét từng tệp .tsx của trang nhưng lệnh chỉ quét page.tsx**
  Người dùng thấy gì: Một số phần giao diện của trang «Tín hiệu đã gửi» (khung chờ tải, nút gửi, danh sách) không được máy soát lỗi kiểu dáng, nên một chỗ đổi màu sai ở đó có thể lọt qua.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: E1 khai ma trận 3 vai × 2 khổ = 6 ô nhưng test không có ô mobile nào**
  Người dùng thấy gì: Nút «Gửi tín hiệu» ở khổ điện thoại (chỉ biểu tượng có tên đọc được) chưa được kiểm tự động riêng, nên có thể hỏng trên điện thoại mà không ai biết.
  file: `apps/app/test/tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1: «làm mới danh sách» đo việc tạo khoá truy vấn, không đo việc làm mới; «đúng một lần» không được ghim**
  Người dùng thấy gì: Phép kiểm chưa chứng minh danh sách tự làm mới sau khi gửi hay xoá; nếu hỏng, người dùng có thể phải tải lại trang mới thấy thay đổi.
  file: `apps/app/test/tin-hieu.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
