# Review findings: trang-ve-gop-va-dau-cay (vòng 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ quét t1-ma-doc đỏ ở HEAD: run-log.jsonl của chính hồ sơ này là tệp T1 bị bài kiểm đọc mà chưa khai**
  Người dùng thấy gì: Bộ kiểm tra tự động của kho đang đỏ ngay trên bản này, nên lần đẩy code lên và kiểm tra trên GitHub sẽ bị chặn cho tới khi khai nốt một tệp sổ chạy. Người dùng cuối không bị ảnh hưởng, nhưng người làm không đẩy được.
  Căn cứ: Không mất dữ liệu và không đến tay người dùng cuối, nhưng chặn mọi lần đẩy nên phải sửa trước khi gộp; sửa rẻ vì chỉ là khai thêm một ngoại lệ.
  file: `.github/scripts/t1-ma-doc.mjs`
  severity: high
  Đề xuất: new-contract

- **Mục miễn cho .github/workflows/ci.yml thành thừa sau khi khai ci.yml vào t1_ma_doc, mà bộ quét không phát hiện**
  Người dùng thấy gì: Trong sổ miễn trừ còn một dòng đã không còn tác dụng, nên sổ nói sai một chút về lý do. Không ai dùng sản phẩm thấy gì khác.
  Căn cứ: Không gây hại gì cho người dùng hay người làm, chỉ là một dòng thừa nên chấp nhận và ghi vết, dọn khi tiện tay.
  file: `Users/manhphan/dev/crm/.github/scripts/t1-ma-doc.mjs`
  severity: low
  Đề xuất: wont-fix

- **@crm/ui#test is red at HEAD: the T1 scanner reports an undeclared T1 file that a test reads**
  Người dùng thấy gì: Bộ kiểm tra tự động của gói giao diện đỏ trên bản này, nên lần đẩy lên và kiểm tra trên GitHub sẽ bị chặn. Người dùng cuối không thấy gì, nhưng người làm không gộp được.
  Căn cứ: Không mất dữ liệu và chỉ chặn quy trình làm việc, nhưng phải sửa trước khi gộp; sửa rẻ vì chỉ là khai thêm một tệp.
  file: `packages/ui/test/pre-push-da-chung.spec.ts`
  severity: high
  Đề xuất: new-contract

