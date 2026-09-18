---
schema_version: 1
slug: truong-tu-tao-o-cai-dat
feature: Người quản trị tìm thấy trường tự tạo ở Cài đặt và được gợi ý bộ trường của môi giới Việt
owner: Phan Le Manh
stage: scheduled
verdict:
decided_by:
decided_at:
---

## Ngưỡng đã khai tại Cổng Đáng (CHÉP NGUYÊN VĂN — cấm sửa sau khi thấy số)

- Câu hỏi phép đo trả lời: Một người chưa từng thấy màn này, xuất phát từ trang Cài đặt, có tự tạo được một trường tự tạo trên Cá nhân mà không hỏi ai không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu, người đó tạo xong một trường trên Cá nhân trong vòng ba phút, không cần chỉ dẫn, và chọn được ít nhất một gợi ý bằng tiếng Việt thay vì gõ từ đầu. Bốn tuần sau khi bật, có ít nhất ba trường tự tạo do người quản trị tạo (không phải đội phát triển gieo) đang mang giá trị trên hồ sơ thật.
- Kết quả nào là CHẾT: Người nghiệm thu không tìm ra đường vào từ Cài đặt trong hai phút; hoặc bốn tuần sau khi bật vẫn không có trường tự tạo nào do người quản trị tạo.

## Cờ của phiên

- **Chưa có nhật ký lái thử người lạ.** `stranger-drive.md` không tồn tại trong
  hồ sơ. Điều kiện «sản phẩm thật đã chạy sau cờ để người dự bấm được» vào phiên
  này bằng LỜI KHAI chứ không bằng bằng chứng. Không chặn phiên, nhưng người ký
  cần biết trước khi đọc điểm.
- **Tính năng chưa bật cho người dùng thật.** Pull request 57 đã xanh mọi cổng
  nhưng chưa merge vào `onehub`. Hệ quả có thật với ngưỡng: vế bốn tuần của
  ngưỡng SỐNG và vế bốn tuần của ngưỡng CHẾT đều chưa có đồng hồ để chạy.

## Trình tự đã chốt ngày 2026-09-18

Chủ kho chọn: **merge trước, hẹn phiên đủ sau bốn tuần**. Lý do trình tự này
thắng lối chấm-vế-trong-phòng-ngay: vế bốn tuần là vế mang phần lớn sức nặng của
ngưỡng, và họp hai lần cho một ngưỡng thì lần đầu chỉ sinh ra một verdict treo.

Đánh đổi đã biết và đã nhận: vế CHẾT thứ nhất — người nghiệm thu không tìm ra
đường vào từ Cài đặt trong hai phút — đo được ngay hôm nay và có thể cho câu trả
lời dừng trước khi giao. Chọn lối này nghĩa là nếu điều đó xảy ra, ta biết nó
SAU khi đã giao chứ không phải trước.

Ngày hẹn phiên: bốn tuần kể từ ngày merge vào `onehub`.

## Người dự

| Tên | Vai | Đại diện cho ai |
|---|---|---|
| Phan Le Manh | Chủ kho, người ký cả bốn cổng của vòng này | Chính mình — người TRONG ĐỘI, không phải người dùng đại diện thật |

**Giới hạn của bảng này, người ký cần biết trước khi đọc điểm.** Không có người
dùng đại diện thật nào dự. Người chấm duy nhất là người đã chốt phạm vi, duyệt
bộ gợi ý và ký Cổng Bằng chứng của chính vòng này, nên điểm nói về kỳ vọng nhiều
hơn nói về sản phẩm. Vế «người chưa từng thấy màn này» của câu hỏi phép đo không
có ai đứng thay, và đó là chỗ yếu nhất của phiên.

## Chấm kín (thu TRƯỚC mọi thảo luận chung)

| Người | Điểm/nhận xét kín | Sẽ gửi cho khách nào, khi nào |
|---|---|---|
| Phan Le Manh | chưa thu — phiên hẹn sau bốn tuần | chưa thu |

## Thảo luận sau khi đã chấm

## Số đo thật đặt cạnh ngưỡng

| Thước | Ngưỡng đã khai | Số đo được | SỐNG/CHẾT |
|---|---|---|---|
| Tìm ra đường vào từ Cài đặt | dưới hai phút, không chỉ dẫn | CHƯA ĐO | — |
| Tạo xong một trường trên Cá nhân | dưới ba phút, không chỉ dẫn | CHƯA ĐO | — |
| Chọn gợi ý tiếng Việt thay vì gõ từ đầu | ít nhất một lần | CHƯA ĐO | — |
| Trường tự tạo do người quản trị tạo, mang giá trị trên hồ sơ thật | ít nhất ba, sau bốn tuần kể từ khi bật | CHƯA ĐO — đồng hồ chưa chạy, tính năng chưa merge | — |

### Mốc khởi điểm cho vế bốn tuần, đo ngày 2026-09-18

Bảng dữ liệu không có cột ghi ai tạo trường, nên phép đếm bốn tuần chạy bằng
loại trừ: mọi trường KHÔNG nằm trong danh sách dưới đây là trường do người quản
trị tạo. Chốt danh sách bây giờ, trước khi bật, là thứ làm phép loại trừ đó đo
được.

| Thực thể | Khoá | Nhãn | Ngày tạo |
|---|---|---|---|
| COMPANY | account_type | Account type | 2026-09-07 |
| COMPANY | segment | Segment | 2026-09-07 |
| COMPANY | lifecycle_stage | Lifecycle stage | 2026-09-07 |
| COMPANY | territory | Territory | 2026-09-07 |
| COMPANY | lead_source | Lead source | 2026-09-07 |
| COMPANY | icp_fit_score | ICP fit score | 2026-09-07 |
| COMPANY | bdr_owner | BDR owner | 2026-09-07 |
| CONTACT | san_luong | Sản lượng | 2026-09-10 |
| CONTACT | tin_moi_30_ngay | Tin mới 30 ngày | 2026-09-10 |
| CONTACT | dia_ban | Địa bàn | 2026-09-10 |

Mười trường, tất cả do đội gieo. Bảy trường COMPANY là bộ mẫu tiếng Anh cũ; ba
trường CONTACT do bộ cào của vòng tiếp thị gieo. Số trường do người quản trị tạo
hôm nay là **không**, và 198 giá trị đang mang trên hồ sơ đều thuộc mười trường
trên. Đồng hồ bốn tuần bắt đầu từ mốc không này, tính từ ngày merge.

## Quyết định Cổng Giá trị

- **verdict = ** Căn cứ:
- Bước kế:
