# Gỡ một thành viên thì phải giữ được — thiết kế

Hồ sơ: `_acceptance/go-thanh-vien-phai-giu-duoc/` · hạng T3 · mặt: api

## Điều đã đo được, không phải điều nhớ được

Bản nháp đầu của hợp đồng sai tiền đề. `removeMember`
(`apps/api/src/workspace/workspace.service.ts:355`) làm ba việc trong MỘT giao
dịch: `tx.member.delete`, `tx.session.deleteMany`, và `tx.invitation.updateMany`
đưa lời mời về `TRANG_THAI_HUY`. Khối thu hồi ấy đã có từ trước khi hợp đồng được
viết — commit thêm nó tên là `feat(api): go mot thanh vien la mot viec tron ven`.

Ba tiêu chí của bản nháp vì thế đã có mã và đã có phép đo, thuộc hồ sơ
`cho-phep-ai-vao-o-man-hinh` đã ký 16/09. Chi tiết ở mục Context của hợp đồng.

## Cửa chặn thật nằm ở đâu

Sau lượt gỡ, người kia bị chặn bởi **hai lớp nối tiếp**, không phải một:

1. **Phiên bị xoá** — `tx.session.deleteMany({ where: { userId } })` chạy trong
   cùng giao dịch, nên mọi phiên đang mở chết ngay khi giao dịch chốt.
2. **Vai tra về rỗng** — `workspaceRoleOf` đọc bảng `member`; dòng đã xoá nên nó
   trả `null`, và mọi thủ tục quản trị đi qua `isWorkspaceAdmin(role)` đều ném
   `ForbiddenException`.

Điều đáng ghi: `members()` (dòng 170) và `get()` (dòng 92) **không** kiểm tư cách
thành viên. Chúng chỉ liệt kê. Cửa duy nhất chặn người vừa bị gỡ ở hai thủ tục đó
là **lớp phiên**, không phải lớp thủ tục. Hợp đồng này không mở rộng ra sửa điều
đó — nó chỉ đòi phép đo nói đúng cửa nào đang chặn.

## Bốn tiêu chí, bốn chỗ chưa ai canh

**AC-1 — người bị gỡ gọi thủ tục API thật thì bị từ chối.** Phép đo phải cô lập
được ĐÚNG tác động của lượt gỡ, nên nó lấy một người đang là **quản trị**: trước
khi gỡ, `allowances()` trả về bình thường; sau khi gỡ, cùng lời gọi ấy ném
`ForbiddenException`. Hai chiều trên cùng cữ liệu, cùng một người.

**AC-2 — phiên đang mở mất quyền tức thì.** Số đã khai là **0 giây**, vì việc xoá
phiên nằm trong cùng giao dịch. Phép đo gieo hai dòng phiên cho người sắp bị gỡ,
đếm trước và ngay sau khi `removeMember` trả về, và đòi hiệu bằng đúng số dòng đã
gieo. Không đo bằng ngưỡng thời gian — ngưỡng lỏng hơn sự thật là hạ thước.

**AC-3 — thủ tục màn quản trị đọc thôi trả họ.** `members()` không còn dòng của
họ, và `allowances()` không còn trả lời mời của họ ở trạng thái còn hiệu lực.
Phép đo gọi hai thủ tục thật, không đọc bảng trực tiếp.

**AC-4 — đường kết nạp mồi thôi cấp quyền cho người đã bị gỡ.**
`ensureWorkspaceMembership` (`packages/auth/src/organization.ts:62`) có nhánh:
khi bảng thành viên rỗng, nó kết nạp MỌI người dùng đang có và trao vai `owner`
cho người cũ nhất — **không hỏi bảng lời mời một câu nào**.

Bản sửa nhỏ nhất: trong nhánh ấy, loại những người có dòng lời mời ở trạng thái
KHÔNG còn hiệu lực. Người chưa từng có lời mời vẫn được kết nạp như cũ, nên hành
vi mồi của một bản cài mới không đổi; chỉ người đã bị gỡ mới bị loại.

## Đo thế nào, và chiều đỏ của từng phép

| Eval | Đo gì | Chiều đỏ |
| --- | --- | --- |
| E1 | quản trị bị gỡ gọi `allowances()` → từ chối; trước khi gỡ thì qua | bỏ `isWorkspaceAdmin` khỏi thủ tục → chiều sau thôi ném, bài đỏ, ghim tên thủ tục |
| E2 | hiệu số dòng phiên trước/sau `removeMember` bằng đúng số đã gieo | gỡ `session.deleteMany` khỏi giao dịch → hiệu bằng 0, bài đỏ, ghim hai con số |
| E3 | `members()` và `allowances()` thôi trả người vừa bị gỡ | gỡ khối thu hồi lời mời → `allowances()` còn trả họ ở trạng thái còn hiệu lực, bài đỏ |
| E4 | bảng thành viên rỗng + lời mời kết thúc → đường mồi KHÔNG kết nạp | trả nhánh mồi về bản cũ → người bị gỡ thành owner, bài đỏ, ghim vai đã cấp |

Mỗi bài dựng cữ liệu qua **thủ tục thật** (`allowEmail`, `removeMember`) chứ không
gõ thẳng vào bảng, và lấy chuỗi trạng thái từ hằng có tên của
`@crm/validation/invitation-status` — hai luật rút từ hồ sơ
`loi-moi-da-huy-van-cho-vao` vừa xong, nơi bốn lượt sửa cùng một lớp lỗi đã trả
giá cho chúng.

## Điều người phải quyết ở Cổng 1

1. **AC-4 canh một cửa không tới được qua giao diện sản phẩm.** `removeMember` từ
   chối gỡ owner cuối nên bảng thành viên không về 0 bằng đường sản phẩm. Có đáng
   sửa và đo một cửa chỉ mở qua thao tác cơ sở dữ liệu tay hoặc một lượt phục hồi
   bản lưu cũ không?
2. **AC-3 nói về màn quản trị nhưng đo ở tầng thủ tục.** Hồ sơ khai
   `surfaces: [api]`. Đo ở tầng thủ tục là đủ, hay muốn thêm một phép đo lớp
   nhìn-thấy trên màn? Hồ sơ trước đã ăn đúng câu hỏi này hai vòng liền.
