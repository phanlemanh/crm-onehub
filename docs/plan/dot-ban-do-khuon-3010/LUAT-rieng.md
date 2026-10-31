## Luật riêng của kho crm (chép vào LUAT.md của đợt ban-do-khuon-3010)

Đợt `ban-do-khuon-3010` là làn Mac Studio, mở 31/10 theo việc giao MBP-3110-1. Luật 2–18 và 26–29 mang nguyên từ gói
`docs/plan/dot-cap-nhat-trong-ngan/LUAT-rieng.md` (luật 26–27 đổi tên phiên); luật 30 trở đi là của đợt này.

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

Luật của đợt ban-do-khuon-3010 (chủ kho 30–31/10).

30. **BK chạy trước SV9, SV10.** Chủ kho 31/10 nguyên văn «BK chạy trước». SV9 và SV10 đứng trên BK2 trong lộ trình,
    không mở trong đợt này. Hàng nào của đợt khác cũng sửa `kr-sheet.tsx`, `so-kr-sheet.tsx`, `objective-sheet.tsx` thì
    giám sát báo trên #375 trước khi mở, không chạy song song với dãy K.
31. **Sửa khung, không thoát khung.** BK1 mở `RecordSheetFrame` thêm đúng các khe ngăn KR và Số KR cần (hành động riêng
    ở đầu, thân nhận thẻ con, lỗi «không thấy»), rồi đưa hai ngăn vào khung. Khe chờ tải và lỗi bắt buộc qua kiểu. Một
    ngăn cần thứ khung chưa có thì mở khe ở khung, không dựng tay trong ngăn.
32. **Vùng record-sheet của M5.** `apps/app/components/crm/record-sheet/**` là vùng của làn M5 (luật 19 đợt
    `vo-khu-muc-tieu`). Giám sát báo M5 trên #375 trước khi dãy K mở BK1. Chạm `packages/ui` (thành phần lỗi tải trong
    ngăn, khung xương) thì gửi `cham-tep`.
33. **Proto trước Cổng 1.** BK1 dựng `/proto/khung-chung-ngan-ban-ghi` với dữ liệu mẫu dày: bảy loại ngăn (deal, liên
    hệ, công ty, kế hoạch, mục tiêu, KR, Số KR) ở ba trạng thái (đang tải, lỗi tải, đủ dữ liệu), khổ 1280 và 375, ngăn
    KR hiện tại đặt cạnh ngăn KR trong khung — trước khi trình Cổng Phạm vi.
34. **Răng hai chiều.** BK2 đo chiều đỏ bằng chính lệnh (tiêm một ngăn gọi thẳng `DetailSheetHeader` thì lint và bài
    quét đỏ, nêu tệp và khối cấm), chiều im (chỉ sửa `docs/` hay `_acceptance/` thì im) và đối chứng dương (mọi ngăn hiện
    có xanh sau BK1). BK2 gồm BK4: một dòng màn mẫu ngăn deal trong `docs/proto.md`.
35. **BK3 nối nhánh có sẵn.** Dãy L làm trên nhánh `chore/rang-khung-trang-mo` (ô cơ hội và dự báo giờ máy đã có từ
    30/10), không mở nhánh mới. Dãy dừng ở Cổng Đáng tới khi chủ kho gõ `build rang-khung-trang-mo` ở thẻ khởi tạo.
36. **Số đo cho kit.** Mỗi hồ sơ của đợt ghi trong `evidence-report.md` bốn số: số tệp đi theo khuôn, số lần răng bắt,
    số lệch lọt (lệch thấy bằng mắt mà răng không bắt), và PR gộp. Giám sát gom số và đăng một dòng lên
    `phanlemanh/acceptance-gate-kit#308` khi BK1, BK2 ký và sau mỗi ba vòng giao diện. Phiên thợ không đăng lên kho kit.
37. **Ghim nhiều hồ sơ** chạy kèm `--tran-phut 200` và xin `gia-han` có `uoc_phut` đủ phủ ngay từ đầu; đẩy xong chờ ít
    nhất 1′ rồi mới `gh pr ready`, để lượt CI đầy đủ không bị huỷ.

Tên và giao tiếp.

26. **Một cửa.** Chủ kho chỉ nói với phiên giám sát của đợt (mã app
    `local_b1684b53-2441-4364-a325-ed529326c362`). Chủ kho 31/10: «Phiên này trở thành phiên điều phối còn các phiên khác
    trở thành phiên thợ» và «phiên này toàn quyền trong sắp xếp gộp và gộp». Giám sát báo XONG việc giao MBP-3110-1 về
    MBP trên #375. Hai ngoại lệ ký cổng và bấm quyền đi kèm thẻ dẫn đường của giám sát.
27. **Tên phiên.** Thợ: `bdk·<dãy> · <mã hàng> · <trạng thái>`; tin gửi giám sát mở đầu `[<mã hàng> · <tên ngắn> (crm) → giám sát]`; trạng thái dùng `đang làm` · `chờ lượt S4` ·
    `chờ anh ký <cổng>` · `chờ anh bấm quyền` · `xong`.
28. **Nhánh** `<loại>/<slug>`; **PR** `<mã> · <loại>(<slug>): <câu giao ngắn>`, mở dạng nháp (luật 17).
29. **Tin giữa các phiên** mở đầu `[<nguồn> → <đích>] <loại>` — `yeu-cau` · `tra-loi` · `bao` · `hoi`. Từ vựng theo
    `CONTEXT.md` của kit: đợt chạy, dãy, hàng, phiên giám sát, phiên thợ, bộ phát lịch.
