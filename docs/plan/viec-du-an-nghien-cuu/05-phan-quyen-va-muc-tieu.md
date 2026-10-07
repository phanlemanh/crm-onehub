# Phân quyền cho việc và dự án · Liên kết mục tiêu/OKR với việc

Ngày tra: 2026-10-05 · Số lượt WebSearch đã dùng: 10 (trong hạn mức 30)

Phạm vi: mảng G (G1…G9) và H (H1…H3) của khung `00-khung.md`. Thang M/Đ/Y/–/?.
Nguồn đánh số ở cuối. Ô ghi «(trích)» là chấm từ đoạn trích trang chính hãng trong
kết quả tìm, chưa mở được trang (trang chặn máy đọc: help.salesforce.com,
help.asana.com, support.monday.com, help.clickup.com đều trả 403 hoặc trang rỗng).
Ô ghi «(bên thứ ba)» là nguồn không chính hãng nhưng trích lại tài liệu hãng.

## Bảng chấm

### G. Phân quyền

| Mã | Salesforce | Dynamics 365 / Dataverse | HubSpot | Odoo | Asana | Jira | monday.com | ClickUp |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G1 Vai, quyền CRUD theo đối tượng | M [1] | M [5] | M — Tasks có hàng quyền riêng [10] | M [12] | Đ — quyền theo dự án (Editor/Commenter/Viewer) [14 trích] | M (không có ở gói Free) [18] | Đ — viewer/contributor/editor; đặt quyền bảng: Enterprise [21] | Đ — Full Edit/Edit/Comment/View [23 trích] |
| G2 Phạm vi own/team/cây | M — OWD + role hierarchy [1] | M — User/BU/Parent:Child BU/Org + manager/position hierarchy [5][6] | Đ — All/Their team's/Their own; nhóm lồng nhau: Enterprise [10][11] | Đ — record rule theo domain, không có cây dựng sẵn [12] | Đ — tổ chức/nhóm/dự án công khai hay riêng [16] | Đ — theo space + space role [18] | Y — chỉ ở mức bảng (public/private/share) [21] | Đ — Space/Folder/List riêng hay chia sẻ [23 trích] |
| G3 Việc kế thừa quyền từ cha | M — «Controlled by Parent» [2][1] | M — cascade Share/Reparent qua quan hệ parental; activity có parental qua «regarding» [8][9] | ? — chỉ biết quyền View bản ghi cho tạo task, sửa cần «Communicate» [10] | M — đọc activity = được giao HOẶC đọc được tài liệu gắn [13] | M — việc theo quyền dự án; một việc ở tối đa 20 dự án [15][16] | Đ — theo space, mức bảo mật lọc thêm [19] | Đ — item theo bảng; «Assigned contributor» chỉ sửa item mình [22 trích] | ? — có chia sẻ từng tầng, chưa thấy luật kế thừa [23 trích] |
| G4 Chia sẻ thủ công / theo quy tắc | M — sharing rules, manual, teams [1] | M — Share, access team [5][7] | ? | ? | M — thêm collaborator, xin quyền [14 trích] | Đ — mức bảo mật cấp cho user/nhóm/trường người [19] | Đ — mời vào bảng [22 trích] | M — chia sẻ mọi tầng và từng việc cho user/Team [23 trích] |
| G5 Quyền mức trường | M — Field-Level Security [1] | Đ — column security profile [7] | Y — tài liệu chỉ nói hạn chế quyền **sửa** thuộc tính [10] | Đ — `groups` trên trường [12] | Đ — trường tuỳ biến riêng tư/công khai [16] | ? | Đ (Pro/Enterprise) — chặn xem/sửa cột [22 trích] | ? |
| G6 Việc riêng tư | Đ — OWD hoạt động chỉ có «Controlled by Parent» hoặc «Private», áp cả tổ chức [2] | Đ — kiểu quyền «Private» cho cả bảng [5] | ? | ? | M — việc riêng chỉ người cộng tác thấy [14 trích][15] | Đ — mức bảo mật chỉ Reporter/Assignee [19] | ? | Đ — việc đặt riêng được [23 trích] |
| G7 Người dùng giới hạn | Đ — người dùng cổng/Experience Cloud có vai riêng [1] | ? | ? | ? | Đ — khách (khác tên miền), «limited access» [15][16] | ? | Đ — khách chỉ thấy bảng shareable được mời [22 trích] | M — khách, limited member, chỉ xem [23 trích] |
| G8 Chuyển giao khi nghỉ | ? — chỉ thấy hệ quả: đổi chủ xoá chia sẻ thủ công [1] | M — cascade Assign tới việc của bản ghi; giao lại bản ghi của nhóm [8][9][7] | ? | ? | ? | ? | ? | ? |
| G9 Nhật ký kiểm toán | Y — lịch sử trường cho task từ Spring '23, tối đa 6 trường chuẩn [4 trích] | ? | ? | ? | Đ (Enterprise) — audit log API bất biến [16] | ? | ? | ? |

