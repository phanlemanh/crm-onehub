# Ngưỡng giá trị cho hồ sơ có mặt giao diện — thiết kế (F39)

Hàng F39 của `docs/plan/lo-trinh-okr.json`, đợt `don-dep-3110`, dãy D. Hồ sơ `_acceptance/nguong-gia-tri-mat-giao-dien/`.

## Hiện trạng (đo 31/10, onehub ed4e85288)

`start-scan` của kit: 67 hồ sơ mang cờ `nguong-chua-chot`; 51 có mặt người dùng cuối (khớp từng tên với ranh giới F39).
Kit bật cờ khi `thresholdState` khác `chot`, tức cả khi còn ô trống lẫn khi ô còn nhãn `[đề xuất]`.

| Nhóm | Số hồ sơ | Việc |
|---|---|---|
| Trống cả bốn ô | 29 | máy soạn bốn ô |
| Thiếu một phần | 9 | máy soạn ô thiếu |
| Đủ chữ, còn nhãn | 13 | chỉ chờ người chốt |
| Viết sai khuôn (nhãn «SỐNG:», dòng thụt, nhãn sau `[đề xuất]`, thiếu cả mục) | 8 (nằm trong các nhóm trên) | chuẩn hoá cơ học: chép nguyên văn, giữ nhãn cũ |
| Ô do kit tự sinh «đã đạt «X» chưa?» (X là tiêu chí dựng) | 8 | máy soạn lại thành ngưỡng giá trị, vẫn `[đề xuất]` |
| Timebox đã qua (6) hay không ra ngày (11) | 17 | Hỏi-4: đổi sang mốc B7 |

## Ba điều giám sát dặn kiểm

1. **Chồng hồ sơ.** 5 hồ sơ trùng nhánh `dot-2`: go-tin-hieu-rac, lo-trinh-nhieu-san-pham, thong-bao-mot-nguon-nhieu-kenh,
   trang-thai-tin-hieu-song (dot-2 chỉ sửa `decisions.jsonl` — không chồng tệp), và va-lo-ro-vai-chi-okr (dot-2 sửa dòng
   Timebox của `opportunity.md`, F39 bỏ nhãn ba dòng ngay cạnh → F39 gộp sau dot-2). 1 hồ sơ trùng #602
   (tieu-diem-sau-hop-xoa-tin-hieu) — #602 đã ở onehub, nhánh F39 cắt từ đó. 4 hồ sơ trùng F38 (cay-can-chinh-co-ly-do,
   cho-tac-nhan-lau, hoi-dap-okr, quyet-gop-y-noi-dung-ly-do) — F38 sửa `evals.yaml`, F39 sửa `opportunity.md`: không chồng tệp.
2. **Ghim lại.** Thử trên bản sao: sửa Timebox của gon-dau-trang-lay-y-kien rồi chạy pre-merge-check → «VIOLATION
   [gon-dau-trang-lay-y-kien]: evidence is stale». Sửa `opportunity.md` của hồ sơ đã ký kéo ghim lại → 51 hồ sơ đi chung
   một lượt ghim sau F37 với F38 và dot-2.
3. **Ngưỡng là chữ quyết của người.** Máy soạn bảng đề xuất (`bang-de-xuat.md`), mọi ô máy ghi mang `[đề xuất]` tới khi
   người chốt; AC-3 chặn máy tự bỏ nhãn.

## Lựa chọn

- **Nguồn số**: `docs/telemetry.md` chỉ có số cấp bản cài (`install_daily`, `api_error`), không có sự kiện từng màn. Ngưỡng
  lấy từ phiên nghiệm thu có số người (thường 3–5), truy vấn bảng có thật, hay nhật ký. Ba tác tử soạn đọc hợp đồng
  và ô cơ hội của từng hồ sơ; mỗi dòng bảng mang nguồn số và căn cứ.
- **Timebox chung**: «2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)», cùng mốc B7 chủ kho đồng ý.
- **Chuẩn hoá khuôn, không soạn lại**: bộ đọc rộng (`rang/chung.mjs` `docRong`) đọc chữ cũ ở mọi kiểu sai khuôn rồi chép
  nguyên văn vào đúng nhãn, giữ nhãn cũ. Phản biện 31/10 chứng bản soạn lại làm mất vế cũ và thêm ngưỡng mới; ô chủ kho
  đã duyệt (okr-cua-toi-tach-theo-doi, okr-loai-hoc-tap 08/10) vẫn ở trạng thái đã duyệt.
- **Chốt bằng dòng sổ, bỏ nhãn bằng công cụ**: `rang/bo-nhan.mjs` chỉ bỏ nhãn ở hồ sơ có dòng `chot_nguong` mang tên người.
  Thử trên bản sao: chốt «*» rồi bỏ nhãn → `start-scan` còn 0 hồ sơ có mặt người dùng mang cờ.
- **Không nới bộ đọc của kit** cho nhãn rút gọn — chuẩn hoá chữ ở hồ sơ.

## Câu cho người (Cổng Phạm vi)

- Hỏi-1: chốt bảng ngay ở Cổng Phạm vi, hay ghi `[đề xuất]` rồi chốt ở Cổng Bằng chứng (luật 41).
- Hỏi-2: loc-don-vi-khong-tu-dong — sổ cũ cố ý để trống ngưỡng (d-20261021T091517Z-7).
- Hỏi-3: lo-trinh-ten-va-build — chủ kho ghi «Không đo bằng người dùng»; kit không nhận «không đo được» ở hồ sơ có mặt người dùng.
- Hỏi-4: 17 timebox đã qua hay không ra ngày — đổi sang mốc B7 hay ghi miễn.
