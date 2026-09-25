---
schema_version: 1
feature: Hộp «Chuyển việc 30 ngày» ghép câu từ mẫu tin nhắn mà không sinh hai phần tử cùng khoá React khi mẫu bắt đầu, kết thúc hay có hai chỗ trống liền nhau — chữ trên màn giữ nguyên
slug: khoa-rieng-dien-node
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-09-26-khoa-rieng-dien-node-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T21:01:14Z
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
- AC-4: Given các tệp mã của vòng này — hợp của hai tệp đã khai (`chuyen-viec-dialog.tsx`, tệp test mới) với các tệp mã trong `diff` từ `merge-base(HEAD, origin/onehub)` tới HEAD (bỏ `_acceptance/**` và glob T1) — và tập eval máy (`test`/`script`, không tự khai `status: not-run`) của mọi hồ sơ `signed-off`/`machine-cleared` khác mà `paths` của chính eval khớp ít nhất một tệp đó — tập do máy rút, không viết tay; bộ rút trên hộp phải trả về `moi-phia-deu-thay-ke-hoach:E3` và `lam-moi-chuyen-viec-qua-loi-chung:E1`; lượt quét dựng cây gốc khác hoặc gọi làn ghim bị loại và in tên — When chạy từng lệnh của tập ở HEAD, chạy lại một lần mỗi lệnh đỏ, và chạy lệnh còn đỏ trên cây `merge-base(HEAD, origin/onehub)`, Then không lệnh nào đỏ ở HEAD mà xanh ở `merge-base`; mỗi lệnh đỏ ở cả hai cây được in một dòng «DO SAN» cùng tổng số; và khi không có ref `origin/onehub` thì lượt quét in «KHONG DO DUOC» và thoát 2, không thoát 1.

## Coverage

Không gian AC là ma trận hình dạng mẫu × nguồn mẫu; quét tại chỗ, không chạy skill `morphological-scan` (xem entry `approach` trong `decisions.jsonl`).

- Trục 1 — vị trí chỗ trống trong mẫu: đầu · giữa · cuối · hai liền nhau · hai chỗ cách nhau chỉ bằng khoảng trắng · ba liền nhau · chỉ chỗ trống · không chỗ trống · mẫu rỗng · một chỗ lặp · khoá lạ. Mười một giá trị, mỗi giá trị một ô của AC-2.
- Trục 2 — nguồn mẫu: mẫu thật trong hộp (AC-1, bốn ô: vi/en × có việc/không việc — phủ «đầu» ở mô tả, «cuối» ở tiêu đề vi, «giữa» ở tiêu đề en và mô tả có việc) · mẫu tổng hợp gọi thẳng hàm (AC-2).
- Trục 3 — sống của phép đo: bộ bắt thấy khoá trùng thật (AC-3) · hồ sơ đã ký đang đo hộp không đỏ thêm (AC-4).
- Thước CE: mỗi giá trị của trục 1 có đúng một ô ở AC-2; mỗi ô của trục 2 có ít nhất một khẳng định có tên. Ô «khoá trùng trong mẫu thật khi phần xem trước lỗi» không có AC — nhánh lỗi vẽ `k.loiXemTruoc`, một chuỗi không qua `dienNode`. Đã kiểm 26/09 rằng không mẫu thật nào khác đi qua `dienNode`: `grep -rn dienNode apps packages` chỉ thấy định nghĩa và ba lời gọi (`tieuDe`, `coViec`, `khongViec`) trong chính tệp hộp — cả ba mẫu, hai ngôn ngữ, đều nằm trong bốn ô của AC-1.

## Out of scope

- Chuyển `dienNode` sang `packages/ui` hay `plan-copy.ts` — chỉ có một chỗ dùng.
- Hai mục «mở hợp đồng mới» của hồ sơ `lam-moi-chuyen-viec-qua-loi-chung`: E5 của hồ sơ đó neo `merge-base` trôi, và bộ ghi `invalidateQueries` của nó chỉ ghi lời gọi có `queryKey`.
- Sửa `apps/app/test/lam-moi-chuyen-viec.dom.tsx` hay `apps/app/test/moi-phia-ke-hoach.dom.tsx` — hai tệp tự hết cảnh báo sau vòng này, không cần đổi.
- Dựng máy chủ dev cho các eval màn thật mà AC-4 có thể rút — chúng đỏ ở cả HEAD lẫn `merge-base` khi không có máy chủ, nên AC-4 tính chúng là «đỏ sẵn».

## Notes

- Không có `opportunity.md` — việc sửa lỗi nhỏ, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
- Trên mã trước sửa, AC-1 đỏ theo lẽ tự nhiên ở khẳng định khoá trùng (mẫu thật bắt đầu bằng `{ten}`). Tệp test lấy `dienNode` qua `await import`, nên việc hàm chưa được export chỉ làm các ca AC-2 đỏ (`dienNode` không phải hàm), không làm hỏng việc nạp cả tệp. Chiều đỏ đúng nghĩa của AC-2 lấy bằng phá thử sau sửa: bỏ `.filter`, hoặc đổi sang `.filter((phan) => phan.trim() !== "")`.
- AC-4 không có vế «không tệp mã nào ngoài vòng» như E5 của `lam-moi-chuyen-viec-qua-loi-chung`. Vế đó là nguồn Ngoài-1 của hồ sơ ấy: sau khi merge, một PR khác chạm hộp sẽ làm nó đỏ giả. Phạm vi diff do người chấm S4 soi.
