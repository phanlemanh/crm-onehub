# Việc và Dự án — nghiên cứu nền

Khảo sát ngày 2026-10-05, làm trước khi mở vòng tính năng. Đây là **nghiên cứu nền**,
chưa qua cổng nào. Tài liệu nói điều đã biết và điều chưa biết, kèm thứ tự đề xuất. Lộ
trình rút từ đây nằm ở `lo-trinh-viec-du-an.md` và `lo-trinh-viec-du-an.json`.

Hướng chủ kho đã chọn trước khi khảo sát: **một loại việc duy nhất, gắn được vào mọi bản
ghi**, theo cách Salesforce, HubSpot, Odoo đang làm. Kanban và Gantt là hai cách xem; dự
án là chỗ chứa việc.

## 0. Cách đọc

Sáu tác tử khảo sát song song theo cùng một khung 60 năng lực (mã A1…J3, thang Mạnh / Đủ /
Yếu / Không có / Chưa xác minh). Bản gốc từng mảng, kèm nguồn đánh số, nằm ở
`viec-du-an-nghien-cuu/`:

| Tệp | Mảng |
| --- | --- |
| `00-khung.md` | Khung chấm và danh mục 60 năng lực |
| `01-ma-kho-onehub.md` | Mã kho OneHub: ba thứ giống việc, quyền, nhắc, điểm nối (đọc `onehub` tại `e0b08ccd7`) |
| `02-crm-lon.md` | Salesforce, Dynamics 365, HubSpot, Zoho |
| `03-crm-moi.md` | Pipedrive, Attio, Odoo, Bitrix24, monday CRM, Freshsales |
| `04-quan-ly-cong-viec.md` | Asana, Jira, ClickUp, monday, Planner; quét nhẹ Linear, Notion, Smartsheet, Wrike |
| `05-phan-quyen-va-muc-tieu.md` | Phân quyền cho việc; mục tiêu/OKR nối với việc |
| `06-thi-truong-viet.md` | Base, 1Office, MISA AMIS, Getfly, Fastwork; bảng thuật ngữ |

Tổng: 29 nền tảng, 1.331 ô chấm, khoảng 40% ô chưa xác minh được vì trang trợ giúp chặn máy
đọc. Ô «chưa xác minh» không có nghĩa sản phẩm không có. Ở 8 ô hai mảng chấm lệch nhau một
nấc. Trang xem bảng bấm được từng ô: https://claude.ai/artifact/H4nuR5qqSarGfFWesKfys6 (riêng
tư, chủ kho chia sẻ khi cần).

## 1. Kết luận

1. **Lõi vẫn là việc.** Mọi hãng tách hai loại việc (Pipedrive, Bitrix24, Odoo, Dynamics,
   Zoho, Planner, MISA AMIS) đều phải vá: «việc của tôi» nằm hai chỗ, quyền theo hai luật.
2. **Việc là một bảng riêng**, không nhét thêm trường vào dòng hoạt động. Việc gắn được
   nhiều bản ghi cùng lúc và vẫn hiện trên dòng thời gian của từng bản ghi.
3. **Trạng thái tự đặt trong nhóm cố định**: Chưa làm, Đang làm, Chờ đánh giá, Xong, Huỷ.
   Jira, Linear, ClickUp, Wrike, Odoo hội tụ kiểu này; «Chờ đánh giá» là thói quen chung của
   phần mềm Việt.
4. **Quyền xem theo bản ghi gắn kèm, có cổng phạm vi** (phương án P3, mục 4).
5. **Kết quả then chốt trỏ tới việc, không sở hữu việc**; tiến độ KR không cộng từ việc.
6. **Gantt mức đủ**: ngày bắt đầu và hạn, phụ thuộc xong-rồi-mới-bắt-đầu, tự dời việc phụ
   thuộc, mốc, bỏ ngày nghỉ. Đường găng, baseline, tải công việc để sau.

## 2. OneHub hôm nay

Ba thứ giống việc, sống tách nhau:

| Thứ | Gắn vào | Người làm | Trạng thái | Nhắc |
| --- | --- | --- | --- | --- |
| Việc cần làm (dòng hoạt động loại TASK) | công ty, liên hệ, deal, kế hoạch onboard | không có, chỉ người tạo; ai cũng đánh dấu xong được | xong / chưa | không |
| Bước kế hoạch 30 ngày | một kế hoạch, bắt buộc phòng ban | một người được giao | xong / chưa | nhắc buổi sáng Zalo/Slack, «xong n» |
| Việc (KR) | một KR; có thể là chiến dịch hay kế hoạch | một người làm | xong / chưa | không |

Quyền: bốn vai cố định và bốn phạm vi dữ liệu theo khu. Dữ liệu đối tác không chia theo
người sở hữu. Sẵn để dùng lại: bộ gom nhắc buổi sáng, dòng thời gian dùng chung, hai hộp
chuyển việc khi nghỉ, Kanban kéo thả của Deals, tác tử AI ghi việc qua bước duyệt.

**Lỗ có sẵn:** giao bước onboard cho người vai «chỉ OKR» không bị chặn, và tin nhắc buổi
sáng mang tên công ty đối tác đi qua Zalo/Slack mà không lọc vai. Phải vá trước khi gộp việc.

## 3. Mẫu thiết kế hội tụ

