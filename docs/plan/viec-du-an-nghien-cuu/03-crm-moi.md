# CRM thế hệ mới và tầm trung: Pipedrive, Attio, Odoo, Bitrix24, monday CRM, Freshsales

Ngày tra: 2026-10-05 · Số lượt WebSearch đã dùng: 10

Cách tra: đọc thẳng trang trợ giúp chính hãng. Với Odoo, đọc thêm mã nguồn mở trên
GitHub (nhánh 18.0/19.0) để thấy mô hình dữ liệu và luật quyền thật, vì tài liệu
người dùng không nói ai thấy activity. support.monday.com chặn trình đọc trang (403)
nên đọc qua API của trung tâm trợ giúp (Zendesk) — cùng nội dung bài. Trang hỗ trợ
Freshsales phần lớn cập nhật 2023–2024, nên ô Freshsales có thể đã cũ.

Cột «Odoo» gồm mail.activity (dùng chung mọi model), ứng dụng Project, To-do và
Planning. Gantt, Planning không có trong kho mã nguồn mở (chỉ bản Enterprise, gói trả
phí). Cột «Pipedrive» gồm activity và Projects (Premium trở lên; Lite/Growth mua thêm
theo người). Ô ghi «(dự án)» nghĩa là chỉ việc trong dự án có, activity thường thì không.

## Bảng chấm

