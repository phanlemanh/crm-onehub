---
slug: ngay-gieo-theo-gio-vn
at: 2026-09-23T00:02:30Z
verdict: findings
p0: 0
p1: 1
p2: 4
claims_input: ok
---

# Gap probe: ngay-gieo-theo-gio-vn

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | Không nói E1–E5 chạy trên cơ sở dữ liệu nào; lượt răng có thể dùng chung crm_test với eval khác | E4 lượt lành gieo và dọn bảng cùng lúc với E1/E5 trên crm_test, viec-cua-toi khung-ngay đỏ giả | Răng đọc và in tên cơ sở dữ liệu của từng lượt, đỏ nếu là crm_test | fixed: mọi eval đi qua bun run test -- nên có crm_<id>_test riêng; răng nay đọc tên đó từ đầu ra, đỏ khi vắng hoặc là crm_test, và in ra (đã chạy: crm_mudbzyrh0mo8_test, crm_mudbzzvd8xbn_test) |
| P2 | evals | Không đo giả định bun test không nhặt thư mục chấm; không dọn bản sao sót khi răng bị giết | Bản sao có ngayCach UTC sót lại, E6/E8 nhặt được và đỏ đổ cho bản sửa | Răng kiểm bản sao sót trước khi chép; khẳng định bun test toàn gói không nhặt .sao-ngay- | fixed: răng tìm apps/api/.sao-ngay-*, pid chết thì dọn, pid sống thì thoát 2 gọi tên (thử hai chiều); phần eval riêng cho việc quét: rejected — đã thử tay, ca cố ý đỏ trong apps/api/.sao-thu không chạy khi bun test quét gói, chạy khi gọi đường tường minh |
| P2 | contract | Ma trận E1/E2 không tách theo chế độ; phủ định (bước của B, bước xong, kế hoạch đóng) thiếu đối chứng dương | Nhánh everyone hỏng mà vẫn xanh; bước của B gieo lệch thì «không vào» đúng rỗng | Ma trận 2 chế độ × 4 dòng; đối chứng dương cho từng phủ định | fixed: expected của E1 nói rõ mỗi khẳng định chạy theo từng chế độ và thông điệp mang tên chế độ (mã test đã vậy); đối chứng dương cho ba phủ định: rejected — khẳng định có sẵn từ hồ sơ moi-phia-deu-thay-ke-hoach, vòng này không hứa gì mới về chúng |
| P2 | contract | Không đo đồng hồ được trả lại sau setSystemTime | Ca ghim giờ đỏ giữa chừng, mười hai ca còn lại chạy trên mốc đóng băng mà E5 vẫn xanh | Ca kiểm Date.now lệch đồng hồ thật dưới 60 giây | deferred: afterEach trả đồng hồ ở cả hai describe và bun chạy afterEach cả khi ca đỏ, cùng khuôn han-viec.spec.ts; ca kiểm cần một nguồn giờ không bị setSystemTime đè mà vòng này chưa kiểm được |
| P2 | evals | Design không nói ngayVN lấy từ đâu; tệp nguồn có thể nằm ngoài paths | Sửa ngayVN ở tệp ngoài paths, bản ghim E1–E4 vẫn báo tươi | Ghi nguồn ngayVN; đưa tệp đó vào paths | fixed: design ghi ngayVN nhập từ @crm/db/onboarding-nhac (packages/db/src/onboarding-nhac.ts), tệp đó đã nằm trong paths của E1–E4 |
