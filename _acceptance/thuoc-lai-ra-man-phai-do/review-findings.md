## Trong hợp đồng

**Ca «mở nguyên bản» còn dùng phép VÀ mà AC-2 vừa gỡ — quét lớp hụt trong chính file đã sửa**
- file: `packages/ui/test/lai-ra-man.spec.tsx:293`
- severity: high
- AC: AC-2

Diff đổi phép phân loại «hỏng» sang «không có xuất nào trọn cả hai chiều» ở hai chỗ (lai-ra-man.mjs phanNhom, và ca test thứ nhất ngay trên), nhưng ca test thứ hai trong CÙNG file vẫn giữ `ban.every((b) => b.loi_dong !== null && b.loi_mo !== null)`. Nghĩa là chỉ cần chiều ĐÓNG vẽ được thì loi=null, trong khi thứ ca này khẳng định lại đúng là trạng thái MỞ.

Đã chạy: thêm `throw new Error("vo")` vào đầu packages/ui/src/components/accordion.tsx → mo-nguyen-ban.mjs exit=0 và in «XANH: ca 9 dong deu mount duoc o trang thai mo», ban-khai-da-do.mjs exit=0. Một component không nạp nổi module vẫn được khai là mount được ở trạng thái mở.

Đây là lớp lỗi mà CLAUDE.md của kho gọi tên: sửa một chỗ rồi viết lại đúng nó vài chục dòng bên dưới — phải quét cả file theo hình dạng, không vá theo ca được nêu tên. Sửa: dùng cùng vị từ `!ban.some((b) => b.loi_dong === null && b.loi_mo === null)`.

---

**Chứng cứ «đỏ vì vật bị phá» chỉ chạy cho 1 trong 6 ca**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:397`
- severity: medium
- AC: AC-6

caCapHaiChieu có một bước rất đúng: chạy lại một ca với TLR_VO_HIEU_TIEM để chứng minh chiều đỏ biến mất khi vô hiệu phép tiêm. Nhưng bước đó chỉ áp cho «dem-du». Năm ca còn lại (mot-nguon, hong-mot-chieu, bo-ve-chet, khong-ban-cay, qua-lenh-cong) đều đã có sẵn nhánh VO_HIEU trong mã mà không ca nào gọi tới — nên không có gì chứng minh màu đỏ của chúng đến từ vết tiêm chứ không từ một nguyên nhân khác.

Ca mot-nguon là ví dụ sống: chiều đỏ của nó bị quyết định thừa. evidence/mac-dinh.json đã commit hiện trỏ tới 6 component đã bị xoá ở 84440ce (đã kiểm: 107 mục / 50 file, 6 file không còn trên cây), nên chỉ riêng việc hoàn nguyên bên vẽ về đọc file đã commit là đủ đỏ — thao tác xoá một component sống không đóng góp gì. Ca vẫn xanh kể cả khi xoaMotComponent bị biến thành no-op.

Sửa: chạy vòng vô hiệu cho cả 6 ca, không riêng dem-du — chi phí đúng bằng một vòng lặp đã có.

---

**Bốn ca ghim thông điệp do chính thước tự soạn, không phải lời của vật**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:329`
- severity: medium
- AC: AC-6

AC-6 hứa bằng chứng của cặp hai chiều là «mã thoát quan sát được cộng NGUYÊN VĂN thông điệp bắt được». ketCa() tìm nhãn ca trong chuỗi ra của chiều đỏ, nhưng với bốn ca thì chuỗi đó do chính thuoc-phai-do.mjs dựng: `MOT-NGUON: ...` (dòng 143), `HONG-MOT-CHIEU: ...` (dòng 193), `KHONG-BAN-CAY: ...` (dòng 290/303), `QUA-CONG: lenh cong thoat ...` (dòng 329). Riêng qua-lenh-cong thì nhãn được dán vào bất cứ khi nào mã thoát khác 0, bất kể lệnh cổng thật sự in ra gì.

Hệ quả: phép ghim thông điệp ở bốn ca đó là thước tự trích lời mình, chỉ còn mã thoát là thật. Nếu lệnh cổng đỏ vì lý do khác (thiếu bun, lỗi cú pháp config, hết bộ nhớ) thì ca vẫn xanh với đúng nhãn đó. Hai ca còn lại làm đúng: BO-VE-CHET và DEM-DU bắt nguyên văn chuỗi do vật thật in ra.

