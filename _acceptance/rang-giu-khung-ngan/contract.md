---
schema_version: 1
feature: "Một ngăn bản ghi dựng ngoài khung chung làm bài kiểm của kho đỏ và gọi đúng tên tệp, còn vòng chạm ngăn bản ghi có ảnh ngăn mới đặt cạnh ngăn deal"
slug: rang-giu-khung-ngan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-11-01-rang-giu-khung-ngan-design.md
veto_state: mo
veto_opened_at: 2026-11-01T05:50:00Z
---

# Acceptance Contract: rang-giu-khung-ngan

## Context

Hàng BK2 của `docs/plan/lo-trinh-okr.json` (gộp BK4), đợt `ban-do-khuon-3010`, dãy K, đứng trên BK1 (#611). Ô cơ hội ký
`build` ngày 31/10. BK1 đưa bảy ngăn vào `RecordSheetFrame` và ghi khuôn `design/patterns/ngan-ban-ghi.md`, nhưng không
bài nào của kho đỏ khi ngăn mới thoát khung. Vòng này thêm một luật oxlint và một bài quét, cả hai đọc danh sách từ
frontmatter của khuôn. Hạng T2: chỉ thêm luật, bài kiểm, tài liệu.

Source input: hàng BK2 (`cau_giao`, `bat_khi`, `ghi_chu`, tiêu chí cộng 31/10) · `opportunity.md` · luật 34 của
`docs/plan/dot-ban-do-khuon-3010/LUAT-rieng.md` · design doc.

Thuật ngữ: **khuôn** = `design/patterns/ngan-ban-ghi.md`. **Luật** = `onehub/ngan-trong-khung`. **Bài** =
`apps/app/test/khung-ngan.spec.ts`. **Thư mục ngăn** = `apps/app/components/crm/record-sheet/`. **Khối cấm** = một tên
trong `cam_ngoai_khuon` của khuôn; khối có trong `cam_ho` cấm cả **họ** của nó (tên bắt đầu bằng tên khối rồi một chữ
hoa). **Dòng ngoại lệ** = một mục của `ngoai_le`: một tệp, một hay nhiều khối, một `ly_do`.

## Criteria

- AC-1: Given một tệp trong thư mục ngăn (không phải `khuon.nhap`) nhập `DetailSheetHeader`, When chạy đúng lệnh của
  script `lint:slop`, Then lệnh đỏ với một dòng `onehub(ngan-trong-khung)` gọi `<tệp>:<dòng>`, tên khối và thành phần
  thay đọc từ `thay_cho` của khuôn.
- AC-2: Given ma trận sáu khối của khuôn (`DetailSheetHeader`, `Spinner`, `VungTaiLoi`, `Skeleton`, `Sheet`, `Dialog`)
  cùng một tên họ của hai khối trong `cam_ho` (`SheetContent`, `DialogContent`), When tiêm từng tên vào một ngăn, Then
  mỗi tên đỏ đúng một dòng mang thành phần thay của khối ấy; And `ConfirmDialog`, `PickListDialog`, `DetailSheetSection`,
  `SkeletonRow` trên cùng tệp thì im.
- AC-3: Given khuôn trên bản sao, When thêm một tên vào `cam_ngoai_khuon`, Then luật đỏ với tên ấy; When bỏ `Spinner`,
  Then các câu nhập `Spinner` im — mã luật không chứa tên khối hay thành phần thay nào; And bộ đọc khuôn cho cùng kết quả
  với `Bun.YAML.parse` trên khuôn thật, và ném lỗi gọi tên khoá khi khuôn viết danh sách ngoài tập con nó đọc.
- AC-4: Given `khuon.nhap` là `record-parts.tsx`, Then tệp ấy im dù nhập `DetailSheetHeader` và `VungTaiLoi`; When đổi
  `khuon.nhap` sang tệp khác trên bản sao, Then `record-parts.tsx` đỏ và tệp mới im.
- AC-5: Given một dòng ngoại lệ có `ly_do`, Then các khối của dòng ấy im trên đúng tệp ấy và khối khác trên cùng tệp vẫn
  đỏ; When `ly_do` rỗng hay vắng, Then luật đỏ các khối ấy và bài đỏ gọi tên tệp, khối kèm «thiếu lý do».
- AC-6: Given bài, When một dòng ngoại lệ trỏ tệp không có, mang khối ngoài `cam_ngoai_khuon`, hoặc tệp không còn nhập
  một khối của dòng, Then bài đỏ gọi tên tệp, khối và lỗi («tệp không có», «khối không cấm», «ngoại lệ thừa»).
- AC-7: Given bài, When `record-sheet-host.tsx` đăng ký một `kind` không có trong `nhan_dien.kind` mà cũng không có dòng
  mang lý do trong `nhan_dien.ngoai_khuon` (hay khuôn có `kind` mà host không đăng ký), Then bài đỏ gọi tên `kind`; When thành phần của một ngăn đăng ký có gốc JSX không phải `RecordSheetFrame` (hay một thành
  phần cùng tệp có gốc `KhungNgan`), Then bài đỏ gọi tên tệp.
- AC-8: Given cùng câu nhập `DetailSheetHeader` trong một tệp dưới `docs/`, `_acceptance/`, hay `apps/app/components/`
  ngoài thư mục ngăn, When chạy luật, Then không dòng `ngan-trong-khung` nào.
- AC-9: Given cây ở đỉnh đang xét, When chạy `bun run lint:slop` và bài, Then không dòng `ngan-trong-khung` nào và bài
  xanh; bảy ngăn đều qua AC-7; `ngoai_le` có đúng 14 dòng trên 14 tệp, mang đúng 20 cặp (tệp, khối) của bảng đo ở design
  doc.
- AC-10: Given khuôn, Then `cam_ngoai_khuon` có `Sheet` và `Dialog`; ba tệp đang dùng `Dialog` thô (`kr-bang-chung.tsx`,
  `objective-duyet.tsx`, `objective-hien-thi.tsx`) có dòng `ngoai_le` mang lý do.
- AC-11: Given `docs/proto.md`, Then có dòng màn mẫu trỏ `mau_dang_chay.tep` của khuôn và đường khuôn; When đổi
  `mau_dang_chay.tep` trên bản ghi trong bộ nhớ mà không đổi dòng, Then bài đỏ «dòng màn mẫu lệch khuôn»; And lệnh
  `bun test` của script `test` trong `apps/app` chạy bài (đầu ra có tên tệp bài).

## Coverage

Quét ba lớp răng (lint · bài quét · tài liệu) × sáu khối cấm (cộng họ) × ba vị trí (tệp ngăn · `khuon.nhap` · ngoài thư
mục ngăn) × hai trạng thái khuôn (đọc đúng · đổi trên bản sao: thêm, bớt khối, dời `khuon.nhap`, ngoại lệ thiếu lý do).
Thước CE: ghi chú của hàng BK2 và luật 34 của đợt [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json]; bảng đo nhập ở design doc
mục «Vấn đề». Quan hệ hai tệp (ngăn mở `Sheet` chồng lên ngăn) là Later.

## Đường đo

- Ngưỡng SỐNG của ô cơ hội: số đến từ đầu ra của `bun run lint:slop` (dòng `onehub(ngan-trong-khung)`) và của bài.
  AC-1, AC-2 bảo đảm chiều đỏ; AC-8 chiều im; AC-9 đối chứng dương; AC-3 «danh sách đọc từ khuôn»; AC-11 dòng
  `docs/proto.md`.

## Out of scope

- Sửa nợ: dời `Dialog` thô của ba tệp sang khối soạn trong ngăn hay `PickListDialog` — bảng chặn nợ mới, không dọn nợ.
- Ngăn mở `Sheet` hay `Dialog` chồng lên ngăn từ một tệp ngoài thư mục ngăn (quan hệ giữa hai tệp).
- Luật cho tầng trang và dấu hiệu vẽ tay chung — BK3, BK5.
- Đổi hình của ngăn nào: vòng không chạm tệp ngăn.
- Đưa ngăn Việc (`kind` `viec`, `KhungViec`) vào khuôn — vòng này chỉ khai nó ở `nhan_dien.ngoai_khuon` kèm lý do «nợ».

## Notes

- Vòng chạm `design/patterns/ngan-ban-ghi.md` và bộ luật oxlint: hồ sơ đã ký có `paths` trên các tệp ấy được ghim lại
  trong cùng PR theo kết quả `pre-merge-check`.
- Ngoài-1 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Một người viết ngăn mới vẫn có thể lách luật cấm bằng cách nhập cả bộ thành phần hoặc xuất lại, và không ai bị báo. Ngoài ra, một câu nhập chỉ lấy kiểu có thể bị báo oan. — `tools/oxlint/onehub/rules/ngan-trong-khung.ts`
- Ngoài-2 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Nếu một ngăn nhập thành phần cấm dưới tên khác, luật và bài kiểm sẽ đòi hai điều ngược nhau, và người viết bị kẹt giữa hai thông báo đỏ. Hiện chưa tệp nào gặp. — `apps/app/test/khung-ngan.spec.ts`
- Ngoài-3 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Bài kiểm từng loại ngăn có thể báo xanh dù một ngăn đã thoát khỏi khung chung, nhưng ca quét toàn bộ vẫn bắt được. Người dùng không thấy ảnh hưởng. — `apps/app/test/khung-ngan.spec.ts`
