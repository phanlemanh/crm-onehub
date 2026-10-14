---
schema_version: 1
slug: moi-tin-hieu-cho-quan-tri
feature: Quản trị mở thẻ Tất cả của trang Tín hiệu và thấy ai đã gửi, phòng ban nào, từ màn nào, đang ở đâu, cùng ba con số của ngưỡng sống
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

> Mở 14/10/2026 từ hàng TH4 của «OKR» (`docs/plan/lo-trinh-okr.json`) bằng `lo-trinh.mjs --mo-o` (kit
> v2.28.0 giải nén theo tag), nhánh `feat/moi-tin-hieu-cho-quan-tri` cắt từ `origin/onehub` `762acca38`
> (PR lộ trình #397). Hàng đứng trên LT2 (đã gộp onehub `b1b08382`, lên production 13/10) và là gốc của TH5
> (gỡ tín hiệu rác). Đợt «vòng tín hiệu tự chạy», bản phạm vi `docs/plan/pham-vi-vong-tin-hieu-1410.md`, mã
> Q1 · Q2 · Q3.

## Vấn đề & ai gặp

Mở từ hàng TH4 của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Quản trị mở thẻ Tất cả của trang Tín hiệu và thấy ai đã gửi, phòng ban nào, từ màn nào, đang ở đâu, cùng ba con số của ngưỡng sống»

Vì sao: Hôm nay mỗi người chỉ thấy tín hiệu của mình; quản trị chỉ có vài dòng tổng kết trong terminal sau lệnh kéo về, không thấy tên ai. Cần thấy để hỏi lại người gửi và để đo ngưỡng sống của LT2 trên màn hình.

**Người gặp:**

- **Quản trị CRM** (vai chủ và quản trị của không gian làm việc — đúng nhóm được chạy lệnh kéo về) — muốn
  biết ai gửi gì để hỏi lại, phòng ban nào đang kể, tín hiệu nào nằm lâu chưa có chỗ.
- **Chủ kho** — ở ngày đo 30 ngày của LT2 (12/11) phải đọc ba con số ngưỡng sống; hôm nay chỉ đọc được bằng
  lệnh kéo về trên máy có khoá quyền chủ.
- **Người gửi** — từ vòng này tên họ hiện cho quản trị; luật riêng tư chủ kho chốt 14/10 buộc hộp gửi báo
  trước điều đó.

**Đo 14/10 trên `762acca38`:**

| Phép đo | Kết quả |
|---|---|
| Ai xem được tín hiệu của người khác | **Không ai.** Trang «Tín hiệu đã gửi» chỉ có một danh sách, lọc theo người xem ở API (`cuaToi`); không có thẻ con, không phân vai |
| Dữ liệu cần cho thẻ Tất cả có sẵn chưa | **Có đủ.** Mỗi tín hiệu đã cất người gửi, phòng ban chính lúc gửi, màn, giờ gửi, giờ kéo về. Không cần thêm cột — vòng không chạm cơ sở dữ liệu |
| «Đang ở đâu» | Đã có: trang đọc câu trạng thái kit viết cho từng tín hiệu từ khối dữ liệu của `LO-TRINH.html` trong bản đã dựng; vắng thì «Chờ lấy về» / «Chờ gom». Thẻ Tất cả dùng lại đúng đường này |
| Ba con số | Chỉ có ở dòng tổng kết của lệnh kéo về: «trong 30 ngày: N tín hiệu từ M phòng ban» và «gửi quá 7 ngày: … · chưa có chỗ sau gom: K». Hai hằng 30 và 7 đã nằm chung một chỗ cấu hình |
| Quyền | Lệnh kéo về đã kiểm «chủ hoặc quản trị» bằng một hàm dùng chung; thẻ Tất cả theo đúng hàm đó |
| Hộp gửi có báo quản trị thấy tên không | **Không** — chưa có dòng «Quản trị CRM thấy tên bạn cùng tín hiệu này» |
| Tín hiệu trên production | 5 (crm-1 đến crm-5), đều «Chờ lấy về» (theo hàng TH1) |

**Chỗ lệch có thể có giữa trang và lệnh** (để ngưỡng «số khớp» đo được): lệnh đếm trên các tệp đã kéo về,
trang đếm trên cơ sở dữ liệu — gồm cả tín hiệu chưa kéo. Hai bên khớp khi đọc ngay sau một lượt kéo; trang sẽ
nói rõ con số gồm cả tín hiệu chưa lấy về. Vế «chưa có chỗ sau gom» hai bên cùng đọc khối trạng thái của
`LO-TRINH.html` ở cùng một commit.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Quản trị cần thấy tên để hỏi lại người gửi | Thẻ thành bảng số, không ai mở | Chủ kho đã chốt luật riêng tư 14/10 chính vì cần hỏi lại | Đã chốt |
| 2 | Báo trước bằng một dòng trong hộp gửi là đủ để người gửi không bị bất ngờ | Người gửi thấy bị theo dõi, thôi gửi | Đếm tín hiệu 30 ngày (ngưỡng LT2) trước và sau khi dòng báo lên | Đo cùng ngưỡng LT2 |
| 3 | Ba con số trên trang đếm đúng như lệnh kéo về | Chủ kho vẫn phải chạy lệnh, hoặc tin số sai | Ca đo hai chiều: cùng một bộ tín hiệu mẫu qua hàm đếm của trang và hàm đếm của lệnh ra cùng ba số | Chốt ở S1 — một hàm đếm dùng chung |
| 4 | Đếm phòng ban theo phòng ban chính lúc gửi (đúng như LT2) | Hai cách đếm, hai con số | Dùng lại cột phòng ban đã cất | Theo LT2 |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] ở ngày đo 30 ngày của LT2, chủ kho có đọc ba con số ngưỡng sống trên trang thay vì chạy lệnh, và số có khớp dòng tổng kết của lệnh kéo về không?
- Kết quả nào là SỐNG: [đề xuất] ngày 12/11/2026 (30 ngày sau khi LT2 lên production 13/10), chủ kho đọc ba con số ở thẻ Tất cả mà không chạy lệnh để biết; chạy lệnh kéo về ngay sau đó, ba con số của dòng tổng kết bằng đúng ba con số trên trang.
- Kết quả nào là CHẾT: [đề xuất] tới 12/11 chủ kho vẫn phải chạy lệnh để biết ba con số, hoặc có một con số trên trang khác dòng tổng kết của lệnh đọc cùng lúc. Lệch → sửa hàm đếm, không phải lặp tính năng.
- Timebox: tới ngày đo 30 ngày của LT2, 12/11/2026. Vòng phải lên production trước ngày đó.