### H. Mục tiêu / OKR

| Mã | Asana Goals | Atlassian Goals | ClickUp Goals | monday.com | Viva Goals | Lattice | WorkBoard | Betterworks | Tability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H1 Mục tiêu liên kết dự án/việc | M — việc, dự án, portfolio, mục tiêu con đều «đỡ» được mục tiêu, có trọng số [17] | Đ — mọi loại work item gắn được mục tiêu; epic đồng bộ với dự án [25][27 trích] | Đ — target gắn `task_ids`, `list_ids` [24] | ? — chỉ thấy bài «OKR management using monday.com» (mẫu bảng) [41 trích] | – đã ngừng 31/12/2025 [28] | Đ — gắn bộ lọc Jira vào mục tiêu [29 trích] | Đ — hiện work item Jira/Azure DevOps trên trang KR [30 trích] | Đ — gắn issue Jira, JQL sinh mốc [31 trích] | Đ — sáng kiến gắn kết quả; dán link Jira/Asana kéo trạng thái về [32][33 trích] |
| H2 Tiến độ tự tính từ việc | M — `progress_source`: task_completion, project_task_completion, project_milestone_completion, subgoal_progress, external, manual [16] | – theo tài liệu: chủ mục tiêu tự chấm khi cập nhật; tài liệu khuyên cập nhật biên tập hơn số tự kéo [25][26] | Đ — kiểu target `automatic` [24] | ? | – | Đ — đếm issue, story point, % hoàn thành; tối đa 50 issue, đồng bộ mỗi giờ [29 trích] | ? | Đ — tự cập nhật mỗi giờ từ Jira [31 trích] | – cố ý: việc xong không đổi tiến độ KR [32] |
| H3 Check-in dẫn về việc | ? | ? | ? | ? | – | ? | ? | ? | ? — check-in gồm tiến độ, độ tin, phân tích [32]; chưa thấy dẫn về việc |

## Mỗi sản phẩm: cách họ quy hoạch quyền của việc

**Salesforce.** Quyền chia hai tầng: tầng đối tượng (profile: Read/Create/Edit/Delete, View All/Modify All, Field-Level Security) và tầng bản ghi («sharing»: OWD, role hierarchy, territory, sharing rule, team, chia sẻ thủ công, chia sẻ bằng mã) [1]. Hoạt động (Task/Event) **không có bảng chia sẻ riêng**, «có cơ chế kiểm soát riêng» [1]. OWD của hoạt động chỉ có hai lựa chọn: «Controlled by Parent» hoặc «Private» [2]. Với «Controlled by Parent», quyền trên task đi theo quyền trên bản ghi cha (Name = Contact/Lead, Related To = Account/Opportunity/…); task gắn cả Acme và John Smith thì muốn sửa phải sửa được cả hai [2]. Người **được giao** task vẫn mở và sửa được task dù OWD thế nào, kể cả khi không có quyền với bản ghi cha [2 bên thứ ba]. Quyền mở rộng lấy giá trị rộng nhất trong các lối cấp [1]. Restriction Rules **thu hẹp** quyền xem, hỗ trợ cả task và event, 2–5 quy tắc mỗi đối tượng tuỳ gói [3 bên thứ ba]. Bẫy lớn nhất: quyền được **tính trước** vào bảng; đổi vai một người hay đổi chủ một bản ghi kéo theo tính lại diện rộng, và đổi chủ thì **xoá các chia sẻ thủ công** [1].

**Dynamics 365 / Dataverse.** Đơn vị cấp quyền là security role. Mỗi quyền (Create, Read, Write, Delete, Append, Append To, Assign, Share) có mức User / Business Unit / Parent:Child BU / Organization; vai cộng dồn [5]. «Append/Append To» tách riêng quyền *gắn* một ghi chú hay hoạt động vào bản ghi khỏi quyền *sửa* bản ghi [5]. Cây quản lý chạy song song: manager hierarchy (quản lý trực tiếp đọc-sửa, cấp trên gián tiếp chỉ đọc, giới hạn bằng độ sâu) và position hierarchy vượt business unit [6]. Access team không sở hữu bản ghi, chỉ được chia sẻ quyền Read/Write/Append trên từng bản ghi [7]. Hoạt động kế thừa quyền qua **quan hệ parental** của cột «regarding»; Share/Reparent cascade cấp «quyền kế thừa» [8][9]. Dataverse **cấm đa cha có cascade**: một bảng đã là con trong một quan hệ cascade thì quan hệ mới không được cascade, «để ngăn quan hệ nhiều cha» [9]. Giao lại account thì cấu hình được việc gì của nó đi theo (mọi việc / việc đang mở / việc của chủ cũ / không) [9]. Bẫy: ai đọc được bản ghi chứa cột tra cứu thì **thấy tên chính của bản ghi được tham chiếu**, kể cả khi không có quyền xem nó; Microsoft dặn đừng để dữ liệu nhạy cảm ở cột tên [9].

