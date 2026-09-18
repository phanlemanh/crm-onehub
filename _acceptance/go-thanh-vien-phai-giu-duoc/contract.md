---
schema_version: 1
feature: Gỡ một thành viên thì phải giữ được — ba chỗ chưa ai canh sau lượt gỡ
slug: go-thanh-vien-phai-giu-duoc
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-09-18
---

# Acceptance Contract: go-thanh-vien-phai-giu-duoc

## Context

**Bản nháp đầu của hợp đồng này viết sai tiền đề, đã sửa 18/09.** Nó nói rằng gỡ
một thành viên để lại dòng lời mời còn sống, nên lượt đăng nhập kế tiếp cấp lại
quyền. Mã không như vậy, và đã không như vậy từ trước khi hợp đồng được viết:
`removeMember` xoá dòng thành viên, xoá phiên, VÀ thu hồi lời mời — cả ba trong
MỘT giao dịch. Commit thêm khối ấy tên là `feat(api): go mot thanh vien la mot
viec tron ven`.

Bản nháp sai vì nó suy từ một finding trong khối Ngoài-hợp-đồng của hồ sơ khác
thay vì đọc mã. Finding nói đúng về `ensureWorkspaceMembership` — hàm ấy đúng là
tạo lại thành viên khi phép kiểm cho phép — nhưng không biết rằng lượt gỡ đã thu
hồi lời mời, nên phép kiểm không cho phép nữa.

**Ba tiêu chí của bản nháp đã được kho làm và đo sẵn**, thuộc hồ sơ
`cho-phep-ai-vao-o-man-hinh` (đã ký 16/09):

- «đăng nhập lại không tạo lại thành viên» → bài `go xong thi dang nhap lai KHONG
  tu thanh vien lan nua`, eval `cp_go_tron_ven`
- «gỡ là một việc trọn vẹn» → `removeMember` một giao dịch, bài `go mot thanh vien
  cung rut loi cho phep cua ho`, eval `cp_chu_cuoi_cung`
- «không có trạng thái nửa vời» → bài `NGUYEN TU: lenh ghi thu hai hong thi ca hai
  cung khong xay ra`, cùng eval `cp_go_tron_ven`

Hợp đồng này nay chỉ giữ phần **chưa ai canh**.

## Criteria

- AC-1: Given một người đã bị gỡ khỏi workspace, When họ gọi BẤT KỲ thủ tục quản trị nào của dịch vụ workspace, Then thủ tục ấy TỪ CHỐI. Phép đo phải là MA TRẬN TOÀN PHẦN viết trước trên tập thủ tục quản trị, mỗi thủ tục một hàng và mỗi hàng hai chiều trên cùng cữ liệu — trước khi gỡ thì qua, sau khi gỡ thì bị từ chối. Phép đo gọi thủ tục THẬT, không dừng ở hàm trợ giúp tra vai.
- AC-2: Given một phiên đang mở của người sắp bị gỡ, When lượt gỡ chạy, Then phiên đó MẤT QUYỀN trong một khoảng đã KHAI THÀNH SỐ. Hợp đồng khai số ấy là **tức thì, bằng 0 giây**. Phép đo phải hỏi ĐÚNG CỬA mà ứng dụng hỏi — `auth.api.getSession` với cookie của chính phiên ấy — chứ không đếm số dòng trong bảng phiên: xoá một dòng và mất quyền là hai mệnh đề khác nhau, và mọi lớp đệm nằm giữa đều làm chúng tách ra.
- AC-3: Given bảng thành viên của workspace rỗng, When một người đăng nhập, Then đường kết nạp mồi KHÔNG được cấp tư cách thành viên cho người mà lời mời đang ở trạng thái kết thúc. Đường mồi hiện nay kết nạp MỌI người dùng đang có và trao vai owner cho người cũ nhất mà không hỏi bảng lời mời một câu nào.

## Coverage

- **A — lớp chặn:** thủ tục API · dòng thành viên · dòng phiên · đường kết nạp mồi  [thước CE: `removeMember`, `ensureWorkspaceMembership`, bốn thủ tục của `WorkspaceService`]
- **B — thời điểm:** ngay trong lượt gỡ · lượt đăng nhập kế tiếp · phiên đang mở sẵn  [thước CE: giao dịch của `removeMember`, móc `before` của `auth.ts`]
- **C — trạng thái để lại:** dòng thành viên · dòng phiên · dòng lời mời · thứ thủ tục danh sách trả về  [thước CE: ba bảng và một thủ tục]

Ba trục trên đều có thước CE là vật có thật trong kho, không dòng nào `[CE chưa kiểm chứng]`.

## Out of scope

- **Thứ màn quản trị hiện sau lượt gỡ.** Vế lời mời chính là bài đã ký `go mot thanh vien cung rut loi cho phep cua ho` (eval `cp_chu_cuoi_cung`), vế danh sách thành viên là hệ quả của việc xoá dòng mà `cp_go_tron_ven` đã canh. Giữ nó ở đây sẽ tạo eval trùng với eval đã ký — đúng điều gạch đầu dòng dưới cấm.
- **Ba tiêu chí của bản nháp đã được `cho-phep-ai-vao-o-man-hinh` bao.** Chứng lại chúng ở đây sẽ tạo eval trùng với eval đã ký — xem mục Context.
- **Sửa phép kiểm cho phép.** Đó là hồ sơ `loi-moi-da-huy-van-cho-vao`, đã ký và merge 18/09 (`fb38472b`).
- **Nhật ký kiểm toán cho lượt gỡ.** Đáng có, nhưng là việc khác.

## Known limits

- **Ma trận AC-1 liệt thủ tục viết trước.** Một thủ tục quản trị THÊM sau này không tự vào ma trận; phép đo canh tập hiện có, không canh tập tương lai. Rút danh sách từ bản khai router lúc chạy là việc đáng làm nhưng nằm ngoài vòng này.

- **Đường kết nạp mồi không tới được qua giao diện sản phẩm.** `removeMember` từ chối gỡ owner cuối cùng, nên bảng thành viên không về 0 bằng đường sản phẩm. AC-3 canh một cánh cửa không khoá chứ không phải một lỗ đang chảy — nó tới được qua thao tác cơ sở dữ liệu tay, một lượt phục hồi từ bản lưu cũ, hoặc `db:test --reset` khi phát triển.

- **Dụng cụ mint phiên đang gọi thiếu email.** `apps/api/scripts/dev-session.ts` gọi `ensureWorkspaceMembership(user.id)` không truyền `email`; hàm nhận `email = ""` và `decideSignIn` trả DENY ngay ở dòng đầu, nên thước không dựng lại được đường sản phẩm thật. Bản vá một dòng đã cherry-pick vào vòng này (commit gốc `880f0891`, thẻ máy `vaS-dev-session-cho-ho-so`) chứ không xin miễn trừ T1 — đổi dụng cụ mint phiên là đổi tiền đề của mọi phép đo đăng nhập.
