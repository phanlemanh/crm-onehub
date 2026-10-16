# Review findings: goi-y-mo-ke-hoach (round 2)

## Trong hợp đồng

- **Danh sách cho-phép của răng hồi quy E10 nay có một câu, trái với chữ của E10 và AC-10 đã ký**
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs:34`
  severity: medium
  source: conventions
  AC: AC-10
  detail: Lượt này đổi `const CHO_PHEP = []` thành `["expect(new Set(LOAI_THONG_BAO).size).toBe(21)"]`. Trong khi đó evals.yaml E10 (dòng 109) vẫn ghi `expected: ... danh sách cho-phép rỗng`, còn contract.md AC-10 ghi «không `expect` nào bị xoá hay sửa ở các tệp kiểm đã có». Ngoại lệ chỉ được ghi ở decisions.jsonl (d-...-20) và trong một chú thích trong răng. Tiêu chí đã ký thì không đổi theo. Hệ quả: E10 chuyển xanh nhờ nới chính thước đo, còn chữ `expected` mà người ký Cổng Bằng chứng đọc thì vẫn nói danh sách rỗng. Việc đổi toBe(21) thành toBe(22) trong packages/validation/test/thong-bao.spec.ts chính là việc AC-10 cấm. Muốn có ngoại lệ thì phải ghi nó lên chính tiêu chí, đi qua đường sửa hồ sơ sau ký của kit. Không thì phải đổi bài kiểm cho số đếm không bị ghim cứng.

- **Danh sách cho-phép không còn rỗng, trái AC-10 và câu expected của E10**
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs:34`
  severity: medium
  source: bugs
  AC: AC-10
  detail: Commit bee3c52ed thêm `CHO_PHEP = ["expect(new Set(LOAI_THONG_BAO).size).toBe(21)"]` và đổi expect sẵn có ở packages/validation/test/thong-bao.spec.ts từ 21 lên 22. AC-10 trong contract.md hứa «không expect nào bị xoá hay sửa ở các tệp kiểm đã có». Câu expected của E10 trong evals.yaml (không đổi ở vòng này) ghi thẳng «danh sách cho-phép rỗng». Vậy răng đã được nới để cho qua đúng chỗ vi phạm mà nó phải bắt: chạy thật cho ra `1 tep · 8 cau expect san co · 1 cau cho phep mat`, mã thoát 0. Contract và evals không ghi chỗ rẽ này, nên người chấm đọc expected sẽ tưởng không có ngoại lệ nào. Thêm nữa, phép so ở dòng 83 là `c.includes(m)`, tức khớp chuỗi con, và áp lên mọi tệp chứ không riêng thong-bao.spec.ts. Hướng sửa: hoặc khai giới hạn qua sổ hay contract theo đường của kit, hoặc giữ danh sách rỗng và coi đây là thay đổi phải duyệt. Đừng nới răng một cách im lặng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **CHO_PHEP so khớp theo chuỗi con và không gắn với tệp nào**
  Người dùng thấy gì: Phép kiểm «không ai xoá hay sửa bài kiểm cũ» có một ngoại lệ được khai hơi rộng, nên về lý thuyết một bài kiểm khác có chữ giống vậy bị xoá vẫn lọt qua. Hiện chưa có bài kiểm nào bị xoá theo cách đó.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **Răng vẫn báo «không suy từ merge-base», nhưng lệnh cổng nay truyền mốc lấy từ merge-base**
  Người dùng thấy gì: Khi phép kiểm bài kiểm cũ lỗi vì thiếu mốc so sánh, câu báo lỗi nêu sai nguyên nhân, nên người đọc có thể mất công đi tìm sai chỗ. Kết quả kiểm khi chạy bình thường không đổi.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **Lượt sửa viết thêm chú thích vào một tệp răng, trái luật không viết chú thích**
  Người dùng thấy gì: Một tệp phụ trợ của phép kiểm có thêm vài dòng ghi chú trái quy ước của kho. Không ảnh hưởng gì tới người dùng cuối.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: wont-fix

- **E10 suy mốc từ merge-base nên tự xanh rỗng khi nhánh đã nằm trong origin/onehub**
  Người dùng thấy gì: Sau khi tính năng được gộp, phép kiểm «không xoá bài kiểm cũ» có thể chạy mà không so với gì và vẫn báo đạt. Việc này chỉ ảnh hưởng độ tin cậy của lần chấm lại, không ảnh hưởng tính năng người dùng dùng.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E10 xanh vì «0 câu bị mất», không có đối chứng dương nào cho thấy lần quét thật sự đã thấy tệp và đã dùng đúng ngoại lệ duy nhất**
  Người dùng thấy gì: Phép kiểm «không xoá bài kiểm cũ» báo đạt khi không thấy gì bị mất, nhưng không tự chứng minh là nó đã thật sự quét các tệp. Nếu nó quét rỗng thì vẫn báo đạt.
  file: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ khẳng định số đếm, trong khi lời hứa là quan hệ): «du 22 loai, khong trung» chỉ đo cỡ của Set**
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

- **Hình dạng 4: ô «đọc rỗng» của bảng quyền E3 coi mọi phản hồi lỗi là null, không ghim giá trị trả về (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm quyền đọc chưa phân biệt được «người khác nhận về trống» với «thủ tục bị lỗi». Nếu có lỗi, bài kiểm có thể vẫn xanh.
  file: `apps/api/test/goi-y-mo-ke-hoach.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
