---
schema_version: 1
slug: du-an-gantt
feature: Tôi gom việc của một đợt triển khai vào một dự án và xem trên sơ đồ Gantt có phụ thuộc và mốc
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-16T08:06:53Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA4
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA4 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Tôi gom việc của một đợt triển khai vào một dự án và xem trên sơ đồ Gantt có phụ thuộc và mốc

Vì sao: Dự án là chỗ chứa việc; Gantt mức đủ là ngày bắt đầu và hạn, phụ thuộc xong-rồi-mới-bắt-đầu, tự dời, mốc, bỏ ngày nghỉ.

- **Người gặp:** người cầm một đợt triển khai có đầu có cuối (triển khai cho một đối tác, một đợt ra mắt), cùng người thực hiện các việc trong đợt. Sau DA1–DA3, việc gắn được deal, công ty, liên hệ, kế hoạch onboard, xem được danh sách và Kanban — nhưng không có chỗ gom việc của một đợt, việc chỉ có hạn chứ không có ngày bắt đầu, và «việc B chỉ bắt đầu khi việc A xong» chỉ nằm trong đầu người cầm.
- **Vật đã có:** mô hình `Viec` (năm trạng thái, `hanNgay`, việc con một tầng, `ViecGan` gắn nhiều bản ghi, sổ `ViecVet`), quyền P3 của DA1, Kanban việc của DA2, khuôn sinh việc của DA3. Thành phần `gantt` của ReUI chưa cài (`docs/reui.md` xếp vào «những thứ kho chưa có»; `docs/proto.md` cho phép cài ngay lúc dựng bản mẫu). Kho chưa có lịch ngày nghỉ chung — chỉ có «khoảng nghỉ» riêng của chu kỳ OKR.
- **Va chạm đã chốt:** từ điển «Dự án» (mở 07/10): kế hoạch 30 ngày và sáng kiến (KR) không phải dự án. `da_bac` x2: không có loại việc riêng cho dự án — dự án chứa «Việc chung» của DA1. x4: đóng hay xoá dự án không tự đóng/xoá việc. Dòng «không làm: ngày bắt đầu cho bước» của lộ trình 30 ngày chủ kho đã mở 14/10. Ngoài phạm vi: Gantt nâng cao DA6 (độ trễ, đường găng, baseline, tải người).
- **Cỡ:** T3 (chạm `packages/db/prisma`). Năm vế của «Gantt mức đủ» cộng dự án cộng lịch ngày nghỉ dễ vượt 12 tiêu chí; nếu hợp đồng ≥13 tiêu chí, Cổng Phạm vi sẽ trình chốt cỡ hoặc tách hàng (như DA3 → DA3b).

## Ước lượng

DA4: bắt đầu ~16/10 · ~16 giờ máy · hoàn tất dự kiến 21/10 · mục tiêu 23/10 (mốc m-1024).

DA3 đi từ bước thiết kế (14/10) tới gộp onehub (16/10) trong khoảng hai ngày; DA4 lớn hơn (bảng mới, thuật toán dời lịch, thành phần Gantt mới) nên tính gấp rưỡi. Rủi ro lịch: chờ làn nặng trên M5 và cửa sổ gộp giờ chẵn.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau hai tuần dùng thật, người dùng có gom việc của một đợt triển khai vào dự án và lập lịch có phụ thuộc, có mốc trên Gantt không?
- Kết quả nào là SỐNG: Trong 14 ngày đầu kể từ ngày gộp: ít nhất 3 dự án, mỗi dự án có ít nhất 5 việc mang cả ngày bắt đầu lẫn hạn; ít nhất 2 trong số đó có ít nhất một phụ thuộc và một mốc; các dự án ấy do ít nhất 2 người khác nhau tạo. Đếm trên bảng dự án, việc và phụ thuộc, bỏ dữ liệu mẫu.
- Kết quả nào là CHẾT: Dưới 2 dự án đạt «5 việc có đủ hai ngày», hoặc không dự án nào có phụ thuộc khi hết 14 ngày. Giữa hai mức là «làm tiếp» (iterate), không phải sống.
- Timebox: Đọc số sau 14 ngày dùng thật kể từ ngày gộp vào onehub.

Hàng DA4 không khai «bật khi»; ngưỡng trên do máy đề xuất, chủ kho giữ nguyên ở Cổng Đáng. Đường đo đọc thẳng từ bảng dự án, việc và phụ thuộc mà vòng này tạo — sẽ thành một tiêu chí của hợp đồng.

## Quyết định đi kèm Cổng Đáng

1. **Ngày nghỉ.** «Bỏ ngày nghỉ» cần biết ngày nào là ngày nghỉ của OneHub. Máy khuyên: một lịch làm việc chung cho cả workspace — mặc định nghỉ Thứ Bảy và Chủ nhật, quản trị thêm ngày lễ bằng tay ở cài đặt. Lối khác: chỉ nghỉ Chủ nhật (nếu OneHub làm Thứ Bảy) — giá như nhau, chỉ khác mặc định; hoặc nạp sẵn lịch lễ Việt Nam — thêm việc giữ lịch âm hằng năm, máy không khuyên.

## Nguồn quyết định Cổng Đáng

Chủ kho gõ ở phiên thợ DA4 (máy M5) ngày 16/10/2026: «Cổng Đáng du-an-gantt: build · ngưỡng giữ đề xuất · ngày nghỉ
T7+CN, quản trị thêm ngày lễ». `decided_at` là giờ phiên thợ ghi lại lời đó. Ngưỡng giữ đề xuất của máy ở mục
«Ngưỡng chết / ngưỡng UAT». Ngày nghỉ: một lịch làm việc chung cho cả workspace, mặc định nghỉ Thứ Bảy và Chủ nhật,
quản trị thêm ngày lễ bằng tay ở cài đặt.
