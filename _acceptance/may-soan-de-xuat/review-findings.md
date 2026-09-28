## Trong hợp đồng

### Hai lượt nhận đồng thời với cùng pathname/phiếu vẫn xoá được tệp của nguồn vừa tạo (kiểm rồi mới làm, không nguyên tử)
- file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts:141`
- severity: medium
- AC: AC-16

Vòng này thêm vào `nhan` bước `findUnique({ where: { blobPathname } })` để từ chối pathname đã thuộc về một TaiLieuNguon. Dòng mới trong docs/api.md mô tả bước này là «refuses a pathname that already belongs to a TaiLieuNguon, before it reads or deletes anything». Nhưng đây là kiểm rồi mới làm, không nguyên tử. Giữa lúc kiểm và lúc ghi còn một lượt đọc blob qua mạng (`kho.doc`), nên khoảng hở khá rộng.

Cách xảy ra: người dùng A gửi hai lần `taiLieuNguon.nhan` với cùng `{pathname: P, phieu}` hợp lệ, ví dụ do bấm hai lần hoặc client gửi lại.
- Lượt 1 qua bước kiểm `daCo` rồi tạo hàng TaiLieuNguon có blobPathname = P.
- Lượt 2 đã qua bước kiểm `daCo` trước khi lượt 1 commit. Nó đọc cùng bytes, cùng sha256, rồi rơi vào một trong hai nhánh: `nguonTheoBam` trả hàng của lượt 1, được `{trung: true}`, và dòng 163 gọi `kho.xoa(P)`; hoặc `create` chạm unique `sha256`/`blobPathname`, rơi vào `catch` ở ghiNguon rồi `nhan` (dòng 166-167), cũng gọi `kho.xoa(P)`.

Kết quả: hàng TaiLieuNguon của lượt 1 còn đó nhưng blob đã bị xoá. Máy soạn và nút tải về sẽ không đọc được tệp. Như vậy bất biến AC-16 mà docs/api.md vừa ghi («knowing a source's pathname is not enough to delete its file») chỉ đúng khi các lượt gọi chạy tuần tự.

Muốn nguyên tử cần một trong hai cách: dùng phiếu một lần (đánh dấu đã tiêu phiếu trong cùng giao dịch), hoặc chỉ xoá blob khi chắc chắn pathname P không thuộc hàng nào (kiểm lại blobPathname ngay trước `kho.xoa`, hay bắt P2002 trên `blobPathname` riêng rồi không xoá).

### nhan: TOCTOU giữa kiểm 'đường lưu chưa thuộc nguồn nào' và nhánh trung → xoá tệp Blob của nguồn vừa ghi (AC-16 hở khi gọi đồng thời)
- file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts:144`
- severity: medium
- AC: AC-16

Chặn AC-16 mới dựa vào `findUnique({ where: { blobPathname } })` ở dòng 144-148, chạy TRƯỚC `kho.doc` (một lần đọc qua mạng) và `kiemDich`. Việc kiểm và việc ghi không được khoá chung. Kịch bản: cùng một người gửi hai lời `taiLieuNguon.nhan` đồng thời với cùng pathname và phiếu hợp lệ của chính họ (gửi lại, hay cố ý phát lại; phiếu còn hạn 60 phút và không dùng một lần). Cả hai lời qua được `daCo` (lúc đó chưa có hàng nào). Lời A commit `TaiLieuNguon{blobPathname: P, sha256: S}`. Lời B sau đó đi vào `ghiNguon`: hoặc `nguonTheoBam(S)` thấy hàng của A, hoặc `create` ném P2002 (trùng `sha256`/`blobPathname`) rồi nhánh bắt lỗi dòng 232-235 lại tìm ra A. Kết quả B là `{ trung: true }`, nên dòng 163 `await this.kho.xoa(input.pathname)` xoá đúng tệp P, tức tệp của nguồn A vừa ghi. Hàng A còn trong CSDL nhưng tệp Blob đã mất: `taiVe` trả URL ký tới một tệp không còn, và máy soạn đọc nguồn thì hỏng. Đây đúng là lớp lỗi AC-16 hứa chặn («nhận nguồn không xoá tệp của nguồn đã có»); test `tai-lieu-nguon-cua-ai.spec.ts` chỉ chạy tuần tự nên không bắt được. Nhánh trung chỉ nên xoá khi hàng tìm thấy có `blobPathname !== input.pathname`; hoặc coi P2002 trên `blobPathname` là từ chối mà không xoá; hoặc dùng phiếu một lần.

