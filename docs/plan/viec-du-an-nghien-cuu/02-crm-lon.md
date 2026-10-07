# CRM doanh nghiệp lớn: Salesforce, Dynamics 365, HubSpot, Zoho

Ngày tra: 2026-10-05 · Số lượt WebSearch đã dùng: 24

Cách tra: đọc thẳng trang trợ giúp chính hãng. help.salesforce.com chỉ hiện nội dung
khi chạy JavaScript nên đọc qua trình duyệt; developer.salesforce.com trả 403 nên
không đọc được tài liệu API của Salesforce. Ô nào không mở được nguồn thì để `?`.

Cột «Dynamics» gồm Dynamics 365 Sales cộng Dynamics 365 Project Operations (bán
riêng). Cột «Zoho» gồm Zoho CRM cộng Zoho Projects (ứng dụng riêng, nối qua tích
hợp). Ô ghi «(dự án)» nghĩa là chỉ việc trong dự án có, việc thường của CRM thì
không.

## Bảng chấm

| Mã | Salesforce Sales Cloud | Dynamics 365 Sales + Project Operations | HubSpot | Zoho CRM + Zoho Projects |
| --- | --- | --- | --- | --- |
| A1 | M [1][3] | M [17][21] | M [33][35] | Đ [48] |
| A2 | Đ — nhiều contact qua Shared Activities, một Related To [3] | Y — một Regarding, nhiều activity party [21] | M — giới hạn số liên kết theo gói [35] | Y [48] |
| A3 | ? | Đ (dự án, 10 tầng) [26][27] | Y (dự án, beta, ≤60 việc con) [42] | ? |
| A4 | Đ [2] | Y — chỉ thấy lịch hẹn lặp [16] | Đ (cần seat Core/Sales/Service) [33] | Đ [48] |
| A5 | Đ — record type, chủ đề định sẵn [2] | M — email/gọi/việc/hẹn + custom activity [17][21] | Y — Call/Email/To-do/LinkedIn cố định [33][46] | Đ — Tasks/Calls/Meetings là module riêng [48][51] |
| A6 | ? | Đ — nhóm trạng thái cố định Open/Completed/Canceled + lý do [21] | Y — Not started/Complete [46] | ? |
| A7 | Đ — ưu tiên, nhãn màu [2][4] | ? | Đ [33] | Đ [48] |
| A8 | Đ [12] | M [21][26] | ? | Đ [48] |
| A9 | ? | Đ (dự án, ≤20 mục) [27] | ? | ? |
| A10 | Y — một chủ; giao 200 người = 200 bản sao [2] | Y — một chủ (dự án: ≤50 người/việc) [21][27] | Y [33] | Y — một Task Owner [48] |
| A11 | ? | ? | ? | ? |
| A12 | ? | Đ (dự án) [26] | ? | ? |
| A13 | Đ — ≤6 trường chuẩn [12] | M [31][26] | ? | ? |
| B1 | M — To Do List [4] | Đ — My Work > Activities, work list [17][22] | Đ [33] | ? |
| B2 | Đ (M với Sales Engagement) [2][8] | M — queue, pick/release [24] | M — shared queue (Starter+) [34] | ? |
| B3 | Đ [2] | ? | Đ [33] | Đ [48] |
| B4 | Đ [2] | Đ [17] | ? | ? |
| B5 | ? | ? | ? | Y — chỉ xuất sang Google Tasks (Starter+) [52] |
| B6 | Đ — Delegated Tasks [2] | Đ [21] | Đ [33] | Đ [48] |
| C1 | – [14] | M (Project Operations, giấy phép riêng) [26][28] | Đ — projects object, mọi gói [38] | Y — app riêng Zoho Projects [53] |
| C2 | Đ — Sales Action Plans (Enterprise+ có Sales) [5][6] | Đ [32] | ? | Đ [53] |
| C3 | – [14] | ? | ? | ? |
| C4 | Y [6][14] | M [28] | M [38] | Đ [53] |
| C5 | Y — Flow hoặc AppExchange [14] | Đ — quote thắng → project contract [28] | Đ — workflow (Pro/Ent) [38] | Y — custom function [60] |
| C6 | ? | ? | ? | Đ — client user [53] |
| D1 | – — không có Kanban cho task [11] | Đ [17] | Đ (dự án) [38] | – (CRM) [56] |
| D2 | – [11] | ? | ? | – (CRM) [56] |
| D3 | – [11] | ? | ? | – (CRM) [56] |
| D4 | – [11] | ? | ? | – (CRM) [56] |
| D5 | – [11] | ? | Đ (dự án, pipeline rules Pro/Ent) [38] | – (CRM) [56] |
| E1 | – [14] | M [26] | Đ — beta, có điều kiện [38][43] | Đ [58] |
| E2 | – [14] | M — FS/SS/FF/SF, lead/lag [26] | ? | Đ [58] |
| E3 | – [14] | Đ [26] | ? | ? |
| E4 | – [14] | ? | ? | Đ [58] |
| E5 | – [14] | Y — một baseline [29] | ? | M — ≤15 baseline [59] |
| E6 | – [14] | ? | ? | ? |
| E7 | – [14] | Y — có lịch, bỏ qua ngày nghỉ doanh nghiệp [26] | ? | ? |
| E8 | – [14] | Đ [32] | ? | ? |
| F1 | Đ — Flow [14] | ? | M (Pro/Ent) [34][38] | Đ [52] |
| F2 | M (gồm trong Performance/Unlimited, mua thêm cho Pro/Enterprise) [8] | M (Enterprise: 1.500 bản ghi/tháng) [20][23] | M (Sales/Service Pro/Ent, chỉ contact) [41] | Đ — mọi người dùng [55] |
| F3 | Đ [6] | Đ [20][28] | M (Pro/Ent) [40] | M — Blueprint (Pro 3, Ent 50, Ult 100) [52][54] |
| F4 | Đ (add-on Einstein for Sales) [9] | Đ [25] | Đ (Sales/Service Pro/Ent) [44] | ? |
| F5 | M (add-on Einstein for Sales) [10] | M [25] | Đ — beta, tốn HubSpot Credits [39][44] | Đ [57] |
| G1 | Đ [13] | M [15] | Đ [36] | Đ (Pro+) [50] |
| G2 | M [1] | M [15][18] | Đ (M với Enterprise: team lồng nhau) [36][37] | M (territory Ent+) [49][50][52] |
| G3 | M — Controlled by Parent [1] | M — cascade Share/Reparent [16] | Y [36] | Đ — chỉ chia sẻ kèm bản ghi cha [51] |
| G4 | ? | M — share, access team [15][19] | ? | Đ (rule Ent+) [52] |
| G5 | ? | M [30] | ? | Đ (Pro+) [50][52] |
| G6 | Y [1][3] | ? | ? | Đ — cả module Private [61] |
| G7 | Đ [13] | ? | ? | Đ — Portals (Ent+) [52] |
| G8 | ? | Đ — cascade Assign [16] | ? | ? |
| G9 | Đ [12] | M [31] | ? | Đ (Starter+) [52] |
| H1 | ? | ? | ? | ? |
| H2 | ? | ? | ? | ? |
| H3 | ? | ? | ? | ? |
| I1 | Đ [2] | ? | ? | ? |
| I2 | – [14] | ? | ? | ? |
| J1 | ? | Đ (dự án) [32] | ? | ? |
| J2 | Đ [2] | Y — sales accelerator không chạy trên di động [22] | Đ [47] | Đ [52] |
| J3 | ? | Đ — nhập từ Microsoft Project [32] | ? | ? |

