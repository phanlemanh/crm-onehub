---
schema_version: 1
slug: trang-lo-trinh-trong-crm
feature: «Trưởng phòng ban mở trang Lộ trình trong CRM, thấy việc của nhóm mình đang ở đâu mà không phải hỏi»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-08T16:34:40Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

Gốc: `_acceptance/cap-nhat-tuan-okr/` — trong phiên điều phối OKR 23–26/09, 23 trên 48 tin chủ kho gửi
là hỏi tiến độ (số do chủ kho đưa khi mở vòng này, 08/10; kho chưa có tệp đếm — xem giả định 3).

Mở từ hàng LT1 của «OKR» (`docs/plan/lo-trinh-okr.json`) bằng bộ kit (`lo-trinh.mjs --mo-o`, kit 2.24.0),
ngày 08/10/2026. **Hàng LT1 chưa có trên `onehub`:** nó nằm ở PR phanlemanh/crm-onehub#313
(`docs/lo-trinh-cua-xem-cua-gop`, đang mở). Ô này dựng trên nhánh cắt từ `origin/onehub` 942bf18f;
hàng được đọc từ nhánh PR. Gộp ô trước #313 thì trang lộ trình thấy một hồ sơ nhận mã chưa có hàng.

## Vấn đề & ai gặp

«Trưởng phòng ban mở trang Lộ trình trong CRM, thấy việc của nhóm mình đang ở đâu mà không phải hỏi»

Lộ trình của kho hiện chỉ xem được ở `LO-TRINH.html` trong git. Người không dùng git — trưởng phòng ban,
đội sản phẩm — muốn biết một việc đang ở đâu thì phải hỏi chủ kho, và chủ kho phải hỏi máy. Chủ kho
chốt 08/10: người không dùng git được **xem** lộ trình ngay trong CRM, chỉ đọc; nguồn ý định vẫn là git;
CRM không ghi ý định, không ghi trạng thái, không ký cổng; mỗi kho một trang.

**Người gặp:** trưởng phòng ban (người dùng thật của CRM từ 14/10) và chủ kho (người đang trả lời thay).

**Vật liệu nền:**

