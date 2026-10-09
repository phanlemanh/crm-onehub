---
schema_version: 1
slug: dien-thoai-ca-nhan
feature: «Số điện thoại là trường chính của cá nhân: nhập được lúc tạo, thấy ở bảng, tìm được theo số»
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-09T00:01:52Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Anh báo trực tiếp 09/10 kèm ảnh form «Thêm cá nhân» (tab Cá nhân của một công ty): form chỉ có Tên · Họ · Email · Chức danh. Ở Việt Nam số điện thoại là trường chính để nhận diện và liên hệ một người; sale có số của khách trước khi có email.

- Đã có: cột `Contact.phone`; API `contacts.create`/`update` nhận `phone` (`apps/api/src/contacts/contacts.contracts.ts:26`, `contacts.service.ts:329`); trang chi tiết cá nhân hiện và sửa số.
- Thiếu (hàng này, DT1): ô Điện thoại ở form «Thêm cá nhân» của tab Cá nhân (`quick-add.tsx`) và ở sheet «Cá nhân mới» của trang Cá nhân (`create-contact-sheet.tsx`); cột Điện thoại ở bảng Cá nhân; tìm theo số ở bảng Cá nhân, ⌘K và Kara trong app; gợi ý chọn môi giới ở «30 ngày đầu» hiện email nên người nạp từ listing (chỉ có số) không có gợi ý; chống trùng chỉ theo email.
- Người gặp: mọi sale thêm khách mới; người tra lại khách qua số khi khách gọi tới.
- Nguồn điều phối: yêu cầu `DT-1` đợt sau-14-10, giám sát duyệt 2026-10-08T23:54:43Z, luật 46 (moc 2026-10-09).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Sale có số điện thoại của khách ngay lúc thêm người | Ô mới đứng trống, không đổi gì | Đếm tỉ lệ cá nhân tạo tay có số sau hai tuần | Chưa thử |
| 2 | Một số điện thoại thuộc về một người (dùng để chống trùng) | Chặn trùng làm kẹt khi nhiều người dùng chung tổng đài | Câu A/B/C ở Cổng 1; đếm số trùng trong dữ liệu hiện có trước khi bật chặn | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi giao, cá nhân sale thêm tay có mang số điện thoại không, và gõ số có ra đúng người không.
- Kết quả nào là SỐNG: trong hai tuần sau khi lên production, ≥ 80% cá nhân tạo tay (`source = MANUAL`) có số điện thoại; gõ một số đã lưu (dạng `0901…` hay `+84…`) vào ô tìm bảng Cá nhân và ⌘K đều ra đúng người.
- Kết quả nào là CHẾT: dưới 50% cá nhân tạo tay có số sau hai tuần, hoặc có dù một lần sale báo không nhập được số khi thêm người.
- Timebox: một ngày công, PR trước 10/10; đọc số 23/10 (hai tuần sau khi lên).

## Kết quả prototype

Không dựng prototype riêng — sửa nóng trên luồng đã có; bản bấm được trình ở Cổng 1 qua nghi thức design-pass.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có vật liệu ngoài kho | — | — | — | — |

## Cổng 0

- **decision = build** Căn cứ: anh ký «Build DT1 · ngưỡng: như đề xuất · chống trùng: A» lúc 2026-10-09T00:01:52Z; lỗi anh báo trực tiếp 09/10, dữ liệu và API đã sẵn.
- **disposition = …** Căn cứ: không có prototype.
- **Ngưỡng UAT chốt cùng lúc ký:** như mục «Ngưỡng chết / ngưỡng UAT» (anh chọn «như đề xuất»). Câu chống trùng anh chọn A (chuẩn hoá +84, chặn trùng như email) — chảy vào hợp đồng ở Cổng 1.

## Thước đo thành công → ứng viên criterion

- Tỉ lệ cá nhân tạo tay có số → AC: form tạo ở cả hai chỗ gửi `phone` và lưu được.
- Tìm theo số ra đúng người → AC: tìm ở bảng Cá nhân, ⌘K, Kara theo số (cả dạng `0…` và `+84…` nếu chọn chuẩn hoá).

## Out of scope từ khám phá

- Số điện thoại ở thoả thuận và tab Cá nhân của công ty (ô chọn người, bảng người, dòng người) — hàng DT2 `dien-thoai-o-deal-cong-ty`, đi sau K4b, V2, E4 vì chạm cùng tệp.
- Form web chỉ có số điện thoại bị bỏ «No email address» (`apps/api/src/tracking/tracking-filing.service.ts:69`) — đường T3 tracking, hàng riêng sau.
- Kara trả lời qua Zalo không nói số điện thoại — luật dữ liệu cố ý (`apps/agent/agent/lib/zalo-chi-dan.ts:7`), giữ nguyên.
