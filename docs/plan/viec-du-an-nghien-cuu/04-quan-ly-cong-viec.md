# Quản lý công việc / dự án: Asana, Jira, ClickUp, monday, Planner (+ quét nhẹ Linear, Notion, Smartsheet, Wrike)
Ngày tra: 2026-10-05 · Số lượt WebSearch đã dùng: 27 (1 lượt bị từ chối vì reddit.com chặn tác tử; chưa hết hạn mức 30)

Cách đọc: A1 trong bảng này hiểu là «một đối tượng việc dùng chung xuyên mọi chỗ chứa»
— các công cụ này không có bản ghi CRM (deal, công ty) nên phần «gắn bản ghi CRM» của
A1, C4, C5 không áp dụng; ô để `?` thay vì đoán. Trang trợ giúp của help.asana.com,
help.clickup.com, support.monday.com hầu hết không đọc thẳng được (trang vẽ bằng JS hoặc
trả 403), nên nhiều ô dựa vào **đoạn trích tìm kiếm của chính trang trợ giúp đó** — đánh
dấu `(trích)` ở mục Nguồn. Ô không có nguồn là `?`, không chấm từ trí nhớ.

## Bảng chấm

Gói viết tắt — Asana: Starter / Advanced · Jira: Free / Std / Premium · ClickUp: Free /
Unlimited / Business / Business Plus · monday: Basic / Standard / Pro · Planner: Basic
(miễn phí trong M365) / Premium (Plan 1 · Plan 3 · Plan 5).

