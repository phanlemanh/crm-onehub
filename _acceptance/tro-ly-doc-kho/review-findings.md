# Review findings: tro-ly-doc-kho (round 4)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **nop_tra_loi tool schema hardcodes caps that duplicate TAI_LIEU_HOI.trich**
  Người dùng thấy gì: Giới hạn số câu và độ dài đoạn trích của trợ lý đang ghi ở hai chỗ. Nếu sau này ai đó đổi một chỗ mà quên chỗ kia, trợ lý sẽ bị từ chối với thông báo chung chung thay vì lời giải thích rõ; hôm nay mọi thứ vẫn chạy đúng.
  file: `apps/agent/agent/subagents/tro_ly_kho/tools/nop_tra_loi.ts`
  severity: medium
  Đề xuất: wont-fix

- **Ask tab shows Vietnamese-only sentences in English, skipping taiLieuMessages(locale)**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh vẫn thấy câu từ chối, câu báo lỗi và cảnh báo trang quá hạn bằng tiếng Việt, xen giữa các nhãn tiếng Anh. Nội dung vẫn đúng, chỉ lệch ngôn ngữ.
  file: `apps/app/app/(app)/[slug]/tai-lieu/hoi-tra-loi.tsx`
  severity: medium
  Đề xuất: known-limits

- **HE_SO_NFD declared a second time instead of reusing the area config**
  Người dùng thấy gì: Một hệ số giới hạn độ dài câu hỏi được khai hai lần. Nếu ai đó đổi một nơi, giới hạn câu hỏi và ghi chú có thể lệch giới hạn chung của Kho tài liệu; hôm nay hai giá trị đang bằng nhau.
  file: `apps/api/src/tai-lieu/tai-lieu-hoi.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **tro_ly_kho is offered to every root session but always fails outside a kho/Zalo question**
  Người dùng thấy gì: Khi nhân viên hỏi về quy định ngay trong khung chat riêng của CRM, trợ lý có thể thử chuyển sang trợ lý kho rồi thất bại sau vài giây, tốn chi phí mà không trả lời được. Hỏi quy định hiện chỉ chạy đúng ở tab Hỏi và ở Zalo.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: medium
  Đề xuất: new-contract

- **drainHoiKho drops the error from every failed send**
  Người dùng thấy gì: Khi trợ lý không gửi được câu hỏi đi, nhân viên chỉ thấy câu chung chung là chưa trả lời được lúc này. Người vận hành không có dấu vết nào cho biết vì sao, nên khó tìm nguyên nhân khi lỗi lặp lại.
  file: `apps/agent/agent/lib/tai-lieu-hoi-phien.ts`
  severity: low
  Đề xuất: known-limits

- **Close and spend hooks log only error.name and drop the message**
  Người dùng thấy gì: Nếu việc đóng câu hỏi hoặc ghi chi phí hỏng, nhật ký chỉ ghi tên lỗi chung chung nên khó biết lý do. Câu hỏi sẽ tự đóng là quá hạn sau ba phút, và chi phí có thể bị đếm thiếu mà không ai hay.
  file: `apps/agent/agent/hooks/dong-tro-ly-kho.ts`
  severity: low
  Đề xuất: known-limits

- **3-minute qua-han deadline starts at ask time, but the subagent's 3-minute timeout starts at send**
  Người dùng thấy gì: Nếu câu hỏi phải chờ hàng đợi một lúc, trợ lý còn ít hơn ba phút để trả lời. Hiếm khi một câu trả lời đúng đã soạn xong vẫn bị bỏ vì đã quá hạn, người hỏi nhận câu chưa trả lời được lúc này.
  file: `apps/agent/agent/lib/tai-lieu-hoi-phien.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» trong khi lời hứa E4(ii) là QUAN HỆ thứ tự ganNhat == 2 slug đầu của search_pages**
  Người dùng thấy gì: Phép kiểm cho danh sách trang gần nhất chỉ xác nhận có mặt trang đúng, không xác nhận đúng thứ tự tìm được. Nếu sau này thứ tự trang gợi ý bị đảo, phép kiểm vẫn báo xanh.
  file: `apps/agent/test/tro-ly-kho-nop.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm-tính một mình, không thể đỏ: kết quả gửi agent gốc không chứa NOIDUNG-TRANG-MOC**
  Người dùng thấy gì: Phép kiểm khẳng định trợ lý kho không trả nội dung trang về cho trợ lý chính thực ra không thể báo đỏ, vì dữ liệu vào của nó không bao giờ chứa nội dung đó. Việc không rò chữ trang hiện chỉ được bảo đảm một phần.
  file: `apps/agent/test/tro-ly-kho-ranh-gioi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — chỉ assert hàng có mặt, trong khi lời hứa E8 là quan hệ thứ tự (hàng có TRƯỚC lời gọi model đầu tiên và TRƯỚC search_pages)**
  Người dùng thấy gì: Phép kiểm chỉ xác nhận hàng nhật ký câu hỏi Zalo có được tạo, chứ không xác nhận nó được tạo trước khi trợ lý bắt đầu đọc kho. Nếu thứ tự bị đổi, câu hỏi Zalo có thể không được ghi đúng lúc mà phép kiểm không báo.
  file: `apps/agent/test/tro-ly-kho-zalo.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — trong E7u bước 2, «ý trả lời» và «đoạn trích» là cùng một chuỗi, nên assert có mặt không tách được hai giá trị**
  Người dùng thấy gì: Phép kiểm màn Hỏi không phân biệt được phần ý trả lời với phần đoạn trích vì dữ liệu giả cho hai phần giống hệt nhau. Nếu màn bỏ mất dòng ý trả lời, phép kiểm vẫn qua.
  file: `_acceptance/tro-ly-doc-kho/rang/man-hoi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — chiều đỏ của E15 thoát mã 1 bất kể slug có bị đổi hay không (mẫu số rỗng)**
  Người dùng thấy gì: Phép thử chứng minh script chấm bộ câu đo biết báo lỗi luôn báo lỗi với bất kỳ bộ ba câu nào, kể cả khi dữ liệu đúng. Nó không chứng minh được script thật sự phát hiện sai trang.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay theo khuôn của bên đọc, mang trường `goc` mà khuôn của bên ghi (taiLieuHoiKetQuaOutput) không có**
  Người dùng thấy gì: Một vế trong phép kiểm màn Hỏi đo một trường dữ liệu không bao giờ tới được trình duyệt. Hành vi thật của màn không bị ảnh hưởng, chỉ là phép kiểm có một chỗ thừa.
  file: `apps/app/test/tai-lieu-hoi.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 — khẳng định «log không mang chữ câu hỏi» bỏ trống với 9/10 chuỗi: chúng được gieo thẳng vào DB, không đi qua đường nào có log**
  Người dùng thấy gì: Lời hứa nhật ký không chứa chữ câu hỏi chỉ được thử thật trên một trong mười câu mẫu. Chưa thấy câu hỏi nào lọt vào nhật ký, nhưng phần lớn các đường khác chưa được kiểm.
  file: `apps/api/test/tai-lieu-hoi.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
