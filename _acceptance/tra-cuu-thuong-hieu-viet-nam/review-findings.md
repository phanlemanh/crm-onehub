# Review findings: tra-cuu-thuong-hieu-viet-nam (round 3)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Machine-filled values get locked for good after one lookup that leaves them out**
  Người dùng thấy gì: Sau một lần Tra cứu lại mà nhà cung cấp trả thiếu mô tả hay địa chỉ, hệ thống quên rằng các ô đó do máy điền. Từ lần tra thứ ba, các ô ấy bị coi như người gõ và không được cập nhật, dù kết quả mới có đủ thông tin tiếng Việt.
  Căn cứ: Chỉ xảy ra khi một lần tra giữa chừng trả thiếu dữ liệu, không làm mất dữ liệu của người dùng, và rep tự sửa tay hay xoá ô đó là được; sửa sâu vì phải đổi cách ghi nhớ phần máy điền.
  file: `apps/agent/agent/lib/brand.ts`
  severity: low
  Đề xuất: known-limits

- **E10 screenshot script writes the test company straight into the database, not through the API its declared step names**
  Người dùng thấy gì: Công cụ chụp màn tạo công ty mẫu bằng cách ghi thẳng vào cơ sở dữ liệu đo, và khi chụp hỏng giữa chừng thì công ty mẫu có thể còn sót đến lần chụp sau. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng cơ sở dữ liệu đo riêng, không chạm dữ liệu thật; lần chụp sau tự dọn lại nên hậu quả rất nhẹ.
  file: `_acceptance/tra-cuu-thuong-hieu-viet-nam/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm tính một mình (hình 4): ca 'raw hong khuon' khẳng định mô tả không bị thay, nhưng vẫn xanh dù đọc được raw hay không**
  Người dùng thấy gì: Bài kiểm tra cho trường hợp dữ liệu lần tra trước bị hỏng không chứng minh được rằng hệ thống thật sự giữ nguyên ô đã điền. Nếu hành vi này hỏng, bài kiểm tra vẫn xanh và có thể ghi đè mô tả mà rep đã điền.
  Căn cứ: Nhánh dữ liệu lưu hỏng hiếm gặp và đã được ghi nhận là hạn chế, rep gõ lại được nếu bị ghi đè; sửa bài kiểm tra rẻ nhưng không đổi trải nghiệm người dùng.
  file: `apps/agent/test/tra-cuu-thuong-hieu-viet-nam.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Fixture viết tay thay cho đường ghi thật (hình 2): ca LinkedIn tạo công ty bằng db.company.create, không đi qua đường thư mục công ty từ email**
  Người dùng thấy gì: Bài kiểm tra công ty tạo từ địa chỉ email LinkedIn không chạy qua bước thật tạo công ty từ email. Nếu bước đó bắt nhầm hoặc rút sai tên miền, bài kiểm tra vẫn xanh.
  Căn cứ: Rủi ro thấp vì nhánh bỏ qua tra thương hiệu đã được đo ở ca khác; nếu sai thì chỉ làm công ty tạo từ email thiếu logo và mô tả, rep tra lại hoặc điền tay được.
  file: `apps/agent/test/tra-cuu-thuong-hieu-viet-nam.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Fixture viết tay đúng khuôn bên đọc (hình 2): các null slogan/email/phone/address chỉ được đưa thẳng vào docBrandRaw, không đi vòng qua runBrand**
  Người dùng thấy gì: Bài kiểm tra chỉ chứng minh rằng dữ liệu lưu với các ô trống như slogan, email, điện thoại được đọc lại bình thường khi tự viết tay. Chưa chứng minh dữ liệu mà hệ thống tự ghi xuống cũng đọc lại được.
  Căn cứ: Không có hậu quả thấy được ở người dùng hiện tại; nếu lệch thì chỉ rơi về nhánh dữ liệu lưu hỏng đã ghi nhận, còn sửa là việc bổ sung bài kiểm tra.
  file: `apps/agent/test/tra-cuu-thuong-hieu-viet-nam.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Tuyên bố quét cả lớp nhưng phép đếm là hằng đúng (hình 5): daChay và tong cùng sinh từ một danh sách**
  Người dùng thấy gì: Nếu ai đó vô tình xoá một tên miền phụ khỏi danh sách nền tảng như fb.com hay youtu.be, bài kiểm tra vẫn xanh. Khi đó đường dẫn thuộc nền tảng ấy lại lọt vào ô tên miền của công ty.
  Căn cứ: Chỉ xảy ra khi danh sách bị sửa nhầm trong tương lai, hậu quả là một tên miền nền tảng lọt qua và rep sửa được ngay; thêm một con số ghim cố định rẻ nhưng không cấp bách.
  file: `packages/validation/test/ten-mien-nen-tang.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Đọc raw lần tra trước hỏng thì bị nuốt thành 'không có lần trước' (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu dữ liệu lưu của lần tra trước bị hỏng, «Tra cứu lại» lặng lẽ không thay các ô máy đã điền mà vẫn báo xong. Người dùng không thấy dấu hiệu nào.
  Căn cứ: Hiếm khi xảy ra (cần dữ liệu lưu bị hỏng), không mất dữ liệu, và rep tự sửa tay các ô đó được.
  file: `apps/agent/agent/lib/brand.ts`
  severity: medium
  Đề xuất: known-limits

- **Bàn chụp chèn thẳng bảng company thay vì đi qua đường ghi thật (r1)**
  Người dùng thấy gì: Công ty mẫu dùng để chụp màn được tạo bằng đường tắt, nên ảnh chụp không chứng minh được dữ liệu do đường ghi thật tạo ra hiển thị đúng. Người dùng thật không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ chắc của bằng chứng chụp màn, không đụng sản phẩm; cách làm này đã phổ biến ở nhiều bàn đo khác.
  file: `_acceptance/tra-cuu-thuong-hieu-viet-nam/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

