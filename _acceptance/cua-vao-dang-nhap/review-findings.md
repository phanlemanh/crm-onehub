## Trong hợp đồng

- **thuoc-da-ky passes vacuously when the base tree fails, so a broken baseline reads as 'no regression'**
  file: `_acceptance/cua-vao-dang-nhap/rang/thuoc-da-ky.mjs:75`
  severity: medium
  detail: soSanh() returns dat:true for any base exit code other than 0 ('base khong dat, khong tinh'). chayTrenCay() also maps a missing exit code to -1 (`ma.get(i) ?? -1`, line 108) and ignores `r.status` of `bun run do:man` as long as ma.txt exists (line 101). Case 1: the base worktree environment breaks, for example Turbopack or node_modules or Prisma, which commits 6195cc4d and 4ac623ca just fixed. Every base command then exits non-zero. Case 2: the do:man session dies after writing only the first line, so every later eval gets -1 on both sides. Either way each eval prints DUNG, KET LUAN shows N DUNG / 0 SAI and the script exits 0. The regression gauge reports clean without comparing anything. The script has no minimum count of base evals that passed and does not treat -1 (never ran) as KHONG DO DUOC. The fix: exit 2 when base has no command exiting 0, or when any index is -1 on either tree.
  source: bugs
  rationale: AC-13 hứa so sánh kết quả eval giữa cây sau vòng này và merge-base; script coi mọi lần cây gốc lỗi là 'đạt' nên không thực hiện đúng phép so sánh mà AC-13 yêu cầu.
  AC: AC-13

- **Hình dạng 4 (âm tính một mình, bộ dò không thể bắn): E13 «không tiêu điểm nào vào khối hướng dẫn» không bao giờ đo được**
  file: `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs:262`
  severity: high
  detail: Trong doTab, vòng lặp dừng khi `thay.length < can.length` không còn đúng, tức là ngay sau khi gặp nút «Đăng nhập». Nó không chạy «tới khi trở lại body hoặc 12 lần» như E13 ghi. Theo auth-shell.tsx, khi có gioiThieu thì `khungDangNhap` đứng TRƯỚC section chứa khối trong DOM; `lg:order-first` chỉ đổi thứ tự hiển thị, không đổi thứ tự Tab. Vậy ở cả hai khổ 320 và 1440, mọi phần tử focus được trong khối hướng dẫn đều nằm sau nút «Đăng nhập», và vòng Tab dừng trước khi tới chúng. Hệ quả: `vaoKhoi` luôn rỗng, và vế `!vaoKhoi` là một khẳng định âm tính không có đường nào bắn. Nhát phá-thử mà E13 hứa (thêm tabIndex=0 vào bước 1 trong bản sao, kỳ vọng «SAI light: tieu diem vao khoi huong dan (buoc 1)») sẽ vẫn ra DUNG. Sổ phá-thử ở Notes của contract cũng không có nhát này, nên chưa chiều đỏ nào chứng minh bộ dò chạy được.
  source: measurement
  rationale: AC-12 hứa không phần tử nào trong khối hướng dẫn nhận tiêu điểm khi Tab; vòng lặp đo dừng trước khi tới khối đó nên vế này không bao giờ được kiểm chứng thật.
  AC: AC-12

- **Hình dạng 2 (fixture viết tay): ca no-one-can của E19 là chuỗi gõ tay, không rút từ writer**
  file: `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs:42`
  severity: medium
  detail: CA_HTML dùng giá trị gõ tay `"No_one_can_sign_in_yet:_set_ALLOWED_SIGN_IN_in_.env"`. E19 nói 6 ca «= 6 ca đầu của E8», mà ca no-one-can của E8 lấy «từ E5», tức rút qua rutCauHook và quaCallback (test DOM làm đúng như vậy qua giaTriThat("chua-khai")). Giá trị thật ở packages/auth/src/auth.ts:308 sau phép biến đổi dài hơn nhiều và mang `"acme.com"`, `(`, `=`. Đó chính là các ký tự mà bộ dò «thoát HTML» (&quot;) và «mã hoá URL» cần gặp. Chuỗi gõ tay không có dấu nháy, nên dòng html-no-one-can trên HTML thật không đo giá trị better-auth thật sự trả về.
  source: measurement
  rationale: AC-7 liệt kê đích danh giá trị «No one can sign in yet…» của hook và hứa không rò rỉ nó ở dạng thô/thoát HTML/mã hoá URL; bàn đo dùng chuỗi gõ tay khác chuỗi thật nên không kiểm chứng đúng giá trị mà AC-7 nêu.
  AC: AC-7

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): bước 1 chỉ kiểm từng mảnh có mặt, không ghim chỉ đường theo thứ tự**
  file: `apps/app/test/cua-vao-sign-in.dom.tsx:169`
  severity: medium
  detail: AC-3/E3 hứa bước 1 có chỉ đường «Cài đặt › Thành viên › Cho phép một địa chỉ». Test chỉ có ba lệnh `toContain` rời (caiDat, tv.trang.tieuDe, tv.duocPhepVao.nutThem) trên buoc[0].moTa. Một mô tả đảo thứ tự hay mất dấu › (ví dụ «Cho phép một địa chỉ ở Thành viên, Cài đặt») vẫn xanh. Lời hứa là quan hệ thứ tự giữa ba giá trị trong một đường dẫn, không phải chuyện từng chuỗi có mặt.
  source: measurement
  rationale: AC-3 hứa bước 1 có chỉ đường theo đúng thứ tự Cài đặt › Thành viên › Cho phép một địa chỉ; bài kiểm chỉ tra từng mảnh có mặt riêng lẻ nên không kiểm chứng đúng thứ tự mà AC-3 yêu cầu.
  AC: AC-3

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): tập tên trên nút ngoài lấy từ prop provider qua bảng tên của test, không từ nhãn trang vẽ**
  file: `apps/app/test/cua-vao-sign-in.dom.tsx:39`
  severity: medium
  detail: E4 nói tập tên nút rút từ «props nhan của SocialSignIn/SsoSignIn». Mock ở dòng 38–46 bỏ qua `nhan`: với social nó ghi `TEN_HANG[provider]` theo bảng TEN_HANG của chính test, với SSO nó ghi `p.name`. Tức là test đo đầu vào (mã nhà cung cấp mà trang bảo component vẽ), chứ không đo nhãn trang thật sự đưa ra (`m.continueWith(TEN_HANG[provider])`). Nếu nhãn nút sai tên hãng mà bước 2 vẫn đúng tên thì cả sáu ca ma-tran-cua vẫn xanh. Trên màn thật, doSignInOptions có đọc chữ nút, nhưng chỉ cho cấu hình API trả về (Google).
  source: measurement
  rationale: AC-4 hứa tên nhà cung cấp ở bước 2 khớp đúng tên hiện trên các nút ngoài thật sự vẽ ra; bài kiểm lấy tên từ bảng tra riêng thay vì nhãn trang thật nên không kiểm chứng đúng điều AC-4 hứa.
  AC: AC-4

