## Luật riêng của kho crm (chép vào LUAT.md của đợt truong-hop-dong)

Đợt `truong-hop-dong` chạy trên M5 (chủ kho 20/10). Luật 1–18 mang nguyên từ gói `viec-du-an-kho-tai-lieu` (gốc gói r2),
mỗi luật đến từ một ca đã xảy ra; luật 19 trở đi là của đợt này.

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


Luật của đợt truong-hop-dong (chủ kho 20/10; lượt cắt `docs/plan/pham-vi-truong-hop-dong.md`, PR #511).

19. **Luật đích.** `docs/design.md` mục «Trường»: người dùng không phân biệt được trường chuẩn với trường tự tạo ở bất kỳ
    màn nào. Mọi hàng UI của đợt đi theo bảng đăng ký kiểu trường mà DA14 dựng; không dựng ô riêng cho một trường ở màn.
20. **Chủ vùng.** Đợt làm chủ `apps/app/components/crm/fields/**`, `apps/api/src/fields/**`,
    `packages/db/src/fields*.ts`, `apps/app/components/crm/record-sheet/**` và các sheet tạo bản ghi. `DataTable` và
    `packages/ui` dùng chung vẫn của làn Mac Studio: DA17, DA18 cần kiểu bộ lọc mới (khoảng số, mốc ngày) ở `DataTable`
    thì gửi `cham-tep`, giám sát hỏi trên #375.
21. **DA14 sau DA21.** DA21 (`kara-khong-ghi-de-truong`) chạy ngoài đợt ở phiên «Kara không ghi đè trường người đã nhập»,
    nhánh `fix/kara-khong-ghi-de-truong`, đang chờ Cổng Phạm vi. Cùng `record-fields.tsx`: DA14 viết hợp đồng sau khi
    DA21 gộp `onehub`. DA23 đứng trên DA21 qua `dung_tren`.
22. **Đổi tên gọi là sửa dòng.** DA14 thống nhất «trường», «trường tự tạo» theo `CONTEXT.md` — sửa dòng có sẵn ở
    `apps/app/lib/messages/*.ts` nên gửi `cham-tep` (luật 7), không sửa thẳng.
23. **DA17 rồi DA18, cùng dãy L1.** Cả hai chạm `*.service.ts` của companies, contacts, deals và `list-search-params.ts`;
    không chạy song song. DA18 đổi cách mã hoá bộ lọc phải giữ đọc được `SavedView.filters` đã lưu và bộ lọc chiến dịch.
24. **DA19, DA20 là T3.** Migration theo luật 1–2; thêm Cổng duyệt kế hoạch. DA19 đo tải lên trên một kho Blob riêng tư
    thật (bài học kho-tai-lieu: round 2 BLOCKED vì thiếu Blob thật) — thợ xin khoá qua `can-nguoi` trước S3, không dùng
    khoá `KHO_TAI_LIEU_BLOB_TOKEN` của Kho tài liệu. Thiếu khoá thì mất khả năng, không ném lỗi (`AGENTS.md`).
25. **DA22 trước DA23.** DA22 sinh bộ hợp đồng mẫu có nhãn (`du_lieu: sinh-gia`), từ chối chạy trên production; DA23 đo
    trên bộ ấy (luật 16). Độ đúng trên hợp đồng thật là ô bỏ qua có tên.
26. **Hệ số giờ máy** 10 giờ mỗi vòng (chủ kho 19/10). Mốc trong `hang-viec.json` là ước theo ≈1 ngày lịch mỗi vòng trên
    một dãy, tính từ #511 gộp 20/10; giám sát dời khi lệch, không ép thợ.
27. **Gộp qua giám sát vk.** Vai gọi lượt gộp cho ba máy ở phiên `vk · Giám sát (Mac Studio)` trên #375; gộp theo cửa sổ
    đầu giờ UTC chẵn, `--match-head-commit`.

Tên và giao tiếp.

28. **Tên phiên.** Thợ: `th·<dãy> · <mã hàng> · <trạng thái>`; trạng thái dùng `đang làm` · `chờ lượt S4` ·
    `chờ anh ký <cổng>` · `chờ anh bấm quyền` · `xong`. Giám sát: `Điều phối M5 — kit, Việc–Dự án, OneFlow`.
29. **Nhánh** `<loại>/<slug>`; **PR** `<mã> · <loại>(<slug>): <câu giao ngắn>`, mở dạng nháp (luật 17).
30. **Tin giữa các phiên** mở đầu `[<nguồn> → <đích>] <loại>` — `yeu-cau` · `tra-loi` · `bao` · `hoi`. Từ vựng theo
    `CONTEXT.md` của kit.
