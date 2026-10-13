# Review findings: kara-mot-ten (round 2)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E14 soan-okr lấy chữ của nhánh «chưa cấu hình» làm dấu hiệu đã mở, nên không bao giờ chụp khung soạn của cuộc vừa mở**
  Người dùng thấy gì: Ảnh bằng chứng của màn Soạn OKR chỉ cho thấy thông báo «chưa bật Kara», không cho thấy khung soạn thật. Chữ trong khung soạn đang chạy vì vậy chưa được kiểm bằng ảnh, chỉ được kiểm bằng luật quét chữ.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: high
  Đề xuất: known-limits

- **chup.mjs gieo cuộc soạn bằng moCuoc ở tầng db, vòng qua SoanService.mo (không qua đường ghi thật)**
  Người dùng thấy gì: Công cụ chụp ảnh tạo thêm một cuộc soạn mẫu bằng đường tắt, không qua luật của hệ thống. Nó chỉ làm dữ liệu đo lệch một chút, không ảnh hưởng người dùng thật nếu chạy đúng lệnh bọc.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: medium
  Đề xuất: wont-fix

- **paths của E14 (và E1) thiếu kara-ban-ghi.ts, tệp vừa đổi ở vòng này và nay là nguồn dấu hiệu của màn tab Kara**
  Người dùng thấy gì: Nếu sau này ai đó sửa chữ ở tab Kara của bản ghi, hệ thống có thể vẫn coi ảnh và kiểm kê cũ là còn hiệu lực. Chữ đổi rồi có thể không bị buộc kiểm lại.
  file: `_acceptance/kara-mot-ten/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **demKet: rows with the old and new 'mồ côi' reason both map to the 'moCoi' key, and Object.fromEntries keeps only the last count**
  Người dùng thấy gì: Khi kho tài liệu có cả nguồn lỗi ghi theo câu cũ lẫn câu mới, phép đếm số nguồn kẹt vì «dừng giữa chừng» sẽ báo thấp hơn thực tế mà không báo lỗi. Người xem số liệu sau khi ra mắt có thể tưởng ít nguồn kẹt hơn.
  file: `_acceptance/kho-nguon-khong-ket/rang/dem-ket.ts`
  severity: medium
  Đề xuất: new-contract

- **kmt-giu 'ban ghim cua giu dung voi goc' passes without checking anything whenever MOC_GOC cannot be resolved, which happens every time in the CI test job**
  Người dùng thấy gì: Trên máy chạy kiểm tra tự động, phép kiểm bản ghim danh sách chữ cần đổi âm thầm bỏ qua nhưng vẫn báo xanh. Có người sửa danh sách ghim thì vẫn có thể không bị phát hiện ở bước đó.
  file: `apps/app/test/kara-mot-ten.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **E14 soan-okr only passes when Kara · OKR is NOT connected: the screen marker is the 'unconfigured' message, so the Soạn OKR frame body is never checked**
  Người dùng thấy gì: Phép kiểm màn Soạn OKR chỉ đạt khi Kara · OKR chưa được nối, và sẽ đỏ oan ở máy đã nối. Phần chữ trong khung soạn thật chưa được kiểm bằng ảnh.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): dòng kiểm sổ chi phí E14 in tên ba nhóm nhưng chỉ kiểm hai, và kiểm trên chữ của cả trang**
  Người dùng thấy gì: Phép đo sổ chi phí báo đúng cả ba nhóm nhưng thực ra chỉ kiểm hai, và kiểm trên chữ của cả trang. Nhãn «Kara · OKR» của sổ chi phí có thể sai mà phép đo vẫn xanh.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính không có đối chứng dương): E14 ở Soạn OKR lấy trạng thái «chưa cấu hình» làm dấu hiệu đã mở, nên khung soạn thật không hiện lần nào**
  Người dùng thấy gì: Phép kiểm «không còn cụm từ cấm» ở màn Soạn OKR chỉ quét thông báo chưa bật Kara. Chữ trong khung soạn đang chạy chưa được ảnh chứng minh.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (khai cả lớp nhưng chỉ có một ca): dem-ket nhận cả chữ mồ côi mới và cũ, nhưng chỉ chữ mới có hàng gieo; chữ cũ chỉ được kiểm bằng phép so hằng với chuỗi viết tay**
  Người dùng thấy gì: Phép đếm nguồn kẹt vì «dừng giữa chừng» chưa được thử với dòng ghi theo câu cũ. Nếu nó đếm sai dòng cũ thì cũng không bài kiểm nào báo.
  file: `_acceptance/kho-nguon-khong-ket/rang/dem-ket.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Tệp mẫu sinh máy LO-TRINH.mau.html bị sửa tay ngoài phạm vi, lệch thêm khỏi bộ vẽ và chạm `paths` của hai hồ sơ đã ký (r1)**
  Người dùng thấy gì: Một tệp mẫu của trang Lộ trình bị sửa lẫn vào lượt đổi tên Kara. Người dùng không thấy gì khác, nhưng hai hồ sơ cũ không liên quan sẽ phải xét lại.
  file: `apps/app/test/fixtures/lo-trinh/LO-TRINH.mau.html`
  severity: medium
  Đề xuất: known-limits

- **E14 counts the Soạn OKR screen as passing, but /okr/soan is a 404 and the committed evidence image is the 404 page (r1 · tệp đã đổi)**
  Người dùng thấy gì: Ảnh minh chứng cho màn Soạn OKR thực ra là trang báo không tìm thấy, nên chưa ai thấy tận mắt màn đó đã đổi sang tên Kara. Chữ trong sản phẩm không bị ảnh hưởng.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: high
  Đề xuất: known-limits

- **Signed UI probe man-bi-go.mjs still looks for the old 'tác nhân đang chạy' text in a file this PR edits (r1)**
  Người dùng thấy gì: Một phép kiểm màn của hồ sơ cũ còn tìm câu báo model bị gỡ theo chữ cũ, nên lần xét lại sau sẽ báo lỗi giả. Người dùng thấy câu mới đúng.
  file: `_acceptance/chat-an-toan-truoc-r1/rang/man-bi-go.mjs`
  severity: medium
  Đề xuất: known-limits

- **Signed UI probe man-tai-nguon.mjs still requires the 'Máy đang soạn' status label, which this PR renamed (r1)**
  Người dùng thấy gì: Một phép kiểm màn Tài liệu của hồ sơ cũ còn đòi nhãn «Máy đang soạn», nên lần xét lại sau sẽ báo lỗi giả. Người dùng thấy nhãn mới đúng là «Kara đang soạn».
  file: `_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): E14 chỉ kiểm 'không có cụm cấm' ở soan-okr / tai-lieu / tab-kara, lại đọc nhầm vùng `main` nên tab Kara không hề được quét (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép chụp màn chưa chứng minh chắc rằng tab Kara và màn Soạn OKR đã đúng chữ, vì nó có thể qua cả khi mở nhầm trang. Chữ thật trong sản phẩm vẫn do luật quét chữ giữ.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): 29 mục 'doi' ngoài kho chữ chỉ được đo bằng việc chuỗi cũ đã biến mất, không đòi chữ mới có «Kara» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu ai xoá một câu hoặc thay bằng chữ khác thì máy vẫn báo xanh, dù câu đó đáng lẽ phải nhắc tên Kara. Chữ hiện tại trên màn không sai.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): bảng GIU viết tay 6 dòng chỉ có vi, không phủ hết các mục 'giu' của kiem-ke và E9 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài giữ nguyên các chữ không phải tên AI chưa phủ hết, nên một số nhãn tiếng Anh có thể bị đổi nhầm thành Kara mà máy không báo.
  file: `apps/app/test/kara-mot-ten.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): E14 kiểm tiêu đề thẻ cấu hình bằng một chuỗi cũng là nhãn của sổ chi phí (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm màn Cài đặt có thể báo đạt dù tiêu đề thẻ cấu hình thiếu, vì tên nhóm ở sổ chi phí trùng chữ. Chữ trên màn không bị chỉ ra là sai.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ khoá–giá trị): đối chứng gốc của GIU chỉ là includes trên cả tệp (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài đối chiếu chữ giữ nguyên với bản gốc chỉ tìm chuỗi ở đâu đó trong tệp, nên có thể bỏ sót một nhãn bị đổi giá trị.
  file: `apps/app/test/kara-mot-ten.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3/4: kiểm 'miễn mồ côi' chỉ hỏi tệp còn được git theo dõi, không hỏi chuỗi miễn còn trong tệp (r1 · tệp đã đổi)**
  Người dùng thấy gì: Danh sách ngoại lệ có thể giữ lại một mục đã lỗi thời mà máy vẫn không báo. Người dùng không thấy khác biệt trên màn.
  file: `apps/app/test/kara-mot-ten.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: mệnh đề «trợ lý phụ» của E3 chỉ còn là kiểm có «Kara», mất phần nghĩa «trợ tác» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Câu nói về việc Kara nhờ một phần việc phụ có thể bị viết lại làm mất ý «nhờ trợ tác» mà máy vẫn báo xanh.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: danh sách CAM_VI trong chup.mjs chép tay và thiếu cụm so với CAM của luật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép chụp màn quét thiếu hai cụm chữ cũ nên có thể bỏ sót chúng, trong khi luật quét chữ chính vẫn đủ.
  file: `_acceptance/kara-mot-ten/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): cặp đột biến (e) và (f) chỉ ghim tiền tố tên tệp, không ghim khoá hay dòng (r1)**
  Người dùng thấy gì: Phép thử luật chỉ biết đỏ ở đúng tệp chứ không chỉ ra đúng câu, nên khó chắc luật bắt đúng chỗ. Người dùng không thấy khác biệt.
  file: `_acceptance/kara-mot-ten/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/kara-mot-ten/evals.yaml, _acceptance/kho-nguon-khong-ket/rang/dem-ket.ts, _acceptance/kho-nguon-khong-ket/rang/dem-ket.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
