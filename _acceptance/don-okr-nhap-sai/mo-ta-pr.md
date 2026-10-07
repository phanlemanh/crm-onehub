## Người dùng thấy gì khác

Lượt 1 của chuẩn vòng đời bản ghi (`docs/vong-doi.md`), slug `don-okr-nhap-sai`.

| Người dùng thấy gì khác | Đụng đâu |
|---|---|
| Mục tiêu OKR nhập sai mà chưa có lịch sử nào thì xoá được hẳn, có hộp hỏi lại ghi tên mục tiêu và số KR | `okr.xoaMucTieu`, `objective-sheet.tsx` |
| Mục tiêu đã có lịch sử (đã công bố, có bình luận, cập nhật, mang sang…) không xoá được; máy chủ nói rõ lý do và gợi ý bỏ mục tiêu | `packages/db/src/okr-muc-tieu-lich-su.ts` |
| «Theo đơn vị» và «Của tôi» mặc định chỉ hiện mục tiêu đang dùng; mục tiêu đã bỏ gập dưới dòng «Đã bỏ (n)» | `nhom-da-bo.tsx`, `okr.danhSach`, `okr.mine` (`daBo`) |
| Mục tiêu đã bỏ trông khác hẳn Nháp: nhãn riêng, không thanh tiến độ, ghi «Không tính tiến độ» | `khoi-muc-tieu.tsx`, `tien-do-kr.tsx` |
| Mục tiêu bỏ nhầm có nút «Dùng lại» về Nháp; toast nói bước kế là gửi duyệt hay công bố | `okr.dungLaiMucTieu` |
| Thoả thuận, cá nhân, công ty chỉ xoá vĩnh viễn được sau khi đã lưu trữ; lưu trữ lại không ghi đè ngày lưu trữ đầu | `deals/contacts/companies.service.ts`, `archive-config.ts` |

Từ mới vào từ điển: Đã lưu trữ, Xoá, Xoá vĩnh viễn, Bỏ · Dùng lại (`CONTEXT.md`).

## Khối giao diện mới — dừng ở bậc nào

- Dòng gập «Đã bỏ (n)»: bậc 1 — `Collapsible` của `packages/ui`.
- Hộp hỏi lại khi xoá: bậc 1 — `ConfirmDialog` của `packages/ui`.
- Nhãn «Đã bỏ»: bậc 1 — `Badge` biến thể `ghost` có sẵn (không thêm biến thể mới; quyết định Treo-1 đã phê ở Cổng 2).

## Bằng chứng

- Cổng Phạm vi: duyệt 07/10 (15 tiêu chí, 21 phép đo).
- S4 vòng 2: PASS 21/21, bảy lệnh kiểm toàn kho xanh (`_acceptance/don-okr-nhap-sai/evidence-report.md`).
- Cổng Bằng chứng: Manh Phan ký 07/10; bốn mục ngoài hợp đồng ghi Known limits trong hợp đồng.
- Lưới trước-merge: sạch.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
