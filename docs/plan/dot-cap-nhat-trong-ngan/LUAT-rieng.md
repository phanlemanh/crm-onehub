## Luật riêng của kho crm (chép vào LUAT.md của đợt cap-nhat-trong-ngan)

Đợt `cap-nhat-trong-ngan` là làn Mac Studio, mở 30/10 sau khi `vo-khu-muc-tieu` hết hàng. Luật 2–18 và 26–29 mang nguyên
từ gói `docs/plan/dot-vo-khu-muc-tieu/LUAT-rieng.md`; luật 30 trở đi là của đợt này.

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

Luật của đợt cap-nhat-trong-ngan (chủ kho 30/10).

30. **Nếp ghi trong ngăn.** Hàng SV8 làm đúng mục «Ghi vào bản ghi: ngay trong ngăn» của `docs/design.md`. Màn nào
    còn mở `Dialog` để ghi một dòng vào bản ghi thì ghi vào «Ngoài hợp đồng», không sửa lẻ.
31. **SV8 đi sau HT6.** Cùng `kr-sheet.tsx`, cùng dãy V1: HT6 gộp trước, SV8 gộp `onehub` rồi mới vào S1.
32. **Vùng record-sheet của M5.** `apps/app/components/crm/record-sheet/**` là vùng của làn M5 (luật 19 đợt trước). Giám sát
    báo M5 trên #375 trước khi V1 mở hàng; chạm tệp ngoài `kr-sheet.tsx`, `lich-su-kr.tsx`, `objective-sheet.tsx` thì
    gửi `cham-tep`.
33. **Proto trước Cổng 1.** SV8 dựng `/proto/cap-nhat-trong-ngan-kr` với dữ liệu mẫu dày, đặt hộp thoại hiện tại cạnh
    khối trong ngăn (khổ 1280 và 375), trước khi trình Cổng Phạm vi.
34. **Thước đã ký đo hộp thoại.** Thước của SV1, SV6, SV7, HT2, VK7 (`ngan-kr-mot-cho`) đang đo hộp cập nhật; đổi chỗ
    đo sang khối trong ngăn qua `cham-tep`, giữ kỳ vọng, mỗi hồ sơ một dòng sổ `fix` mang `decided_by` chủ kho, đo hai
    chiều. Gom các thước vào một yêu cầu để chủ kho duyệt một lần.
35. **Ghim nhiều hồ sơ** chạy kèm `--tran-phut 200` và xin `gia-han` có `uoc_phut` đủ phủ ngay từ đầu; đẩy xong chờ ít
    nhất 1′ rồi mới `gh pr ready`, để lượt CI đầy đủ không bị huỷ.

Tên và giao tiếp.

26. **Một cửa.** Chủ kho chỉ nói với phiên giám sát `vk · Giám sát (Mac Studio)`. Phiên này giữ luôn vai gọi lượt gộp cho
    ba máy trên #375 (bàn giao từ phiên «Điều phối Mac Studio — r2», 19/10). Hai ngoại lệ ký cổng và bấm quyền đi kèm thẻ
    dẫn đường của giám sát.
27. **Tên phiên.** Thợ: `vk·V<n> · <mã hàng> · <trạng thái>`; trạng thái dùng `đang làm` · `chờ lượt S4` ·
    `chờ anh ký <cổng>` · `chờ anh bấm quyền` · `xong`.
28. **Nhánh** `<loại>/<slug>`; **PR** `<mã> · <loại>(<slug>): <câu giao ngắn>`, mở dạng nháp (luật 17).
29. **Tin giữa các phiên** mở đầu `[<nguồn> → <đích>] <loại>` — `yeu-cau` · `tra-loi` · `bao` · `hoi`. Từ vựng theo
    `CONTEXT.md` của kit: đợt chạy, dãy, hàng, phiên giám sát, phiên thợ, bộ phát lịch.
