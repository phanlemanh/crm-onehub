---
schema_version: 1
feature: Hồ sơ đã ký hoá cũ oan được ghim lại hoặc sửa thước một lượt, sau khi kit có K-A
slug: don-ho-so-cu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: draft
approved_by:
approved_at:
design_doc: _acceptance/don-ho-so-cu/design.md
---

# Acceptance Contract: don-ho-so-cu

## Context

Trên đỉnh `onehub` 20/10 (`b32a1495f`) lưới trước-gộp chạy không `--base` báo 281/299 hồ sơ đã ký «evidence is stale»:
204 hồ sơ cũ vì một gộp chạm đúng tệp eval của chúng khai, 77 hồ sơ rơi về luật thô vì có eval không khai `paths`. Lệnh
giữ tươi của kit 2.33 (`giu-tuoi.mjs`) chỉ gọi tên hồ sơ tồn đọng, không ghim chúng. Vòng này dọn tồn đọng một lượt:
ghim lại bằng làn máy, và hồ sơ nào đỏ thì sửa thước (luật 23 của đợt) hoặc gọi tên vì sao không sửa.

Thu phạm vi 20/10 (chủ kho, «Thực hiện theo lời khuyên.»): chia lô theo giờ máy thật cho ra 17 lô, ~21,6 giờ máy cho 214
hồ sơ. Vòng chỉ ghim lô 8 của bản chia ấy (có `dot-hoi-y-tuong-okr`), các hồ sơ đang chặn một PR mở, và hai hồ sơ của K6a
(luật 24: F35 thay PR #411). Phần còn lại không ghim hàng loạt: PR nào chạm tới hồ sơ thì tự ghim hồ sơ đó — ghim lười rẻ
hơn ghim trước khi tính giờ máy trên mỗi kết quả giao.

Sửa 22/10 sau S3 (trình ký lại): đo thật cho thấy hồ sơ đã ghim xanh và gộp lại cũ trong vài giờ vì làn khác gộp liên
tục, nên «tươi trên HEAD» không đo được điều vòng làm — và đá với mục ngoài phạm vi «giữ tươi sau khi vòng gộp». AC-3 nay
đo «đã có một lượt ghim xanh trên `onehub` trong khoảng vòng chạy». Giám sát MBP chọn ghim lười cho bốn hồ sơ có eval
không khai paths (bo-cau-hoi-mau, lich-su-va-luu-tru-trang, ngan-ho-so-trong-lo-trinh, thu-haiku-tro-ly-okr): thêm cách
xử `ghim-luoi`.

Từ dùng trong tiêu chí: «lưới» là `scripts/pre-merge-check.sh` chạy không `--base`; «hồ sơ cũ» là hồ sơ lưới in
`VIOLATION [<slug>]: evidence is stale`; «tập ghim» là hồ sơ của lô 8 trong `lo-goc.json`, cộng hồ sơ cũ mà một
PR mở (không phải của vòng) chạm thư mục mà không tự ghim lại theo ảnh chụp `chan-pr.json`, cộng hai hồ sơ K6a, trừ
`okr-soat-anh-luot-3` (chờ chủ kho ở PR #499); «làn» là `repin-lane.mjs --tung-ho-so --write`; «sổ xử lý» là `_acceptance/don-ho-so-cu/xu-ly.json`.

Source input: hàng F35 của `docs/plan/lo-trinh-okr.json`, luật 23–24 của đợt lo-trinh-tin-hieu, bàn giao F1 sau F26; ô
`_acceptance/don-ho-so-cu/opportunity.md`.

## Criteria

- AC-1: Given một sha của kho, When chạy `rang/kiem-ke.mjs --sha <sha>`, Then `kiem-ke.json` liệt đúng tập hồ sơ mà lưới
  in «evidence is stale» trên sha đó — không thừa, không thiếu — mỗi hồ sơ một nhóm `loc-ap` hay `thieu-paths:<lý do>` lấy
  từ dòng NOTE của chính lưới; và một hồ sơ được làm cũ thêm trong bản sao thì xuất hiện trong kiểm kê của bản sao.
- AC-2: Given `kiem-ke-goc.json`, `lo-goc.json` và ảnh chụp PR mở `chan-pr.json`, When chạy `rang/lo.mjs`, Then `lo.json`
  chứa đúng tập ghim — mỗi hồ sơ đúng một lần, không có `okr-soat-anh-luot-3`, không thừa hồ sơ nào ngoài tập — danh sách
  chặn trong ảnh chụp tính lại được từ chính danh sách PR mở đã chụp, và mỗi lô ước dưới trần
  `feature_loop.repin_budget_min`.
- AC-3: Given `onehub` sau khi các PR lô gộp, When chạy `rang/doi-chieu.mjs`, Then mọi hồ sơ của tập ghim hoặc có trên
  `onehub` một dòng `repin` mà `sha` là hậu duệ của gốc vòng và mọi eval máy đạt (do PR lô của vòng hay PR khác ghi), hoặc
  có đúng một dòng trong sổ xử lý với cách xử khác `sua-thuoc`; hồ sơ có dòng `sua-thuoc` phải có dòng `repin` như thế đi
  sau commit sửa; hồ sơ sai làm thước đỏ và gọi tên hồ sơ.
- AC-4: Given sổ xử lý, When đọc bằng khuôn của nó, Then mỗi dòng mang hồ sơ, một trong năm cách xử (`sua-thuoc` ·
  `loi-kit` · `ngoai-pham-vi` · `cho-lan-chu` · `ghim-luoi`) và lý do; bốn cách đầu mang eval và `run_id` của lượt làn mà
  tệp `_acceptance/don-ho-so-cu/lan/<run_id>.json` ghi eval ấy của hồ sơ ấy đỏ; `ghim-luoi` mang mã dòng `descope` trong
  `decisions.jsonl` của vòng; `ngoai-pham-vi` mang làn chủ và mã việc phụ đã gửi; `loi-kit` mang đường tới việc đã mở ở kho
  kit; `cho-lan-chu` mang PR đang chờ gộp của làn chủ.
- AC-5: Given một dòng `sua-thuoc`, When kiểm bằng `rang/sua-thuoc.mjs`, Then commit sửa chỉ chạm thước của chính hồ sơ
  đó (`rang/`, `evals.yaml` của nó, hay khoá lệnh của nó trong `_acceptance/config.yaml`); có lượt đối chứng dương XANH
  trên bản sửa và bản tiêm ĐỎ với đúng thông điệp ghim; `decisions.jsonl` của hồ sơ có dòng `fix` mang `decided_by` chủ
  kho; và lời mọi `AC-n` trong `contract.md` của hồ sơ không đổi so với gốc vòng.
- AC-6: Given mọi hồ sơ đã ký mà commit của vòng (PR lô và PR vòng) chạm, When so cây `_acceptance/<hồ sơ>/`, Then commit
  của vòng chỉ chạm `run-log.jsonl`, `evidence-report.md`, `decisions.jsonl` — trừ hồ sơ có dòng `sua-thuoc`, được chạm thêm
  đúng các tệp thước mà dòng đó khai; và hồ sơ có dòng cách xử khác `sua-thuoc` không còn khác `onehub` ở tệp nào.
- AC-7: Given hai hồ sơ của K6a (`khung-khong-con-dung-chu`, `lich-su-va-luu-tru-trang`), When vòng xong, Then mỗi hồ sơ
  đạt AC-3 (lượt ghim xanh trên `onehub` trong vòng, hoặc dòng `ghim-luoi`), và PR #411 đã đóng với lời trỏ PR của vòng.
- AC-8: Given luật 23 («chỉ khi làn chủ hồ sơ không có vòng đã ký chờ gộp»), When định sửa thước một hồ sơ, Then dòng
  `sua-thuoc` mang ảnh chụp lúc sửa của mọi PR mở có hợp đồng đã ký trong diff (vòng đã ký chờ gộp), và khi ảnh chụp không
  rỗng thì mang thêm câu hỏi trên #375 với lời làn chủ trả lời là không có vòng nào của mình trong đó; thiếu lời trả lời thì
  hồ sơ là `cho-lan-chu`.
- AC-9: Given HEAD của nhánh vòng và HEAD của mỗi nhánh lô, When chạy lưới với `--base origin/onehub` như CI chạy trên PR,
  Then lưới sạch; và trong bản sao, thêm một dòng vào sổ chạy của một hồ sơ đang cũ thì lưới đỏ gọi tên hồ sơ đó.

## Coverage

Bỏ coverage-scan — không gian là bốn trục rời đã liệt hết dưới đây và ở bảng «Các ca đã gọi tên» của design (entry «bỏ
coverage-scan» trong `decisions.jsonl`).

- Trục nhóm cũ: `loc-ap` (AC-1, AC-2, AC-3) | `thieu-paths` (AC-1, AC-2 — ngoài tập ghim)
- Trục kết cục làn: xanh → ghim (AC-3) | đỏ → sổ xử lý (AC-3, AC-4)
- Trục cách xử: `sua-thuoc` (AC-5, AC-8) | `loi-kit` | `ngoai-pham-vi` | `cho-lan-chu` | `ghim-luoi` (AC-4, AC-8)
- Trục cây hồ sơ đã ký: tệp sổ được phép đổi | tệp thước khi sửa | hồ sơ đỏ không đổi gì (AC-6, AC-9)
- Trục PR: PR lô | PR vòng (AC-6, AC-9)
- Nguồn của tập ghim: lô 8 của bản chia gốc | hồ sơ chặn PR mở | K6a | trừ hồ sơ chờ chủ kho (AC-2, AC-7)

## Đường đo

Bỏ đường đo — ô cơ hội chưa khai ngưỡng (entry «bỏ đường-đo» trong `decisions.jsonl`). Số đếm hồ sơ cũ trước và sau vòng
nằm sẵn trong `kiem-ke.json` của gốc vòng và của HEAD.

## Out of scope

- 77 hồ sơ nhóm `thieu-paths` ngoài ca gọi tên: không ghim, không khai `paths` (Hỏi-1, một hàng riêng).
- ~200 hồ sơ cũ còn lại ngoài tập ghim: không ghim hàng loạt; PR chạm tới hồ sơ nào thì tự ghim hồ sơ đó (thu phạm vi
  20/10). Mười ca thước gãy đã gọi tên ở `design.md` mà không nằm trong tập ghim được sửa khi một PR chạm tới, theo luật 23.
- Lỗi gốc — vì sao gần như mọi hồ sơ đã ký cũ sau mỗi gộp, và lệnh giữ tươi không chọn được một hồ sơ — thuộc kho kit.
- Sửa mã sản phẩm để làm xanh một hồ sơ đỏ.
- Sửa lỗi của bộ kit tại chỗ — mở việc ở kho kit.
- Đổi lời AC hay ý của `expected` ở hồ sơ đã ký ngoài phần thước gãy.
- Ghim các ô ui-check/judgment — làn máy không chạy chúng; lượt ghim chỉ nói ra chúng (`evals_not_machine`).
- Giữ tươi sau khi vòng gộp: việc của `giu-tuoi.mjs` theo từng khoảng gộp, không của vòng này.

## Notes

- Mỗi lô cắt từ đỉnh `onehub`, xin lượt `ghim-lai` của đợt, mở PR lô và gộp qua lượt vk; khoá nhả giữa hai lô (Hỏi-2).
- Hồ sơ ghim ở lô sớm có thể cũ lại do gộp trong lúc dọn — bước cuối chạy `giu-tuoi.mjs` trước đối chiếu (AC-3).
- Giới hạn đã biết, ghi khi trình ký lại 22/10 (sổ xử lý là nguồn chi tiết):
  - Bốn hồ sơ có eval không khai paths ghim lười, chưa tươi trên onehub: bo-cau-hoi-mau, lich-su-va-luu-tru-trang,
    ngan-ho-so-trong-lo-trinh, thu-haiku-tro-ly-okr. Vì vậy K6a chỉ ghim lại được khung-khong-con-dung-chu; #411 đã đóng.
  - tat-preview-agent-okr và ba-ho-so-do-san: thước gãy, chờ PR #439 (F31) đang sửa chính thước của chúng.
  - vai-chi-okr E13: thước đếm cũ (thanh điều hướng 3→5, 9→12 đổi có chủ đích), việc phụ F1-16 cho làn chủ.
  - Hồ sơ đã ghim xanh trong vòng vẫn có thể cũ lại sau các lần gộp kế — giữ tươi là việc của lệnh giữ tươi (ngoài phạm vi).