Sửa: với bốn ca này, ghim một cụm chữ do VẬT phát ra (ví dụ qua-lenh-cong ghim thông điệp DEM-DU mà spec in, không ghim nhãn do wrapper dán).

---

**Chiều đỏ của ca MOT-NGUON đỏ sẵn — bản tiêm không chứng minh được gì**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:148`
- severity: high
- AC: AC-6

caMotNguon() tiêm lại đường đọc cũ vào spec (`const macDinh = JSON.parse(readFileSync(join(HO_SO, "evidence", "mac-dinh.json")))`) rồi xoá một component, và kết luận ĐỎ khi kiemMotNguon() thấy một khoá của ve-that.json không còn file trên cây.

Nhưng `_acceptance/chan-lai-component-ra-man/evidence/mac-dinh.json` (đã commit, 107 mục / 50 file) đang trỏ tới 6 file KHÔNG còn trong HEAD:
  packages/ui/src/components/ai-elements/{artifact,chain-of-thought,checkpoint,model-selector,prompt-input,suggestion}.tsx
(kiểm bằng `git cat-file -e HEAD:<path>` → không tồn tại).

Spec ghi `banVe[f] = await laiMotFile(f)` cho MỌI f trong danh sách, kể cả file nạp module hỏng (laiMotFile bắt lỗi import và vẫn trả một mục). Nên ngay khi đường đọc cũ được tiêm lại, ve-that.json đã chứa 6 khoá chết ⇒ `chet.length > 0` ⇒ ma=1 kèm nhãn "MOT-NGUON" — HOÀN TOÀN ĐỘC LẬP với việc xoaMotComponent() có xoá gì hay không.

Hệ quả: chiều đỏ của E1 xanh-vỏ-đỏ-lòng. Bỏ hẳn bước xoá component, ca vẫn báo đỏ đúng nhãn và vẫn "qua" ketCa() + qua E6 (cap-hai-chieu). Đây đúng lớp "assertion âm-tính-một-mình" mà CLAUDE.md cấm: không phân biệt được "bắt đúng lỗi" với "đỏ vì nền đã lệch sẵn".

Làm nặng thêm: sau diff này không có đường chạy nào đặt TLR_GHI_BANG_CHUNG=1 (grep toàn kho: chỉ có trong plan/decisions + hai chỗ đọc cờ), nên evidence/mac-dinh.json bị đóng băng vĩnh viễn ở bản 107 mục lệch — độ lệch này sẽ chỉ lớn dần.

Đường sửa rẻ: trước khi tiêm, khẳng định `kiemMotNguon(d).ma === 0` TRÊN BẢN ĐÃ TIÊM-NHƯNG-CHƯA-XOÁ; chỉ khi đó bước xoá mới là biến duy nhất.

---

**Ca HONG-MOT-CHIEU đỏ vì phan-nhom.json cũ, không vì bộ phân loại bị lật**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:223`
- severity: high
- AC: AC-6

caHongMotChieu() tiêm HAI thứ: (a) lật vị từ phân loại trong lai-ra-man.mjs, (b) phaMotComponent() chèn `throw new Error("vo")` vào một component ngoài bản khai. Rồi chạy `ve(d); phanNhomTrong(d);` và đọc kết quả.

Bước (b) làm spec ĐỎ: component vỡ trở thành "hong" và "ngoai khai" ⇒ assert DEM-DU ở packages/ui/test/lai-ra-man.spec.tsx:275 thất bại ⇒ `bun test` thoát khác 0.

Mà lai-ra-man.mjs:90-91 giờ là:
    const maVe = chayBanVe();
    if (maVe !== 0) return maVe;
⇒ phanNhom() thoát SỚM, không bao giờ chạy tới vòng phân loại (dòng 105-123) và KHÔNG ghi lại phan-nhom.json (dòng 124).

docPhanNhom() (dòng 175-178) chỉ existsSync rồi đọc — không có mốc tươi nào — nên nó trả về phan-nhom.json của LƯỢT CHIỀU DƯƠNG. kiemHongMotChieu() so ve-that.json MỚI (có component vỡ) với phan-nhom.json CŨ (chưa biết component đó vỡ) ⇒ luôn `loi.push(f)` ⇒ ma=1, nhãn "HONG-MOT-CHIEU".

Hệ quả: đoạn suaTep() lật vị từ phân loại — thứ DUY NHẤT mà AC-2 nói ca này đo — không bao giờ được thực thi. Ca vẫn đỏ y hệt nếu bộ phân loại hoàn toàn đúng, và vẫn đỏ nếu bỏ hẳn bước suaTep(). Thước không gắn vào vật được giao.

