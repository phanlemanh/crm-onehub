# Quét độ phủ — ngăn hồ sơ trong trang Lộ trình

Preset: `entity-feature` (thực thể: một việc đã giao trên lộ trình, nhìn qua dải tóm tắt hồ sơ của nó),
chỉnh cho ngăn chỉ đọc.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub — chân sản phẩm: đào repo (`CONTEXT.md`,
  `packages/validation/src/vai-workspace.ts`, `apps/app/components/lo-trinh/ho-so-viec.tsx`) và đặc tả khối
  của kho kit (`skills/acceptance/references/lo-trinh-du-lieu.md` ở kit `7f65e5a0`) · chân ngành: ngăn chi
  tiết một việc của Linear (mở cạnh danh sách: trạng thái, chu kỳ, dự án, PR gắn kèm) và trang PR của GitHub
  (đã gộp chưa, ai duyệt, kiểm tra nào đã chạy).

## Trục

- **A — Dải của việc:** dải đủ | dải có ô vắng | việc không có dải | khối bản 1 (mọi dải vắng) | khối mới
  hơn bản 2 | dải sai kiểu
  [thước CE: bảng «Đọc khoan dung» bản 2 của đặc tả khối kit + đếm trên bản vẽ thật: 81 việc có dải, 5 việc
  đã giao không dải, 12 ô «sẽ đo gì» vắng, 14 ô lượt chấm/token vắng; SUY-TỪ-REPO: đặc tả kit `7f65e5a0`]
- **B — Người xem:** `owner` | `admin` | `member` | `okr` (vai chỉ OKR)
  [thước CE: `WORKSPACE_ROLES` trong `packages/validation/src/vai-workspace.ts`; SUY-TỪ-REPO]
- **C — Câu người xem hỏi:** vì sao làm | đã lên chưa | sẽ đo gì, khi nào | kết quả ra sao | còn thiếu gì
  | ai quyết | (chủ kho) đo kỹ cỡ nào, tốn bao nhiêu, máy hay người quyết, PR nào
  [thước CE: câu giao và ghi chú hàng LT1b + chín ô và bảy con số của đặc tả khối + NGÀNH: Linear, GitHub]

Cắt ngang: khổ màn (máy tính 1280, điện thoại 375) · hai ngôn ngữ giao diện (nhãn dịch, chữ của dải
không dịch) · nền sáng/tối · mọi đường vào ngăn (Bảng, Bảng cột, Mốc, việc liên quan) dùng chung một ngăn.

## Core

1. A{dải đủ} × B{mọi vai} × C{năm câu} — tầng mọi người: các ô của dải hiện đúng chữ và đúng thứ tự của
   khối, so từng việc của bản vẽ thật.
2. A{dải đủ} × B{owner} × C{chủ kho} — bảy con số, mã commit đã chấm và đường tìm PR.
3. A{dải đủ} × B{admin, member, okr} × C{chủ kho} — không thấy tầng chủ kho, và dữ liệu tầng đó không có
   trong trang gửi xuống trình duyệt của họ.
4. A{ô vắng} — ô hiện «chưa có», không bỏ dòng, không tự tính.
5. A{không dải} — ngăn nói việc này chưa có tóm tắt hồ sơ; phần còn lại của ngăn như LT1.
6. A{khối bản 1} — mọi việc «chưa có tóm tắt», không băng cảnh báo cả trang; trang như LT1.
7. A{khối mới hơn} — băng cảnh báo khuôn mới như LT1, dải vẫn đọc phần biết.
8. A{dải sai kiểu} — trang báo khối hỏng kèm chỗ hỏng, không nuốt thành «chưa có».
9. C{năm câu} × khổ{1280, 375} — năm câu nằm trên đầu thân ngăn, đọc được trong một phút.
10. Bộ đọc là bản chép nguyên hàm `docDuLieu` bản 2 của kit; không mã nào đọc hồ sơ hay tệp kế hoạch.

## Later

- Thu gọn đoạn dài («vì sao» quá 400 ký tự ở 31/81 việc) — chờ số đo phiên nghiệm thu; chữ cụt và chữ dài
  là việc của kit (chip đã mở).
- Tầng chủ kho cho vai `admin` — chủ kho chốt sau nếu cần.
- Số lần gọi người của một vòng — kit chưa có máy đếm (đặc tả khối).
- Số PR và liên kết thẳng tới PR (NGÀNH: Linear gắn PR vào việc) — khối cố ý không mang số PR.

## Never

- Tự suy «đã lên production» từ chữ trạng thái — nguồn sự thật thứ hai; kit sửa ô của mình.
- Viết lại, cắt hay dịch chữ của dải.
- Đọc hồ sơ nghiệm thu hay tệp kế hoạch từ CRM.
- Hiện token, lượt chấm cho mọi vai — tầng chủ kho là chủ ý của hàng.

## Cắt ngang áp mọi ô Core

- Khổ 1280 và 375; nền sáng và tối.
- Nhãn có bản tiếng Anh và tiếng Việt; chữ của dải mang dấu không dịch.
- Mọi đường vào mở cùng một ngăn; ngăn đóng trả chỗ đứng như LT1.

## Giả định chờ gạch ở Cổng Phạm vi

- [GIẢ ĐỊNH] «Vai chủ kho» trong CRM là vai `owner` của không gian làm việc, và ở OneHub vai đó là chủ kho.
- [GIẢ ĐỊNH] Đường tìm PR bằng ô tìm của GitHub theo mã commit là đủ cho chủ kho (không cần số PR).