Số ô `?`: 91 trên 240 ô.

Giá Zoho CRM (thanh toán theo năm, /người/tháng): Standard 14 USD, Professional 23 USD,
Enterprise 40 USD, Ultimate 52 USD; Free tối đa 3 người [52]. Giá ba hãng còn lại chưa tra.

## Mỗi sản phẩm: cách họ quy hoạch việc

### Salesforce Sales Cloud

- Mô hình: Task và Event gộp chung là Activity. Một việc có một Related To (`WhatId`, trỏ tới bản ghi bất kỳ có bật Activity, kể cả đối tượng tự tạo) và một hay nhiều người (`WhoId`, contact/lead). Shared Activities cho gắn nhiều contact; đã bật thì không tắt được; việc gắn lead thì không gắn thêm contact được [3].
- Quyền: Activity có hai mức mặc định toàn tổ chức. **Private**: chủ việc và người trên chủ việc theo role hierarchy được sửa/xoá; ai đọc được bản ghi cha thì được xem. **Controlled by Parent**: làm được gì trên việc thì phải làm được điều đó trên **mọi** bản ghi việc đang gắn. Ví dụ chính hãng: việc gắn Acme và John Smith thì phải sửa được cả hai mới sửa được việc [1]. Việc không gắn cha thì về mức mặc định.
- Giao việc: một việc một chủ. Giao cho tối đa 200 người hay một nhóm thì mỗi người nhận một bản sao riêng, xem lại qua danh sách Delegated Tasks [2]. Task queue do quản trị dựng; thông báo chỉ gửi khi việc rời queue về một người [2].
- Việc của tôi: To Do List gom task thường, bước cadence và work item của Flow Orchestration; kéo để xếp thứ tự, gắn nhãn màu (Pro/Enterprise/Unlimited/Performance) [4]. Work Queue thuộc Sales Engagement [8].
- Sinh việc từ quy trình mẫu: Action Plan Template gồm việc có ưu tiên, số ngày phải xong tính từ ngày bắt đầu và người phụ trách. Bản Industries tối đa 200 việc mỗi mẫu, lệch tối đa 1.000 ngày (đọc qua đoạn trích tìm kiếm) [5]. **Sales Action Plans** (Enterprise/Performance/Unlimited có Sales) gắn vào account, opportunity, lead…, có cả task lẫn event, không hỗ trợ đối tượng tự tạo [6]. Bản Industries chỉ có trong các Cloud ngành [7]. Cadence của Sales Engagement đi kèm Performance/Unlimited, mua thêm cho Pro/Enterprise [8].
- Dự án: không có sẵn. Khách thường mua app trên AppExchange (TaskRay, Milestones PM+…) và dùng Flow để mở dự án khi opportunity Closed Won (nguồn bên thứ ba) [14].
- AI: Agentforce (Default) có hành động «Create a To-Do» (add-on Einstein for Sales) [9]. Agentforce Engagement là tác tử có user riêng, tự gửi email theo một cadence riêng [10].
- Khách hay vấp: không có Kanban cho task [11]. Sửa một chuỗi việc lặp thì gãy liên kết các lần trong tương lai. Đổi chủ một lần lặp thì lần đó rời khỏi chuỗi [2].

