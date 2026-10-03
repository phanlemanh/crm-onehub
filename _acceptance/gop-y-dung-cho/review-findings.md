# Review findings: gop-y-dung-cho (round 1)

Tổng 17 phát hiện: 7 trong hợp đồng, 10 ngoài hợp đồng. Không finder nào chết, không có mục chờ phân loại, không có mục thiếu bác bỏ vì refuter chết.

## Trong hợp đồng

- **Trạng thái lỗi do quá hạn có nút «Thử lại» luôn bị khoá, không thoát ra được**
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:220`
  severity: high
  AC: AC-11
  source: bugs
  detail: `quaHan` chỉ đúng khi `dangSoan === true` (dòng 200-203). Đúng lúc đó `nut` trả `{ loai: "an" }` vì `if (!s || dangSoan || !ghiDuoc)` (dòng 220). VungKara ca "loi" (nhom-kara.tsx:315) đặt `disabled={gopY.nut.loai !== "mo" || gopY.dangGui}`, và `nho()` thoát sớm khi `nut.loai !== "mo"`. Thêm nữa, `nhipHoiLai` trả `false` sau `tranChoMs` nên việc hỏi lại dừng hẳn, còn `ds.dangSoan` trong cache giữ nguyên `true`. Cách tái hiện: bấm «Nhờ Kara góp ý», tác tử không xong trong 30 s (chậm hoặc đang tắt). Khung hiện `Empty` «Kara chưa đọc được Mục tiêu này» với «Thử lại» bị khoá vĩnh viễn, cho tới khi trang được refetch nhờ focus cửa sổ hoặc khung bị dựng lại. Bản cũ (`cot-gop-y.tsx`) cho thử lại vì `trangThaiNut` trả "mo" khi đang soạn. Việc này trái AC-11 (đọc lỗi → «Thử lại»). Ma trận trang-thai-kara chỉ thử "loi" bằng `maKetThuc: "loi"` với `dangSoan: false`, nên không bắt được.
  lý do thuộc hợp đồng: AC-11 và ST-b-loi hứa trạng thái đọc lỗi hiện «Kara chưa đọc được Mục tiêu này» kèm nút «Thử lại» dùng được; finding chỉ ra nút đó bị khoá vĩnh viễn ở nhánh quá hạn.

- **Sau khi quyết hết rồi «Nhờ Kara đọc lại»: không có chỉ báo đang đọc, lỗi của Kara bị che**
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts:210`
  severity: medium
  AC: AC-11
  source: bugs
  detail: `tatCa` gộp cả `daQuyet` (biên nhận trong phiên), và `if (tatCa.length > 0) return "co-gop-y";` đứng trước các nhánh "dang-doc"/"loi". Ở ca "co-gop-y" với `conCho === 0`, VungKara hiện nút «Nhờ Kara đọc lại». Bấm nút: `dangSoan` thành true nên `nut` thành "an" và nút biến mất, nhưng `noiDung` vẫn là "co-gop-y", nên không có `ThinkingIndicator`. Nếu việc kết thúc với `maKetThuc` khác `da-nop`, hoặc quá `tranChoMs`, thì cũng không hiện `Empty` «Kara chưa đọc được». Nút chỉ lặng lẽ hiện lại (lỗi), hoặc mất hẳn (quá hạn, xem phát hiện về nút khoá). Lỗi của lần đọc lại bị nuốt hoàn toàn.
  lý do thuộc hợp đồng: AC-11 và ST-b-dang-doc đòi lúc Kara đang đọc vùng Kara hiện ThinkingIndicator; finding chỉ ra sau khi bấm đọc lại, khi còn biên nhận, trạng thái đang đọc không có chỉ báo nào.

