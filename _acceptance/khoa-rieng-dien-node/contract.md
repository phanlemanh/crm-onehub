---
schema_version: 1
feature: Hộp «Chuyển việc 30 ngày» ghép câu từ mẫu tin nhắn mà không sinh hai phần tử cùng khoá React khi mẫu bắt đầu, kết thúc hay có hai chỗ trống liền nhau — chữ trên màn giữ nguyên
slug: khoa-rieng-dien-node
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-26-khoa-rieng-dien-node-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T22:14:14Z
---

# Acceptance Contract: khoa-rieng-dien-node

## Context

`dienNode(mau, gia)` trong `chuyen-viec-dialog.tsx` tách mẫu bằng `mau.split(/(\{\w+\})/)` và khoá
mỗi `<Fragment>` bằng vị trí ký tự bắt đầu của đoạn. Mẫu bắt đầu bằng chỗ trống (`{ten} …`) cho một
đoạn rỗng ở vị trí 0 và đoạn `{ten}` cũng ở vị trí 0, nên React in «Encountered two children with the
same key, `0`» mỗi lần vẽ mô tả của hộp. Cả bốn mẫu mô tả thật (vi/en × có việc/không việc) đều bắt
đầu bằng `{ten}`.

«Mẫu» là chuỗi tin nhắn trong `apps/app/lib/messages/ke-hoach-noi.ts` có chỗ trống dạng `{ten}`.
«Cảnh báo khoá trùng» là một lời gọi `console.error` mà các đối số ghép lại chứa chuỗi `same key`.
«Người đi» là Hương (`u-h`, «Huong Le»).

## Criteria

- AC-1: Given hộp chuyển việc mở cho Hương, với mỗi ô của ma trận viết trước gồm ngôn ngữ {vi, en} × phần xem trước {2 kế hoạch và 3 bước, 0 kế hoạch và 0 bước} (bốn ô), When hộp vẽ lần đầu rồi vẽ lại khi phần xem trước về, Then không có cảnh báo khoá trùng nào; tiêu đề hộp có chữ đúng bằng mẫu `tieuDe` của ngôn ngữ đó đã điền tên «Huong Le»; mô tả có chữ đúng bằng mẫu `coViec` (ô 2/3, điền 2 và 3) hoặc `khongViec` (ô 0/0) đã điền; và tên nằm trong một phần tử `translate="no"` của mô tả.
- AC-2: Given ma trận mười một mẫu viết trước — `"{a} sau"`, `"truoc {a}"`, `"truoc {a} sau"`, `"{a}{b}"`, `"{a} {b}"`, `"{a}"`, `"chu tron"`, `""`, `"{a} va {a}"`, `"{z} la"`, `"{a}{b}{a}"` — với `a` là một phần tử React chữ «A» và `b` là chuỗi «B», When gọi `dienNode(mau, { a, b })` rồi vẽ kết quả, Then khoá của các phần tử trả về khác nhau từng đôi; chữ khi vẽ đúng bằng chữ đã viết trước cho mẫu đó (khoá lạ `{z}` thành chuỗi rỗng, khoảng trắng giữa hai chỗ trống được giữ); không có cảnh báo khoá trùng; và số ca đã chạy của AC-1 và AC-2 đúng bằng 4 và 11.
- AC-3: Given cùng bộ bắt `console.error` mà AC-1 và AC-2 dùng, When vẽ hai `Fragment` cố ý cùng một khoá, Then bộ bắt thấy ít nhất một cảnh báo khoá trùng. Ca này chứng rằng bộ bắt còn sống, vì nếu nó gắn nhầm chỗ thì AC-1 và AC-2 xanh mà không đo gì.

## Coverage

Không gian AC là ma trận hình dạng mẫu × nguồn mẫu; quét tại chỗ, không chạy skill `morphological-scan` (xem entry `approach` trong `decisions.jsonl`).

- Trục 1 — vị trí chỗ trống trong mẫu: đầu · giữa · cuối · hai liền nhau · hai chỗ cách nhau chỉ bằng khoảng trắng · ba liền nhau · chỉ chỗ trống · không chỗ trống · mẫu rỗng · một chỗ lặp · khoá lạ. Mười một giá trị, mỗi giá trị một ô của AC-2.
- Trục 2 — nguồn mẫu: mẫu thật trong hộp (AC-1, bốn ô: vi/en × có việc/không việc — phủ «đầu» ở mô tả, «cuối» ở tiêu đề vi, «giữa» ở tiêu đề en và mô tả có việc) · mẫu tổng hợp gọi thẳng hàm (AC-2).
- Trục 3 — sống của phép đo: bộ bắt thấy khoá trùng thật (AC-3). Việc hồ sơ đã ký đang đo hộp không đỏ thêm không còn là AC (xem entry `descope` «bỏ AC-4» trong `decisions.jsonl`); test DOM của chúng chạy trong suite `bun run test` mỗi round.
- Thước CE: mỗi giá trị của trục 1 có đúng một ô ở AC-2; mỗi ô của trục 2 có ít nhất một khẳng định có tên. Ô «khoá trùng trong mẫu thật khi phần xem trước lỗi» không có AC — nhánh lỗi vẽ `k.loiXemTruoc`, một chuỗi không qua `dienNode`. Đã kiểm 26/09 rằng không mẫu thật nào khác đi qua `dienNode`: `grep -rn dienNode apps packages` chỉ thấy định nghĩa và ba lời gọi (`tieuDe`, `coViec`, `khongViec`) trong chính tệp hộp — cả ba mẫu, hai ngôn ngữ, đều nằm trong bốn ô của AC-1.

