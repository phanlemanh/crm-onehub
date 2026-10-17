---
schema_version: 1
feature: "Các hồ sơ đã ký đỏ sẵn trên onehub xanh lại: hết lỗi hydration khi mở thẳng record=, hết 403 khi quản trị mở cuộc soạn của người khác, thước quét chuỗi đúng định nghĩa, mang các sửa gốc từ nhánh DH2"
slug: ve-sinh-do-san-onehub
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [web, tooling]
status: verified
design_doc: docs/superpowers/specs/2026-10-16-ve-sinh-do-san-onehub-design.md
approved_by: manh
approved_at: 2026-10-15T23:04:27Z
---

# Acceptance Contract: ve-sinh-do-san-onehub

## Context

Tách từ PR DH2 (`trang-don-vi-mot-bang`) theo đường B chủ kho chọn 16/10 (ô cơ hội `opportunity.md`). Đỏ sẵn đo
trên `onehub` `eb5ab4269` (nhật ký `do-san-onehub/*.log` trong worktree DH2): `okr-soat-anh-luot-3` E9/E10/E11/E12/E13,
`toan-canh-okr` E2/E21, `soan-okr-trong-khung` E10, `dat-okr-trong-crm` E13/E16/E21 (hydration chập chờn),
`khung-trang-cai-dat` E16 (do `moi-chuoi` của `man-cai-dat-noi-tieng-viet`), `muc-tieu-va-kr` E14 (chạy lại
`dat-okr-trong-crm`). Gốc của vòng: `onehub` `f46c0bbda`. Cơ chế hydration và cách B: thiết kế, mục 1.

Ma trận hydration (AC-1, AC-2, AC-5) — bốn ô, mỗi ô ở 1440 và 390, mỗi khổ 5 lượt tải cứng:

| Ô | Đường | Người xem |
| --- | --- | --- |
| D1 | `/<slug>/deals?record=deal:seed-deal-wise-1` | quản trị |
| D2 | `/<slug>/okr/theo-don-vi?kyOkr=<quý>&record=deal:seed-deal-wise-1` | quản trị |
| D3 | `/<slug>/okr/theo-don-vi?kyOkr=<quý>&record=soan:<cuộc của trưởng>` | quản trị (không phải người mở) |
| D4 | như D3 | trưởng phòng ban (người mở cuộc) |

## Criteria

- AC-1: Given phiên đo riêng (kho `crm_<cây>_do`, app và API của chính cây) với thoả thuận seed `seed-deal-wise-1`
  và một cuộc soạn đang mở của trưởng phòng ban, When mở thẳng bốn ô D1–D4 ở 1440 và 390, mỗi khổ 5 lượt tải cứng
  (40 lần mở), Then không lần nào có lỗi hydration (`pageerror` hay `console.error` khớp `/hydrat/i`); ngăn mở đúng
  bản ghi (tiêu đề ngăn là tên thoả thuận seed, hoặc khung soạn của cuộc đó); trang dưới ngăn có dữ liệu (bảng thoả
  thuận có dòng, hoặc Theo đơn vị có mục tiêu); lần mở có lỗi in NGUYÊN VĂN thông báo React, không cắt.
- AC-2: Given bản sao cây ở đỉnh nhánh trong một worktree tạm, với `apps/app/app/(app)/[slug]/layout.tsx` và
  `apps/app/components/crm/record-sheet/record-sheet-host.tsx` trả về bản merge-base (ngăn bản ghi không nạp sẵn, mở
  ngay khi hydrate), When chạy cùng răng của AC-1 trên bản sao (10 lần mở mỗi ô), Then răng
  in số lỗi hydration của TỪNG ô D1–D4 kèm nhãn «tái hiện» (≥3/10), «tái hiện yếu» (1–2/10) hoặc «không tái hiện»
  (0/10); đạt khi ≥1 ô «tái hiện»; báo cáo bằng chứng chỉ tính AC-1 là bằng chứng sửa cho ô «tái hiện», ô khác ghi
  rõ nhãn của nó; cây làm việc không đổi byte nào (porcelain `-uall` cộng `hash-object` mọi tệp đang sửa hay chưa
  theo dõi).
