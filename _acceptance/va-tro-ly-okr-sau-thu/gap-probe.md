---
slug: va-tro-ly-okr-sau-thu
at: 2026-09-30T21:20:09Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | AC-4 bắt mục năng lực «AI model» đọc cùng hàm nguồn khoá, nhưng hàm trả một giá trị theo thứ tự ưu tiên nên khoá riêng che khoá chung hay vé OIDC đứng sau; ma trận E4 thiếu ô tổ hợp. Cùng dạng lỗ với [gioi-han-duyet-cay-okr#F1]. | Chủ kho cắm OKR_AI_GATEWAY_API_KEY vào dự án chỉ có OIDC; hàm trả khoa-rieng, bản cài lọc theo giá trị tắt mục năng lực, mọi việc AI trên prod tắt; bốn ô cũ của E4 vẫn xanh. | AC-4 nói rõ chế độ bỏ qua khoá riêng; E4 thêm ô riêng+chung, riêng+header, riêng+biến OIDC; chiều đỏ 'nang luc bi khoa rieng che'. | fixed: AC-4 viết lại với chế độ bỏ qua khoá riêng và ma trận bảy ô; E4 thêm ba ô tổ hợp và chiều đỏ (b); design §1 ghi `{ rieng: false }` |
| P1 | evals | E1, E2 gọi getVercelOidcToken thật mà không ghim khuôn vé và không cô lập đường làm mới vé qua .vercel và phiên CLI; Trục A thiếu ô vé hết hạn hoặc sai khuôn. | Vé giả 'tok' làm thư viện ném rồi làm mới, ô header ra null, người cài giả layVe mất đối chứng thật; máy đã liên kết Vercel làm ô không vé ra oidc còn CI ra null. | Fixture JWT còn hạn kiểm bằng bộ giải mã thật; ô vé hết hạn và vé không phải JWT ra null; HOME và cwd tạm, spy fetch đếm 0. | fixed: AC-1 thêm hai ô và điều kiện máy không liên kết Vercel; E1 mười ô, fixture JWT kiểm bằng thư viện, HOME/cwd tạm, spy fetch; E2 dùng cùng fixture; Trục A thêm hai ô |
| P1 | contract | Hàng cũ `san-sang` không có dòng trên bảng trạng thái và E7 trả null như thiếu khoá; E8 không có ca cho nó. | Môi trường có hàng `san-sang` cũ, kiểm lại không chạy; thẻ coi null là thiếu khoá và hiện «Chưa có khoá mô hình» trong khi trợ lý vẫn chạy — hai giọng trên thẻ Cài đặt. | Dòng ST cho sẵn sàng cũ, hoặc hàng cũ kích kiểm lại; E8 có ca; chiều đỏ 'the lech san sang cu'. | fixed: cả hai — thêm ST-caidat-san-sang-cu và nguonKhoa 'chua-ro'; kiểm lại khi nguồn đổi (AC-3) ghi nguồn cho hàng cũ sau hạn; E7, E8 thêm ca và chiều đỏ |
| P1 | contract | nguonKhoa rút từ lượt kiểm gần nhất nhưng kiểm lại chỉ chạy khi thiếu khoá; thêm khoá riêng sau khi đã sẵn sàng thì thẻ mãi ghi nguồn cũ. | Prod lên «qua Vercel», chủ kho cắm khoá riêng và redeploy, thẻ vẫn «qua Vercel»; quản trị đọc sai khoản chi đi qua khoá nào; mọi eval xanh. | Thêm vế AC-3 và ca E3 cho đổi oidc → khoá riêng với đối chứng, hoặc ghi Out of scope. | fixed: phương án (a) mở rộng — kiểm lại khi nguồn hiện tại khác kết quả đã ghi và quá hạn; AC-3 bảng bốn lượt đổi + đối chứng trùng nguồn và chưa quá hạn; E3 viết lại; Out of scope bỏ dòng «khoá bị gỡ» |
| P2 | evals | Câu không dấu của E10 sinh bằng chính boDau đang kiểm; lỗi boDau lặp ở hai phía. | boDau giữ «đ» thì «đào tạo» thành «đao tao» ở cả danh sách lẫn câu kiểm, E10 xanh, người gõ «dao tao 50 nhan su» không bị gắn. | Câu không dấu khẳng định ASCII thuần; ca viết tay 'dao tao 50 nhan su'; chiều đỏ 'khong dau con d-gach'. | fixed: E10 khẳng định ASCII cho mọi câu không dấu và thêm ba ca viết tay |