| Mã | Asana | Jira | ClickUp | monday | Planner |
| --- | --- | --- | --- | --- | --- |
| A1 | M — một đối tượng task, nằm ở 0/1/nhiều dự án [4][5] | ? | ? | ? | ? |
| A2 | M — multi-home tới 20 dự án [3][4] | ? | Đ — ClickApp «Tasks in Multiple Lists» [26] | Y — item ở một board; nối bằng Connect boards + Mirror [39] | ? |
| A3 | Đ — tối đa 5 tầng; subtask không kế thừa dự án của cha [4] | Đ — epic › con; thêm tầng trên epic chỉ ở Plans (Premium) [16][17] | Đ — có subtask, subtask cũng multi-list được [26] | Đ — nhiều tầng subitem [40] | Đ (Premium) — summary + sub-task [44] |
| A4 | Đ [13] | ? | ? | ? | Đ (Basic) / – (Premium) [42] |
| A5 | Y — chỉ default / milestone / approval [5] | ? | ? | ? | ? |
| A6 | Y — hoàn thành là cờ đúng/sai; luồng dựng bằng section hoặc trường tuỳ biến [4][5] | M — trạng thái tự do, buộc vào 3 nhóm To do / In progress / Done, màu nhóm không đổi được [14][15] | M — trạng thái tuỳ biến theo Space/Folder/List, 4 nhóm Not started / Active / Done / Closed [25] | Y — trạng thái là một cột; board có thể có nhiều cột trạng thái [38] | ? |
| A7 | Đ (Starter) — qua trường tuỳ biến [1] | ? | ? | ? | ? |
| A8 | Đ (Starter) [1] | ? | ? | ? | Y (Premium) — tối đa 10 trường, 5 kiểu [44] |
| A9 | ? | ? | ? | ? | ? |
| A10 | Y — một assignee + collaborators [5][13] | ? | ? | ? | ? |
| A11 | Đ [13] | ? | ? | ? | Đ — «task conversations» cả hai loại plan [42] |
| A12 | Đ (Advanced) — ước lượng vs thực tế [1] | ? | Đ (Unlimited) — time tracking [24] | Đ (Pro) [33] | Đ (Premium) — Assignments theo ngày/tuần/tháng [44] |
| A13 | ? | ? | ? | ? | Đ (Premium) / – (Basic) [42][44] |
| B1 | M — My Tasks gom mọi việc được giao, mọi gói [6] | Y — trang «For you»: việc giao cho tôi + mục vừa xem, thiên về lối tắt [21] | Đ — My Tasks (trước là Home), thẻ Assigned to me [31] | Đ — My Work, nhưng phải chọn cột trạng thái/ngày cho từng board [38] | M — My Tasks gom Basic, Premium, To Do, Loop, ghi chú họp Teams, email gắn cờ [46] |
| B2 | Đ — section + Rules trong My Tasks (bỏ tự động đôn hạn cũ) [6][7] | ? | ? | Đ — xô Quá hạn / Hôm nay / Tuần này / Tuần sau / Sau đó / Không ngày [38] | Đ — My Day tự xoá mỗi đêm [46] |
| B3 | ? | ? | ? | ? | ? |
| B4 | ? | ? | ? | ? | ? |
| B5 | ? | ? | ? | ? | ? |
| B6 | ? | ? | ? | ? | ? |
| C1 | M — project; nhiều view [4] | Đ — space [17] | Đ — Space › Folder › List [25] | Đ — board [35] | Đ — plan [42] |
| C2 | ? | ? | ? | ? | Đ (Plan 1) — mẫu plan premium [47] |
| C3 | M (Advanced) — Portfolios [1][4] | Đ (Premium) — Plans [16] | ? | ? | Đ (Plan 3/5) — Portfolios, trạng thái nhập tay [45] |
| C4 | ? | ? | ? | ? | ? |
| C5 | ? | ? | ? | ? | ? |
| C6 | ? | ? | ? | ? | ? |
| D1 | Đ [6] | M — cột ánh xạ một hoặc nhiều trạng thái [22] | ? | ? | Đ — Board cả hai loại plan [42] |
| D2 | ? | ? | ? | ? | Đ — lọc và nhóm [42] |
| D3 | ? | ? | ? | ? | ? |
| D4 | ? | M — giới hạn tối thiểu/tối đa mỗi cột [22] | ? | ? | ? |
| D5 | ? | ? | ? | ? | ? |
| E1 | Đ (Starter) [1] | Đ — timeline một space [17] | Đ (Unlimited) [24][28] | Đ (Standard) [35] | Đ (Premium/Plan 1) [42][47] |
| E2 | Đ (Starter) — FS/SS/FF/SF, **không có lag** [1][9][10] | Y — chỉ liên kết «Blocks», trong một space; Plans (Premium) xem rộng hơn [16][18] | M — FS/SS/FF/SF [28] | M — FS/SS/FF/SF + lead/lag (chế độ Strict) [34] | M (Premium) — 4 kiểu; lead/lag ở Plan 3 [44][47] |
| E3 | Đ — Maintain buffer / Consume buffer / None [11] | Y (timeline: chỉ tô đỏ khi chồng) / Đ (Premium: auto-scheduling) [16][18] | Đ — «Reschedule dependencies» [27][28] | M — Flexible / Strict / No action [34] | Đ (Premium) [44] |
| E4 | Đ (Advanced) [1] | ? | Đ (Business; Free dùng giới hạn lượt) [27] | Đ (Pro) [35][37] | Đ (Premium) [42][44] |
| E5 | Đ (Advanced) [1][12] | ? | Đ (gói trả phí, chưa rõ gói nào) [28] | Đ (Pro) [36] | ? |
| E6 | Đ (Advanced) [1][5] | ? | Đ [28] | Đ (Pro) [35] | Đ (Premium) [42] |
| E7 | ? | ? | ? | ? | Đ (Premium) — lịch riêng [42][44] |
| E8 | Đ (Advanced) — Workload / resource management [1] | Đ (Premium) — capacity trong Plans [16] | Đ — Free 60 lượt, Unlimited 100, Business không giới hạn; chỉnh capacity theo ngày ở Business Plus [32] | Đ (Pro) [41] | Đ (Premium) — People view [42][44] |
| F1 | Đ (Starter) — Rules không giới hạn [1] | ? | Đ (Business: 5.000 lượt/tháng) [24] | Đ (Standard: 250 lượt/tháng) [33] | ? |
| F2 | ? | ? | ? | ? | ? |
| F3 | ? | ? | ? | ? | ? |
| F4 | ? | ? | ? | ? | Đ (Premium) — Planner Agent sinh việc từ goal [48] |
| F5 | ? | ? | ? | ? | ? |
| G1 | ? | ? | ? | ? | ? |
| G2 | ? | ? | ? | ? | ? |
| G3 | ? | ? | Đ — việc multi-list: ai vào được bất kỳ list nào cũng thấy [26] | ? | ? |
| G4 | ? | ? | ? | ? | ? |
| G5 | ? | ? | ? | ? | ? |
| G6 | Đ — My Tasks riêng tư trừ khi công khai [6] | ? | ? | Đ (Pro) — private boards [33] | ? |
| G7 | ? | ? | ? | Đ (Standard) — guest [33] | ? |
| G8 | ? | ? | ? | ? | ? |
| G9 | ? | ? | Đ (Enterprise) — audit logs [24] | ? | Đ (Premium) — task history [42] |
| H1 | M (Advanced) — Goals nối project, portfolio, task [1][8] | Y — trường Goals trên work item, cần Atlas/Atlassian Home [20] | Đ — target kiểu Task (task, subtask, cả List) [30] | ? | Đ (Premium) — Goals nối task trong plan [44] |
| H2 | M (Advanced) — tự tính từ sub-goal / project / task, tối đa 100 mục [8] | ? | Đ — target Task tự cập nhật % [30] | ? | Y — trạng thái goal nhập tay [48] |
| H3 | ? | ? | ? | ? | ? |
| I1 | ? | ? | ? | ? | ? |
| I2 | ? | ? | ? | ? | Đ — Charts view [42] |
| J1 | Đ — API công khai [5] | ? | ? | ? | ? |
| J2 | ? | ? | ? | ? | ? |
| J3 | ? | ? | ? | ? | ? |

