# Review findings: sua-sau-chay-that (round 1)

## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E13 chỉ chặn lùi và đếm lỗi model ở lượt 1, chiều đỏ cũng chỉ đột biến lượt 1**
  AC: AC-13
  file: `_acceptance/sua-sau-chay-that/rang/so-bo-mau.ts:158`
  severity: medium
  source: measurement
  detail: Theo eval E13, script phải in mọi mã câu đạt ở lượt đã ký mà không đạt ở lượt này, và chỉ exit 0 khi danh sách lùi rỗng và số câu lỗi model không vượt lượt đã ký. Eval không giới hạn theo lượt. Code thì đặt SO.luotChan = 1 (dòng 34). Câu lùi ở lượt 2 được tách vào luiKhac (dòng 151) và in với nhãn «khong chan» (dòng 155). Điều kiện exit 1 chỉ xét luiChan và qua (dòng 158). loiCua chỉ đếm c.luot === SO.luotChan. Bốn chiều đỏ đều chỉ đổi câu ở lượt 1 (doiN, laDatMot ở dòng 200 lọc d.luot === 1), nên không có ô nào chứng minh lùi hay lỗi model ở lượt 2 bị bắt. Hệ quả: một câu đạt ở lượt 2 của bản ký mà nay sai, hay lỗi model lượt 2 vượt trần, vẫn ra exit 0. Ma trận đỏ không phủ chiều lượt mà lời hứa quét. Lần chạy nguyên văn hôm nay ra kết quả xanh, dòng «lui luot khac (khong chan): (khong co)», nên hiện chưa có câu nào bị giấu, nhưng thước không phân biệt được trường hợp đó.
  rationale: AC-13 đòi mỗi ô không có câu đạt nào thành không đạt và tách câu lỗi model như lượt đã ký, không giới hạn theo lượt; thước chỉ chặn lượt 1 nên không bảo đảm được điều AC hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng MIME loại tệp nguồn giờ có hai bản: validation mới và BLOB_NGUON phía máy chủ**
  Người dùng thấy gì: Hiện chưa có lỗi nào thấy được khi tải nguồn Word hay PDF. Nhưng nếu sau này ai đó sửa loại tệp ở một nơi mà quên nơi kia thì việc tải nguồn có thể bị từ chối mà không rõ vì sao.
  file: `packages/validation/src/tai-lieu-nguon.ts`
  severity: medium
  Đề xuất: known-limits

- **Luật liên kết an toàn chỉ nằm trong packages/ui; API và agent không có nó ở biên**
  Người dùng thấy gì: Liên kết http do trợ lý soạn hoặc gửi thẳng qua API vẫn lưu được, rồi lúc đọc thì liên kết biến mất mà không có thông báo. Người gõ tay trong trình soạn thì đã được báo.
  file: `packages/ui/src/lib/lien-ket-an-toan.ts`
  severity: medium
  Đề xuất: known-limits

- **Link popover rejects a bare host:port (e.g. a.vn:8080) as a non-https link instead of adding https://**
  Người dùng thấy gì: Khi dán một địa chỉ trần có số cổng như a.vn:8080 vào ô liên kết, trình soạn báo nhầm là chỉ nhận https dù địa chỉ đó hợp lệ. Người viết phải gõ thêm https:// thì mới lưu được.
  file: `packages/ui/src/components/trinh-soan-thanh-cong-cu.tsx`
  severity: low
  Đề xuất: known-limits

- **«Soạn lại» is still offered for a source whose target page is archived, so every retry calls the model and fails again**
  Người dùng thấy gì: Với nguồn mà trang đích đã lưu trữ, nút Soạn lại vẫn bấm được. Mỗi lần bấm tốn một lượt gọi trợ lý rồi lại báo lỗi như cũ.
  file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E1b gieo nguồn DANG_SOAN và trang bằng db.create trực tiếp, không qua đường ghi thật**
  Người dùng thấy gì: Bài kiểm khẳng định trợ lý không tạo đề xuất cho trang đã lưu trữ dùng dữ liệu gieo tay. Nếu cách hệ thống tạo nguồn thật đổi đi thì bài kiểm vẫn xanh, và lỗi có thể lọt tới người dùng.
  file: `apps/agent/test/ssct-nop-luu-tru.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E14 bước 2 gieo markdown đã thoát &amp;/&lt; viết tay thay vì để trình soạn sinh ra**
  Người dùng thấy gì: Phép đo màn mục lục dùng nội dung viết tay chứ không lấy từ trình soạn. Nếu trình soạn đổi cách lưu ký tự đặc biệt, mục lục có thể hiện sai chữ mà phép đo vẫn báo đạt.
  file: `_acceptance/sua-sau-chay-that/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
