## Trong hợp đồng

Không có finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E10 được mang sang từ lượt 2 dù chính câu expected của nó vừa đổi ở lượt này**
  Người dùng thấy gì: Phép kiểm cho điều kiện «không xoá hay sửa bài kiểm cũ» được lấy lại từ lượt trước chứ không chạy lại, dù cách chấm của nó vừa đổi. Hồ sơ trình duyệt có thể ghi «đạt» cho điều kiện này mà chưa ai đo lại theo tiêu chí mới.
  file: `_acceptance/goi-y-mo-ke-hoach/s4-args.json`
  severity: high
  Đề xuất: known-limits

- **Câu expected mới của E10 tự mâu thuẫn về mốc: «mốc ghim trong lệnh» và «lấy lúc chạy»**
  Người dùng thấy gì: Lời mô tả của một phép kiểm nội bộ có một cụm chữ cũ gây hiểu nhầm về mốc so sánh. Không ảnh hưởng người dùng tính năng, chỉ có thể làm người chấm đọc lệch một lần.
  file: `_acceptance/goi-y-mo-ke-hoach/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **Lượt 3 mang E10 sang từ lượt 2 dù chính câu expected của E10 vừa sửa, nên tiêu chí AC-10 mới không được chấm lại**
  Người dùng thấy gì: Điều kiện về bài kiểm cũ được ghi «đạt» theo cách chấm đã bị thay, nên tiêu chí mới chưa ai thật sự đo. Người duyệt cần biết con số «đạt» này chưa kiểm lại.
  file: `_acceptance/goi-y-mo-ke-hoach/s4-args.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): ngoại lệ của AC-10 chỉ khớp chuỗi con, không gắn với tệp và không đòi câu thay thế toBe(22)**
  Người dùng thấy gì: Phép kiểm chống xoá bài kiểm cũ có thể bỏ sót vài trường hợp xoá bài kiểm ngoài ngoại lệ đã ký. Nguy cơ là một bài kiểm bị xoá mà không ai thấy.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng): --tu-thu không chạy qua nhánh CHO_PHEP mà round này mới đưa vào lời hứa**
  Người dùng thấy gì: Phần tự kiểm của phép đo chưa chứng minh được rằng ngoại lệ đã ký chỉ tha đúng một câu. Nếu phép đo tha quá rộng thì nó vẫn báo xanh.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **CHO_PHEP so khớp theo chuỗi con và không gắn với tệp nào (r2)**
  Người dùng thấy gì: Phép kiểm «không ai xoá hay sửa bài kiểm cũ» có một ngoại lệ được khai hơi rộng, nên về lý thuyết một bài kiểm khác có chữ giống vậy bị xoá vẫn lọt qua. Hiện chưa có bài kiểm nào bị xoá theo cách đó.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **Răng vẫn báo «không suy từ merge-base», nhưng lệnh cổng nay truyền mốc lấy từ merge-base (r2)**
  Người dùng thấy gì: Khi phép kiểm bài kiểm cũ lỗi vì thiếu mốc so sánh, câu báo lỗi nêu sai nguyên nhân, nên người đọc có thể mất công đi tìm sai chỗ. Kết quả kiểm khi chạy bình thường không đổi.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **Lượt sửa viết thêm chú thích vào một tệp răng, trái luật không viết chú thích (r2)**
  Người dùng thấy gì: Một tệp phụ trợ của phép kiểm có thêm vài dòng ghi chú trái quy ước của kho. Không ảnh hưởng gì tới người dùng cuối.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: wont-fix

