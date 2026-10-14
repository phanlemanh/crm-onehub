---
slug: dai-luu-tru-dung-chung
at: 2026-10-13T17:05:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-3 hứa các bài đã ký của V2 chạy lại không sửa, nhưng E3, E4, E5, E8 chỉ đòi exit 0; không eval nào ghim tệp kiểm, phép đo màn hay ảnh nền của V2 mà E10 dùng làm mốc so `[them-buoc-bao-dung#F1]`. | Dời mã làm bài V2 đỏ; phiên sửa đường nhập, mock hay thêm `.skip` ở tệp kiểm V2 cho xanh lại; E3–E5 vẫn xanh. Ảnh vdc chụp lại sau khi dời thì E10 so ảnh mới với ảnh mới. | `git diff --quiet <merge-base>` trên bốn tệp V2 kèm đếm `.skip`/`.only`/`.todo`; chiều đỏ thêm một `.skip` vào bản sao. | fixed: thêm E11 (`dlt_v2_nguyen`, rang/v2-nguyen.mjs) ghim bốn tệp và đếm `.skip`/`.only`/`.todo`; AC-3 nói rõ bài, màn đo và ảnh nền của V2 không bị sửa |
| P1 | evals | E2 chỉ gõ phím vào ô nhập (vốn đã tắt bởi fieldset), trên combobox và contenteditable chỉ đếm onClick; ba bộ chặn pointerdown, mousedown, keydown không có đối chứng. | Bỏ sót bộ chặn keydown hay pointerdown khi dời; Radix Select mở bằng pointerdown hoặc Enter nên bản đã cất vẫn mở được ô chọn; E2 vẫn xanh. | Ma trận {combobox, contenteditable} × 4 sự kiện × 2 trạng thái = 16, chiều đỏ ghim từng bộ chặn. | fixed: E2 viết lại thành ma trận 16 phép với năm chiều đỏ ghim riêng; AC-2 nêu đủ bốn sự kiện |
| P1 | design | Bảng trạng thái có ST-dang-khoi-phuc nhưng lớp mỏng DaiLuuTruBanGhi không nói truyền dangKhoiPhuc; không eval nào đo trạng thái này ở app. | Bỏ dangKhoiPhuc; bấm «Khôi phục» hai lần gửi hai lần restore; E1 và E3 vẫn xanh. | Eval DOM ở tệp kiểm mới: mutation chưa xong, bấm hai lần thì restore gọi 1 lần và nút tắt; đối chứng xong promise thì nút hết tắt. | fixed: design truyền `dangKhoiPhuc={restore.isPending}`; AC-3 thêm vế nút tắt lúc chờ; thêm E12 (`dlt_ngan_cho`) ma trận 3 loại bản ghi |
| P2 | contract (opportunity.md) | Bốn ô ngưỡng của ô cơ hội còn «…», không ngưỡng nào có đường đo. | Cổng Giá trị không phân biệt được mảnh chung được dùng lại với loại bản ghi kế tiếp lại chép dải báo. | Điền ngưỡng: lượt 3b nhập DaiLuuTru/KhoaLuuTru từ @crm/ui; đo bằng mot-noi.mjs sau khi 3b gộp. | rejected: ô cơ hội đã ký ở Cổng Đáng (12/10) và hàng sinh từ lộ trình chỉ chứa việc dựng (CLAUDE.md, mục «Lộ trình là việc dựng»); đo trên dữ liệu thật là việc sau gộp, không phải cổng của việc dựng — E6 vẫn quét toàn apps/app ở mọi lượt ghim |
| P2 | design (sổ quyết định) | d-3 và d-4 ghi nguồn mot-loi nhưng loi_chet chỉ nói lối kia ít giá trị, không nêu ràng buộc `[bo-cau-hoi-mau#F1]`. | Người duyệt tưởng không có lựa chọn, không cân nhắc việc mất khoảnh khắc nhìn hình. | Mỗi dòng mot-loi nêu được ràng buộc làm lối kia không dựng được. | fixed: hai dòng mới d-20261013T164419Z-6, -7 thay (`supersedes`) d-3, d-4 với ràng buộc thật — chỗ dùng đã đo bằng grep (E6); hình đích đã có và đã ký (ảnh vdc-ngan-da-cat) |