### Quét nhẹ — chỉ các mã có nguồn

| Mã | Linear | Notion | Smartsheet | Wrike |
| --- | --- | --- | --- | --- |
| A2 | – — một issue chỉ thuộc một project [51] | ? | ? | M — một task ở nhiều folder/project/space [59] |
| A3 | ? | Đ — sub-task nhiều tầng [55] | ? | ? |
| A5 | ? | ? | ? | M — Custom item types [60] |
| A6 | M — trạng thái tuỳ biến theo team, 6 nhóm cố định thứ tự [49] | Đ — Task database bắt buộc Status [54] | ? | M — 4 nhóm Active / Completed / Deferred / Cancelled; workflow riêng từ Business [60][61] |
| B1 | M — My Issues: Assigned / Created / Subscribed / Activity, «focus order» [50] | Đ — My Tasks gom tối đa 10 task database [54] | ? | ? |
| C3 | Đ — Initiatives gom project, lồng sub-initiative (một phần ở Business/Enterprise) [52] | ? | ? | ? |
| E1 | ? | Đ — Timeline view [55] | Đ [56] | Đ [60] |
| E2 | ? | Đ — phụ thuộc chặn/bị chặn [55] | M — Predecessor + lag [56] | ? |
| E3 | ? | Đ — 3 chế độ dời ngày [55] | M — ngày tự tính theo predecessor [56] | ? |
| E4 | ? | ? | Đ [57] | ? |
| E5 | ? | ? | Đ [57] | ? |
| E7 | ? | Y — chỉ «Avoid weekends» [55] | Đ — lịch ngày làm việc của sheet [56] | ? |
| H1 | Đ — Initiative ← project [52] | ? | ? | ? |
| H2 | Đ — project/milestone tự tính theo nhóm trạng thái; initiative lấy sức khoẻ từ cập nhật project [52][53] | ? | ? | ? |

## Mỗi sản phẩm: cách họ quy hoạch việc

**Asana.** Đơn vị là task; task có thể không thuộc dự án nào, thuộc một hay nhiều dự án
(multi-homing, tối đa 20), và mỗi «membership» là một cặp dự án + section — nghĩa là cùng
một task nằm ở section khác nhau trong từng dự án [3][4][5]. Subtask tối đa 5 tầng và
*không* kế thừa dự án của cha [4]. Hoàn thành là cờ đúng/sai; «trạng thái» nhiều nấc dựng
bằng section hoặc trường tuỳ biến, nên không có ngữ nghĩa chung xuyên dự án [5]. My Tasks
là trang riêng của mỗi người, có section tự đặt, rule tự xếp (đã bỏ cơ chế tự đôn Today /
Upcoming / Later cũ, thay bằng rule) [6][7]. Timeline/Gantt và dependency từ Starter; milestone,
critical path, baseline, Portfolios, Goals, Workload, time tracking đều ở Advanced [1].
Dependency đủ 4 kiểu (từ 2024) nhưng **không có lag** — người chuyển từ MS Project phàn
nàn, phải mua tiện ích ngoài (Flowsana) [9][10]. Khách khen dependency và mức minh bạch;
chê giao diện rối khi nhiều việc và dependency khó soát khi số subtask lớn (đoạn trích
đánh giá, chưa đọc được từng bài) [62].

