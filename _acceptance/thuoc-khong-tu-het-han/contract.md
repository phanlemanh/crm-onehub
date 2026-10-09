---
schema_version: 1
feature: Thước của hồ sơ đã ký không tự hết hạn — sửa paths chết của 10 eval ở 5 hồ sơ có thước còn sống, neo thước «vòng này» của ha-tran-thang-hoi-zalo vào cặp sha gộp, và kiểm kê phần còn lại
slug: thuoc-khong-tu-het-han
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: draft
design_doc: _acceptance/thuoc-khong-tu-het-han/design.md
---

# Acceptance Contract: thuoc-khong-tu-het-han

## Context

Ô cơ hội (Cổng Đáng 07/10) nêu thước của hồ sơ đã ký tự đỏ ở các lượt sau vì đo theo mốc trôi. Luật 34 (anh đồng ý 08/10) thêm
việc sửa paths chết của hồ sơ đã ký, chỉ sửa `paths`, không đổi lệnh hay kỳ vọng. Đo ở `a9e8bc75a` bằng chính bộ khớp `paths`
của bộ kit: 20 eval ở 12 hồ sơ có glob chết; hai thước `ha-tran-thang-hoi-zalo/E7`, `slack-thieu-quyen-email/E10` đỏ trên mọi
nhánh khác nhánh của chúng.

Phạm vi thu lại ngày 10/10 (anh chọn Lối 1): sửa paths làm lưới trước-gộp xét lại mọi hồ sơ bị chạm, và ghim lại 14 hồ sơ ấy
cho thấy 8 hồ sơ có thước đã chết hay tự hết hạn từ trước trên `onehub` (nhật ký `repin-20261009T221507Z-89441`). Vòng này chỉ
giữ các hồ sơ có thước còn sống; 8 hồ sơ đỏ, kể cả neo E10 của `slack-thieu-quyen-email`, chuyển sang F24. Sự thật đo ở
`design.md` và sổ quyết định.

## Criteria

- AC-1: Given danh sách viết sẵn `rang/danh-sach.json` (20 eval ở 12 hồ sơ, 10 eval ở 5 hồ sơ đánh dấu trong phạm vi) và mốc
  neo — commit gộp của vòng này trên `onehub` khi đã có, còn không thì tip của branch — When khớp từng glob trong `paths` của 10
  eval trong phạm vi với `git ls-tree` của mốc neo bằng `globToRe` của bộ kit, Then không glob nào khớp 0 tệp; và cùng phép quét
  chạy trên toàn bộ hồ sơ đã ký ở `a9e8bc75a` ra đúng 20 eval của danh sách (đối chứng dương ghim theo từng cặp hồ sơ/eval/glob).
- AC-2: Given 6 tệp `evals.yaml` vòng này sửa (5 hồ sơ của AC-1 và `ha-tran-thang-hoi-zalo`), When so bản ở `a9e8bc75a` với bản ở
  mốc neo của AC-1, Then tập eval đổi `paths` đúng bằng 10 eval trong phạm vi; mọi trường khác (`id`, `criterion`, `executor`,
  `cmd`, `expected`, `status`…) giống hệt; không eval nào bị thêm hay xoá; ở `ha-tran-thang-hoi-zalo` mọi eval khác E7 giống hệt.