| Mã | Pipedrive | Attio | Odoo | Bitrix24 | monday CRM | Freshsales |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Đ — activity gắn người/tổ chức/lead/deal/dự án, nhưng việc dự án là loại thứ hai [7][4] | M — gắn bản ghi của mọi object kể cả object tự tạo [17][19] | M — activity là mixin cho mọi model có chatter (res_model + res_id) [30][28] | Đ — task gắn deal/lead/liên hệ/công ty, song song có CRM activity riêng [49][61] | Y — chỉ activity trên bảng Contacts/Leads/Accounts/Deals; việc là item của bảng [69] | Đ — task gắn liên hệ/tài khoản/deal [92] |
| A2 | Y — một deal + một người + một tổ chức, tự kéo theo chuỗi deal→người→tổ chức [7] | M — `linked_records` là mảng [19] | – — mỗi activity đúng một (res_model, res_id) [30] | ? | Đ — manual association chọn nhiều bản ghi cho một mục timeline [70] | – — một ô «Related to» [92] |
| A3 | Y (dự án) — task → subtask, một tầng [4] | – — API không có quan hệ cha/con [19] | M (dự án) — parent_id nhiều tầng; activity không có [32] | Đ — task cha/con [49] | M — tối đa 4 tầng subitem, bảng mới [79] | ? |
| A4 | – — không có activity lặp [8][9] | – — mô hình task không có trường lặp [19] | Đ (dự án) — việc lặp ngày/tuần/tháng; activity không lặp [46][32] | Đ — lặp qua mẫu việc [56] | Y — qua automation «every time period» [80] | ? |
| A5 | Đ — loại mặc định + tự tạo [7] | – [19] | M — activity type: hành động, người mặc định, ghi chú mặc định, nối tiếp [28][30] | ? | Đ — custom activity [69] | Đ (Pro) — custom sales activity [94] |
| A6 | Y — chỉ done/chưa done; dự án có phase [4] | Y — chỉ hoàn thành/chưa [19] | M (dự án) — stage tự đặt + 5 trạng thái cố định + Waiting [37][32] | M — trạng thái cố định + kanban dự án + Planner cá nhân [59][54][58] | Đ — Status column tự đặt nhãn, không có nhóm cố định [71] | Y — mở/hoàn thành + outcome [100] |
| A7 | Đ — ưu tiên trên task/activity, nhãn dự án [4][2] | – [19] | Đ — ưu tiên 2 mức + tag [32] | Đ — cờ quan trọng + tag [55][49] | Đ — Priority column [75] | ? |
| A8 | ? — dự án có trường tự tạo, task/activity chưa xác minh [2] | – — task không phải object [19] | Đ — property field; Studio trả phí [46][44] | Đ [49] | M — cột bất kỳ [71] | Đ — trường tự tạo cho sales activity (chỉ thấy tiêu đề bài) [104] |
| A9 | Y (dự án) — dùng subtask thay checklist [4] | – [19] | Đ — to-do list trong mô tả việc [46] | M — checklist nhiều tầng, giao người, đính tệp [55] | Y — dùng subitem [79] | ? |
| A10 | Đ — task dự án nhiều người làm; activity một chủ + khách mời [4] | Đ — nhiều assignee, không có người theo dõi [19] | M (dự án) — user_ids nhiều người + follower; activity một người [32][30] | M — người giao, một người làm, người đồng thực hiện, người theo dõi [49] | Đ — People column nhiều người [75] | Đ — owner + collaborators, giao cả team [92][93] |
| A11 | Đ — ghi chú, @nhắc, tệp trong dự án [1] | Y — bình luận ở bản ghi, không ở task [23] | M — chatter trên task; activity có ghi chú + tệp [30][46] | M — chat riêng của việc, tệp đồng bộ Drive [56][49] | M — updates, @nhắc [69] | ? |
| A12 | ? | – [19] | M — giờ phân bổ + Timesheets [32][40] | Đ (Professional) — kế hoạch vs thực tế [55][68] | Đ (Pro) — Time Tracking column [89] | ? |
| A13 | Đ (dự án) — History có changelog trường và trạng thái [1] | ? — lịch sử sửa thuộc tính (Pro) chỉ thấy cho bản ghi [24] | M — tracking trên các trường của task [32] | Đ — lịch sử việc [56] | Đ — Activity Log, giữ 1 tuần→5 năm theo gói [90] | ? |
| B1 | Đ — danh sách activity bật thêm «Project tasks» [6] | Đ — trang Tasks + Home (hôm nay/mai/quá hạn) [17] | Đ — hai chỗ: đồng hồ activity theo ứng dụng + My Tasks [28][41] | Đ — hai chỗ: Tasks lọc theo vai + My activities của CRM [50][61] | Đ — My Work mọi bảng, trần 50 bảng/1000 item [75] | Đ — Activities Dashboard [92] |
| B2 | ? | ? | ? | ? | ? | ? |
| B3 | Đ — email tổng hợp hằng ngày gồm task dự án [6] | Đ — báo khi được giao + nhắc hằng ngày [17] | Đ — báo người được giao khi tạo [30] | M — nhắc riêng từng vai; người theo dõi mặc định tắt tiếng [55][57] | Đ — nhắc qua automation [80] | Đ — email + báo trong ứng dụng cho owner và collaborator [97] |
| B4 | Đ — chia sẻ bộ lọc (quyền riêng) [11] | Y — sắp/nhóm/lọc trang Tasks chỉ riêng mình [17] | ? | Đ — bộ lọc tự tạo [50] | M — view của bảng dùng chung [71] | ? |
| B5 | M — đồng bộ hai chiều Google/Exchange/Outlook, chỉ activity của mình [9] | ? | Đ — chỉ loại Meeting sang Calendar [28] | ? | Đ — bảng Activities nối Google/Outlook [69] | Đ — đồng bộ task + sales activity (chỉ thấy tiêu đề bài) [103] |
| B6 | Y — chọn chủ activity [7] | Y — giao người khác [18] | Y — đổi người được giao [28] | Đ — quyền Delegate task; quản lý luôn uỷ quyền được [51] | Y [75] | Y — giao team [93] |
| C1 | M (Premium+) [1] | Y — chỉ dựng bằng object tự tạo [22] | M [33] | M — dự án/workgroup; không giới hạn từ Standard [54][68] | Đ — board/dự án [79] | ? |
| C2 | M — mẫu dự án, hạn tương đối theo ngày bắt đầu, phụ thuộc trong mẫu [5] | ? | M — activity plan (trước/sau ngày mốc, «Ask at launch») + mẫu dự án tự xếp lịch theo lịch làm việc [29][31][38] | Đ — mẫu việc có vai, hạn, tệp [50] | Y — automation tạo item [80] | ? |
| C3 | Đ — sức khoẻ dự án đặt tay hoặc AI gợi ý; báo cáo hiệu suất dự án [1][2] | ? | M — trạng thái On Track/At Risk/Off Track/On Hold + project update [33][40] | ? | ? | ? |
| C4 | M — gắn deal, kéo tệp/ghi chú/email của tối đa 50 deal [1][3] | ? | Đ — khách hàng trên dự án; dự án sinh từ đơn bán [33][36] | Y — gắn ở mức việc, không ở dự án [49] | Đ — Connect Boards [86] | ? |
| C5 | M — «Mark as won and create a project»; automation + mẫu (Growth+) [1][5] | ? | Đ — xác nhận đơn bán có dịch vụ → sinh dự án/việc [36] | Đ — automation: deal sang stage → tạo task; deal thắng → đóng task [62] | Đ — automation tạo item ở bảng khác khi status đổi [86] | Y — workflow chỉ tạo task lẻ [97] |
| C6 | Y (beta) — báo cáo AI chia sẻ link chỉ xem/PDF [1] | – — không chia sẻ list ra ngoài [23] | M — portal: khách xem/sửa việc dự án được chia sẻ [34][46] | M — collab có khách, quyền việc riêng [66] | M (Standard+) — guest trên shareable board [85] | ? |
| D1 | Đ — board theo phase của dự án [1] | Đ — kanban cho bản ghi, task thì không [24] | M — kanban theo stage của việc [37] | M — Kanban dự án + Planner cá nhân [54][58] | Đ — chỉ từ Status column [88] | Y — kanban chỉ cho deal [102] |
| D2 | Đ — theo phase hoặc nhóm tự tạo [4] | Y — chỉ thuộc tính kiểu status [24] | ? | ? | Y — chỉ Status column [88] | ? |
| D3 | ? | ? | ? | ? | Đ — «Divide by» nhóm/status/Connect Board [88] | ? |
| D4 | ? | ? | ? | ? | ? | ? |
| D5 | ? | ? | ? | Y — bắt ghi kết quả trước khi đóng việc [55] | Đ (Ultimate) — Conditional status change [87] | ? |
| E1 | Đ (dự án) — ngày→năm, kéo dời [4] | – — chỉ có view bảng và kanban [25] | M (Enterprise) [46] | Đ (Free) [52][68] | M (Standard+) — nhiều bảng trong widget [71] | ? |
| E2 | Y — chỉ chặn/chờ (kiểu FS) [5] | – [25] | Y — chỉ «Blocked by» (FS) [39] | M — FS/SS/FF/SF, chặn vòng lặp [53] | Đ (Pro) — Dependency column [72] | ? |
| E3 | ? — dời cả khối giữ khoảng cách, chưa thấy tự đẩy theo phụ thuộc [6] | – [25] | Đ — giữ hoặc dùng khoảng đệm khi dời (18.4) [48][46] | M — đổi ngày việc chính thì việc phụ thuộc tự đổi [53] | M (Pro) — Flexible/Strict/No action [72] | ? |
| E4 | ? | – [25] | Đ (Enterprise) — từ 18.1 [47] | ? | Đ (Pro) — còn là tính năng thử [73][71] | ? |
| E5 | ? | – [25] | ? | ? | M (Pro) — nhiều bản chụp baseline [74] | ? |
| E6 | Đ — milestone [4] | – [25] | Đ [40] | ? | Đ (Pro) [71] | ? |
| E7 | ? | – [25] | M — xếp lịch theo lịch làm việc, nghỉ phép, ngày lễ [38] | Đ — bỏ cuối tuần theo lịch công ty [49] | Đ — lịch làm việc theo team trong Workload [78] | ? |
| E8 | Y — báo cáo phân bổ việc theo người [2] | ? | M (Enterprise) — Planning: ca, vai, Auto Plan [45] | Đ — xem tải trên lịch; quản lý tải ở bảng giá [50][68] | M — Workload view [78] | ? |
| F1 | M (Growth+) — trigger trên deal/người/activity/lead/tổ chức/dự án [12] | M — block Create task trong workflow [20] | Đ — chuỗi activity; automation theo stage cần Studio (trả phí) [28][37] | M — tạo task theo stage, theo dõi task để chuyển stage, đóng task [62] | M — automation cùng bảng và khác bảng [86] | Đ — workflow tạo task, hạn tương đối [97] |
| F2 | Đ — Sequences cho deal/lead [13] | Đ — Sequences [27] | Đ — Suggest/Trigger Next Activity [28] | ? | Đ — Sequences [87] | Đ — sales sequences [99] |
| F3 | ? | ? | Đ — ghi chú mặc định + mẫu email theo loại activity [28][29] | Đ — mẫu việc kèm checklist; bắt ghi kết quả [50][55] | ? | ? |
| F4 | Y (beta) — AI tóm tắt bàn giao deal, gợi ý sức khoẻ dự án; Sales Assistant hỏi đáp [3][1][15] | M — Ask Attio tạo task từ chat, đọc cuộc gọi/ghi chú/email [26][17] | Đ — AI agent + AI server action + AI field (19.0) [42][43][44] | M — CoPilot viết mô tả, sinh checklist, tạo việc từ tin thoại và cuộc gọi [63][56] | Y — AI blocks điền cột, tóm tắt timeline [83] | Đ — Freddy gợi ý next best action cho deal [102] |
| F5 | ? | Y — Ask Attio làm hộ trong quyền người dùng, không nhận việc [26] | Đ — AI server action chọn tool và chạy trên bản ghi [43] | Y — chỉ thấy câu trên bảng giá [68] | Đ (beta, Mỹ) — AI Sales Agent, AI Lead Agent [82][83] | ? |
| G1 | Đ (Premium+ cho bộ tự tạo) — permission set có mục Projects [11] | Đ (Plus/Pro/Enterprise) — quyền theo object và list [21][22] | M — nhóm + ACL + record rule [34][35] | M — vai CRM đọc/thêm/sửa/xoá/xuất; vai riêng cho Tasks (Professional) [64][51] | Đ — loại người dùng + quyền bảng [84][76] | M (Pro/Enterprise) — vai tự tạo, phạm vi riêng cho xem/sửa/xoá [95] |
| G2 | M (Premium+) — chủ/nhóm/nhóm + nhóm con/tất cả [10] | – — bản ghi luôn hiện cho mọi người [23] | Đ — «Personal Leads» vs «All Leads» [35] | M — của mình/phòng/phòng + phòng con/tất cả [64] | Y — chỉ mức bảng; «Only edit assigned items» (Pro) [76] | M — Owned/Territory/All theo từng hành động [95] |
| G3 | ? | – — task ai cũng xem và sửa [23] | M — đọc = được giao HOẶC đọc được bản ghi; sửa = sửa được bản ghi [30] | M — CRM activity ăn quyền bản ghi CRM; task thì quyền riêng [65][51] | Đ — item theo quyền bảng [76] | M — «Related Access» theo bản ghi liên quan [95] |
| G4 | Đ — visible-to từng bản ghi, follower [10] | Đ (Pro) — quyền list cho người/team [21] | Đ — mời follower vào dự án/việc [34] | Đ — người đồng thực hiện/theo dõi [49] | Đ — mời vào bảng riêng [91] | Đ — quyền Share [95] |
| G5 | ? | ? | Đ — groups trên trường, cấu hình kỹ thuật [33] | ? | M (Pro) — giới hạn xem/sửa cột [77] | M — sửa/chỉ đọc/ẩn theo vai [96] |
| G6 | ? | – [23] | M — việc riêng không dự án (khoá), to-do [41][34] | M — vai mặc định chỉ thấy việc của mình [51] | Đ (Pro) — private board [91] | ? |
| G7 | Y — link chỉ xem [1] | Y — thành viên giới hạn một list vẫn thấy mọi bản ghi [23] | M — portal user [34] | M — khách trong collab [66] | M — guest, viewer [85][84] | Đ — Restricted User [95] |
| G8 | Y — chuyển automation khi người nghỉ [12] | ? | ? — xoá người dùng thì activity bị xoá theo [30] | Đ — Delegate task [51] | ? | Đ — Transfer records (admin) [98] |
| G9 | Đ (Ultimate) — audit log [16] | Y (Pro) — lịch sử sửa thuộc tính [24] | Đ — tracking trong chatter [32] | Đ — lịch sử việc [56] | Đ — Activity Log theo gói [90] | Y — chỉ thay đổi cấu hình, 90 ngày [99] |
| H1 | ? | ? | ? | Y — KPI hiệu quả việc (Standard) [68] | ? | Y — activity goal [95] |
| H2 | ? | ? | ? | ? | ? | ? |
| H3 | ? | ? | ? | ? | ? | ? |
| I1 | Đ — báo cáo hiệu suất activity [7] | ? | Đ — Task Analysis, burndown [34][40] | Đ — thống kê việc theo người [57] | Đ — dashboard bảng Activities [69] | Đ — quyền Analytics theo vai [95] |
| I2 | M — overview: health, progress, needs attention; báo cáo hiệu suất + thời lượng dự án [1][2] | ? | M — dashboard: update, milestone, lãi lỗ, burndown [40] | ? | Đ — widget Gantt trong dashboard [71] | ? |
| J1 | ? | M — API tasks [19] | ? | Đ — API cho tasks [68] | Đ — platform API [84] | ? |
| J2 | Đ — Projects trên di động [1][7] | ? | ? | M — tạo, lọc việc trên di động [49][54] | Đ — My Work trên di động [75] | Đ — màn chính di động có task (chỉ thấy tiêu đề bài) [105] |
| J3 | Đ — nhập dự án từ bảng tính [1] | Đ — xuất view (Enterprise chặn được) [22][23] | Đ — nhập/xuất bảng tính [46] | Đ — quyền nhập/xuất việc [51] | Đ — nhập Excel [87] | ? |

## Mỗi sản phẩm: cách họ quy hoạch việc

### Pipedrive — hai loại việc, dự án là «sau bán»
- **Activity** là việc chính của CRM: có loại (mặc định + tự tạo), ngày giờ, thời lượng,
  Busy/Free, khách mời, một chủ; gắn deal/người/tổ chức/lead/dự án. Gắn deal thì tự
  gắn luôn người và tổ chức của deal [7]. Không có activity lặp [8].
- **Projects** (Premium+, add-on theo người ở Lite/Growth) sinh ra cho việc sau khi thắng
  deal: onboarding, triển khai, giao hàng [2]. Board → phase giống pipeline; trong dự
  án có 4 loại: task, subtask (1 tầng), milestone, activity. Task có nhiều người làm,
  ưu tiên, ngày bắt đầu/hạn, phase hoặc nhóm tự tạo [4].
- Tạo dự án từ deal bằng nút «Mark as won and create a project», từ panel deal khi
  còn mở, hoặc automation khi deal thắng + mẫu dự án [1][5]. Mẫu có hạn tương đối
  theo ngày bắt đầu, có phụ thuộc chặn/chờ; chuyển dự án đang chạy thành mẫu [5].
- Dự án gắn deal thì thấy luôn tệp/ghi chú/email của deal (tối đa 50 deal) và có
  «deal handover brief» do AI viết, gợi ý điền trường dự án (beta) [3].
