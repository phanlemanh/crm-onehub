---
schema_version: 1
feature: Thước của hồ sơ đã ký không tự hết hạn — sửa paths chết của 20 eval ở 14 hồ sơ, neo hai thước «vòng này» còn đỏ vào cặp sha gộp của chính chúng, và kiểm kê phần còn lại
slug: thuoc-khong-tu-het-han
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-09
design_doc: _acceptance/thuoc-khong-tu-het-han/design.md
---

# Acceptance Contract: thuoc-khong-tu-het-han

## Context

Ô cơ hội (Cổng Đáng 07/10) nêu thước của hồ sơ đã ký tự đỏ ở các lượt sau vì đo theo mốc trôi. Tám PR thước cloud đã gộp;
luật 34 (anh đồng ý 08/10) thêm việc sửa paths chết của hồ sơ đã ký, chỉ sửa `paths`, không đổi lệnh hay kỳ vọng. Đo lại ngày
09/10 bằng chính bộ khớp `paths` của bộ kit: 20 eval ở 14 hồ sơ có glob chết, và hai thước `ha-tran-thang-hoi-zalo/E7`,
`slack-thieu-quyen-email/E10` còn đỏ trên mọi nhánh khác nhánh của chúng. Sự thật đo và cách làm ở `design.md`.

## Criteria

- AC-1: Given danh sách viết sẵn 20 eval ở 14 hồ sơ (`rang/danh-sach.json`) và mốc neo — commit gộp của vòng này trên
  `onehub` khi đã có, còn không thì tip của branch — When khớp từng glob trong `paths` của 20 eval đó với `git ls-tree` của mốc neo
  bằng `globToRe` của bộ kit, Then không glob nào khớp 0 tệp; và cùng phép quét chạy trên toàn bộ hồ sơ đã ký ở `a9e8bc75a` ra
  đúng 20 eval ấy (đối chứng dương ghim theo từng cặp hồ sơ/eval/glob).
- AC-2: Given danh sách viết sẵn 14 tệp `evals.yaml`, When so bản ở `a9e8bc75a` với bản ở mốc neo của AC-1, Then tập eval đổi
  `paths` đúng bằng 20 eval của danh sách; mọi trường khác (`id`, `criterion`, `executor`, `cmd`, `expected`, `status`…) giống
  hệt; không eval nào bị thêm hay xoá; ở hai hồ sơ của AC-3/AC-4 mọi eval khác E7/E10 giống hệt.