- **E10 suy mốc từ merge-base nên tự xanh rỗng khi nhánh đã nằm trong origin/onehub (r2)**
  Người dùng thấy gì: Sau khi tính năng được gộp, phép kiểm «không xoá bài kiểm cũ» có thể chạy mà không so với gì và vẫn báo đạt. Việc này chỉ ảnh hưởng độ tin cậy của lần chấm lại, không ảnh hưởng tính năng người dùng dùng.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E10 xanh vì «0 câu bị mất», không có đối chứng dương nào cho thấy lần quét thật sự đã thấy tệp và đã dùng đúng ngoại lệ duy nhất (r2)**
  Người dùng thấy gì: Phép kiểm «không xoá bài kiểm cũ» báo đạt khi không thấy gì bị mất, nhưng không tự chứng minh là nó đã thật sự quét các tệp. Nếu nó quét rỗng thì vẫn báo đạt.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ khẳng định số đếm, trong khi lời hứa là quan hệ): «du 22 loai, khong trung» chỉ đo cỡ của Set (r2)**
  Người dùng thấy gì: Bài kiểm danh sách loại thông báo chỉ đếm số lượng, nên nếu loại thông báo mới bị thay bằng tên khác hoặc có mục lặp thì bài kiểm vẫn xanh. Chức năng nhắc cho người dùng được kiểm ở chỗ khác.
  file: `packages/validation/test/thong-bao.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Chữ tiếng Việt trên màn và trong tin nhắc dùng «Deal … đã thắng», trái từ điển CONTEXT.md (r1)**
  Người dùng thấy gì: Thẻ gợi ý và tin nhắc buổi sáng gọi giao dịch là «Deal … đã thắng», khác với chữ «Thoả thuận» và «Chốt» mà phần còn lại của ứng dụng dùng. Người dùng thấy hai cách gọi cho cùng một thứ, và có chỗ còn lẫn chữ tiếng Anh «sheet».
  file: `apps/app/lib/messages/record-sheet.ts`
  severity: medium
  Đề xuất: known-limits

- **Chữ «gợi ý» trần trên màn, trái mục từ điển «Gợi ý mở kế hoạch» thêm ngay trong vòng này (r1)**
  Người dùng thấy gì: Một số câu báo cho người dùng chỉ nói «gợi ý», trong khi tên đầy đủ là «gợi ý mở kế hoạch». Người dùng có thể nhầm với câu «gợi ý» của nhắc kế hoạch im.
  file: `packages/db/src/goi-y-ke-hoach.ts`
  severity: medium
  Đề xuất: known-limits

- **companyId của gợi ý là bản chụp lúc sinh; đổi công ty của deal thì thẻ mở kế hoạch cho công ty cũ, và mở kế hoạch cho công ty mới không đóng gợi ý (r1)**
  Người dùng thấy gì: Nếu sau khi deal thắng người ta đổi công ty của deal, thẻ gợi ý vẫn đề nghị mở kế hoạch cho công ty cũ. Mở kế hoạch cho công ty mới cũng không làm gợi ý đó tự đóng, và nhắc buổi sáng vẫn ghi tên công ty cũ.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: known-limits

- **boQuaGoiY trả 404 kèm lời «Gợi ý này đã được xử lý.» khi id không tồn tại (r1)**
  Người dùng thấy gì: Nếu gợi ý không còn tồn tại, người dùng nhận lời báo «đã được xử lý» thay vì «không tìm thấy». Hiếm gặp và vô hại, chỉ là câu báo hơi lệch.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Đổi giai đoạn ngay trên sheet deal không làm mới query goiYCuaDeal, nên thẻ gợi ý không hiện sau khi thắng và không ẩn khi deal rời thắng (r1)**
  Người dùng thấy gì: Khi người phụ trách chuyển deal sang thắng ngay trên sheet đang mở, thẻ gợi ý không hiện ngay mà phải đợi khoảng nửa phút hoặc mở lại sheet. Ngược lại, deal rời thắng thì thẻ cũ vẫn còn đó một lúc.
  file: `apps/app/components/crm/record-sheet/goi-y-ke-hoach.tsx`
  severity: medium
  Đề xuất: new-contract

- **Thẻ Cổng Phạm vi xếp AC-1, AC-4 (và AC-6 ở bản HTML) vào mục «Sẽ KHÔNG làm / sẽ chặn» (r1)**
  Người dùng thấy gì: Thẻ người ký duyệt phạm vi xếp hai lời hứa chính (sinh gợi ý và đóng gợi ý) vào cột «sẽ không làm». Người ký có thể hiểu nhầm hệ thống hứa gì.
  file: `_acceptance/goi-y-mo-ke-hoach/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **dot-bien.mjs ghim thông điệp cho cặp (h) khác với thông điệp mà evals.yaml E11 đã khai (r1)**
  Người dùng thấy gì: Bằng chứng kiểm thử chứng minh một thông báo lỗi hơi khác với thông báo ghi trong mô tả. Người dùng cuối không thấy gì, nhưng người đọc hồ sơ nghiệm thu có thể bối rối.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: ô «đọc rỗng» của bảng quyền E3 coi mọi phản hồi lỗi là null, không ghim giá trị trả về (r1)**
  Người dùng thấy gì: Bài kiểm quyền đọc chưa phân biệt được «người khác nhận về trống» với «thủ tục bị lỗi». Nếu có lỗi, bài kiểm có thể vẫn xanh.
  file: `apps/api/test/goi-y-mo-ke-hoach.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/goi-y-mo-ke-hoach/s4-args.json, _acceptance/goi-y-mo-ke-hoach/evals.yaml, _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
