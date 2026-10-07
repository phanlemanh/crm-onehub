# Khung khảo sát: Việc – Dự án – Kanban – Gantt – Phân quyền cho CRM

Ngày mở: 2026-10-05. Mục đích: lập bảng năng lực của các nền tảng hàng đầu, từ đó
ra danh sách tính năng và kiến nghị cho OneHub CRM. Việc phải liên kết được với
Deal, kế hoạch Onboard, OKR đang có.

Hướng đã chốt với chủ kho: **một loại việc duy nhất, gắn được vào mọi bản ghi**
(kiểu Salesforce / HubSpot / Odoo). Kanban và Gantt là cách xem, dự án là chỗ
chứa việc.

## Thang chấm

| Ký hiệu | Nghĩa |
| --- | --- |
| **M** | Mạnh — làm tốt, đầy đủ, là chuẩn người khác theo |
| **Đ** | Đủ — có, dùng được, không nổi bật |
| **Y** | Yếu — có nhưng thiếu nhiều, hoặc phải ghép ứng dụng phụ |
| **–** | Không có |
| **?** | Chưa xác minh được (ghi lý do: không tìm ra / hết hạn mức tìm) |

Mỗi ô ghi kèm **gói** nếu tính năng bị khoá theo gói giá (vd `M (Enterprise)`),
và **một nguồn** (URL trang trợ giúp/tài liệu chính hãng, ưu tiên hơn trang
marketing). Ô nào chỉ dựa trí nhớ, không mở được nguồn → hạ thành `?`.

## Danh mục năng lực (mã dùng chung cho mọi bảng)

### A. Mô hình việc
- A1 Một loại việc dùng chung cho mọi đối tượng (gắn deal, công ty, liên hệ, đối tượng tự tạo)
- A2 Một việc gắn nhiều bản ghi cùng lúc
- A3 Việc con / phân cấp nhiều tầng
- A4 Việc lặp lại
- A5 Loại việc cấu hình được (gọi, email, họp, việc thường…)
- A6 Trạng thái nhiều nấc, tuỳ biến (và có hay không nhóm trạng thái cố định)
- A7 Độ ưu tiên, nhãn
- A8 Trường tuỳ biến trên việc
- A9 Checklist trong việc
- A10 Nhiều người làm / người phụ trách + người theo dõi
- A11 Bình luận, @nhắc tên, đính kèm
- A12 Ước lượng và ghi giờ làm
- A13 Lịch sử thay đổi của việc

### B. Việc của tôi
- B1 Trang «việc của tôi» gom mọi nguồn
- B2 Hàng đợi làm lần lượt (task queue)
- B3 Nhắc hạn, thông báo (email, di động, chat)
- B4 Bộ lọc và góc nhìn đã lưu, chia sẻ góc nhìn
- B5 Đồng bộ lịch (Google / Outlook)
- B6 Giao việc cho người khác; uỷ quyền khi vắng

### C. Dự án
- C1 Dự án là đối tượng riêng
- C2 Mẫu dự án / kế hoạch sinh việc với hạn tương đối
- C3 Danh mục dự án (portfolio) + trạng thái sức khoẻ
- C4 Dự án gắn với khách hàng / deal (bàn giao sau bán)
- C5 Tự tạo dự án hoặc kế hoạch khi deal thắng
- C6 Khách ngoài xem tiến độ (client portal)

### D. Kanban
- D1 Bảng theo trạng thái
- D2 Nhóm cột theo trường bất kỳ
- D3 Làn ngang (swimlane)
- D4 Giới hạn WIP
- D5 Kéo thả kèm điều kiện (bắt buộc điền trường khi sang cột)

### E. Gantt / Timeline
- E1 Thanh ngang ngày bắt đầu – kết thúc
- E2 Phụ thuộc (FS/SS/FF/SF, độ trễ)
- E3 Tự dời lịch theo phụ thuộc
- E4 Đường găng (critical path)
- E5 Đường cơ sở (baseline)
- E6 Mốc (milestone)
- E7 Lịch làm việc, ngày nghỉ
- E8 Tải công việc / năng lực từng người

### F. Tự động hoá và AI
- F1 Quy tắc: sự kiện trên bản ghi → tạo việc (vd deal sang giai đoạn X)
- F2 Chuỗi bước (sequence / cadence)
- F3 Playbook / hướng dẫn gắn trong việc
- F4 AI tạo việc từ email/cuộc họp, gợi ý việc kế tiếp
- F5 Tác tử AI được giao việc / tự hoàn thành việc

### G. Phân quyền
- G1 Vai và hồ sơ quyền (xem/tạo/sửa/xoá theo đối tượng)
- G2 Phạm vi theo chủ sở hữu / đội / cây tổ chức (own / team / all)
- G3 Quyền của việc kế thừa từ bản ghi cha
- G4 Chia sẻ thủ công / theo quy tắc
- G5 Quyền mức trường
- G6 Việc riêng tư
- G7 Người dùng giới hạn (khách ngoài, hoặc chỉ một khu)
- G8 Chuyển giao việc khi nhân sự nghỉ
- G9 Nhật ký kiểm toán

### H. Mục tiêu / OKR
- H1 Mục tiêu liên kết tới dự án / việc
- H2 Tiến độ mục tiêu tự tính từ việc / dự án
- H3 Check-in mục tiêu dẫn về việc

### I. Báo cáo
- I1 Báo cáo việc (quá hạn, hoàn thành, theo người)
- I2 Bảng điều khiển dự án

### J. Nền tảng
- J1 API / webhook cho việc
- J2 Ứng dụng di động
- J3 Nhập / xuất (CSV, MS Project)

## Khuôn tệp kết quả của mỗi tác tử

```
# <Tên mảng>
Ngày tra: 2026-10-05 · Số lượt WebSearch đã dùng: N

## Bảng chấm
| Mã | <Sản phẩm 1> | <Sản phẩm 2> | … |
(mỗi ô: ký hiệu + gói; nguồn để ở mục Nguồn, đánh số [n])

## Mỗi sản phẩm: cách họ quy hoạch việc
(5–10 dòng: mô hình dữ liệu việc, dự án, quyền, điểm mạnh, điểm khách phàn nàn)

## Mẫu thiết kế đáng học
## Bẫy / điều nên tránh
## Câu hỏi còn mở, khẳng định chưa xác minh
## Nguồn
[n] URL — tiêu đề — ngày tra
```

Viết tiếng Việt, giữ nguyên tên sản phẩm và tên tính năng gốc (để trong ngoặc
nếu cần). Không bịa tên tính năng; không tìm ra thì ghi `?`.
