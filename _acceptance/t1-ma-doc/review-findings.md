# Review findings: t1-ma-doc (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ quét t1-ma-doc mù với tệp T1 dưới apps/ và packages/: chỉ dựa vào glob apps/** và packages/** trong config, mà không kiểm hai glob đó còn ở đó**
  Người dùng thấy gì: Nếu có người sau này gỡ hai dòng phủ thư mục ứng dụng và thư viện khỏi danh sách tệp nặng, một sửa đổi chỉ chạm tệp chữ mà ứng dụng đọc lúc chạy (như lời dặn của tác nhân) vẫn bị coi là nhẹ và bỏ kiểm thử, trong khi công cụ rà soát vẫn báo xanh. Hiện danh sách đang đủ nên chưa có ai bị ảnh hưởng.
  file: `.github/scripts/t1-ma-doc.mjs`
  severity: medium
  Đề xuất: known-limits

- **scriptRang lặng lẽ trả rỗng khi gate-shape.json vắng hoặc đổi hình, trái luật parse ở biên và trái lối docBoQua có sẵn**
  Người dùng thấy gì: Nếu tệp khai hình dạng cổng bị mất hoặc đổi cấu trúc, công cụ rà soát im lặng bỏ qua các bài kiểm của hồ sơ thay vì báo lỗi. Trên cây thật hiện tại một ca khác sẽ đỏ nên vẫn phát hiện được, chỉ là báo lỗi không rõ nguyên nhân.
  file: `.github/scripts/t1-ma-doc.mjs`
  severity: low
  Đề xuất: known-limits

- **Bộ quét t1-ma-doc bỏ sót tệp T1 ở gốc kho khi được đọc qua đường tương đối hoặc template `${X}/TEN`**
  Người dùng thấy gì: Một bài kiểm mới đọc các tệp hướng dẫn ở gốc kho (như AGENTS.md) bằng đường dẫn tương đối có thể không được công cụ rà soát nhận ra. Khi đó sửa riêng tệp hướng dẫn ấy vẫn bị coi là nhẹ và bỏ kiểm thử, dù bài kiểm kia phụ thuộc vào nó.
  file: `.github/scripts/t1-ma-doc.mjs`
  severity: medium
  Đề xuất: known-limits

- **LOI_GOI_DOC không tính `require(` và `import ... from` tĩnh, nên tệp T1 được nạp như module không bị phát hiện**
  Người dùng thấy gì: Nếu một bài kiểm nạp tệp tài liệu hay dữ liệu bằng cách nhập trực tiếp như một module, công cụ rà soát không thấy mối phụ thuộc đó. Sửa riêng tệp ấy sẽ bị coi là nhẹ và bỏ kiểm thử. Hiện chưa có chỗ nào trong kho dùng cách này.
  file: `.github/scripts/t1-ma-doc.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): quet-do 8, 9 và 11 chỉ assert `dich.has(x) === false`, không có đối chứng dương trong cùng kho**
  Người dùng thấy gì: Ba bài kiểm của công cụ rà soát chỉ xác nhận một tệp không bị tính là phụ thuộc, nên nếu công cụ hỏng và không thấy gì cả thì ba bài kiểm này vẫn xanh. Các bài kiểm khác vẫn bắt được trường hợp hỏng nặng đó.
  file: `packages/ui/test/t1-ma-doc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng không có vế dương): quet-do 6 'đối chứng' chỉ assert sạch, không assert bộ quét thấy bên đọc**
  Người dùng thấy gì: Một bài kiểm đối chứng chỉ xác nhận kết quả sạch sau khi khai đủ, chứ không xác nhận công cụ có thấy mối phụ thuộc trước đó. Điều này chỉ làm bài kiểm kém chặt hơn, người dùng không thấy hậu quả.
  file: `packages/ui/test/t1-ma-doc.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (assert «chuỗi có mặt» cho lời hứa là quan hệ): khai.mjs (a)/(d) chỉ kiểm vi_sao và CLAUDE.md có chứa tên khoá**
  Người dùng thấy gì: Phép kiểm tự động chỉ xem lời giải thích trong tài liệu có nhắc đúng tên khoá, chứ không xem câu có nói đúng điều kiện hay không. Việc đọc hiểu nghĩa do người duyệt đảm nhận, nên rủi ro là một câu viết ngược nghĩa lọt qua máy.
  file: `_acceptance/t1-ma-doc/rang/khai.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
