## Trong hợp đồng

Findings: (không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chup.mjs takes the E9 evidence screenshots even when the table never loads, and never checks which tree it is measuring**
  Người dùng thấy gì: Ảnh minh chứng của mục E9 có thể thực ra chụp một trang trống, một trang bị chuyển hướng, hoặc máy chủ của một bản build khác — nhưng vẫn được lưu và trình như thể là bằng chứng đúng.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **The gate command never sets DUOI_CONG, so the CHI_MAN guard in tieu-de-cot.mjs never fires and a stray CHI_MAN makes a partial matrix pass with exit 0**
  Người dùng thấy gì: Nếu biến môi trường CHI_MAN vô tình còn sót lại từ một lượt đo trước, phép đo có thể chỉ kiểm một phần nhỏ của bảng mà vẫn báo hoàn thành, khiến người ký tưởng đã kiểm đủ cả 50 ô.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **chup.mjs swallows the table-load timeout and never checks for a redirect, so E9 screenshots can silently show the wrong screen**
  Người dùng thấy gì: Ảnh minh chứng của mục E9 có thể thực ra chụp một trang trống, một trang còn đang tải, hoặc trang bị chuyển hướng — nhưng vẫn được lưu và trình như thể là bằng chứng đúng.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ, assert chỉ đo một trục): khoảng cách mũi tên–chữ của AC-3 chỉ tính theo trục ngang**
  Người dùng thấy gì: Nếu mũi tên sắp xếp bị đẩy xuống dòng dưới trong khi chữ tiêu đề đã đầy dòng trên, phép đo tự động vẫn có thể báo đạt dù người dùng thật nhìn thấy mũi tên nằm tách rời, xa nhãn cột.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bài kiểm AC-7 của bo-dung-chung-nhan-chuoi chỉ grep tên lớp line-clamp-2 trong markup SSR**
  Người dùng thấy gì: Bài kiểm của một tính năng khác chỉ soi xem đúng tên lớp CSS có xuất hiện hay không, nên nếu sau này ai đó vô tình làm hỏng việc cắt chữ dài kèm dấu ba chấm ở tính năng đó, bài kiểm vẫn có thể báo đạt như thường.
  file: `packages/ui/test/data-table-locale.spec.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (không ghim thông điệp): sáu eval E1/E2/E3/E7/E8/E9 của bo-dung-chung-nhan-chuoi cùng đo mã thoát của cả bộ test @crm/ui**
  Người dùng thấy gì: Sáu tiêu chí khác nhau của một tính năng khác đều dùng chung kết quả toàn bộ bộ kiểm thử, nên nếu bài kiểm riêng của một tiêu chí bị xoá hay viết lỏng đi, các tiêu chí còn lại vẫn báo đạt bình thường.
  file: `_acceptance/bo-dung-chung-nhan-chuoi/evals.yaml`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (tuyên ma trận toàn phần nhưng để lọt ma trận một phần hoặc rỗng): CHI_MAN không có DUOI_CONG thì thoát 0**
  Người dùng thấy gì: Nếu ai đó gõ sai tên màn cho biến CHI_MAN, lượt đo có thể không kiểm ô nào cả mà vẫn báo hoàn thành thành công.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (số assert khác số phần tử khai): E5 khai «Dem AC-5 = 12» nhưng thước không có khẳng định nào của AC-5**
  Người dùng thấy gì: Nếu sau này một trong ba chỉnh ưu tiên cột của AC-5 bị bỏ sót khỏi danh sách cột mong đợi, phép đo có thể không phát hiện ra vì không có phép đếm riêng khớp với con số 12 đã khai.
  file: `_acceptance/tieu-de-cot-doc-tron/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo checkout khác thay vì cây đang kiểm): chup.mjs của E9 không gọi canhCay, không kiểm đường dẫn cuối, nuốt lỗi chờ bảng**
  Người dùng thấy gì: Ảnh minh chứng của mục E9 có thể thực ra lấy từ máy chủ của một bản build khác, hoặc từ một trang bị lỗi/chuyển hướng, mà vẫn được trình như bằng chứng hợp lệ.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs, _acceptance/config.yaml, packages/ui/test/data-table-locale.spec.tsx, _acceptance/bo-dung-chung-nhan-chuoi/evals.yaml, _acceptance/tieu-de-cot-doc-tron/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