## Kết quả prototype

Chưa dựng. Vòng chạm màn hình: bản bấm được làm ở nghi thức thiết kế cuối S1, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Câu trạng thái của từng tín hiệu | kit `scripts/tin-hieu.mjs` (`--duong`), khoá `tin_hieu` của khối dữ liệu lộ trình — đã đọc ở LT2 | triết-lý/logic | có — thẻ Tất cả đọc đúng câu kit viết, không tự suy | |
| Ba con số và hai hằng 30/7 | dòng tổng kết của lệnh kéo về (LT2) | triết-lý/logic | có — một hàm đếm cho cả trang và lệnh | |
| Bảng, lọc, thẻ con | `packages/ui` (`DataTable`, `Tabs`, `StatGroup`) theo `docs/design.md` | ngôn-ngữ-thiết-kế | có | |

## Cổng 0

Chờ chủ kho.

**Máy khuyến nghị:** `build`, ngưỡng như đề xuất, một vòng khoảng 9 tiêu chí (Q1 · Q2 · Q3), hạng **T2**:
vòng chỉ đọc dữ liệu đã có, không thêm cột, không chạm đường T3. Gỡ tín hiệu rác (Q4) là TH5, không nằm ở
đây.

## Thước đo thành công → ứng viên criterion

Xem:

1. Trang Tín hiệu có hai thẻ con «Của tôi · Tất cả»; thẻ Tất cả chỉ hiện với chủ và quản trị — người khác
   không thấy thẻ và API từ chối.
2. Mỗi tín hiệu ở thẻ Tất cả hiện người gửi, phòng ban, màn, giờ gửi, trạng thái (câu kit viết).
3. Lọc theo phòng ban, trạng thái, người gửi; giá trị lọc nằm trên đường dẫn.

Ba con số:

4. Ba ô số đầu thẻ Tất cả: tín hiệu 30 ngày qua · số phòng ban có tín hiệu · tín hiệu gửi quá 7 ngày chưa
   có chỗ.
5. Trang và lệnh kéo về đếm bằng một hàm — cùng bộ tín hiệu ra cùng ba số.

Riêng tư:

6. Hộp gửi báo trước «Quản trị CRM thấy tên bạn cùng tín hiệu này».
7. Người không phải quản trị vẫn chỉ thấy tín hiệu của mình; tệp tín hiệu trong git vẫn không mang danh tính.

Chịu lỗi:

8. Người gửi đã rời không gian làm việc, phòng ban đã lưu trữ, bản vẽ thiếu trạng thái → dòng vẫn hiện, nói
   rõ thiếu gì.
9. Chờ tải, lỗi tải, rỗng theo nếp màn của `docs/design.md`.

## Out of scope từ khám phá

- Gỡ, lưu trữ tín hiệu rác — TH5 (T3, thêm trường dữ liệu).
- Tự kéo về theo lịch, khoá chỉ kéo — TH1.
- Thông báo «có n tín hiệu mới» cho quản trị — N5, thuộc đợt hộp thông báo.
- Sửa các lỗi giao diện U1–U9 của danh sách «Của tôi» — hàng riêng của đợt; vòng này chỉ không làm chúng tệ
  hơn.
- Trả lời người gửi ngay trong CRM — chưa có trong bản phạm vi.