- **Hình dạng 4 (âm tính một mình): «không toast lỗi» khi CONFLICT trong khoa-gui không bao giờ đỏ được**
  file: `apps/app/test/gop-y-dung-cho-khung.tsx:462`
  severity: medium
  AC: AC-9
  source: measurement
  detail: Dòng 462 viết `expect(qs("[data-sonner-toast]")).toBeNull()` sau khi troLyQuyet trả CONFLICT. Hàm `dung()` trong apps/app/test/khung-gop-y-dung-cho.tsx (dòng 529-543) chỉ bọc NuqsTestingAdapter, QueryClientProvider, LocaleProvider và TooltipProvider. Không có `<Toaster />`: Toaster chỉ được gắn ở apps/app/app/layout.tsx:83, và tệp kiểm cũng không mock `sonner`. Vì vậy dù mã có gọi `toast.error(...)` thì DOM vẫn không có `[data-sonner-toast]`, và khẳng định này đúng với mọi bản. Bản trước vòng `cot-gop-y.tsx` (a1ba0de, dòng 256) dùng đúng `onError: (e) => toast.error(e.message)`, nên nếu mã quay lại toast khi gặp CONFLICT thì E14 vẫn xanh. Không có đối chứng dương nào cho thấy toast hiện được trong khung dựng này. Phần «không toast lỗi» của E14 vì thế chưa được đo.
  lý do thuộc hợp đồng: E14 là bằng chứng của AC-9 (409 thì không hiện lỗi nào); vế «không hiện lỗi» được đo bằng khẳng định không thể đỏ nên AC-9 chưa có bằng chứng thật.

- **Hình dạng 4 (âm tính một mình): «tab Vết không chứa Trợ lý OKR» được đo trên vết rỗng**
  file: `apps/app/test/gop-y-dung-cho-khung.tsx:680`
  severity: low
  AC: AC-11
  source: measurement
  detail: Bài «danh sach, hai hop Sua va tab Vet khong con chu Tro ly OKR» gọi `dungSheet()` ở dòng 673 mà không đặt `kho.chiTiet`, nên dùng giá trị mặc định của `datLai` là `chiTietTu(mtSheet())`, có `trail: []` (khung-gop-y-dung-cho.tsx:131). bang-vet.tsx chỉ in chữ «… — theo đề xuất của …» cho hàng vết có note `tro-ly-okr:` (theoKara/tenViec, khoảng dòng 67 và 157-166); bản cũ in chữ «Trợ lý OKR» cũng ở đúng chỗ này. Vết rỗng nên không hàng nào có thể in chữ cũ, và `expect(document.body.textContent).not.toContain("Trợ lý OKR")` ở dòng 680 xanh cả trên bản trước vòng. Bài cũng không có đối chứng dương: chỉ `nhip(5)` sau khi bấm tab, không chờ hay khẳng định hàng vết nào hiện ra. Phần «tab Vết» trong lời hứa của E17 vì thế rỗng.
  lý do thuộc hợp đồng: AC-11 hứa tab Vết không còn chữ «Trợ lý OKR»; E17 đo trên vết rỗng nên vế tab Vết của AC-11 chưa có bằng chứng.

- **Hình dạng 4 (không ghim thông điệp): chữ đỏ ghim của E3, E4, E10 không thể được bài đang chạy in ra**
  file: `apps/api/test/gop-y-dung-cho.spec.ts:424`
  severity: low
  AC: AC-2
  source: measurement
  detail: evals.yaml ghim chữ đỏ mà tệp kiểm không bao giờ sinh ra. E3 ghim 'dem sai: truong/M1 4 != 3', nhưng bài chỉ `expect(`${ai}/${mucTieu}=${...}`).toBe(...)` (dòng 266, 286), nên khi đỏ chỉ in "truong/<id M1>=4" so với "=3". E4 ghim 'chip lech danh sach: 3 != 2', nhưng bài so `truoc=${truoc} sau=${sau}` với "truoc=2 sau=2" (dòng 424). E10 ghim 'dau theo kara con sau khi sua tay: KR1', nhưng bài in '…: KR2' (dòng 463), vì kịch bản bị đảo: nhận KR2, sửa KR1, sửa tay KR2. Chạy chiều đỏ đúng như eval viết thì không khớp được thông điệp đã ghim, nên không chứng minh được bài đỏ vì đúng lý do.
  lý do thuộc hợp đồng: E3, E4, E10 (AC-2, AC-3, AC-7) khai chiều đỏ ghim bằng chữ mà bài thật không in ra, nên bằng chứng chiều đỏ của các AC này không dựng lại được bằng chính lệnh của eval.

