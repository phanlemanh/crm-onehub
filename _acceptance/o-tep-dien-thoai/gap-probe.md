---
slug: o-tep-dien-thoai
at: 2026-10-22T14:47:30Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

# Gap probe — o-tep-dien-thoai

Phản biện context sạch (tác tử `feature-loop:cham-doc`), đọc design doc, contract, evals, sổ quyết định và tệp bài học
từ `claim-scan`.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ chọn «chỉ hàng Tệp xếp dọc dưới md» ghi máy quyết nguồn một-lối, nhưng đây là nếp nhìn của phiếu — lựa chọn chỉ người có; lối «mọi hàng wide» vẫn sống [truong-tep#F1] | Cổng Phạm vi duyệt AC-2 như điều bắt buộc; chủ kho thấy một hàng lệch nếp lần đầu ở Cổng Bằng chứng, AC-2 phải đổi sau ký | Thay bằng dòng chỉ-người có khuyến nghị, lối khác và giá | human-gate1: dòng d-20261022T144813Z-6 (Hỏi-1) thay d-…-2; contract soạn theo khuyến nghị «chỉ hàng Tệp» |
| P0 | design | Dòng sổ container query ghi một-lối, nhưng lối flex-wrap kèm bề rộng nền cho khối chữ vẫn sống và đạt AC-1, AC-4 | Ngưỡng container rơi sai khoảng hở hẹp làm E4 hay E5 đỏ, lối thay thế chưa từng được cân | Sửa căn cứ, nêu lối flex-wrap và lý do bỏ | fixed: đổi sang flex-wrap + basis của thang (d-20261022T144813Z-5 thay d-…-1); design doc và chiều đỏ E4 theo cơ chế mới |
| P0 | contract | Dòng bỏ đường đo ghi một-lối vòng tròn — chính máy quyết không có hồ sơ cơ hội [gia-co-gom-tin-hieu#F2] | Cổng Giá trị không có số để quyết | Dòng chỉ-người hỏi ngưỡng | rejected: vòng mở từ câu giao sửa lỗi bố cục của DA19 đã giao, không từ hàng lộ trình nên không qua Cổng Đáng; kit suy đường đi từ có/không ô cơ hội (S5 «ship thẳng, không phiên nghiệm thu»); Cổng Giá trị của tính năng Tệp thuộc hồ sơ truong-tep |
| P1 | evals | E6 hứa không sửa bài cũ nhưng không đo [truong-tep#F2] | Phiên sửa bài cho khớp DOM mới, E6 vẫn xanh | git diff --exit-code trên năm tệp bài, ghim lời | fixed: lệnh otdt_dom chạy git diff --quiet từ merge-base, đỏ với 'otdt dom: bai cu bi sua'; chiều đỏ ghi ở E6 |
| P1 | evals | E3 đo cuộn ngang của trang, không đo vùng cuộn của phiếu; không chiều đỏ; không chạy lại phép xếp dọc trên T2 | Tên tệp dài làm vùng cuộn của phiếu tràn mà trang vẫn ≤ 375 | scrollWidth ≤ clientWidth + 1 trên vùng cuộn; chạy lại (a)–(d) trên T2; chiều đỏ | fixed: E3 đo mọi tổ tiên cuộn ngang được, chạy lại (a)–(d) trên T2, tệp tên dài, chiều đỏ min-w vượt phiếu |

Ghi chú ngoài bảng: lineHeight «normal» làm phép chia ra NaN — fixed ở E1 (quy ra px, NaN thì thoát 2). Thứ tự đọc
và tab không có AC — cách sửa không đổi thứ tự DOM, nên không thêm.