- Chuyển dự án sang phase kế → hỏi đóng các việc còn mở của phase cũ; huỷ dự án → hỏi
  xoá việc còn lại [6].
- Quyền: permission set (làm được gì) tách khỏi visibility group (thấy được gì) [10][11].
  Tài liệu visibility chỉ nói lead/deal/người/tổ chức/sản phẩm — chưa thấy dự án và
  activity theo luật nào.
- Điểm yếu: hai loại việc → «việc của tôi» phải bật thêm «Project tasks» mới gộp được [6];
  activity một chủ, không lặp, không subtask.

### Attio — một việc tối giản, gắn nhiều bản ghi
- Task chỉ có: nội dung, hạn, đã xong, `linked_records[]`, `assignees[]` [19]. Không có
  trạng thái, ưu tiên, việc con, lặp, trường tự tạo, bình luận.
- Tạo bằng phím `t` ở bất cứ đâu, `@` để gắn bản ghi hoặc giao người, hạn bằng ngôn ngữ
  tự nhiên («follow up next week») [17][18]. Đang đứng ở bản ghi nào thì task tự gắn
  bản ghi đó [18].
- Trang Tasks gom mọi task; Home hiện hạn hôm nay/mai/quá hạn; mỗi bản ghi có tab Tasks [17].
- Quyền theo object và list (Full/Read and write/Read only/No access), theo workspace,
  team, người (Pro+) [21][22]. Nhưng **task luôn hiện và sửa được với mọi người**, bản
  ghi cũng không ẩn được theo người [23].
- AI: Ask Attio đọc cuộc gọi, ghi chú, email, bản ghi; tạo task, sửa bản ghi, dựng
  workflow; chạy trong quyền của người hỏi [26]. Workflow có block Create/Update/Complete
  task [20].
- Không có dự án, Gantt, timeline [25].

### Odoo — activity là mixin, project là ứng dụng riêng
- `mail.activity`: `res_model_id/res_model` + `res_id` (Many2oneReference) — một bản ghi
  bất kỳ của model có `mail.activity.mixin`; `activity_type_id`, `summary`, `note`,
  `date_deadline` (bắt buộc), `user_id` (một người, bắt buộc), `state` tính ra
  (overdue/today/planned/done), `automated`, `attachment_ids` [30]. Làm xong thì activity
  bị xoá và để lại một tin nhắn trong chatter, trừ khi loại đó bật «Keep Done» [30][28].
- **Ai thấy activity** (`_check_access`): đọc = luật quyền VÀ (được giao HOẶC đọc được
  bản ghi gốc); tạo = luật VÀ có quyền sửa/đăng tin trên bản ghi gốc; sửa/xoá = luật HOẶC
  quyền sửa/đăng tin trên bản ghi gốc [30]. Người được giao tự thành follower của bản ghi.
- **Activity type**: hành động (gọi, họp, tải tài liệu, xin chữ ký), người mặc định,
  ghi chú mặc định, mẫu email, «Suggest/Trigger Next Activity» với khoảng cách tính từ
  hạn hoặc ngày xong [28][29].
- **Activity plan** (`mail.activity.plan` + `.template`): mỗi bước = loại, tóm tắt,
  «Assignment: Ask at launch / Default user», khoảng N ngày/tuần/tháng trước/sau «plan
  date». Áp được cho mọi model có chatter [31]. Khi chạy: chọn kế hoạch, ngày mốc, một
  người nhận các bước «Ask at launch» [29]. Đây là khuôn từng dùng cho onboarding nhân sự.
- **Project**: task có stage tự đặt (cột kanban, dùng riêng hoặc chung giữa dự án) và
  5 trạng thái cố định (In Progress, Changes Requested, Approved, Cancelled, Done) +
  Waiting khi bị chặn [37][32]. Task cha/con nhiều tầng, nhiều người làm, phụ thuộc
  «Blocked by», milestone, việc lặp, giờ phân bổ [32]. Mẫu dự án có «Project Roles» và
  tự xếp lịch theo lịch làm việc, nghỉ phép, ngày lễ [38].
- Quyền dự án: Visibility = người được mời / mọi nhân viên / thêm khách portal [33]; luật
  record rule dựa follower [34]. Việc không có dự án là việc riêng (khoá) [41].
- Điểm yếu: hai khái niệm việc (activity vs task, cộng To-do) — chính tài liệu phải nhắc
  «The To Do activity is not a to-do task» [41]. Gantt, Planning, Studio là gói trả phí.

### Bitrix24 — trọn bộ, vai trong việc rõ nhất
- Task có 4 vai: **người giao** (duyệt kết quả), **người làm** (đúng một), **người đồng
  thực hiện**, **người theo dõi**. Nhập nhiều người làm → Bitrix tách thành nhiều task
  liên kết [49]. Vai chỉ nói ai dính vào việc, không giới hạn quyền sửa [51].
- Tuỳ chọn hạn: bắt duyệt khi xong, hạn mặc định, cho/không cho người làm dời hạn (bắt
  lý do, giới hạn số lần), bỏ cuối tuần, việc cha tự đóng khi con xong [49][55].