### Microsoft Dynamics 365 Sales (+ Project Operations)

- Mô hình: Activity là một bảng cha (ActivityPointer) cho email, gọi, việc, hẹn và mọi custom activity. Quyền của mọi loại activity đi qua bảng cha này [21]. Mỗi activity có một Regarding và nhiều activity party (người tham gia). Việc gắn contact thì tự hiện ở account của contact đó [17].
- Quyền theo cây tổ chức: mỗi đặc quyền (Create/Read/Write/Delete/Append/Append To/Assign/Share) có mức User / Business Unit / Parent: Child Business Unit / Organization [15]. Thêm hierarchy security theo quản lý hoặc vị trí, có độ sâu. Cấp trên trực tiếp được đọc và ghi, cấp trên gián tiếp chỉ được đọc. Hãng khuyên mỗi cấp quản lý không quá 50 người [18]. Access team dựng từ mẫu cho từng bản ghi [19].
- Kế thừa từ cha: quan hệ cha–con khai cascade cho Assign/Share/Unshare/Reparent (Cascade All, Active, User Owned, None). Chia sẻ account thì chia sẻ luôn activity con. Gỡ cha thì gỡ quyền kế thừa. Đổi chủ cha thì có thể kéo đổi chủ con [16].
- Việc của tôi và hàng đợi: My Work > Activities có kiểu xem Kanban/Calendar/Focused [17]. Queue public/private chứa activity và case. Người làm tự nhận (pick) và trả lại (release). Queue private chỉ lọc màn hình, **không** chặn quyền [24].
- Sinh việc: sequence của sales accelerator gồm bước email/gọi/việc, điều kiện, lệnh theo giai đoạn. Giao được cho chủ bản ghi, người ở một trường, owner team hay access team. Tối đa 250 sequence đang chạy [20]. Giấy phép Enterprise có 1.500 bản ghi gắn sequence mỗi tháng; muốn đủ tính năng phải nâng giấy phép [23].
- Bàn giao sau bán: Project Operations nối opportunity → quote → project contract. Có thể đặt để quote Closed as Won tự sinh project contract [28]. Lịch dự án có FS/SS/FF/SF với lead/lag, Gantt, board, nhật ký thay đổi từng việc [26]. Chỉ một baseline mỗi dự án [29].
- AI: Sales Qualification Agent, Sales Close Agent, Recommended Actions Agent; có MCP cho công cụ bán hàng [25].
- Khách hay vấp: hai thế giới việc (activity của CRM và project task của Project Operations); sales accelerator không chạy trên di động [22]; cascade đổi đơn vị có thể làm chủ việc con mất quyền [16].

