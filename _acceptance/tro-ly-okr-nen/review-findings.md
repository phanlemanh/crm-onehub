## Trong hợp đồng

- **Hình dạng 5 — Tuyên quét lớp nhưng ma trận kỳ vọng không viết trước: kỳ vọng sinh bằng hàm chép lại logic của sản phẩm**
  file: `packages/validation/test/ai-chi-phi.spec.ts:29`
  severity: medium
  AC: AC-1
  `kyVong` (dòng 29-41) chép lại `tinhNangCua` (packages/db/src/ai-chi-phi-danh-muc.ts:76-90) từng nhánh một: phiên con trước, rồi kênh eve, rồi zalo, rồi tra bảng purpose. Ma trận vì thế không phải bảng viết trước mỗi ô một kỳ vọng như E1 đòi, và cũng không có bảng NGOAI khai tổ hợp vô nghĩa. Assert số ô `o.length === SESSION_PURPOSES.length * KENH_TAC_TU.length * PHIEN_CON.length` (dòng 68-70) là hằng đúng, vì `o` do chính ba vòng lặp đó sinh ra. Một quy tắc sai có mặt ở cả hai nơi (ví dụ kênh eve với purpose okr ra `crm.hoi-dap`) sẽ không bị bắt. Chiều đỏ «thu-nghiem» (dòng 78-82) cũng chỉ làm hàm kỳ vọng của bài ném lỗi, không chạm tới hàm của sản phẩm.
  Rationale: AC-1 đòi văn bản rõ ràng 'mỗi tổ hợp một kỳ vọng viết trước'; bài kiểm sinh kỳ vọng bằng cách chép lại chính logic sản phẩm, không phải bảng viết trước độc lập — trực tiếp trái điều khoản này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mốc báo trần 80/100 bị chép ở bốn chỗ; màn tự suy lại mốc và lệch với máy nhắc**
  Người dùng thấy gì: Số phần trăm hiển thị trên thẻ ngân sách có thể không khớp với tin nhắn nhắc gửi cho quản trị, ví dụ khi trần đặt bằng 0 hoặc chi tiêu vừa vượt 80%.
  file: `apps/app/app/(app)/[slug]/settings/okr/the-so-chi-phi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Sổ chi phí nuốt lỗi phân tích: bước đọc không được coi như bước không tốn tiền**
  Người dùng thấy gì: Khi có dữ liệu bất thường từ hệ thống AI, một số chi phí có thể không được ghi vào sổ mà không có cảnh báo, khiến số tiền hiển thị thấp hơn thực tế.
  file: `apps/agent/agent/lib/so-chi-phi.ts`
  severity: medium
  Đề xuất: known-limits

- **Năng lực «AI model» khai hai lần: tác nhân chặn việc qua hàm riêng thay vì `enabled(id)`**
  Người dùng thấy gì: Nếu sau này bật hay tắt khả năng dùng AI ở một chỗ mà quên chỗ còn lại, quản trị có thể thấy hai thông tin trái ngược nhau về việc AI có sẵn sàng hay không.
  file: `apps/agent/agent/lib/okr/viec.ts`
  severity: low
  Đề xuất: known-limits

- **Hằng chỉnh được của đối soát và lease nằm cạnh chỗ dùng, viết số đơn vị thô**
  Người dùng thấy gì: Các con số thời gian chờ và lịch chạy nằm rải rác trong mã, nên người muốn chỉnh sau này khó tìm đúng chỗ và dễ sửa sót.
  file: `apps/agent/agent/lib/ai-doi-soat.ts`
  severity: low
  Đề xuất: known-limits

- **Thẻ Trợ lý OKR viết lại bộ đọc trần thay vì dùng `docTranUsd` dùng chung**
  Người dùng thấy gì: Có hai cách đọc trần chi tiêu USD người nhập cùng tồn tại; nếu một bên được sửa mà quên bên kia, ô nhập trần có thể chấp nhận hoặc từ chối sai giá trị người gõ.
  file: `apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx`
  severity: low
  Đề xuất: known-limits

- **`LY_DO_VIEC_OKR` khai lý do cho năm loại việc nhưng hai chỗ xếp việc tự gõ lại chuỗi**
  Người dùng thấy gì: Lý do xếp việc AI được viết lặp ở nhiều nơi trong mã; sửa ở một chỗ mà quên chỗ khác có thể khiến nhật ký vận hành ghi lý do không nhất quán.
  file: `apps/api/src/agent/agent-trigger.service.ts`
  severity: low
  Đề xuất: known-limits

- **Lease 30 s của việc Trợ lý OKR không được gia hạn trong lúc subagent tro_ly_okr chạy, nên việc bị đóng «hong:het-lease» giữa chừng và các đề xuất bị mất**
  Người dùng thấy gì: Một đề xuất AI đang được soạn có thể bị huỷ giữa chừng và mất trắng nếu bước xử lý mất hơn khoảng 30 đến 90 giây, dù việc soạn vẫn đang diễn ra bình thường.
  file: `apps/agent/agent/hooks/okr-uy-quyen.ts`
  severity: high
  Đề xuất: known-limits

- **Kết quả kiểm «chua-co-khoa-mo-hinh» cũ chặn mọi việc Trợ lý OKR kể cả khi khoá đã được cắm**
  Người dùng thấy gì: Nếu quản trị bật Trợ lý OKR trước khi cắm khoá kết nối AI, tính năng có thể vẫn báo chưa sẵn sàng cho tới khi tắt rồi bật lại, dù khoá đã được cắm đúng sau đó.
  file: `packages/db/src/okr-tro-ly.ts`
  severity: medium
  Đề xuất: known-limits

- **chayDoiSoat: khối try bọc cả phần ghi DB, nên lỗi DB bị ghi thành lỗi Gateway và đè lên kết quả đối soát đã ghi đúng**
  Người dùng thấy gì: Khi có trục trặc kỹ thuật nhất thời ngay sau khi đối chiếu chi tiêu AI với nhà cung cấp đã tính đúng, hệ thống có thể ghi đè kết quả đúng bằng một thông báo lỗi sai, khiến báo cáo trông như bị lỗi dù thực ra đã khớp.
  file: `apps/agent/agent/lib/ai-doi-soat.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi gửi phiên của việc Trợ lý OKR bị bỏ qua; việc chỉ đóng sau khi hết lease với lý do sai là het-lease**
  Người dùng thấy gì: Khi một việc AI không gửi được do lỗi kỹ thuật, hệ thống có thể báo lý do chung chung là hết thời gian chờ thay vì lý do thật, gây khó khăn khi cần chẩn đoán sự cố.
  file: `apps/agent/agent/lib/dispatch.ts`
  severity: medium
  Đề xuất: known-limits

