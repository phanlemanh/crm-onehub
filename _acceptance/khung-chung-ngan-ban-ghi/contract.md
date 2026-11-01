---
schema_version: 1
feature: Bảy loại ngăn bản ghi mở trong cùng một khung — cùng đầu ngăn, cùng khung xương chờ tải, cùng một thành phần lỗi
slug: khung-chung-ngan-ban-ghi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [web]
status: signed-off
design_doc: _acceptance/khung-chung-ngan-ban-ghi/design.md
veto_state: mo
veto_opened_at: 2026-10-31T17:30:00Z
---

# Acceptance Contract: khung-chung-ngan-ban-ghi

## Context

Hàng BK1 của «OKR» (`docs/plan/lo-trinh-okr.json`). Chủ kho gõ `build` ngày 31/10 ở phiên giám sát Mac Studio. Đo trên
onehub 16604ce3f: ngăn deal, liên hệ, công ty, kế hoạch, mục tiêu dựng `RecordSheetFrame`
(`apps/app/components/crm/record-sheet/record-parts.tsx`); `kr-sheet.tsx` và `so-kr-sheet.tsx` đi vòng qua nó, tự dựng
đầu ngăn, chờ tải, lỗi và «không thấy». Khung có từ 31/07 mà ngăn KR dựng 28/09 vẫn thoát khung, vì khe chờ tải và lỗi
là tuỳ chọn. Thiết kế: `design.md`. Bản mẫu: `/proto/khung-chung-ngan-ban-ghi`, `design-pass.md`.

Source input: hàng BK1 · `crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md#b8885d939c4f080f612f3143b38f5370c660db29` ·
`docs/plan/dot-ban-do-khuon-3010/LUAT-rieng.md` luật 31–33, 36.

## Criteria

- AC-1: Given `record-sheet-host.tsx` mở bảy loại ngăn (deal, contact, company, plan, objective, kr, so-kr), When quét tĩnh bảy tệp ngăn, Then mỗi tệp gọi `RecordSheetFrame`, `KhungNgan` hoặc `KhungKr`; And không tệp nào nhập `DetailSheetHeader`, `Spinner` hay `VungTaiLoi`; And chỉ `kr-sheet.tsx` và `so-kr-sheet.tsx` nhập `Skeleton`; And chỉ `kr-sheet.tsx` vào khung qua `KhungNgan`/`KhungKr`, có truyền `trang` cho `KhungKr`, và mặt chờ tải, mặt lỗi của ngăn KR và ngăn Số KR là `ChoTaiNgan` và `KhungTaiLoi`; And trong một bản sao, deal-sheet nhập `DetailSheetHeader`, thôi gọi khung, hoặc gọi `KhungNgan` thay `RecordSheetFrame`, hay kr-sheet thôi truyền `trang`, thì bản quét đỏ và gọi tên tệp.
- AC-2: Given một ngăn đang tải, When khung dựng, Then thân ngăn là khung xương hình «ngan» mang `aria-busy="true"`; And đầu ngăn vẫn hiện tiêu đề; And không có vòng quay.
- AC-3: Given một ngăn lỗi tải vì mất kết nối và có hàm thử lại, When khung dựng, Then `KhungTaiLoi` mang `data-ly-do="mat-ket-noi"` bọc `VungTaiLoi`; And bấm Thử lại gọi hàm thử lại đúng một lần.
- AC-4: Given lỗi tải vì bản ghi không còn hoặc không đủ quyền, When `KhungTaiLoi` dựng, Then có đúng một nút (Đóng) và không có nút thử lại; And khi ngăn truyền khe `hanhDong`, nút đó thay nút mặc định, mang nhãn và `data-nut` của khe, bấm gọi hàm của khe một lần.
- AC-5: Given ngăn truyền khe `than` và thẻ con, When khung dựng ở trạng thái đủ dữ liệu, Then thẻ con nằm đúng chỗ khe `than` đặt nó giữa phần trước và phần sau; And dấu của khe `vo` nằm trên vỏ ngăn và dấu của khe `vungThan` nằm trên vùng cuộn của thân.
- AC-6: Given một ngăn gọi `RecordSheetFrame` hoặc `KhungNgan`, When thiếu `loading`, hoặc thiếu `error`, hoặc (với `RecordSheetFrame`) có `tabs` mà thiếu `tab`, Then `tsc` báo lỗi gọi tên đúng prop đó; And một lời gọi đủ `loading`, `error`, `title` thì `tsc` im.
- AC-7: Given 18 tệp DOM đã ký đọc ngăn KR, ngăn Số KR và khung lỗi bản ghi (`ngan-kr-mot-cho`, `okr-canh-kr`, `so-kr`, `khung-loi-ban-ghi-*`, `ngan-ban-ghi-*` và các tệp cùng nhóm trong `rang/bai-cu.mjs`), When chạy từng tệp, Then mỗi tệp 0 fail và tổng số ca pass ≥ 189; And không tệp nào trong 18 tệp đổi so với điểm rẽ nhánh khỏi onehub.
- AC-8: Given bản mẫu `/proto/khung-chung-ngan-ban-ghi` với 23 trạng thái (bảy đối tượng × đang tải · lỗi tải · đủ dữ liệu, và hai cảnh ngăn KR trước và sau), When dựng từng trạng thái mà không bọc ngăn nào từ ngoài, Then mỗi ô có đầu ngăn; And ô đang tải có khung xương hình «ngan», ô lỗi có `KhungTaiLoi`, ô đủ dữ liệu không có cả hai; And ở cảnh trước và sau, ngăn KR tự dựng cũ không có khung xương hình «ngan» còn ngăn KR trong khung thì có.
- AC-9: Given khuôn `design/patterns/ngan-ban-ghi.md`, When đọc frontmatter, Then có đủ khoá `nhom`, `doi_tuong`, `khuon`, `nhan_dien`, `mau_dang_chay`, `khe_bat_buoc`, `cam_ngoai_khuon`, `ngoai_le`; And `doi_tuong` đúng bảy loại theo thứ tự của AC-1, và thân khuôn nhắc cả bảy tệp ngăn; And mục «Chờ tải và lỗi tải trong ngăn bản ghi» của `docs/design.md` nhắc `ChoTaiNgan`, `KhungTaiLoi`, `VungTaiLoi` và đường dẫn khuôn; And bỏ `so-kr` khỏi `doi_tuong` trong một bản sao thì bản quét đỏ.
- AC-11: Given bốn ngăn thật (deal, liên hệ, công ty, kế hoạch) dựng bằng chính thành phần ngăn với truy vấn giả, When truy vấn đang chờ, lỗi máy chủ, `NOT_FOUND`, hoặc trả dữ liệu, Then cả bốn ngăn cho cùng kết quả: đang chờ thì có đầu ngăn, khung xương hình «ngan» mang `aria-busy="true"`, không vòng quay; lỗi máy chủ thì `KhungTaiLoi` lý do `mat-ket-noi` bọc `VungTaiLoi`; `NOT_FOUND` thì lý do `khong-con` không có `VungTaiLoi`; có dữ liệu thì đầu ngăn mang tên bản ghi, không khung lỗi, không khung xương; And khi khung chọn vòng quay thay khung xương mặc định thì phép đo này đỏ.
- AC-10: Given app thật của cây đang xét chạy trong một phiên đo, When mở 23 trạng thái của bản mẫu ở khổ 1280 và 375, Then 46 ảnh không ảnh nào tràn ngang và không ảnh nào thiếu ngăn; And người chấm thấy trên ảnh: ngăn đang xét và ngăn deal cùng đầu ngăn, cùng hình khung xương khi chờ tải, cùng một khung lỗi khi lỗi tải.