Hai cách chữa đều rẻ: hoặc tách hai phép tiêm thành hai lượt (lật vị từ mà KHÔNG phá component — khi đó spec xanh, phanNhom chạy trọn, và 4 file trong khai-khong-ve-duoc.json bị xếp nhầm sẽ bắt đúng lớp lỗi), hoặc xoá `.tam/phan-nhom.json` trước mỗi lần đo và coi "thiếu tạo phẩm" là KHÔNG-ĐO-ĐƯỢC (ma=2) chứ không phải đỏ.

---

**Mã thoát của bước vẽ bị nuốt ở 3 chỗ; tạo phẩm cũ được đọc như mới**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:163`
- severity: high
- AC: AC-3

`ve(d)` trả {ma, ra} nhưng ở chiều đỏ giá trị trả về bị vứt ở cả ba ca: dòng 163 (caMotNguon), 223 (caHongMotChieu), 338 (caQuaLenhCong). Cùng lúc docVe() (62-65) và docPhanNhom() (175-178) chỉ existsSync + JSON.parse, không có dấu thời gian, không có run_id, và .tam không bị dọn giữa hai lượt.

Nghĩa là: bất kỳ lý do nào làm lượt vẽ chết ở chiều đỏ — spec lỗi cú pháp, bun không khởi động được, OOM, tiêm hỏng — đều để lại ve-that.json / phan-nhom.json của lượt TRƯỚC nguyên trên đĩa, và kiemMotNguon()/kiemHongMotChieu() đọc chúng như thể vừa sinh ra. Ba kết cục đều cho cùng một màu: đỏ có nhãn đúng ⇒ ketCa() trả 0 ⇒ E6 (cap-hai-chieu) cũng xanh.

Đây là cơ chế cụ thể đã làm hỏng finding #2, nhưng nó là lớp: chừng nào tạo phẩm còn được đọc mà không kiểm tươi, mọi ca trong bộ này đều có thể đỏ vì hạ tầng thay vì vì vật bị phá. Lưới tối thiểu: rmSync(join(d, ".tam"), {recursive:true, force:true}) trước mỗi lượt đo, và nếu ma !== 0 của bước vẽ thì trả ma=2 "KHONG DO DUOC" chứ đừng đọc tiếp.

---

**kiemMotNguon() không hề đọc danh sách bên CHẤM — quan hệ mà E1 khai là đo thì không đo**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:136`
- severity: medium
- AC: AC-1

evals.yaml E1 khai ca này đo QUAN HỆ giữa hai danh sách: "danh sach ben VE rut TU VAT DUOC GIAO ... danh sach ben CHAM rut bang docMacDinh()" và "hai danh sach trung nhau tung phan tu, ma 0, in so phan tu ca hai ben".

kiemMotNguon() (136-146) chỉ làm một việc: lọc các khoá của ve-that.json mà file không tồn tại trên cây. Nó không gọi docMacDinh(), không dựng danh sách bên CHẤM, không so hai tập, không in số phần tử nào.

Hai hệ quả:
1. Chiều dương rỗng nghĩa: trên bản sao nguyên vẹn, mọi khoá của ve-that.json đương nhiên tồn tại (spec vừa lấy chúng từ docMacDinh trên chính cây đó), nên ma=0 là tất yếu — không phải bằng chứng hai bên cùng nguồn.
2. Chiều lệch ngược không bắt được: nếu bên CHẤM thấy file mà bên VẼ không có (docMacDinh trả thêm mục, hoặc spec bỏ sót file), kiemMotNguon() im lặng trả 0.

Cộng với finding #1 (chiều đỏ đỏ-sẵn), E1 hiện không phân biệt được bất kỳ trạng thái nào của thứ nó tuyên bố canh.

---