- Năm cách xem: List, Deadline, Planner (kanban cá nhân, không đổi hạn), Calendar,
  Gantt [50][58]; dự án có thêm Kanban chung [54]. Gantt có FS/SS/FF/SF, tự dời việc
  phụ thuộc, chặn vòng lặp — ngay ở gói Free [53][68].
- CRM có **hai loại**: CRM activity (việc với khách, quyền ăn theo bản ghi CRM [65]) và
  task (quyền riêng của Tasks [51]). Task tạo từ timeline deal; kanban CRM hiện trạng thái
  task mới nhất [59]. Automation: deal sang stage → tạo task; task đạt trạng thái → chuyển
  stage deal; deal thắng → đóng task do automation tạo [62].
- Quyền Tasks: vai Full access / Supervisor (trưởng phòng luôn thấy việc cấp dưới) /
  Manager (mặc định chỉ thấy việc của mình); chỉnh vai cần Professional [51]. Dự án có bộ
  quyền riêng, đè lên quyền chung [51][67]. Khách ngoài làm việc trong «collab» [66].
- AI: CoPilot viết mô tả, sinh checklist, tóm tắt chat việc; tin thoại có giao việc thì
  tự tạo task (chỉ di động) [63][56].
- Giá theo tổ chức, không theo người: Standard 50 người, Professional 100 người [68].

### monday CRM — mọi thứ là item trên bảng
- Không có đối tượng «việc» riêng: việc là item của một bảng, có People/Status/Date/
  Priority column [75]. Activity (họp, gọi, ghi chú, tự tạo) chỉ có trên bảng thực thể
  CRM, tự đổ về bảng «Activities» ai cũng thấy [69]. Một mục timeline gắn được nhiều bản
  ghi bằng manual association [70].
- My Work gom item được giao từ mọi bảng, chia Past/Today/This week/Next week/Later; trần
  50 bảng hoặc 1000 item [75].
- Gantt (Standard+), phụ thuộc (Pro+) với ba chế độ Flexible/Strict/No action, critical
  path (đang thử), baseline (Pro+), Workload [71][72][73][74][78]. Kanban chỉ chia cột theo
  Status column, có «Divide by» làm làn ngang [88].
- Quyền theo bảng: Edit everything / Only edit content / Only edit assigned items (Pro) /
  View and comment; quyền cột (Pro) [76][77]. Guest chỉ vào shareable board [85].
- Bàn giao sau bán: tự ráp bằng automation khác bảng «create item in board & connect
  boards» [86]. AI: Sales Agent gọi điện/SMS, Lead Agent tìm lead (beta, chỉ Mỹ) [82].

### Freshsales — task bán hàng gọn, quyền theo bản ghi
- Task: tiêu đề, mô tả, hạn, owner, «Related to» một liên hệ/tài khoản/deal,
  collaborators bao nhiêu cũng được, giao cả team [92][93]. Xong thì ghi outcome [100].
- Custom sales activity (Pro+) cho các loại gặp gỡ khác [94]. Workflow tạo task với hạn
  tương đối theo ngày chạy hoặc trường ngày [97].
- Quyền: vai tự tạo (Pro/Enterprise), phạm vi Owned/Territory/All tách riêng cho xem,
  sửa, xoá; sales activity theo «Related Access» — thấy được bản ghi thì thấy việc của nó
  [95]. Quyền trường: sửa/chỉ đọc/ẩn [96]. Chuyển toàn bộ bản ghi khi người nghỉ [98].
- Không có dự án, Gantt; kanban chỉ cho deal. AI: Freddy gắn nhãn deal (At Risk, Gone
  Cold…) và gợi ý next best action [102].

## Mẫu thiết kế đáng học

1. **Việc trỏ tới bản ghi bằng cặp (loại, id), quyền ăn theo bản ghi** (Odoo [30],
   Freshsales «Related Access» [95], CRM activity của Bitrix [65]). Luật Odoo đáng chép gần
   nguyên: *thấy việc nếu được giao HOẶC thấy bản ghi; sửa việc nếu sửa được bản ghi*. Nhờ
   vế «được giao» mà người ngoài khối kinh doanh vẫn làm được việc mình nhận mà không mở
   được cả deal — khớp vai «chỉ OKR». Attio thêm bước nữa: một việc trỏ **nhiều** bản ghi
   [19]. Với OneHub: bảng liên kết việc ↔ bản ghi (nhiều-nhiều), quyền đọc = OR giữa các
   bản ghi gắn + được giao.
2. **Kế hoạch = danh sách bước có hạn tương đối và vai chờ điền** (Odoo activity plan
   [29][31], mẫu dự án Pipedrive [5], mẫu dự án Odoo với Project Roles [38]). Mỗi bước:
   loại, tóm tắt, «trước/sau ngày mốc N ngày», người làm cố định hoặc «hỏi lúc chạy». Chạy
   kế hoạch = sinh việc thật; sửa mẫu không đụng việc đã sinh. Đây đúng là hình của kế
   hoạch onboard đối tác OneHub đang có.
3. **Deal thắng → dự án bàn giao kéo theo ngữ cảnh** (Pipedrive [1][3][5]): nút «thắng và
   tạo dự án», chọn mẫu, ngày bắt đầu; dự án đọc được tệp/ghi chú/email của deal; AI viết
   bản bàn giao rồi để người nhận chấp nhận/sửa từng trường. Chuyển phase thì hỏi đóng việc
   còn mở [6].
4. **Hai lớp trạng thái**: nhóm trạng thái cố định (mở / chờ / xong / huỷ) để báo cáo và
   quy tắc, cộng cột kanban tự đặt theo dự án (Odoo [37]); thêm cột kanban **cá nhân** cho
   «việc của tôi» (Odoo personal stage [32], Bitrix Planner [58]). Kéo việc ở bảng cá nhân
   không đổi trạng thái chung.
5. **Vai trong việc tường minh** (Bitrix [49]): một người làm chịu trách nhiệm, người đồng
   thực hiện, người theo dõi (mặc định tắt tiếng [57]), người giao duyệt kết quả khi bật
   «bắt duyệt». Cùng với «bắt ghi kết quả trước khi đóng» [55] — hợp với việc bàn giao cần
   bằng chứng.