- AC-3: Given module danh sách khoá nạp sẵn `apps/app/lib/ngan-ban-ghi-nap-san.ts` và một bộ đệm truy vấn giả lập
  thứ tự stream (ranh giới ngăn hydrate với trạng thái nạp sẵn TRƯỚC, ngăn tạo truy vấn của nó, rồi ranh giới trang
  hydrate sau), When thành phần trang đọc từng khoá trong danh sách ở lần render đầu, Then mỗi khoá có dữ liệu ngay
  lần render đầu; vai chỉ-OKR nhận đúng `["okr.access"]`, vai khác nhận đúng `["okr.access", "users.list",
  "giaiDoan.list"]` (cộng khoá bước 0 đo được, nếu có); và trên bản sao bỏ `users.list` khỏi danh sách, bài đỏ với
  thông điệp ghim «trang doc rong luc hydrate: users.list».
- AC-4: Given khung bài kiểm khu soạn với một cuộc đang soạn do «hai» mở, When người xem là quản trị khác «hai»,
  Then không lần nào gọi `loadThread` và khung không kẹt ở «đang mở»; When người xem là «hai», Then gọi `loadThread`
  đúng một lần; và trên bản sao bỏ điều kiện người mở trong `usePhienCuoc`, ca quản trị đỏ với thông điệp ghim
  «tai luong cuoc nguoi khac». Các bài soạn hiện có trong suite app vẫn xanh.
- AC-5: (cross-layer) Given cùng lượt đo của AC-1, When mở D3 (quản trị, cuộc của người khác), Then trình duyệt không
  gửi yêu cầu nào tới `/eve/agents/okr` và không nhận phản hồi 403 nào; When mở D4 (người mở), Then có ≥1 yêu cầu
  tới `/eve/agents/okr` và không yêu cầu nào trả 403; tệp route `app/eve/agents/okr/eve/v1/[...path]/route.ts`
  không đổi so với merge-base.
- AC-6: [chờ Hỏi-1 — cách khai `hinh`; dưới đây theo lối khuyến nghị (a)] Given `rang/moi-chuoi.mjs` của hồ sơ đã
  ký `man-cai-dat-noi-tieng-viet` với `hinh` khai trong `thuoc_jsx_ky_thuat` của bản khai lát cài đặt, When chạy `cai_dat_moi_chuoi` và `ktcd_khong_hoi_quy` ở đỉnh nhánh, Then cả hai thoát 0; trên
  bản sao bỏ `hinh` khỏi bản khai, `moi-chuoi` thoát 1 và in đúng hai dòng «CON TIENG ANH» cho
  `settings/page.tsx:39` và `settings/currencies/page.tsx:36` `[thuoc:hinh] "the"`; trên bản sao chèn
  `<p>Loading settings</p>` vào `settings/page.tsx`, `moi-chuoi` thoát 1 và in dòng «CON TIENG ANH» mang
  `"Loading settings"`.
- AC-7: Given các sửa gốc mang từ nhánh DH2 cho `okr-soat-anh-luot-3` và `khung-trang-cai-dat`, When chạy
  `osa_soi_ma`, `osa_san_thiet_ke`, `osa_ktcd_khong_trinh_duyet` ở đỉnh nhánh, Then cả ba thoát 0; `soi-ma` và
  `san-thiet-ke` nêu cặp gộp PR #146 (`679432a0f^1..679432a0f`) thay cho merge-base; `bang-chu-ky.tsx` không còn
  `new Date`.
- AC-8: Given sửa gốc mang sang cho `soan-okr-trong-khung`, When chạy `sk_luat` ở đỉnh nhánh, Then thoát 0 và mục 1,
  mục 3, ranh giới đọc diff cặp gộp PR #344 (`d089cb8da^1..d089cb8da`).
- AC-9: Given phiên đo riêng, When chạy thước trình duyệt đã ký `tco_man_chrome` (`toan-canh-okr`) và
  `dok_man_chrome` (`dat-okr-trong-crm`) ở đỉnh nhánh, Then cả hai thoát 0 (E2 đếm sau khi mở nhóm «Đã bỏ», E21 đọc
  breadcrumb bằng `data-slot`, không lỗi hydration ở `dat-okr-trong-crm`).
- AC-10: Given diff `merge-base..HEAD`, When soát các tệp dưới `_acceptance/<hồ sơ đã ký>/`, Then mọi đoạn đổi trong
  răng mang một chú thích khai có tên vòng (`F8 neo (ve-sinh-do-san-onehub):`, `ve-sinh-do-san-onehub
  cach-toi:` hoặc `ve-sinh-do-san-onehub khai-trang:`); không `evals.yaml` đã ký nào thêm `status: not-run` hay `expected_exit` khác 0; tệp route
  `/eve/agents/okr` không đổi. Bản sao bỏ một chú thích khai thì răng đỏ gọi tên tệp.
