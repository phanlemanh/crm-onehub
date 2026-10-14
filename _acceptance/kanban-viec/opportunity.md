---
schema_version: 1
slug: kanban-viec
feature: Tôi kéo việc giữa các cột Chưa làm, Đang làm, Chờ đánh giá, Xong, và tách một việc to thành việc con
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-13T08:28:58Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA2
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA2 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Tôi kéo việc giữa các cột Chưa làm, Đang làm, Chờ đánh giá, Xong, và tách một việc to thành việc con

Vì sao: Kanban là cách xem phổ biến nhất của việc; việc con trả lời luôn lượt «bước có việc con» đang chờ của kế hoạch 30 ngày.

- **Người gặp:** người thực hiện và người giao việc. Sau DA1 (`viec-chung`, gộp 13/10, onehub `85c0e4cc9`), «Việc của tôi» là danh sách; đổi trạng thái là chọn từng việc một, và một việc to không chia được cho nhiều người — muốn chia thì tạo nhiều việc rời, mất liên hệ giữa chúng.
- **Vật đã có:** mô hình `Viec` (năm trạng thái `CHUA_LAM` · `DANG_LAM` · `CHO_DANH_GIA` · `XONG` · `HUY`, đồ thị chuyển trạng thái của DA1), sổ `ViecVet` ghi mỗi lần đổi kèm `nguon` (nay chỉ `"web"`), và thành phần kéo thả chung `packages/ui/src/components/sortable-list.tsx` của hàng E3 (`danh-sach-keo-chung`, đã lên onehub #311).
- **Va chạm đã chốt:** lộ trình 30 ngày ghi «không làm: kéo thả bảng cột» (`docs/plan/lo-trinh-dieu-phoi-30-ngay.md:160`), và nghiên cứu ghi mở lại dòng đó là việc của chủ kho ở Cổng Đáng của lượt này (`docs/plan/viec-du-an-nghien-cuu.md` mục 7). Dòng ấy nói về bảng cột của *kế hoạch onboard*; DA2 là bảng cột của *Việc*.
- **Phân vùng:** DA1b (`chep-viec-can-lam-cu`) có thể chạy song song, chạm dữ liệu cũ và tác nhân; DA2 chạm đồ thị trạng thái, giao diện bảng cột và việc con. Tệp ghi chung (vd `viec-ghi.ts`) báo Điều phối M5 xếp thứ tự gộp.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau hai tuần dùng thật, người dùng có đổi trạng thái việc bằng cách kéo trên bảng cột, và có tách việc to thành việc con không?
- Kết quả nào là SỐNG: Trong 14 ngày đầu kể từ ngày gộp: ít nhất 40% lần đổi trạng thái việc làm bằng kéo trên bảng (đếm trên `ViecVet` theo nguồn «bảng» so với tổng lần đổi trạng thái do người làm), và ít nhất 10 việc có việc con, do ít nhất 3 người tạo khác nhau.
- Kết quả nào là CHẾT: Dưới 15% lần đổi trạng thái qua bảng, hoặc dưới 3 việc có việc con khi hết 14 ngày. Giữa hai mức là «làm tiếp» (iterate), không phải sống.
- Timebox: Đọc số sau 14 ngày dùng thật kể từ ngày gộp vào onehub.

Hàng DA2 không khai «bật khi»; ngưỡng trên là đề xuất của máy. Đường đo cần một vật mới: lần kéo trên bảng ghi `ViecVet.nguon` khác `"web"` — sẽ thành một tiêu chí của hợp đồng.

## Quyết định đi kèm Cổng Đáng

1. **Mở lại «không làm: kéo thả bảng cột».** Máy khuyên: mở **chỉ cho bảng cột của Việc**; giữ nguyên «không làm» cho bảng cột của kế hoạch onboard 30 ngày (bước onboard không phải Việc cho tới DA3). Lối khác: mở cả hai — giá là thêm một màn kéo thả cho bước onboard, ngoài câu giao của DA2.
2. **Checklist.** Bảng lượt (`docs/plan/lo-trinh-viec-du-an.md`) ghi bàn giao DA2 gồm «checklist», câu giao thì không. Máy khuyên để checklist ngoài DA2 (việc con một tầng đã phủ nhu cầu tách việc; hợp đồng giữ 8–12 tiêu chí); chốt ở Cổng Phạm vi.

## Nguồn quyết định Cổng Đáng

Chủ kho gõ ở phiên thợ DA2 (máy M5) ngày 13/10/2026: «Cổng Đáng kanban-viec: build · mở lại chỉ bảng cột của
Việc». `decided_at` là giờ phiên thợ ghi lại lời đó. Ô ngưỡng chủ kho không sửa nên giữ đề xuất của máy ở mục
«Ngưỡng chết / ngưỡng UAT»; Cổng Phạm vi trình lại để đổi nếu cần. Dòng «không làm: kéo thả bảng cột» của lộ trình
30 ngày giữ nguyên cho bảng cột của kế hoạch onboard.
