---
schema_version: 1
feature: Ba ca của to-chuc-chi-tiet.dom.tsx chờ URL trong bộ chờ trước khi đọc ?don, không còn đỏ chập chờn khi nuqs ghi URL trễ hơn khung
slug: to-chuc-chi-tiet-cho-url
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-05T00:58:52Z
design_doc: docs/superpowers/specs/2026-10-05-to-chuc-chi-tiet-cho-url-design.md
---

# Acceptance Contract: to-chuc-chi-tiet-cho-url

## Context

`apps/app/test/to-chuc-chi-tiet.dom.tsx` (onehub `ee0cc227`) có ba ca chờ khung chi tiết rồi
đọc `url.get("don")` ngay. Nuqs ghi URL bằng một hẹn giờ `setTimeout(0)` sau khi state đổi, nên lần
đọc đua với lần ghi. Ngày 05/10 lúc 07:35 pre-push của P3 (R1f) đỏ ở «o-so-man»; chạy riêng tệp
thì xanh. Đo lại cùng ngày: `--rerun-each 10` cho 6–9 lượt đỏ trên 290 ở «chon-nut» và «o-so-man».
Ca thứ ba («nhap-ba-buoc») cùng mẫu nhưng chưa thấy đỏ.

Source input: prompt (chủ kho, 05/10: đưa điều kiện URL vào `cho(...)`, soát mọi ca cùng mẫu
trong tệp, không nới khẳng định; chạy lại nhiều lượt dưới tải tới khi xanh ổn định).

## Criteria

- AC-1: Given `apps/app/test/to-chuc-chi-tiet.dom.tsx`, When đọc cây cú pháp của mọi ca `test(...)`, Then mọi tham chiếu tới `url` trong ca đều có dạng `url.get("<khoá>")`; mỗi lần đọc nằm ngoài lời gọi `cho(...)` đều đứng sau một `cho(...)` có vế `url.get(<khoá>) === <giá trị>`, tính từ lần `bam(...)` gần nhất trước nó trong ca, với `<giá trị>` đúng bằng giá trị mà ca đó khẳng định (`x.don`, `"chua-co"`, `"goc"`) — và tập ca có lần đọc như vậy đúng bằng ba ca «chon-nut: bam tung loai nut…», «o-so-man: o thu nhat noi X/M…», «nhap-ba-buoc: buoc dan…».
- AC-2: Given cùng tệp ở `ee0cc227` và ở HEAD, When bỏ mọi câu `await cho(...)` khỏi cả hai bản rồi so (bỏ khoảng trắng), Then hai bản giống nhau từng chữ — kể cả bảng `BON_NUT`, mọi `bam`, mọi câu `expect` và tên ca; mọi `cho` của bản neo vẫn còn ở HEAD theo đúng thứ tự (điều kiện chỉ được thêm vế `&& url.get(…) === …`), và mỗi `cho` HEAD thêm mới đều có vế URL — không khẳng định nào bị nới hay bỏ.
- AC-3: Given một bản sao của tệp mà `onUrlUpdate` ghi `url` trễ ba nhịp `setTimeout(0)`, When chạy bản sao của HEAD và bản sao của `ee0cc227` trong cùng điều kiện, Then bản HEAD xanh mọi ca, còn bản `ee0cc227` đỏ đúng ba ca của AC-1; mỗi ca đỏ nhận ít nhất một giá trị `?don`, và mọi giá trị nhận được đều là `?don` trước cú bấm, theo ma trận viết trước (chon-nut: `bp:bp-kd`/`goc`/`bp:bp-vh`/`pb:pb-kho` cho bốn cú bấm; o-so-man: `null`; nhap-ba-buoc: `bp:bp-kd`).
- AC-4: Given lệnh `bun test … --rerun-each 20` trên tệp, When chạy trên HEAD và trên bản sao `ee0cc227`, Then HEAD có 0 lượt đỏ với đủ 29 × 20 lượt xanh, còn `ee0cc227` đỏ ít nhất một lượt ở ba ca của AC-1 (đối chứng cho thấy lệnh lặp bắt được bản chập chờn).

## Coverage

- Trục A — ca đọc URL ngoài bộ chờ: chon-nut bấm từng nút | o-so-man ô thứ nhất | nhap-ba-buoc Xem cây [thước CE: quét cây cú pháp ở `rang/cho-truoc-doc.mjs` — mọi `url.get` ngoài `cho` trong 29 ca của tệp ra đúng ba ca này]
- Trục B — thời điểm URL tới so với khung: cùng nhịp | trễ một nhịp (`setTimeout(0)` của nuqs, chập chờn thật) | trễ cố định ba nhịp (bản sao chèn trễ, tất định) | máy đang tải (pre-push chạy song song nhiều gói) [thước CE: `ThrottledQueue.flush` của nuqs 2.9.4, `rateLimitFactor = 0` ở adapter testing; lần đỏ ở pre-push của P3 05/10 07:35]
- Trục C — khẳng định: giữ nguyên | nới câu `expect` (`toMatchObject`) | nới ngoài `expect` (bớt hàng bảng nút, bỏ `bam`) | mất hay đổi tên ca | bỏ `cho` có sẵn [thước CE: so cả tệp ngoài 47 câu `cho` với neo — 29 ca, 44 câu `expect`]
- Core → AC: trục A × mọi ô → AC-1 · trục C → AC-2 · trục B ô trễ cố định → AC-3 · trục B ô trễ một nhịp → AC-4 · trục B ô máy đang tải → không có eval máy; đo tay dưới khoá `s4`, ghi ở `evidence/do-duoi-tai.md` (sổ quyết định, «không đưa tải vào eval»)
- Giới hạn đo đã biết: AC-4 là phép đo thống kê. Đối chứng đỏ 21/580 ở 20 lần lặp, nên khả năng đối chứng ra 0 đỏ do may rất nhỏ; nếu xảy ra thì răng thoát 2 (không kết luận), không xanh.

## Out of scope

- Không sửa mã sản phẩm của trang Tổ chức (`to-chuc.tsx`, `hop-thoai-nhap.tsx`) hay cách nó ghi URL.
- Không đổi `cho(...)` (60 nhịp) hay `NuqsTestingAdapter` và không vá nuqs.
- Không soát các tệp `*.dom.tsx` khác trong kho có cùng mẫu — việc riêng nếu cần.
- Không gửi bản vá lên `trycompai/crm` — tệp kiểm này là của riêng kho.

## Notes

- Neo so sánh là `ee0cc227cf1926a5359e10fdce07ffdeec57c183` (đỉnh onehub khi mở vòng), không neo `merge-base`: sau khi merge thì merge-base tiến lên và phép so sẽ luôn đúng.
- Bản sao của E3/E4 nằm ở `apps/app/test/.scratch/tcu-*-<pid>.ban-sao.tsx` (alias `@/` chỉ giải trong gói app; import tương đối được viết lại thêm một cấp), xoá trong `finally`; răng thoát 2 nếu còn sót bản sao của chính lượt. `.scratch/` bị gitignore nên `biome check .` không quét, oxlint bỏ qua `**/.scratch/**`, còn runner `test:dom` chỉ nhận đuôi `.dom.tsx` — làn S4 chạy suite song song với E3/E4 không nhặt được bản sao.