### HubSpot

- Mô hình: Tasks là một object, gắn được nhiều bản ghi ở nhiều object (contact, company, deal, ticket, custom object, project). Việc không gắn gì vẫn được, chỉ không hiện trên timeline [33][35]. Việc tạo từ một contact tự gắn công ty chính và năm deal mở gần nhất của contact đó. Super Admin chỉnh được quy tắc này [35]. Loại việc cố định: Call, Email, To-do, LinkedIn [33].
- Quyền: mỗi object có phạm vi View/Edit/Delete = All / Their team's / Their (owned), cộng ô «Unassigned». Người chỉ có quyền View trên bản ghi vẫn tạo được việc. Muốn sửa việc trên bản ghi đó thì cần quyền Communicate [36]. Team lồng nhau chỉ có ở Enterprise; team cha thấy mọi thứ của team con [37]. Giới hạn sửa thuộc tính cần Enterprise [45].
- Việc của tôi và hàng đợi: task queue cá nhân hoặc chung, tối đa 20 queue mỗi người; đổ việc vào queue bằng workflow/sequence cần Pro/Ent [34].
- Sinh việc: sequence (Sales/Service Pro/Ent) chỉ ghi danh contact [41]. Playbook (Pro/Ent) có ô tick để tạo việc tiếp theo [40]. Meeting Notetaker tạo việc từ action item (Sales/Service Pro/Ent) [44].
- Bàn giao sau bán: projects object có ở mọi gói. Có pipeline, gắn deal/company/contact/task. Workflow «Create record: Project» khi deal Closed won (Pro/Ent) [38]. Subtasks (beta) chỉ cho việc dự án [42]. Gantt kéo đổi ngày cho project/deal/service kèm việc [43], nhưng còn beta và có điều kiện tài khoản [38]. HubSpot Work (beta) là một lớp quản lý dự án riêng với table, document và tác tử [39].
- Khách hay vấp: trạng thái việc gần như chỉ có hai nấc [46]. Nhiều thứ dự án còn beta. Tài liệu Gantt không nhắc phụ thuộc giữa việc [43].

### Zoho CRM (+ Zoho Projects)

- Mô hình: Tasks, Calls, Meetings là ba module riêng. Việc có Subject, Task Owner (một người), Due Date, Status, Priority, gắn contact/lead và một bản ghi Related To; có việc lặp, nhắc qua email/popup, trường tuỳ biến [48].
- Quyền: role hierarchy (cấp trên thấy dữ liệu cấp dưới; cùng cấp thì không, trừ khi bật Share Data with Peers), reporting manager, territory, sharing rule có «Superiors Allowed» [49][50]. Việc **không chia sẻ trực tiếp được**, chỉ đi kèm bản ghi cha khi chia sẻ «với related list» [51]. Field-level security từ Professional, data sharing rules và territory từ Enterprise [52].
- Sinh việc: Blueprint bắt buộc tạo việc, điền trường, đánh checklist khi chuyển trạng thái (Pro 3, Ent 50, Ult 100 blueprint) [52][54]. Cadences (email, việc, gọi, thêm WhatsApp từ 09/2025) mở cho mọi người dùng từ 04/2024 [55].
- Bàn giao sau bán: tạo dự án Zoho Projects từ Deal/Account/Contact, chọn mẫu, contact thành client user. Bình luận ở Zoho Projects về lại thành ghi chú trên CRM [53]. Tự tạo dự án khi deal thắng phải dùng custom function có sẵn trong thư viện (đọc qua đoạn trích) [60]. Gantt, critical path [58], tối đa 15 baseline [59] đều nằm ở Zoho Projects.
- AI: Zia Agents chạy ở hai chế độ: dùng danh tính người dùng, hoặc là «digital employee» có danh tính riêng [57].
- Khách hay vấp: CRM không có Kanban cho Activities [56]. Việc nằm ở hai app phải đồng bộ.

