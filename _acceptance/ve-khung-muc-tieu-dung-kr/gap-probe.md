---
slug: ve-khung-muc-tieu-dung-kr
at: 2026-10-30T03:40:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

# Phản biện context sạch — ve-khung-muc-tieu-dung-kr

Một tác tử tươi đọc đúng sáu tệp: design, contract, evals, sổ nháp, bài học từ hồ sơ trước, ô Cổng Đáng.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals (E5) + contract (AC-5) | Chiều đỏ của E5 không đỏ được: đường dẫn `objective:mt-2,kr:A` không tách được phương án hẹp «chỉ đổi khi tầng dưới là mục tiêu của KR trước» | Phương án hẹp ra đúng `objective:mt-2,kr:B` rồi `objective:mt-1,kr:C`; bản sửa trái câu đã ký xanh cả sáu eval | Given `objective:mt-2,kr:C` › D, kỳ vọng `objective:mt-1,kr:D`; ghim dòng đỏ của phương án hẹp | fixed: AC-5 ô 1 và E5 đổi sang `objective:mt-2,kr:C` › D, dòng đỏ ghim «record sau › toi D objective:mt-2,kr:D can objective:mt-1,kr:D» |
| P1 | contract + evals (E1) | Câu đã ký gọi tên nút «Về khung mục tiêu»; nút mang đúng chữ ấy (KR đích không tải được) không eval nào bấm | `canhKr` của B lỗi, nút «Về khung mục tiêu» mở mt-1; E1–E6 vẫn xanh | Ca bấm chính nút ấy sau › khi B không tải được | fixed: AC-3 thêm vế «Về khung mục tiêu» khi KR không tải được, E3 thêm ô 2 với đối chứng dương chữ nút; Notes đọc câu đã ký là lối về nói chung, đo cả ba lối |
| P1 | contract (Out of scope) + design | Ba dòng Out of scope không có dòng sổ; «tầng dưới không phải mục tiêu thì giữ» là lựa chọn nghĩa sản phẩm máy tự quyết; «không thêm mục lịch sử» không eval nào đo | Bản sửa ghi hai lần vẫn ra đúng record cuối; tầng dưới là kế hoạch thì nút quay lại mở kế hoạch | Dòng sổ cho từng mục, hoặc đo số lần ghi qua `onUrlUpdate` | fixed: bỏ ngoại lệ «tầng dưới không phải mục tiêu» — luật nay theo đúng câu đã ký (tầng dưới luôn là mục tiêu của KR đích), sổ ghi căn cứ mục tiêu; bỏ lời hứa về lịch sử khỏi Out of scope, sổ `descope` vì đo cần sửa khung thử dùng chung ngoài vùng; nhiều tầng mục tiêu ghi `descope` |
| P2 | evals (E2) | Bản sao chiều đỏ trượt ở bước đối chứng với thông điệp khác dòng ghim | Không lượt nào chứng assert sau ‹ đỏ được | Chiều đỏ «chỉ nhánh ‹ gọi thayDinh một đối số» | fixed: E2 CHIEU DO đổi đúng như đề xuất |
| P2 | evals (E1–E5) | Fixture `okr.objective` không ghi là parse bằng schema thật | Fixture thiếu trường bắt buộc mà khung vẫn dựng | Parse bằng output schema thật | rejected: `chiTietTu`/`mucTieu`/`kr` của `khung-gop-y-dung-cho.tsx` đã parse bằng `objectiveOutput`, `mucTieuOutput`, `krOutput`; E5 nay ghi rõ điều đó |
