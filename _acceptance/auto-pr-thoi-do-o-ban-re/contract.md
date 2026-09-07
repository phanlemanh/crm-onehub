---
schema_version: 1
feature: Khoá workflow auto-pr về kho hãng — ở bản rẽ nó chết hai lần mỗi lượt đẩy và bôi đỏ mọi commit
slug: auto-pr-thoi-do-o-ban-re
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-07
veto_state: mo
veto_opened_at: 2026-09-07T01:50:06Z
design_doc: docs/superpowers/specs/2026-09-07-auto-pr-thoi-do-o-ban-re-design.md
---

# Acceptance Contract: auto-pr-thoi-do-o-ban-re

## Bối cảnh

`.github/workflows/auto-pr.yml` mở PR vào `main`. Bản rẽ không có `main`, và
`AUTOMATION_TOKEN` chưa đặt — nên workflow chết hai lần mỗi lượt đẩy, trên mọi nhánh.
Chưa xanh lần nào kể từ khi rẽ. Hậu quả là màu đỏ mất nghĩa: mọi commit đỏ sẵn thì một
màu đỏ thật sẽ trôi qua không ai thấy. Chi tiết ở design doc.

Bản vá là một dòng `if` ở tầng job. Đường xoá tệp đã cân nhắc và loại — tệp đang y
nguyên bản hãng, xoá là mua một xung đột delete/modify vĩnh viễn mỗi lần kéo bản mới.

## Phạm vi đã thu — vì sao hợp đồng này ngắn

Hai vòng chấm đầu dựng một bộ đo riêng 260 dòng JavaScript cho một bản vá **một dòng
YAML**. Kết quả đo được: **25 lỗi được xác nhận trong bộ đo, 0 lỗi trong thứ được đo.**
Vòng 2 tái sinh đúng ba lớp lỗi của vòng 1 ngay bên trong đoạn mã viết ra để diệt chúng
— so tập hợp thay vì so diff, assertion âm tính so với chính nó, nuốt lỗi thành mã đạt.

Chủ kho chọn thu phạm vi ngày 07/09. Bộ đo tự chế bị xoá. Ba tiêu chí dưới đây đo bằng
**lệnh trần** — `gh api`, `git diff`, và bốn lệnh chứng sẵn có của kho — mỗi eval đúng
một khẳng định, đọc một dòng là biết nó đo gì. Không dòng mã nào của vòng này tham gia
vào việc chấm chính nó.

## Acceptance Criteria

### AC-1 — Ở kho này, job không chạy — đo bằng số GitHub trả về

**Given** commit `c042478` đã đẩy lên `phanlemanh/crm-onehub` và CI đã chạy xong
**When** chạy:

```
gh api repos/phanlemanh/crm-onehub/commits/c042478/check-runs \
  --jq '.check_runs[] | .name + " = " + (.conclusion // .status)' \
  | grep -qx 'Open a pull request into main = skipped'
```

**Then** mã 0.
**Đỏ khi** kết luận khác `skipped`.

Chiều đỏ tái lập được, đã chạy, và chỉ khác **một tham số**: đổi `c042478` thành
`5ac85ef` (đầu `onehub` trước bản vá) thì cùng lệnh trả `Open a pull request into
main = failure` và mã 1.

Đây là tiêu chí duy nhất đo **hành vi thật**. Nó không suy luận từ ngữ nghĩa `if` của
GitHub Actions — nó đọc kết luận GitHub đã ghi.

Mốc **ghim cứng** `c042478` chứ không lấy `HEAD`: ở vòng chấm, `HEAD` là commit hồ sơ
vừa tạo, chưa đẩy và chưa chạy CI, nên lấy `HEAD` sẽ chặn cổng vì một lý do không liên
quan đến bản vá.

