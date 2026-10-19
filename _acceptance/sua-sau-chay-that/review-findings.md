# Review findings — sua-sau-chay-that (round 5)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ Cổng Bằng chứng round 4 báo sai 6 eval đã đạt (E2, E4, E5, E6, E8, E10) thành «chưa đạt»**
  Người dùng thấy gì: Người ký cổng thấy 8 phép kiểm đỏ trong khi thật ra chỉ 2 đỏ, nên có thể đánh giá mức hỏng nặng hơn thực tế khi chọn lối ra. Người dùng cuối của Kho tài liệu không bị ảnh hưởng.
  Căn cứ: Chỉ làm người ký đọc thẻ nặng hơn thực tế, không mất hay lộ dữ liệu của người dùng, và bảng báo cáo đi kèm vẫn ghi đúng 2 phép kiểm hỏng để đối chiếu.
  file: `_acceptance/sua-sau-chay-that/card.html`
  severity: medium
  Đề xuất: known-limits

- **Câu mới trong messages/tai-lieu.ts phạm luật «AI một tên»: kara-mot-ten.spec.ts đang đỏ (r4 · tệp đã đổi)**
  Người dùng thấy gì: Vài câu trên màn Kho tài liệu gọi AI là «máy soạn» hay «Trợ lý AI» thay vì tên Kara, trái quy ước tên của sản phẩm. Người dùng chỉ thấy tên gọi lệch, nhưng bộ kiểm chung đang đỏ nên chặn việc đẩy mã lên.
  Căn cứ: Hậu quả với người dùng nhẹ (chỉ lệch tên gọi, không mất dữ liệu), nhưng sửa rẻ và phải xong trước khi gộp vì bộ kiểm chung đang chặn.
  file: `apps/app/lib/messages/tai-lieu.ts`
  severity: high
  Đề xuất: new-contract