## Coverage

Quét tay hai trục (dòng «bỏ coverage-scan» trong `decisions.jsonl`):

- Trục A — loại ngăn: deal, liên hệ, công ty, kế hoạch, mục tiêu, KR, Số KR (AC-1, AC-8, AC-9, AC-10); ngăn thật: bốn ngăn CRM (AC-11), KR và Số KR qua bài đã ký (AC-7).
- Trục B — trạng thái: đang tải (AC-2, AC-8, AC-11), lỗi tải theo lý do (AC-3, AC-4, AC-8, AC-11), đủ dữ liệu (AC-5, AC-8, AC-11).
- Cross-cutting: buộc bằng kiểu (AC-6) · hành vi đã ký giữ nguyên (AC-7) · khổ 375 và 1280 trên app thật (AC-10) ·
  chiều đỏ của mỗi phép đo tĩnh (AC-1, AC-6, AC-9) và đối chứng âm của bản mẫu (AC-8).
- [GIẢ ĐỊNH] «Đã lưu trữ» không phải trạng thái thứ tư của khung: nó là thân của ngăn đủ dữ liệu
  (`da-luu-tru-tai-loi`), nên nằm ngoài trục B.

## Đường đo

- Ngưỡng SỐNG của `opportunity.md` là đúng câu `bat_khi` của hàng; nó đo trước khi gộp bằng năm khoá `bk1_*` của
  `_acceptance/config.yaml` (AC-1…AC-11). Không có ngưỡng đọc sau gộp — dòng «bỏ đo sau gộp» trong `decisions.jsonl`.
- Bốn con số cho kit (luật 36) ghi ở `evidence-report.md`.

## Out of scope

- Không viết luật lint chặn ngăn thoát khung — hàng BK2 `rang-giu-khung-ngan`.
- Không gỡ `Skeleton` ở mục Sổ nguồn của `kr-sheet.tsx` và ở `NoiDungSoKr` nhúng trong ngăn KR — ngoại lệ có tên trong khuôn.
- Không dời thẻ con Việc · Bằng chứng của ngăn KR lên dưới ô số như ngăn deal.
- Không chụp theme tối: khung không thêm màu, chỉ dùng token có sẵn.
- Không sửa thước nào của hồ sơ đã ký (luật tạm 18/10).

## Notes

- `packages/ui/src/components/khung-xuong.tsx` nằm ngoài ranh giới dãy K: giám sát duyệt `cham-tep` K-6 (thêm hình
  `ngan`). `apps/app/app/proto/catalog.ts`, `registry.ts`: `cham-tep` K-7. `_acceptance/config.yaml`: `cham-tep` K-8,
  chỉ thêm năm khoá `bk1_*`.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-01:
  - Ngoài-1: Ngăn Số KR mất kết nối vẫn báo lỗi và có nút Thử lại, nhưng nút khác hình và không có trạng thái đang
    thử lại như `VungTaiLoi` của các ngăn khác.
- `docs/design.md` cũng bị SN1 (#609) sửa ở mục cuối; mục của BK1 đứng riêng ngay sau «Chờ tải và lỗi tải». BK1 gộp
  onehub sau khi #609 lên.
- Hợp đồng có 11 tiêu chí (trên mục tiêu 8–10, dưới trần 12): AC-11 thêm sau phản biện context sạch, vì không tiêu chí
  nào dựng ngăn thật; tách nó ra hàng khác thì BK1 chỉ chứng trên bản mẫu.
- Lượt chụp bản mẫu đầu tiên ra trang lỗi của Next mà bài DOM không thấy, vì bài DOM luôn bọc `DetailSheet`. Từ đó các ca
  bản mẫu của `khung-ngan.dom.tsx` dựng không bọc, và `chup-proto.mjs` đếm ngăn trên từng ảnh.