**HubSpot.** Mỗi đối tượng CRM, trong đó có **Tasks**, có quyền View/Edit/Create/Delete/Merge với phạm vi All / Their team's / Their own; có ô «Unassigned» [10]. Nhóm cha thấy mọi thứ nhóm con sở hữu, nhóm con không thấy của nhóm cha; nhóm lồng nhau cần Enterprise; «extra team» chỉ cho quyền xem bản ghi, không vào báo cáo hay xoay vòng [11]. Quyền View một bản ghi đã đủ để tạo task trên bản ghi đó; sửa task, gắn hoạt động vào bản ghi khác cần quyền «Communicate» [10]. Tài liệu đã đọc không nói gì về ca task gắn bản ghi người xem không thấy.

**Odoo.** Hai lớp: access right (CRUD theo model, cộng dồn qua các nhóm) và record rule (điều kiện domain trên từng bản ghi, nhóm hoặc toàn cục); trường có thể giới hạn theo nhóm [12]. Activity (`mail.activity`) gắn **đúng một** tài liệu (`res_model`, `res_id`). Luật trong mã: **đọc** = record rule VÀ (được giao HOẶC đọc được tài liệu gắn); **tạo** cần quyền ghi hoặc quyền đăng tin trên tài liệu; **sửa/xoá** được nếu record rule cho HOẶC có quyền ghi/đăng tin trên tài liệu [13]. Có hẳn một đường «đánh dấu xong» cho người được giao **không có quyền với tài liệu** (`mail_activity_without_access_action`) [13]. Đây là cài đặt gọn nhất của «kế thừa + ngoại lệ cho người được giao».

**Asana.** Tổ chức → nhóm → dự án; dự án `public_to_workspace` hoặc `private` (giá trị `private_to_team` đã bỏ, thay bằng chia sẻ cho nhóm) [16]. Việc nằm trong dự án nào thì người của dự án đó thấy; một việc thuộc tới 20 dự án (multi-homing) [16]. Thêm người cộng tác vào một việc trong dự án riêng: họ thấy **việc đó và việc con của nó, không thấy việc khác** [15]. Việc riêng tư chỉ người cộng tác thấy [14 trích]. Người Commenter hay Viewer được giao việc thì được nâng quyền tạm trên đúng việc đó (đánh dấu xong, đổi hạn, đổi người giao) [14 trích]. Khách là người khác tên miền [15]; API có cờ `is_limited_access` cho thành viên nhóm [16]. Audit log API chỉ có ở Enterprise [16].

**Jira.** Permission scheme gắn vào space (dùng chung được giữa nhiều space), cấp cho user, nhóm, space role [18]. Lọc thêm từng work item bằng work item security scheme; mức bảo mật cấp được cho Reporter, Current assignee, space role, nhóm, giá trị trường người hay nhóm, từng người [19]. Ai không thuộc mức bảo mật thì không thấy work item dù vào được space [19]. Không có ở gói Free [18].

**monday.com.** Quyền gắn với **bảng**: public (mọi thành viên), private (người được mời), share (có khách) [21]. Khách chỉ thấy bảng shareable được mời [22 trích]. Vai «Assigned contributor» chỉ sửa được item mình được giao theo một cột Người [22 trích]. Chặn xem/sửa cột ở Pro/Enterprise [22 trích]. Không thấy mô hình «việc gắn nhiều cha».

**ClickUp.** Cây Space → Folder → List → task; tầng nào cũng đặt riêng tư hoặc chia sẻ cho người hay Team được, mức Full Edit/Edit/Comment/View [23 trích]. Khách không vào Space; limited member chỉ vào thứ được chia sẻ [23 trích]. Chưa đọc được trang «Permissions in detail» nên luật kế thừa và ca «việc ở nhiều List» để `?`.

## Ca khó, đặt cạnh nhau: việc gắn bản ghi mà người được giao không thấy bản ghi