**Assertion âm-tính-một-mình: chiều đỏ của MOT-NGUON đỏ được nhờ tạo phẩm CŨ, không cần bản tiêm từng chạy**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:163`
- severity: high
- AC: AC-3

Trong `caMotNguon`, lượt chạy sau khi tiêm — `ve(d)` ở dòng 163 — bị **bỏ mã thoát**, rồi `kiemMotNguon(d)` (dòng 136-146) đọc `.tam/ve-that.json` bằng `docVe`. File đó đã được lượt chạy ĐỐI CHỨNG DƯƠNG ghi ra trước đó, và nó liệt kê đúng component mà `xoaMotComponent` vừa `rmSync` ở dòng 161. Nên nếu lượt chạy sau khi tiêm chết vì bất cứ lý do gì (spec bị tiêm không biên dịch, bun lỗi, module phụ thuộc file vừa xoá làm suite nổ, .tam không ghi được), `ve-that.json` giữ nguyên bản cũ → `kiemMotNguon` vẫn thấy `chet.length > 0` → trả `ma 1` kèm đúng nhãn `MOT-NGUON:` → `ketCa` chấm chiều đỏ ĐẠT. Tức ca này không phân biệt được «thước bắt đúng lỗi» với «thước chưa bao giờ chạy lại». Cùng hình dạng ở `caHongMotChieu` dòng 223-224 (`ve(d); phanNhomTrong(d);` đều bỏ mã thoát trước khi `kiemHongMotChieu` đọc `.tam/phan-nhom.json`). Lời giải cùng lớp: xoá tạo phẩm ở `.tam` trước lượt tiêm, hoặc ghim mốc thời gian/định danh lượt chạy vào tạo phẩm rồi đòi nó phải MỚI.

---

**Assert điều kiện thay cho QUAN HỆ: MOT-NGUON hứa so hai danh sách từng phần tử nhưng chỉ kiểm file-có-tồn-tại**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:139`
- severity: high
- AC: AC-1

evals.yaml E1 (dòng 14-19, 26) khai lời hứa là QUAN HỆ: «danh sach ben VE rut TU VAT DUOC GIAO … danh sach ben CHAM rut bang `docMacDinh()` … hai danh sach trung nhau tung phan tu, ma 0, in so phan tu ca hai ben» và «Ca do QUAN HE giua hai danh sach». Nhưng `kiemMotNguon` chỉ làm một phép: `Object.keys(banVe).filter((f) => !existsSync(join(d, f)))` — bên CHAM (`docMacDinh`) không hề được gọi, hai danh sách không bao giờ đặt cạnh nhau, không số phần tử nào được in. Phép hiện có chỉ bắt được chiều «file bị xoá còn sót trong bản vẽ»; mọi phân kỳ khác giữa hai đầu — bên vẽ thiếu component MỚI mà `docMacDinh` có, hai bên khác thứ tự/khác tập nhưng mọi file đều còn trên đĩa — đều XANH. Đúng hình dạng «assert sự-có-mặt trong khi lời hứa là quan hệ giữa hai giá trị».

---

**Tuyên quét LỚP nhưng chỉ có điểm-case: ma trận 5 ô (loi_dong × loi_mo) của HONG-MOT-CHIEU không tồn tại trong mã**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:180`
- severity: high
- AC: AC-2

evals.yaml E2 dòng 43-48 khai rõ ràng: «Ma tran toi thieu viet TRUOC, 5 o: (loi_dong, loi_mo) = (co,null) · (null,co) · (co,co) · (null,null) … O5 = ROUND-TRIP … 5 assert, moi assert neu ten o». `kiemHongMotChieu` (dòng 180-205) không có ô nào: nó duyệt `Object.entries(banVe)` của cây thật và chỉ assert một mệnh đề gộp `!tron && !khongVe.has(f)`. Không có assert nào dựng ô (null,co), (co,co), (null,null), không assert nào nêu tên ô. Hệ quả cụ thể: chiều đỏ của ca dựa vào `phaMotComponent` — prepend `throw` làm module không nạp được, mà nhánh bắt lỗi nạp module trong spec (lai-ra-man.spec.tsx dòng ~185-196) luôn sinh đúng MỘT hình dạng `{loi_dong: <có>, loi_mo: null}`. Tức chỉ ô (co,null) từng được chạy; ba ô còn lại chưa bao giờ đi qua bên CHAM, và ô (null,co) — lỗi chỉ ở chiều mở — chính là ô mà đổi `&&` thành `||` ở `banVeRong` (lai-ra-man.mjs dòng 12) vừa động tới.

---

**Assert chuỗi thay cho QUAN HỆ: DEM-DU đặt cùng biến đếm ở hai vế `toBe` nên hai con số không bao giờ được so**
- file: `packages/ui/test/lai-ra-man.spec.tsx:275`
- severity: high
- AC: AC-4

evals.yaml E4 dòng 83 khai: «Assert do QUAN HE bang-nhau giua hai so, khong do nguong >0». Mã viết:

    const dem = `DEM-DU: ve duoc ${file.length - hong.length}/${file.length}, ngoai khai: `;
    expect(dem + (ngoaiKhai.join(", ") || "khong")).toBe(`${dem}khong`);

`dem` xuất hiện nguyên văn ở CẢ HAI vế nên nó triệt tiêu: hai con số `file.length - hong.length` và `file.length` không bao giờ được đặt cạnh nhau, assert thật chỉ là «chuỗi ngoaiKhai rỗng». Quan hệ còn lại được đo là `hong ⊆ khai`, không phải bằng-nhau — mọi phần tử nằm trong `khai-khong-ve-duoc.json` làm hai số lệch nhau mà vẫn xanh. Con số trong thông điệp là trang trí, không phải mệnh đề; muốn đo quan hệ thì phải assert trực tiếp trên số (vd `expect(file.length - hong.length).toBe(file.length - Object.keys(khai).length)`).

---

**Chiều đỏ ghim nhãn do CHÍNH thước tự viết ra: QUA-CONG đỏ vì bất cứ lý do gì cũng đọc là đạt**
- file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs:329`
- severity: medium
- AC: AC-6

