# Bàn giao — tac-nhan-khop-ma-doi-tac

## Đang ở đâu

Cổng Đáng ký «build» 2026-09-21. S1 xong: hợp đồng 16 tiêu chí, 16 phép đo, hạng T3.
Đang chờ Cổng Phạm vi (`status: draft`).

**Tạm dừng 2026-09-21 theo lời chủ kho** — làm ô `quan-ly-danh-muc-30-ngay` trước. Thẻ Cổng Phạm vi đã dựng (`card.html`, hình `figures/F1-luong-ghep.png`). Quay lại thì trình lại thẻ và chờ lệnh `/acceptance-gate:approve tac-nhan-khop-ma-doi-tac`; kế hoạch S2 chưa viết. Một lựa chọn máy tự chốt cần chủ kho nhìn ở cổng: xác nhận ứng viên đang mang mã khác thì từ chối (AC-11).

## Luật cho lượt chấm của hồ sơ này

- `/goal` không được chứa mệnh lệnh về trạng thái tệp — lý do: PR kit #193 (harness chuyển câu /goal vào mọi tác tử con như lời người, tác tử chấm đã tự sửa `contract.md`).
- Trước và sau mỗi lượt chấm S4: băm `contract.md`, `evals.yaml` và tệp args S4. Lệch thì gắn nhãn «thước lệch», không tin verdict, revert về mốc.
