# Review findings: hoi-dap-okr (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **loiDanHoi widens the parsed role to string | null and re-implements laVaiChiOkr**
  Người dùng thấy gì: Khi hệ thống không xác định được vai của người hỏi, Kara OKR có thể gợi ý họ sang Kara của CRM để hỏi về đối tác, dù đó là người chỉ dùng OKR. Gợi ý này không để lộ dữ liệu đối tác, vì Kara của CRM vẫn tự kiểm quyền.
  file: `apps/agent-okr/agent/lib/loi-dan-hoi.ts`
  severity: low
  Đề xuất: known-limits

- **Bước «ngày mới» của bài trần lượt vẫn chạy ở tháng 10/2026, nằm ngoài phần tháng đã tách riêng cho bài api**
  Người dùng thấy gì: Một bài kiểm tự động có thể báo đỏ nhầm nếu lần chạy trước bị ngắt giữa chừng và để lại dữ liệu thừa trong kho test dùng chung. Người dùng không thấy ảnh hưởng gì, và chạy lại cho sạch kho thì hết.
  file: `apps/api/test/okr-hoi-luot.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **The test hand-writes a looser DichVuHoi type instead of using the HoiTangLuotOutput already exported by @crm/validation (r2 · tệp đã đổi)**
  Người dùng thấy gì: Một bài kiểm tự khai kiểu dữ liệu lỏng hơn kiểu thật, nên nếu sau này đổi mã lý do hết lượt thì bài kiểm không báo. Người dùng không thấy gì khác đi.
  file: `apps/app/test/cua-okr-hoi.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **The hook context types (BuocChiPhi, NguCanhChiPhi) are copied into two tests and loaded by a variable path, so tsc does not check them against eve's defineHook (r2 · tệp đã đổi)**
  Người dùng thấy gì: Hai bài kiểm chép chung một khai báo kiểu cho phần ghi chi phí, nên khi thư viện đổi thì chúng có thể lệch âm thầm. Chức năng ghi chi phí cho người dùng không bị ảnh hưởng.
  file: `apps/api/test/okr-hoi-luot.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **zdr-hoi: hai bài mới chỉ đỏ hay xanh tuỳ máy có khoá AI Gateway hay không; CI không có khoá nên sẽ đỏ, còn lỗi thật thì bị .catch nuốt mất (r2)**
  Người dùng thấy gì: Hai bài kiểm về việc mọi câu hỏi đi qua kênh bảo mật dữ liệu sẽ báo đỏ trên máy chủ kiểm tự động vì máy đó không có khoá, dù tính năng không hỏng. Có thể làm kiểm tra tự động chặn gộp nhầm hoặc che mất lỗi thật.
  file: `apps/agent-okr/test/zdr-hoi.spec.ts`
  severity: high
  Đề xuất: known-limits

- **cua-okr-hoi.spec nay dùng HoiService thật trên trần chi phí tháng chung cả kho; chạy song song với okr-hoi-luot.spec của api trong cùng một CSDL thì hai bên giẫm nhau (r2 · tệp đã đổi)**
  Người dùng thấy gì: Khi chạy toàn bộ bài kiểm cùng lúc trên một máy, hai nhóm bài kiểm về giới hạn chi phí có thể làm hỏng kết quả của nhau và báo đỏ ngẫu nhiên. Tính năng cho người dùng không bị ảnh hưởng.
  file: `apps/app/test/cua-okr-hoi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Khẳng định âm-tính-một-mình: phần thẻ trích của hdo-chu không có đối chứng dương, xanh cả khi thẻ không mở hay không chứa tên (r2)**
  Người dùng thấy gì: Bài kiểm xác nhận tên Mục tiêu và KR trong thẻ trích không bị tự dịch có thể báo xanh dù thẻ không mở ra. Nếu sau này có lỗi, tên người nhập có thể bị trình duyệt dịch mà không ai hay.
  file: `apps/app/test/okr-hoi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Kiểm «chuỗi có mặt» thay cho quan hệ «mọi lời gọi đi qua»: rào lenhDoGoiModel của E12 chỉ đòi có chữ taoModelPhieu( trong tệp (r2)**
  Người dùng thấy gì: Bài kiểm canh việc mọi lệnh đo đều gọi model qua kênh bảo mật có thể bỏ sót một lần sửa sau này gọi model theo đường khác. Hiện tại mã vẫn đúng.
  file: `apps/agent-okr/test/zdr-hoi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **tim_okr đọc chu kỳ không theo id mà thiếu KY_CON_HIEN: chu kỳ đã ẩn vẫn có thể thành «quý hiện tại» mặc định (r1)**
  Người dùng thấy gì: Khi một quý đã bị ẩn trên màn OKR, Kara vẫn có thể lấy quý đó làm quý hiện tại và trả lời theo một quý khác với quý người dùng đang thấy.
  file: `apps/agent-okr/agent/lib/hoi-doc.ts`
  severity: medium
  Đề xuất: known-limits

