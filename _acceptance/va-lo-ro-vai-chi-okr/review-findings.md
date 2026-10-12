# Review findings: va-lo-ro-vai-chi-okr (round 1)

## Trong hợp đồng

Không có phát hiện nào map được vào một AC của hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Changing a role does not refresh the new onboarding.nguoiNhanViec list, so the picker can disagree with the server**
  Người dùng thấy gì: Ngay sau khi quản trị đổi vai một người sang hoặc khỏi «chỉ OKR», ô chọn người nhận việc có thể còn hiện danh sách cũ tới khoảng nửa phút. Chọn nhầm người vai «chỉ OKR» thì hệ thống vẫn từ chối kèm lời giải thích, nên không có dữ liệu nào bị giao sai.
  file: `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx`
  severity: medium
  Đề xuất: known-limits

- **A second copy of the partner-data role rule in @crm/db, with an inline magic constant, although @crm/db already has one**
  Người dùng thấy gì: Quy tắc «vai nào được xem dữ liệu đối tác» hiện nằm ở nhiều nơi. Hôm nay chúng khớp nhau, nhưng nếu sau này đổi quy tắc mà sót một nơi thì người vai «chỉ OKR» có thể lại thấy tên đối tác ở chỗ chưa được sửa.
  file: `packages/db/src/vai-doi-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **demViecDangGiu repeats the body of OnboardingGhi.transferPreview**
  Người dùng thấy gì: Con số «đang giữ bao nhiêu việc» ở lời từ chối đổi vai và con số ở màn xem trước «Chuyển việc» hiện được đếm bằng hai đoạn mã giống nhau. Hôm nay hai số khớp; nếu sau này chỉ sửa một nơi, quản trị có thể thấy hai con số khác nhau cho cùng một người.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Mở lại kế hoạch hoặc bỏ «xong» một bước làm người vai «chỉ OKR» giữ việc mở trở lại**
  Người dùng thấy gì: Nếu ai đó mở lại một kế hoạch đã đóng, hoặc bỏ dấu «xong» của một bước cũ sau khi người phụ trách đã được chuyển sang vai «chỉ OKR», kế hoạch hay bước đó lại nằm trong tay người này. Người vai «chỉ OKR» không nhận nhắc việc kế hoạch nên việc có thể trễ hạn mà không ai được báo, và con số kiểm tra «còn việc kế hoạch trong tay người vai chỉ OKR» sẽ lại khác 0.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: medium
  Đề xuất: new-contract

- **Danh sách nguoiNhanViec trong cache không làm mới sau khi đổi vai**
  Người dùng thấy gì: Sau khi đổi vai một người trên màn Thành viên, các ô chọn người nhận việc có thể còn hiện danh sách cũ tới khoảng nửa phút: người vừa chuyển sang «chỉ OKR» vẫn được mời chọn, người vừa trở lại vai thường thì chưa thấy. Chọn sai thì hệ thống từ chối, không lọt dữ liệu.
  file: `apps/app/lib/trpc/cache.ts`
  severity: low
  Đề xuất: known-limits

- **Bài kiểm nuốt lỗi của chayNhac bằng .catch(() => undefined)**
  Người dùng thấy gì: Một bài kiểm tự động về tin nhắc buổi sáng có thể báo xanh dù bước gửi tin bị lỗi giữa chừng. Hiện chưa có lỗi sản phẩm nào bị che, nhưng nếu sau này việc gửi tin hỏng thì bài kiểm này chưa chắc báo đỏ.
  file: `apps/agent/test/nhac-vai-chi-okr.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm-tính-một-mình: E7b đo okr.viecCuaToi bằng hai phép phủ định không thể đỏ**
  Người dùng thấy gì: Phần kiểm tra thẻ «Việc của bạn» của người vai «chỉ OKR» hiện không thể báo đỏ trong bất kỳ trường hợp nào. Thẻ đó hôm nay không lộ việc kế hoạch, nhưng nếu sau này ai làm lộ ra thì bài kiểm này vẫn xanh, và phần này của tiêu chí chưa có bằng chứng chạy thật.
  file: `apps/api/test/vai-chi-okr-ke-hoach.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: hàng agentTask 'nhac-ke-hoach' của E10 không đi qua lenLichNhac/chayNhac**
  Người dùng thấy gì: Con số «tin nhắc đã mang tên đối tác tới người vai chỉ OKR» đo trên production được kiểm thử bằng dữ liệu dựng tay, không phải dữ liệu do bộ gửi nhắc sinh ra. Nếu cách ghi lịch sử nhắc việc đổi khuôn, con số đo có thể về 0 dù vẫn còn tin gửi đi mà bài kiểm vẫn xanh.
  file: `apps/api/test/ro-vai-chi-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên quét lớp nhưng chỉ có điểm-case: vân tay 'không ghi vào kho' của E10 chỉ chụp 1 trong 4 người của ca**
  Người dùng thấy gì: Bài kiểm xác nhận công cụ đo không làm thay đổi dữ liệu mới chỉ đối chiếu dữ liệu của một người trong bốn người của ca thử và chỉ ở lần chạy đầu. Công cụ này được thiết kế chỉ đọc, nên rủi ro thấp, nhưng nếu nó vô tình ghi vào dữ liệu của người khác thì bài kiểm có thể không phát hiện.
  file: `apps/api/test/ro-vai-chi-okr.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm-tính-một-mình: vế 'không tin nào gửi tới họ' của AC-8 nuốt lỗi chayNhac và không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm «không gửi tin nhắc cho người vai chỉ OKR chỉ có việc kế hoạch» chỉ chắc chắn ở phần không tạo lịch nhắc cho họ. Phần «không tin nào tới tay họ» có thể xanh một cách rỗng nếu bước gửi tin bị lỗi, nên chưa chứng minh được bằng chạy thật rằng Zalo không nhận gì.
  file: `apps/agent/test/nhac-vai-chi-okr.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
