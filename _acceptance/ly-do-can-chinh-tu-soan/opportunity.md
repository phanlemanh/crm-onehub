---
schema_version: 1
slug: ly-do-can-chinh-tu-soan
feature: "Lý do Kara viết cho dòng căn chỉnh ở Soạn OKR đi theo căn chỉnh vào OKR thật"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08T16:40:19Z
prototype:
  base_commit: 57dd87bf1
  disposition: archive
---

## Vấn đề & ai gặp

Người gặp là trưởng phòng và nhân viên soạn OKR cùng Kara, rồi lãnh đạo đọc cây căn chỉnh. Ở Soạn OKR, Kara viết một
câu «vì sao» cho mỗi dòng căn chỉnh nháp (`viSao`, `packages/validation/src/okr-tro-ly.ts`). Khi bấm «Đưa vào OKR»,
`apps/api/src/okr/soan-dua-vao.ts` chỉ chép hai id sang `OkrAlignment`. Câu lý do ở lại trong `okrDeXuat`, không màn
nào đọc lại. Bảng `OkrAlignment` không có cột nào để giữ nó.

Nguồn: bản vẽ trước/sau của phiên Logic Tree 08/10, mục 05
(`.acceptance-runs/dieu-phoi-sau-14-10/tai-lieu/ly-do-can-chinh/truoc-sau-ly-do-can-chinh.html`) và sơ đồ chuỗi lý do
(`chuoi-ly-do-okr.html`, cạnh căn chỉnh «OkrAlignment chỉ giữ hai id»). Đây là hàng đầu của dãy L1–L4: L2 (đường lý do
trên sheet), L3 (cây có lý do và lọc), L4 (gắn tay và đề xuất Kara có lý do) đều đọc cột mà hàng này thêm.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Câu `viSao` ở bản nháp là lý do người dùng đã đọc và nhận khi đưa vào | Chép sang là gán cho người một câu họ chưa duyệt | Đọc luồng Soạn: dòng căn chỉnh hiện nguyên câu `viSao` trên thẻ nháp trước nút «Đưa vào OKR» | Đã thử 08/10: `soan/the-nhap.tsx` hiện câu đó |
| 2 | `okrDeXuat.taoRaId` trỏ đúng căn chỉnh đã tạo, nên điền lại được cho căn chỉnh cũ | Điền lại gắn nhầm lý do | Đọc `ghiTaoRa` trong `soan-dua-vao.ts` | Đã thử 08/10: ghi `taoRaId = g.id` ngay sau khi tạo |
| 3 | Thêm cột nullable không làm hỏng màn nào đang đọc căn chỉnh | Màn cũ vỡ khi khuôn trả có trường mới | `check-types` sau khi thêm trường vào `noiGopOutput` | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi lên production, căn chỉnh đưa vào từ Soạn OKR có giữ lý do Kara đã viết không?
- Kết quả nào là SỐNG: trong hai tuần đầu, câu SQL `rang/do-nguong.sql` (căn chỉnh nối `okrDeXuat` qua `taoRaId` có `lyDo` rỗng trong khi `viSao` sau khi cắt khoảng trắng khác rỗng) đếm 0 trên production — gồm cả căn chỉnh mới lẫn căn chỉnh cũ đã điền lại.
- Kết quả nào là CHẾT: câu đó đếm từ 1 trở lên.
- Timebox: hai tuần sau khi lên production (tới 22/10/2026).

## Kết quả prototype

Không dựng prototype: hàng này không có màn mới. Bản vẽ của phiên Logic Tree chỉ để thống nhất ý; màn hiện lý do thuộc L2/L3.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Bản vẽ trước/sau lý do căn chỉnh | `.acceptance-runs/dieu-phoi-sau-14-10/tai-lieu/ly-do-can-chinh/truoc-sau-ly-do-can-chinh.html` | triết-lý/logic | có (luồng dữ liệu, ba mức tin) | — |
| Sơ đồ chuỗi lý do OKR | `.acceptance-runs/dieu-phoi-sau-14-10/tai-lieu/ly-do-can-chinh/chuoi-ly-do-okr.html` | triết-lý/logic | có (lý do sống trên cạnh căn chỉnh) | — |

## Quyết định của anh

- 08/10/2026 18:55 (LUAT.md của đợt): lý do căn chỉnh KHÔNG bắt buộc. Cột lý do nullable, không AC nào chặn lưu một căn
  chỉnh không lý do. Thay cho bắt buộc là ba lối nhắc: Kara soạn nháp lý do; cây căn chỉnh lộ nhánh chưa có lý do; bộ
  lọc «Chưa có lý do». Căn chỉnh không lý do hiện «chưa có lý do»; có lý do mà không có căn cứ số thì là «Đặt cược».

## Cổng 0

- **decision = build.** Căn cứ: Phan Le Manh gõ «Cổng Đáng L1–L4: build» trong phiên P5 lúc 2026-10-08T16:40:19Z.
- **Ngưỡng UAT chốt cùng lúc ký:** bốn dòng ở mục «Ngưỡng chết / ngưỡng UAT», đã gỡ nhãn đề xuất.
- **disposition = archive.** Căn cứ: không có prototype.

## Thước đo thành công → ứng viên criterion

- Đưa vào OKR chép lý do sang căn chỉnh thật → AC-1, AC-2.
- Căn chỉnh không lý do vẫn lưu được → AC-3.
- Lý do và mức tin đọc được ở khuôn trả của mục tiêu → AC-4.
- Căn chỉnh cũ từ Soạn được điền lại → AC-5.

## Out of scope từ khám phá

- Hiện lý do trên sheet mục tiêu (L2), trên cây và bộ lọc «Chưa có lý do» (L3).
- Gắn tay có ô lý do, đề xuất căn chỉnh của Kara kèm lý do, Kara soạn căn cứ (L4).
