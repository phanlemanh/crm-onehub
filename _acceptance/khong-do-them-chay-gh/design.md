# Thiết kế: khong-do-them-chay-gh (F26)

## Vấn đề

Phép đo «không đỏ thêm» của hồ sơ `chuyen-goi-dieu-phoi` (E10, `rang/khong-do-them.mjs`) dựng hai bản clone độc lập —
`HEAD` và merge-base — rồi chạy lại các eval của hồ sơ đã ký mà vòng chạm tới. Lệnh nào đỏ ở `HEAD` thì chạy lại ở
merge-base; đỏ cả hai thì in «do san» và không tính.

Bản clone lấy từ đường cục bộ của kho, nên `origin` của nó là một thư mục, không phải GitHub, và nó đứng ở `HEAD` tách.
Hai lệnh của `giam-phut-ci-nhap-t1` cần `gh`:

- `gpct_nen_gop` (E12) gọi `gh repo view` → `gh` không nhận ra kho → `MA 2: gh repo view`.
- `gpct_luot_that` (E11) gọi `gh repo view`, rồi tìm PR mở của nhánh `git rev-parse --abbrev-ref HEAD` → trong bản tách
  tên nhánh là `HEAD`.

Cả hai thoát 2 ở cả hai cây, bị in «do san», và phép đo hồi quy báo xanh dù luồng đó có hỏng. Đã tái hiện 19/10 trên một
bản clone tạm: `gh repo view` thoát 1 («none of the git remotes … point to a known GitHub host»), tên nhánh `HEAD`; đặt
lại URL của `origin` và tạo nhánh cùng tên thì `gh repo view` ra `phanlemanh/crm-onehub` và tên nhánh đúng.

Ở cây gốc cả hai lệnh chạy được: `gpct_nen_gop` thoát 0 trên `HEAD` của vòng này.

## Hướng đã chọn

Bàn đo dựng bản clone **mang môi trường `gh` của cây gốc**: `origin` trỏ đúng URL `origin` của cây gốc, và bản clone đứng
trên nhánh cùng tên với nhánh cây gốc đang đứng (cây gốc tách thì bản clone cũng tách). Hai lệnh `gpct_*` không đổi.

Một hàm mới `datNenBan(goc, sha, nguon = GOC)` trong `_acceptance/chuyen-goi-dieu-phoi/rang/chung.mjs` làm trọn phần đặt
nền của một bản: `refs/remotes/origin/onehub` và nhánh `onehub` về `sha` (như cũ), URL `origin` chép từ `nguon`, rồi
`checkout -B <nhánh của nguon> <sha>` khi `nguon` đứng trên một nhánh. `dungBan` của bàn đo gọi hàm này thay cho hai lệnh
đặt `onehub` cũ. Thước của vòng gọi đúng hàm ấy — không tự dựng lại các bước — nên thước đo đúng vật bàn đo dùng.

Bàn đo thêm cờ `--chi <khoá,…>`: chỉ chạy các khoá đã nêu trong tập đã rút (khoá không có trong tập → mã 2). Không cờ thì
tập chạy y như cũ. Dòng `chay: <khoá,…>` in ra trước khi dựng bản, kể cả ở `--chi-rut`.

Vòng gộp luôn PR #396 (luật 24 của đợt): lượt kiểm chéo đêm dựng lại cây khi lần checkout của bước phân loại hỏng, checkout
`--force`, và `ly_do` mang dòng đầu stderr của git.

## Vì sao không lối khác

- **Sửa hai lệnh `gpct_*`** (đọc kho từ biến, bỏ phụ thuộc tên nhánh): đó là thước của hồ sơ đã ký `giam-phut-ci-nhap-t1`,
  và lệnh vẫn đúng ở cây gốc — lỗi nằm ở bàn dựng bản thiếu môi trường.
- **Đặt `GH_REPO`** cho lệnh: chữa được `gh repo view` nhưng `gpct_luot_that` vẫn đọc tên nhánh `HEAD` từ bản tách.
- **Worktree thay clone**: worktree giữ được `origin`, nhưng không check out được nhánh mà cây gốc đang đứng, nên vẫn tách.
- **Chạy trọn bàn đo ở S4**: không đo thêm điều gì — vòng chạm `_acceptance/chuyen-goi-dieu-phoi/rang/**`, nên lượt ghim
  lại hồ sơ đó trước gộp chạy đúng E10 trọn bàn trên cùng `HEAD`.

## Ma trận

| Nguồn (cây gốc) | Bản HEAD | Bản merge-base |
| --- | --- | --- |
| đứng trên nhánh tính năng | nhánh cùng tên, `origin` GitHub | nhánh cùng tên, `origin` GitHub |
| tách | tách, `origin` GitHub | tách, `origin` GitHub |
| đứng trên `onehub` | `onehub` = sha, `origin` GitHub | `onehub` = sha, `origin` GitHub |

Ở mọi ô: `HEAD` của bản = sha của nó; `onehub` và `origin/onehub` = sha của nó.

## Giới hạn biết trước

`gpct_luot_that` đòi PR mở của nhánh đang đứng (E11 của `giam-phut-ci-nhap-t1`: «khong co -> ma 2»). Ở lượt kiểm chéo đêm
(cây tách) hay khi bàn đo chạy trên `onehub`, không có PR mở, nên lệnh vẫn thoát 2 ở cả hai cây — đúng hành vi đã khai của
chính thước đó, không phải lỗi bàn.

## Đặc tả UX

Không chạm giao diện (entry `descope` «bỏ đặc-tả-UX» trong sổ).