- **Hình dạng 4 (âm tính không đối chứng): «scrollWidth == innerWidth» không thể đỏ ở 20/28 ô E23 nằm trong khung và hộp Sửa**
  file: `_acceptance/gop-y-dung-cho/rang/man-gop-y.mjs:406`
  severity: low
  AC: AC-14
  source: measurement
  detail: doO() đo `document.documentElement.scrollWidth` so với `innerWidth` cho mọi ô E23. Năm màn khung, khung-bien-nhan, khung-rong, hop-sua-muc-tieu và hop-sua-kr hiển thị trong SheetContent có lớp `fixed` (packages/ui/src/components/sheet.tsx:18). Phần tràn ngang của một hộp fixed không cộng vào vùng cuộn của tài liệu, nên ở 20 ô này phép «tran ngang» thực ra chỉ đo trang danh sách nằm bên dưới. Đối chứng dương của chiều đỏ (kiemDoDo, dòng 562-576) chỉ làm bật «nut bi cat» sau khi ép cột rộng 900px. decisions.jsonl d-20261003T162137Z-44 ghi rằng bản cũ ở 375px «không tràn». Không có ca nào chứng minh «tran ngang» đỏ được bên trong khung, nên nửa «scrollWidth == innerWidth» của 20 ô này là khẳng định âm không có đối chứng; chỉ phần đo nút bị cắt là có răng.
  lý do thuộc hợp đồng: AC-14 hứa không màn nào tràn ngang ở cả khung chi tiết và hai hộp Sửa; ở 20/28 ô phép đo thực ra chỉ đo trang danh sách bên dưới.

- **Hình dạng 5 (khai ma trận nhưng đo một phần): E3 khai 3 người × {M1, M2} trên mine và danhSach, bài chỉ đo một phần**
  file: `apps/api/test/gop-y-dung-cho.spec.ts:247`
  severity: low
  AC: AC-2
  source: measurement
  detail: evals.yaml E3 khai bảng viết trước {trưởng: M1=3, M2=0; phụ trách KR2: M1=1, M2=0; chỉ xem: M1=0, M2=0}, đo trên cả okr.mine lẫn okr.danhSach (12 ô), với M2 «cùng loại dòng» như M1 (nac=an, nhan, bac, bo-qua, het-han, dòng soạn). Bài chỉ đo một phần. BANG_BAT và BANG_DANH_SACH (dòng 247-258) đo danhSach cho 3 người × M1, còn cột M2 chỉ đo qua một người thứ tư là truong-nam. okr.mine chỉ có 2 khẳng định (dòng 270-271): không có người chỉ xem, không có M2. M2 chỉ được gieo 3 dòng chờ (dòng 217-239), không có loại dòng nào cần bị loại trừ. M1 cũng thiếu dòng bo-qua và het-han mà ma trận khai. Ba ô «M2=0» của ba người khai trong eval không có khẳng định nào, và số khẳng định không bằng số ô đã khai.
  lý do thuộc hợp đồng: AC-2 đòi soGopYCho đúng bảng kỳ vọng cho mọi (Mục tiêu, người dùng) và mọi loại dòng; E3 chỉ đo một phần ô và thiếu dòng bo-qua, het-han nên AC-2 chưa có bằng chứng đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **nhom-kara.tsx tự import icon AiGenerate ở chỗ gọi, và đặt thêm một tia sáng trong vùng đã mang nhãn Kara**
  Người dùng thấy gì: Nút gọi Kara nằm trong vùng đã có nhãn Kara nhưng vẫn mang thêm một tia sáng nữa, nên cùng một vùng hiện hai dấu AI. Chỉ là chuyện hình thức, thao tác vẫn dùng bình thường.
  file: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx`
  severity: medium
  Đề xuất: known-limits

- **Nhận một góp ý căn chỉnh xong thì không có Hoàn tác, trái mục 6 của ai-ux.md**
  Người dùng thấy gì: Sau khi bấm «Căn chỉnh» theo gợi ý của Kara, người dùng không có nút Hoàn tác để lùi lại; muốn gỡ phải tự gỡ liên kết bằng tay.
  file: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx`
  severity: medium
  Đề xuất: new-contract

