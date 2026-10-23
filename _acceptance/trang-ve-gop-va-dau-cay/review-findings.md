# Review findings: trang-ve-gop-va-dau-cay (vòng 1)

## Trong hợp đồng

- **post-merge redraws (and may rewrite) on a fast-forward pull, because it only counts parents of HEAD**
  file: `scripts/trang-ve-gop.mjs:165`
  severity: medium
  AC: AC-5
  source: conventions
  detail: The design spec (docs/superpowers/specs/2026-10-23-trang-ve-gop-va-dau-cay-design.md, section «Gộp tự động») says a fast-forward merge creates no merge commit and the hook does nothing. In practice, git runs post-merge after a fast-forward `git pull` too. sauGop() only checks that HEAD has two or more parents (`if (cha < 2) return;`) and never checks whether HEAD was created by this merge or was simply moved forward to an existing commit. Every first-parent commit on origin/onehub is a GitHub PR merge with two parents (787a8369e, 0e34c4302, 6adaf11e0, and so on), so each `git pull` that fast-forwards onehub sets off a full redraw. That means about 35 s of `nice` CPU plus holding the machine-wide crm-trang-ve.lock that other sessions wait on. If the remote tip's pages ever differ from what the redraw produces, vietLaiDinh() replaces that already-published merge commit with a new SHA through update-ref. Local onehub then silently diverges from origin/onehub. I checked three current tips and their pages matched, so no rewrite has happened yet, but the cost is paid on every pull. Test an-toan (e) only covers a fast-forward onto a single-parent commit, so this case has no test. A fix would compare HEAD against ORIG_HEAD (fast-forward means ORIG_HEAD is an ancestor and HEAD is not a new commit) or check reflog `HEAD@{0}` for «Fast-forward» before redrawing.
  rationale: AC-5 nói rõ gộp tua nhanh thì hook không vẽ và không in gì; finding cho thấy tua nhanh tới một commit gộp có sẵn vẫn bị vẽ lại.

- **post-merge vẽ lại và viết lại commit gộp của người khác khi gộp tua nhanh tới một commit gộp**
  file: `scripts/trang-ve-gop.mjs:178`
  severity: high
  AC: AC-5
  source: bugs
  detail: sauGop chỉ xét `HEAD` có từ hai cha trở lên (dòng 178-179). Git vẫn chạy post-merge khi gộp tua nhanh, và nếu đích tua nhanh là một commit gộp có sẵn (vd. `git pull`/`git merge origin/onehub` tua nhanh tới một commit «Merge pull request …»), hook sẽ vẽ lại. Nếu trang vẽ ra khác trang đã commit, vietLaiDinh dựng commit thay thế rồi `update-ref` HEAD sang nó, tức là viết lại một commit đã có trên origin, và nhánh cục bộ tách khỏi upstream. Đã dựng lại trong scratchpad: nhánh feat đứng ở HEAD~1 của onehub, onehub có commit gộp M mang PRODUCT-MAP.md cũ, `git merge onehub` báo «Fast-forward», sau đó in «trang-ve: đã vẽ lại PRODUCT-MAP.md vào commit gộp a16802cfe», và HEAD = a16802c khác M. Kể cả khi trang đã đúng thì hook vẫn dựng worktree tạm, chạy bộ vẽ và in dòng «vẽ lại … từ commit gộp…». Cả hai đều trái AC-5 (gộp tua nhanh không vẽ, không in gì) và trái thiết kế («Gộp tua nhanh … không làm gì»). Bài an-toan (e) không bắt được vì nó tua nhanh tới một commit thường. Cách sửa: chỉ vẽ khi lần gộp vừa tạo ra commit gộp. Ví dụ so HEAD với ORIG_HEAD: tua nhanh thì ORIG_HEAD là tổ tiên của HEAD; hoặc kiểm reflog của HEAD có `merge …: Merge made by` chứ không phải `Fast-forward`.
  rationale: Trái trực tiếp AC-5: gộp tua nhanh không vẽ, không in gì; ở đây còn viết lại commit gộp đã có trên origin.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Time constants repeat `60 * 1000` instead of deriving from one MINUTE_MS base**
  Người dùng thấy gì: Không ảnh hưởng người dùng: các khoảng chờ vẫn đúng giá trị, chỉ là cách viết hằng số chưa gọn.
  Căn cứ: Không gây hậu quả gì cho người dùng, không mất dữ liệu, và dọn lại sau rất rẻ khi chạm tới tệp đó.
  file: `scripts/trang-ve-gop.mjs`
  severity: low
  Đề xuất: wont-fix

