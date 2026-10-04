# Hình tại điểm quyết định — kho-nguon-khong-ket

| Điểm | Đếm | Hình |
|---|---|---|
| d-20261004T080602Z-1 bỏ design-pass | 1 bước, 0 nhánh — dưới ngưỡng | — |
| d-20261004T080602Z-2 lỗi đọc tệp → `LOI` ngay, không thử lại theo lease | 2 nhánh rẽ (cũ: thử lại rồi kẹt `CHO_DOC`; mới: `LOI` → Soạn lại) | `vong-doi-nguon` |
| d-20261004T080602Z-3 lưới nguồn mồ côi qua `agentTask` | 2 nhánh rẽ (còn việc mở → giữ; hết việc mở → `LOI`) | `vong-doi-nguon` |

## Đề bài `vong-doi-nguon`

- Loại hình: sơ đồ máy trạng thái (state machine).
- Nút: Tải lên · `CHO_DOC` «đang đọc» · `CHO_SOAN` · `DANG_SOAN` · `DA_SOAN` · `CAN_GO_TAY` · `LOI` · «Soạn lại».
- Cạnh có sẵn: Tải lên → `CHO_DOC`; `CHO_DOC` → `CHO_SOAN` (đọc được); `CHO_DOC` → `CAN_GO_TAY`; `CHO_DOC` → `LOI` (ca lỗi đã có); `CHO_SOAN` → `DANG_SOAN` → `DA_SOAN`; `DANG_SOAN` → `LOI` (quá hạn, đã có); `LOI` → Soạn lại → `CHO_DOC`.
- Cạnh MỚI (tô nổi): `CHO_DOC` → `LOI` «đọc tệp ném lỗi — AC-1»; `CHO_DOC` → `LOI` «không còn việc mở — lưới mồ côi, AC-2, ≤ 30 phút».
- Cạnh CŨ bị cắt (gạch đứt, ghi «hôm nay: kẹt mãi»): vòng `CHO_DOC` tự lặp «lease thử lại 3 lượt rồi việc bị cho nghỉ».
- AC liên quan: AC-1, AC-2, AC-3.
