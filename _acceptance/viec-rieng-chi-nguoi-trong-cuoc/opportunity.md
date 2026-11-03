---
schema_version: 1
slug: viec-rieng-chi-nguoi-trong-cuoc
feature: Việc riêng chỉ người trong cuộc thấy — cả trên Gantt và mọi màn dự án
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: manh
decided_at: 2026-10-19T09:10:00Z
prototype:
  base_commit: 0d9ef3183
  disposition: archive
---

Gốc: _acceptance/du-an-gantt/

Hàng lộ trình: DA11 (Mac Studio đặt mã ở #375, 09:03Z 19/10; hàng chưa vào `docs/plan/lo-trinh-*.json` — ngoại lệ chủ kho gọi tên, không chờ PR lộ trình).

## Vấn đề & ai gặp

Lượt tự lái trước Cổng Bằng chứng của DA4 (18/10/2026, `_acceptance/du-an-gantt/evidence/tu-lai/PHAN-TICH.md`, mục T1, ảnh 09 và 19) thấy: khung việc của một việc trong dự án ghi «Việc riêng — chỉ người trong cuộc thấy», trong khi thành viên không dính tới việc đó vẫn thấy nó trên Gantt của dự án. DA4 đã gộp và lên production, nên mọi thành viên đang dùng Việc–Dự án ở production gặp lời hứa sai này. Người tạo việc tin việc của mình kín, trong khi cả đội đọc được tiêu đề, ngày và trạng thái của nó.

Nguyên nhân đọc từ mã trên onehub `0d9ef3183`: khung việc ghi chữ đó cho mọi việc không gắn bản ghi (`apps/app/components/viec/khung-viec.tsx`), còn luật thấy việc (`dieuKienXemViec`, `packages/db/src/viec.ts`) cho ai đọc được phạm vi đối tác thấy mọi việc có `duAnId`, đúng quyết định Hỏi-4 của DA4 (`d-20261016T082504Z-17`).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Chủ kho muốn chữ trên khung việc và luật thấy việc nói cùng một điều ở mọi màn | Sửa một phía mà phía kia vẫn hứa khác | Câu hỏi nghĩa A/B gửi chủ kho qua Điều phối M5 (19/10) | Chờ chủ kho |
| 2 | Không màn dự án nào (Gantt, danh sách, Bảng, tổng «x/y việc xong», khoảng ngày, mốc) đọc việc ngoài luật thấy | Lộ tiêu đề, số lượng hay ngày của việc riêng — cùng họ lỗi DA2b | Đọc mọi đường đọc việc của dự án ở S1, đo bằng bài kiểm ở S4 | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người không trong cuộc có còn thấy được việc mà khung việc hứa là chỉ người trong cuộc thấy không, ở bất kỳ màn nào.
- Kết quả nào là SỐNG: ở phiên nghiệm thu, một thành viên không trong cuộc đi hết Của tôi · Tất cả dự án · Danh sách · Bảng · Gantt của một dự án, và mọi việc khung ghi «chỉ người trong cuộc thấy» không hiện tiêu đề, số đếm hay ngày với người đó; mọi việc người đó thấy thì khung nói đúng ai thấy nó.
- Kết quả nào là CHẾT: còn một màn hay một con số (tiêu đề, số việc, khoảng ngày, mốc chờ) cho người không trong cuộc biết về một việc mà khung hứa là riêng.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)

## Kết quả prototype

Không dựng prototype: sửa gấp trên mã đã chạy.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có vật liệu ngoài kho | — | — | — | — |

## Cổng 0

- **decision = build.** Căn cứ: chủ kho, 19/10 ~09:10Z, phiên Mac Studio (chuyển ở crm #375 09:01Z): «Đồng ý theo khuyến nghị — T1: sửa gấp».
- **disposition = archive.** Căn cứ: không có prototype.
- **Nghĩa của việc sửa:** chủ kho chọn ở phiên DA11, 19/10/2026 ~09:45Z, nguyên văn «A · đếm: có». A là: việc trong dự án là việc chung, khung việc nói đúng ai thấy việc đó; việc riêng là việc không gắn bản ghi và không thuộc dự án; lịch sử việc che tiêu đề việc mà người xem không thấy; luật thấy việc giữ nguyên. Đếm là: máy soạn lệnh đếm chỉ đọc để chủ kho tự chạy trên production.
- **Ngưỡng UAT chốt cùng lúc ký:** như mục Ngưỡng ở trên (các dòng `[đề xuất]` chờ chủ kho gỡ tiền tố).

**Chính sách đợt** (chủ kho): «chạm trần 3 lượt → thu phạm vi · đỏ sẵn trên nền → tách vòng vệ sinh · giữ cỡ khi tiêu chí là rào chắn».

**Chữ ký các cổng sau** (Phạm vi, Bằng chứng) là của chủ kho «manh» qua lệnh (ADR 0002); máy không tự ký, «duyệt» trong chat không ghi cổng.

## Thước đo thành công → ứng viên criterion

- Mỗi màn đọc việc của dự án có một bài kiểm hai chiều: người trong cuộc thấy, người không trong cuộc không thấy (hay thấy đúng như khung nói).
- Chữ trên khung việc rút từ cùng một luật với luật thấy việc, không phải từ điều kiện riêng của màn.

## Out of scope từ khám phá

- Dự án có danh sách thành viên (chỉ thành viên thấy việc trong dự án) — cái giá Hỏi-4 của DA4 đã ghi; một lượt riêng nếu chủ kho muốn.
- Vá DA4 Ngoài-3, Ngoài-8, Ngoài-9 — hàng DA12, đi sau DA11.