## Mẫu thiết kế đáng học

1. **Quyền của việc lấy từ bản ghi cha, ghi thành một mức mặc định chứ không thành luật ngầm.** Salesforce cho chọn giữa Private và Controlled by Parent [1]. Dataverse khai cascade Share/Reparent trên từng quan hệ cha–con [16]. Zoho cấm chia sẻ việc trực tiếp, chỉ cho đi kèm cha [51]. Với OneHub: việc gắn deal/công ty/kế hoạch onboard thì ai xem được bản ghi cha thì xem được việc. Việc không gắn gì thì chỉ chủ việc và cấp trên thấy.
2. **Phạm vi own/team/all có thêm «cả cây con» và giới hạn độ sâu.** Dataverse có bốn mức User/BU/Parent:Child BU/Org [15], cộng hierarchy security theo quản lý, có độ sâu [18]. HubSpot gọn hơn: All/Their team's/Their, thêm ô Unassigned; team cha thấy team con [36][37]. Mẫu HubSpot đủ cho OneHub; chỉ thêm «cả cây con» khi cần.
3. **Kế hoạch mẫu sinh việc thường với hạn tương đối.** Action Plan Template có việc, ưu tiên, số ngày tính từ ngày bắt đầu, người phụ trách. Việc sinh ra là Task thường, hiện ở danh sách việc chung, không có loại việc riêng [5][6]. Hợp với hướng «một loại việc» của OneHub: kế hoạch Onboard chỉ là mẫu sinh việc.
4. **Deal thắng → dự án là một bản ghi riêng, gắn deal, sinh bằng quy tắc.** HubSpot: workflow «Create record: Project» khi Closed won [38]. Dynamics: quote thắng sinh project contract [28]. Dự án là chỗ chứa việc, không phải một loại việc khác.
5. **Một danh sách việc gom mọi nguồn, cộng hàng đợi chung có nhận/trả.** Salesforce To Do List gom task, bước cadence, work item của Flow [4]. Dynamics queue có pick/release [24]. HubSpot shared queue để cả đội nhận việc [34].

## Bẫy / điều nên tránh

1. **Kế thừa kiểu «phải có quyền trên mọi cha».** Salesforce đòi quyền trên **tất cả** bản ghi việc gắn vào [1]. Gắn thêm một bản ghi là việc có thể biến mất với người trước đó vẫn thấy. Nếu OneHub cho một việc gắn nhiều bản ghi thì nên chọn «một trong các cha» cho quyền xem, hoặc tách một «cha chính» quyết định quyền.
2. **Giao nhiều người bằng cách nhân bản việc.** Salesforce sinh 200 bản sao khi giao 200 người [2]. Kết quả là không còn tiến độ chung, và sửa một bản không sửa các bản kia. Nên có một việc với nhiều người làm, hoặc việc con.
3. **Hai mô hình việc tách đôi.** Activity khác project task (Dynamics) [21][26]. CRM task khác Zoho Projects task, phải đồng bộ hai app [53]. Subtasks của HubSpot chỉ cho việc dự án [42]. Salesforce và Zoho không có Kanban cho việc [11][56]. OneHub đã chốt một loại việc: giữ đúng hướng đó, đừng để dự án có loại việc riêng.
4. **Hàng đợi bị hiểu nhầm là quyền.** Queue private của Dynamics chỉ lọc màn hình, không chặn truy cập [24]. Cascade đổi chủ hay đổi đơn vị cũng có thể làm chủ việc con mất quyền mà không báo [16].