`lenhCong` tự dán nhãn vào đầu ra của chính nó: `ra: r.ma === 0 ? r.ra : \`QUA-CONG: lenh cong thoat ${r.ma}\n...\`` (dòng 329), rồi `ketCa` (dòng 115-117) đi tìm đúng chuỗi `QUA-CONG` đó trong `do_.ra`. Nhãn LUÔN có mặt khi mã thoát khác 0, nên phép «ghim thông điệp» ở ca này là tự-ứng-nghiệm: nó chỉ lặp lại điều mã thoát đã nói. evals.yaml E7 dòng 138 đòi «thong diep chua nhan "QUA-CONG" kem ten ca da do» — phần «tên ca đã đỏ» không được trích ở đâu cả. Hệ quả: lệnh cổng (`cl_tieng_viet_den_man` = `lai-ra-man.mjs dan-so && bun test …`) đỏ vì một nguyên nhân không liên quan — `dan-so` lệch neo `NEO.file = 383`, một test khác trong cùng file spec hỏng, bun không khởi động — đều đi qua như bằng chứng «dây nối còn sống». Cùng hình dạng ở `kiemMotNguon`/`kiemHongMotChieu`/`banChung`: chuỗi được ghim là chuỗi do chính răng viết, không phải thông điệp do vật đang đo phát ra (so với BO-VE-CHET và DEM-DU, hai ca duy nhất ghim thông điệp thật của vật).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Cổng cl_phan_biet đỏ trên cây sạch — bên đọc không dời theo bên viết**
  Người dùng thấy gì: Một cổng kiểm tra khác trên hệ thống có thể báo lỗi ngay cả khi phần mềm hoàn toàn ổn, vì nó đang đọc kết quả từ nơi không còn được cập nhật — cần một đợt sửa riêng cho đúng hồ sơ đó.
  file: `_acceptance/chan-lai-component-ra-man/rang/phan-biet-hai-chieu.mjs`
  severity: high
  Đề xuất: new-contract

- **cl_mo_nguyen_ban / cl_ban_khai_da_do chấm ảnh chụp đã commit, không chấm lượt vừa chạy**
  Người dùng thấy gì: Hai bước kiểm tra tự động có thể luôn báo cùng một kết quả cố định bất kể lần chạy mới nhất thực sự cho ra gì, khiến chúng mất tác dụng phát hiện thay đổi thật.
  file: `_acceptance/chan-lai-component-ra-man/rang/mo-nguyen-ban.mjs`
  severity: high
  Đề xuất: new-contract

- **Bản vẽ khai loi_mo=null cho chiều chưa bao giờ thử**
  Người dùng thấy gì: Báo cáo kiểm tra có thể ghi nhận một phần giao diện là hiển thị tốt dù nó chưa từng được thử nghiệm thật sự, gây hiểu nhầm khi đọc kết quả.
  file: `packages/ui/test/lai-ra-man.spec.tsx`
  severity: medium
  Đề xuất: known-limits

- **Fixture viết tay đúng khuôn bên đọc: SAN-KHUON ghim danh sách tên trường bằng tay, không rút từ bên CHAM**
  Người dùng thấy gì: Nếu sau này có người thêm một trường dữ liệu mới vào bản ghi kiểm tra, hệ thống sẽ không nhận ra và vẫn báo ổn — một khoảng hở nhỏ trong khả năng tự kiểm chứng của bộ kiểm tra.
  file: `_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