- AC-3: Given một cây tạm dựng từ `a9e8bc75a` cộng một commit tổng hợp chạm `_acceptance/hoi-crm-qua-zalo/` của hồ sơ đã ký
  khác, When chạy thước `ha-tran-thang-hoi-zalo/E7` bản cũ (lấy ở `a9e8bc75a`) và bản neo, Then bản cũ thoát 1 với thông điệp
  ghim của nó, bản neo thoát 0 và in «ok: khong cham ho so da ky» tính trên cặp `9dc1a037c^1..9dc1a037c` (PR #168); bản neo chạy
  ở hai ref khác nhau cho đầu ra giống hệt; bản sao thêm một tệp dưới `_acceptance/hoi-crm-qua-zalo/` vào tập đổi thì thoát 1
  gọi tên tệp đó; commit gộp đầu tiên đưa `ha-tran-thang-hoi-zalo` lên `onehub` đúng là `9dc1a037c`.
- AC-5: Given `kiem-ke.md`, When chạy lại lệnh quét ghi trong tệp trên `git archive` của sha ghi trong tệp, Then ra đúng các con
  số và danh sách trong tệp: số tệp thước của hồ sơ đã ký nhắc mốc trôi, và số eval `script`/`test` chưa khai `paths`; lệnh quét
  đếm đúng dạng trôi của từng tệp trong ma trận mẫu viết sẵn (`origin/onehub`, `onehub` trần, `merge-base`, `..HEAD`, `HEAD~N`,
  `@{u}`, `git ls-files`/`git diff` không ref) và KHÔNG đếm thước neo bằng sha cụ thể.
- AC-6: Given thước E7 neo lại, When đọc `expected` mới của nó, Then câu kỳ vọng nói mốc cố định (sha PR) thay cho `origin/onehub`,
  tên eval, `criterion`, thông điệp ghim giữ nguyên; E7 bỏ vế kiểm trước-gộp với lý do ghi trong sổ của hồ sơ này (lượt kiểm chéo
  đêm `kiem-cheo-sau-gop` trả lời câu đó sau gộp).

## Coverage

- Trục A — khuôn chết của một glob: tệp dời/xoá | thư mục có `/` cuối | ngoặc vuông thoát kiểu shell | glob ký tự đại diện
  không khớp [thước CE: 20 eval chết đo bằng `globToRe` ở `a9e8bc75a`; trong phạm vi còn đủ: tệp dời/xoá (doi-ten, giai-doan,
  the-gop-y), ngoặc vuông (dien-thoai), glob không có trong lịch sử (nguon-keo-tha-reui); thư mục có `/` cuối chỉ có ở
  danh-sach-keo-chung — ngoài phạm vi]
- Trục B — mốc trôi của một thước: diff so `origin/onehub` | kiểm trước-gộp với `--base origin/onehub` | tập commit `^origin/onehub` |
  so tệp ở `merge-base` | trạng thái toàn kho ở `HEAD`/cây làm việc [thước CE: E7 (hai khuôn đầu); E10 (khuôn ba) chuyển F24]
- Trục C — xử lý: sửa ngay (paths chết ở hồ sơ thước còn sống, E7) | kiểm kê để sửa khi đỏ (186 tệp, 20 eval thiếu paths) |
  chuyển F24 (8 hồ sơ thước đã chết) | chuyển bộ kit (luật chặn thước mới)
- Core → AC: A → AC-1, AC-2; B → AC-3, AC-6; C → AC-5.

## Đường đo

- «Lượt sau không phải ghim lại thừa vì paths chết, không đỏ vì E7 tự hết hạn» · AC-1 và AC-3 chạy trong làn ghim lại của chính
  hồ sơ này · đo tiếp bằng lượt kiểm chéo đêm F9 (số hồ sơ đỏ vì thước trong tệp ngày).

## Out of scope

- 8 hồ sơ có thước đã chết hay tự hết hạn từ trước (`tong-quan-va-khung-noi-tieng-viet`, `tro-ly-okr-nen`,
  `khoa-con-bat-xa-tran`, `danh-sach-keo-chung`, `to-chuc-danh-sach-chi-tiet`, `slack-thieu-quyen-email`, `soan-okr-song-lai`,
  `tro-ly-doc-kho`) — kể cả 10 eval paths chết của chúng và neo E10 của Slack — chuyển F24.
- Sửa 186 tệp thước còn nhắc mốc trôi — chỉ kiểm kê; sửa từng cái khi lượt kiểm chéo đêm gọi tên nó đỏ.
- Khai `paths` cho 20 eval thiếu — luật 34 chỉ liệt kê.
- Luật chặn thước MỚI dùng mốc trôi — việc của bộ kit, không viết luật kho ở đây.
- Vế «kiểm trước-gộp không vi phạm hồ sơ khác» của `ha-tran-thang-hoi-zalo/E7` bị bỏ và giao cho lượt kiểm chéo đêm F9. Tới khi
  anh cho cài `kiem-cheo:cai`, vế đó KHÔNG ai canh.

## Notes

- Sửa bất kỳ tệp nào dưới `_acceptance/<hồ sơ đã ký>/` làm lưới trước-gộp xét lại hồ sơ đó; hồ sơ đã cũ từ trước thì phải ghim
  lại trước khi gộp. 6 hồ sơ vòng này chạm đã ghim lại xanh (`repin-20261009T224054Z-34604`).
