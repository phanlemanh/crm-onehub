## Luật riêng của kho crm (chép vào LUAT.md của đợt r2)

Đợt r2 là giai đoạn hai: chạy từ gói `dieu-phoi` của kit, không còn `scripts/dieu-phoi/` của crm. Luật 1–8, 10, 12,
14, 15 mang sang từ giai đoạn một (`docs/plan/dot-sau-14-10/LUAT-rieng.md`); mỗi luật đến từ một ca đã xảy ra. Luật
13 cũ bỏ: kit 2.26 đã vá lỗi thẻ Cổng 2 làm rơi mục mang sang.

1. Tên migration lấy giờ UTC thật (`date -u +%Y%m%d%H%M%S`), không dùng mốc giả kiểu `2026MMDD010000`. Ngay trước khi
   gộp, kiểm `origin/onehub` có migration trùng tên hay mới hơn không.
2. Migration mới không được trỏ tới bảng hay cột tạo ở một migration có tên xếp sau nó.
3. Cấm `pkill -f`, `pkill -P`, `killall` lên `bun`, `node`, `next`. Chỉ `kill <PID>` đúng tiến trình mình đã ghi lại
   lúc khởi chạy.
4. Gộp `onehub` mà có đổi `package.json` hay `bun.lock` thì chạy `bun install` trước khi lên làn đo; thiếu gói thì bun
   gán lỗi sang ca khác, đỏ giả.
5. Không bao giờ `gh pr merge --auto` (nhánh `onehub` không có check bắt buộc, `--auto` gộp ngay). Chỉ
   `gh pr merge <n> --merge --match-head-commit <sha>`, và chỉ phiên giám sát gộp khi Nhật ký ghi anh cho phép.
6. `PRODUCT-MAP.md` và `LO-TRINH.html` không sửa tay. Xung đột ở hai tệp này thì vẽ lại bằng `product-map.mjs` sau khi
   gộp `origin/onehub`. `pre-merge-check` chạy cả bản không kèm `--slug` trước khi đẩy.
7. Tệp chữ và cấu hình dùng chung (`apps/app/lib/messages/*.ts`, `packages/ui/src/lib/messages.ts`,
   `_acceptance/config.yaml`, `CONTEXT.md`, `turbo.json`, `.env.example`) chỉ thêm dòng, không sửa hay xoá dòng của
   người khác; xung đột thì giữ cả hai bên. Sửa dòng có sẵn thì gửi yêu cầu `cham-tep`.
8. Cổng 3000/3001 là của anh. Phép đo màn đi qua `bun run do:man` hoặc `tien-de.mjs` trên kho đo riêng của cây.
9. Chỉ một lượt S4 trên toàn máy. Khoá `s4` nay là khoá cấp máy của gói kit; không phiên thợ nào tự `mkdir` hay `rm`
   khoá của phiên khác, khoá mồ côi do bộ phát lịch thu hồi.
10. Sau khi máy sập: kiểm pid trong khoá trước khi xin gỡ; một lượt chạy bị chồng hay bị giết thì chạy lại trước khi tin
    màu đỏ của nó.
11. Không nâng plugin `acceptance-gate`/`feature-loop` giữa một lượt S4. Gói `dieu-phoi` thì nâng giữa đợt được: lõi của
    đợt đã chép vào `<thư mục đợt>/loi/`. Check Vercel `crm-onehub-agent` không tính vào điều kiện CI xanh.
12. Đầu mỗi lần thức, phiên giám sát kiểm Postgres: `lsof -nP -iTCP:5432 -sTCP:LISTEN` trống thì mở lại Docker trước
    khi cấp lượt `s4` hay `duong-nen` (07/10: Docker tắt làm cả bốn suite đỏ giả).
14. Hàng nào có nút xoá, lưu trữ hay trạng thái kết thúc thì đọc `docs/vong-doi.md` trước khi viết hợp đồng, và hợp đồng
    trả lời ba câu ở mục «Tính năng mới phải trả lời ba câu ở Cổng Phạm vi».
15. Một kiểm tra CI đỏ ở phần PR không chạm: đối chiếu cùng kiểm tra trên `onehub` ở mốc đã gộp vào nhánh, và chạy lại
    riêng tệp đó trên máy. `onehub` xanh và máy xanh thì chạy lại job đỏ một lần (`gh run rerun <id> --failed`) trước khi
    sửa gì; đỏ lần hai mới là việc thật (07/10: bài «số người gõ» của Trợ lý OKR đỏ trên CI của #290, chạy lại xanh).

Luật mới của giai đoạn hai.

16. Thiếu dữ liệu thì dựng trên dữ liệu mẫu (`CLAUDE.md`, mục «Lộ trình là việc dựng»). Hàng sinh dữ liệu giả (N1, cb)
    đi trước hàng đo trên nó (C, l5); không hàng nào chờ người.
17. PR mở ở dạng nháp tới lúc trình Cổng Bằng chứng (`CLAUDE.md`, mục «PR mở ở dạng nháp»); chuyển sẵn sàng bằng
    `gh pr ready`. Luật tạm tới khi kit có đề xuất «PR nháp tới lúc trình Cổng 2».
18. Mọi hàng của gói mang `moc`. Kiểm chéo đêm xin khoá `s4` không khai mốc, nên luôn xếp sau đơn của thợ (gói kit xếp
    theo mốc: không mốc là xa nhất). Thêm hàng giữa đợt thì khai `moc` cho hàng đó.
19. LT1b và LT2 (Lộ trình trong CRM) làm ở máy khác, không mở trong đợt này. Chạm `apps/app/app/(app)/[slug]/lo-trinh/**`
    thì gửi `cham-tep` và chờ giám sát hỏi chủ kho.
20. V0a (vá rò vai «chỉ OKR») đi đầu: kiểm dữ liệu production trước khi sửa; có dữ liệu đã lộ thì báo chủ kho trước.
