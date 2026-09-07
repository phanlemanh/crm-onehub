# Khoá auto-pr về kho hãng — để nó thôi bôi đỏ bản rẽ

Ngày 07/09 · slug `auto-pr-thoi-do-o-ban-re` · hạng T2

## Vấn đề

`.github/workflows/auto-pr.yml` là workflow của hãng, chạy trên **mọi lần đẩy, mọi
nhánh**. Việc của nó: tự mở một PR vào `main`.

Bản rẽ không có `main`. Nhánh chính là `onehub`, và PR ở đây mở tay. Nên workflow này
chết hai lần liên tiếp mỗi lượt đẩy:

1. `git rev-list --count "origin/main..origin/$BRANCH"` → `fatal: ambiguous argument
   'origin/main..…': unknown revision`. Lệnh nằm trong `$( )` của một `if`, nên `set -e`
   không chặn — script đi tiếp với kết quả rỗng.
2. `gh pr create --base main` → `GitHub Actions is not permitted to create or approve
   pull requests`. `AUTOMATION_TOKEN` chưa đặt ở kho này nên nó rơi về `GITHUB_TOKEN`,
   thứ không có quyền mở PR.

Chưa lần nào xanh kể từ khi rẽ nhánh. Vì nó chạy trên mọi nhánh, mọi PR và cả `onehub`
đều đeo một dấu đỏ thường trực. Bốn PR Việt hoá đóng ngày 06/09 đều mang dấu này, và
`onehub` HEAD hôm nay vẫn mang.

Cái giá thật không phải một ô đỏ xấu mắt. Là **màu đỏ mất nghĩa**: khi mọi commit đều
đỏ sẵn, không ai đọc màu nữa, và một màu đỏ thật sẽ trôi qua cùng đám.

## Đã cân nhắc: xoá tệp

Đường hiển nhiên là xoá `auto-pr.yml`. Đã loại, vì một số đo:

`git diff upstream/HEAD -- .github/workflows/auto-pr.yml` trả về **rỗng** — tệp đang y
nguyên bản hãng, chưa lệch dòng nào. `origin/release` (bản gương của hãng trong kho)
cũng khớp từng dòng.

Xoá một tệp mà hãng còn giữ và còn sửa nghĩa là: mỗi lần hãng chạm nó, lần kéo bản mới
về `release` rồi merge sang `onehub` sinh một xung đột delete/modify, và người xử lý
phải nhớ lại quyết định này. `CLAUDE.md` của kho ghi thẳng: *phí bản rẽ là chi phí dài
hạn lớn nhất ở đây*. Một tệp đã xoá là khoản phí trả mãi.

## Cách làm

Một dòng, ở tầng job:

```yaml
  open:
    name: Open a pull request into main
    if: github.repository == 'trycompai/crm'
```

Job bị chặn điều kiện báo kết luận `skipped`, không phải `failure`. Ở kho hãng điều
kiện đúng nên hành vi không đổi một chút nào.

Lệch bản hãng đúng **một dòng thêm vào** — dạng lệch merge sạch nhất khi kéo bản mới về.

## Đo thế nào

Ba tiêu chí, đo bằng **lệnh trần** — không script riêng nào của vòng này.

| Đo gì | Lệnh | Chiều đỏ |
| --- | --- | --- |
| Hành vi thật ở kho này | `gh api …/commits/c042478/check-runs` rồi `grep -qx 'Open a pull request into main = skipped'` | đổi sha sang `5ac85ef` → `… = failure` |
| Lệch bản hãng: số dòng | `git diff --numstat origin/release -- <tệp>` khớp `1 0 …` | đổi nền sang `HEAD` → không lệch |
| Lệch bản hãng: nội dung dòng | `git diff -U0 …` rồi `grep -qxF "+    if: …"` | đổi khuôn sang hai dấu cách → tầng sai |
| Tác dụng phụ | bốn lệnh chứng sẵn có của kho | — |

Mỗi chiều đỏ chỉ khác chiều xanh **một tham số**, nên không lượt nào là một lời khai
suông. Phép đo mang cả lời hứa là dòng đầu: cùng một lệnh, cùng một kho, hai commit —
`5ac85ef` trả `failure`, `c042478` trả `skipped`. Không suy luận, là số GitHub đã ghi.

### Vì sao bảng này ngắn hơn bảng cũ

Hai vòng chấm đầu dựng một bộ đo riêng 260 dòng JavaScript với bốn chân và một ma trận
11 ô. Hai vòng phản biện xác nhận **25 lỗi trong bộ đo, 0 lỗi trong bản vá**. Vòng 2 tái
sinh đúng ba lớp lỗi của vòng 1 ngay trong đoạn mã viết ra để diệt chúng: so tập hợp
dòng thay vì so diff, ô đỏ so tệp với chính nó nên đúng theo cấu tạo, và lỗi git bị nuốt
thành mã đạt.

Bài học ghi lại cho vòng sau: **bộ đo không được phức tạp hơn thứ nó đo.** Vật ở đây là
một dòng YAML; mọi dòng mã viết thêm để chấm nó đều là bề mặt lỗi mới, và số liệu cho
thấy bề mặt ấy hỏng chắc chắn hơn vật.

## Giới hạn đã biết

**Không đo được hành vi ở kho hãng.** Check-run của `c042478` chứng minh job không chạy
*ở đây*, không chứng minh nó *vẫn chạy ở kia*. Muốn số thật thì phải có quyền đẩy lên
kho hãng, thứ bản rẽ không có và không nên có. Kết luận "ở hãng vẫn như cũ" là suy luận
từ ngữ nghĩa `if` của GitHub Actions — khai ra chứ không giấu vào màu xanh.

**AC-1 phụ thuộc `gh` đã đăng nhập và mạng tới GitHub.** Thiếu một trong hai thì lệnh
thất bại, và thất bại ấy phải đọc là *không đo được*, không phải *bản vá sai*. Lệnh trần
không phân biệt hai loại ấy bằng mã thoát. Đó là cái giá của việc bỏ bộ đo tự chế, và
giá này rẻ hơn 25 lỗi trong bộ đo.

**`pr-base.yml` mang đúng bệnh, không sửa vòng này.** Nó `gh pr edit --base main` cho PR
mở vào `release`. Ở bản rẽ không ai PR vào `release` nên nó đang ngủ. Nằm ngoài phạm vi.