- **Hình dạng 4 (âm tính một mình): «ô lỗi không lấy tiêu điểm» chỉ kiểm vắng thuộc tính ở gốc, và bàn đo màn thật xoá dấu vết trước khi đo**
  file: `apps/app/test/cua-vao-sign-in.dom.tsx:359`
  severity: low
  detail: `expect(alert.hasAttribute("tabindex")).toBe(false)` và `autofocus` toBe(false) chỉ kiểm phần tử gốc role=alert, trên markup tĩnh. Không có đối chứng dương (ví dụ một phần tử có autoFocus để chứng minh đường render này sinh thuộc tính), và không ghim thông điệp. Trên màn thật, doTab gọi `document.activeElement?.blur()` (do-cua-vao.mjs:257) trước khi nhấn Tab, nên nếu ô lỗi hay con của nó lấy tiêu điểm lúc tải thì dấu vết bị xoá. Không phép đo nào quan sát hành vi «không lấy tiêu điểm» của AC-8.
  source: measurement
  rationale: AC-8 hứa ô lỗi không lấy tiêu điểm; bài kiểm chỉ tra vắng thuộc tính tĩnh mà không có đối chứng dương hay quan sát hành vi thật, nên không kiểm chứng đúng vế đó của AC-8.
  AC: AC-8

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Password-link TTL helper was extracted, but quen-mat-khau still computes the same value its own way**
  Người dùng thấy gì: Trang Quên mật khẩu vẫn hiển thị đúng số phút hết hạn cho người dùng; đây chỉ là một chỗ tính trùng lặp trong mã, không đổi những gì người dùng nhìn thấy.
  file: `apps/app/lib/cua-vao/thoi-han.ts`
  severity: low
  Đề xuất: known-limits

- **StepList makes activeStep optional for every caller, and the new packages/ui prop is named in Vietnamese**
  Người dùng thấy gì: Nếu sau này có nơi khác dùng lại danh sách bước ở chế độ tiến độ mà quên truyền bước đang chọn, bước đó sẽ không được đánh dấu rõ — nhưng mọi màn hình hiện tại đều truyền đủ nên chưa ai bị ảnh hưởng.
  file: `packages/ui/src/components/step-list.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, thiếu ma trận viết trước): thuoc-da-ky không ghim số eval, danh sách rỗng vẫn thoát 0**
  Người dùng thấy gì: Đây là công cụ đo nội bộ dùng để phát hiện hồi quy; nếu danh sách kiểm tra tự động bị co lại, người dùng cuối không bị ảnh hưởng trực tiếp, nhưng đội phát triển có thể tưởng nhầm là không có gì hỏng.
  file: `_acceptance/cua-vao-dang-nhap/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ma trận phanLoaiLoiDangNhap gõ tay mã lỗi**
  Người dùng thấy gì: Một bài kiểm tra phụ dùng dữ liệu tự gõ thay vì dữ liệu thật, nhưng bài kiểm tra chính đã kiểm đúng dữ liệu thật ở chỗ khác nên lỗi thật vẫn bị phát hiện.
  file: `apps/app/test/cua-vao-ham.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): signInOptions của E1 không khai kiểu RouterOutputs như eval hứa**
  Người dùng thấy gì: Dữ liệu giả lập trong bài kiểm thiếu khai báo kiểu chặt chẽ; nếu khuôn dữ liệu API đổi sau này bài kiểm có thể không báo đỏ kịp thời, nhưng hiện tại không đổi những gì người dùng thấy.
  file: `apps/app/test/cua-vao-trang-khac.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có mục nào — không có finding unverified=true trong vòng này.)

⚠ Cụm ngoài vùng phủ: 2/11 lỗi rơi vào file không bộ đo nào phủ (packages/ui/src/components/step-list.tsx, apps/app/test/cua-vao-ham.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.