**Nhưng một mốc ghim cứng, một mình, không đo cây đang kiểm.** Vòng chấm 2 bắt đúng lỗ
này và tôi đã kiểm chứng bằng tay: chạy lệnh trên **từ `/tmp`, một thư mục không có kho
git nào**, nó vẫn trả mã 0. Xoá dòng `if:` khỏi workflow thì nó vẫn xanh, vĩnh viễn —
check-run tại `c042478` là bất biến. Nên tiêu chí này có **hai vế buộc mốc vào cây**:

```
git merge-base --is-ancestor c042478 HEAD
git diff --quiet c042478 -- .github/workflows/auto-pr.yml
```

Vế đầu: commit mang số đo phải nằm trong lịch sử của `HEAD`. Vế sau: tệp workflow trên
**cây làm việc** phải bằng đúng bản tại mốc — dạng hai-chấm không có ref thứ hai, nên nó
so với cây chứ không so với `HEAD`; bản so hai-commit sẽ bỏ lọt mọi sửa chưa commit.

Đã kiểm chứng đúng ca finding nêu: xoá dòng `if:` khỏi cây làm việc thì E1 vẫn mã 0
trong khi vế thứ hai mã 1. Ba eval E1 + E8 + E9 cùng nhau mới là AC-1.

**Đính chính 07/09:** bản trước của mục này viết «E9 là eval DUY NHẤT bắt được việc gỡ
bản vá». Sai, và vòng chấm 3 bắt được. Đo lại tại chỗ: xoá dòng `if:` khỏi cây làm việc
thì **E3 cũng mã 1** — nó đối khớp dòng thêm so với `origin/release`, nên mất dòng là nó
đỏ. Hai eval bắt được, không phải một. Câu «duy nhất» là một khẳng định phủ sóng không có
phép đo đỡ, và nó nằm trong hồ sơ ba vòng trước khi bị bắt.

### AC-2 — Lệch bản hãng đúng một dòng, và dòng ấy đúng là dòng khoá

Hai khẳng định, hai eval, vì một eval một khẳng định thì đọc một dòng là biết nó đo gì.

**Given** `origin/release` — bản gương của hãng trong kho, đã đối chiếu khớp từng dòng
với `upstream/HEAD` cho tệp này
**When** chạy hai lệnh:

```
git diff --numstat origin/release -- .github/workflows/auto-pr.yml \
  | tr '\t' ' ' | grep -qx '1 0 .github/workflows/auto-pr.yml'

git diff -U0 origin/release -- .github/workflows/auto-pr.yml \
  | grep -qxF "+    if: github.repository == 'trycompai/crm'"
```

**Then** cả hai mã 0.
**Đỏ khi** lệch khác 1/0 · dòng thêm không đúng nguyên văn, kể cả **bốn dấu cách** đầu
dòng — bốn dấu cách mới là tầng job.

Chiều đỏ đã chạy, mỗi lệnh một cách: lệnh đầu đổi nền sang `HEAD` (không lệch dòng nào)
→ mã 1; lệnh sau đổi khuôn đối khớp sang hai dấu cách (tầng sai) → mã 1.

Vì sao phải có vế thứ hai: đếm dòng là **đo con số** trong khi lời hứa là **quan hệ**.
Một dòng trống, một dòng `env`, hay một `if` đặt nhầm tầng đều cho 1/0 và đều lọt.

### AC-3 — Bốn lệnh chứng của kho vẫn xanh

**Given** cây có bản vá
**When** chạy `bun run test`, `check-types --force`, `lint --force`, `lint:slop`
**Then** cả bốn mã 0.

Bản vá không chạm mã nguồn, nên đây là lưới chống tác dụng phụ ngoài dự đoán, không
phải phép đo lời hứa chính.

## Coverage

Ba trục, sau khi thu phạm vi.

| Trục | Giá trị |
| --- | --- |
| A — nơi đo | bản rẽ (`phanlemanh/crm-onehub`) · **kho hãng (`trycompai/crm`)** |
| B — mặt đo | hành vi thật (check-run) · hình dạng bản vá (diff) · tác dụng phụ (bốn lệnh chứng) |
| C — chiều | xanh · đỏ |

**Thước CE — 5 ô xanh đo thật; 5 ô đỏ đã đăng ký nhưng KHÔNG đo được gì.**