**Kanban/Gantt bao nhiêu là đủ cho CRM.** Mặt bằng chung của nhóm này: kanban theo trạng
thái + nhóm theo một trường; Gantt có thanh ngày, phụ thuộc kiểu FS, milestone, bỏ cuối
tuần, kéo dời cả khối. Pipedrive Projects chỉ có chặn/chờ [5]; Odoo mới có critical path
từ 18.1 [47]; critical path của monday vẫn là «trial» [73]. Baseline chỉ thấy ở monday
(Pro) [74]; đủ 4 loại phụ thuộc chỉ thấy ở Bitrix24 [53]; giới hạn WIP không thấy ở ai. Đủ cho OneHub ở bước đầu: kanban (trạng thái + cột cá nhân),
timeline có FS + milestone + tự dời việc phụ thuộc + lịch nghỉ; để critical path, baseline,
WIP sau khi có người hỏi.

## Bẫy / điều nên tránh

1. **Tách hai loại việc** — Pipedrive (activity vs project task [4]), Bitrix (CRM activity
   vs task [61][59]), Odoo (activity vs task vs to-do [41]). Hệ quả thấy trong tài liệu: «việc
   của tôi» ở hai chỗ, quyền theo hai luật, phải viết riêng câu «To Do activity không phải
   to-do task». Lý do họ tách: activity cần giờ/thời lượng/khách mời/đồng bộ lịch, task cần
   nhiều người làm/việc con/phụ thuộc. Một loại việc của OneHub phải chứa được cả hai bộ
   trường đó (giờ bắt đầu–kết thúc tuỳ chọn, «loại» quyết định trường nào hiện).
2. **Việc ai cũng thấy** — Attio để task luôn hiện và sửa được với mọi người [23]. Với dữ liệu
   đối tác và vai «chỉ OKR», đó là lỗ hổng, không phải sự giản dị.
3. **Vòng đời việc bị bản ghi cha giật** — Bitrix tự chuyển việc sang «xong» khi đóng deal
   và đưa việc vào thùng rác khi xoá deal [59][57]; Odoo xoá activity khi làm xong (chỉ giữ
   tin nhắn) trừ khi bật «Keep Done», và xoá luôn activity khi xoá người dùng [30]. Báo cáo
   «đã làm gì» và bàn giao khi nghỉ việc sẽ hụt. OneHub nên giữ việc xong như bản ghi, và
   đóng/huỷ bản ghi cha thì **hỏi** chứ không tự đóng (cách Pipedrive [6]).

## Câu hỏi còn mở, khẳng định chưa xác minh

- Số ô `?`: 110 trên 360 ô (Pipedrive 19, Attio 20, Odoo 13, Bitrix24 16, monday CRM 8, Freshsales 34). Lý do chung: không tìm ra trong tài liệu chính hãng đã mở; **chưa
  hết hạn mức** (dùng 10/30 lượt WebSearch). Các hàng gần như toàn `?` — B2 (hàng đợi việc),
  D3–D5, H1–H3 (mục tiêu) — chưa tra riêng vì không thuộc năm trọng tâm của lượt này.
- Freshsales: không có bài nào về dự án, Gantt, việc con, việc lặp, ưu tiên; có thể là không
  có, nhưng chưa có câu chính hãng nói «không» nên để `?`. Ba ô Freshsales [103][104][105] chỉ
  dựa tiêu đề bài trong danh mục, chưa mở thân bài.
- Pipedrive: chưa rõ dự án và activity theo luật visibility nào (bài visibility chỉ kể lead,
  deal, người, tổ chức, sản phẩm [10]); chưa rõ Gantt có tự đẩy việc phụ thuộc không — bài chỉ
  nói «changes are reflected across your project» [4].
- Bitrix24: một task gắn được nhiều deal/liên hệ cùng lúc không — bài chỉ ghi chung «CRM
  items» [49]. Gantt có critical path/baseline không — bài Gantt không nhắc [52].
- Odoo: Gantt và Planning thuộc Enterprise — suy từ việc module `project_enterprise`,
  `web_gantt`, `planning` không có trong kho mã nguồn mở; trang tính năng không ghi gói.
  Chưa đọc tài liệu API ngoài, di động, bộ lọc lưu nên J1, J2, B4 để `?`.
- Bitrix24 «AI teammate tự làm việc» chỉ thấy ở bảng giá [68], chưa có bài trợ giúp.
- monday: Dependency column có bao nhiêu loại phụ thuộc — phần bài đã đọc chỉ nói chế độ
  [72]; Workload thuộc gói nào chưa thấy trong đoạn đã đọc [78].

## Nguồn

