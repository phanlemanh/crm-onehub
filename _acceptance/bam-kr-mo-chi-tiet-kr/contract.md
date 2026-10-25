---
schema_version: 1
feature: Người dùng bấm một KR ở Của tôi, Cây căn chỉnh, Việc OKR hay trong chi tiết mục tiêu thì mở chi tiết KR, không mở chi tiết mục tiêu; chữ «Cập nhật tuần» dùng như danh từ thành «Cập nhật»
slug: bam-kr-mo-chi-tiet-kr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-10-24-bam-kr-mo-chi-tiet-kr-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-25
---

# Acceptance Contract: bam-kr-mo-chi-tiet-kr

## Context

Chủ kho 24/10 chốt bốn luật «Bấm vào KR và cập nhật» (ghi chú `SV6-luat-bam-kr.md` của giám sát; vào `docs/design.md` qua
#557). Luật 2: bấm KR ở bất kỳ đâu mở chi tiết KR (`openRecord({ kind: "kr", id })`). Trên onehub `09d7d1dcf` bốn chỗ trái
luật này:

- Của tôi › «KR bạn phụ trách»: tên KR mở mục tiêu (`okr/phan-kr-phu-trach.tsx:85`).
- Cây căn chỉnh: nút KR mở mục tiêu của nó (`okr/cay-can-chinh.tsx:260`).
- Của tôi › Việc OKR: nút «Mở mục tiêu» kể cả việc có `keyResultId` (`okr/viec-cua-toi.tsx:194`).
- Chi tiết mục tiêu › bảng KR: tên KR là chữ, không bấm được (`okr/bang-kr.tsx:366`).

Và phần «Chữ» của bốn luật: check-in gọi là «Cập nhật», bỏ «tuần»; giữ cụm chỉ khoảng thời gian («… tuần này»).

Source input: lời chủ kho 24/10 «Đồng ý hết theo khuyến nghị» qua giám sát vk · ô Cổng Đáng
`_acceptance/bam-kr-mo-chi-tiet-kr/opportunity.md` · hàng SV6 `docs/plan/lo-trinh-okr.json` (#557).

## Criteria

- AC-1: Given người phụ trách KR K ở Của tôi, mục «KR bạn phụ trách», When bấm tên K, Then URL mang `record=kr:<id K>` và
  ngăn chi tiết KR của K mở; URL không mang `objective:` của mục tiêu chứa K.
- AC-2: Given Cây căn chỉnh của một chu kỳ có nút mục tiêu O và nút KR K của O, When chọn nút K, Then URL mang
  `record=kr:<id K>` với id K là id bản ghi KR trong cơ sở dữ liệu (cây do `okr.cayCanChinh` thật dựng); When chọn nút O,
  Then URL mang `record=objective:<id O>` như trước vòng. (cross-layer)
- AC-3: Given Của tôi › Việc OKR có một việc gắn KR (`keyResultId` K) và một việc chỉ gắn mục tiêu O, When nhìn hai dòng,
  Then dòng gắn KR có nút «Mở KR» và bấm thì URL mang `record=kr:<id K>`; dòng chỉ gắn mục tiêu giữ nút «Mở mục tiêu»
  mở `record=objective:<id O>`.
- AC-4: Given chi tiết mục tiêu O đang mở, bảng KR có K, When nhìn tên K, Then tên K là một nút có tên truy cập là tên K,
  Tab tới được; When bấm (hay Enter), Then ngăn chi tiết KR của K chồng lên ngăn O: URL `record=objective:<id O>|kr:<id K>`,
  đóng ngăn KR thì về lại O.
- AC-5: Given mọi tệp chữ dưới `apps/app/lib/messages/` (vi và en) và mọi chuỗi chữ trong mã tin nhắc của
  `apps/agent/agent/lib/` (trừ lời dặn model `okr/chi-dan-tom-tat.ts`), When đọc mọi chuỗi, Then không chuỗi vi nào chứa
  «Cập nhật tuần» hay «cập nhật tuần» mà chữ kế sau không phải «này», không chuỗi en nào chứa «weekly update» mà chữ kế
  sau không phải «day»; mỗi chuỗi đổi bằng đúng bản mới ở bảng cặp «Chữ» của design doc; cụm chỉ khoảng thời gian («KR đã
  cập nhật tuần này», «Cần cập nhật tuần này») và «ngày cập nhật» giữ nguyên.
- AC-6: Given vòng này đã làm, When chạy lại eval máy (test, script) của mọi hồ sơ đã ký có bài kiểm hay thước chạm bốn
  tệp ở Context, tin nhắc, hoặc khẳng định chuỗi «Cập nhật tuần», cùng hai thước màn đã ký chạm Của tôi —
  `dat-okr-trong-crm` (`rang/man-okr.mjs`) và `hop-thoai-giu-cho-dang-nhap` (`rang/man-giu-cho.mjs`) — Then không mục nào
  xấu hơn trên nền `origin/onehub` (mục đỏ sẵn in «đỏ sẵn trên nền»), và ảnh chụp lịch sử
  `apps/agent/test/fixtures/tin-nhac-truoc-tb1.json` không đổi.
- AC-7: Given mọi chỗ gọi `openRecord` / `useOpenRecord` dưới `apps/app/app/(app)/[slug]/okr/`, When quét lúc chạy, Then
  mỗi chỗ gọi `kind: "objective"` có trong bảng viết trước của vòng với nguồn là mục tiêu, mỗi chỗ có nguồn là KR mở
  `kind: "kr"`; một chỗ gọi mới không có trong bảng là đỏ.

## Coverage

Bỏ quét hình thái: phạm vi đã chốt bằng bảng bốn chỗ sai và danh sách chữ trong ghi chú `SV6-luat-bam-kr.md` (spec ngoài),
xem dòng `descope` «bỏ coverage-scan» trong `decisions.jsonl`. Trục kiểm tay khi viết: nơi bấm (bốn chỗ · chỗ đã đúng
không đổi · mọi chỗ gọi khác dưới khu OKR) × loại bản ghi (mục tiêu · KR) → AC-1…AC-4, AC-7 (quét lớp lúc chạy thay quét
hình thái); chữ (danh từ · khoảng thời gian · en) → AC-5; hồ sơ đã ký → AC-6.

## Đường đo

- Thước: bấm KR ở bốn chỗ mở chi tiết KR, và không chỗ nào dưới khu Mục tiêu có nguồn KR mà mở mục tiêu · số từ: bài kiểm
  DOM E1–E4 đọc `?record=` và bộ quét E7 («quet: <n> cho goi», số chỗ sai) · bảo đảm bởi: AC-1, AC-2, AC-3, AC-4, AC-7
- Thước: số chuỗi «Cập nhật tuần» dùng như danh từ còn trong chữ app và tin nhắc (đích 0) · số từ: bộ quét E5 («quet: <f>
  tep, <n> chuoi» và danh sách chuỗi lọt) · bảo đảm bởi: AC-5

## Out of scope

- Các chỗ đã đúng luật 2 (bảng Danh sách, Họp tuần, «KR của tôi», «Mới KR», Quanh mục tiêu) — không chạm.
- Luật 3 (nút «Cập nhật» trên dòng mở hộp một KR) và luật 4 (Họp tuần là thẻ con) — thuộc HT1, HT2, SV1.
- Bảng cập nhật hàng loạt ở Của tôi (SV1), lịch sử mọi lần cập nhật (SV7), «chi tiết một lần cập nhật» (chân trời).
- Lời dặn model `apps/agent/agent/lib/okr/chi-dan-tom-tat.ts` và nhãn trạng thái bản mẫu `apps/app/app/proto/**`.
- `CONTEXT.md` (đổi trong #557).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Known limits — lối 2 chủ kho chọn 24/10 sau S4 vòng 2:
  - Bài kiểm của bảy hồ sơ đã ký đổi chuỗi kỳ vọng theo bảng cặp `rang/cap-chu.json`; máy không kiểm từng khối diff
    có đúng một cặp hay không — người review đọc diff bảy tệp ở PR. Mỗi hồ sơ chủ vẫn có một dòng sổ `fix`.
  - Thước màn `hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs` mở ngăn mục tiêu thẳng bằng
    `/okr?record=objective:<id>` thay cho bấm tên KR ở Của tôi: tên KR nay mở KR, và Của tôi của người dùng mẫu không
    còn nút nào mở mục tiêu. Thước đó thôi đo đường bấm vào; các bước trong ngăn giữ nguyên. Một dòng sổ `fix`.
- Known limits — lối A chủ kho chọn 25/10 sau S4 vòng 3:
  - Thước màn `gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs` mở ngăn mục tiêu G bằng URL như thước giữ chỗ, cùng
    lý do. Bộ quét `ngan-kr-mot-cho/rang/quet-loi.mjs` thêm bốn ô ma trận cho bốn chỗ mở KR của vòng này. Mỗi hồ sơ một
    dòng sổ `fix`.
  - Năm thước bấm `data-mo-muc-tieu` đã đỏ sẵn trên onehub 25/10, hỏng y hệt trên cây SV6: `okr-cua-toi-tach-theo-doi`,
    `cap-nhat-tuan-okr` (thước màn), `ux-lai-thu-8c-okr`, `tro-ly-okr-de-xuat`, `the-gop-y-okr`. Vòng này không sửa.
    Bốn thước trong số đó, trừ `cap-nhat-tuan-okr`, là eval `ui-check`. AC-6 chỉ phủ eval `test` và `script`, nên E6 không
    chạy bốn thước này; chúng được chạy tay ngày 25/10.
- Known limits — lối A chủ kho chọn 25/10 sau S4 vòng 4:
  - E6 chạy lại một lần mỗi mục đỏ trên cây trước khi so với nền. Lần hai xanh thì in «CHAP CHON» và tính là xanh, như làn
    ghim lại của kit. Thước `canh-kr-okr/rang/man-canh-kr.mjs` chập chờn ngay trên cây SV6: chạy riêng hai lần, lần đầu đỏ
    1/163 vì lỗi hydration trên `/okr`, lần sau xanh 163/163. Một lỗi thật đỏ ở cả hai lần thì vẫn là «SAI»; chiều đỏ
    hồi quy giữ điều đó.
  - Hai thước `ui-check` khác cũng bấm `data-mo-muc-tieu`, chạy tay ngày 25/10, hỏng y hệt trên onehub sạch, vòng này không
    sửa: `va-tro-ly-okr-sau-thu` (tràn ngang 454>390 ở khổ 390) và `gop-y-dung-cho` (E2: `aria-expanded` của hàng A không đổi).

- Không migration, không thủ tục API mới; chỉ `apps/app` và nhãn tin nhắc ở `apps/agent`.
- AC-4: `bang-kr.tsx` có sẵn `SoViecKr` mở KR bằng `useOpenRecord()`; tên KR dùng cùng đường, `Button variant="link"`
  của `packages/ui` (như tên KR ở `phan-kr-phu-trach.tsx`).
- Không có eval `ui-check`: thay đổi là đích mở của một cú bấm, đo bằng DOM dựng thành phần thật và đọc URL
  `?record=` — xem dòng `descope` «bỏ ui-observed».
