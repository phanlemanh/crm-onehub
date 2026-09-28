# Thước «không chạm thước đã ký» bắt được đổi tên — design

Ngày: 2026-09-28 · Slug: `khong-cham-thuoc-bat-doi-ten` · Hạng: T2 · Nguồn: ba mục ngoài hợp đồng
Ngoài-1/2/3 của hồ sơ đã ký `bo-chu-lap-keo-tha`, người ký chọn «mở hợp đồng mới» (sổ
`d-20260928T132632Z-6..8`).

## Vấn đề

`_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs` hứa: so với điểm rẽ khỏi `onehub`,
nhánh không chạm tệp nào dưới `_acceptance/nguon-keo-tha-reui/`, `_acceptance/may-soan-de-xuat/`
và bốn tệp test đã ký. Nó liệt tệp đổi bằng `git diff --name-only`, ở cả chế độ `--tu/--den` lẫn
chế độ so điểm rẽ với cây làm việc. Git bật dò đổi tên theo mặc định; khi đó `--name-only` chỉ in
đường MỚI. Một `git mv` đưa tệp đã ký ra ngoài vùng cấm vì thế không lọt vào danh sách, và thước
in «0 tep bi cam», mã 0.

## Cách sửa

Thêm `--no-renames` vào hai lời gọi `git diff` của thước — đúng nếp các thước khác của kho
(`_acceptance/khep-ky-okr/rang/soi-ma.mjs:457`, `hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs:668`,
`do-quyen-luot-bang-hanh-vi/rang/chung.mjs:136`). Với cờ này, một lần đổi tên hiện thành hai
đường: đường cũ (xoá) và đường mới (thêm); đường cũ nằm trong vùng cấm nên thước đỏ.

Sửa tại chỗ, không dựng thước thứ hai: thước này còn sống trong làn ghim lại của hồ sơ
`bo-chu-lap-keo-tha` (E5b) trên mọi nhánh sau này, nên lỗ phải vá ở chính nó.

## Phép đo mới

`_acceptance/khong-cham-thuoc-bat-doi-ten/rang/doi-ten.mjs` dựng một worktree tạm từ HEAD, tạo
đúng tình huống trong worktree đó rồi chạy CHÍNH thước (bản trong worktree) và so mã thoát cùng
dòng in. Ma trận viết trước, sáu ca:

| Ca | Tình huống trong worktree tạm | Thước phải |
|---|---|---|
| C1 | commit `git mv packages/ui/test/nguon-keo-tha.dom.tsx` ra tên khác, chạy `--tu HEAD~1 --den HEAD` | mã 1, in đường cũ |
| C2 | commit `git mv _acceptance/nguon-keo-tha-reui/gap-probe.md` sang `docs/`, chạy `--tu HEAD~1 --den HEAD` | mã 1, in đường cũ |
| C3 | `git mv apps/app/test/tai-lieu-nguon.dom.tsx` đã stage, chưa commit, chạy chế độ mặc định | mã 1, in đường cũ |
| C4 | không đổi gì, chế độ mặc định | mã 0, «0 tep bi cam» |
| C5 | sửa nội dung `packages/ui/test/nguon-canh-nhau.dom.tsx` chưa commit, chế độ mặc định | mã 1, in đường đó |
| C6 | `--tu khong-co-ref --den HEAD` | mã 2, «KHONG DO DUOC» |

Chiều đỏ trên cùng fixture: `--chieu-do` gỡ `--no-renames` khỏi bản thước trong worktree tạm
rồi chạy lại C1–C3; cả ba phải lệch với thông điệp ghim `thuoc bo sot doi ten: <ca>`.

Chiều đỏ chỉ tính khi đỏ ĐÚNG DẤU của lỗ: bản thước bị gỡ cờ phải thoát 0 và in «1 tep doi,
0 tep bi cam» (C1, C2 — git gộp đổi tên thành một đường mới) hoặc «0 tep bi cam» (C3). Số chỗ gỡ
phải đúng bằng 2. Mọi kết quả khác là «HONG DOT BIEN», tức phép đột biến hỏng chứ không phải lỗ được
tái hiện.

Điều kiện môi trường, khai tường minh:

- commit trong worktree bằng `git -c user.name=… -c user.email=…`, không dựa cấu hình git của máy;
- mỗi lượt một worktree mới bằng `mkdtemp` dưới `$TMPDIR`, nên E1, E2, E3 chạy song song không đụng nhau; dọn trong `finally`;
- thước gọi với cwd là worktree, và thước tự suy gốc từ vị trí của nó, nên nó đo worktree chứ không đo cây gọi nó;
- không dựng được tình huống (commit hay `worktree add` lỗi) → mã 2 «KHONG DO DUOC», không báo «lệch».

Phép đo không cần `origin/onehub` tươi hay sha cố định nào ngoài HEAD; worktree dùng chung ref
với kho nên chế độ mặc định chạy được.

## Ảnh hưởng tới hồ sơ đã ký

Diff chạm `_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs` → hồ sơ `bo-chu-lap-keo-tha`
vào diện kiểm lại ở CI. Ghim lại nó bằng `repin-lane.mjs` ở đỉnh nhánh, sau khi gộp
`origin/onehub`, làm bước cuối trước khi đẩy.

Vòng không chạm giao diện: không có đặc tả UX, không có eval lớp nhìn-thấy (entry `descope` có
tên trong sổ).