- **Cửa hỏi đếm lượt rồi mới chuyển tiếp, nhưng không hoàn lượt và không có hạn chờ như cửa soạn (r1)**
  Người dùng thấy gì: Khi trợ lý bị lỗi hoặc chậm, câu hỏi thất bại vẫn bị trừ vào 40 câu mỗi ngày, và mở hai tab cùng lúc có thể bị trừ hai lần và gặp lỗi ở lần gửi sau.
  file: `apps/app/lib/cua-okr-hoi.ts`
  severity: medium
  Đề xuất: known-limits

- **okr.hoi-dap nằm trong nhóm «tro-ly-okr» trên màn chi phí nhưng không nằm trong TINH_NANG_TRO_LY_OKR (r1)**
  Người dùng thấy gì: Màn chi phí có thể hiện hai con số chi khác nhau dưới cùng nhãn «Trợ lý OKR», một con số có tính tiền hỏi đáp và một con số không.
  file: `packages/db/src/ai-chi-phi-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

- **HoiService ném mã lỗi viết thẳng và dùng hai loại ngoại lệ cho cùng một điều kiện (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt rõ rệt; chỉ có một số lỗi quyền truy cập hiện kèm mã, số khác hiện kèm câu tiếng Việt.
  file: `apps/api/src/okr/hoi.service.ts`
  severity: low
  Đề xuất: wont-fix

- **locTim chép tay danh sách tình trạng thay vì dùng TINH_TRANG có sẵn (r1)**
  Người dùng thấy gì: Hiện chưa ảnh hưởng người dùng; nếu sau này thêm một tình trạng OKR mới thì bộ lọc của Kara có thể không nhận ra nó.
  file: `apps/agent-okr/agent/lib/hoi-doc.ts`
  severity: low
  Đề xuất: wont-fix

- **Cửa hỏi đếm lượt trước khi chuyển tiếp nhưng không bao giờ hoàn lượt khi agent-okr hỏng (r1)**
  Người dùng thấy gì: Khi Kara chập chờn, mỗi lần bấm «Thử lại» mất một trong 40 câu mỗi ngày dù không nhận được câu trả lời, đến mức có thể bị khoá ô gõ sớm.
  file: `apps/app/lib/cua-okr-hoi.ts`
  severity: medium
  Đề xuất: known-limits

- **Cột hỏi không xử lý phiên eve đã kết thúc: ô gõ vẫn mở, câu gửi đi chắc chắn hỏng và vẫn bị trừ lượt (r1)**
  Người dùng thấy gì: Mở lại một cuộc hỏi cũ sau hơn 30 phút thì ô gõ vẫn mở nhưng câu gửi đi không bao giờ được trả lời, và mỗi lần thử lại vẫn bị trừ một câu.
  file: `apps/app/app/(app)/[slug]/okr/hoi/cot-hoi-kara.tsx`
  severity: medium
  Đề xuất: known-limits

- **Phiên okr-hoi thừa trần 60.000 token đầu vào mỗi phiên của Soạn, nhưng cột hỏi không hiển thị lời xin duyệt thêm ngân sách (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trong một cuộc hỏi dài nhiều câu, Kara có thể dừng lại chờ một lời xin duyệt mà người dùng không thấy, rồi chỉ hiện «Kara chưa trả lời được» và cuộc hỏi kẹt.
  file: `apps/agent-okr/agent/lib/config.ts`
  severity: medium
  Đề xuất: known-limits

- **Lưu phản hồi hữu ích hỏng thì im lặng, giao diện vẫn báo đã ghi nhận (r1)**
  Người dùng thấy gì: Nếu việc lưu đánh giá câu trả lời bị lỗi, người dùng vẫn thấy lời cảm ơn như đã ghi nhận, nhưng đội không nhận được phản hồi đó.
  file: `apps/app/app/(app)/[slug]/okr/hoi/cot-hoi-kara.tsx`
  severity: low
  Đề xuất: known-limits

- **Hai lần mở phiên đua nhau: ghiPhienEve âm thầm đẩy phiên thua vào cacPhien và trả thành công (r1)**
  Người dùng thấy gì: Gửi câu đầu tiên từ hai tab cùng lúc có thể khiến một tab bị trừ lượt oan và báo lỗi ở các câu sau.
  file: `packages/db/src/okr-cuoc-hoi.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