- AC-3: Given một cây tạm dựng từ `a9e8bc75a` cộng một commit tổng hợp chạm `_acceptance/hoi-crm-qua-zalo/` của hồ sơ đã ký
  khác, When chạy thước `ha-tran-thang-hoi-zalo/E7` bản cũ (lấy ở `a9e8bc75a`) và bản neo, Then bản cũ thoát 1 với thông điệp
  ghim của nó, bản neo thoát 0 và in «ok: khong cham ho so da ky» tính trên cặp `9dc1a037c^1..9dc1a037c` (PR #168); bản neo chạy
  ở hai ref khác nhau cho đầu ra giống hệt; bản sao thêm một tệp dưới `_acceptance/hoi-crm-qua-zalo/` vào tập đổi thì thoát 1
  gọi tên tệp đó.
- AC-4: Given cùng cây tạm cộng một commit không mang tên hồ sơ, When chạy thước `slack-thieu-quyen-email/E10` bản cũ và bản neo,
  Then bản cũ thoát 1 «COMMIT KHONG TEN», bản neo thoát 0 với đúng tập commit ghim sẵn trong `a62adb16..52e00cad2^2` (PR #187); trên
  dãy cha-đầu của `onehub` chỉ có đúng một commit gộp chạm mỗi hồ sơ của AC-3/AC-4; hai chiều đỏ tự thân `--gia-tep` (thoát 1
  «TEP HANG») và `--gia-commit-khong-ten` (thoát 1 «COMMIT KHONG TEN») vẫn đỏ.
- AC-5: Given `kiem-ke.md`, When chạy lại lệnh quét ghi trong tệp trên `git archive` của sha ghi trong tệp, Then ra đúng các con
  số và danh sách trong tệp: số tệp thước của hồ sơ đã ký nhắc mốc trôi, và số eval `script`/`test` chưa khai `paths`; lệnh quét đếm được
  mọi dạng mốc trôi của một bộ mẫu viết sẵn (`origin/onehub`, `onehub` trần, `merge-base`, `..HEAD`, `HEAD~N`, `@{u}`, `git
  ls-files`/`git diff` không ref) và KHÔNG đếm thước neo bằng sha cụ thể.
- AC-6: Given hai thước neo lại, When đọc `expected` mới của chúng, Then câu kỳ vọng nói mốc cố định (sha PR) thay cho
  `origin/onehub`, và tên eval, `criterion`, thông điệp ghim giữ nguyên; E7 bỏ vế kiểm trước-gộp với lý do ghi trong sổ của
  hồ sơ này (lượt kiểm chéo đêm `kiem-cheo-sau-gop` trả lời câu đó sau gộp).

## Coverage

- Trục A — khuôn chết của một glob: tệp dời/xoá | thư mục có `/` cuối | ngoặc vuông thoát kiểu shell | glob ký tự đại diện
  không khớp [thước CE: 20 eval chết đo bằng `globToRe` 09/10, đủ ba khuôn đầu; khuôn thứ tư `tro-ly-doc-kho/E5`]
- Trục B — mốc trôi của một thước: diff so `origin/onehub` | kiểm trước-gộp với `--base origin/onehub` | tập commit `^origin/onehub` |
  so tệp ở `merge-base` | trạng thái toàn kho ở `HEAD`/cây làm việc [thước CE: E7 (hai khuôn đầu), E10 (khuôn ba), `tra-loi-tin-nhac/E17` (khuôn bốn, đã vá)]
- Trục C — xử lý: sửa ngay (paths chết, hai thước còn đỏ) | kiểm kê để sửa khi đỏ (162 tệp, 868 eval) | chuyển bộ kit (luật chặn
  thước mới)
- Core → AC: A → AC-1, AC-2; B → AC-3, AC-4, AC-6; C → AC-5. `[GIẢ ĐỊNH]` phần «sửa khi đỏ» cho 162 tệp: chờ anh gạch ở Cổng 1.

## Đường đo

- «Lượt sau không phải ghim lại thừa vì paths chết, không đỏ vì hai thước tự hết hạn» · AC-1 và AC-3/AC-4 chạy trong làn ghim
  lại của chính hồ sơ này · đo tiếp bằng lượt kiểm chéo đêm F9 (số hồ sơ đỏ vì thước trong tệp ngày).

## Out of scope

- Sửa 162 tệp thước còn nhắc ref trôi — chỉ kiểm kê; sửa từng cái khi lượt kiểm chéo đêm gọi tên nó đỏ.
- Khai `paths` cho 868 eval thiếu — luật 34 chỉ liệt kê.
- Luật chặn thước MỚI dùng ref trôi — việc của bộ kit (chip sang `~/dev/acceptance-gate-kit`), không viết luật kho ở đây.
- `tra-loi-tin-nhac/E17` — đã vá, thoát 0.
- Thước migration theo merge-base của `giai-doan-thoa-thuan` — đã sửa ở #311 (giám sát P3-26).
- Vế «kiểm trước-gộp không vi phạm hồ sơ khác» của `ha-tran-thang-hoi-zalo/E7` bị bỏ và giao cho lượt kiểm chéo đêm F9. Tới khi
  anh cho cài `kiem-cheo:cai`, vế đó KHÔNG ai canh.

## Notes

- Sửa trong `_acceptance/` không làm bằng chứng của 16 hồ sơ bị chạm hoá cũ (lưới trước-gộp chỉ xét tệp ngoài `_acceptance/`).
  Ghim lại chỉ khi lưới thật sự đòi, gom một lượt làn ở cuối vòng.
