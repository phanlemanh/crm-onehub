# Báo lỗi tác nhân cả sau câu hỏi giữa chừng — kế hoạch (VS11)

Design: `docs/superpowers/specs/2026-10-27-bao-loi-tac-nhan-sau-cau-hoi-design.md`. Hồ sơ:
`_acceptance/bao-loi-tac-nhan-sau-cau-hoi/`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Có bài kiểm giữ lời hứa «đúng một thông báo» qua đường gửi, hỏi, trả lời thật | `apps/api/test/bao-loi-sau-cau-hoi.spec.ts` | AC-1 đến AC-8 (tám ca đã viết trước) |
| Tin gửi chen giữa lúc dựng không còn che thông báo hỏng hay xong | `apps/agent/agent/lib/thong-bao-tac-nhan.ts` | AC-6 (hỏng), AC-7 (xong), AC-8 (không báo lần hai) |
| Thông báo tác nhân đang đúng hôm nay giữ nguyên | (không sửa) | AC-9 (bảng ca đã ký) |

## Task 1 — bài kiểm tám ca (independent: false)

Files: `apps/api/test/bao-loi-sau-cau-hoi.spec.ts`, `_acceptance/config.yaml` (tám khoá `blth_*`).
Phục vụ: E1–E8.
Verify: `cd apps/api && CRM_TELEMETRY_DISABLED=1 TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup.ts test/bao-loi-sau-cau-hoi.spec.ts`
trên mã chưa sửa → 5 xanh, 3 đỏ đúng thông điệp ghim (`chen giua van bao hong`, `chen giua van bao xong`,
`tro chuyen chen giua khong bao hong lan hai`). Đã đo 27/10.

## Task 2 — bộ ghi chọn lần gửi Kara đang làm (independent: false, sau Task 1)

Files: `apps/agent/agent/lib/thong-bao-tac-nhan.ts` — truy vấn `submissions` của `noiDungTacNhan` thêm
`where: { status: { in: ["SENDING", "ACCEPTED"] } }`.
Phục vụ: E6, E7, E8; E1–E5, E9 giữ xanh.
Verify: cùng lệnh Task 1 → 8 xanh; `config:executors.test.ctnl_bao_khi_xong` xanh.

Phá-thử (cặp hai chiều trên cùng fixture, chạy trên bản sao rồi hoàn lại):

1. `answerBuilderQuestion` ghi `commandType: "CHAT"` cố định → E1, E2, E3, E4 đỏ với `hong sau tra loi: <ca>`.
2. Khoá của `ghiThongBaoTacNhan` mới mỗi lần ghi → E3 đỏ với `dung mot hong: hai-su-kien`.
3. Bỏ điều kiện `CREATE_AGENT` ở nhánh «hong» → E5 đỏ với `tro chuyen khong bao hong`, E8 đỏ với
   `tro chuyen chen giua khong bao hong lan hai`.
4. Gỡ điều kiện trạng thái của Task 2 → E6, E7, E8 đỏ (chiều đỏ của chính bản sửa).

## Task 3 — năm lệnh chứng của kho

`bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`, qua khoá máy.
