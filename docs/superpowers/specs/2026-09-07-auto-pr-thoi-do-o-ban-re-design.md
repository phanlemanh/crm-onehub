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

Bốn chân trong `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs`, mỗi chân
một chiều đỏ tái lập được:

| Chân | Đo gì | Chiều đỏ |
| --- | --- | --- |
| `khoa` | job `open` có đúng một `if`, trỏ đúng kho hãng, và kho tại chỗ khác kho hãng | bản sao workflow bỏ dòng `if`; bản sao trỏ nhầm sang chính kho này |
| `lech-mot-dong` | lệch `origin/release` đúng +1/−0 | `--nen HEAD` → không lệch dòng nào |
| `mot-tep` | vòng này chạm đúng một tệp dưới `.github/` | `--nen HEAD` → không tệp nào |
| `chay-that` | check-run thật của commit kết luận `skipped` | `--sha <onehub trước bản vá>` → `failure` |

Chân `chay-that` là chân mang cả lời hứa: cùng một script, cùng một kho, hai commit —
`5ac85ef` (trước) trả `failure`, `c042478` (sau) trả `skipped`. Không phải suy luận,
là số đọc từ GitHub.

Ba chân còn lại đo tĩnh vì chúng nói về **hình dạng** của bản vá, không nói về hành vi.

## Giới hạn đã biết

**Không đo được hành vi ở kho hãng.** Chân `khoa` khẳng định điều kiện trỏ đúng chuỗi
`trycompai/crm` và kho tại chỗ khác chuỗi đó — đủ để kết luận job không chạy *ở đây*,
không đủ để chứng minh nó *vẫn chạy ở kia*. Muốn số thật thì phải có quyền đẩy lên kho
hãng, thứ bản rẽ không có và không nên có. Đây là suy luận từ ngữ nghĩa `if` của GitHub
Actions, khai ra chứ không giấu vào màu xanh.

**`pr-base.yml` mang đúng bệnh, không sửa vòng này.** Nó `gh pr edit --base main` cho PR
mở vào `release`. Ở bản rẽ không ai PR vào `release` nên nó đang ngủ. Nằm ngoài phạm vi.
