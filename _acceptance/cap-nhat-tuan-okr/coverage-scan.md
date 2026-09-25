# Quét độ phủ AC — cap-nhat-tuan-okr

Preset: entity-feature (skill `morphological-scan`, 25/09/2026). Thực thể trung tâm: **lần cập nhật tuần của một KR**; bốn vật vệ tinh sống vì nó (nhắc, bình luận, theo dõi, quyền phụ trách).

## Ngữ cảnh

- Sản phẩm: CRM của OneHub — công cụ nội bộ, một workspace, bốn vai (`owner`, `admin`, `member`, `okr`). Chân sản phẩm: đào repo — `CONTEXT.md` mục Cập nhật tuần · Mức tự tin · Người phụ trách (OKR) · Nhắc buổi sáng · Trưởng đơn vị · Phạm vi dữ liệu [SUY-TỪ-REPO: CONTEXT.md]; `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 4» [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.md]; bản mẫu `ban-mau-okr/cap-nhat-tuan.tsx` và `du-lieu.ts` (`VIEC_CUA_TOI`: cập nhật · nhắc tên · im) [SUY-TỪ-REPO: apps/app/app/proto/_modules/ban-mau-okr/du-lieu.ts]; luật nhắc buổi sáng [SUY-TỪ-REPO: packages/db/src/onboarding-nhac.ts]; hộp chuyển việc [SUY-TỪ-REPO: apps/api/src/onboarding/onboarding-ghi.ts]; bảng OKR của lượt 3 [SUY-TỪ-REPO: packages/db/prisma/schema.prisma].
- Chân ngành: cập nhật KR kèm bình luận giải thích vì sao đổi, mức tự tin ghi theo thời gian trên dòng thời gian mục tiêu [NGÀNH: Perdoo — support.perdoo.com «Update Key Results and Initiatives», perdoo.com «OKR confidence levels»]; nghi thức cập nhật hằng tuần có mức tự tin so với tuần trước [NGÀNH: Weekdone — «The OKR weekly check-in»].

## Trục

- **Trục A — vật:** lần cập nhật | phiên cập nhật (mốc mở→gửi) | việc cần nhắc (loại việc OKR) | bình luận có nhắc tên | theo dõi mục tiêu | quyền phụ trách (khi người nghỉ)  [thước CE: câu «Trong phạm vi» của lộ trình mục 5 lượt 4 — năm gạch đầu dòng, mỗi gạch ≥1 vật; bảng lần cập nhật đủ năm cột lộ trình kê]
  - Vì sao độc lập: đổi vật không ép đổi lối vào hay người.
- **Trục B — lối vào:** màn «Cập nhật tuần» (tab) | tin nhắc buổi sáng (Zalo / Slack) | thẻ «việc của tôi» (Tổng quan đầy đủ · Tổng quan «chỉ OKR» · khối «Việc của tôi» ở Của tôi) | sheet mục tiêu (tab trao đổi, cập nhật một KR) | hộp chuyển việc ở Thành viên  [thước CE: ý định lượt 4 «tin nhắc … và thẻ … dẫn thẳng vào màn đó»; bản mẫu `cua-toi.tsx` `ViecCanLam`; `tong-quan-chi-okr.tsx`; `members-table.tsx`]
- **Trục C — người:** người phụ trách KR | trưởng đơn vị (phòng ban, bộ phận) | người được nhắc tên / người theo dõi | quản trị | vai «chỉ OKR» | người chưa nối kênh | người đã nghỉ  [thước CE: `WORKSPACE_ROLES`; `OkrAccessService`; `kenhSeDungCua` trả `kenh: null`; hồ sơ `vai-chi-okr`]
- **Trục D — thời gian:** ngày cập nhật của chu kỳ | các ngày còn lại của tuần | KR im ≥ N ngày | KR im ≥ N + 7 ngày (lên trưởng) | cửa sổ sự kiện một ngày (giao KR, nhắc tên, mục tiêu theo dõi có việc mới) | pha chu kỳ khoá / mục tiêu nháp hay đã bỏ  [thước CE: `OkrCycle.updateWeekday`; `NHAC` (giờ 08:30, `imSauNgay` 7, trần 10); lộ trình «KR im quá N ngày nhắc người phụ trách, rồi trưởng đơn vị»]
- Cross-cutting (không thành trục): khổ 390/1440, vi/en, `translate="no"`, ba trạng thái màn, một dòng vết OKR mỗi lần ghi, migration chỉ thêm, một tin mỗi người mỗi ngày.

## Không gian (A × B, lát C và D ở ô cần)

| Vật \ Lối vào | màn Cập nhật tuần | tin nhắc | thẻ việc của tôi | sheet mục tiêu | hộp chuyển việc |
|---|---|---|---|---|---|
| lần cập nhật | Core AC-1, AC-2, AC-4 | Later — trả lời tin để cập nhật (lượt 10) | — (thẻ dẫn vào màn) | Core AC-3, AC-10 (một KR, ghi hộ) | Core AC-12 (lịch sử giữ nguyên người ghi) |
| phiên cập nhật | Core AC-2 | — | — | Core AC-2 (cùng đường) | — |
| việc cần nhắc | — | Core AC-5, AC-6 | Core AC-7 | — | Core AC-12 (nhắc chuyển sang người nhận) |
| bình luận có nhắc tên | — | Core AC-6 (báo sáng hôm sau) | Core AC-7 | Core AC-9, AC-10 | Never — bình luận không có người phụ trách |
| theo dõi mục tiêu | — | Core AC-6 | Core AC-7 | Core AC-9, AC-10 | Never — theo dõi là của từng người |
| quyền phụ trách | — | — | — | — | Core AC-12 |

Lát C: người phụ trách (AC-1, AC-4) · trưởng đơn vị ghi hộ và nhận nhắc KR im (AC-3, AC-5) · người được nhắc tên, người theo dõi (AC-6, AC-9) · quản trị chuyển việc (AC-12) · vai «chỉ OKR» (AC-13) · người chưa nối kênh (AC-8) · người đã nghỉ (AC-12).
Lát D: ngày cập nhật và phần còn lại của tuần, KR im hai nấc, cửa sổ sự kiện (AC-5, AC-6); pha khoá, mục tiêu nháp/đã bỏ (AC-1).

## Core (≤ 20 % số ô có nghĩa của A × B × C × D; mỗi dòng gom một cụm ô)

1. Gửi lần cập nhật chỉ thêm, đọc lại từ DB, từ chối đủ loại — AC-1.
2. Số giây mở→gửi đo ở máy chủ, và hai câu truy vấn đường đo — AC-2.
3. Ghi hộ của trưởng đơn vị — AC-3.
4. Màn «Cập nhật tuần» đủ tám trạng thái bản mẫu, 390 — AC-4.
5. Loại việc OKR trong một tin buổi sáng: cập nhật tuần, KR im hai nấc — AC-5.
6. Báo được giao, được nhắc tên, mục tiêu theo dõi có việc mới — AC-6.
7. Thẻ «việc của tôi» cùng một hàm với tin nhắc, ba chỗ hiện — AC-7.
8. Người chưa nối kênh vẫn có thẻ và màn đầy đủ — AC-8.
9. Bình luận, nhắc tên, theo dõi qua API — AC-9; trên sheet — AC-10.
10. Chuyển KR và mục tiêu khi người nghỉ — AC-12.
11. Vai «chỉ OKR» thấy thẻ OKR mà không mở phạm vi đối tác — AC-13.
12. Số hiện tại của KR đang chạy chỉ đổi qua lần cập nhật (hộp thoại KR chỉ đọc, máy chủ từ chối) — AC-16, thêm tại Cổng Phạm vi 2026-09-25.

## Later

- Cập nhật bằng trả lời tin Zalo/Slack; cảnh báo KR đang trượt — lượt 10.
- Bảng họp tuần xếp theo thứ đáng bàn, heatmap, màn sức khoẻ đếm người chưa nối kênh — lượt 5.
- Sửa, xoá bình luận; phản ứng bằng biểu tượng; đính kèm tệp — chờ số dùng thật.
- Báo tức thì khi được nhắc tên — lượt 10 (trong chat), trái luật một tin buổi sáng nếu làm ở đây.
- Nhắc riêng cho người tham gia mục tiêu (không phụ trách KR) — «người tham gia không phải cập nhật tuần» (bản mẫu).

## Never

- Sửa hay xoá một lần cập nhật — từ điển: chỉ thêm.
- Máy chọn mức tự tin hay ghi số thay người — NG-05, từ điển «Mức tự tin».
- Tin thứ hai trong ngày — luật đã chốt.
- Danh sách người chưa cập nhật, xếp hạng người — lộ trình lượt 5 «theo KR, không liệt kê người»; NG-07.
- Chuyển mục tiêu cá nhân của người nghỉ sang người khác — mục tiêu cá nhân là của chính người đó.

## Cross-cutting áp mọi ô Core

- Ba trạng thái màn (rỗng · đang tải · lỗi có Thử lại), 390 không tràn ngang, `translate="no"` trên dữ liệu người nhập.
- Mỗi thủ tục ghi để lại một dòng vết OKR (`docs/api.md` mục OKR), không `Activity`.
- Migration chỉ thêm bảng; bảng mới liền cuối `schema.prisma`.
- Mọi ghi đọc lại từ DB (lộ trình mục 2).
