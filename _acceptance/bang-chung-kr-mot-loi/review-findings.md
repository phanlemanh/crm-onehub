# Review findings: bang-chung-kr-mot-loi

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Dòng nhập bằng chứng nuốt lỗi máy chủ, thay mọi lỗi bằng câu «thử lại sau» kể cả lỗi thử lại cũng không qua**
  Người dùng thấy gì: Khi đính bằng chứng bị từ chối vì lý do cụ thể (KR vừa bị đưa về chưa xong, mục tiêu vừa chuyển sang chờ duyệt), người dùng chỉ thấy câu «Thử lại sau một lát» dù thử bao nhiêu lần cũng không qua, và không biết vì sao.
  Căn cứ: Người dùng bị dẫn đi thử lại vô ích nhưng không mất dữ liệu (giá trị đã gõ còn nguyên) và tải lại ngăn là biết trạng thái mới; hợp đồng đang ký đúng câu chung nên đổi cần một hợp đồng riêng.
  file: `apps/app/components/crm/record-sheet/dong-dinh-bang-chung.tsx`
  severity: medium
  Đề xuất: new-contract

- **aria-invalid không bật khi lỗi đính (loiThem) dù ô hiện FieldError và data-invalid**
  Người dùng thấy gì: Người dùng đọc màn hình không được báo là ô đường dẫn đang lỗi khi máy chủ từ chối, và viền ô không chuyển sang kiểu lỗi, dù câu lỗi vẫn hiện bên dưới.
  Căn cứ: Chỉ ảnh hưởng nhẹ đến một nhóm nhỏ người dùng, câu lỗi vẫn có mặt và không mất dữ liệu; sửa rẻ nhưng nằm ngoài những gì đã hứa.
  file: `apps/app/components/crm/record-sheet/o-duong-dan-bang-chung.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ô E12 «cap-nhat-moc-esc-dong-khoi» không làm gì có thể gửi, nên [] chắc chắn đúng**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay; nếu sau này bấm Esc ở khối cập nhật làm mất hay gửi nhầm bản nháp thì bài kiểm này sẽ không báo.
  Căn cứ: Là lỗ hổng trong lưới kiểm, không phải lỗi người dùng đang gặp; hậu quả chỉ xảy ra nếu có hồi quy về sau và người dùng có thể gõ lại bản nháp.
  file: `apps/app/test/bang-chung-mot-loi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ô E12 «dong-nhap-esc» và «dong-nhap-huy» bỏ kết quả kiểm của huyDongNhap, chỉ ghim 0 lời gọi**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay; nếu sau này Esc hoặc Huỷ không đóng được dòng nhập thì một ô trong ma trận kiểm vẫn xanh.
  Căn cứ: Việc đóng dòng nhập vẫn được kiểm ở bài khác nên nguy cơ lọt hồi quy thấp; người dùng chỉ thấy dòng nhập chưa đóng và tự đóng lại được.
  file: `apps/app/test/bang-chung-mot-loi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): điều kiện «khoi rong con» ở E1 mo-dong-nhap-rong không bao giờ đỏ được**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay; nếu khối rỗng vẫn hiện cùng lúc với dòng nhập khi KR chưa có bằng chứng thì bài kiểm sẽ không phát hiện.
  Căn cứ: Chỉ là một lỗ trong lưới kiểm, nhìn lại màn là thấy ngay và không mất dữ liệu; sửa bài kiểm rẻ nhưng không phải việc của hợp đồng này.
  file: `apps/app/test/bang-chung-mot-loi.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
