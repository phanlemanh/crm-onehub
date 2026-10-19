# Quét phủ — viec-rieng-chi-nguoi-trong-cuoc (DA11)

Preset `entity-feature`, thực thể Việc, 19/10/2026.

## Ngữ cảnh

- Sản phẩm: CRM OneHub, màn Việc–Dự án.
- Chân sản phẩm (đào kho):
  - mục «Việc» và «Dự án» của `CONTEXT.md`;
  - `dieuKienXemViec` [SUY-TỪ-REPO: packages/db/src/viec.ts];
  - lượt tự lái DA4 [SUY-TỪ-REPO: _acceptance/du-an-gantt/evidence/tu-lai/PHAN-TICH.md];
  - bản quét đường đọc việc ngày 19/10 (ghi chú chung của đợt, `da11-viec-rieng-quet-duong-doc.md`).
- Chân ngành:
  - [NGÀNH: Asana — việc riêng tư chỉ người cộng tác thấy; việc trong dự án thì người của dự án thấy], theo khảo sát [SUY-TỪ-REPO: docs/plan/viec-du-an-nghien-cuu/05-phan-quyen-va-muc-tieu.md];
  - [NGÀNH: Dataverse — bẫy lộ tên bản ghi chính; khảo sát rút ra luật «một bản ghi bạn không có quyền xem»] (cùng tệp, mục P3 ý 3).

## Trục

- **A — Loại việc theo luật thấy:** riêng (không gắn bản ghi, không dự án) · trong dự án không gắn bản ghi · gắn bản ghi không dự án · gắn bản ghi trong dự án. [thước CE: ba vế OR của `dieuKienXemViec`; P3 ý 1 của khảo sát]
- **B — Người xem:** người giao · người thực hiện · người theo dõi · thành viên không trong cuộc · quản trị · vai «chỉ OKR». [thước CE: bảng 5 người × 7 đường của `apps/api/test/viec-quyen.spec.ts`; CONTEXT.md mục «Việc»]
- **C — Mặt lộ:**
  - khung việc (ô «Gắn với», dòng dưới tiêu đề);
  - lịch sử việc (vết nhắc việc khác: thêm/gỡ phụ thuộc, tự dời «vì …», thêm việc con);
  - màn dự án (Gantt, Danh sách/Bảng phạm vi dự án, Tất cả dự án và các con số tổng);
  - lệnh đếm production.

  [thước CE: bản quét đường đọc 19/10]
- **D — Lúc đổi loại:** tạo · đưa vào dự án · rút khỏi dự án · gắn/gỡ bản ghi · xoá việc được nhắc. [thước CE: các vết `doi-du-an`, `gan`, `go` của `vetViec`]

## Core

1. Khung việc × A (4 loại) × B (người đọc được): chữ khớp với việc người không trong cuộc đọc được hay không → AC-1, AC-2.
2. Khung việc × D (đưa vào dự án / rút ra) → AC-3.
3. Lịch sử việc × ba loại vết nhắc việc khác × người không xem được việc được nhắc → AC-4, AC-5, AC-6, AC-7.
4. Màn dự án × việc vừa rút ra thành riêng → AC-8.
5. Định nghĩa trong từ điển → AC-9.
6. Lệnh đếm production → AC-10.

## Later

- Vai «chỉ OKR» thấy khung việc: lượt này họ chưa dùng Việc (CONTEXT.md). Ma trận AC-1 chỉ khẳng định họ không đọc được.
- Gắn/gỡ bản ghi làm việc đổi loại riêng ↔ đối tác: DA1 đã đo (viec-quyen.spec). Ở đây chỉ đo chữ trên khung cho loại có bản ghi (AC-1, AC-2).
- Lịch sử dự án (`DuAnVet` `them-viec`/`bot-viec`): đang lưu tiêu đề nhưng chưa có màn nào đọc. Khi thêm bên đọc thì phải che như AC-4.
- Các câu lỗi và dữ liệu `daDoi` nhắc tiêu đề việc khác (`vong`, `batDauTruocViecCho`): mọi việc được nhắc cùng dự án nên đều thấy được theo luật A. Chỉ lộ nếu đổi sang B.

## Never

- Lọc Gantt và con số dự án theo người xem (lối B): chủ kho chọn A ngày 19/10.
- Sửa vết đã lưu (xoá tiêu đề trong cơ sở dữ liệu): người trong cuộc mất lịch sử của chính họ, và không đảo được.

## Cross-cutting áp mọi ô Core

- Mỗi phép đo có đối chứng dương trên cùng fixture (người trong cuộc vẫn thấy) và chiều đỏ ghim lời.
- Dữ liệu dựng qua đường ghi thật (caller tRPC với phiên người thật), không chèn bảng.
