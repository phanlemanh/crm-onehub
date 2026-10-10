# Review findings: giam-phut-acceptance (round 1)

## Trong hợp đồng

- **do-phut.mjs đo cửa sổ 8 ngày chứ không phải 7, vì bộ lọc `created=` của GitHub tính cả hai đầu**
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs:71`
  severity: medium
  AC: AC-6
  detail: Script tính `den = tu + ngay*86400000` rồi gọi `created=${tu}..${den}`. Với `--tu 2026-10-02 --ngay 7`, câu truy vấn là created=2026-10-02..2026-10-09. Khoảng ngày YYYY-MM-DD..YYYY-MM-DD trong cú pháp tìm của GitHub tính cả hai đầu, nên lấy trọn 8 ngày lịch. AC-6 và các ngưỡng Cổng Đáng hứa đo «7 ngày». Cũng hàm này không lọc `head_branch`, nên lượt push lên `release` bị gộp vào nhóm push, trong khi ngưỡng chỉ nói «push lên `onehub`». Cách sửa: `den = tu + (ngay-1)` ngày, và lọc `branch=onehub` hoặc `head_branch` cho nhóm push.
  source: conventions

- **do-phut.mjs bỏ sót phút tính tiền của các lần chạy lại (re-run)**
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs:79`
  severity: low
  AC: AC-6
  detail: Script gọi `repos/{r}/actions/runs/{id}/jobs` mà không có `filter=all`. Mặc định của endpoint là `filter=latest`, chỉ trả các job của lần chạy mới nhất. Khi một lượt Acceptance bị chạy lại (job chập chờn), phút của các lần trước, vốn vẫn bị tính tiền, không được cộng. Phút của lượt vì thế bị đếm thiếu, làm ngưỡng SỐNG của AC-6 dễ đạt hơn thực tế. Cách sửa: thêm `&filter=all`, hoặc cộng theo `run_attempt`.
  source: conventions

- **E3 fallback that should prove a red eval was already red can't catch git-based evals, and its message says the comparison ran on merge-base**
  file: `_acceptance/giam-phut-acceptance/rang/ho-so-cu.mjs:105`
  severity: medium
  AC: AC-5
  detail: When an old eval exits non-zero at HEAD, chayLenh runs it again in cay-goc and prints «do san <khoa>: ma X ca tren ban merge-base — khong do vong nay gay» if the code matches. Two things make that comparison weak. (1) cay-goc is built by dungCay (line 57-63) as a `git archive HEAD` copy with only acceptance.yml swapped for the merge-base version. It is not the merge-base tree, so the printed claim is false. (2) cay-goc sits under GOC/.acceptance-runs/, which is gitignored and has no .git of its own. Any command that runs git from there finds the parent worktree instead. Diff-based evals like dmk_khong_noi_thuoc (git merge-base HEAD origin/onehub + git diff --name-only) and nc_pham_vi_diff therefore get the same result in cay-goc as at HEAD, so a red result is always excused as already red. Reproduced in this run: dmk_khong_noi_thuoc goes red only because of this round's files (its log lists `cham: _acceptance/giam-phut-acceptance/rang/*.mjs`, contract.md, evals.yaml ...), yet E3 prints «do san dmk_khong_noi_thuoc: ma 1 ca tren ban merge-base» and exits 0. That particular red is scope noise, but any eval that reads git or other files outside the copy gets excused the same way, which hides real reds. Fix: build the comparison tree from the merge-base commit, or a temporary worktree that has its own .git, and print what the tree really is.
  source: bugs