## Câu hỏi còn mở, khẳng định chưa xác minh

- Salesforce: tài liệu API (developer.salesforce.com) trả 403, nên số contact tối đa của Shared Activities, cách tuỳ biến Status và chuyển việc khi nhân sự nghỉ đều chưa xác minh (A6, G8, J1).
- Salesforce Action Plans: giới hạn 200 việc và 1.000 ngày đọc từ đoạn trích tìm kiếm trang Industries, chưa thấy trên trang Sales Action Plans. Chưa rõ Sales Action Plans có tự sinh được khi opportunity Closed Won mà không cần Flow hay không.
- Dynamics: việc lặp (task, không phải appointment), checklist và việc con cho activity thường chưa tìm ra. Critical path và milestone của Project Operations chưa thấy trên trang đã đọc. Giấy phép Sales Professional/Premium so với Enterprise chưa tra bảng giá. Mục tiêu (Goal) có bảng goal/goalrollupquery [31] nhưng chưa đọc cách cuộn tiến độ.
- HubSpot: tài liệu nói trạng thái việc là Not started/Complete [46]. Một đoạn trích khác lại kể In progress, Waiting, Deferred cho chế độ bảng, nhưng chưa mở được trang gốc. Kết quả tìm kiếm có câu «Tasks now have their own set of view/edit permissions», chưa đọc được trang gốc. Chưa rõ thuộc tính tuỳ biến cho việc, bình luận trên việc, nhật ký kiểm toán.
- HubSpot Gantt: trang projects object ghi điều kiện «tài khoản Free/Starter tạo sau 30/03/2026 và ghi danh beta» [38]. Câu đọc lạ, cần kiểm lại trên trang.
- Zoho: chưa có trang chính hãng nói việc tự kế thừa quyền xem từ bản ghi cha khi Activities đặt Private (đoạn trích tìm kiếm có nói, nhưng không mở được nguồn). Trang việc của tôi, hàng đợi, đồng bộ lịch chưa tra. Gói giá của Zia Agents và Cadences chưa rõ.
- Cả bốn hãng: khối H (mục tiêu/OKR), I (báo cáo), J1/J3 phần lớn là `?`. Không tra thêm để giữ hạn mức tìm kiếm, còn 6 trong 30 lượt.

## Nguồn

