# Hình tại điểm quyết định — tro-ly-doc-kho (Cổng Phạm vi)

Kê từ artifact cuối S1: 10 dòng sổ chờ seal (4 do chủ kho chọn trong phiên), 2 dòng `[GIẢ ĐỊNH]`
ở Coverage, 0 finding gap-probe `human-gate1`, 1 quyết định còn mở (bộ câu đo của AC-15), 2 chỗ
lệch lộ trình (T2 → T3; trang lưu trữ thuộc lượt 3b).

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Đường đi một câu hỏi, CRM và Zalo, qua kiểm trích (sổ: subagent riêng, tab «Hỏi» qua taiLieu.hoi, Zalo tự nhận) | 5 bước nối tiếp, 2 nhánh rẽ (CRM / Zalo; nhận / bác / từ chối) | `luong-hoi` |
| Bộ câu đo của AC-15 — nguồn câu và nơi giữ (quyết định còn mở) | 3 nhánh nguồn × 3 nhánh nơi giữ | `bo-do` |
| T2 → T3 vì hai bảng mới | 1 bước | dưới ngưỡng: 1 bước, 0 nhánh |
| Không phép tính trên số trích | 1 luật | dưới ngưỡng: 1 bước, 0 nhánh |
| Vai «chỉ OKR» chưa hỏi được | 1 nhánh | dưới ngưỡng: 1 nhánh |
| Ô đặt «Xác minh đến ngày» | 2 bước | dưới ngưỡng: 2 bước, 0 nhánh |
| Chỉ lưu chữ câu từ chối, câu báo sai | 2 nhánh (lưu / xoá) | dưới ngưỡng ở mức một luật một dòng; đã nằm trong hình `luong-hoi` |
| `[GIẢ ĐỊNH]` agent gốc Zalo nhận đủ câu | — | đo bằng lượt Zalo của bộ câu đo; nằm trong hình `bo-do` |
| `[GIẢ ĐỊNH]` trần 20/ngày, 600/tháng | 1 số | dưới ngưỡng |

## Đề bài `luong-hoi`

- Loại hình: flowchart ngang hai làn (CRM trên, Zalo dưới), hội tụ ở `tro_ly_kho`.
- Nút: Tab «Hỏi» → `taiLieu.hoi` (ghi hàng «đang hỏi» + việc) → agent gốc (kho) → `tro_ly_kho` (khoá kho · ZDR · 3 tool) → `search_pages` / `read_page` (chỉ bản đang dùng) → `nop_tra_loi` → mã kiểm (chuỗi con sau NFC · phiên bản đang dùng · số có biên trong đoạn của chính câu) → nhận: hàng «đã trả lời», xoá chữ câu hỏi / bác tới trần hoặc «không biết»: câu từ chối cố định, giữ chữ câu hỏi, vào hàng «chưa trả lời được» → câu trả lời dựng bằng mã → tab «Hỏi» hoặc tin Zalo.
- Làn Zalo: tin của người đã nối → agent gốc (zalo) tự nhận câu quy định → hook tạo hàng Zalo trước bước model đầu → hội tụ.
- Nhãn bằng chữ Việt, «trợ lý AI» không «tác nhân». Ghi chú dưới: agent gốc không thấy chữ trang.
- AC: AC-1, 2, 3, 4, 7, 8, 9, 12.

## Đề bài `bo-do`

- Loại hình: ma trận lựa chọn (morphological box) hai hàng: «Nguồn câu» × «Nơi giữ», ô khuyên tô đậm.
- Hàng Nguồn câu: A chủ kho gom 50 câu thật (lộ trình) · B mầm tạm máy soạn từ trang mẫu của kho đo, nhãn «tạm» · C ghép A + B · D tách AC-15 khỏi lượt, chạy trong tuần đầu chạy thật.
- Hàng Nơi giữ: (i) tệp ngoài kho trên máy chủ kho, chủ kho tự chạy script · (ii) bí mật GitHub + workflow chạy tay, log chỉ in tổng · (iii) trong git, không niêm phong.
- Mỗi ô một dòng đánh đổi: thời gian chủ kho, độ thật, máy có đọc được đáp án không, chặn merge hay không.
- Khuyến nghị (đánh dấu): B cho S4 lượt này (trong git, nhãn tạm, chỉ đo cơ chế và từ chối) + A gom song song, chạy lần đầu tuần 1 chạy thật trên trang thật, giữ ở (i).
- AC: AC-15.