| Hệ | Người được giao có thấy việc không | Có thấy bản ghi cha không | Nguồn |
| --- | --- | --- | --- |
| Salesforce | Có, và sửa được | Không | [2 bên thứ ba] |
| Odoo | Có; đánh dấu xong qua một đường riêng | Không | [13] |
| Asana | Có, chỉ việc đó và việc con | Không (dự án riêng vẫn kín) | [15] |
| Dataverse | ? (chưa xác minh) | Thấy **tên** bản ghi qua cột tra cứu | [9] |
| HubSpot, ClickUp, monday | ? | ? | — |

Không hệ nào chặn việc giao. Đều theo hướng «cho người được giao thấy việc, giữ bản ghi
cha kín». Với OneHub, hướng đó chưa đủ: tiêu đề và mô tả việc là chữ người viết tay, rất
dễ mang tên đối tác, giá trị deal, tên người liên hệ. Lộ qua tiêu đề việc cũng là lộ.

## Phương án quyền cho OneHub

### Hiện trạng cần bám (đọc ở nhánh `onehub`, chỉ đọc) [40]

- Quyền hôm nay theo **phạm vi dữ liệu của router**, không theo bản ghi: `doiTac` (liên hệ, công ty, deal, chiến dịch, hoạt động, onboard…), `toChuc`, `chung`, `okr`. Vai thứ tư `okr` («chỉ OKR») đọc được `chung`, `toChuc`, `okr`, **không bao giờ** `doiTac`, qua mọi đường (tRPC, REST, khoá API, tác nhân). Router quên khai phạm vi thì vai `okr` bị chặn: «quên khai là đóng cửa, không bao giờ mở cửa».
- Trong phạm vi đối tác, `member` thấy hết; chưa có quyền theo nhóm, theo chủ.
- Đã có một khuôn đúng ý ở khu OKR: vai `okr` đọc được **con số** của KR (`okr.lichSuSo`) nhưng gọi **danh sách bản ghi đối tác** sau con số (`okr.banGhiChiSo`) thì bị `403`.
- Đã có hai «việc» riêng lẻ: `Activity` (một hoạt động gắn đồng thời được `companyId`, `contactId`, `dealId`, `planId`, xoá cha là xoá theo) và `OkrViecKr` (việc của KR, gắn được `planId` của một kế hoạch onboard hay `campaignId`, có `nguoiLamUserId`). `OkrViecKr` + `planId` chính là ca «việc của OKR gắn kế hoạch onboard».

### P1 — Kế thừa từ cha («Controlled by Parent»)

Ai thấy việc = người trong cuộc (tạo, phụ trách, theo dõi) ∪ ai đọc được **bất kỳ** bản ghi
gắn với việc. Phạm vi của việc không tồn tại riêng.

- Ưu: không phải quản quyền thứ hai; trang deal hiện đủ việc; về sau OneHub có quyền
  theo nhóm/theo chủ cho đối tác thì việc tự theo.
- Nhược: nhiều cha thì phép **hợp** làm lộ: việc gắn cả deal và một KR công khai sẽ hiện cho
  mọi người đọc OKR, kể cả vai `okr`, cùng tiêu đề có tên đối tác. Salesforce đòi đủ quyền
  với **mọi** cha mới cho sửa [2]; Dataverse cấm hẳn đa cha có cascade [9] — cả hai đều né
  phép hợp.
- Ai dùng: Salesforce [2], Dataverse [8][9], Odoo (một cha) [13], Jira (việc theo space) [19].

### P2 — Quyền riêng của việc

Việc có danh sách người riêng (người trong cuộc + người của dự án chứa nó). Bản ghi gắn
chỉ là tham chiếu, không cấp quyền.

- Ưu: dễ đoán; không lộ qua phép hợp; hợp với việc nội bộ, việc cá nhân.
- Nhược: quản lý deal không thấy việc trên deal của mình nếu không được thêm; trang deal
  thiếu việc; phải bảo trì danh sách người cho từng việc; vẫn không chặn được lộ qua tiêu đề
  khi giao cho vai `okr`.
- Ai dùng: Asana (việc riêng, người cộng tác) [14][15], ClickUp (chia sẻ từng việc) [23],
  Jira (mức bảo mật Reporter/Assignee) [19].

### P3 — Hợp có cổng phạm vi (khuyến nghị)

Ghép P1 cho **người thấy được**, thêm một cổng **phạm vi** chặn trước, đúng kiểu router
OneHub đang làm:

1. **Phạm vi của việc** = phạm vi chặt nhất trong mọi thứ nó gắn: có bất kỳ bản ghi đối tác
   (deal, công ty, liên hệ, kế hoạch onboard, chiến dịch) → `doiTac`; chỉ gắn KR/mục tiêu →
   `okr`; không gắn gì và không thuộc dự án nào → **riêng tư**. Tính lại mỗi lần thêm hay bỏ
   liên kết.