### Hình dạng 5 (tuyên quét lớp nhưng thiếu ô): lớp «đường lưu đã thuộc về một nguồn có sẵn» của AC-16 không có ô nào đi qua được phiếu, nên chặn daCo không được đo
- file: `apps/api/test/tai-lieu-nguon-cua-ai.spec.ts:87`
- severity: high
- AC: AC-16

AC-16 hứa hai lớp từ chối riêng: (a) đường lưu đã thuộc về một nguồn có sẵn, (b) đường lưu không do lần xin chỗ của chính người gọi cấp. Service có hai chặn tương ứng: kiemPhieu (tai-lieu-nguon.service.ts:137-143) và `findUnique({ where: { blobPathname } }) → if (daCo) throw` (144-148). Cả 6 ca trong mảng CA (dòng 87-141) đều gọi nhan không có phiếu hợp lệ: p1 = { pathname } không mang phiếu, nên nhan gửi PHIEU_GIA; «khac-chua-cap» cũng dùng PHIEU_GIA; «khac-phieu-cua-tao» là phiếu của T mà K gửi. Ca nào cũng bị kiemPhieu bác trước khi tới daCo. Ma trận không có ô người tải T gọi lại nhan bằng chính choN1 (phiếu hợp lệ, còn hạn 60 phút, dòng 75) với đích sai hay trùng byte. Đây là ô duy nhất mà chỉ daCo cứu được P1: bỏ chặn này thì luồng catch gọi kho.xoa(P1). Vì vậy xoá riêng chặn daCo thì E16 vẫn xanh. CHIỀU ĐỎ khai ở evals.yaml:470 («bản sao bỏ kiểm đường lưu → ca đầu đỏ với thông điệp ghim 'xoa tep nguon cua nguoi khac'») cũng không xảy ra khi bỏ một chặn đơn lẻ. Bỏ daCo: ca đầu bị phiếu bác, vẫn xanh. Bỏ kiemPhieu: ca đầu bị daCo bác, vẫn xanh; chỉ «khac-chua-cap» đỏ với 'xoa la …', không phải thông điệp ghim. Thông điệp ghim chỉ hiện khi bỏ cả hai chặn.

### Hình dạng 3 (chỉ kiểm có chuỗi trong khi lời hứa là quan hệ): taiVe chỉ được kiểm URL khác rỗng; byte đọc lén từ kho giả; không đo đường đọc của máy soạn
- file: `apps/api/test/tai-lieu-nguon-cua-ai.spec.ts:166`
- severity: medium
- AC: AC-16

AC-16 hứa tệp của nguồn có sẵn «tải về đúng byte có mã băm của hàng, và máy soạn vẫn đọc được tệp đó». evals.yaml E16 ghi «taiVe(N1) boi T tra URL ky, byte doc ve ... co sha256 bang hang N1 (duong doc cua may soan khong ve LOI 'khong tai duoc')». Test chỉ có `expect(ve.url.length).toBeGreaterThan(0)` ở dòng 166. URL do taiVe trả về không được nối với byte nào: không kiểm URL trỏ tới hangN1.blobPathname (kho giả trả `${GOC_GIA}/get/${pathname}`, kiểm được mà test không kiểm). Byte ở dòng 167 lấy thẳng bằng `gia.doc(hangN1.blobPathname)`, tức đọc Map bên trong kho giả, đi vòng qua đầu ra của taiVe. Nếu taiVe ký nhầm đường lưu hay trả URL của tệp khác, test vẫn xanh. Vế «máy soạn vẫn đọc được» không có lời gọi nào tới đường đọc của apps/agent, mà eval lại ghi là có đo.