| Mẫu | Ai làm |
| --- | --- |
| Một loại việc gắn mọi bản ghi; đứng ở bản ghi nào thì tự gắn bản ghi đó | Salesforce, HubSpot, Attio, Odoo, Freshsales, 1Office |
| Trạng thái tự đặt trong nhóm cố định; Kanban cá nhân không đổi trạng thái chung | Jira, Linear, ClickUp, Wrike, Odoo, Dynamics |
| Kế hoạch mẫu sinh việc thường, hạn tính từ ngày mốc, người làm chọn lúc chạy | Odoo activity plan, Salesforce Action Plans, Pipedrive |
| Deal thắng thì mở việc bàn giao, dự án đọc được tệp và ghi chú của deal | Pipedrive, HubSpot, Dynamics, 1Office |
| Người được giao luôn đóng được việc của mình | Odoo, Salesforce, Asana |
| Người giao việc, một người thực hiện, người phối hợp, người theo dõi; không nhân bản | Bitrix24, 1Office, Fastwork, Asana |
| Việc của tôi chia theo vai và theo hạn | Base, MISA AMIS, Fastwork, monday, Planner, Linear |
| Gantt có ba chế độ dời ngày | Asana, monday, Notion, Bitrix24 |
| Thứ tự kéo thả bằng khoá chèn giữa | Jira LexoRank, Figma |

Bẫy: nhân bản việc khi giao nhiều người (Salesforce, Base, Getfly); trạng thái tự do không
nhóm (monday); việc ai cũng thấy (Attio); tự đóng hay xoá việc khi đóng bản ghi cha
(Bitrix24, Odoo); gọi mốc là «mục tiêu» (Base).

## 4. Phân quyền

- **P1 kế thừa từ cha** (Salesforce, Dataverse, Odoo): nhiều cha thì phép hợp làm lộ.
- **P2 quyền riêng của việc** (Asana, ClickUp, Jira): trang deal mất việc; vẫn lộ qua tiêu đề.
- **P3 hợp có cổng phạm vi — khuyến nghị.** Phạm vi của việc là phạm vi chặt nhất trong những
  gì nó gắn: có bản ghi đối tác thì là phạm vi đối tác; chỉ gắn KR thì là phạm vi OKR; không
  gắn gì thì riêng tư. Ai thấy = (người trong cuộc hoặc đọc được một bản ghi gắn) **và** vai
  đọc được phạm vi của việc.

Hệ quả: giao việc đối tác cho vai «chỉ OKR» bị từ chối kèm lý do; việc của KR gắn kế hoạch
onboard thì vai «chỉ OKR» chỉ thấy số gộp; thẻ liên kết tự kiểm quyền; quyền tính lúc đọc;
xoá bản ghi cha chỉ gỡ liên kết. Chưa quyết: cấp trên có tự thấy việc cấp dưới không.

## 5. Mục tiêu và việc

Mọi hệ đã kiểm đều để mục tiêu trỏ tới việc. Tự tính tiến độ KR từ việc làm được (Asana,
ClickUp, Lattice) nhưng không nên là mặc định (Tability, Atlassian, Felipe Castro). Từ điển
OneHub đã chốt việc (KR) không góp tiến độ: giữ nguyên, thêm một dòng «tiến độ việc» riêng.
Viva Goals đã ngừng từ 31/12/2025.

## 6. Người dùng Việt và thuật ngữ

Đã quen: ba vai (giao, thực hiện, theo dõi); đóng việc qua người giao («Chờ đánh giá», trả về
«Làm lại»); cây tổ chức quyết ai thấy gì. Bị chê nhiều nhất: giao nhiều người thành nhiều
việc; giao diện trộn Anh–Việt.

| Khái niệm | Chữ chung | Ghi chú |
| --- | --- | --- |
| task / subtask | Công việc / Công việc con | Từ điển đang có ba chữ cho ba thứ, cần gộp |
| my tasks | Việc của tôi | Giao cho tôi · Tôi giao · Đang theo dõi |
| assignee / assigner | Người thực hiện / Người giao việc | 30 ngày dùng «người được giao» |
| waiting for review | Chờ đánh giá; trả về «Làm lại» | |
| project | Dự án | Từ điển đang cấm hai lần |
| milestone | Mốc | Tránh «Mục tiêu» |

## 7. Va chạm với quyết định đã chốt

- Lộ trình 30 ngày ghi «không làm»: kéo thả bảng cột kế hoạch, nhãn tự do, ngày bắt đầu cho
  bước. Kanban và Gantt cho việc chạm hai dòng.
- Từ điển chốt ba chữ cho ba thứ và cấm chữ «dự án» ở kế hoạch 30 ngày và sáng kiến KR.
- Lượt «bước có việc con» của 30 ngày đang chờ bằng chứng; việc con ở lộ trình này trả lời câu đó.
- Việc (KR) không góp tiến độ: khảo sát ủng hộ giữ nguyên.

Mở lại các dòng trên là việc của chủ kho ở Cổng Đáng của lượt tương ứng.

## 8. Chưa trả lời được

- Ô chọn người giao bước trên màn có loại vai «chỉ OKR» không; dữ liệu thật có ca nào chưa.
- Phần lớn gói giá; G8, G9, H3 ở nhiều hãng.
- Salesforce: người được giao có sửa được việc khi không thấy bản ghi cha (nguồn bên thứ ba).
