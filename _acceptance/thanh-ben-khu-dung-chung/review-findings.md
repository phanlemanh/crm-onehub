# Review findings: thanh-ben-khu-dung-chung (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khổ 375x812 của phép đo AC-11 viết số trần, lặp lại DO.kho**
  Người dùng thấy gì: Người dùng không gặp gì: màn hình sản phẩm không đổi. Chỉ có công cụ kiểm của đội có hai con số khổ điện thoại viết ở hai chỗ, và nếu sau này ai đổi khổ ở một chỗ thì chỗ kia không tự theo.
  Căn cứ: Không ảnh hưởng người dùng, không mất dữ liệu, chỉ nằm ở công cụ kiểm nội bộ và sửa lúc nào cũng được, nên không đáng mở thêm việc.
  file: `_acceptance/thanh-ben-khu-dung-chung/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Khung xương và role=status của AgentBuilderSidebarFallback lọt vào hàng ngang điện thoại, trái luật vòng này vừa ghi (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trên điện thoại, trong lúc danh sách hội thoại đang tải, hàng ngang phía trên hiện một khối chờ cao hơn hàng thật, nên khi dữ liệu về trang bị giật co lại một chút. Trình đọc màn hình cũng nghe thông báo đang tải hai lần.
  Căn cứ: Chỉ xảy ra trong khoảnh khắc chờ tải, không mất dữ liệu và tự hết khi tải xong, nên hậu quả nhẹ; sửa sau cũng rẻ.
  file: `apps/app/components/agent-builder/agent-builder-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **Under 768px, the chat column loses its height limit and long conversations stop scrolling (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trên điện thoại, một cuộc trò chuyện dài không còn cuộn trong khung của nó nữa, và ô soạn tin bị đẩy ra khỏi màn hình. Người dùng khó đọc phần đầu cuộc trò chuyện và khó gõ tiếp ở mọi trang Hội thoại và Tác nhân.
  Căn cứ: Lỗi nặng vì làm Hội thoại gần như không dùng được trên điện thoại khi cuộc trò chuyện dài, người dùng không tự khắc phục được bằng cách tải lại; sửa rẻ nhưng nên làm ngay thành việc riêng.
  file: `apps/app/components/agent-builder/agent-builder-shell.tsx`
  severity: high
  Đề xuất: new-contract

- **Delete button now covers the end of the conversation title; the right padding reserved for it was dropped (r1)**
  Người dùng thấy gì: Nút xoá nằm đè lên vài ký tự cuối của tiêu đề cuộc hội thoại, luôn hiện trên điện thoại và hiện khi rê chuột trên máy tính. Tiêu đề dài bị che mất phần đuôi.
  Căn cứ: Chỉ là che một đoạn chữ cuối của tiêu đề dài, không mất dữ liệu, người dùng vẫn mở được cuộc và xoá được; hậu quả nhẹ.
  file: `apps/app/components/agent-builder/agent-builder-sidebar.tsx`
  severity: low
  Đề xuất: known-limits

- **do-man.mjs swallows the timeout while waiting for the sidebar to finish loading and keeps measuring (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Chỉ là bước kiểm tra màn hình có thể báo đạt dù thanh bên thật chưa kịp hiện, nên bằng chứng nghiệm thu yếu hơn vẻ ngoài.
  Căn cứ: Không đụng tới người dùng và không mất dữ liệu; rủi ro chỉ là bỏ sót lỗi tải thanh bên ở các lượt kiểm sau, ghi lại là đủ.
  file: `_acceptance/thanh-ben-khu-dung-chung/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): tbk-panel khẳng định 'không hidden / không view-transition-name' trên một aside có thể null (r1)**
  Người dùng thấy gì: Người dùng cuối không thấy gì khác. Bài kiểm của ngăn thanh bên trên điện thoại có thể báo đạt cả khi ngăn không vẽ thanh bên nào, nên một lỗi sau này có thể lọt qua.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm lưới an toàn lỏng hơn; có thể siết sau khi có dịp.
  file: `packages/ui/test/area-sidebar.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay khớp khuôn bên đọc): nút xoá trong E4/E6 là bản mock tự gắn data-xoa và aria-label, không phải DeleteChatAction thật (r1)**
  Người dùng thấy gì: Người dùng cuối không thấy gì khác. Nếu sau này nhãn đọc to của nút xoá bị đổi hoặc mất, bài kiểm vẫn xanh nên người dùng đọc màn hình có thể gặp nút không có tên.
  Căn cứ: Rủi ro chỉ xảy ra nếu có người sửa nút xoá sau này, hiện chưa hỏng gì; ghi lại và đóng hồ sơ là hợp lý.
  file: `apps/app/test/thanh-ben-khu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): bộ quét chỉ bắt aside có className là chuỗi literal, hoặc đúng chuỗi w-[213px] (r1)**
  Người dùng thấy gì: Người dùng cuối không thấy gì khác. Bài quét chống thanh bên tự dựng có thể bỏ sót một số cách viết lạ, nên sau này ai đó tự dựng thanh bên theo cách ấy sẽ không bị chặn.
  Căn cứ: Không có tệp nào đang lọt, chỉ là rủi ro tương lai; nâng độ phủ bài quét tốn công hơn lợi ích nên chấp nhận và ghi vết.
  file: `_acceptance/thanh-ben-khu-dung-chung/rang/quet-vo-tay.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