**Jira.** Work item thuộc một space (project); trạng thái tự do nhưng **mọi trạng thái
phải thuộc một trong ba nhóm** To do / In progress / Done, tô xám / xanh dương / xanh lá
và không đổi màu được; nhóm quyết định cách việc hiện trong list, báo cáo, board [14]. Trạng
thái là tài nguyên dùng chung: đổi tên một trạng thái là đổi ở mọi workflow dùng nó [14].
Board ánh xạ mỗi cột vào một hay nhiều trạng thái; trạng thái chưa ánh xạ thì việc biến mất
khỏi board và backlog; có giới hạn tối thiểu/tối đa mỗi cột [22]. Thứ tự trong backlog
dùng LexoRank (chuỗi, tự cân bằng lại khi dài) [19]. Timeline gói thường chỉ một space,
chỉ liên kết «Blocks», chồng ngày thì tô đỏ chứ không tự dời [17][18]; xuyên dự án, tầng
trên epic, capacity, auto-scheduling, kịch bản là **Plans — chỉ Premium/Enterprise** [16].
Goals là sản phẩm riêng (Atlas / Atlassian Home), gắn vào work item qua một trường; tài
liệu không nói tiến độ tự tính [20].

**ClickUp.** Cây Workspace › Space › Folder › List › Task › Subtask; trạng thái tuỳ biến
theo từng tầng, kế thừa xuống, xếp vào nhóm Not started / Active / Done / Closed (Closed
không tạo thêm, chỉ đổi tên được) [25]. Một task ở nhiều List qua ClickApp «Tasks in
Multiple Lists»: luôn dùng trạng thái của **List nhà chính**, ai vào được bất kỳ List nào
cũng thấy task, và task tính vào giới hạn của mọi List chứa nó [26]. Gantt đầy đủ nhất
nhóm: 4 kiểu dependency, tự dời theo chuỗi, critical path + slack, baseline, milestone,
workload [28]; nhưng khoá theo **số lượt dùng**: Free dùng có hạn, critical path không giới
hạn từ Business; Workload Free 60 / Unlimited 100 lượt, capacity theo ngày ở Business Plus
[27][32]. Giá Unlimited 7 USD, Business 12 USD/người/tháng trả năm [24]. Khách chê chậm và
rối ở workspace lớn (đoạn trích đánh giá, con số tỉ lệ chưa xác minh) [62].

**monday work management.** Board chứa item, item có subitem nhiều tầng [40]; mọi thuộc
tính là cột, kể cả trạng thái — một board có thể có nhiều cột Status và nhiều cột Date. Hệ
quả trực tiếp: **My Work bắt từng người chọn cột Status và cột Date nào dùng cho từng
board**; chọn sai thì việc nằm sai xô ngày [38]. Item thuộc đúng một board; xuyên board
dùng Connect boards + Mirror [39]. Gantt từ Standard; milestone, critical path, baseline
từ Pro; Workload từ Pro [35][36][37][41]. Dependency 4 kiểu với ba chế độ Flexible /
Strict / No action, lead/lag trong Strict [34]. Giá Basic 9, Standard 12, Pro 19
USD/người/tháng [33].

**Microsoft Planner (bản mới).** Gộp Planner cũ, Project for the web và To Do. Hai loại
plan: **Basic** (miễn phí trong M365, 9.000 việc, có việc lặp, Schedule view) và **Premium**
(3.000 việc; Timeline/Gantt, dependency 4 kiểu, milestone, critical path, custom calendar,
People view, Goals, task history, sprint, tối đa 10 trường tuỳ biến) — và **Premium mất việc
lặp** [42][44]. Plan 1 (~10 USD) mở phần lớn premium; Plan 3 (~30 USD) thêm lead/lag, task
history, Portfolios [45][47]. My Tasks là điểm mạnh: gom việc từ Basic, Premium, To Do, Loop,
ghi chú họp Teams và email gắn cờ; My Day tự xoá mỗi đêm [46]. Goals trong plan gắn được
vào task, trạng thái nhập tay; Planner Agent sinh việc từ goal [44][48]. Portfolios chỉ
nhận plan premium, % tiến độ chỉ xem, trạng thái nhập tay [45].

