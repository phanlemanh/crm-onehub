---
slug: ba-ho-so-do-san
at: 2026-10-13T00:46:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ thay dòng -6 ghi máy tự quyết bỏ điều 2 của răng ld_ba_noi_deu_chay với nguồn muc-tieu, mà câu trích CLAUDE.md chỉ nói ai giữ ci.yml, không quyết việc bỏ chốt; lối khác (kiểm cấu trúc bước build, ghim bản hiện tại) vẫn sống | Răng «ba nơi đều chạy» chỉ còn kiểm hai nơi; người duyệt Cổng 1 không biết mình vừa bỏ một lời hứa đã ký | Chuyển thành câu hỏi chi-nguoi kèm ba lối và giá | human-gate1: dòng sổ mới chi-nguoi (Hỏi-3) thay d-20261013T003546Z-9; máy khuyên kiểm cấu trúc bước build; thêm E8 đo chiều đỏ của răng sau sửa |
| P1 | evals | E1 chỉ đếm hai mã chết; không eval nào kiểm bo-paths chỉ dùng cho ô not-run, nên bộ lọc có thể vẫn tắt vì eval-may-thieu-paths mới | Thợ bỏ paths của một eval máy đang chạy: E1, E3, E4 xanh mà hồ sơ vẫn đòi ghim lại sau mọi PR | E1 in trạng thái bộ lọc; đỏ khi lý do tắt ở HEAD là mã mới so với mốc nền; E3 đỏ BO_PATHS_O_DANG_CHAY | fixed: E1 thêm vế BO_LOC_TAT_MOI so với mốc nền (hồ sơ đã tắt vì thiếu khai ở mốc nền thì in, không đỏ — ngoài phạm vi); E3 thêm BO_PATHS_O_DANG_CHAY kèm đối chứng |
| P1 | evals | Câu hỏi E5 đòi thấy chiều đỏ của răng sau sửa và trạng thái vật ở HEAD, mà bang-truoc-sau.md theo design không chứa | Sửa ld lỡ làm hỏng điều 3; bảng gần như trống, hội đồng PASS theo lý do viết hay | Bảng kèm diff răng, đầu ra đột biến, git show --stat can_cu và vật vắng ở HEAD; chiều đỏ thành eval script riêng | fixed: design định nghĩa bang-truoc-sau.md do rang/bang.mjs sinh với bốn cột đó; thêm E8 script chạy đột biến có tên cho từng dòng sua-rang |
| P1 | evals | E3 bỏ config.yaml, chỉ so bốn trường của evals.yaml; tệp khác của hồ sơ trong danh sách đổi là qua; E6 giao vế «không tệp nào đổi» cho E3 mà E3 không đo | Sửa giá trị lệnh executor trong config.yaml làm răng yếu đi; hoặc ghim lỡ ghi run-log của hồ sơ tu-het — không ô nào đỏ | Ba luật mới mỗi luật một đối chứng | fixed: E3 thêm TU_HET_BI_CHAM, TEP_KHONG_KHAI (tệp ngoài evals.yaml/run-log/evidence-report cần dòng sua-rang nêu đúng tệp), CONFIG_DOI_GIA_TRI (khoá cũ giữ giá trị); diff gồm cả tệp răng ngoài _acceptance mà executor trỏ |
| P1 | evals | E4 chỉ đòi repin là hậu duệ mốc nền; lượt tự kiểm dùng run-log dựng tay | Sửa thêm răng sau khi ghim mà E4 vẫn xanh; khuôn evals_exit thật khác bản dựng tay làm phép lặp rỗng | GHIM_CU so với commit cuối chạm hồ sơ; bản sao lấy từ dòng repin thật; số eval đối chiếu > 0 và bằng số eval máy chạy | fixed: E4 thêm GHIM_CU, đối chứng lấy từ dòng repin thật của một run-log có sẵn, đếm eval đối chiếu = số eval máy không not-run và > 0 |