2. **Ai thấy** = (người trong cuộc ∪ ai đọc được ít nhất một bản ghi gắn hoặc dự án chứa nó)
   **và** vai của người đó đọc được phạm vi của việc (`docDuocPhamVi`). Vế sau là cổng; phép
   hợp chỉ chạy bên trong cổng.
3. **Thẻ liên kết** trên việc hiện tên bản ghi gắn chỉ khi người xem đọc được bản ghi đó;
   không thì hiện «một bản ghi bạn không có quyền xem». Học từ bẫy tên chính của Dataverse [9].
4. **Chặn lúc ghi, ở máy chủ**: không thêm người vai `okr` vào việc phạm vi `doiTac`, và
   không gắn bản ghi đối tác vào việc đang có người vai `okr`. Câu từ chối nói lý do và gợi ý
   tách việc.
5. **Đổi vai sang «chỉ OKR»**: việc phạm vi đối tác của người đó thôi hiện với họ, vào hàng
   «cần giao lại» của quản lý trực tiếp (G8).
6. **Cấp trên** (quản lý trực tiếp ở `OrgPlacement`, trưởng phòng, trưởng khối) đọc việc
   của người dưới, vẫn qua cổng phạm vi. Mẫu: manager hierarchy của Dataverse [6]. Có làm
   hay không là quyết định sản phẩm; quy tắc trên không phụ thuộc vào nó.
7. **Nhật ký**: mỗi lần chặn ở bước 4 và mỗi lần đọc việc phạm vi `doiTac` đều ghi vai và
   phạm vi, đúng như dòng log tRPC đang làm.

- Ưu: một luật cho mọi nguồn việc nên trang «Việc của tôi» lọc được bằng một điều kiện SQL.
  Giữ nguyên tắc chủ kho đã chốt: cấp thêm quyền sau thì rẻ, dữ liệu đã lộ thì không thu hồi
  được. Khi OneHub có quyền theo bản ghi cho đối tác, chỉ phải thay vế «đọc được bản ghi
  gắn», cổng phạm vi giữ nguyên.
- Nhược: chặt hơn mọi hệ đã khảo sát. Không hệ nào chặn việc giao; OneHub sẽ chặn, nên cần
  câu báo tốt và lối tách việc. Phải tính lại phạm vi khi đổi liên kết.
- Ai đang dùng từng mảnh: phần hợp có ở Odoo và Salesforce [13][2]; phần «thu hẹp» có ở
  Restriction Rules của Salesforce [3]; cổng phạm vi chính là mẫu router của OneHub [40].
  Về lý thuyết, ReBAC viết được đúng luật này: `viewer = involved or viewer from linked`
  rồi `and` với điều kiện vai, vì OpenFGA có đủ hợp, giao, trừ và «X from Y» [38][39].
  Hiện chưa cần một bộ máy Zanzibar/OpenFGA [37]: OneHub mới có bốn vai và một cổng phạm
  vi, một vị từ SQL là đủ. Đáng xét lại khi có chia sẻ theo bản ghi cho đối tác.

**Khuyến nghị: P3.** Lý do: P1 lộ qua phép hợp đúng ở ca OneHub sợ nhất (việc vừa gắn KR
vừa gắn đối tác). P2 làm trang deal mất việc và vẫn không chặn được lộ qua tiêu đề. P3 là P1
cộng đúng cái cổng OneHub đã có ở router.

### Hai ca khó, theo P3

**Việc gắn deal giao cho người vai «chỉ OKR».** Máy chủ từ chối, kèm câu: người này dùng vai
chỉ OKR nên không xem được dữ liệu đối tác. Có hai lối ra: tạo một việc không gắn đối tác
(gắn KR hoặc để riêng tư) và tự viết tiêu đề không có tên đối tác, hoặc nhờ quản trị đổi vai
— việc đổi vai thuộc về người, máy không làm hộ. Salesforce, Odoo và Asana thì cho giao và
để người được giao thấy việc [2][13][15]. OneHub cố ý khác họ ở đây, vì tiêu đề việc là chữ
tự do.

**Việc của OKR gắn một kế hoạch onboard.** Phạm vi = `doiTac`, vì kế hoạch thuộc một công
ty. Người bên kinh doanh đọc được KR hoặc kế hoạch thì thấy việc. Vai `okr` không thấy dòng
việc, nhưng trên KR vẫn thấy **con số gộp**, ví dụ «3 việc gắn dữ liệu đối tác, 2 đã xong».
Cách này giống hệt `lichSuSo` (cho xem số) so với `banGhiChiSo` (`403` với danh sách) đang
có [40]. Nếu chủ KR dùng vai `okr`, người làm việc đó phải là người bên kinh doanh; KR của
họ chỉ hiện con số gộp.