**Linear (quét nhẹ).** Trạng thái tuỳ biến theo team nhưng nằm trong 6 nhóm cố định thứ tự
Backlog / Unstarted / Started / Completed / Canceled (+ Triage) [49]. Nhờ đó My Issues xếp
«focus order» chung cho mọi team [50], và tiến độ milestone/project tính thẳng theo nhóm:
vào Started là bắt đầu được tính, Completed thì tính đủ [53]. Một issue chỉ thuộc một
project (cách lách: tách sub-issue) [51]. Initiatives gom project, lồng nhau, sức khoẻ lấy
từ cập nhật mới nhất của từng project [52].

**Notion (quét nhẹ).** «Task database» là database có đủ Status, Assignee, Due date; My
Tasks gom từ tối đa 10 database như vậy; hãng khuyên ít database dùng chung + view lọc
thay vì mỗi dự án một database [54]. Dependency với 3 chế độ dời ngày và tuỳ chọn tránh
cuối tuần [55].

**Smartsheet (quét nhẹ).** Mô hình bảng tính: cột Predecessor nhận số dòng, có lag, ngày
tự tính theo lịch làm việc của sheet; critical path, baseline [56][57]. Mạnh Gantt kiểu MS
Project, đổi lại là cảm giác bảng tính.

**Wrike (quét nhẹ).** Một task ở nhiều folder/project/space như gắn nhãn; thêm vào chỗ nào
là tự chia sẻ cho người có quyền ở đó [59]. Trạng thái tuỳ biến trong 4 nhóm Active /
Completed / Deferred / Cancelled; workflow riêng từ gói Business; có Custom item types [60][61].

## Mẫu thiết kế đáng học

1. **Trạng thái tuỳ biến, neo vào nhóm cố định.** Jira (3 nhóm, màu khoá), Linear (6 nhóm,
   thứ tự khoá), ClickUp (4 nhóm), Wrike (4 nhóm) cùng hội tụ một kiểu [14][25][49][60]. Mọi
   màn xuyên dự án — việc của tôi, tiến độ, báo cáo — chỉ đọc nhóm, không đọc tên trạng thái;
   Linear tính tiến độ thẳng từ nhóm [53]. Phản ví dụ là monday: không có nhóm nên My Work
   bắt người dùng ánh xạ tay từng board [38]. Với OneHub: một loại việc thì khoá luôn bộ
   nhóm (vd Chưa làm / Đang làm / Xong / Huỷ) ngay từ đầu; dự án chỉ được đặt tên và thêm
   nấc *bên trong* nhóm.
2. **Gantt mức «đủ» = E1 + E2 + E3 với ba chế độ dời ngày.** Asana (Maintain / Consume /
   None), monday (Strict / Flexible / No action), Notion (giữ khoảng / chỉ khi chồng / không
   dời) độc lập đi tới cùng bộ ba [11][34][55]. Critical path, baseline, workload, lịch làm
   việc thì *mọi* hãng đẩy lên gói cao nhất (Asana Advanced, monday Pro, ClickUp Business,
   Jira Premium, Planner Premium) [1][16][27][35][42] — tín hiệu đó là mức «xuất sắc», không
   phải mức vào cửa. FS là đủ cho bản đầu; lag là thứ người chuyển từ MS Project đòi đầu tiên [10].
3. **Một việc, một nhà chính, nhiều chỗ hiện.** ClickUp nói rõ nhất: task ở nhiều List nhưng
   trạng thái lấy theo List nhà chính [26]; Asana thì vị trí (section) và thứ tự thuộc từng
   membership, còn nội dung thuộc task [4][5]. Với OneHub (việc gắn nhiều bản ghi): dữ liệu và
   trạng thái thuộc việc; vị trí cột kanban và thứ tự thuộc từng chỗ chứa.
4. **Thứ tự kéo thả bằng khoá chuỗi chèn giữa.** Jira LexoRank: chuỗi, cân bằng lại theo
   lịch ở 128 ký tự, ngay lập tức ở 160, khoá xếp hạng ở 254 [19]. Figma: chỉ số phân số độ
   chính xác tuỳ ý lưu dạng chuỗi, chèn bằng trung bình hai bên, máy chủ cấp vị trí khác khi
   hai người chèn cùng chỗ [63]. Đủ cho OneHub mà không cần cân bằng lại theo lịch ở quy mô nội bộ.
