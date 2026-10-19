## Luật riêng của kho crm (chép vào LUAT.md của đợt vo-khu-muc-tieu)

Đợt `vo-khu-muc-tieu` là làn Mac Studio theo lộ trình ba làn (#487, chủ kho 19/10). Luật 1–18 mang nguyên từ gói r2
(`docs/plan/dot-r2/LUAT-rieng.md`), mỗi luật đến từ một ca đã xảy ra; luật 19 trở đi là của đợt này.

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

Luật của đợt vo-khu-muc-tieu (chủ kho 19/10, bảng gom rà làn #375 09:20Z).

19. **Chủ vùng chung.** Làn Mac Studio làm chủ: thanh bên khu (`packages/ui`, VK1), `apps/app/lib/messages/okr*.ts`,
    `DataTable`, lời dặn Kara và bộ chấm soạn, kênh Zalo/Slack. Làn M5 làm chủ `apps/app/components/crm/record-sheet/**`,
    dự án, lịch làm việc, Gantt và luật thấy việc; làn MacBook Pro làm chủ trang Lộ trình, tín hiệu, thông báo,
    `scripts/kiem-cheo` và thước hồ sơ đã ký của nhóm F35. Chạm vùng của làn khác thì gửi `cham-tep`; giám sát hỏi trên #375.
20. **VK7 đi sau VS8.** Ngăn KR dùng `RecordSheetHost` thì VK7 chờ VS8 (M5) gộp; không dùng thì báo giám sát để bỏ ràng buộc.
21. **VK4 đổi tên trong thước.** Chủ kho cho (19/10): VK4 được đổi ĐÚNG chuỗi tên cũ → tên mới trong khẳng định thước của hồ
    sơ đã ký; mỗi hồ sơ đo hai chiều và ghi dòng sổ `fix` mang `decided_by` chủ kho. Không đổi logic thước. VK4 và VK2 cùng
    màn: VK4 gộp trước, VK2 gộp `onehub` rồi ghim lại chung.
22. **DH11 nằm trong VK2.** Hợp đồng VK2 mang tiêu chí của DH11 (đơn vị dẫn khi cây lỗi, `phan-don-vi-dan.tsx`).
23. **Đầu vào thiết kế.** VK2 dùng bản mẫu `/proto/vo-khu-muc-tieu` (nhánh `feat/vo-khu-muc-tieu`, `2790552ac`) làm đầu
    vào Cổng Phạm vi. VK10 qua phiên `design-pass` trước Cổng Phạm vi.
24. **Lời dặn Kara chốt trước.** VK5 và VK10 chốt lời dặn Kara; giám sát báo #375 khi chốt để M5 đo MH4, MH2.
25. **Hệ số giờ máy** 10 giờ mỗi vòng (chủ kho 19/10); ghim lại dùng `giu-tuoi` của kit 2.33 và nhãn «đỏ sẵn trên nền».

Tên và giao tiếp.

26. **Một cửa.** Chủ kho chỉ nói với phiên giám sát `vk · Giám sát (Mac Studio)`. Phiên này giữ luôn vai gọi lượt gộp cho
    ba máy trên #375 (bàn giao từ phiên «Điều phối Mac Studio — r2», 19/10). Hai ngoại lệ ký cổng và bấm quyền đi kèm thẻ
    dẫn đường của giám sát.
27. **Tên phiên.** Thợ: `vk·V<n> · <mã hàng> · <trạng thái>`; trạng thái dùng `đang làm` · `chờ lượt S4` ·
    `chờ anh ký <cổng>` · `chờ anh bấm quyền` · `xong`.
28. **Nhánh** `<loại>/<slug>`; **PR** `<mã> · <loại>(<slug>): <câu giao ngắn>`, mở dạng nháp (luật 17).
29. **Tin giữa các phiên** mở đầu `[<nguồn> → <đích>] <loại>` — `yeu-cau` · `tra-loi` · `bao` · `hoi`. Từ vựng theo
    `CONTEXT.md` của kit: đợt chạy, dãy, hàng, phiên giám sát, phiên thợ, bộ phát lịch.
