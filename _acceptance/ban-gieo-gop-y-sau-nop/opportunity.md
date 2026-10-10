---
schema_version: 1
slug: ban-gieo-gop-y-sau-nop
feature: "Bàn gieo góp ý dùng chung chạy lại được sau khi công cụ nộp của Trợ lý OKR tự đóng việc, để ba bàn đo màn OKR đo được lại"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-09T14:59:07Z
prototype:
  base_commit: a9e8bc75a
  disposition: archive
---

## Vấn đề & ai gặp

Người gặp là người ký Cổng Bằng chứng của ba hồ sơ OKR đã ký, và mọi vòng sau chạm cùng màn: bàn đo màn của họ
không chạy được nữa, nên các ô đo màn (`ui-check`) không đo lại được.

- Bàn gieo dùng chung `_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs` (viết 03/10) nộp góp ý mẫu qua đúng công cụ
  của agent (`nopDeXuatVao`) rồi gọi `completeTask(...)` và ném lỗi nếu việc đã đóng.
- Từ commit `871c9b17` (07/10, «tool nop cua Tro ly OKR tu dong viec»), `nopDeXuatVao` tự đóng việc với kết cục
  `da-nop` ngay sau khi ghi. `completeTask` gọi sau đó luôn trả `null`, nên `gieoGopY` luôn ném
  «viec … da dong truoc khi nop xong».
- Ba bàn đo gọi `gieoGopY`, nên cả ba dừng ở bước chuẩn bị với `KHONG DO DUOC`:
  - `gop-y-dung-cho` — `rang/man-gop-y.mjs`, khoá `gy_man_that` (E2 và các ô `ui-check` khác).
  - `khung-okr-truoc-r1` — `rang/man-khung.mjs` phần `chip`, khoá `r1a_man_chip` (các phần khác không gieo).
  - `okr-to-chuc-va` — `rang/man-okr.mjs`, khoá `r1d_man_okr`.
- Không lưới nào bắt được: eval `ui-check` không chạy trong làn ghim lại, và pre-merge chỉ đọc bằng chứng đã ký.
- Bằng chứng: lượt đo màn đầu của K3 (`kara-gop-y-luot-2`, 09/10) dừng ở đúng câu đó khi nhập `gieoGopY`. K3 tránh
  bằng một bàn gieo riêng (`_acceptance/kara-gop-y-luot-2/rang/gieo.mjs`), không sửa tệp chung. Ghi ở sổ quyết định
  của K3 và Treo-3 của Cổng 2 K3.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Chỉ bước kiểm `completeTask` làm `gieoGopY` hỏng; dữ liệu `SAN` và `datLaiGopY` vẫn đúng | Sửa xong vẫn dừng ở bước gieo khác | Bàn gieo của K3 dùng đúng `SAN` + `datLaiGopY` và đo xong 45/45 ngày 09/10 | Có |
| 2 | Kiểm «nộp xong» bằng `ketQua === "da-ghi"` cộng `finishedAt`/`outcome` của việc là đủ chặt | Gieo «xanh» khi agent đóng việc bằng lỗi | Đọc `nopDeXuatVao` (`apps/agent/agent/lib/okr/nop-de-xuat.ts`) | Có — mọi lối khác trả `ketQua` khác |
| 3 | Ba bàn đo chỉ vướng bàn gieo, phần đo màn còn khớp mã hiện tại | Sống lại ở bước gieo nhưng đỏ ở bước đo | Chạy lại ba bàn đo sau khi sửa | Chưa biết — chính là điều vòng này đo |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: ba bàn đo màn có chạy lại được tới bước đo không, và đo ra gì trên mã hôm nay.
- Kết quả nào là SỐNG: `gieoGopY` chạy hết trong phiên đo; cả ba bàn đo qua bước chuẩn bị. Bàn đo nào đỏ ở bước đo
  thì đó là phát hiện mới, đem ra Cổng 2 làm mục ngoài hợp đồng, không vá trong vòng này.
- Kết quả nào là CHẾT: sửa xong mà một bàn đo vẫn dừng ở bước gieo.
- Timebox: một lượt S4 cục bộ; không chạm mã sản phẩm.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Bàn gieo của K3 | `_acceptance/kara-gop-y-luot-2/rang/gieo.mjs` | vật đo trong kho | Chép cách kiểm nộp xong, không nhập tệp | — |

## Cổng 0

- **decision = build.** Căn cứ: anh chọn «build» trong phiên P1 ngày 2026-10-09 (đơn `can-nguoi` P1-47). Ba ngả đã trình, máy khuyên `build`:
  - `build` — sửa đúng hàm `nop()` trong `san-gop-y.mjs` (ranh giới hàng K3b), chạy lại ba bàn đo, đem kết quả ra
    Cổng 2. Rẻ: một hàm, không chạm mã sản phẩm.
  - `park` — ghi «bàn đo màn không chạy lại được từ 07/10» vào Known limits của ba hồ sơ, để khi có vòng chạm màn
    đó mới sửa.
  - `kill` — bỏ hẳn; ba ô `ui-check` coi như chỉ còn bằng chứng đã ký trước 07/10.
- **disposition = archive.** Căn cứ: không có prototype.

## Thước đo thành công → ứng viên criterion

- `gieoGopY` gieo đủ ba góp ý cho A và lượt rỗng cho B trên một phiên đo mới, không ném → AC-1.
- Bàn gieo từ chối gieo «xanh» khi việc không đóng bằng `da-nop` (chiều đỏ có tên) → AC-2.
- Ba bàn đo qua bước chuẩn bị; mỗi bàn đo ghi kết quả đo (đúng hay đỏ) vào hồ sơ này → AC-3.
- Chỉ `san-gop-y.mjs` đổi ngoài thư mục hồ sơ và `config.yaml` → AC-4 (ranh giới).

## Out of scope từ khám phá

- Sửa mã sản phẩm hay nội dung đo của ba bàn đo khi chúng đỏ ở bước đo — mỗi chỗ đỏ là một mục cho người quyết.
- Chuyển K3 về dùng bàn gieo chung (K3 đang có PR riêng).
- Đưa eval `ui-check` vào làn ghim lại — việc của bộ kit nghiệm thu.