## Mục tiêu ↔ việc: kết luận

1. **Mục tiêu trỏ tới việc, không sở hữu việc.** Mọi hệ đã kiểm đều để việc sống ở chỗ của
   nó rồi nối sang mục tiêu:
   - Asana: «supporting resource» là dự án, việc, portfolio hoặc mục tiêu con, có
     `contribution_weight` từ 0 tới 1 [17].
   - Atlassian: gắn work item, đồng bộ epic với dự án ở Atlassian Home [25][27].
   - ClickUp: `task_ids`, `list_ids` trên target [24].
   - Lattice, Betterworks: một truy vấn JQL [29][31].
   - WorkBoard: hiện work item Jira/ADO trên trang KR [30].
   - Tability: sáng kiến gắn kết quả, dán link Jira/Asana để kéo trạng thái về [32][33].

   Với OneHub, nghĩa là bỏ `OkrViecKr` như một loại việc riêng. KR trở thành **một loại
   bản ghi** mà việc chung gắn vào được, đúng hướng «một loại việc duy nhất».
2. **Tiến độ KR tự tính từ việc: có thể làm, nhưng không nên là mặc định.**
   - Hệ cho phép: Asana (`task_completion`, `project_task_completion`,
     `project_milestone_completion`) [16]; ClickUp (`automatic`) [24]; Lattice (% issue, story
     point) [29]; Betterworks [31].
   - Hệ cố ý không làm: Tability nói việc xong không đổi tiến độ KR, KR được chấm ở check-in
     riêng [32]. Atlassian khuyên cập nhật có biên tập thay vì số % kéo từ Jira [25].
   - Phương pháp: Felipe Castro, «OKR nên đo kết quả, không đo công việc» (13/06/2024). Dự án
     chỉ có hạn chót thì quản bằng ngày hạn, đừng ép thành OKR (20/06/2024) [34][35].
     whatmatters (Doerr) cũng đòi KR đo được, kiểm chứng được [36].
   - Khuyến nghị cho OneHub: tiến độ KR giữ ở nguồn số đo đang có (`OkrNguonKr`) hoặc ở
     check-in. Trên KR hiện «tiến độ việc» thành một dòng riêng, không cộng vào điểm. Muốn
     tính KR từ việc thì phải bật tay cho từng KR và gắn nhãn «KR mốc/đầu ra».
3. **Viva Goals đã ngừng** ngày 31/12/2025; Microsoft dừng phát triển tính năng mới từ
   05/12/2024 [28]. Không còn là đối chiếu sống.
4. H3 (check-in dẫn về việc): chưa hệ nào xác minh được, xem «Câu hỏi còn mở».

## Mẫu thiết kế đáng học

- **Ngoại lệ cho người được giao** (Odoo, Salesforce): người được giao luôn thấy và đóng được
  việc của mình [13][2]. OneHub dùng mẫu này trong cổng phạm vi.
- **Tách quyền «gắn vào» khỏi quyền «sửa»** (Append/Append To của Dataverse [5]; Communicate
  của HubSpot [10]): gắn việc vào một deal không đòi quyền sửa deal.
- **Cascade khi giao lại** (Dataverse): giao lại công ty thì chọn được việc nào đi theo — mọi
  việc, việc đang mở, việc của chủ cũ, hoặc không [9]. Đây là lời giải cho G8.
- **Đọc thấy việc, không thấy phần còn lại** (Asana): người cộng tác thấy đúng việc đó và
  việc con của nó [15].
- **Số gộp cho vai hẹp, dòng chi tiết cho vai rộng**: OneHub đã làm ở số đo KR [40]; dùng lại
  cho việc.
- **Mục tiêu trỏ có trọng số** (Asana `contribution_weight` [17]): tốt hơn «KR = % việc
  xong».

## Bẫy / điều nên tránh

- **Lộ tên qua thẻ liên kết**: Dataverse cho thấy tên bản ghi được tham chiếu dù không có
  quyền [9]. Thẻ liên kết trên việc phải tự kiểm quyền.
- **Phép hợp trên nhiều cha** làm phạm vi của việc rộng hơn mọi cha của nó. Dataverse cấm đa
  cha cascade [9]; Salesforce đòi đủ quyền với mọi cha mới cho sửa [2].
- **Quyền tính trước rồi tính lại diện rộng**: đổi vai, đổi chủ là kéo theo tính lại, và đổi
  chủ xoá chia sẻ thủ công [1]. OneHub nên tính lúc đọc bằng điều kiện truy vấn, không lưu bảng
  quyền.