- **Dấu của hook ghi «đã xanh» cho sha được đẩy, nhưng năm bước thật ra chạy trên cây làm việc**
  Người dùng thấy gì: Nếu đẩy một nhánh không phải nhánh đang đứng, hoặc đẩy khi còn sửa dở chưa commit, hệ thống có thể ghi nhận mã được đẩy là đã qua kiểm tra dù thực ra kiểm tra chạy trên bản khác. Các lần đẩy sau trong 14 ngày có thể bỏ kiểm tra oan.
  Căn cứ: Chỉ xảy ra khi đẩy ở tình huống lệch (nhánh khác hoặc còn sửa dở), nhưng hậu quả là mã chưa kiểm vẫn lọt; người dùng khó tự phát hiện, còn CI trên PR vẫn bắt lại ở khâu sau.
  file: `scripts/verify-gate-shape.mjs`
  severity: medium
  Đề xuất: known-limits

- **Nguồn CI tính check-run xanh trên head sha là bằng chứng cho cây của sha đó, dù CI của PR chạy trên commit gộp tạm**
  Người dùng thấy gì: Hook có thể coi kết quả CI chạy trên bản gộp tạm là bằng chứng cho nhánh của bạn, nên đôi khi bỏ các bước kiểm tra mà thực ra chưa chạy trên đúng mã của nhánh.
  Căn cứ: Đã được hợp đồng chủ động để ngỏ, hậu quả nhẹ vì CI của PR vẫn chạy đủ khi gộp, và người dùng có thể chạy lại đủ các bước bằng tay.
  file: `scripts/pre-push-da-chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 3 (assert co mat thay vi quan he): nguon-ci (f) chi kiem tap ten khai la tap con, trong khi eval hua hai tap bang nhau**
  Người dùng thấy gì: Nếu sau này thêm một ô kiểm thử mới vào CI mà quên khai ở tệp cấu hình, bài kiểm vẫn xanh và hook có thể bỏ bước test khi mới ba ô cũ xanh.
  Căn cứ: Chỉ nổ khi có người thêm ô mới và quên khai, hậu quả là bỏ nhầm bước test trong một số lần đẩy; sửa bài kiểm rẻ nhưng không khẩn.
  file: `packages/ui/test/pre-push-da-chung.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 3 (quan he bi do bang tong dem): so-chay (g) so sanh hai so dem doc lap thay vi so tung dong**
  Người dùng thấy gì: Bài kiểm có thể không phát hiện nếu bộ đọc sổ chạy nhận sai một dòng và sót một dòng khác cùng lúc. Người dùng không thấy gì ở hiện tại.
  Căn cứ: Cần hai lỗi bù nhau mới lọt, xác suất thấp, và sổ chạy còn nhiều lớp kiểm khác nên không đáng mở việc riêng.
  file: `packages/ui/test/pre-push-da-chung.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hinh dang 5 (ma tran viet truoc thieu phan tu): nhu-cu (a) khong chay mau «gop onehub chi T1» ma eval da khai**
  Người dùng thấy gì: Ca đẩy sau khi gộp onehub chỉ chứa tệp T1 chưa có bài kiểm riêng, nên nếu nó hỏng thì có thể đẩy chậm hoặc chạy thừa các bước mà không ai biết sớm.
  Căn cứ: Hậu quả chủ yếu là chạy thừa hoặc chậm chứ không mất dữ liệu, người dùng tự thấy và chạy lại được; thêm ca kiểm sau rẻ.
  file: `packages/ui/test/pre-push-da-chung.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (am tinh mot minh): bo dem lan chay cua bo ve gia chi duoc assert == 0, chua bao gio duoc chung la dem duoc**
  Người dùng thấy gì: Các bài kiểm khẳng định hook không vẽ lại có thể vẫn xanh dù hook không chạy gì cả, nên chúng chưa thật sự chứng minh điều đã hứa.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp nhưng làm giảm độ tin của bài kiểm, và bổ sung một ca đối chứng rất rẻ.
  file: `packages/ui/test/trang-ve-gop.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (am tinh mot minh, khong ghim thong diep): an-toan (c) chi kiem `git commit` thoat 0**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận commit vẫn thành công khi bộ vẽ hỏng, chưa xác nhận người dùng thấy dòng hướng dẫn vẽ tay.
  Căn cứ: Đường tương tự đã có bài kiểm ghim thông điệp ở nhánh gộp, nên rủi ro còn lại nhỏ và không đáng mở việc.
  file: `packages/ui/test/trang-ve-gop.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