- **Thêm chú thích code vào lich.test.ts, phạm luật «Never add code comments» (r4)**
  Người dùng thấy gì: Một tệp kiểm nội bộ có thêm vài dòng ghi chú và một tên kiểm tra mất dấu cách. Người dùng cuối không thấy gì.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là lỗi trình bày nội bộ, nhận và ghi vết là đủ.
  file: `scripts/tin-hieu/test/lich.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Kiểu nội dung (MIME) của tệp nguồn vẫn khai ở hai nơi sau khi gom «một nguồn» (r4)**
  Người dùng thấy gì: Danh sách loại tệp cho phép tải nguồn vẫn còn một bản chép nữa ở phía lưu trữ tệp. Nếu sau này ai sửa một bên mà quên bên kia, người dùng sẽ bị từ chối khi tải tệp.
  Căn cứ: Hiện hai bản đang khớp nên chưa ai gặp lỗi; nếu lệch thì người dùng chỉ bị từ chối tải và thử lại được, không mất dữ liệu.
  file: `packages/validation/src/tai-lieu-nguon.ts`
  severity: low
  Đề xuất: known-limits

- **Sau khi gộp onehub, câu mới ở messages tai-lieu vẫn gọi AI bằng tên cũ, làm đỏ kara-mot-ten.spec.ts (r4 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi gộp bản mới, một số câu trên màn Kho tài liệu vẫn gọi AI bằng tên cũ thay vì Kara. Người dùng thấy tên gọi không thống nhất và bộ kiểm chung đang đỏ.
  Căn cứ: Chỉ là tên gọi lệch, không mất dữ liệu và người dùng không bị chặn việc; nhưng phải sửa trước khi đẩy vì bộ kiểm chung đỏ.
  file: `apps/app/lib/messages/tai-lieu.ts`
  severity: high
  Đề xuất: new-contract

- **Câu vi «het-tran» chép tay đã lệch khỏi nguồn sau khi onehub đổi tên thành Kara: ssct-hoi-en đỏ, câu trên web khác câu gửi Zalo (r4 · tệp đã đổi)**
  Người dùng thấy gì: Khi hết hạn mức tháng, người dùng tiếng Việt đọc một câu trên web nhưng nhận một câu khác qua Zalo, vì một nơi đã đổi sang tên Kara còn nơi kia thì chưa.
  Căn cứ: Hậu quả nhẹ: chỉ khác chữ trong lúc hết hạn mức, không mất dữ liệu; sửa rẻ và cùng việc với lỗi tên AI.
  file: `apps/app/lib/messages/tai-lieu.ts`
  severity: high
  Đề xuất: new-contract

- **Bộ quét t1-ma-doc nuốt lỗi đọc tệp, coi như tệp rỗng (r4)**
  Người dùng thấy gì: Công cụ kiểm nội bộ quyết định có bỏ qua kiểm thử cho thay đổi chỉ chạm tài liệu có thể im lặng bỏ qua một tệp không đọc được. Người dùng cuối không thấy ngay.
  Căn cứ: Chỉ xảy ra ở tình huống hiếm về tệp hỏng trong cây làm việc, không chạm dữ liệu người dùng; rủi ro là bỏ sót kiểm thử, ghi lại để theo dõi.
  file: `.github/scripts/t1-ma-doc.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo checkout khác chứ không đo cây đang kiểm): E6 cong-van-do chạy cổng của commit 38ecca3be, không chạy cổng của cây (r4)**
  Người dùng thấy gì: Một phép kiểm của hồ sơ khác có thể báo đạt trong khi đo cổng kiểm cũ chứ không phải bản hiện tại. Người dùng cuối không thấy tác động trực tiếp.
  Căn cứ: Là độ tin cậy của công cụ nghiệm thu nội bộ, không ảnh hưởng dữ liệu hay màn hình người dùng; sửa thuộc vòng của hồ sơ kia.
  file: `_acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 (đo khoảng diff khác, không phải vòng của hồ sơ): E7 lam-moi-goi-y-ke-hoach lấy mốc bằng merge-base lúc chạy nên sau khi gộp nó quét nhánh khác (r4)**
  Người dùng thấy gì: Lần chấm lại một hồ sơ cũ có thể ra đỏ hay xanh tuỳ nhánh đang mở, không phản ánh đúng lời hứa của hồ sơ đó. Người dùng cuối không thấy.
  Căn cứ: Chỉ làm nhiễu kết quả chấm lại nội bộ, không đụng người dùng hay dữ liệu; sửa thuộc hồ sơ khác.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ bắt một dạng): khong-xoa-expect hứa quét MỌI tệp kiểm và mọi câu khẳng định, nhưng chỉ khớp *.spec/*.dom và chỉ thấy `expect(` (r4)**
  Người dùng thấy gì: Công cụ chống xoá bài kiểm của một hồ sơ cũ bỏ sót vài dạng bài kiểm, nên xoá chúng có thể không bị phát hiện. Người dùng cuối không thấy.
  Căn cứ: Là lỗ hổng độ phủ của công cụ nội bộ, không gây hỏng chức năng người dùng; chi phí vá cao so với tác hại.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định «chuỗi có mặt» trong khi lời hứa là quan hệ): E10 chỉ kiểm khối mutationOptions có chứa chuỗi `cache.deal(` (r4)**
  Người dùng thấy gì: Một phép kiểm cũ về việc làm mới gợi ý sau khi đổi giai đoạn thoả thuận chỉ so chuỗi chữ, có thể báo đạt dù gọi sai chỗ. Người dùng cuối không thấy ngay.
  Căn cứ: Chỉ làm phép kiểm lỏng hơn mong muốn, tác hại thấp và nếu hỏng thật người dùng chỉ thấy gợi ý chưa mới, tải lại là xong.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (khẳng định âm tính đứng một mình): quet-do 8, 9, 11 dựng sẵn cặp neo dương nhưng không khẳng định nó (r4)**
  Người dùng thấy gì: Ba bài kiểm nội bộ có thể vẫn xanh khi công cụ quét không quét gì cả. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ là bài kiểm nội bộ thiếu một dòng đối chứng, không tác động người dùng; tác hại thấp nên ghi vết là đủ.
  file: `packages/ui/test/t1-ma-doc.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **laDatHai chép lại logic «đạt lượt 2» thay vì import nhanCua của bo-cau-hoi-mau, và đã lệch so với bản gốc (r3)**
  Người dùng thấy gì: Phép so kết quả đo bộ câu hỏi mẫu tự tính lại cách xét một câu là đạt thay vì dùng chung cách của bộ câu hỏi mẫu. Hôm nay kết quả vẫn đúng, nhưng nếu sau này hai bên lệch nhau thì phép so có thể xét sai một số câu bị lỗi.
  Căn cứ: 
  file: `_acceptance/sua-sau-chay-that/rang/so-bo-mau.ts`
  severity: low
  Đề xuất: known-limits

- **banSao leaves a temp copy of the evidence behind on every red-side check (r3)**
  Người dùng thấy gì: Mỗi lần chạy phép so kết quả đo, máy để lại vài thư mục tạm chiếm chỗ trong bộ nhớ tạm. Người dùng không thấy gì khác và kết quả đo không bị ảnh hưởng.
  Căn cứ: 
  file: `_acceptance/sua-sau-chay-that/rang/so-bo-mau.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): chiều đỏ lượt 2 của E13 chỉ ghim mã câu ở bất kỳ dòng nào, không ghim lượt (r2)**
  Người dùng thấy gì: Bước đo lại bộ câu hỏi mẫu vẫn chặn được câu đạt bị đổi thành không đạt ở lượt hai, nhưng phép tự kiểm của nó chưa chứng minh được là báo đúng ở lượt hai chứ không phải lượt một. Nếu bộ so sau này nhầm lượt, kết quả đo vẫn có thể vẫn trông đúng. Nên ghi lại như một hạn chế đã biết về độ chặt của phép đo.
  Căn cứ: 
  file: `_acceptance/sua-sau-chay-that/rang/so-bo-mau.ts`
  severity: low
  Đề xuất: known-limits

- **Bảng MIME loại tệp nguồn giờ có hai bản: validation mới và BLOB_NGUON phía máy chủ (r1)**
  Người dùng thấy gì: Hiện chưa có lỗi nào thấy được khi tải nguồn Word hay PDF. Nhưng nếu sau này ai đó sửa loại tệp ở một nơi mà quên nơi kia thì việc tải nguồn có thể bị từ chối mà không rõ vì sao.
  Căn cứ: 
  file: `packages/validation/src/tai-lieu-nguon.ts`
  severity: medium
  Đề xuất: known-limits

- **Luật liên kết an toàn chỉ nằm trong packages/ui; API và agent không có nó ở biên (r1)**
  Người dùng thấy gì: Liên kết http do trợ lý soạn hoặc gửi thẳng qua API vẫn lưu được, rồi lúc đọc thì liên kết biến mất mà không có thông báo. Người gõ tay trong trình soạn thì đã được báo.
  Căn cứ: 
  file: `packages/ui/src/lib/lien-ket-an-toan.ts`
  severity: medium
  Đề xuất: known-limits

- **Link popover rejects a bare host:port (e.g. a.vn:8080) as a non-https link instead of adding https:// (r1)**
  Người dùng thấy gì: Khi dán một địa chỉ trần có số cổng như a.vn:8080 vào ô liên kết, trình soạn báo nhầm là chỉ nhận https dù địa chỉ đó hợp lệ. Người viết phải gõ thêm https:// thì mới lưu được.
  Căn cứ: 
  file: `packages/ui/src/components/trinh-soan-thanh-cong-cu.tsx`
  severity: low
  Đề xuất: known-limits

- **«Soạn lại» is still offered for a source whose target page is archived, so every retry calls the model and fails again (r1)**
  Người dùng thấy gì: Với nguồn mà trang đích đã lưu trữ, nút Soạn lại vẫn bấm được. Mỗi lần bấm tốn một lượt gọi trợ lý rồi lại báo lỗi như cũ.
  Căn cứ: 
  file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E1b gieo nguồn DANG_SOAN và trang bằng db.create trực tiếp, không qua đường ghi thật (r1)**
  Người dùng thấy gì: Bài kiểm khẳng định trợ lý không tạo đề xuất cho trang đã lưu trữ dùng dữ liệu gieo tay. Nếu cách hệ thống tạo nguồn thật đổi đi thì bài kiểm vẫn xanh, và lỗi có thể lọt tới người dùng.
  Căn cứ: 
  file: `apps/agent/test/ssct-nop-luu-tru.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E14 bước 2 gieo markdown đã thoát &amp;/&lt; viết tay thay vì để trình soạn sinh ra (r1)**
  Người dùng thấy gì: Phép đo màn mục lục dùng nội dung viết tay chứ không lấy từ trình soạn. Nếu trình soạn đổi cách lưu ký tự đặc biệt, mục lục có thể hiện sai chữ mà phép đo vẫn báo đạt.
  Căn cứ: 
  file: `_acceptance/sua-sau-chay-that/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