Đính chính 07/09, sau vòng chấm 5: bản trước của dòng này viết «10/10 ô chiều được ĐĂNG
KÝ… không còn ô nào là lời khai». Đúng về hình thức, **sai về thực chất** — năm ô đỏ có
mặt trong `evals.yaml` nhưng ghim hằng số và không đọc cây đang kiểm. Xoá bản vá đi thì
cả năm vẫn xanh. Đo được, ghi ở `evidence-report.md` mục Known limits 1.

Năm eval máy của AC-1 và AC-2 mỗi cái có một eval chiều đỏ riêng, theo đúng khuôn kho
đã có (`rang_microsoft_duong`/`rang_microsoft_do`):

| Xanh | Đỏ | Chiều đỏ đọc gì |
| --- | --- | --- |
| E1 check-run tại `c042478` = `skipped` | E10 | check-run tại `5ac85ef` = `failure` |
| E2 lệch `origin/release` là `1 0` | E11 | hai cây cùng **không** có bản vá → diff rỗng |
| E3 dòng thêm đúng nguyên văn | E12 | hai cây cùng không có bản vá → không dòng nào mang `if: github.repository` |
| E8 `c042478` là tổ tiên của `HEAD` | E13 | `c042478` **không** là tổ tiên của `5ac85ef` |
| E9 tệp trên cây bằng bản tại mốc | E14 | tệp tại `5ac85ef` **khác** bản tại mốc |

Ba vòng trước, năm ô đỏ này tồn tại dưới dạng câu «đã chạy bằng tay ngày 07/09» trong
`expected` — tức lời khai, không phải phép đo. Vòng chấm bắt đúng lỗi ấy ba lần, và hai
lần đầu tôi vá bằng cách **chạy thêm lượt rồi viết vào hồ sơ**, tức lặp lại chính lỗi.
Nay mỗi chiều là một ô cắm, một lệnh, một dòng log — `recheck: strict` tái lập được cả
mười, không còn nửa nào sống bằng trí nhớ của một phiên làm việc.

Mỗi chiều đỏ đọc **trạng thái git hoặc GitHub thật**, không đột biến gì, không tham số
giả: `5ac85ef` là đầu `onehub` trước bản vá, một commit có thật trong kho.

**Ô Core không phủ được: 1** — hành vi ở kho hãng. Bản rẽ không có quyền đẩy lên
`trycompai/crm`. Xem Known limits 1.

## Out of scope

- **Bộ đo tự chế cho phạm vi diff.** Hai vòng đầu có AC-4 «vòng này chỉ chạm những tệp
  đã ghim tên», đo bằng script riêng. Đã xoá cùng bộ đo. Phạm vi diff nay do người đọc
  ở PR kiểm — `git diff --stat` là một màn hình, và mọi lỗi của AC-4 cũ đều là lỗi của
  script chứ không phải của bản vá.
- **`pr-base.yml`** — cùng bệnh (`--base main`), nhưng chỉ kích hoạt khi có PR mở vào
  `release`, việc không xảy ra ở bản rẽ. Để nguyên.
- **Đặt `AUTOMATION_TOKEN` và bật quyền mở PR cho Actions** — đường làm cho auto-pr chạy
  THẬT ở bản rẽ. Loại vì bản rẽ không muốn PR tự mở vào một nhánh nó không có.
- **Dựng một workflow auto-pr riêng nhắm `onehub`** — tính năng mới, không phải bản vá
  màu đỏ.
- **Đo hành vi ở kho hãng** — cần quyền đẩy lên `trycompai/crm`.
- **Gửi dòng khoá lên hãng.** `CLAUDE.md` nêu đường này đầu tiên, và dòng `if` đúng là
  dạng gửi-được: no-op ở kho hãng, có lợi cho mọi bản rẽ. Chủ kho quyết **không gửi**
  ngày 07/09 — vòng này và các vòng sau chỉ làm trong kho này và trên `crm-onehub`.
  Kèm theo: AC-2 khoá độ lệch ở đúng `1 0` là **chủ ý**, vì bản rẽ cố tình giữ dòng khoá
  của riêng mình. Nếu về sau đổi ý và hãng nhận bản vá, độ lệch về 0 sẽ làm E2/E3 đỏ —
  lúc ấy phải sửa hợp đồng trước, và đó không phải hồi quy.

