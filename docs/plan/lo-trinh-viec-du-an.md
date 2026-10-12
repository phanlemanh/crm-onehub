# Lộ trình Việc và Dự án trên CRM OneHub

Viết 2026-10-05, rút từ nghiên cứu nền `viec-du-an-nghien-cuu.md`. Tệp máy đọc là
`lo-trinh-viec-du-an.json`; trang `LO-TRINH.html` vẽ nó cạnh lộ trình OKR và Kho tài liệu.
Mở một lượt bằng `/feature-loop:feature-loop docs/plan/lo-trinh-viec-du-an.json:<mã>`: máy dựng ô cơ
hội từ hàng rồi dừng ở Cổng Đáng.

Lộ trình trình bày theo lượt và điều kiện mở, không theo ngày. Ngưỡng ở cột «bật khi» là
đề xuất của máy, chủ kho chốt ở Cổng Đáng của từng lượt.

## 1. Đích đến

Một loại việc cho cả CRM: gắn được vào deal, công ty, liên hệ, kế hoạch onboard, kết quả
then chốt và dự án; xem được dạng danh sách, Kanban và Gantt; quyền xem đi theo bản ghi
gắn kèm và không bao giờ đưa dữ liệu đối tác tới người vai «chỉ OKR».

## 2. Các lượt

| Mã | Câu giao | Bàn giao | Chạy khi |
| --- | --- | --- | --- |
| DA0 | Biết các hãng làm thế nào và nên làm theo thứ tự nào | Nghiên cứu nền, trang bảng năng lực | Xong 05/10 |
| DA0a | Người vai «chỉ OKR» không được giao bước onboard, không nhận tên đối tác qua tin nhắc | Chặn ở chỗ giao bước và ở bộ gom nhắc, kèm test | Ngay |
| DA1 | Giao việc gắn deal hay kế hoạch; người nhận thấy trong Việc của tôi và được nhắc | Bảng việc riêng, ba vai, nhóm trạng thái, quyền P3, Việc của tôi, nhắc, chuyển việc khi nghỉ | DA0a gộp (từ điển «Việc» mở 07/10) |
| DA2 | Kéo việc giữa các cột; tách việc to thành việc con | Kanban việc, việc con một tầng, checklist | DA1 gộp; mở lại «không làm: kéo thả bảng cột» |
| DA3 | Kế hoạch onboard từ khuôn có sẵn việc; deal thắng thì gợi ý mở kế hoạch | Khuôn sinh việc thường; gợi ý khi deal thắng | DA1 gộp |
| DA4 | Gom việc của một đợt triển khai vào dự án, xem Gantt | Dự án, Gantt mức đủ | DA2 và DA3 gộp; mở «không làm: ngày bắt đầu cho bước» (từ điển «Dự án» mở 07/10) |
| DA5 | KR hiện việc chung gắn với nó | KR nối việc chung, dòng tiến độ việc riêng | DA1 gộp; sau buổi đọc số 8a ngày 01/12 |

Để sau: Gantt nâng cao (DA6), cấp trên thấy việc cấp dưới (DA7), AI đề xuất việc từ email và
cuộc họp (DA8). Không làm: bốn mục trong `da_bac` của tệp JSON.

Thứ tự chạy: DA0a → DA1 → (DA2, DA3, DA5 song song được) → DA4. Năm lượt T3 chạm
`packages/db/prisma` nên mỗi lượt có thêm Cổng 1.5.

## 3. Nối với hai lộ trình đang chạy

- **OKR, hàng 8a** (`canh-kr-okr`) đẻ ra loại việc riêng của KR. DA5 thay nó bằng việc chung;
  chờ buổi đọc số 8a ngày 01/12 để thước của 8a không đổi giữa kỳ.
- **OKR, hàng 2** (`vai-chi-okr`): DA0a vá đúng lỗ của luật này ở kênh nhắc.
- **OKR, hàng E3** (danh sách kéo thả chung) và **E6** (điều phối vá): DA2 dùng chung thành
  phần kéo thả với E3; DA3 gom với E6. Hai hàng đó nằm trong nhóm «crm-chung» của tệp OKR.
- **Kho tài liệu**: chưa nối. Ứng viên để sau là việc gắn trang tài liệu chờ duyệt.
- **Lộ trình 30 ngày** (`lo-trinh-dieu-phoi-30-ngay.md`, chưa khai cho trang): ba dòng «không
  làm» và lượt «bước có việc con» đụng DA2 và DA4. Mở lại là quyết định của chủ kho.
