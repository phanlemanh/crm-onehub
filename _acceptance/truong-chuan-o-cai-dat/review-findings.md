# Review findings: truong-chuan-o-cai-dat (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểu MucBoTri viết tay ở packages/db, nằm cạnh schema Zod mucBoTri ở packages/validation (sẽ lệch nhau)**
  Người dùng thấy gì: Người dùng không thấy gì khác đi hôm nay. Về sau, nếu ai đó đổi cấu trúc bố trí trường ở một nơi mà quên nơi kia, màn Cài đặt và phiếu có thể lệch nhau mà không ai được báo.
  Căn cứ: Hôm nay mọi thứ chạy đúng nên người dùng không bị ảnh hưởng; rủi ro chỉ xuất hiện khi có người sửa sau này, và sửa lúc đó cũng không đắt hơn bây giờ.
  file: `packages/db/src/fields-chuan.ts`
  severity: medium
  Đề xuất: known-limits

- **Công tắc ẩn/hiện trường và kéo sắp thứ tự áp cho cả không gian làm việc, nhưng toast không có nút «Hoàn tác»**
  Người dùng thấy gì: Quản trị bật tắt một trường hoặc kéo đổi thứ tự là đổi phiếu của cả đội, nhưng thông báo sau đó không có nút hoàn tác nhanh. Họ phải tự làm ngược lại bằng tay.
  Căn cứ: Nhẹ: không mất dữ liệu, quản trị tự đưa về như cũ được ngay bằng một thao tác; các trang Cài đặt khác cũng chưa có nút này.
  file: `apps/app/components/crm/fields/fields-list.tsx`
  severity: low
  Đề xuất: known-limits

- **Cài đặt › Trường lặng lẽ hiện bố trí mặc định khi fields.layout đang tải hoặc lỗi, và lúc đó vẫn cho kéo, bật/tắt rồi ghi đè**
  Người dùng thấy gì: Nếu mạng chập chờn đúng lúc quản trị mở Cài đặt › Trường, màn hình có thể hiện thứ tự mặc định thay vì thứ tự đã lưu, và công tắc của trường đã ẩn trông như đang bật. Nếu họ kéo một hàng lúc đó, thứ tự đã lưu của cả đội bị ghi đè mà họ không hề thấy.
  Căn cứ: Khá nặng khi xảy ra vì ghi đè thứ tự của cả đội mà không báo, nhưng hiếm (cần lỗi mạng đúng lúc) và gỡ được bằng cách sắp lại; sửa nhỏ nên đáng làm thành việc riêng.
  file: `apps/app/components/crm/fields/fields-list.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình): E9 kiểm 'phiếu không còn Thành phố' mà không có đối chứng dương rằng ngăn công ty đã mở**
  Người dùng thấy gì: Sản phẩm không bị lỗi. Phép kiểm tự động việc phiếu Công ty đã ẩn «Thành phố» có thể báo đạt dù phiếu thực ra chưa mở, nên một lỗi ẩn trường sau này có thể lọt qua.
  Căn cứ: Người dùng không bị ảnh hưởng ngay; đây chỉ là mắt xích kiểm tra lỏng và bổ sung sau cũng không đắt.
  file: `_acceptance/truong-chuan-o-cai-dat/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: đối chứng 'thuoc mu' của tcc-danh-muc (phiếu) là đối chứng giả, không bao giờ đỏ**
  Người dùng thấy gì: Sản phẩm không bị lỗi. Bài kiểm xác nhận danh sách trường trên phiếu có thể không phát hiện được nếu phiếu thiếu mục Chi tiết.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; chỉ làm lưới an toàn về sau lỏng hơn và vá lúc nào cũng được.
  file: `apps/app/test/truong-chuan-cai-dat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): kiểm 'thieu nhan' của tcc-chuan-bat-buoc bị câu lý do sr-only làm xanh hộ**
  Người dùng thấy gì: Sản phẩm không bị lỗi. Nếu sau này ai đó xoá chữ «bắt buộc» khỏi dòng phụ của trường bắt buộc thì bài kiểm tự động vẫn báo đạt, và người dùng sẽ không còn thấy nhãn đó.
  Căn cứ: Hiện không ai bị ảnh hưởng; hậu quả chỉ là một nhãn nhỏ có thể biến mất mà không bị bắt, người dùng nhìn là thấy và sửa rẻ.
  file: `apps/app/test/truong-chuan-cai-dat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: tcc-sap-lai chỉ kiểm một chỉ số trên DOM, trong khi lời hứa là thứ tự DOM trùng thứ tự vừa gửi**
  Người dùng thấy gì: Sản phẩm không bị lỗi. Bài kiểm chỉ xác nhận «Hạng đối tác» nằm đúng chỗ sau khi kéo, chưa xác nhận các trường còn lại cũng nằm đúng chỗ, nên một lỗi làm xáo trộn trường khác có thể không bị bắt.
  Căn cứ: Người dùng chưa gặp vấn đề nào; rủi ro là lỗi xáo thứ tự ở các trường khác lọt qua kiểm tự động, nhưng người dùng thấy ngay trên màn và tự sắp lại được.
  file: `apps/app/test/truong-chuan-cai-dat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp nhưng chỉ kiểm một phần): tcc-khong-quyen hứa 'mọi nút trong danh sách' nhưng bỏ sót nút sửa và nút menu của hàng tự tạo**
  Người dùng thấy gì: Chưa có bằng chứng người không phải quản trị bấm được nút sửa hay menu của trường tự tạo, nhưng bài kiểm tự động không canh hai nút này, nên nếu sau này chúng bị mở nhầm sẽ không ai biết.
  Căn cứ: Hôm nay chưa thấy hại; máy chủ vẫn từ chối thao tác của người không có quyền nên không mất dữ liệu, và bổ sung bài kiểm sau không đắt.
  file: `apps/app/test/truong-chuan-cai-dat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: tcc-api-quyen lặp hai thủ tục nhưng chỉ đọc lại bố trí cho fields.reorder**
  Người dùng thấy gì: Sản phẩm không bị lỗi đã biết. Bài kiểm chỉ canh chặt việc từ chối của thao tác sắp lại, còn thao tác ẩn trường thì chưa kiểm kỹ việc bố trí có bị đổi dở dang sau khi từ chối hay không.
  Căn cứ: Rủi ro thấp: lỗi nếu có chỉ xảy ra với người không có quyền gọi thẳng máy chủ, và chi phí viết thêm đối chứng cao hơn hậu quả.
  file: `apps/api/test/truong-chuan-cai-dat.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5: đáp án của tcc-danh-muc (DOM) lấy từ chính code đang kiểm, không viết sẵn như hợp đồng hứa**
  Người dùng thấy gì: Sản phẩm không bị lỗi đã biết. Nếu một trường chuẩn bị gán nhầm nhãn (ví dụ «Thành phố» hiện thành «Quốc gia») thì cả Cài đặt lẫn phiếu cùng sai theo và bài kiểm vẫn báo đạt.
  Căn cứ: Người dùng chưa bị ảnh hưởng; một nhãn sai sẽ lộ ra khi nhìn màn và sửa là một dòng chữ, nhưng bài kiểm cần một bảng đáp án viết sẵn mới bắt được.
  file: `apps/app/test/truong-chuan-cai-dat.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