### Hình dạng 5 (tuyên quét lớp nhưng thiếu ô): vế «chỉ xoá tệp vừa tải» của AC-16 nêu ba lý do (sai loại, đích sai, trùng byte) nhưng E16 chỉ có ô đích sai
- file: `apps/api/test/tai-lieu-nguon-cua-ai.spec.ts:129`
- severity: medium
- AC: AC-16

AC-16 hứa: «khi một lần nhận hợp lệ của chính người gọi bị từ chối vì lý do khác (sai loại, đích sai, trùng byte), máy chỉ xoá tệp vừa tải trong chính lượt đó». Trong E16, ca duy nhất có lần nhận hợp lệ của chính người gọi là «doi-chung-khac-tu-xin» (dòng 129), với DICH_SAI. Chỉ ca này có phép kiểm tính độc nhất (`daXoa.filter((x) => x !== duocXoa)`). Ca «khac-p1-trung-byte» mang tên trùng byte nhưng bị phiếu bác trước khi tới nhánh trùng, nên không đi qua đường `if (kq.trung) await this.kho.xoa(...)`. Không ô nào có sai loại. Các ca sai loại và trùng byte cũ ở tai-lieu-nguon.spec.ts (nguon-tu-choi, nguon-trung) chỉ kiểm `expect(gia.daXoa).toContain(pathname)`. Chúng không kiểm tệp của nguồn N1 có sẵn còn nguyên, cũng không kiểm không xoá gì ngoài tệp vừa tải. Lớp ba lý do mới đo được một ô.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **soan-that.mjs silently drops console and page errors from the review-screen captures (r2)**
  Người dùng thấy gì: Nếu màn duyệt gặp lỗi ẩn khi hiển thị, phép đo vẫn báo đạt và ảnh chụp vẫn được tính là bằng chứng sạch, nên một lỗi thật ở màn duyệt có thể không ai phát hiện.
  file: `_acceptance/may-soan-de-xuat/rang/soan-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **The 'Changes against the page in use' card diffs against banGoc, not the page currently in use (r2)**
  Người dùng thấy gì: Nếu một đề xuất khác được duyệt trong lúc bản máy soạn đang chờ, thẻ 'Thay đổi so với bản đang dùng' có thể vẫn so sánh với bản cũ hơn, khiến người duyệt hiểu sai về những gì thực sự sắp thay đổi.
  file: `apps/app/app/(app)/[slug]/tai-lieu/de-xuat/[id]/man-duyet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cờ coBanGoc được đặt tay, không đi qua page.tsx (r2)**
  Người dùng thấy gì: Chưa có phép đo nào xác nhận máy suy đúng lúc nào cần hiện khối so sánh với bản đang dùng, nên nếu logic đó tính sai trong thực tế, người duyệt có thể không thấy cảnh báo đáng ra phải có.
  file: `apps/app/test/tai-lieu-man-duyet-may.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» trong khi lời hứa là quan hệ): khối so với bản đang dùng chỉ được kiểm là có chứa "1,2%" (r2)**
  Người dùng thấy gì: Bằng chứng hiện chỉ xác nhận có chữ '1,2%' xuất hiện đâu đó trên màn, chứ chưa xác nhận đúng số cũ bị gạch bỏ và số mới được thêm vào đúng chỗ, nên một lỗi hiển thị đảo ngược hai giá trị có thể lọt qua mà không ai biết.
  file: `apps/app/test/tai-lieu-man-duyet-may.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): tiền tố «crm:» của token kênh viết tay, không lấy từ bên viết là eve (r2)**
  Người dùng thấy gì: Giả định về cách hệ thống ghi token phiên có thể không khớp thực tế, và nếu cách ghi đó đổi, việc tự động đóng phiên máy soạn khi gặp lỗi có thể lặng lẽ ngừng hoạt động mà không ai nhận ra ngay.
  file: `apps/agent/test/crm-token.spec.ts`
  severity: low
  Đề xuất: known-limits