[1] https://help.salesforce.com/s/articleView?id=platform.sharing_model_fields.htm&type=5 — Organization-Wide Default Access Settings (Activity Access Levels) — 2026-10-05
[2] https://help.salesforce.com/s/articleView?id=sales.task_considerations.htm&type=5 — Considerations for Using Tasks — 2026-10-05
[3] https://help.salesforce.com/s/articleView?id=sales.activities_shared_considerations.htm&type=5 — Considerations for Enabling Shared Activities — 2026-10-05
[4] https://help.salesforce.com/s/articleView?id=sales.to_do_list.htm&type=5 — Organizing and Completing Your Tasks with the To Do List — 2026-10-05
[5] https://help.salesforce.com/s/articleView?id=ind.fsc_action_plans.htm&type=5 — Action Plans (Industries); kèm đoạn trích tìm kiếm https://help.salesforce.com/s/articleView?id=sfdo.gm_create_action_plan_template.htm — 2026-10-05
[6] https://help.salesforce.com/s/articleView?id=sales.sales_action_plans.htm&type=5 — Sales Action Plans — 2026-10-05
[7] https://help.salesforce.com/s/articleView?id=ind.action_plans_editions_permissions.htm&type=5 — Action Plans Editions — 2026-10-05
[8] https://help.salesforce.com/s/articleView?id=sales.hvs_quick_cadences.htm&type=5 — Simplifying Outreach Tasks with Quick Cadences (editions của Sales Engagement) — 2026-10-05
[9] https://help.salesforce.com/s/articleView?id=sales.einstein_copilot_for_sales.htm&type=5 — Agentforce (Default) for Sales Setup — 2026-10-05
[10] https://help.salesforce.com/s/articleView?id=sales.sales_agent_sdr_intro.htm&type=5 — Agentforce Engagement Overview — 2026-10-05
[11] https://help.salesforce.com/s/articleView?id=xcloud.kanban.htm&type=5 — Use Kanban to Work with Graphical Views of Your Records — 2026-10-05
[12] https://help.salesforce.com/s/articleView?id=release-notes.rn_customization_activity_field_history.htm&release=242&type=5 — Track Field History for Activities (kèm đoạn trích về giới hạn 6 trường) — 2026-10-05
[13] https://help.salesforce.com/s/articleView?id=sales.activity_access_user_perm.htm&type=5 — Control Access to Activities — 2026-10-05
[14] https://www.salesforceben.com/customer-onboarding-project-management-for-salesforce-in-depth-review/ — Customer Onboarding & Project Management for Salesforce (bên thứ ba, đọc qua đoạn trích) — 2026-10-05
[15] https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges — Security roles and privileges for Dataverse — 2026-10-05
[16] https://learn.microsoft.com/en-us/power-apps/developer/data-platform/configure-entity-relationship-cascading-behavior — Configure table relationship cascading behavior — 2026-10-05
[17] https://learn.microsoft.com/en-us/dynamics365/sales/manage-activities — Track and manage activities — 2026-10-05
[18] https://learn.microsoft.com/en-us/power-platform/admin/hierarchy-security — Hierarchy security — 2026-10-05
[19] https://learn.microsoft.com/en-us/power-platform/admin/about-team-templates — Use access and owner team templates — 2026-10-05
[20] https://learn.microsoft.com/en-us/dynamics365/sales/create-and-activate-a-sequence — Sequence creation and activation in the sales accelerator — 2026-10-05
[21] https://learn.microsoft.com/en-us/power-apps/developer/data-platform/activity-entities — Activity table (Microsoft Dataverse) — 2026-10-05
[22] https://learn.microsoft.com/en-us/dynamics365/sales/sales-accelerator-intro — Understand what is sales accelerator — 2026-10-05
[23] https://learn.microsoft.com/en-us/dynamics365/sales/enable-configure-sales-accelerator — Configure the sales accelerator — 2026-10-05
[24] https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/set-up-queues-manage-activities-cases — Create and manage basic queues — 2026-10-05
[25] https://learn.microsoft.com/en-us/dynamics365/sales/ai-agent-overview — AI agents in Dynamics 365 Sales — 2026-10-05
[26] https://learn.microsoft.com/en-us/dynamics365/project-operations/project-management/create-wbs — Create a work breakdown structure — 2026-10-05
[27] https://learn.microsoft.com/en-us/dynamics365/project-operations/project-management/project-and-task-limitations — Project and task limitations — 2026-10-05
[28] https://learn.microsoft.com/en-us/dynamics365/project-operations/sales/sales-overview — Sales process overview (Project Operations) — 2026-10-05
[29] https://learn.microsoft.com/en-us/dynamics365/project-operations/project-management/baselines — Set up baselines — 2026-10-05
[30] https://learn.microsoft.com/en-us/power-platform/admin/field-level-security — Column-level security — 2026-10-05
[31] https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing — Manage Dataverse auditing — 2026-10-05
[32] https://learn.microsoft.com/en-us/dynamics365/project-operations/toc.json — Mục lục tài liệu Project Operations (chỉ xác nhận có trang: Project templates, Define project calendars, Schedule assistant, Import projects from the Microsoft Project desktop client, Use Project schedule APIs, Restricted guest user access) — 2026-10-05
[33] https://knowledge.hubspot.com/tasks/create-tasks — Create tasks — 2026-10-05
[34] https://knowledge.hubspot.com/tasks/use-task-queues — Use task queues — 2026-10-05
[35] https://knowledge.hubspot.com/records/associate-activities-with-records — Associate activities with records — 2026-10-05
[36] https://knowledge.hubspot.com/user-management/hubspot-user-permissions-guide — HubSpot user permissions guide — 2026-10-05
[37] https://knowledge.hubspot.com/user-management/create-and-manage-teams — Create and manage teams — 2026-10-05
[38] https://knowledge.hubspot.com/records/understand-and-use-projects-object — Understand and use the projects object — 2026-10-05
[39] https://knowledge.hubspot.com/ai/set-up-hubspot-work — Set up HubSpot Work — 2026-10-05
[40] https://knowledge.hubspot.com/playbooks/use-playbooks — Use playbooks — 2026-10-05
[41] https://knowledge.hubspot.com/sequences/create-and-edit-sequences — Create and edit sequences — 2026-10-05
[42] https://knowledge.hubspot.com/tasks/use-subtasks-with-objects — Use subtasks — 2026-10-05
[43] https://knowledge.hubspot.com/records/use-the-updated-calendar-and-gantt-views — Use the report, calendar, and gantt views — 2026-10-05
[44] https://knowledge.hubspot.com/sales-tools/use-ai-to-close-deals-faster — Use AI to close deals faster — 2026-10-05
[45] https://knowledge.hubspot.com/properties/restrict-view-edit-access-for-properties — Restrict access to properties — 2026-10-05
[46] https://knowledge.hubspot.com/properties/hubspots-default-activity-properties — HubSpot's default activity properties — 2026-10-05
[47] https://knowledge.hubspot.com/mobile/use-tasks-in-the-hubspot-mobile-app — Create, view, and complete tasks in the HubSpot mobile app (chỉ thấy tiêu đề trong kết quả tìm kiếm) — 2026-10-05
[48] https://help.zoho.com/portal/en/kb/crm/sales-force-automation/activities/articles/working-with-tasks-and-meetings — Working with Tasks — 2026-10-05
[49] https://help.zoho.com/portal/en/kb/partner-support-solutions-tbs/troubleshooting-steps/zoho-crm-partner-support-tbs/articles/explore-how-records-are-shared-acorss-users-in-zoho-crm-a-troubleshooting-guide — How Records Are Shared across Users in Zoho CRM — 2026-10-05
[50] https://help.zoho.com/portal/en/kb/crm/faqs/roles-and-profiles/articles/faqs-roles-and-profiles — FAQs on Roles and Profiles — 2026-10-05
[51] https://www.zoho.com/crm/developer/docs/api/v8/share-record.html — Share Records API — 2026-10-05
[52] https://www.zoho.com/crm/comparison.html — Zoho CRM edition comparison (trang giá của hãng) — 2026-10-05
[53] https://help.zoho.com/portal/en/kb/crm/integrations/zoho/zoho-projects/articles/use-zoho-projects-crm-integration — Zoho Projects Integration — 2026-10-05
[54] https://help.zoho.com/portal/en/kb/crm/process-management/blueprint/articles/execute-blueprint — Execute Blueprint — 2026-10-05
[55] https://help.zoho.com/portal/en/community/topic/unveiling-cadences-studio-redefining-crm-interactions-with-automated-sequential-follow-ups — Unveiling Cadences (bài của Zoho trên community) — 2026-10-05
[56] https://help.zoho.com/portal/en/kb/crm/customize-crm-account/managing-module-views/articles/kanban-views — Kanban View — 2026-10-05
[57] https://www.zoho.com/crm/zia/agents.html — Zia Agents for Zoho CRM — 2026-10-05
[58] https://help.zoho.com/portal/en/kb/projects/tasks/tasks/task-operations/articles/critical-path-27-12-2023 — Critical Path (Zoho Projects, đọc qua đoạn trích) — 2026-10-05
[59] https://help.zoho.com/portal/en/kb/projects/tasks/tasks/task-operations/articles/projects-baseline — Baseline (Zoho Projects, đọc qua đoạn trích) — 2026-10-05
[60] https://help.zoho.com/portal/en/community/topic/convert-closed-won-potential-to-zoho-project — Convert closed/won potential to Zoho Project (community, đọc qua đoạn trích) — 2026-10-05
[61] https://help.zoho.com/portal/en/kb/crm/security-control/manage-data-sharing/articles/setting-up-data-sharing-rules — Setting up Data Sharing Rules — 2026-10-05