- Đặc tả khối dữ liệu lộ trình của bộ kit — `skills/acceptance/references/lo-trinh-du-lieu.md` ở nhánh
  `vong/xuat-du-lieu-lo-trinh` của kho kit (hồ sơ `xuat-du-lieu-lo-trinh`, PR
  phanlemanh/acceptance-gate-kit#285, đã ký Cổng Bằng chứng, gộp 09/10). Từ kit 2.26, `LO-TRINH.html`
  mang khối `lo-trinh-du-lieu` phiên bản 1; bản chiếu chép nguyên hàm `docDuLieu(html)`, đọc thẳng mọi
  trạng thái, và chỉ tự làm một việc: so ngày mốc với hôm nay.
- Hàng LT2 «Gửi tín hiệu trong CRM» đứng trên LT1 (`dung_tren: [LT1]`).
- Sơ đồ hai mặt của luồng: https://claude.ai/artifact/G31UmXNSCrqU6qDA6nDnwc

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Trường `nhom` của hàng nói được «việc của phòng ban tôi» | Trưởng phòng ban mở trang, lọc theo nhóm, không thấy việc nào mang tên phòng mình — trang có mà câu giao không đạt | Đọc giá trị `nhom` trên ba tệp kế hoạch | **Sai trên dữ liệu hôm nay.** `lo-trinh-okr.json` chỉ có năm giá trị `crm-chung`, `okr`, `tro-ly`, `ve-sinh`, `zalo` — đó là luồng việc của đội sản phẩm, không phải phòng ban. Khối dữ liệu của kit chỉ chở `nhom`, khoá tự thêm vào hàng không đi qua khối. Muốn lọc theo phòng ban thì phải ghi phòng ban vào `nhom` (đổi nghĩa trường đang dùng) hoặc xin kit một khoá mới — quyết ở Cổng Đáng |
| 2 | Trang trả lời được câu trưởng phòng ban hay hỏi | Họ vẫn hỏi, vì câu họ hỏi là «bao giờ tôi dùng được», không phải «hàng này nhóm trạng thái gì» | Phiên nghiệm thu: đưa ba trưởng phòng ban mỗi người một việc của phòng mình, hỏi «việc này đang ở đâu, bao giờ xong» | Chưa thử — đo ở phiên nghiệm thu |
| 3 | Nền 23/48 đếm lại được bằng cùng cách sau bốn tuần | Ngưỡng «dưới một nửa nền» không so được: không biết lần đầu tin nào được tính là hỏi tiến độ | Ghi cách đếm (phiên nào, câu nào tính) vào hồ sơ trước khi giao | Chưa có tệp đếm trong kho; số do chủ kho đưa 08/10 |
| 4 | Tin hỏi tiến độ của chủ kho giảm khi trưởng phòng ban có trang | Không giảm, vì tin trong phiên điều phối là chủ kho hỏi máy về việc đang chạy trong phiên — thứ trang lộ trình không hiện | Đọc lại mẫu tin của phiên 23–26/09: tin hỏi «lộ trình đến đâu» hay hỏi «phiên/vòng này đang làm gì» | Chưa thử — rẻ, làm được ngay ở S1 |
| 5 | Bản CRM đang chạy đọc được `LO-TRINH.html` của nhánh chính | Trang hiện bản cũ, hoặc phải giữ khoá GitHub trong ứng dụng | Đọc tệp từ chính cây đã dựng của bản đang chạy (ứng dụng dựng từ nhánh chính) | Hướng làm, chốt ở S1 |
| 6 | crm nhận kit ≥ 2.26 (có khối dữ liệu lộ trình) trước khi vòng chạy | Trang không có dữ liệu để đọc (trang cũ không mang khối) | Theo dõi phát hành kit | #285 gộp 09/10 và phát hành ở mốc 2.26.0 (chủ kho gọi «cắt 2.26» 09/10); crm không cài bản kit chưa phát hành |

## Ngưỡng chết / ngưỡng UAT

> Bản máy dựng từ hàng (`bat_khi`) được giữ nguyên ở dưới làm sử liệu. Bản sửa ngay đây dời trọng tâm
> sang người dùng trong câu giao (trưởng phòng ban), vì giả định 4: số tin chủ kho hỏi máy có thể không
> đổi dù trang làm đúng việc. Vế «trang khớp từng hàng với LO-TRINH.html» là tiêu chí làm đúng, chuyển
> xuống «Thước đo → ứng viên criterion».

- Câu hỏi phép đo trả lời: trưởng phòng ban có tự biết việc của phòng mình đang ở đâu, không phải hỏi ai, bốn tuần sau khi trang lên production?
- Kết quả nào là SỐNG: ở phiên nghiệm thu, ít nhất 3 trưởng phòng ban, mỗi người được hỏi về một việc của phòng mình, trả lời đúng trạng thái và mốc từ trang trong vòng một phút mà không hỏi lại; và tỷ lệ tin hỏi tiến độ của chủ kho, đếm cùng cách với nền 23/48, dưới một nửa nền (dưới 24%)
- Kết quả nào là CHẾT: dưới 2 trưởng phòng ban trả lời đúng từ trang; hoặc trang hiện một trạng thái khác `LO-TRINH.html` cùng lượt vẽ mà không ai biết
- Timebox: bốn tuần kể từ ngày trang lên production; ngày chưa có vì vòng chưa xếp đợt

Bản máy dựng từ hàng, giữ làm sử liệu:

- SỐNG (hàng LT1, `bat_khi`): Bốn tuần sau khi giao, tin hỏi tiến độ của chủ kho còn dưới một nửa nền 23/48; trang khớp từng hàng với LO-TRINH.html cùng lượt vẽ.

## Kết quả prototype

Chưa dựng. Vòng chạm màn hình: bản bấm được làm ở nghi thức thiết kế cuối S1, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khuôn khối `lo-trinh-du-lieu` phiên bản 1 và hàm `docDuLieu(html)` | kho kit, `skills/acceptance/references/lo-trinh-du-lieu.md` và `scripts/lo-trinh.mjs` (nhánh `vong/xuat-du-lieu-lo-trinh`, d86a2f5e) | triết-lý/logic | có — chép nguyên hàm, không sửa | |
| Luật so ngày mốc (`mocQuaConViec`, `viecTre`) | cùng tệp đặc tả, khối `LO-TRINH-DU-LIEU-LUAT-NGAY` | triết-lý/logic | có — chép nguyên | |
| Bố cục và màu của `LO-TRINH.html` | trang do kit vẽ ở gốc kho | ngôn-ngữ-thiết-kế/hình-thái | không — trang CRM dựng bằng thành phần `packages/ui` theo `docs/design.md` | |

## Cổng 0

- **decision = build** Căn cứ: chủ kho ký «build» 2026-10-08T16:34:40Z trên bản trình gồm ngưỡng đo ở trưởng phòng ban (thay ngưỡng của hàng) và «nhóm» hiểu là luồng việc như tệp kế hoạch đang ghi; lọc theo phòng ban thật để sau, cần kit thêm một trường riêng (giả định 1). Vòng chưa chạy: chờ chủ kho xếp đợt, crm nhận kit 2.27, và #313 gộp.
- **disposition = —** Căn cứ: không có bản mẫu dựng trước Cổng Đáng.
- **Ngưỡng UAT chốt cùng lúc ký:** như mục «Ngưỡng chết / ngưỡng UAT» ở trên, đã gỡ tiền tố đề xuất.

## Thước đo thành công → ứng viên criterion

- Mọi việc trên trang mang đúng chữ trạng thái, nhóm trạng thái và hồ sơ như khối dữ liệu của `LO-TRINH.html` cùng lượt vẽ (so từng hàng, máy đo).
- Trang không tự suy trạng thái: không có mã nào đọc hồ sơ `_acceptance/` hay tệp kế hoạch; chỉ đọc khối dữ liệu qua hàm `docDuLieu` chép nguyên.
- Mốc đã qua mà còn việc chưa giao và việc trễ khớp `LO-TRINH.html` ở cùng ngày, kể cả đúng ngày mốc (chưa qua).
- Lọc theo nhóm: chọn một nhóm thì chỉ còn việc của nhóm đó, và số việc từng nhóm trạng thái cộng lại đúng.
- Năm ca đọc khoan dung (không có khối, khối hỏng, khuôn lạ, phiên bản mới hơn, thiếu khoá) đều hiện một câu nói rõ, trang không vỡ.

## Out of scope từ khám phá

- Ghi gì từ CRM vào lộ trình — ý định, trạng thái, chữ ký cổng. Nguồn ý định là git (chủ kho chốt 08/10).
- Gửi tín hiệu từ CRM — là hàng LT2, đứng trên LT1.
- Gộp lộ trình của nhiều kho vào một trang — mỗi kho một trang (chủ kho chốt 08/10).
- Tự tính trạng thái từ hồ sơ khi trang chưa mang khối dữ liệu — trang báo «vẽ lại bằng kit từ 2.26», không dựng nguồn sự thật thứ hai.
- Chen vào trước 14/10 hay cài bản kit chưa phát hành vào crm.