- **New mutations invalidate taiLieuNguon.list by key at the call site instead of through useCrmCache (r1)**
  Người dùng thấy gì: Danh sách nguồn hiện vẫn được làm mới đúng sau khi soạn lại hay nhận tệp mới; rủi ro chỉ là nếu sau này ai đó đổi cách làm mới dữ liệu ở nơi khác mà quên chỗ này, người dùng có thể thấy danh sách cũ cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/tai-lieu/bang-nguon.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tunable limits and user-facing reasons defined beside their first use, outside the area's config object (r1)**
  Người dùng thấy gì: Không ảnh hưởng tới người dùng; đây chỉ là chỗ đặt vài con số và câu thông báo trong mã chưa gọn theo quy ước nội bộ, không gây lỗi khi dùng sản phẩm.
  file: `apps/agent/agent/lib/tai-lieu-soan.ts`
  severity: low
  Đề xuất: known-limits

- **The file-type to MIME map that the signed PUT depends on is duplicated in two packages (r1)**
  Người dùng thấy gì: Nếu hai danh sách loại tệp được chấp nhận (ở màn tải lên và ở nơi ký quyền lưu tệp) sau này lệch nhau, người dùng có thể gặp lỗi tải lên chung chung thay vì một thông báo rõ ràng.
  file: `apps/app/lib/tai-lieu-man.ts`
  severity: low
  Đề xuất: known-limits

- **Source stuck in CHO_DOC forever when chaySoanTuNguon throws; 'Draft again' refuses it (r1)**
  Người dùng thấy gì: Một trục trặc tạm thời khi máy đọc tệp vừa tải lên (ví dụ lỗi lưu trữ thoáng qua) có thể khiến màn hình treo mãi ở trạng thái 'đang soạn', không có cách nào bấm soạn lại.
  file: `apps/agent/agent/lib/tai-lieu-soan.ts`
  severity: high
  Đề xuất: new-contract

- **Timeout sweep uses the same 4-minute budget as the subagent but starts counting earlier (r1)**
  Người dùng thấy gì: Một bản đang được máy soạn hợp lệ có thể đôi khi bị đánh dấu 'hết giờ' hơi sớm, khiến lượt soạn đó bị bỏ phí dù chưa thực sự quá hạn.
  file: `apps/agent/agent/lib/tai-lieu-config.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts a substring is present when the promise is an exact whole-number match): the bien-1-5 case cannot fail (r1)**
  Người dùng thấy gì: Phép kiểm cho quy tắc 'số 1,5 không được tính là khớp với số 11,5' hiện chưa chắc chắn sẽ bắt được lỗi nếu lỗi đó thật sự xảy ra — nếu có sai sót, bản đề xuất có thể trích nhầm số mà không bị chặn lại.
  file: `apps/agent/test/nop-ban-de-xuat.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to the reader): cid.pdf has no '(cid:' text layer; it maps to the private-use range to hit the reader's other branch (r1)**
  Người dùng thấy gì: Ca kiểm 'tệp PDF có lớp chữ hỏng kiểu cid' hiện không thật sự tạo ra đúng dạng hỏng đó, nên khả năng máy nhận diện đúng dạng lỗi này trên tệp thật chưa được chứng minh chắc chắn.
  file: `apps/agent/test/dung-mau-tai-lieu.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (reads source code instead of output): sandbox deny-all is checked by counting a string in sandbox.ts (r1)**
  Người dùng thấy gì: Phép kiểm 'máy soạn không được ra mạng ngoài' hiện chỉ đếm chữ trong mã nguồn thay vì đọc đúng cấu hình mà hệ thống dùng lúc chạy — nếu cấu hình thật sự lệch, phép kiểm có thể không phát hiện.
  file: `apps/agent/test/tai-lieu-ranh-gioi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **New mutations invalidate taiLieuNguon.list by key at the call site instead of through useCrmCache (r1)**
  Người dùng thấy gì: Danh sách nguồn hiện vẫn được làm mới đúng sau khi soạn lại hay nhận tệp mới; rủi ro chỉ là nếu sau này ai đó đổi cách làm mới dữ liệu ở nơi khác mà quên chỗ này, người dùng có thể thấy danh sách cũ cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/tai-lieu/bang-nguon.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tunable limits and user-facing reasons defined beside their first use, outside the area's config object (r1)**
  Người dùng thấy gì: Không ảnh hưởng tới người dùng; đây chỉ là chỗ đặt vài con số và câu thông báo trong mã chưa gọn theo quy ước nội bộ, không gây lỗi khi dùng sản phẩm.
  file: `apps/agent/agent/lib/tai-lieu-soan.ts`
  severity: low
  Đề xuất: known-limits