5. **Goal tự tính tiến độ, nhưng nói rõ nguồn.** Asana cho chọn nguồn: sub-goal (trung bình %
   hoặc cộng số/tiền), project (trung bình % milestone hoặc % task), task (tỉ lệ xong), tối đa
   100 mục [8]. Linear tách hai thứ: % tiến độ tự tính từ issue, còn «sức khoẻ» lấy từ cập nhật
   người viết [52][53]. Planner chỉ cho trạng thái nhập tay [45][48]. Cho OKR của OneHub: KR
   nối được tới dự án/việc, chọn một nguồn tự tính, và giữ ô sức khoẻ do người ghi.
6. **Việc của tôi có xô thời gian và «hôm nay» tự làm mới.** Planner My Day tự xoá mỗi đêm
   [46]; monday chia Quá hạn / Hôm nay / Tuần này / Tuần sau / Sau / Không ngày [38]; Asana
   chuyển từ tự đôn cố định sang rule người tự đặt [7].

## Bẫy / điều nên tránh

1. **Trạng thái tự do không nhóm** → trang việc của tôi và tiến độ phải ánh xạ tay (monday
   [38]); và trạng thái dùng chung toàn cục thì đổi tên ở một dự án là đổi ở mọi dự án (Jira [14]).
2. **Tách hai mô hình việc.** Planner có hai loại plan với tính năng *loại trừ nhau*: Premium có
   Gantt nhưng mất việc lặp và trần việc thấp hơn (3.000 so với 9.000) [42]. Đúng là điều hướng
   «một loại việc» của OneHub đang tránh.
3. **Multi-home mở rộng quyền theo hợp.** ClickUp: ai vào được bất kỳ List nào cũng thấy task
   [26]; Wrike: thêm vào chỗ nào là tự chia sẻ cho người ở đó [59]. Gắn một việc vào deal nhạy
   cảm và một dự án công khai là lộ — phải chốt quyền xem việc là hợp hay giao của các bản ghi gắn kèm.
4. **Gantt nửa vời gây phàn nàn hơn không có.** Jira timeline chỉ một space và chỉ liên kết
   «Blocks», chồng ngày chỉ tô đỏ [17][18]; Asana thiếu lag, người dùng phải mua tiện ích ngoài [10].
5. **Đừng tin bảng so sánh của đối thủ.** Trang của ClickUp ghi Asana «chỉ FS, không critical
   path, không baseline» [29] — trái với bảng giá Asana và diễn đàn Asana [1][9].

## Câu hỏi còn mở, khẳng định chưa xác minh

- Phần lớn nhóm G (phân quyền), B3–B6, C4–C6, D2–D5, F2–F5, I, J chưa tra cho cả năm sản phẩm
  — ưu tiên dồn hạn mức vào 5 trọng tâm. Nếu tệp phân quyền / CRM của tác tử khác đã phủ thì
  không cần tra lại.
- Gói của dependency trên monday (Standard hay Pro) và gói của baseline ClickUp chưa thấy nguồn.
- Jira Plans có critical path / baseline không: chưa thấy trong tài liệu đã đọc.
- Planner: baseline không thấy nhắc; giá Plan 1 / Plan 3 lấy từ đoạn trích Microsoft Q&A
  (nguồn phụ), trang giá chính hãng hết giờ chờ.
- Asana: lịch ngày làm việc (E7) chưa thấy nguồn.
- Đánh giá khách: chỉ có đoạn trích từ Capterra/G2 qua máy tìm; reddit.com chặn tác tử. Con số
  «78% đánh giá xấu về ClickUp nói chậm» xuất hiện trong đoạn trích, không rõ ai đo — không dùng.
- Không tìm được tài liệu chính thức về khoá thứ tự của Asana, ClickUp, monday, Linear; chỉ
  Jira (LexoRank) có tài liệu.
- Jira timeline hiện «active agent sessions» trên từng item [17] — dấu hiệu tác tử AI làm
  việc trên work item (F5), chưa tra tiếp.

## Nguồn

