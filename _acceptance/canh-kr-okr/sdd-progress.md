# SDD ledger — plan: docs/superpowers/plans/2026-09-28-canh-kr-okr.md

Spec: docs/superpowers/specs/2026-09-28-canh-kr-okr-design.md (đọc được). Hợp đồng: _acceptance/canh-kr-okr/contract.md (approved).

## Pre-flight scan

| Cặp / việc | Sản xuất ↔ tiêu thụ | Thấy gì |
|---|---|---|
| 1 ↔ 3–7, 12 | khuôn `okr-canh-kr`, `okr-mau`, 10 hành động vết ↔ dịch vụ, bộ mẫu | khớp tên (`themViecInput`, `mauNoiDung`, `parseMauNoiDung`, `bangChungVao`) |
| 2 ↔ 3–8, 12 | sáu model ↔ dịch vụ, xoá bộ mẫu | khớp tên model và trường |
| 3 ↔ 4–8 | `OkrCanhKrService`, `okr-canh-kr.contracts.ts`, router, config ↔ các việc sau thêm vào cùng tệp | cùng tệp, tuần tự |
| 4 ↔ 9 | `LienKet` (thêm `chua-chay` ở S2) ↔ khung KR | 9 phải đọc kiểu có `chua-chay` |
| 5 ↔ 9 | `guiCapNhatInput.bangChung?` ↔ ô bằng chứng hộp thoại cập nhật | khớp |
| 6 ↔ 10 | `commentsOutput.dong` ↔ tab Trao đổi | khớp |
| 7 ↔ 11 | `okr.mau`, `taoTuMau` ↔ Cài đặt, hộp thoại đặt mục tiêu | khớp |
| 8 ↔ 3 | `removeKeyResult` xoá việc ↔ bảng `okrViecKr` | khớp |
| 9 | sửa `okr.service.ts` (`objective` trả số việc) trong việc màn | tự nhất quán; máy chủ nhỏ đi kèm màn — chấp nhận |
| 12 ↔ M | `cong-ty.json`, `nap.ts` của M ↔ khuôn việc 1 | M đã gộp (#186), tệp có đủ |
| 13 ↔ tất cả | phép đo đọc mọi thứ | chạy cuối |
| Mỗi việc 1–13 | bài viết trước ↔ mã viết sau | không thấy việc nào tự mâu thuẫn; việc 2 dòng Verify đã sửa lỗi gõ `migration-chi-them` |

- Ruling: chạy việc 1 và 2 tuần tự, không song song — kỹ năng cấm hai tác tử cài song song trên một cây — mất ~10 phút nếu sai.
- Ruling: `canhKr` trả `LienKet` có thêm trạng thái `chua-chay` (sổ quyết định S2, chiến dịch DRAFT) — thiết kế đã sửa theo — nếu sai chỉ thêm một nhãn thừa.

## Tiến độ
Task 1: complete (commits 1cb8c607..855c740a, review clean)
Task 1: minor (deferred): okr-mau.ts:25 — mauKr trả mã LoiSoTheoKieu thô trong message; việc 7/11 phải dịch qua T.soTheoKieu / chữ màn trước khi hiện
Task 1: minor (deferred): mauKr.title dùng trần OKR_MAU.cauMucTieu.max (200) — brief không nêu trần riêng
Task 2: complete (commits 855c740a..626ec75f, review clean; controller chạy lại thước: xanh + chiều đỏ exit 1)
Task 2: minor (deferred): migration-chi-them.mjs:126 — chuỗi chẩn đoán DROP luôn mở đầu «DROP INDEX» kể cả DROP TABLE (chỉ là chữ)
Controller: 3aca20e4 — sửa lint:slop ở dữ liệu bản mẫu S1 (DEM_VIEC thành Map); không thuộc việc nào của kế hoạch
Task 3: review — Important: bài viec-doc-canh phụ thuộc ngày thật (đỏ từ 21/11); đang fix round 1
Task 3: minor (deferred): vết chỉ lọc bốn hành động nên không chứng «đúng năm dòng»; ca người làm không phải thành viên dùng mã không tồn tại; suaViec/danhDauViec kiểm loại trước quyền (400 thay 403); ghi không đổi gì vẫn để vết; ô 403 sua/danh-dau chỉ đếm hàng
- Ruling: gỡ sáng kiến (goViec trên hàng chien-dich/ke-hoach) chỉ cần ghiDuocKr, không cần ganDuoc — gỡ không đọc dữ liệu đối tác — nếu sai: người vai «chỉ OKR» phụ trách KR gỡ được liên kết mình không thấy tên
Task 3: fix round 1/5 (2 addressed, 0 open — ngày thật trong viec-doc-canh; timeout afterAll; commits 0b9cc665)
Task 3: complete (commits 626ec75f..0b9cc665, review clean)
Task 4: implementer DONE (f6ac4695, eba1625f). Carry to 5–8: mọi thủ tục okr.* mới phải thêm vào THU_TUC_CANH_KR và DAU_VAO_HOP_LE ở vai-chi-okr.spec; hành động vết nào mang ảnh sáng kiến phải vào HANH_DONG_SANG_KIEN (canh-kr.ts)
Task 4: review — Important: E3 thiếu ca gắn cùng chiến dịch hai lần; lệch: E3 gắn bằng T. Fix round 1 đang chạy
Task 4: minor (deferred): cột RUNNING/tenPhuTrachC của bảng rò không bao giờ đỏ (trạng thái được canh bởi kiểm hình dạng); dọn test không xoá công ty/kế hoạch gieo; ép kiểu unknown trong vai-chi-okr.spec; thân test ~300 dòng
Task 4: fix round 1/5 (2 addressed, 1 open — đóng kế hoạch còn ghi thẳng DB dù có onboarding.closePlan; commits 00a22915)
Task 4: minor (deferred): vai-chi-okr.spec E4 tạo kế hoạch bằng db.onboardingPlan.create (E4 không đòi thủ tục thật)
Task 4: fix round 2/5 (1 addressed, 0 open — đóng kế hoạch qua onboarding.closePlan; commits 65a1545d)
Task 4: complete (commits 0b9cc665..65a1545d, review clean)
Task 5: implementer bị ngắt vì lỗi mạng API (ENOTFOUND) giữa chừng, chưa commit; đã gọi lại cùng tác tử để làm nốt
Task 5: implementer DONE (79202435). Ghi chú: docs/api.md mục OKR chưa có đoạn cho việc, sáng kiến, bằng chứng, ghi nhận, mẫu — thêm ở việc 13 hoặc đợt sửa cuối
Task 5: review — Important: cổng «xong» dùng m.value thay giaTri (KR mốc nguồn máy); thiếu timeout 30 s ở ba bài; E5 thiếu ca ghi chú 301 ký tự. Fix round 1 đang chạy
Task 5: minor (deferred): ghiBangChung tính lại quyen mỗi mục; themBangChung hai truy vấn KR; guiCapNhat dựa cổng pha riêng thay vì assertKyGhiDuoc (hiện an toàn)
Task 5: fix round 1/5 (3 addressed, 0 open — cổng xong theo giaTri; timeout 30 s; ca ghi chú 301; commits d0bf4751)
Task 5: complete (commits 65a1545d..d0bf4751, review clean)
Task 6: CHƯA BẮT ĐẦU — lần giao đầu bị người dừng để bàn giao sang máy khác (2026-09-28); chỉnh sửa dở ở okr-canh-kr-san.ts đã bỏ. Chạy lại từ đầu.