- **The file-type to MIME map that the signed PUT depends on is duplicated in two packages (r1)**
  Người dùng thấy gì: Nếu hai danh sách loại tệp được chấp nhận (ở màn tải lên và ở nơi ký quyền lưu tệp) sau này lệch nhau, người dùng có thể gặp lỗi tải lên chung chung thay vì một thông báo rõ ràng.
  file: `apps/app/lib/tai-lieu-man.ts`
  severity: low
  Đề xuất: known-limits

- **Source stuck in CHO_DOC forever when chaySoanTuNguon throws; 'Draft again' refuses it (r1)**
  Người dùng thấy gì: Một trục trặc tạm thời khi máy đọc tệp vừa tải lên (ví dụ lỗi lưu trữ thoáng qua) có thể khiến màn hình treo mãi ở trạng thái 'đang soạn', không có cách nào bấm soạn lại.
  file: `apps/agent/agent/lib/tai-lieu-soan.ts`
  severity: high
  Đề xuất: new-contract

- **drainMaySoan drops every send error without logging it (r1)**
  Người dùng thấy gì: Nếu máy soạn không mở được phiên làm việc, người dùng chỉ thấy một thông báo lỗi chung; đội vận hành sẽ khó truy ra nguyên nhân thật sự nếu lỗi lặp lại nhiều lần.
  file: `apps/agent/agent/lib/tai-lieu-phien.ts`
  severity: low
  Đề xuất: known-limits

- **Timeout sweep uses the same 4-minute budget as the subagent but starts counting earlier (r1)**
  Người dùng thấy gì: Một bản đang được máy soạn hợp lệ có thể đôi khi bị đánh dấu 'hết giờ' hơi sớm, khiến lượt soạn đó bị bỏ phí dù chưa thực sự quá hạn.
  file: `apps/agent/agent/lib/tai-lieu-config.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts a substring is present when the promise is an exact whole-number match): the bien-1-5 case cannot fail (r1)**
  Người dùng thấy gì: Phép kiểm cho quy tắc 'số 1,5 không được tính là khớp với số 11,5' hiện chưa chắc chắn sẽ bắt được lỗi nếu lỗi đó thật sự xảy ra — nếu có sai sót, bản đề xuất có thể trích nhầm số mà không bị chặn lại.
  file: `apps/agent/test/nop-ban-de-xuat.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 1 (reads source code instead of output): the API half of 'both paths go through one write function' is checked by grepping an import string, not by a spy (r1)**
  Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng đề xuất tạo từ màn nhập tay và đề xuất do máy soạn tạo luôn được lưu theo đúng cùng một cách — nếu hai nơi lệch nhau, dữ liệu đề xuất có thể không nhất quán mà không ai phát hiện qua phép kiểm hiện tại.
  file: `apps/agent/test/tai-lieu-soan.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to the reader): cid.pdf has no '(cid:' text layer; it maps to the private-use range to hit the reader's other branch (r1)**
  Người dùng thấy gì: Ca kiểm 'tệp PDF có lớp chữ hỏng kiểu cid' hiện không thật sự tạo ra đúng dạng hỏng đó, nên khả năng máy nhận diện đúng dạng lỗi này trên tệp thật chưa được chứng minh chắc chắn.
  file: `apps/agent/test/dung-mau-tai-lieu.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (reads source code instead of output): sandbox deny-all is checked by counting a string in sandbox.ts (r1)**
  Người dùng thấy gì: Phép kiểm 'máy soạn không được ra mạng ngoài' hiện chỉ đếm chữ trong mã nguồn thay vì đọc đúng cấu hình mà hệ thống dùng lúc chạy — nếu cấu hình thật sự lệch, phép kiểm có thể không phát hiện.
  file: `apps/agent/test/tai-lieu-ranh-gioi.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
