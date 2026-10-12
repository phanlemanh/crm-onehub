---
schema_version: 1
slug: ngan-ho-so-trong-lo-trinh
feature: "«Tôi bấm một việc đã giao trong trang Lộ trình và đọc trong một phút: vì sao làm, đã lên chưa, sẽ đo gì, còn thiếu gì, ai quyết»"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT1b
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

Gốc: `_acceptance/trang-lo-trinh-trong-crm/` (hàng LT1, đã lên production 10/10, crm-onehub#329 và #362).
Mục «Out of scope» của hợp đồng LT1 ghi «hiện hồ sơ nghiệm thu của việc» là không làm — vòng này làm
đúng phần đó, trong ngăn việc LT1 đã dựng.

Mở từ hàng LT1b của «OKR» (`docs/plan/lo-trinh-okr.json`) bằng bộ kit (`lo-trinh.mjs --mo-o`, kit 2.26.0),
ngày 12/10/2026, trên nhánh cắt từ `origin/onehub` 27d47de04. Chủ kho đồng ý hàng 10/10 và bỏ vế «chờ số
đo bốn tuần của LT1» ngày 12/10 (nhánh tài liệu `docs/lo-trinh-lt-bo-cho` ghi lại; hàng trên `onehub`
còn chữ cũ cho tới khi nhánh đó gộp).

## Vấn đề & ai gặp

«Tôi bấm một việc đã giao trong trang Lộ trình và đọc trong một phút: vì sao làm, đã lên chưa, sẽ đo gì,
còn thiếu gì, ai quyết»

Trang Lộ trình (LT1) đã cho người không dùng git biết một việc **đang ở đâu**: trạng thái, mốc, nhóm,
điều kiện bật và lý do lấy từ tệp kế hoạch. Nhưng năm câu kế tiếp người ta hỏi về một việc đã giao —
vì sao làm, đã lên production chưa, sẽ đo gì và khi nào, còn thiếu gì, ai đã quyết — vẫn chỉ trả lời được
bằng cách đọc hồ sơ nghiệm thu trong git, hoặc hỏi chủ kho.

**Người gặp:** chủ kho (đang trả lời thay), trưởng phòng ban (người dùng thật của CRM từ 14/10), đội sản
phẩm.

**Vật liệu nền:**

- Hàng X2 của lộ trình kit (kit#307, gộp nhánh chính kit 11/10, sẽ phát hành ở mốc 2.27.0): khối dữ liệu
  `lo-trinh-du-lieu` bản 2 thêm `hang.tom_tat` — dải tóm tắt hồ sơ của việc, hai tầng: **mọi người** chín
  ô (đã giao gì · vì sao · trạng thái · ngày · production · sẽ đo gì · kết quả · chưa làm · ai quyết) và
  **chủ kho** bảy con số (tiêu chí · phép đo · lượt chấm · token · quyết định máy · quyết định người · mã
  commit). Bộ kit vẽ dải bằng cùng hàm vẽ trang hồ sơ, nên CRM chỉ đọc, không tự tính.
- crm hôm nay cài kit 2.26 (khối bản 1, không có `tom_tat`).
- Dữ liệu thật để làm và thử: chạy bộ vẽ của kit nhánh chính (`7f65e5a0`, 12/10) trên bản sao cây crm
  (`27d47de04`) → `LO-TRINH.html` có khối bản 2. Trên bản đó: 117 việc, 86 việc đã giao, **81 việc có dải
  tóm tắt**; 5 việc đã giao không có hồ sơ nên không có dải.

## Giả định chốt sinh tử

Mọi số dưới đây đếm trên bản vẽ thật nói ở trên (81 việc có dải).

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Ô «production» của dải trả lời được «đã lên chưa» | Người đọc thấy «chưa ghi quan sát production» và hiểu là việc chưa lên — câu thứ hai của câu giao trả lời sai | Đếm ô production trên bản vẽ thật | **Sai trên dữ liệu hôm nay: 81/81 việc ghi «chưa ghi quan sát production»**, kể cả LT1 đã lên production 10/10. Bộ kit chỉ đọc dòng quan sát người ghi; ở crm gộp `onehub` là lên production nhưng kit không biết điều đó. Sửa ở kit (chip riêng), không vá ở CRM — CRM hiện nguyên chữ. Trong lúc chờ, ô «trạng thái» («Đã giao — chờ phiên nghiệm thu») vẫn hiện cạnh đó |
| 2 | Ô «chưa làm» đếm đúng phần còn thiếu | Người đọc tin việc không còn giới hạn nào | So ô chưa làm của LT1 với hợp đồng LT1 | **Sai với LT1:** dải ghi «9 mục ngoài hợp đồng · 0 giới hạn đã biết»; thật ra 9 là số mục Out of scope, còn 13 giới hạn chủ kho chọn ở Cổng Bằng chứng nằm trong Notes của hợp đồng — kit đọc mục Known limits của báo cáo (rỗng). Sửa ở kit, cùng chip với giả định 1 |
| 3 | Đọc được trong một phút | Ngăn dài hơn một phút đọc, người bỏ ngang | Đếm chữ tầng mọi người | Trung vị 178 chữ, dài nhất 368; 31/81 ô «vì sao» quá 400 ký tự, 11/81 ô «vì sao» cụt ở dấu hai chấm (ví dụ E7: «Soi mã ở origin/onehub 0426cc9d0, ba chỗ hở:»). Ngăn xếp năm câu của câu giao lên đầu và thu gọn đoạn dài — chốt ở S1; chữ cụt là lỗi kit, đi cùng chip |
| 4 | «Vai chủ kho» trong CRM là vai `owner` của không gian làm việc | Trưởng phòng ban mang vai quản trị thấy số token, lượt chấm — hoặc chủ kho không thấy | Đọc bảng vai của crm | Hướng làm: chỉ vai `owner`; dữ liệu tầng chủ kho không gửi xuống trình duyệt của vai khác. Chốt ở S1 |
| 5 | «PR» của tầng chủ kho tìm được từ dữ liệu | Chủ kho không lần được việc về PR | Đọc đặc tả khối | Khối cố ý không mang số PR (đặc tả kit: số PR chỉ có sau khi gộp, trang sẽ lệch phép so của CI); mang mã commit đã chấm — ngăn hiện mã và liên kết tới commit trên GitHub (trang commit hiện PR). Chốt ở S1 |
| 6 | Ngăn lên production trước hạn 14/10 | Trưởng phòng ban dùng trang Lộ trình mấy ngày đầu không có ngăn hồ sơ | Lịch phát hành kit | **Không:** chỉ gộp khi crm nhận kit 2.27 (từ 15/10). Chấp nhận — LT1 đã lên, ngăn là phần thêm |

## Ngưỡng chết / ngưỡng UAT

> Bản máy dựng từ hàng (`bat_khi`) giữ nguyên ở dưới làm sử liệu. Bản sửa ngay đây thêm vế mức dùng của
> trang Lộ trình (ngưỡng của LT1), vì chủ kho bỏ vế chờ bốn tuần ngày 12/10 và giao Cổng Giá trị của LT1b
> đọc luôn số đó.

- Câu hỏi phép đo trả lời: [đề xuất] người đọc ngăn hồ sơ của một việc đã giao có tự trả lời được năm câu — vì sao làm · đã lên chưa · sẽ đo gì, khi nào · còn thiếu gì · ai quyết — trong một phút mà không hỏi ai, và trang Lộ trình có thay được tin hỏi tiến độ gửi chủ kho không?
- Kết quả nào là SỐNG: [đề xuất] ở phiên nghiệm thu kế, chủ kho và ít nhất 2 trưởng phòng ban, mỗi người một việc đã giao do máy chọn ngẫu nhiên trong các việc có dải tóm tắt, trả lời đúng cả năm câu từ ngăn trong một phút, không hỏi lại; và tin hỏi tiến độ của chủ kho, đếm cùng cách với nền 23/48, dưới một nửa nền (dưới 24%). Năm câu đạt mà mức dùng chưa đạt là kết quả giữa — lặp lại, không bỏ
- Kết quả nào là CHẾT: [đề xuất] dưới một nửa số người dự trả lời đủ năm câu; hoặc ngăn hiện một chữ khác dải tóm tắt của `LO-TRINH.html` cùng lượt vẽ
- Timebox: [đề xuất] phiên nghiệm thu đầu tiên sau khi ngăn lên production (sớm nhất 15/10); mức dùng đếm trên bốn tuần kể từ ngày trang Lộ trình lên production (10/10), hạn 07/11/2026

Bản máy dựng từ hàng, giữ làm sử liệu:

- SỐNG (hàng LT1b, `bat_khi`): Ở phiên nghiệm thu kế, chủ kho và trưởng phòng ban trả lời được năm câu trên cho một việc mà không hỏi ai.

## Kết quả prototype

Chưa dựng. Vòng chạm màn hình: bản bấm được làm ở nghi thức thiết kế cuối S1, trên dữ liệu thật của bản
vẽ kit nhánh chính, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khuôn khối `lo-trinh-du-lieu` bản 2 và hàm `docDuLieu(html)` | kho kit nhánh chính `7f65e5a0`, `scripts/lo-trinh.mjs` và `skills/acceptance/references/lo-trinh-du-lieu.md` (X2, kit#307) | triết-lý/logic | có — chép nguyên hàm, không sửa | |
| Dải tóm tắt: chín ô, bảy con số, thứ tự ô, chữ từng ô | kho kit, `scripts/ho-so-tom-tat.cjs` (qua `evidence-page.js`) | triết-lý/logic | có — đọc nguyên chữ, không tự tính, không viết lại | |
| Bố cục trang hồ sơ của kit (`evidence-page.html`) | kho kit | ngôn-ngữ-thiết-kế/hình-thái | không — ngăn dựng bằng họ `DetailSheet` của crm theo `docs/design.md` | |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = —** Căn cứ: không có bản mẫu dựng trước Cổng Đáng.
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Ngăn của một việc có dải hiện đúng chín ô của tầng mọi người, đúng chữ và đúng thứ tự của khối dữ liệu — so từng việc với bản vẽ thật của kit (máy đo).
- Vai `owner` thấy thêm bảy con số và liên kết tới commit đã chấm; vai khác không thấy, và dữ liệu tầng chủ kho không tới trình duyệt của họ.
- Ô vắng hiện «chưa có»; việc không có dải hiện «chưa có tóm tắt»; trang vẽ bằng khối bản 1 (kit 2.26) hiện «chưa có tóm tắt» cho mọi việc, trang không vỡ.
- Bản chép `docDuLieu` khớp nguyên văn hàm của kit; không mã nào đọc `_acceptance/` hay tệp kế hoạch, không tự tính ô nào.
- Năm câu của câu giao nằm trên đầu ngăn, đọc được trong một phút ở khổ máy tính và điện thoại (người chấm nhìn ảnh).

## Out of scope từ khám phá

- Sửa hay tự tính chữ trong dải (ô production, ô chưa làm, ô vì sao cụt) — lỗi dữ liệu đi về kit bằng chip riêng; CRM hiện nguyên chữ kit đưa.
- Số PR — khối cố ý không mang; tầng chủ kho dùng mã commit.
- Nút «Gửi tín hiệu» và phần hiện tín hiệu — hàng LT2, phiên khác.
- Ghi gì từ CRM vào lộ trình hay hồ sơ.
- Gộp vào `onehub` trước khi crm nhận kit 2.27; đưa `LO-TRINH.html` do kit nhánh chính vẽ vào kho (CI crm so bằng kit đã cài).
- Ô Mốc ở khổ máy tính bảng (Ngoài-1 của `lo-trinh-dong-bo-ho-so`) — hợp đồng riêng chưa mở.
