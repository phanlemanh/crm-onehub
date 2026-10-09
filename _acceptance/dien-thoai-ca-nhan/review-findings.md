# Review findings: dien-thoai-ca-nhan (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phone normalisation rules are written twice: the SQL CASE in packages/db hardcodes '84' and {8,9}, separate from the SO_DIEN_THOAI config**
  Người dùng thấy gì: Cách hiểu số điện thoại được viết ở hai chỗ. Nếu sau này ai đổi luật ở một chỗ mà quên chỗ kia, việc chặn trùng số sẽ ngừng bắt được số cũ mà không báo lỗi gì.
  file: `packages/db/src/so-dien-thoai.ts`
  severity: medium
  Đề xuất: known-limits

- **Phone search silently drops matches beyond 500, chosen in no fixed order and counting archived contacts**
  Người dùng thấy gì: Gõ một đoạn số ngắn khớp với hơn 500 người thì danh sách có thể thiếu người, tổng số sai, và người đã lưu trữ chiếm chỗ của người còn dùng. Danh sách đối tượng của chiến dịch cũng có thể lặp hoặc sót người mà không có cảnh báo.
  file: `packages/db/src/so-dien-thoai.ts`
  severity: medium
  Đề xuất: known-limits

- **dem-trung.sql uses a different rule than the shipped duplicate check (no 840 trunk-zero), so it undercounts duplicate groups**
  Người dùng thấy gì: Con số "bao nhiêu nhóm người đang trùng số" mà anh đọc trước khi lên production sẽ thấp hơn thực tế, vì phép đếm hiểu số có số 0 thừa sau +84 khác với hệ thống. Chỉ ảnh hưởng quyết định dọn dữ liệu cũ, không ảnh hưởng người dùng.
  file: `_acceptance/dien-thoai-ca-nhan/rang/dem-trung.sql`
  severity: medium
  Đề xuất: known-limits

- **Typing part of a number with +84 never matches until all 9 domestic digits are typed**
  Người dùng thấy gì: Gõ dở một số bắt đầu bằng +84 vào ô tìm thì không ra ai, cho tới khi gõ đủ số; cùng các chữ số đó gõ bắt đầu bằng 0 thì tìm ra sau vài chữ số.
  file: `packages/validation/src/so-dien-thoai.ts`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 5 (tuyen quet lop nhung chi co diem-case): ma tran manh-tim khong them dong nao cho nhanh so 0 trung ke sau 84 ma soQuocNoiDeTim vua them o vong nay**
  Người dùng thấy gì: Bài kiểm chưa thử trường hợp gõ số dạng +84 kèm số 0 thừa vào ô tìm. Nếu sau này ai đó làm hỏng trường hợp này thì bài kiểm vẫn xanh và không ai biết.
  file: `packages/validation/test/so-dien-thoai.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 2 (ban chep tay khuon cua ben doc, khong rut tu ham that): dem-trung.sql giu ban chuan hoa cu, lech QUOC_NOI vua sua o vong nay**
  Người dùng thấy gì: Phép đếm số nhóm trùng trước khi lên production dùng cách hiểu số cũ, nên sẽ đếm thiếu những cặp như "+84 0907 111 222" và "0907 111 222" mà hệ thống mới coi là cùng một số.
  file: `_acceptance/dien-thoai-ca-nhan/rang/dem-trung.sql`
  severity: low
  Đề xuất: known-limits

- **SoDienThoai builds its own <a> link instead of using Link from @crm/ui** (r1)
  Người dùng thấy gì: Số điện thoại bấm gọi được vẫn chạy đúng, nhưng khi người dùng đi bằng bàn phím thì không thấy viền báo đang đứng ở số đó, và kiểu gạch chân hơi khác các chỗ khác.
  file: `apps/app/components/crm/so-dien-thoai.tsx`
  severity: medium
  Đề xuất: known-limits

- **Magic score 4 for a phone hit in Kara's lookup** (r1)
  Người dùng thấy gì: Kara vẫn tìm ra đúng người theo số. Chỉ có rủi ro nhỏ là nếu đổi cách xếp hạng kết quả sau này thì người khớp theo số có thể bị xếp lệch thứ tự.
  file: `apps/agent/agent/lib/lookup.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): test «goi-y-moi-gioi: nhan o chon» chỉ assert từ điển messages** (r1)
  Người dùng thấy gì: Có một bài kiểm chỉ đọc bảng chữ mà không nhìn màn hình, nên nó xanh nhưng không chứng minh được điều gì cho người dùng.
  file: `apps/app/test/dien-thoai-ca-nhan.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3: «không lộ số» của Kara chỉ dò khoá «phone» và chuỗi chữ số liền** (r1)
  Người dùng thấy gì: Bài kiểm chỉ bắt được trường hợp số lộ ra ở dạng liền mạch; nếu sau này số lộ ra ở dạng có dấu cách hay có +84 thì bài kiểm sẽ không phát hiện.
  file: `apps/agent/test/tim-theo-so.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dien-thoai-ca-nhan/rang/dem-trung.sql) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