- **Xoá theo cha**: `Activity` hiện xoá theo khi công ty, deal hay kế hoạch bị xoá [40]. Việc
  dùng chung không nên mất theo một trong nhiều cha; chỉ gỡ liên kết.
- **Lịch sử thay đổi của việc bị bỏ quên**: Salesforce tới 2023 mới có, và chỉ 6 trường chuẩn
  [4 trích]. Nên có nhật ký đầy đủ cho việc ngay từ đầu.
- **KR thành danh sách việc**: tự tính tiến độ KR từ % việc xong là đo đầu ra thay cho kết quả
  [34][32].

## Câu hỏi còn mở, khẳng định chưa xác minh

- Câu «người được giao task vẫn sửa được dù không có quyền với bản ghi cha» của Salesforce
  lấy từ trang bên thứ ba [2]. Trang trợ giúp gốc (`activities_access.htm`) chặn máy đọc.
- Dataverse: người tham gia hoạt động (activity party) mà không đọc được bản ghi «regarding»
  có thấy hoạt động không — chưa xác minh.
- HubSpot: task gắn bản ghi người xem không thấy thì hiện ra sao; chia sẻ thủ công; nhật ký;
  chuyển giao — chưa xác minh.
- ClickUp: luật kế thừa và ca việc ở nhiều List (trang «Permissions in detail» chặn máy đọc).
- monday.com: có tính năng Goals riêng hay chỉ dùng mẫu bảng OKR — chưa xác minh.
- Jira: một work item có đúng một mức bảo mật không; việc con có kế thừa mức của cha không —
  chưa xác minh.
- H3 ở mọi hệ: check-in có tạo hoặc dẫn về việc không — chưa xác minh hệ nào.
- G8, G9 ở phần lớn hệ — chưa xác minh.
- Dữ liệu hiện có: `OkrViecKr` có dòng nào mà người làm mang vai `okr` và có `planId` hoặc
  `campaignId` không. Nếu có, luật chặn ở P3 sẽ đụng dữ liệu cũ khi gộp vào việc chung. Cần
  đếm trước khi viết `migration`.

## Nguồn