- AC-11: Given đỉnh nhánh sau lượt ghim lại, When chạy răng ghim, Then mỗi hồ sơ trong tập {`okr-soat-anh-luot-3`,
  `toan-canh-okr`, `soan-okr-trong-khung`, `khung-trang-cai-dat`, `man-cai-dat-noi-tieng-viet`,
  `dat-okr-trong-crm`, `muc-tieu-va-kr`} cộng mọi hồ sơ đã ký khác có tệp `_acceptance/<slug>/` trong diff có dòng
  `repin` cuối với mọi mã thoát 0 và cây ngoài `_acceptance/` trùng đỉnh nhánh; `pre-merge-check.sh --base
  origin/onehub` không có vi phạm nào ngoài hồ sơ `ve-sinh-do-san-onehub`; bản sao xoá dòng repin cuối của một hồ sơ
  thì răng đỏ gọi tên hồ sơ đó.

- AC-12: Given phiên đo riêng ở đỉnh nhánh, When tải cứng tám trang KHÔNG có `record=` — tổng quan `/<slug>`,
  `/deals`, `/contacts`, `/companies`, `/okr`, `/okr/theo-don-vi`, `/okr/toan-canh`, `/settings/giai-doan` — ở 1440
  và 390, 2 lượt mỗi khổ (32 lần mở), Then không lần nào có lỗi hydration; và ngăn bản ghi chỉ đổ trạng thái nạp sẵn
  vào bộ đệm khi ngăn có bản ghi (bài DOM: không bản ghi → bộ đệm không có khoá nạp sẵn nào sau render).

## Coverage

Bỏ quét bằng morphological-scan (dòng sổ `descope` «bỏ coverage-scan …»): phạm vi là danh sách đỏ sẵn đã đo, không
phải không gian liệt kê. Riêng hydration khai trục tay:

| Trục | Giá trị | Phủ |
| --- | --- | --- |
| Trang | Thoả thuận, Theo đơn vị | D1 · D2–D4 |
| Loại bản ghi | deal, soan | D1–D2 · D3–D4 |
| Khổ | 1440, 390 | mọi ô |
| Người xem | quản trị, trưởng (người mở), chỉ-OKR | D1–D3 · D4 · AC-3 (đơn vị, không trình duyệt) |
| Thứ tự stream | ngăn trước trang, trang trước ngăn | AC-3 (giả lập ngăn trước) · AC-1 (10 lần mở mỗi ô) |
| Có `record=` hay không | có, không | AC-1 · AC-12 (hồi quy do nạp sẵn) |

Ô bỏ ngỏ: `record=` loại khác (objective, kr, so-kr, hoi-okr, viec) trên mọi trang, và `record=deal|soan` trên trang
ngoài D1–D4 — Out of scope.

## Đường đo

- Ngưỡng SỐNG «làn ghim lại xanh cho bảy hồ sơ»: số từ dòng `repin` của từng hồ sơ — AC-11 (E18).
- «S4 PASS»: báo cáo bằng chứng của vòng — mọi AC.
- «Lượt ghim lại của PR DH2 không vấp đỏ sẵn thuộc bốn mục»: đo sau gộp, ở vòng DH2 — ngoài vòng này.

## Out of scope

- Hydration khi có `record=` ở các loại bản ghi và trang ngoài bốn ô D1–D4 (không có trong đỏ sẵn đã đo); trang
  không `record=` thì AC-12 đo hồi quy.
- Nới route `/eve/agents/okr` cho quản trị đọc luồng của người khác — đổi bảo mật, không làm.
- Các đỏ sẵn khác trên onehub do Mac Studio giữ (`bo-xuong-kara` E10, `kara-mot-ten` E15b,
  `ly-do-tu-choi-nop-theo-locale` E8, `hop-thoai-giu-cho-dang-nhap` E9/E11) và đỏ sẵn khác mà `ho-so-cham` liệt
  là «do san o B» (`so-okr-tu-chay`, `canh-kr-okr`, `cap-nhat-tuan-okr`, `ux-lai-thu-8c-okr`).
- Bốn lát `moi-chuoi` khác (`cai-dat-con-lai`, `agent-builder`, `cua-so-tro-chuyen`, `tong-quan-va-khung`) đang đỏ
  trên onehub vì chữ tiếng Anh thật — việc dịch, không phải thước.
- Phần thuộc trang đơn vị của DH2.

## Notes

- Ghim lại đi một lượt `repin-lane.mjs` cho bảy hồ sơ, xin lượt `ghim-lai` qua Điều phối M5.
- `cham-tep` cho các hồ sơ đã ký bị chạm đăng ở crm #375 trước Cổng Phạm vi.