[1] https://asana.com/pricing — Asana pricing (bảng tính năng theo gói) — 2026-10-05
[3] https://help.asana.com/s/article/multi-home-tasks-to-avoid-information-silos?language=en_US — Multi-home Asana tasks (trích: tối đa 20 dự án) — 2026-10-05
[4] https://developers.asana.com/docs/object-hierarchy — Asana object hierarchy — 2026-10-05
[5] https://developers.asana.com/reference/tasks — Asana Tasks API — 2026-10-05
[6] https://asana.com/features/project-management/my-tasks — Asana My Tasks — 2026-10-05
[7] https://help.asana.com/s/article/rules-in-my-tasks?language=en_US — Rules in My tasks (trích) — 2026-10-05
[8] https://help.asana.com/s/article/progress-status-and-connecting-work-to-goals?language=en_US — Connect work to goals: progress & status (trích) — 2026-10-05
[9] https://forum.asana.com/t/mastering-advanced-task-dependencies-in-asana/885797 — Mastering advanced task dependencies (diễn đàn chính hãng, 2024-08) — 2026-10-05
[10] https://forum.asana.com/t/dependencies-with-lags/1153817 — Dependencies with lags (2026-08) — 2026-10-05
[11] https://help.asana.com/s/article/managing-tasks-and-dependencies-with-timeline?language=en_US — Timeline & dependency date shifting (trích) — 2026-10-05
[12] https://help.asana.com/s/article/gantt-view?language=en_US — Gantt view, baseline (trích) — 2026-10-05
[13] https://help.asana.com/s/article/task-fields?language=en_US — Task fields — 2026-10-05
[14] https://support.atlassian.com/jira-cloud-administration/docs/what-is-a-workflow-status/ — What is a workflow status? — 2026-10-05
[15] https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/ — Statuses, priorities, resolutions — 2026-10-05
[16] https://support.atlassian.com/jira-software-cloud/docs/what-is-advanced-roadmaps/ — Plans (Premium/Enterprise) — 2026-10-05
[17] https://support.atlassian.com/jira-software-cloud/docs/what-is-the-roadmap/ — What does the space timeline show? — 2026-10-05
[18] https://support.atlassian.com/jira-software-cloud/docs/manage-dependencies-between-epics-on-the-timeline/ — Dependencies on the timeline — 2026-10-05
[19] https://confluence.atlassian.com/adminjiraserver/managing-lexorank-938847803.html — Managing LexoRank — 2026-10-05
[20] https://support.atlassian.com/jira-software-cloud/docs/link-and-unlink-goals-to-issues-in-your-jira-list/ — Link goals to work items — 2026-10-05
[21] https://support.atlassian.com/jira-software-cloud/docs/navigate-to-your-work/ — Navigate to your work («For you») — 2026-10-05
[22] https://support.atlassian.com/jira-software-cloud/docs/configure-columns/ — Configure columns — 2026-10-05
[24] https://clickup.com/pricing — ClickUp pricing — 2026-10-05
[25] https://help.clickup.com/hc/en-us/articles/6309452618647-Manage-task-statuses — Manage task statuses + Not Started Statuses (trích) — 2026-10-05
[26] https://help.clickup.com/hc/en-us/articles/6309958824727-Tasks-in-Multiple-Lists — Tasks in Multiple Lists (trích) — 2026-10-05
[27] https://help.clickup.com/hc/en-us/articles/6310440099479-Critical-Path-and-Slack-Time — Critical Path and Slack Time (trích) — 2026-10-05
[28] https://clickup.com/features/gantt-chart-view — ClickUp Gantt (trang tính năng) — 2026-10-05
[29] https://clickup.com/learn/topic/project-management/tools/features/gantt-charts/ — ClickUp vs Asana vs Jira (do ClickUp viết) — 2026-10-05
[30] https://help.clickup.com/hc/en-us/articles/6325733579671-Create-a-Goal — Create a Goal (trích) — 2026-10-05
[31] https://help.clickup.com/hc/en-us/articles/18944788880791-My-Tasks-page-formerly-Home — My Tasks page (trích) — 2026-10-05
[32] https://help.clickup.com/hc/en-us/articles/30657456679703-Workload-view-feature-availability-and-limits — Workload view availability (trích) — 2026-10-05
[33] https://monday.com/pricing?product=work_management — monday pricing — 2026-10-05
[34] https://support.monday.com/hc/en-us/articles/360007402599-Dependencies-on-monday-com — Dependencies on monday.com (trích) — 2026-10-05
[35] https://support.monday.com/hc/en-us/articles/360015643840-The-Gantt-Chart-View-and-Widget — Gantt Chart View (trích) — 2026-10-05
[36] https://support.monday.com/hc/en-us/articles/360020978159-The-Gantt-Baseline — Gantt Baseline (trích) — 2026-10-05
[37] https://support.monday.com/hc/en-us/articles/4420037448850-Critical-Path-for-the-Gantt-Chart — Critical Path (trích) — 2026-10-05
[38] https://support.monday.com/hc/en-us/articles/360019300579-My-Work — My Work (trích) — 2026-10-05
[39] https://support.monday.com/hc/en-us/articles/360001733859-The-Mirror-Column — Mirror Column; và 4415627354770 (moving connected items) (trích) — 2026-10-05
[40] https://support.monday.com/hc/en-us/articles/29810815287570-Multiple-levels-of-subitems-on-monday-com — Multiple levels of subitems (chỉ tiêu đề) — 2026-10-05
[41] https://support.monday.com/hc/en-us/articles/360010699760-The-Workload-Widget — Workload (trích: Pro) — 2026-10-05
[42] https://support.microsoft.com/en-us/planner/compare-microsoft-planner-basic-vs-premium-plans — Compare Planner basic vs premium — 2026-10-05
[43] https://learn.microsoft.com/en-us/planner/understand-planner-trial-and-license-assignments — Planner premium trials and licenses — 2026-10-05
[44] https://support.microsoft.com/en-us/planner/teams/advanced-capabilities-with-premium-plans-in-planner — Advanced capabilities with premium plans — 2026-10-05
[45] https://support.microsoft.com/en-us/planner/manage-multiple-plans-with-portfolios-in-microsoft-planner — Portfolios in Planner — 2026-10-05
[46] https://support.microsoft.com/en-US/Planner/teams/plan-your-day-with-my-day — My Day; và getting-started-with-planner-in-teams (trích) — 2026-10-05
[47] https://learn.microsoft.com/en-us/answers/questions/5422024/planner-premium-vs-planner-plan-1 — Microsoft Q&A, Plan 1 vs Plan 3 (nguồn phụ, trích) — 2026-10-05
[48] https://support.microsoft.com/en-us/office/generate-automatic-status-reports-with-planner-agent-d9c87789-da05-4606-b1ff-27fc4f1bf999 — Planner Agent / Goals (trích từ cụm kết quả support.microsoft.com) — 2026-10-05
[49] https://linear.app/docs/configuring-workflows — Configuring workflows — 2026-10-05
[50] https://linear.app/docs/my-issues — My Issues — 2026-10-05
[51] https://linear.app/docs/projects — Projects — 2026-10-05
[52] https://linear.app/docs/initiatives — Initiatives — 2026-10-05
[53] https://linear.app/docs/project-milestones — Project milestones — 2026-10-05
[54] https://www.notion.com/help/guides/give-your-to-dos-a-home-with-task-databases — Task databases — 2026-10-05
[55] https://www.notion.com/help/tasks-and-dependencies — Sub-items & dependencies — 2026-10-05
[56] https://help.smartsheet.com/articles/765727-enabling-dependencies-using-predecessors — Dependencies & predecessors (trích) — 2026-10-05
[57] https://help.smartsheet.com/articles/1979152-tracking-a-project-s-critical-path — Critical path; learning track Baselines (trích) — 2026-10-05
[59] https://help.wrike.com/hc/en-us/articles/1500005121001-Adding-Tasks-to-Folders-Projects-and-Spaces — Task ở nhiều location (trích) — 2026-10-05
[60] https://help.wrike.com/hc/en-us/articles/29984582493719-Status-Groups-in-Wrike — Status Groups; và 4409188763031 Custom Item Types (trích) — 2026-10-05
[61] https://help.wrike.com/hc/en-us/articles/1500005219382-Default-vs-Custom-Workflows — Default vs Custom Workflows (trích: Business+) — 2026-10-05
[62] https://www.capterra.com/p/184581/Asana-PM/reviews/ ; https://www.g2.com/products/clickup/reviews — đánh giá khách (chỉ đoạn trích máy tìm) — 2026-10-05
[63] https://www.figma.com/blog/realtime-editing-of-ordered-sequences/ — Realtime editing of ordered sequences (fractional indexing) — 2026-10-05