[1] https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_record_access_under_the_hood.pdf — Record-Level Access: Under the Hood (Winter '27, cập nhật 11/09/2026) — 2026-10-05
[2] https://www.simplysfdc.com/2015/01/salesforce-activity-controlled-by-parent.html — SimplySfdc: Activity Visibility Controlled by Parent (bên thứ ba, trích help.salesforce `activities_access.htm`) — 2026-10-05
[3] https://www.salesforceben.com/salesforce-restriction-rules/ — Salesforce Ben: Restriction Rules (bên thứ ba) — 2026-10-05
[4] https://www.asagarwal.com/salesforcespring23-field-history-tracking-for-activities-tasks-events/ và https://www.simplysfdc.com/2023/01/salesforce-field-history-tracking-for.html — Field History Tracking for Activities (đoạn trích kết quả tìm) — 2026-10-05
[5] https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges — Security roles and privileges for Dataverse — 2026-10-05
[6] https://learn.microsoft.com/en-us/power-platform/admin/hierarchy-security — Hierarchy security — 2026-10-05
[7] https://learn.microsoft.com/en-us/power-platform/admin/manage-teams — Teams in Dataverse — 2026-10-05
[8] https://learn.microsoft.com/en-us/power-apps/developer/data-platform/configure-entity-relationship-cascading-behavior — Configure table relationship cascading behavior — 2026-10-05
[9] https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-entity-relationships — About table relationships for Microsoft Dataverse — 2026-10-05
[10] https://knowledge.hubspot.com/user-management/hubspot-user-permissions-guide — HubSpot user permissions guide — 2026-10-05
[11] https://knowledge.hubspot.com/user-management/create-and-manage-teams — Create and manage teams — 2026-10-05
[12] https://www.odoo.com/documentation/18.0/developer/reference/backend/security.html — Odoo 18 Security in Odoo — 2026-10-05
[13] https://raw.githubusercontent.com/odoo/odoo/18.0/addons/mail/models/mail_activity.py — Odoo 18 `mail.activity`, hàm `_check_access` — 2026-10-05
[14] https://help.asana.com/s/article/task-permissions?language=en_US — Asana task permissions (đoạn trích kết quả tìm) — 2026-10-05
[15] https://asana.com/resources/asana-tips-permissions — Manage Asana Project and Guest Permissions — 2026-10-05
[16] https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml — Asana OpenAPI (privacy_setting, progress_source, multi-homing, audit log, is_limited_access) — 2026-10-05
[17] https://developers.asana.com/reference/goal-relationships — Asana Goal relationships — 2026-10-05
[18] https://support.atlassian.com/jira-cloud-administration/docs/manage-project-permissions/ — Jira: permission schemes — 2026-10-05
[19] https://support.atlassian.com/jira-cloud-administration/docs/grant-users-access-to-security-levels-in-a-work-item-security-scheme/ — Jira: grant access to security levels — 2026-10-05
[20] https://support.atlassian.com/jira-cloud-administration/docs/configure-issue-security-schemes/ — Jira: work item security schemes — 2026-10-05
[21] https://developer.monday.com/api-reference/reference/boards — monday API: Boards (board_kind, quyền bảng) — 2026-10-05
[22] https://support.monday.com/hc/en-us/articles/360011926640-Column-permissions · https://support.monday.com/hc/en-us/articles/360019222479-Permissions-on-monday-com · https://support.monday.com/hc/en-us/articles/115005340405-How-to-get-started-as-a-guest — monday (đoạn trích kết quả tìm) — 2026-10-05
[23] https://help.clickup.com/hc/en-us/articles/6309266954263-Share-Spaces-Folders-Lists-and-tasks · https://help.clickup.com/hc/en-us/articles/7255448709655-Make-Spaces-Folders-Lists-and-tasks-private · https://help.clickup.com/hc/en-us/articles/6309221065495-Permissions-in-detail — ClickUp (đoạn trích kết quả tìm) — 2026-10-05
[24] https://developer.clickup.com/reference/createkeyresult — ClickUp API: Create Key Result — 2026-10-05
[25] https://support.atlassian.com/platform-experiences/docs/understand-how-goals-and-projects-work-with-jira/ — Understand how goals and projects work with Jira — 2026-10-05
[26] https://support.atlassian.com/platform-experiences/docs/use-goal-status-to-track-objectives-and-key-results/ — Use goal status to track OKRs — 2026-10-05
[27] https://support.atlassian.com/jira-software-cloud/docs/link-work-in-jira-to-goals-and-projects-in-atlassian-home/ — Link work in Jira to goals (đoạn trích kết quả tìm) — 2026-10-05
[28] https://learn.microsoft.com/en-us/viva/goals/goals-retirement — Viva Goals retirement — 2026-10-05
[29] https://help.lattice.com/hc/en-us/articles/4404420149015-Connect-Jira-to-a-Goal — Lattice: Connect Jira to a Goal (đoạn trích kết quả tìm) — 2026-10-05
[30] https://www.workboard.com/resources/product-updates/jira-and-azure-devops-visibility — WorkBoard: Jira and Azure DevOps Integration Updates (đoạn trích kết quả tìm) — 2026-10-05
[31] https://support.betterworks.com/hc/en-us/articles/208727166-Integrations-Jira-Users · https://www.betterworks.com/magazine/new-jira-integration — Betterworks Jira (đoạn trích kết quả tìm) — 2026-10-05
[32] https://guides.tability.io/docs/getting-started-with-tability/tracking-okrs-and-tasks-with-tability — Tability: Tracking OKRs and tasks — 2026-10-05
[33] https://guides.tability.io/docs/become-a-tability-power-user/integrations/jira — Tability: Jira (đoạn trích kết quả tìm) — 2026-10-05
[34] https://read.felipecastro.com/p/measure-outcome-not-work — Felipe Castro: An OKR should measure the outcome, not the work (13/06/2024) — 2026-10-05
[35] https://read.felipecastro.com/p/what-if-you-cant-measure-the-outcome — Felipe Castro: Not everything needs to be an outcome—or an OKR (20/06/2024) — 2026-10-05
[36] https://www.whatmatters.com/faqs/okr-meaning-definition-example — What Matters: OKR meaning — 2026-10-05
[37] https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/ — Zanzibar (USENIX ATC 2019) — 2026-10-05
[38] https://openfga.dev/docs/modeling/parent-child — OpenFGA: Parent-child objects — 2026-10-05
[39] https://openfga.dev/docs/configuration-language — OpenFGA: Configuration language — 2026-10-05
[40] Kho OneHub, nhánh `onehub` (chỉ đọc): `docs/api.md` (phạm vi dữ liệu, vai `okr`, `lichSuSo`/`banGhiChiSo`), `packages/db/prisma/schema.prisma` (`Activity`, `OkrViecKr`, `OnboardingPlan`, `OrgPlacement`) — 2026-10-05
[41] https://support.monday.com/hc/en-us/articles/4402057681298-OKR-management-using-monday-com — monday: OKR management (chỉ thấy tiêu đề trong kết quả tìm) — 2026-10-05
