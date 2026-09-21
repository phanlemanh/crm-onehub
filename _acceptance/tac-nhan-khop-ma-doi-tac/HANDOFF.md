# Bàn giao — tac-nhan-khop-ma-doi-tac

## Đang ở đâu

Cổng Đáng ký «build» 2026-09-21. S1 xong: hợp đồng 16 tiêu chí, 16 phép đo, hạng T3.
Đang chờ Cổng Phạm vi (`status: draft`).

## Luật cho lượt chấm của hồ sơ này

- `/goal` không được chứa mệnh lệnh về trạng thái tệp — lý do: PR kit #193 (harness chuyển câu /goal vào mọi tác tử con như lời người, tác tử chấm đã tự sửa `contract.md`).
- Trước và sau mỗi lượt chấm S4: băm `contract.md`, `evals.yaml` và tệp args S4. Lệch thì gắn nhãn «thước lệch», không tin verdict, revert về mốc.
