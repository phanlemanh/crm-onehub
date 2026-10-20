---
schema_version: 1
feature: Hồ sơ đã ký hoá cũ oan được ghim lại hoặc sửa thước một lượt, sau khi kit có K-A
slug: don-ho-so-cu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: approved
approved_by: Manh Phan
approved_at: 2026-10-20T12:28:26Z
design_doc: _acceptance/don-ho-so-cu/design.md
---

# Acceptance Contract: don-ho-so-cu

## Context

Trên đỉnh `onehub` 20/10 (`b32a1495f`) lưới trước-gộp chạy không `--base` báo 281/299 hồ sơ đã ký «evidence is stale»:
204 hồ sơ cũ vì một gộp chạm đúng tệp eval của chúng khai, 77 hồ sơ rơi về luật thô vì có eval không khai `paths`. Lệnh
giữ tươi của kit 2.33 (`giu-tuoi.mjs`) chỉ gọi tên hồ sơ tồn đọng, không ghim chúng. Vòng này dọn tồn đọng một lượt:
ghim lại bằng làn máy, và hồ sơ nào đỏ thì sửa thước (luật 23 của đợt) hoặc gọi tên vì sao không sửa.

Từ dùng trong tiêu chí: «lưới» là `scripts/pre-merge-check.sh` chạy không `--base`; «hồ sơ cũ» là hồ sơ lưới in
`VIOLATION [<slug>]: evidence is stale`; «tập ghim» là hồ sơ cũ mà bộ lọc `paths` áp cho, cộng các ca gọi tên ở
`design.md`; «làn» là `repin-lane.mjs --tung-ho-so --write`; «sổ xử lý» là `_acceptance/don-ho-so-cu/xu-ly.json`.

Source input: hàng F35 của `docs/plan/lo-trinh-okr.json`, luật 23–24 của đợt lo-trinh-tin-hieu, bàn giao F1 sau F26; ô
`_acceptance/don-ho-so-cu/opportunity.md`.

## Criteria

- AC-1: Given một sha của kho, When chạy `rang/kiem-ke.mjs --sha <sha>`, Then `kiem-ke.json` liệt đúng tập hồ sơ mà lưới
  in «evidence is stale» trên sha đó — không thừa, không thiếu — mỗi hồ sơ một nhóm `loc-ap` hay `thieu-paths:<lý do>` lấy
  từ dòng NOTE của chính lưới; và một hồ sơ được làm cũ thêm trong bản sao thì xuất hiện trong kiểm kê của bản sao.
- AC-2: Given `kiem-ke.json` của sha gốc vòng và danh sách ca gọi tên, When chạy `rang/lo.mjs`, Then `lo.json` chứa mỗi hồ
  sơ của tập ghim đúng một lần, không chứa hồ sơ nhóm `thieu-paths` nào ngoài ca gọi tên, và mỗi lô ước dưới trần
  `feature_loop.repin_budget_min`.
- AC-3: Given HEAD của nhánh vòng sau khi gộp `onehub` lần cuối, When chạy `rang/doi-chieu.mjs`, Then mọi hồ sơ của tập
  ghim hoặc không còn cũ trên HEAD hoặc có đúng một dòng trong sổ xử lý với cách xử khác `sua-thuoc`; hồ sơ có dòng
  `sua-thuoc` phải không còn cũ, với dòng `repin` mới nhất có `sha` đi sau commit sửa; hồ sơ sai một trong hai làm thước
  đỏ và gọi tên hồ sơ.
- AC-4: Given sổ xử lý, When đọc bằng khuôn của nó, Then mỗi dòng mang hồ sơ, eval, một trong bốn cách xử
  (`sua-thuoc` · `loi-kit` · `ngoai-pham-vi` · `cho-lan-chu`) và `run_id` của lượt làn mà tệp
  `_acceptance/don-ho-so-cu/lan/<run_id>.json` ghi eval ấy của hồ sơ ấy đỏ; `ngoai-pham-vi` mang làn chủ và mã việc phụ đã
  gửi; `loi-kit` mang đường tới việc đã mở ở kho kit; `cho-lan-chu` mang PR đang chờ gộp của làn chủ.
- AC-5: Given một dòng `sua-thuoc`, When kiểm bằng `rang/sua-thuoc.mjs`, Then commit sửa chỉ chạm thước của chính hồ sơ
  đó (`rang/`, `evals.yaml` của nó, hay khoá lệnh của nó trong `_acceptance/config.yaml`); có lượt đối chứng dương XANH
  trên bản sửa và bản tiêm ĐỎ với đúng thông điệp ghim; `decisions.jsonl` của hồ sơ có dòng `fix` mang `decided_by` chủ
  kho; và lời mọi `AC-n` trong `contract.md` của hồ sơ không đổi so với gốc vòng.
- AC-6: Given mọi hồ sơ đã ký mà vòng (PR lô và PR vòng) chạm, When so cây `_acceptance/<hồ sơ>/` giữa gốc vòng và HEAD,
  Then chỉ `run-log.jsonl`, `evidence-report.md`, `decisions.jsonl` đổi — trừ hồ sơ có dòng `sua-thuoc`, được đổi thêm đúng
  các tệp thước mà dòng đó khai; và hồ sơ có dòng cách xử khác `sua-thuoc` không đổi tệp nào.
- AC-7: Given các ca gọi tên ở `design.md` (mười hai hồ sơ), When vòng xong, Then mỗi ca hoặc không còn cũ trên HEAD hoặc
  có dòng trong sổ xử lý; `tac-nhan-va` còn cũ thì dòng của nó là `loi-kit`; hai hồ sơ của K6a không còn cũ và PR #411 đã
  đóng với lời trỏ PR của vòng.
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
- Trục cách xử: `sua-thuoc` (AC-5, AC-8) | `loi-kit` | `ngoai-pham-vi` | `cho-lan-chu` (AC-4, AC-8)
- Trục cây hồ sơ đã ký: tệp sổ được phép đổi | tệp thước khi sửa | hồ sơ đỏ không đổi gì (AC-6, AC-9)
- Trục PR: PR lô | PR vòng (AC-6, AC-9)
- Ca gọi tên: mười hai hồ sơ (AC-7)

## Đường đo

Bỏ đường đo — ô cơ hội chưa khai ngưỡng (entry «bỏ đường-đo» trong `decisions.jsonl`). Số đếm hồ sơ cũ trước và sau vòng
nằm sẵn trong `kiem-ke.json` của gốc vòng và của HEAD.

## Out of scope

- 77 hồ sơ nhóm `thieu-paths` ngoài ca gọi tên: không ghim, không khai `paths` (Hỏi-1, một hàng riêng).
- Sửa mã sản phẩm để làm xanh một hồ sơ đỏ.
- Sửa lỗi của bộ kit tại chỗ — mở việc ở kho kit.
- Đổi lời AC hay ý của `expected` ở hồ sơ đã ký ngoài phần thước gãy.
- Ghim các ô ui-check/judgment — làn máy không chạy chúng; lượt ghim chỉ nói ra chúng (`evals_not_machine`).
- Giữ tươi sau khi vòng gộp: việc của `giu-tuoi.mjs` theo từng khoảng gộp, không của vòng này.

## Notes

- Mỗi lô cắt từ đỉnh `onehub`, xin lượt `ghim-lai` của đợt, mở PR lô và gộp qua lượt vk; khoá nhả giữa hai lô (Hỏi-2).
- Hồ sơ ghim ở lô sớm có thể cũ lại do gộp trong lúc dọn — bước cuối chạy `giu-tuoi.mjs` trước đối chiếu (AC-3).