## Out of scope

- Chuyển `dienNode` sang `packages/ui` hay `plan-copy.ts` — chỉ có một chỗ dùng.
- Răng máy chạy lại eval của mọi hồ sơ đã ký đang đo hộp (AC-4 cũ) — bỏ ở S4 round 1 theo quyết định của chủ kho; thước `ndk_pham_vi` của `neo-dan-so-khong-cung` đỏ trên mọi nhánh chạm `apps/**`, nên răng đó không đạt được một cách trung thực cho tới khi thước ấy được sửa.
- Hai mục «mở hợp đồng mới» của hồ sơ `lam-moi-chuyen-viec-qua-loi-chung`: E5 của hồ sơ đó neo `merge-base` trôi, và bộ ghi `invalidateQueries` của nó chỉ ghi lời gọi có `queryKey`.
- Sửa `apps/app/test/lam-moi-chuyen-viec.dom.tsx` hay `apps/app/test/moi-phia-ke-hoach.dom.tsx` — hai tệp tự hết cảnh báo sau vòng này, không cần đổi.

## Notes

- Không có `opportunity.md` — việc sửa lỗi nhỏ, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
- Trên mã trước sửa, AC-1 đỏ theo lẽ tự nhiên ở khẳng định khoá trùng (mẫu thật bắt đầu bằng `{ten}`). Tệp test lấy `dienNode` qua `await import`, nên việc hàm chưa được export chỉ làm các ca AC-2 đỏ (`dienNode` không phải hàm), không làm hỏng việc nạp cả tệp. Chiều đỏ đúng nghĩa của AC-2 lấy bằng phá thử sau sửa: bỏ `.filter`, hoặc đổi sang `.filter((phan) => phan.trim() !== "")`.
- AC-4 (răng không-hồi-quy E4) đã bỏ ở S4 round 1. Số đo của nó ở S3 và round 1 giữ bên dưới làm sử liệu.
- S3 (26/09), E1–E3: mã trước sửa, tệp test ở `e575b7c3`:
  - 4 ca `mau-that` đỏ «khoa trung o vi 2/3 … en 0/0».
  - 11 ca `ma-tran` đỏ «hop.dienNode is not a function».
  - `bo-bat-con-song` xanh.
- Sau sửa (`89109bd0`), đo được:
  - Tệp mới 16/16 xanh. `lam-moi-chuyen-viec.dom.tsx` 3/3 và `moi-phia-ke-hoach.dom.tsx` 14/14 xanh; đầu ra của cả ba không còn dòng «same key», trước sửa `lam-moi` in 12 dòng.
  - Ba lệnh `krdn_*` theo `config.yaml` xanh với 4, 11, 1 ca.
- Phá thử trên bản đã commit, hoàn nguyên bằng `git checkout`:
  - (a) bỏ `.filter` → 11 đỏ: 4 «khoa trung o …», 7 «khoa trung trong mau …» (`{a} sau`, `{a}`, `{a} va {a}`, `{a} {b}`, `{a}{b}`, `{a}{b}{a}`, `{z} la`).
  - (b) `.filter(trim)` → 1 đỏ «chu sai trong mau {a} {b}».
  - (c) bỏ bọc `console.error` → 1 đỏ «bo bat console khong con song».
  - Xoá dòng `["", ""]` → «nhom ma-tran chay 10 ca, phai 11».
  - `test.skip.each` nhóm `mau-that` → «nhom mau-that chay 0 ca, phai 4».
- S3 (26/09), E4, lượt thật ở `73fd6733`:
  - Quét 91 hồ sơ (83 đã ký), rút 64 eval, chạy 50 lệnh, loại 5 lệnh quét lồng: `ktcd_khong_hoi_quy`, `tcds_khong_hoi_quy`, `ndk_cay_that`, `ndk_pham_vi`, `lmcv_khong_hoi_quy`.
  - 21 lệnh đỏ ở HEAD sau khi chạy lại, và đỏ cùng mã ở `100847e8` (21 dòng DO SAN). Kết quả: mã 0.
- Phá thử E4:
  - (a) Xoá `chuyen.mutate(...)` → mã 1 «vong nay lam do them 2 lenh: … lmcv_ba_khoa (lam-moi-chuyen-viec-qua-loi-chung:E1), … kh2_chuyen_giao_man (moi-phia-deu-thay-ke-hoach:E3)». Lượt này chạy trên bản sao script chỉ giữ hai lệnh đó, để khỏi quét lại trọn ~25 phút; đường so HEAD↔`merge-base` không đổi.
  - (b) Bản sao với ref không tồn tại → mã 2 «KHONG DO DUOC: khong co ref …».
  - (c) Bản sao rút trên tập rỗng → mã 1 «bo rut tap hong».
- Đường nền S1 ghi `suite: do`. Nguyên nhân duy nhất là dòng «CAY BAN SAU SUITE» — tôi viết `contract.md` và design doc trong lúc suite chạy. Cả bốn suite đều thoát 0 (turbo 11/11, 9/9, 4/4).