- **okr-theo-kara.ts viết tay kiểu ảnh chụp vết, trùng z.infer okrVetSnapshot có sẵn trong cùng gói**
  Người dùng thấy gì: Người dùng không thấy gì khác hôm nay; chỉ là mã có hai nơi cùng mô tả dạng bản ghi vết, nếu một nơi đổi mà nơi kia không đổi thì tab Vết có thể hiển thị sai về sau.
  file: `packages/validation/src/okr-theo-kara.ts`
  severity: medium
  Đề xuất: wont-fix

- **bang-vet.tsx vẫn viết cứng tiền tố «tro-ly-okr:» sau khi diff đã tách hằng TIEN_TO_VET_KARA**
  Người dùng thấy gì: Hôm nay dấu «theo Kara» ở tab Vết và trên khung vẫn đúng; nhưng cách nhận ra «theo Kara» được định nghĩa ở hai nơi, nếu sửa một nơi thì hai chỗ có thể hiện không khớp nhau.
  file: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx`
  severity: low
  Đề xuất: known-limits

- **dem-gop-y.ts tự viết lại hàm dựng DonViCuaMucTieu thay vì dùng donViCua/chonDonVi có sẵn**
  Người dùng thấy gì: Số góp ý chờ trên danh sách hôm nay vẫn đúng; chỉ là cách tính quyền xem được viết lặp ở hai nơi, nếu luật quyền đổi mà chỉ sửa một nơi thì số trên chip có thể lệch.
  file: `apps/api/src/okr/dem-gop-y.ts`
  severity: low
  Đề xuất: wont-fix

- **tomTatCua ép kiểu `as keyof` trên maVanDe vốn đã có kiểu enum**
  Người dùng thấy gì: Hôm nay mọi mã vấn đề của Kara đều có câu tóm tắt đúng; nếu sau này thêm một mã mới mà quên viết câu tóm tắt, người dùng sẽ thấy lý do thô thay vì câu tóm tắt và không có cảnh báo nào.
  file: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx`
  severity: low
  Đề xuất: known-limits

- **Mở khung lúc Kara đang đọc: hỏi lại mãi, không bao giờ sang trạng thái lỗi**
  Người dùng thấy gì: Nếu mở khung đúng lúc Kara đang đọc, hoặc việc đọc bị treo vì tác tử tắt, khung có thể hiện «Kara đang đọc…» mãi, không bao giờ chuyển sang báo lỗi hay cho thử lại.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: medium
  Đề xuất: new-contract

- **Lỗi truy vấn troLyDanhSach bị nuốt: vùng Kara biến mất thay vì báo lỗi**
  Người dùng thấy gì: Nếu máy chủ không tải được danh sách góp ý, vùng Kara biến mất lặng lẽ: người dùng không thấy góp ý, không thấy lỗi và không có nút thử lại.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: medium
  Đề xuất: new-contract

- **troLyDeXuat lỗi thì không có phản hồi nào (mất onError)**
  Người dùng thấy gì: Khi bấm «Nhờ Kara góp ý» mà máy chủ báo lỗi (hết quyền, mất mạng, lỗi máy chủ), không có thông báo nào; nút chỉ mở lại như chưa có chuyện gì nên người dùng không biết yêu cầu đã hỏng.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: medium
  Đề xuất: new-contract

- **Hai lần Hoàn tác liên tiếp trên cùng useMutation làm mất callback của lần đầu**
  Người dùng thấy gì: Nếu bấm Hoàn tác ở hai KR liên tiếp rất nhanh, KR đầu có thể vẫn hiện nút «Hoàn tác» dù tên đã được trả về; lỗi của lần đầu cũng không hiện, và nếu đóng khung giữa chừng thì danh sách bên ngoài không làm mới.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/17 lỗi rơi vào file không bộ đo nào phủ (apps/app/test/gop-y-dung-cho-khung.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