- **do-phut measures 8 days of runs while labelled as 7** (cùng gốc với lỗi cửa sổ 8 ngày ở trên)
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs:71`
  severity: low
  AC: AC-6
  detail: `den = tu + ngay*86400000` is passed as `created=${tu}..${den}`. GitHub's created range includes both end dates, so `--tu 2026-10-02 --ngay 7` queries 2026-10-02..2026-10-09, which is 8 days. Checked against the API: 2026-10-02..2026-10-09 returns total_count 314, 2026-10-02..2026-10-08 returns 248, and 2026-10-09 alone returns 66. Yet the output says «that 2026-10-02+7n» and evals.yaml E4 / opportunity describe a 7-day window. Today the extra day holds no runs of this branch, but the baseline count and medians cover a different window than the one stated, and a later window run (after merge) may take in post-change runs. Fix: use `tu + (ngay-1) days` as the end, or a `created>=`/`<` pair.
  source: bugs

- **Hình dạng 6 (đường dẫn ngầm về ROOT): cây đối chứng cay-goc của E3 nằm trong worktree tác giả, eval cũ gọi git nên đo lại checkout tác giả và gắn nhãn sai «đỏ sẵn»**
  file: `_acceptance/giam-phut-acceptance/rang/ho-so-cu.mjs:105`
  severity: high
  AC: AC-5
  detail: dungCay() (dòng 57-64) bung `git archive HEAD` vào THU_MUC_CHAY = GOC/.acceptance-runs/giam-phut-acceptance/cay-goc (luong.mjs:7). Cây đó không có .git, nên một eval cũ chạy git từ gốc của chính nó sẽ đi ngược lên thư mục cha và gặp repo của worktree tác giả. dmk_khong_noi_thuoc (do-man-tren-kho-rieng/rang/khong-noi-thuoc.mjs:30,48-49 chạy `git diff --name-only $(merge-base)` với cwd=GOC của bản sao) vì vậy đo diff của worktree thật trong cả hai lượt. Tôi đã chạy E3 nguyên văn: exit 0, in «do san dmk_khong_noi_thuoc: ma 1 ca tren ban merge-base». Hai nhật ký ho-so-dmk_khong_noi_thuoc-head.log và -goc.log giống hệt nhau, và nhật ký -goc vẫn liệt kê «cham: _acceptance/giam-phut-acceptance/rang/hinh.mjs …», tức là lượt gọi là «merge-base» lại thấy chính diff của vòng này. Lỗi đỏ đó do vòng này gây ra (ở merge-base diff rỗng), nhưng dòng 106 xếp nó vào «đỏ sẵn» và E3 vẫn ra MA 0. AC-5 hứa «không đỏ thêm so với cây có acceptance.yml của merge-base», mà cây đối chứng không cô lập được với checkout của tác giả. Cùng lỗ hổng này áp vào cay-pha cho bất kỳ eval nào dùng git.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ quyết định vẫn hứa AC-5 cũ «giữ xanh mọi hồ sơ đã ký» sau khi AC-5 đã được sửa**
  Người dùng thấy gì: Thẻ đưa cho người quyết vẫn ghi vòng này giữ xanh mọi hồ sơ đã ký, trong khi lời hứa thật yếu hơn: chỉ cam kết không có lệnh nào đỏ thêm. Người đọc thẻ có thể tưởng bảo đảm mạnh hơn thực tế.
  file: `_acceptance/giam-phut-acceptance/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **nen-gop.mjs chỉ đối chiếu check bắt buộc với job của acceptance.yml, nên sẽ báo đỏ oan khi một check của ci.yml bị bắt buộc**
  Người dùng thấy gì: Nếu sau này chủ kho bắt buộc một kiểm tra thuộc luồng CI khác, phép kiểm trước khi ghim lại sẽ báo nhầm là kiểm tra đó biến mất và chặn lượt ghim. Hôm nay chưa kiểm tra nào bị bắt buộc nên chưa ảnh hưởng.
  file: `_acceptance/giam-phut-acceptance/rang/nen-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (đo một con số trong khi lời hứa là quan hệ): «không đỏ thêm» chỉ so mã thoát, một lệnh đã đỏ sẵn che mọi lỗi đỏ mới**
  Người dùng thấy gì: Một hồ sơ cũ vốn đã đỏ có thể bị đỏ thêm một mục nữa mà phép kiểm vẫn coi là đỏ sẵn như trước. Lỗi mới của vòng này trong hồ sơ đó có thể lọt qua.
  file: `_acceptance/giam-phut-acceptance/rang/ho-so-cu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên bố quét cả lớp nhưng chỉ kiểm từng điểm): Trục C xanh|đỏ|huỷ không có ô ma trận nào, AC-4 «bước đỏ thì bước sau vẫn chạy, job vẫn đỏ» chỉ được kiểm bằng so chuỗi if**
  Người dùng thấy gì: Việc một bước kiểm tra đỏ thì các bước sau vẫn chạy chỉ được xác nhận bằng cách đọc cấu hình, chưa được mô phỏng thật. Nếu cấu hình sai theo cách khó thấy thì phép kiểm hiện tại có thể không bắt được.
  file: `_acceptance/giam-phut-acceptance/rang/hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert không thể sai, không đi qua hàm thật): chiều đo làm tròn ở dòng 113-114 chỉ so bản sao Math.round với hằng số**
  Người dùng thấy gì: Công cụ đo phút có một dòng tự kiểm luôn báo đạt dù cách làm tròn phút có sai hay không. Phép kiểm làm tròn thật nằm ở dòng khác nên hậu quả thực tế nhỏ.
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): dữ liệu giả của E4 dựng tay theo đúng hình tongKet đọc, không đi qua phép chiếu jq của docThat**
  Người dùng thấy gì: Phép thử công cụ đo phút dùng dữ liệu tự dựng nên chưa chứng minh được cách đọc dữ liệu thật từ GitHub xử lý đúng lượt bị huỷ hay job bị bỏ qua. Lần đo thật sau khi gộp sẽ là đối chứng đầu tiên.
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
