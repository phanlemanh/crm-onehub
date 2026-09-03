---
slug: nhan-ung-dung-noi-tieng-viet
at: 2026-09-02T12:30:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

# Phản biện ngữ cảnh sạch — vòng ③a

Một người phản biện ngữ cảnh sạch, sáu đầu vào: design doc · contract · evals ·
sổ quyết định · bài học thừa kế từ vòng trước · hồ sơ cơ hội. Không đọc mã kho.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Nhãn bảy giai đoạn thoả thuận không được xếp về phía dữ liệu hay phía nhãn, trong khi luồng suôn sẻ lại kết bằng "đổi giai đoạn" | Giai đoạn là enum từ cơ sở dữ liệu. E1 trừ nó ra như dữ liệu nên xanh; E7 bọc `lang="en"` nên badge ở lại tiếng Anh. Nhân viên chạy đúng luồng ngưỡng, tới bước bắt buộc cuối thì gặp `DEMO_BOOKED`. Ngưỡng chết ngay tại bước ký | Một tiêu chí gọi tên đủ bảy giá trị và nói chúng thuộc phía nào; một chân eval liệt kê từng giá trị kèm kết quả mong đợi | **fixed** — thêm AC-14 và E16, gọi tên đủ bảy giá trị. Nghĩa của chúng là quyết định nghiệp vụ CHƯA AI CHỐT (`CONTEXT.md` khai thế), nên AC-14 đòi chúng nằm trong phần tử `lang="en"` cho tới khi có người đặt tên, và Cổng 1 phải thấy điều đó |
| P0 | contract | AC-3 hứa câu báo lưu hỏng là tiếng Việt, trong khi Ngoài phạm vi đẩy toàn bộ câu lỗi máy chủ sang vòng ④ | E3 ép hỏng bằng cắt mạng nên chỉ chạm nhánh lỗi phía trình duyệt, và xanh. Máy chủ trả 400 kèm câu tiếng Anh thì thông báo nổi hiện nguyên văn — đúng nhánh AC-3 hứa và đúng nhánh hợp đồng cấm chạm | Thu AC-3 lại, hoặc kéo các chỗ gọi thông báo nổi vào lát; dù lối nào E3 cũng phải ép một lỗi THẬT từ máy chủ | **fixed** — AC-3 thu lại còn nhánh trình duyệt, và nói thẳng câu máy chủ trả về vẫn tiếng Anh. E3 nay ép lỗi thật từ máy chủ và khẳng định chữ hiện ra, để chỗ đứt được ĐO chứ không được giấu |
| P0 | evals | Trục "nơi hiện ra" có giá trị *chữ phải mở menu mới thấy* — đúng nhánh vòng ① bỏ sót — mà không phép đo nào mở menu | E1 trừ xong còn 0, exit 0. Nội dung menu Bộ lọc, Sắp xếp, Cột chỉ vẽ khi mở nên chưa bao giờ vào DOM. Nhân viên bấm Cột, thấy tiêu đề tiếng Anh. Cùng lớp lỗi vòng ① đã trả giá, lần thứ ba | E1 và E2 khai trước danh sách mọi bề mặt phải mở; số bề mặt mở bằng số phần tử trong danh sách; lượt chạy in tên từng bề mặt | **fixed** — E1 và E2 nay khai danh sách bề mặt phải mở và phải in tên từng cái; số mở khác số khai là chân đỏ |
| P1 | evals | E6 tuyên quét cả lớp "mọi hàm ghép biến" mà không có ma trận toàn phần viết trước. Đúng lỗi `[tieng-viet-cho-crm#F2]` | Bài kiểm phủ chín hàm, exit 0. `deals.ts` mọc hàm thứ mười không ai khẳng định, câu ra sai trật tự từ. 76 chuỗi mà con số duy nhất người duyệt thấy là exit 0 | `expected` liệt kê từng hàm theo tên và module; số khẳng định = số hàm × 2 lượt gọi | **fixed** — E6 nay đòi ma trận toàn phần và một chân đếm: số hàm ghép biến trong kho chuỗi phải BẰNG số hàm có khẳng định |
| P1 | evals | E14 nhận hai đầu vào mà không phép đo nào sinh ra | Người chấm mở hai file không tồn tại, rồi hoặc đoán từ ảnh chụp, hoặc chấm bằng cảm giác. AC-13 xanh mà không đứng trên số đo nào | Thêm file vào `evidence_required` của E10; gán bước sinh `ban-dich.md`; E14 trượt cứng khi thiếu đầu vào | **fixed** — E10 nay bắt buộc xuất `E10-chu-hien-ra.txt`; `ban-dich.md` là vật S3 phải sinh TRƯỚC khi chạm mã và nằm trong `paths` của E12; E14 khai trượt-cứng khi thiếu đầu vào |

## Điều người phản biện KHÔNG lật, và đúng là không nên lật

Không finding nào đòi bỏ đường A (không thêm thư viện), bỏ cách cắt lát, hay bỏ
cách khoanh lát bằng đồ thị nhập. Ba thứ đó đã có entry trong sổ quyết định.

## Việc còn lại của người, không phải của máy

P0 thứ nhất chạm một thứ **máy không quyết được**: bảy giai đoạn thoả thuận chưa
ai định nghĩa. `CONTEXT.md` ghi thẳng — *"CHƯA CHỐT NGHĨA. Dữ liệu đang mang bảy
bước của một phễu bán phần mềm, thừa kế từ kho gốc và không mô tả quy trình hợp
tác của OneHub."* Dịch một bước không xảy ra là in cái sai ra màn hình bằng thứ
tiếng người đọc hiểu được. AC-14 vì thế **không dịch chúng**, mà bắt chúng khai
đúng tiếng của mình — và đưa câu hỏi lên Cổng 1.
