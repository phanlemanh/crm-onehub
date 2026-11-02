---
schema_version: 1
feature: "Người phụ trách KR đính một đường dẫn bằng chứng ngay trong ngăn KR, ở một chỗ duy nhất, và thấy nó trong danh sách bằng chứng của KR"
slug: bang-chung-kr-mot-loi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [web]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-11-02
design_doc: docs/superpowers/specs/2026-11-02-bang-chung-kr-mot-loi-design.md
---

# Acceptance Contract: bang-chung-kr-mot-loi

## Context

Hàng SV10 của `docs/plan/lo-trinh-okr.json`, đợt `okr-ghi-trong-ngan-3010`, dãy K, đứng trên SV8 và BK2. Ô cơ hội ký
`build`. Hôm nay bằng chứng của KR vào bằng hai lối: hộp thoại `HopThoaiDinh` mở từ thẻ Bằng chứng của ngăn KR, và một ô
đường dẫn tự dựng trong khối cập nhật của KR mốc. Vòng này đổi hộp thoại thành dòng nhập tại chỗ cuối danh sách và cho hai
chỗ dùng chung một ô đường dẫn. Hạng T2, máy chủ không đổi.

Source input: hàng SV10 (`cau_giao`, `bat_khi`, `vi_sao`) · `opportunity.md` · `docs/design.md` mục «Ghi vào bản ghi:
ngay trong ngăn» · design doc.

Thuật ngữ: **ngăn KR** = `record-sheet/kr-sheet.tsx`; **phần Bằng chứng** = `KrBangChung` (`kr-bang-chung.tsx`);
**khối cập nhật** = `KhoiCapNhatKr` (`khoi-cap-nhat-kr.tsx`); **dòng nhập** = khối nhập tại chỗ cuối danh sách bằng chứng
(dấu `data-hop-dinh-bang-chung`); **ô đường dẫn** = thành phần dùng chung `ODuongDanBangChung`; **lớp chồng** = mọi
`Dialog` hay `Sheet` mở thêm ngoài chính ngăn.

## Criteria

- AC-1: Given ngăn KR của một KR mốc đã xong và người xem sửa được KR (KR không khoá, không chờ duyệt), When bấm «Đính
  bằng chứng», Then dòng nhập hiện ngay trong phần Bằng chứng (cuối danh sách, hay trong khối rỗng khi chưa có bằng chứng)
  với tiêu điểm ở ô đường dẫn, và số lớp chồng (`[role="dialog"]` ngoài ngăn) không tăng.
- AC-2: Given dòng nhập đang mở, When dán một đường dẫn hợp lệ, gõ ghi chú tuỳ chọn rồi Enter ở ô đường dẫn (hoặc bấm
  «Đính», hoặc Ctrl/⌘+Enter ở ô ghi chú), Then gọi `okr.themBangChung` đúng một lần với `{ keyResultId, url, ghiChu }`,
  dòng nhập đóng, ngăn vẫn mở, và bằng chứng mới (tên miền) hiện trong danh sách mà không tải lại trang.
- AC-3: Given dòng nhập đang mở, When bấm Esc hoặc «Huỷ», Then không gọi máy chủ và dòng nhập đóng; Given đã gõ dở,
  When đóng ngăn hay chuyển ‹ › sang KR khác, Then bộ giữ thay đổi hỏi lại trước khi bỏ bản nháp.
- AC-4: Given đường dẫn không bắt đầu bằng http:// hay https://, Then dưới ô hiện câu `loiDuongDan`, «Đính» khoá và Enter
  không gọi máy chủ; Given ghi chú quá `OKR_CANH_KR.ghiChu.max` ký tự, Then hiện câu `loiGhiChu` và không gọi; Given máy
  chủ từ chối hay mất mạng, Then dưới ô đường dẫn hiện «Chưa đính được bằng chứng. Thử lại sau một lát.», dòng nhập còn
  mở với đúng giá trị đã gõ, và không câu nào là câu máy chủ.
- AC-5: Given khối cập nhật của KR mốc và người dùng chọn «Xong», Then ô bằng chứng là chính `ODuongDanBangChung` (cùng
  nhãn, cùng gợi ý, cùng câu lỗi với dòng nhập); When gửi cập nhật với một đường dẫn hợp lệ, Then `okr.guiCapNhat` nhận
  `bangChung: { url, ghiChu: "" }` như trước; đường dẫn sai thì không gửi.
