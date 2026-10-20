# Gói đợt truong-hop-dong — M5

Đợt dựng «một trường, một cách cư xử» và trường Tệp cho hợp đồng: DA14–DA23 của `docs/plan/lo-trinh-viec-du-an.json`,
cắt bằng `/acceptance-gate:cat-luot` từ `docs/plan/pham-vi-truong-hop-dong.md` (PR #511, chủ kho 20/10). Gói theo khuôn
§4.1 của kit: `dieu-phoi.config.json`, `hang-viec.json`, `LUAT-rieng.md`. Hàng lấy từ lộ trình qua `nguon_hang`. Chủ kho
duyệt hàng, Cổng Đáng (`build`) và quyền tự merge ở thẻ khởi tạo của `/dieu-phoi:mo-dot truong-hop-dong`.

## Mở đợt

1. #511 gộp `onehub` trước: gói, lộ trình và bản phạm vi nằm trong PR đó.
2. Một kho chỉ chạy một đợt một lúc. Đợt `viec-du-an-kho-tai-lieu` còn dãy K1 (MH4 → MH2): giám sát chọn mở đợt này sau
   khi đóng đợt kia, hoặc nối hai dãy T1, L1 vào đợt đang chạy theo luật 18 của nó (mọi hàng mang `moc`).
3. DA21 (`kara-khong-ghi-de-truong`) chạy ngoài gói, ở phiên đã mở 20/10; DA14 viết hợp đồng sau khi DA21 gộp (luật 21).

## Dãy

| Dãy | Hàng (theo thứ tự) | Mốc ước | Ghi chú |
|---|---|---|---|
| T1 | DA14 trường đồng nhất → DA15 Cài đặt › Trường → DA16 nhập lúc tạo → DA19 trường Tệp → DA20 quyền tệp | 23/10 → 28/10 | DA14 sau DA21 (luật 21); DA19 chờ DA18; DA19, DA20 là T3 (luật 24) |
| L1 | DA17 sort → DA18 lọc → DA22 hợp đồng mẫu → DA23 Kara đọc ô Tệp | 24/10 → 29/10 | DA17 chờ DA14; DA22 chờ DA19; DA23 chờ DA22 và DA21 |

Mỗi dãy một vòng một lúc; toàn máy một lượt S4 một lúc (luật 9). Không vào đợt: DA21 (chạy ngoài gói), DA24 (chờ điều
kiện ở `chan_troi`).

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>`; việc đầu tiên của phiên thợ mở từ chip là
`node <thư mục đợt>/loi/dieu-phoi.mjs ghi-danh <dãy>` từ worktree của chip.
