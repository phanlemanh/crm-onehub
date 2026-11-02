---
schema_version: 1
feature: "Trưởng đơn vị sửa tên, mô tả hay người phụ trách của một mục tiêu hoặc KR ngay trong ngăn đang xem, không mở ngăn sửa nào chồng lên"
slug: sua-tai-cho-muc-tieu-va-kr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [web]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-11-02
design_doc: docs/superpowers/specs/2026-11-01-sua-tai-cho-muc-tieu-va-kr-design.md
---

# Acceptance Contract: sua-tai-cho-muc-tieu-va-kr

## Context

Hàng SV9 của `docs/plan/lo-trinh-okr.json`, đợt `okr-ghi-trong-ngan-3010`, dãy K, đứng trên BK2. Ô cơ hội ký `build`.
Hôm nay sửa tên, «Vì sao» hay người phụ trách của mục tiêu phải mở `HopThoaiMucTieu` chồng lên ngăn; ngăn KR không có lối
sửa nào. Vòng này đưa ba trường ấy vào thân ngăn, sửa tại chỗ qua bảng kiểu trường như ngăn deal. Hạng T2.

Source input: hàng SV9 (`cau_giao`, `bat_khi`, `vi_sao`) · `opportunity.md` · `docs/design.md` mục «Ghi vào bản ghi: ngay
trong ngăn» và «Trường: một trường, một cách cư xử» · design doc.

Thuật ngữ: **ngăn mục tiêu** = `objective-sheet.tsx`; **ngăn KR** = `kr-sheet.tsx`. **Ô sửa tại chỗ** = một
`MoTaTruong` vẽ bằng `OTruongPhieu`: bấm để sửa, Enter hay rời ô thì lưu, Esc huỷ (ô nhiều dòng: Ctrl/⌘+Enter hay rời ô).
**«Mô tả» của mục tiêu** = `whyNow` («Vì sao»). **Lớp chồng** = mọi `Sheet` hay `Dialog` mở thêm ngoài chính ngăn.

## Criteria

- AC-1: Given ngăn mục tiêu người xem sửa được (`suaNoiDung` và chu kỳ ghi được), When sửa ô Tên rồi bấm Enter, Then gọi
  `okr.updateObjective` đúng một lần với `{ id, title }` (không trường nào khác), ngăn vẫn mở, đầu ngăn hiện tên mới, và
  không lớp chồng nào mở trong cả luồng.
- AC-2: Given cùng ngăn, When sửa ô Tên rồi rời ô, Then lưu như AC-1; When sửa rồi bấm Esc, Then không gọi lưu và ô trở
  về tên cũ.
- AC-3: Given mục tiêu có «Vì sao» rỗng, When ngăn mở, Then ô «Vì sao» vẫn hiện và sửa được; When nhập nhiều dòng rồi
  Ctrl/⌘+Enter, Then gọi `okr.updateObjective` với `{ id, whyNow }`.
- AC-4: Given ô Người phụ trách của mục tiêu, When chọn một thành viên khác, Then gọi `okr.updateObjective` với
  `{ id, ownerUserId }` và ô hiện tên người mới; người phụ trách hiện tại đã rời đơn vị vẫn hiện tên kèm nhãn «đã rời».
- AC-5 (cross-layer): Given ngăn KR của người có quyền sửa đơn vị, When sửa ô Tên KR rồi Enter, Then gọi `okr.updateKeyResult` với
  `{ id, title }`; When đổi Người phụ trách KR, Then gọi với `{ id, ownerUserId }`. Given người xem chỉ là chủ KR (không quyền
  đơn vị), Then ô Tên KR sửa được còn Người phụ trách KR chỉ đọc; And ở máy chủ thật, chủ KR không quyền đơn vị gọi
  `updateKeyResult({ id, title })` thì được còn `({ id, ownerUserId })` thì bị từ chối, và người có quyền sửa đơn vị gọi
  `updateObjective({ id, title })` thì được.
- AC-6: Given người xem không có quyền, hay mục tiêu đã bỏ, đang chờ duyệt, hay chu kỳ không ghi được, When ngăn mục tiêu
  hay ngăn KR mở, Then ba trường hiện chữ và không có ô sửa nào.
- AC-7: Given tên ngoài 3–200 ký tự hay «Vì sao» quá 500 ký tự, When lưu, Then không gọi máy chủ, báo câu độ dài bằng
  tiếng người dùng và ô trở về giá trị cũ; Given máy chủ từ chối lưu Người phụ trách bằng `BAD_REQUEST` (người không còn
  trong đơn vị), Then báo câu «không còn trong đội» của `loiLuuTruong`; Given mọi lỗi khác (`FORBIDDEN`, lỗi máy chủ, mất
  mạng) ở bất kỳ ô nào, Then báo «Chưa lưu được <tên ô>. Thử lại sau một lát.»; không câu nào là câu máy chủ, và ô hiện
  giá trị cũ.
- AC-8: Given lưu thành công ở ngăn mục tiêu hay ngăn KR, Then dữ liệu mục tiêu được làm mới (`cache.okr`) nên đầu ngăn mục
  tiêu, dòng KR trong bảng của ngăn mục tiêu và đầu ngăn KR hiện giá trị mới mà không tải lại trang; And «Sửa» ở menu vẫn mở hộp sửa cho các
  trường khác như cũ.
- AC-9: Given bản mẫu `/proto/sua-tai-cho-muc-tieu-va-kr`, Then ngăn mục tiêu và ngăn KR hiện bốn trạng thái — xem, đang
  sửa, đang lưu, lỗi lưu — ở khổ 1280 và 375, chữ dài xuống dòng không tràn, và ô sửa dùng cùng thành phần với ngăn deal.

## Coverage

Quét hai ngăn × ba trường (tên · «Vì sao» · người phụ trách; KR không có «Vì sao») × ba cách kết (Enter · rời ô · Esc) ×
bốn mức quyền (sửa đơn vị · chỉ chủ KR · không quyền · bị khoá vì trạng thái hay chu kỳ) × hai kết quả lưu (được · bị từ
chối). Thước CE: `bat_khi` của hàng SV9 [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json] và bảng «Ghi vào bản ghi» của
`docs/design.md`. Loại, người tham gia, số liệu KR là Later (vẫn ở hộp sửa).

## Đường đo

- Ngưỡng SỐNG của ô cơ hội: số đến từ bài DOM `apps/app/test/sua-tai-cho-okr.dom.tsx` (lời gọi mutation và DOM lớp chồng)
  và ảnh bản mẫu. AC-1, AC-2 bảo đảm «lưu khi rời ô hay Enter, Esc huỷ, không lớp chồng».

## Out of scope

- Dời loại, người tham gia, số liệu KR ra khỏi hộp sửa chồng lên ngăn — hộp sửa vẫn là nợ của lộ trình OKR.
- Sửa trường ở Sơ đồ, Của tôi hay bảng KR.
- Trường mô tả cho KR (lược đồ chưa có).

## Notes

- Vòng chạm `objective-sheet.tsx`, `kr-sheet.tsx` (vùng record-sheet của M5) — báo M5 trên #375.