[1] https://support.pipedrive.com/en/article/projects-by-pipedrive — Projects by Pipedrive — 2026-10-05
[2] https://support.pipedrive.com/en/article/projects-by-pipedrive-faq — Projects by Pipedrive FAQ — 2026-10-05
[3] https://support.pipedrive.com/en/article/projects-vs-deals — Deals vs. projects: when to use each — 2026-10-05
[4] https://support.pipedrive.com/en/article/projects-tasks-and-subtasks — Projects: how to plan your project — 2026-10-05
[5] https://support.pipedrive.com/en/article/projects-templates — Projects: templates — 2026-10-05
[6] https://support.pipedrive.com/en/article/projects-manage-work-items-efficiently — Projects: manage work items efficiently — 2026-10-05
[7] https://support.pipedrive.com/en/article/activities — Activities — 2026-10-05
[8] https://support.pipedrive.com/en/article/recurring-activities — Can I have recurring activities in Pipedrive? — 2026-10-05
[9] https://support.pipedrive.com/en/article/calendar-sync — Calendar sync — 2026-10-05
[10] https://support.pipedrive.com/en/article/visibility-groups — Visibility groups — 2026-10-05
[11] https://support.pipedrive.com/en/article/permission-sets — Permission sets — 2026-10-05
[12] https://support.pipedrive.com/en/article/workflow-automation — Automations: first steps — 2026-10-05
[13] https://support.pipedrive.com/en/article/sequences — Sequences feature — 2026-10-05
[14] https://support.pipedrive.com/en/article/pipedrive-ai — Pipedrive AI (bảng tính năng theo gói) — 2026-10-05
[15] https://support.pipedrive.com/en/article/sales-assistant — Sales Assistant — 2026-10-05
[16] https://support.pipedrive.com/en/article/security-dashboard — Security dashboard — 2026-10-05
[17] https://attio.com/help/reference/productivity-collaborating/tasks — Tasks — 2026-10-05
[18] https://attio.com/help/reference/attio-101/productivity/introduction-to-tasks — Introduction to tasks — 2026-10-05
[19] https://docs.attio.com/rest-api/endpoint-reference/tasks/create-a-task — Create a task (REST API) — 2026-10-05
[20] https://attio.com/help/reference/automations/workflows/workflows-block-library — Workflows block library — 2026-10-05
[21] https://attio.com/help/reference/managing-your-data/lists/lists-access — Manage access to lists — 2026-10-05
[22] https://attio.com/help/reference/managing-your-data/objects/manage-access-to-objects — Manage access to objects — 2026-10-05
[23] https://attio.com/help/reference/productivity-collaborating/sharing-and-permissions — Sharing and permissions — 2026-10-05
[24] https://attio.com/help/reference/managing-your-data/views/create-and-manage-kanban-views — Create and manage kanban views — 2026-10-05
[25] https://attio.com/help/reference/managing-your-data/views — Views (danh mục: chỉ table và kanban) — 2026-10-05
[26] https://attio.com/help/reference/attio-ai/ask-attio/chat-with-ask-attio — Chat with Ask Attio — 2026-10-05
[27] https://attio.com/help/reference/automations/sequences — Sequences (danh mục) — 2026-10-05
[28] https://www.odoo.com/documentation/19.0/applications/essentials/activities.html — Activities (Odoo 19) — 2026-10-05
[29] https://www.odoo.com/documentation/19.0/applications/sales/crm/optimize/utilize_activities.html — CRM activities and activity plans — 2026-10-05
[30] https://github.com/odoo/odoo/blob/18.0/addons/mail/models/mail_activity.py — mã nguồn mail.activity (trường, `_check_access`) — 2026-10-05
[31] https://github.com/odoo/odoo/blob/18.0/addons/mail/models/mail_activity_plan_template.py — mã nguồn activity plan template (cùng `mail_activity_plan.py`) — 2026-10-05
[32] https://github.com/odoo/odoo/blob/18.0/addons/project/models/project_task.py — mã nguồn project.task — 2026-10-05
[33] https://github.com/odoo/odoo/blob/18.0/addons/project/models/project_project.py — mã nguồn project.project (privacy_visibility, last_update_status) — 2026-10-05
[34] https://github.com/odoo/odoo/blob/18.0/addons/project/security/project_security.xml — record rule của Project — 2026-10-05
[35] https://github.com/odoo/odoo/blob/18.0/addons/crm/security/crm_security.xml — record rule của CRM — 2026-10-05
[36] https://github.com/odoo/odoo/blob/19.0/addons/sale_project/models/product_template.py — service_tracking: đơn bán sinh dự án/việc — 2026-10-05
[37] https://www.odoo.com/documentation/19.0/applications/services/project/tasks/task_stages_statuses.html — Task stages and statuses — 2026-10-05
[38] https://www.odoo.com/documentation/19.0/applications/services/project/project_management/project_templates.html — Project templates — 2026-10-05
[39] https://www.odoo.com/documentation/19.0/applications/services/project/tasks/task_dependencies.html — Task dependencies — 2026-10-05
[40] https://www.odoo.com/documentation/19.0/applications/services/project/project_management/project_dashboard.html — Project dashboard — 2026-10-05
[41] https://www.odoo.com/documentation/19.0/applications/productivity/to_do.html — To-do — 2026-10-05
[42] https://www.odoo.com/documentation/19.0/applications/productivity/ai/agents.html — AI agents — 2026-10-05
[43] https://www.odoo.com/documentation/19.0/applications/productivity/ai/server-actions.html — AI server actions — 2026-10-05
[44] https://www.odoo.com/documentation/19.0/applications/productivity/ai/fields.html — AI fields — 2026-10-05
[45] https://www.odoo.com/documentation/18.0/applications/services/planning.html — Planning — 2026-10-05
[46] https://www.odoo.com/app/project-features — Project Management features — 2026-10-05
[47] https://www.odoo.com/odoo-18-1-release-notes — Odoo 18.1 Release Notes (Gantt critical path) — 2026-10-05
[48] https://www.odoo.com/odoo-18-4-release-notes — Odoo 18.4 Release Notes (giữ/dùng khoảng đệm khi dời) — 2026-10-05
[49] https://helpdesk.bitrix24.com/open/25865519/ — Create a task — 2026-10-05
[50] https://helpdesk.bitrix24.com/open/18034564/ — Tasks in Bitrix24 — 2026-10-05
[51] https://helpdesk.bitrix24.com/open/17700890/ — Tasks: Access permissions — 2026-10-05
[52] https://helpdesk.bitrix24.com/open/18144752/ — Gantt chart — 2026-10-05
[53] https://helpdesk.bitrix24.com/open/18149240/ — Task dependencies in Gantt chart — 2026-10-05
[54] https://helpdesk.bitrix24.com/open/20713086/ — Working with tasks in projects — 2026-10-05
[55] https://helpdesk.bitrix24.com/open/17876766/ — Additional task features — 2026-10-05
[56] https://helpdesk.bitrix24.com/open/25859915/ — FAQ: New tasks in Bitrix24 — 2026-10-05
[57] https://helpdesk.bitrix24.com/open/25798163/ — FAQ: Tasks in Bitrix24 — 2026-10-05
[58] https://helpdesk.bitrix24.com/open/18891600/ — Planner view in Tasks — 2026-10-05
[59] https://helpdesk.bitrix24.com/open/24472204/ — Work with tasks in CRM — 2026-10-05
[60] https://helpdesk.bitrix24.com/open/18803334/ — Smart activities in CRM — 2026-10-05
[61] https://helpdesk.bitrix24.com/open/21648890/ — My activities in CRM — 2026-10-05
[62] https://helpdesk.bitrix24.com/open/23035622/ — Automation rules and triggers in CRM: Task management — 2026-10-05
[63] https://helpdesk.bitrix24.com/open/19275690/ — CoPilot in Tasks — 2026-10-05
[64] https://helpdesk.bitrix24.com/open/24127550/ — Role-based access permissions in CRM — 2026-10-05
[65] https://helpdesk.bitrix24.com/open/25911175/ — Configure access permissions for activities in CRM — 2026-10-05
[66] https://helpdesk.bitrix24.com/open/23763262/ — Work with collab tasks — 2026-10-05
[67] https://helpdesk.bitrix24.com/open/23642864/ — Project access permissions — 2026-10-05
[68] https://www.bitrix24.com/prices/ — Bitrix24 plans and pricing — 2026-10-05
[69] https://support.monday.com/hc/en-us/articles/4409766475666 — Emails & Activities: manage your activities — 2026-10-05
[70] https://support.monday.com/hc/en-us/articles/360019213180 — Emails & Activities (manual timeline association) — 2026-10-05
[71] https://support.monday.com/hc/en-us/articles/360015643840 — The Gantt Chart View and Widget — 2026-10-05
[72] https://support.monday.com/hc/en-us/articles/360007402599 — Dependencies on monday.com — 2026-10-05
[73] https://support.monday.com/hc/en-us/articles/4420037448850 — Critical Path for the Gantt Chart — 2026-10-05
[74] https://support.monday.com/hc/en-us/articles/360020978159 — The Gantt Baseline — 2026-10-05
[75] https://support.monday.com/hc/en-us/articles/360019300579 — My Work — 2026-10-05
[76] https://support.monday.com/hc/en-us/articles/115005315809 — Board permissions — 2026-10-05
[77] https://support.monday.com/hc/en-us/articles/360011926640 — Column permissions — 2026-10-05
[78] https://support.monday.com/hc/en-us/articles/360010166559 — Resource management with Workload — 2026-10-05
[79] https://support.monday.com/hc/en-us/articles/29810815287570 — Multiple levels of subitems — 2026-10-05
[80] https://support.monday.com/hc/en-us/articles/360000221159 — How to create recurring tasks — 2026-10-05
[81] https://support.monday.com/hc/en-us/articles/25760992782226 — Available plan types on monday CRM — 2026-10-05
[82] https://support.monday.com/hc/en-us/articles/31002308457234 — AI Sales Agent in monday CRM — 2026-10-05
[83] https://support.monday.com/hc/en-us/articles/25548698480914 — monday CRM's AI features — 2026-10-05
[84] https://support.monday.com/hc/en-us/articles/360002144900 — User types explained — 2026-10-05
[85] https://support.monday.com/hc/en-us/articles/360000292500 — How to share projects with guests — 2026-10-05
[86] https://support.monday.com/hc/en-us/articles/360011393900 — Cross-board automations — 2026-10-05
[87] https://support.monday.com/hc/en-us/articles/8675571451282 — Unique features found only in monday CRM — 2026-10-05
[88] https://support.monday.com/hc/en-us/articles/360000661379 — The Kanban View — 2026-10-05
[89] https://support.monday.com/hc/en-us/articles/360001143809 — The Time Tracking Column — 2026-10-05
[90] https://support.monday.com/hc/en-us/articles/115005310745 — The Activity Log — 2026-10-05
[91] https://support.monday.com/hc/en-us/articles/115005310185 — Private Boards — 2026-10-05
[92] https://crmsupport.freshworks.com/support/solutions/articles/50000002423-how-to-add-a-new-task- — How to add a new task? — 2026-10-05
[93] https://crmsupport.freshworks.com/support/solutions/articles/50000002424-how-to-use-tasks-to-collaborate-with-your-team- — How to use tasks to collaborate with your team? — 2026-10-05
[94] https://crmsupport.freshworks.com/support/solutions/articles/50000002991-what-are-custom-sales-activities-how-to-use-them- — What are Custom Sales Activities? — 2026-10-05
[95] https://crmsupport.freshworks.com/support/solutions/articles/50000002412-how-to-configure-roles-and-manage-user-permissions- — How to configure roles and manage user permissions? — 2026-10-05
[96] https://crmsupport.freshworks.com/support/solutions/articles/50000002413-how-to-configure-field-permissions-for-roles- — How to configure field permissions for roles? — 2026-10-05
[97] https://crmsupport.freshworks.com/support/solutions/articles/50000003925-how-to-create-tasks-using-workflows- — How to create tasks using Workflows? — 2026-10-05
[98] https://crmsupport.freshworks.com/support/solutions/articles/50000002396-how-to-transfer-records- — How to transfer records? — 2026-10-05
[99] https://crmsupport.freshworks.com/support/solutions/articles/50000002682-how-to-track-changes-using-audit-logs- — How to track changes using audit logs? — 2026-10-05
[100] https://crmsupport.freshworks.com/support/solutions/articles/50000002425-how-do-i-mark-a-task-as-complete-and-view-them- — How do I mark a task as complete? — 2026-10-05
[101] https://crmsupport.freshworks.com/support/solutions/articles/50000002137-what-are-sales-teams-how-to-use-them- — What are Sales Teams? — 2026-10-05
[102] https://crmsupport.freshworks.com/support/solutions/articles/50000003906-what-is-the-freddy-ai-view-how-to-gain-insights-from-this-view- — What is the Freddy AI view? — 2026-10-05
[103] https://crmsupport.freshworks.com/support/solutions/articles/50000003668-how-to-sync-tasks-and-sales-activities-to-my-calendar- — How to sync tasks and sales activities to my calendar? (chỉ thấy tiêu đề) — 2026-10-05
[104] https://crmsupport.freshworks.com/support/solutions/articles/50000003673-how-to-add-custom-fields-to-sales-activities- — How to add custom fields to sales activities? (chỉ thấy tiêu đề) — 2026-10-05
[105] https://crmsupport.freshworks.com/support/solutions/articles/50000002487-how-to-use-the-home-screen-on-the-mobile-app- — How to use the home screen on the mobile app? (chỉ thấy tiêu đề) — 2026-10-05
