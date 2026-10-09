---
slug: ngoai-le-telemetry-giai-doan
at: 2026-10-08T19:09:23Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E3 không có ca mã gốc nằm CÙNG dòng với tên hằng, nên không phân biệt ngoại lệ theo từ với ngoại lệ theo dòng | Thước bỏ qua cả dòng có `GIAI_DOAN_GOC` trong `allowlist.ts`; một `GIAI_DOAN_GOC.find((c) => c === "CLOSED_WON")` lọt mà E3 vẫn xanh | Ca (c) cùng dòng: thoát 1, in cả HONG lẫn CHO PHEP cho cùng dòng; chiều đỏ là thước chỉ xét từ khớp đầu | fixed: AC-3 hứa xét mọi từ khớp trên dòng; E3 thêm ca (c) và chiều đỏ «ngoai le theo dong khong theo tu» — thước hiện dùng `d.match` (chỉ từ đầu) nên phải đổi sang xét mọi từ |
| P1 | contract | AC-1 và E1 không cùng công thức đếm số tệp quét | Tệp kiểm thử trong `packages/telemetry/src` làm AC-1 và E1 hiểu khác nhau | Một công thức: `git ls-files` đuôi đã nêu dưới bảy thư mục trừ TRU áp cho cả bảy | fixed: AC-1 và E1 dòng 2 cùng công thức; `packages/telemetry/src` hiện không có tệp kiểm thử (kiểm thử ở `packages/telemetry/test`) |
| P1 | evals | E6 so sha dòng ghim với `verified_commit` mà không đối chiếu khuôn dòng ghim thật | Kit ghi lần ghim vào trường khác, E6 đỏ oan hoặc buộc sửa tay hồ sơ đã ký | Lấy trường từ một dòng ghim thật | rejected: bất biến của kit là `verified_commit` bằng `sha` của dòng `kind: repin` (khuôn REPIN-TEMPLATE và nghi thức ghim lại của feature-loop); E6 chạy trên run-log thật của `giai-doan-thoa-thuan`, vốn đã có các dòng ghim do làn ghim lại của kit ghi |
| P2 | evals | Chiều đỏ của E1, E2, E5 neo vào bản onehub trước vòng, không ghim sha | Sau gộp, «onehub trước vòng» chính là bản mới; chiều đỏ hết đỏ | Dùng bản đột biến tự dựng | fixed: E1, E2 dùng bản thước đột biến bỏ `packages/telemetry/src` khỏi THU_MUC; E5 dùng bản sao tài liệu bỏ chuỗi ngoại lệ — không neo mốc nào |
| P2 | contract | Ô «ngoài telemetry × tên hằng» của ma trận A × B không có ca | Thước chỉ khớp tên hằng trong telemetry; `GIAI_DOAN_GOC` ở `apps/api/src` thôi bị bắt mà E4 vẫn xanh | Ca (c) của E4 chèn tên hằng vào `apps/api/src` | fixed: AC-4 mở rộng; E4 thêm ca (c); Coverage liệt đủ 6 ô kèm AC |