- **Script backfill vẫn ép kiểu raw sau khi raw đã có module schema riêng (r1)**
  Người dùng thấy gì: Một script chạy tay để điền lại ảnh thương hiệu vẫn đọc dữ liệu lưu theo cách cũ, nên về sau có thể lệch với phần còn lại khi khuôn dữ liệu đổi. Người dùng không thấy gì hiện nay.
  Căn cứ: Chỉ là nợ gọn code, chưa gây sai kết quả nào, và sửa sau không tốn kém.
  file: `apps/agent/scripts/backfill-brand-images.ts`
  severity: low
  Đề xuất: known-limits

- **Logic rút host bị chép thành bản thứ hai cạnh normalizeDomain (r1)**
  Người dùng thấy gì: Có hai nơi cùng định nghĩa cách lấy tên miền từ chuỗi người dùng dán, nên sau này một nơi sửa mà nơi kia quên thì chặn nền tảng có thể lệch với phần lưu tên miền.
  Căn cứ: Hiện hai bản cho kết quả khớp nhau, chưa ai bị ảnh hưởng; sửa sau không mất dữ liệu.
  file: `packages/validation/src/ten-mien-nen-tang.ts`
  severity: low
  Đề xuất: known-limits

- **Tra cứu lại thay một phần địa chỉ máy điền, phần còn lại thành dữ liệu cũ và bị khoá vĩnh viễn (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau «Tra cứu lại», địa chỉ có thể lẫn cũ và mới, như «Hà Nội, CA, Việt Nam», và phần cũ còn sót không được máy thay nữa. Rep phải tự sửa tay.
  Căn cứ: Hiển thị sai nhưng không mất dữ liệu, chỉ khi kết quả mới thiếu trường; rep sửa tay được trong vài giây.
  file: `apps/agent/agent/lib/brand-mapping.ts`
  severity: medium
  Đề xuất: known-limits

- **Tra cứu lại khi dữ liệu không đổi vẫn báo «đã điền» mọi trường máy điền và ghi lại cùng giá trị (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi «Tra cứu lại» không có gì mới, Kara vẫn báo đã điền hàng loạt trường như thể có thay đổi. Rep có thể tưởng dữ liệu vừa được cập nhật.
  Căn cứ: Chỉ là câu báo gây hiểu lầm nhẹ, dữ liệu vẫn đúng và không mất gì.
  file: `apps/agent/agent/lib/brand-mapping.ts`
  severity: medium
  Đề xuất: known-limits

- **Mô tả công cụ enrich_company vẫn nói chỉ điền ô trống, giờ đã sai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Kara có thể trả lời rep sai về «Tra cứu lại», ví dụ nói mô tả cũ sẽ không bị thay trong khi thực tế có thể bị thay.
  Căn cứ: Chỉ làm lời giải thích của Kara sai, dữ liệu không bị hại, và đổi một dòng chữ sau này rất rẻ.
  file: `apps/agent/agent/tools/enrich_company.ts`
  severity: low
  Đề xuất: known-limits

- **Script chụp màn E10 chèn thẳng bảng company, trái bước «Tạo qua API của bàn đo» trong evals.yaml (r1)**
  Người dùng thấy gì: Phép đo ghi là tạo công ty qua API nhưng thực tế được tạo bằng đường tắt, nên người chấm đọc mô tả sẽ thấy không khớp. Người dùng thật không bị ảnh hưởng.
  Căn cứ: Chỉ lệch giữa lời khai và cách làm của phép đo; ảnh vẫn cho thấy đúng thứ cần xem.
  file: `_acceptance/tra-cuu-thuong-hieu-viet-nam/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 5, ma trận không viết trước: khẳng định đếm ca không thể đỏ (r1)**
  Người dùng thấy gì: Nếu ai đó lỡ xoá một tên miền nền tảng khỏi danh sách chặn, bài kiểm vẫn xanh, và tên miền đó sẽ lọt qua mà không ai hay.
  Căn cứ: Chỉ xảy ra khi danh sách bị sửa nhầm, và thêm lại tên miền vào danh sách là xong, không mất dữ liệu.
  file: `packages/validation/test/ten-mien-nen-tang.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2, fixture VIẾT TAY bỏ qua writer: ca 'công ty tạo từ email' chèn thẳng bảng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có bài kiểm chứng rằng email kiểu @linkedin.com vẫn tạo được công ty. Nếu sau này đường tạo công ty từ email chặn nhầm, sẽ không ai phát hiện sớm.
  Căn cứ: Hợp đồng đã ghi rõ ca này ngoài phạm vi, và nếu hỏng thì chỉ thiếu công ty tự tạo, rep thêm tay được.
  file: `apps/agent/test/tra-cuu-thuong-hieu-viet-nam.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4, assertion âm-tính-một-mình: ca 'raw hong khuon' không có đối chứng dương 'điền trường trống' (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có bài kiểm chứng rằng khi dữ liệu lần tra trước hỏng, lần tra mới vẫn điền được các ô còn trống. Một lỗi ở đây có thể lọt mà không ai thấy.
  Căn cứ: Ca hiếm, ngoài hợp đồng, và nếu hỏng thì chỉ một vài ô trống không được điền, rep tự điền được.
  file: `apps/agent/test/tra-cuu-thuong-hieu-viet-nam.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2, fixture VIẾT TAY: bản chụp E10 chèn công ty thẳng vào DB thay vì tạo qua API như bước eval (r1)**
  Người dùng thấy gì: Ảnh chụp màn dùng công ty mẫu tạo bằng đường tắt, nên chưa chứng minh dữ liệu từ đường ghi thật hiển thị đúng như vậy. Người dùng thật không bị ảnh hưởng.
  Căn cứ: Chỉ làm bằng chứng chụp màn yếu hơn một chút, không đụng sản phẩm hay dữ liệu.
  file: `_acceptance/tra-cuu-thuong-hieu-viet-nam/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