- AC-6: Given người xem không sửa được KR, hoặc KR khoá, hoặc mục tiêu đang chờ duyệt, When phần Bằng chứng mở, Then
  không có nút «Đính bằng chứng» và không có dòng nhập; Given KR mốc chưa xong, Then nút khoá và câu vì sao hiện như nay.
- AC-7: Given cây sau vòng, Then `kr-bang-chung.tsx` không còn nhập `Dialog`, khối cập nhật không còn ô đường dẫn tự
  dựng, ngoại lệ của `kr-bang-chung.tsx` trong `design/patterns/ngan-ban-ghi.md` chỉ còn `Spinner` (danh sách ghim
  `NGOAI_LE_MONG` và ca `sheet-dialog` của `apps/app/test/khung-ngan.spec.ts` sửa theo: còn hai tệp `Dialog` thô), `bun run
  lint:slop` không có dòng nào của `onehub(ngan-trong-khung)` hay `onehub(khong-ve-tay)`, và `khung-ngan.spec.ts` xanh;
  And một bản sao `kr-bang-chung.tsx` nhập lại `Dialog` thì `lint:slop` đỏ với thông điệp `khoiCam` gọi tên tệp.
- AC-8 (cross-layer): Given máy chủ thật trong phiên đo, When đính một đường dẫn từ dòng nhập, Then `okrBangChung` của KR
  có đúng một hàng mang đường dẫn đã gõ; And thước đã ký E11/E12 của `canh-kr-okr` (`man-canh-kr.mjs`) chạy xanh trên cây
  này mà không sửa thước.
- AC-9: Given bản mẫu `/proto/bang-chung-kr-mot-loi`, Then phần Bằng chứng hiện sáu trạng thái — rỗng, đang nhập, đường
  dẫn sai, đang đính, lỗi máy chủ, có bằng chứng — và khối cập nhật KR mốc chọn Xong, ở khổ 1280 và 375, chữ dài xuống
  dòng không tràn, dòng nhập không phải lớp chồng.

## Coverage

Quét hai lối vào (dòng nhập · khối cập nhật KR mốc) × bốn cách kết (Enter · nút «Đính» · Ctrl/⌘+Enter · Esc/Huỷ) × bốn kết
quả (đính được · đường dẫn sai · ghi chú quá dài · máy chủ từ chối) × ba mức quyền (sửa được · chỉ đọc hay khoá · mốc chưa
xong). Thước CE: `bat_khi` của hàng SV10 [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json] và bảng «Ghi vào bản ghi» của
`docs/design.md`. Sửa bằng chứng đã có, đính nhiều đường dẫn một lần, bằng chứng cho KR không phải mốc là Later.

## Đường đo

- Ngưỡng SỐNG của ô cơ hội: số đến từ bài DOM `apps/app/test/bang-chung-mot-loi.dom.tsx` (lời gọi mutation, DOM lớp
  chồng, cùng thành phần ô ở hai chỗ) và ảnh bản mẫu. AC-1, AC-2, AC-5 bảo đảm «không Dialog nào mở, bằng chứng hiện ngay,
  khối cập nhật của KR mốc dùng cùng ô đó».

## Out of scope

- Đổi luật «chỉ đính khi mốc đã xong».
- Sửa hay đính lại một bằng chứng đã có; đính nhiều đường dẫn một lần.
- Bằng chứng cho KR không phải mốc.

## Notes

- Vòng chạm `kr-bang-chung.tsx`, `khoi-cap-nhat-kr.tsx` (vùng record-sheet của M5) — báo M5 trên #375.
- Vòng sửa `design/patterns/ngan-ban-ghi.md` và `apps/app/test/khung-ngan.spec.ts`, nằm trong `paths` của hai hồ sơ
  `khung-chung-ngan-ban-ghi` (đã ký) và `rang-giu-khung-ngan` (máy thông): hai hồ sơ ấy cần ghim lại khi gộp. Thước của
  chúng không đổi nghĩa — chỉ một khoản nợ đã ghi «chờ dời sang khối soạn trong ngăn» được trả.