- **nop_de_xuat kiểm-rồi-ghi không khoá, nên cùng một việc có thể nhận hai lần nộp**
  Người dùng thấy gì: Trong một số tình huống hiếm, một đề xuất AI có thể được ghi nhận hai lần thay vì một.
  file: `apps/agent/agent/subagents/tro_ly_okr/tools/nop_de_xuat.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: báo cáo Gateway giả khớp đúng schema của bộ đọc, bộ đọc thật chưa từng gặp phản hồi thật**
  Người dùng thấy gì: Phép đo tự động đối soát chi tiêu AI với nhà cung cấp chưa từng được thử với dữ liệu phản hồi thật, nên chưa chắc hoạt động đúng khi triển khai thật.
  file: `apps/agent/test/ai-doi-soat.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: «hàng cấu hình cũ» đã chứa sẵn các trường AI với đúng giá trị mặc định**
  Người dùng thấy gì: Chưa có bằng chứng độc lập rằng một chương trình OKR cũ, sau khi nâng cấp, thực sự hiện đúng các giá trị mặc định đã hứa.
  file: `packages/validation/test/okr-tro-ly.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: ngữ cảnh ghi lại từ eve bị đè đúng những trường mà hook dùng để suy việc**
  Người dùng thấy gì: Chưa có bằng chứng độc lập rằng việc phân loại đúng loại chi phí AI hoạt động đúng với dữ liệu ngữ cảnh thật, chỉ mới đúng với dữ liệu bài kiểm tự dựng.
  file: `apps/agent/test/so-chi-phi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: trạng thái đã nhận việc được ghi tay thay vì để claimDue tạo**
  Người dùng thấy gì: Chưa có bằng chứng độc lập rằng một việc AI thật sự sống đúng khoảng thời gian quy định và không bị nhận nhầm lần hai.
  file: `apps/agent/test/tro-ly-okr-viec.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: cấu hình AI được chèn thẳng vào bảng với version âm và createdAt lùi, bỏ qua okr.setProgram**
  Người dùng thấy gì: Dữ liệu cấu hình AI dùng để kiểm thử được tạo khác cách admin thật lưu cấu hình, nên bài kiểm có thể bỏ sót một số lỗi thật khi hai đường ghi và đọc lệch nhau.
  file: `apps/agent/test/support/tro-ly-gieo.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Đo chuỗi có mặt trong khi lời hứa là quan hệ: vế Gateway của phép đối soát được chọn theo chính luồng sự kiện ghi ra sổ**
  Người dùng thấy gì: Phép đo lệch chi tiêu giữa sổ nội bộ và nhà cung cấp AI có thể bỏ sót đúng loại lỗi nghiêm trọng nhất, khi một lượt gọi bị thiếu ở cả hai vế cùng lúc.
  file: `_acceptance/tro-ly-okr-nen/rang/doi-soat-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: đếm 0 ở lượt okr là nhờ tool thay thế, còn đối chứng chỉ-có-hook thì chỉ in ra**
  Người dùng thấy gì: Phép đo rằng hệ thống chặn AI truy cập ngoài phạm vi có thể báo đạt dù cơ chế chặn thật không hoạt động, vì bài kiểm dùng công cụ giả tạo ra cùng kết quả.
  file: `_acceptance/tro-ly-okr-nen/rang/hook-chan-truoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: tập tool của phiên con được kiểm «không có gì ngoài tập», còn đối chứng đỏ chạy trên danh sách gõ tay**
  Người dùng thấy gì: Phép đo rằng tác nhân AI phụ chỉ dùng đúng công cụ được phép có thể báo đạt một cách giả tạo nếu hệ thống không đọc được danh sách công cụ đã dùng.
  file: `apps/agent/evals/okr/cach-ly.eval.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: «thành viên không thấy khối AI» xanh cả khi trang không tải**
  Người dùng thấy gì: Phép đo rằng thành viên thường không thấy khối cài đặt AI có thể báo đạt ngay cả khi trang bị lỗi hoặc chuyển hướng, không thật sự chứng minh việc ẩn đúng theo quyền.
  file: `_acceptance/tro-ly-okr-nen/rang/man-cai-dat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên đi cây khuôn nhưng chỉ soi thuộc tính cấp gốc có type trực tiếp**
  Người dùng thấy gì: Phép đo rằng kết quả AI trả về gốc chỉ chứa mã, không chữ tự do, hiện chưa quét hết các trường lồng bên trong, dù hiện tại chưa có rò rỉ chữ tự do nào xảy ra.
  file: `apps/agent/test/okr-chuyen-tiep.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — Đo chỉ dẫn thay vì đầu ra: deny-all được kiểm bằng cách đếm chuỗi trong mã nguồn**
  Người dùng thấy gì: Phép đo rằng khu vực chạy AI bị khoá mạng hoàn toàn chỉ đếm chữ trong mã nguồn thay vì kiểm tra chính sách mạng thật, nên một thay đổi làm hở chính sách mạng sau này có thể không bị phát hiện.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/23 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/agent/agent-trigger.service.ts, apps/agent/test/support/tro-ly-gieo.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.