## Known limits

1. **Không đo được hành vi ở kho hãng.** Kết luận "job vẫn chạy bình thường ở
   `trycompai/crm`" là suy luận từ ngữ nghĩa `if` của GitHub Actions, không phải số đo.
   Muốn số thật thì phải có quyền đẩy lên kho hãng, thứ bản rẽ không có và không nên có.

2. **AC-1 phụ thuộc `gh` đã đăng nhập và mạng tới GitHub.** Máy thiếu một trong hai thì
   lệnh thất bại, và thất bại ấy phải đọc là **không đo được**, không phải bản vá sai.
   Lệnh trần không phân biệt được hai loại thất bại ấy bằng mã thoát — đó là cái giá của
   việc bỏ bộ đo tự chế, và giá này rẻ hơn 25 lỗi trong bộ đo.

3. **`pr-base.yml` còn mang bệnh.** Nó ngủ, không đỏ, và không có phép đo nào canh nó.
   Nó nổ ngay lượt đầu có người mở PR vào `release`.

4. **Độ lệch nội dung đầu tiên trong một tệp workflow của hãng.** Trước vòng này,
   `git diff origin/release -- .github/` chỉ có `acceptance.yml`, một tệp **thêm mới**
   nên không bao giờ xung đột. Từ nay mỗi lượt hãng sửa `auto-pr.yml` đều phải xử bằng
   tay. Đã cân, chủ kho chọn thế.

5. **`git diff --quiet c042478` khoá cả tệp workflow vào một commit.** Lượt đầu hãng sửa
   `auto-pr.yml` — luồng bình thường của kho — E9 không xanh lại được, trong khi E1 vẫn
   trả `skipped` từ một check-run đóng băng. Khi ấy AC-1 có một chân luôn đỏ và một chân
   không đo gì, và phải sửa mốc ghim.

6. **Bốn finding ngoài hợp đồng của vòng chấm 1 chưa xử.** Bản đồ chưa vẽ lại (đã vẽ ở
   vòng 2, khai lệch luật trong sổ quyết định) · thiếu kiểm `null` · bảng design doc lỗi
   thời · ba lời gọi git ngoài `try`. Ba mục sau nằm trong bộ đo đã xoá nên tự hết.

7. **Chiều đỏ khai cho E2 là đối chứng đúng-theo-cấu-tạo.** `git diff --numstat HEAD`
   rỗng với **mọi** cây, có vá hay không — nên nó không chứng minh E2 biết bắt lỗi. Đã
   đo: cùng lệnh với nền `5ac85ef` trả `1 0`, với nền `HEAD` trả rỗng. Chủ kho chọn khai
   thay vì đuổi tiếp ngày 07/09. E3 (đối khớp nguyên văn dòng) mới là vế mang tải của
   AC-2; chiều đỏ của E3 — đổi khuôn sang hai dấu cách — là chiều đỏ thật.

8. **E2 và E3 so với `origin/release` cục bộ, không `fetch` trước.** Không phép đo nào
   kiểm ref theo dõi ấy có còn khớp bản hãng không. Vòng 1 từng có vế đối chiếu
   `upstream/HEAD` cho việc này, và `gap-probe.md` ghi P1 ấy là `fixed`; vòng thu phạm vi
   xoá vế đó cùng cả bộ đo, nên **ghi `fixed` trong `gap-probe.md` nay là ghi lỗi thời**
   — xem ghi chú đã thêm ở cuối tệp đó. Hệ quả: sau một lượt kéo bản mới của hãng làm
   `origin/release` đổi, E2/E3 vẫn xanh trong khi lệch thật với hãng đã khác.