- **ca-550 don-dep can never fail: it runs after worktree prune and only checks paths inside the tam directory that was already deleted**
  Người dùng thấy gì: Phép kiểm 'không để sót thư mục làm việc tạm' trong ca mô phỏng không bao giờ báo đỏ, nên nếu sau này bước vẽ trang để sót thư mục tạm thì ca này sẽ không phát hiện. Người dùng không bị ảnh hưởng ngay.
  Căn cứ: Chỉ làm một lưới an toàn yếu đi chứ không gây lỗi thật; nếu có sót thì chỉ là rác trong thư mục tạm của máy, người làm tự dọn được.
  file: `_acceptance/trang-ve-gop-va-dau-cay/rang/ca-550.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên phủ lớp nhưng chỉ có một điểm-case): đột biến (l) xoá cùng lúc hai điều kiện chặn tua nhanh, và ca (i) được dựng sao cho điều kiện ORIG_HEAD không bao giờ bật**
  Người dùng thấy gì: Một trong hai điều kiện chặn việc vẽ lại trang khi gộp tua nhanh không có bài kiểm riêng, nên nếu ai lỡ xoá nó đi thì bộ kiểm vẫn xanh. Hiện tại chức năng vẫn chạy đúng.
  Căn cứ: Không gây lỗi cho người dùng hôm nay và điều kiện còn lại vẫn chặn được ca chính; nếu bị xoá nhầm thì hậu quả chỉ là trang bị vẽ thừa một lần, tự sửa được.
  file: `_acceptance/trang-ve-gop-va-dau-cay/rang/doi-chieu.mjs`
  severity: low
  Đề xuất: known-limits

- **Time constants repeat `60 * 1000` instead of deriving from one MINUTE_MS base (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng người dùng: các khoảng chờ vẫn đúng giá trị, chỉ là cách viết hằng số chưa gọn.
  Căn cứ: Không gây hậu quả gì cho người dùng, không mất dữ liệu, và dọn lại sau rất rẻ khi chạm tới tệp đó.
  file: `scripts/trang-ve-gop.mjs`
  severity: low
  Đề xuất: wont-fix

- **Dấu của hook ghi «đã xanh» cho sha được đẩy, nhưng năm bước thật ra chạy trên cây làm việc (r1)**
  Người dùng thấy gì: Nếu đẩy một nhánh không phải nhánh đang đứng, hoặc đẩy khi còn sửa dở chưa commit, hệ thống có thể ghi nhận mã được đẩy là đã qua kiểm tra dù thực ra kiểm tra chạy trên bản khác. Các lần đẩy sau trong 14 ngày có thể bỏ kiểm tra oan.
  Căn cứ: Chỉ xảy ra khi đẩy ở tình huống lệch (nhánh khác hoặc còn sửa dở), nhưng hậu quả là mã chưa kiểm vẫn lọt; người dùng khó tự phát hiện, còn CI trên PR vẫn bắt lại ở khâu sau.
  file: `scripts/verify-gate-shape.mjs`
  severity: medium
  Đề xuất: known-limits

- **Nguồn CI tính check-run xanh trên head sha là bằng chứng cho cây của sha đó, dù CI của PR chạy trên commit gộp tạm (r1)**
  Người dùng thấy gì: Hook có thể coi kết quả CI chạy trên bản gộp tạm là bằng chứng cho nhánh của bạn, nên đôi khi bỏ các bước kiểm tra mà thực ra chưa chạy trên đúng mã của nhánh.
  Căn cứ: Đã được hợp đồng chủ động để ngỏ, hậu quả nhẹ vì CI của PR vẫn chạy đủ khi gộp, và người dùng có thể chạy lại đủ các bước bằng tay.
  file: `scripts/pre-push-da-chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 3 (assert co mat thay vi quan he): nguon-ci (f) chi kiem tap ten khai la tap con, trong khi eval hua hai tap bang nhau (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này thêm một ô kiểm thử mới vào CI mà quên khai ở tệp cấu hình, bài kiểm vẫn xanh và hook có thể bỏ bước test khi mới ba ô cũ xanh.
  Căn cứ: Chỉ nổ khi có người thêm ô mới và quên khai, hậu quả là bỏ nhầm bước test trong một số lần đẩy; sửa bài kiểm rẻ nhưng không khẩn.
  file: `packages/ui/test/pre-push-da-chung.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 3 (quan he bi do bang tong dem): so-chay (g) so sanh hai so dem doc lap thay vi so tung dong (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm có thể không phát hiện nếu bộ đọc sổ chạy nhận sai một dòng và sót một dòng khác cùng lúc. Người dùng không thấy gì ở hiện tại.
  Căn cứ: Cần hai lỗi bù nhau mới lọt, xác suất thấp, và sổ chạy còn nhiều lớp kiểm khác nên không đáng mở việc riêng.
  file: `packages/ui/test/pre-push-da-chung.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hinh dang 5 (ma tran viet truoc thieu phan tu): nhu-cu (a) khong chay mau «gop onehub chi T1» ma eval da khai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Ca đẩy sau khi gộp onehub chỉ chứa tệp T1 chưa có bài kiểm riêng, nên nếu nó hỏng thì có thể đẩy chậm hoặc chạy thừa các bước mà không ai biết sớm.
  Căn cứ: Hậu quả chủ yếu là chạy thừa hoặc chậm chứ không mất dữ liệu, người dùng tự thấy và chạy lại được; thêm ca kiểm sau rẻ.
  file: `packages/ui/test/pre-push-da-chung.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (am tinh mot minh): bo dem lan chay cua bo ve gia chi duoc assert == 0, chua bao gio duoc chung la dem duoc (r1 · tệp đã đổi)**
  Người dùng thấy gì: Các bài kiểm khẳng định hook không vẽ lại có thể vẫn xanh dù hook không chạy gì cả, nên chúng chưa thật sự chứng minh điều đã hứa.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp nhưng làm giảm độ tin của bài kiểm, và bổ sung một ca đối chứng rất rẻ.
  file: `packages/ui/test/trang-ve-gop.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (am tinh mot minh, khong ghim thong diep): an-toan (c) chi kiem `git commit` thoat 0 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận commit vẫn thành công khi bộ vẽ hỏng, chưa xác nhận người dùng thấy dòng hướng dẫn vẽ tay.
  Căn cứ: Đường tương tự đã có bài kiểm ghim thông điệp ở nhánh gộp, nên rủi ro còn lại nhỏ và không đáng mở việc.
  file: `packages/ui/test/trang-ve-gop.spec.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/5 lỗi rơi vào file không bộ đo nào phủ (.github/scripts/t1-ma-doc.mjs, Users/manhphan/dev/crm/.github/scripts/t1-ma-doc.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
