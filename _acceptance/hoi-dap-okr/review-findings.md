# Review findings: hoi-dap-okr (round 1)

## Trong hợp đồng

- **Hình dạng 1 — Đo CHỈ DẪN thay vì ĐẦU RA: E12 grep mã nguồn tìm chữ «xuongModelZdr» thay vì xem providerOptions của lời gọi thật**
  AC: AC-12
  file: apps/agent-okr/test/zdr-hoi.spec.ts:37
  severity: high
  detail: E12 hứa «mọi lời gọi qua model giả của xưởng mang cờ ZDR trong providerOptions ở phiên okr-hoi». Bài không gọi model nào và không bắt lời gọi nào. Nó chỉ (a) so `d.model?.modelId` với hằng config, (b) `expect(nguon).toContain("xuongModelZdr(")` trên chữ của agent.ts (dòng 33-38), (c) `lenhDoGoiModel` dùng regex tìm chuỗi `@crm/ai-okr` và `xuongModelZdr` trong chữ của tệp rang (dòng 13-24). Nếu xưởng thôi gắn cờ ZDR vào providerOptions, hay một phiên okr-hoi đi qua đường khác, bài vẫn xanh, vì chỉ cần chữ có mặt trong nguồn. Thứ được đo là chỉ dẫn (mã nguồn), không phải đầu ra (cờ trên lời gọi).
  source: measurement

- **Hình dạng 2 — Fixture viết tay: E6 ghi AiChiPhi thẳng bằng ghiChiPhi thay vì qua hook chi-phi**
  AC: AC-6
  file: apps/api/test/okr-hoi-luot.spec.ts:30
  severity: high
  detail: E6 ghi rõ «AiChiPhi tháng này được ghi bằng CHÍNH hook chi-phi của agent-okr (nhận sự kiện step.completed theo khuôn eve thật…)». Nhưng `ghiBuoc` (dòng 30-45) gọi thẳng `ghiChiPhi` với `tinhNang: OKR_HOI_TRAN.tinhNang` viết tay, đúng khuôn mà bên đọc `chiPhiThangHoiDap` lọc. Hàng không đi từ bên ghi (hook) sang bên đọc. Hook mà ghi sai tinhNang hay sai cột `at` cho phiên okr-hoi thì trần tháng ở production không bao giờ chạm, còn bài vẫn trả het-tran-thang (dòng 95-99).
  source: measurement

- **Hình dạng 2 — Fixture viết tay: E6c giả kết quả hoiTangLuot bằng biến ketLuot, không đặt lượt về 39 và không ghi chi phí qua hook**
  AC: AC-6
  file: apps/app/test/cua-okr-hoi.spec.ts:193
  severity: high
  detail: E6c hứa «đặt số lượt hôm nay của người hỏi về 39 thì câu thứ 40 qua…; câu 41 trả 429…; trần tháng chạm (hàng AiChiPhi ghi qua hook chi-phi như E6)». Nhưng `okr.hoiTangLuot.mutate` bị mock (dòng 36-49) trả `ketLuot`, và bài tự gán `ketLuot = { ok: false, lyDo }` (dòng 203) đúng khuôn cửa đọc. Không có hàng OkrLuotHoi nào, không có AiChiPhi nào, không có câu thứ 40 hay 41. Quan hệ giữa số lượt hay chi phí và mã 429 chưa bao giờ đi qua writer thật. Bài chỉ đo nhánh `if (!luot.ok) return loi(429, …)` trên một giá trị dựng sẵn.
  source: measurement

- **Hình dạng 2 — Fixture viết tay: E6m đưa thẳng prop lyDoKhoa, bỏ qua bộ đọc phản hồi 429 (lyDoKhoaTu)**
  AC: AC-6
  file: apps/app/test/okr-hoi.dom.tsx:163
  severity: high
  detail: E6m hứa «phản hồi 429 het-luot-ngay và het-tran-thang từ cửa làm ô gõ disabled», kèm chiều đỏ «bỏ nhánh 429 thì ô gõ còn bật». Nhưng bài render `KhungHoi` với `dung({ lyDoKhoa: lyDo })`, tức là prop đã ở đúng khuôn bên hiển thị đọc. Nhánh 429 thật nằm ở `loi-hoi.ts::lyDoKhoaTu` (parse `{status:429, body:'{"error":…}'}`) và được gọi từ cot-hoi-kara.tsx. grep cho thấy không bài kiểm nào gọi `lyDoKhoaTu`. Xoá hay làm hỏng nhánh 429 thì E6m vẫn xanh, nên chiều đỏ đã khai không thể xảy ra.
  source: measurement

- **Hình dạng 2 — Fixture viết tay: E10m tự dựng tin eve (dynamic-tool, output) và ép kiểu `as unknown as EveMessage`, không rút từ phiên ghi lại**
  AC: AC-10
  file: apps/app/test/okr-hoi.dom.tsx:18
  severity: high
  detail: E10m ghi rõ luồng sự kiện phải «rút từ một phiên agent-okr ghi lại, không tự dựng khuôn». Bài viết tay `NOP` (dòng 21-45), `LUOT_TRA_LOI` và `LUOT_KHONG_NOP` (`type: "dynamic-tool"`, `toolName`, `state: "output-available"`, `output.traLoi…`), rồi ép qua `tin()` bằng `as unknown as EveMessage` (dòng 18-19), nên trình biên dịch cũng không giữ khuôn. Tên part, trạng thái hay chỗ đặt output của eve thật mà khác (vd. tool tĩnh thay vì dynamic-tool, result bọc khác) thì khung hiển thị không thấy trích nào ở production, còn bài vẫn xanh vì fixture được viết theo đúng khuôn mà khung-hoi đọc.
  source: measurement

- **Hình dạng 2 — Fixture viết tay: ca «Mức tự tin» của E4 đưa vào `truong` một giá trị mà writer không bao giờ sinh ra**
  AC: AC-4
  file: packages/validation/test/okr-tra-loi.spec.ts:55
  severity: medium
  detail: Ca `truong-tu-tin-khop`: `chu: "Mức tự tin 3."`, `trich: [kr("k1", [10, 3])]`. Writer thật là `hoi-tra-loi.ts::giaTriCua`. Nó dựng `truong` của KR là `[tienDo, khoiDiem, hienTai, dich]` và của Mục tiêu là `[tienDo, kyVong]`, không có Mức tự tin. Mức tự tin ở hoi-doc là enum `cao|vua|thap`, không phải số. Vậy ca «khớp» này đo một khuôn chỉ bên đọc `kiemSoCau` chấp nhận, không đi theo đường writer→reader. Lớp «Mức tự tin» mà AC-4 hứa thực tế chưa được đo.
  source: measurement

- **Hình dạng 5 — Tuyên ma trận toàn phần nhưng chỉ có điểm-case: bảng ca E4 thiếu nửa số ô đã khai**
  AC: AC-4
  file: packages/validation/test/okr-tra-loi.spec.ts:134
  severity: medium
  detail: E4 hứa «mỗi trường (tiến độ, giá trị hiện tại, đích, Mức tự tin) một ca khớp và một ca lệch», cùng «2 Mục tiêu tương tự» (khớp và lệch). Bảng CA có tiến độ khớp và lệch, nhưng giá trị hiện tại chỉ có khớp, đích chỉ có lệch, Mức tự tin chỉ có khớp, đếm Mục tiêu chỉ có khớp. Không có ma trận trường × {khớp, lệch} viết trước. Khẳng định `expect(CA.length).toBe(16)` (dòng 135) chỉ đếm lại chính danh sách điểm-case, không so với số ô đã khai. Thiếu ô thì không gì cắn.
  source: measurement

- **Hình dạng 3 — Chuỗi-có-mặt thay cho quan hệ tập: ô từ khoá KR của E1 chỉ xét GIOI_HAN có trong JSON hay không**
  AC: AC-1
  file: apps/agent-okr/test/hoi-quyen.integration.spec.ts:118
  severity: medium
  detail: E1 hứa với mỗi hàng và mỗi bộ lọc (rỗng, chu kỳ quý 4, từ khoá KR) rằng tập mã Mục tiêu và KR công cụ trả về so BẰNG với tập rút từ dieuKienXemMucTieu, «quan hệ tập, không chuỗi-có-mặt». Ô từ khoá chỉ có `expect(JSON.stringify(theoChu).includes(GIOI_HAN)).toBe(n.thay)` (dòng 118-122). Không so tập Mục tiêu hay KR, không xét mã KR của q4-phap-che-3, nên chiều đỏ (b) «thông điệp in mã KR lọt» không thể có. Ô «bộ lọc rỗng» `{}` cũng không được gọi cho hàng nào. Ca `rong` (dòng 151-158) là chu kỳ không có OKR, không phải bộ lọc rỗng. Biến đếm `soKhangDinh` đếm theo test, không theo ô bộ lọc.
  source: measurement

- **Hình dạng 4 — Khẳng định âm-tính-một-mình: các ca từ chối của E5 chỉ ghim mã HTTP 403, không ghim mã lỗi; ca «không có hàng member» xanh cả khi bỏ kiểm member**
  AC: AC-5
  file: apps/app/test/cua-okr-hoi.spec.ts:178
  severity: high
  detail: `nguoi khong co hang member: 403` (dòng 178-182) gửi NGOAI với `cuoc.member`, tức cuộc của người khác. Bỏ dòng `if (!role) return loi(403, NOT_A_MEMBER)` ở route.ts thì cửa vẫn trả 403 qua `cuocKhongThuocBan` trong cua-okr-hoi.ts, và bài vẫn xanh vì chỉ xét `ra.status`. `duong phien la: 403` (dòng 169-176) cũng chỉ xét status. E5 hứa «đường phiên không thuộc cuộc 409 có mã», nhưng bài không ghim mã nào, và nhánh 409 `phienDaThay` không có ca. E5 cũng hứa «mỗi ca từ chối khẳng định okr.hoiTangLuot không được gọi», nhưng chỉ ca cuộc người khác kiểm `daTangLuot`, hai ca còn lại không kiểm.
  source: measurement

- **Hình dạng 4 — Thông điệp không được ghim: chiều đỏ «in tỷ lệ» của E9 khẳng định một chuỗi luôn có mặt**
  AC: AC-9
  file: _acceptance/hoi-dap-okr/rang/do-hoi-dap.test.ts:116
  severity: medium
  detail: E9 hứa ca phiếu dưới ngưỡng «làm thoát 1 và in tỷ lệ». Bài khẳng định `expect(tong.dong).toContain("dung y")`, nhưng `tongHop` luôn in dòng tổng `quyen …% · trich va so …% · dung y …% tren N cau` dù đạt hay trượt. Khẳng định này không bao giờ đỏ: dòng trượt `dung y X% < 85%` mà mất hay sai số thì bài vẫn xanh. Chỉ `tong.ma === 1` thật sự được đo, còn thông điệp thì chưa được ghim.
  source: measurement

- **Hình dạng 5 — Tuyên thuộc tính lớp nhưng chỉ kiểm một điểm: translate=no của E13 xét đúng một nhãn, nhãn đó là KR, và lệnh hdo_chu không chạy test ấy**
  AC: AC-13
  file: apps/app/test/okr-hoi.dom.tsx:118
  severity: low
  detail: E13 hứa «tên Mục tiêu trong câu trả lời nằm trong phần tử translate=no». Khẳng định duy nhất là `expect(nhan[0]?.getAttribute("translate")).toBe("no")`, và `nhan[0]` là trích KR «Doanh thu quý 4». Nhãn Mục tiêu `nhan[1]` không được xét, không có vòng qua mọi nhãn trích. Khẳng định này còn nằm trong test tên `hdo-man: …`, trong khi lệnh `hdo_chu` chạy `-t hdo-chu` nên chỉ chạy test so khoá vi/en. Lệnh của E13 vì vậy không chạy khẳng định translate=no nào.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tim_okr đọc chu kỳ không theo id mà thiếu KY_CON_HIEN: chu kỳ đã ẩn vẫn có thể thành «quý hiện tại» mặc định**
  Người dùng thấy gì: Khi một quý đã bị ẩn trên màn OKR, Kara vẫn có thể lấy quý đó làm quý hiện tại và trả lời theo một quý khác với quý người dùng đang thấy.
  file: `apps/agent-okr/agent/lib/hoi-doc.ts`
  severity: medium
  Đề xuất: known-limits

- **Cửa hỏi đếm lượt rồi mới chuyển tiếp, nhưng không hoàn lượt và không có hạn chờ như cửa soạn**
  Người dùng thấy gì: Khi trợ lý bị lỗi hoặc chậm, câu hỏi thất bại vẫn bị trừ vào 40 câu mỗi ngày, và mở hai tab cùng lúc có thể bị trừ hai lần và gặp lỗi ở lần gửi sau.
  file: `apps/app/lib/cua-okr-hoi.ts`
  severity: medium
  Đề xuất: known-limits

- **okr.hoi-dap nằm trong nhóm «tro-ly-okr» trên màn chi phí nhưng không nằm trong TINH_NANG_TRO_LY_OKR**
  Người dùng thấy gì: Màn chi phí có thể hiện hai con số chi khác nhau dưới cùng nhãn «Trợ lý OKR», một con số có tính tiền hỏi đáp và một con số không.
  file: `packages/db/src/ai-chi-phi-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

- **HoiService ném mã lỗi viết thẳng và dùng hai loại ngoại lệ cho cùng một điều kiện**
  Người dùng thấy gì: Người dùng không thấy khác biệt rõ rệt; chỉ có một số lỗi quyền truy cập hiện kèm mã, số khác hiện kèm câu tiếng Việt.
  file: `apps/api/src/okr/hoi.service.ts`
  severity: low
  Đề xuất: wont-fix

- **locTim chép tay danh sách tình trạng thay vì dùng TINH_TRANG có sẵn**
  Người dùng thấy gì: Hiện chưa ảnh hưởng người dùng; nếu sau này thêm một tình trạng OKR mới thì bộ lọc của Kara có thể không nhận ra nó.
  file: `apps/agent-okr/agent/lib/hoi-doc.ts`
  severity: low
  Đề xuất: wont-fix

- **Cửa hỏi đếm lượt trước khi chuyển tiếp nhưng không bao giờ hoàn lượt khi agent-okr hỏng**
  Người dùng thấy gì: Khi Kara chập chờn, mỗi lần bấm «Thử lại» mất một trong 40 câu mỗi ngày dù không nhận được câu trả lời, đến mức có thể bị khoá ô gõ sớm.
  file: `apps/app/lib/cua-okr-hoi.ts`
  severity: medium
  Đề xuất: known-limits

- **Cột hỏi không xử lý phiên eve đã kết thúc: ô gõ vẫn mở, câu gửi đi chắc chắn hỏng và vẫn bị trừ lượt**
  Người dùng thấy gì: Mở lại một cuộc hỏi cũ sau hơn 30 phút thì ô gõ vẫn mở nhưng câu gửi đi không bao giờ được trả lời, và mỗi lần thử lại vẫn bị trừ một câu.
  file: `apps/app/app/(app)/[slug]/okr/hoi/cot-hoi-kara.tsx`
  severity: medium
  Đề xuất: known-limits

- **Phiên okr-hoi thừa trần 60.000 token đầu vào mỗi phiên của Soạn, nhưng cột hỏi không hiển thị lời xin duyệt thêm ngân sách**
  Người dùng thấy gì: Trong một cuộc hỏi dài nhiều câu, Kara có thể dừng lại chờ một lời xin duyệt mà người dùng không thấy, rồi chỉ hiện «Kara chưa trả lời được» và cuộc hỏi kẹt.
  file: `apps/agent-okr/agent/lib/config.ts`
  severity: medium
  Đề xuất: known-limits

- **Lưu phản hồi hữu ích hỏng thì im lặng, giao diện vẫn báo đã ghi nhận**
  Người dùng thấy gì: Nếu việc lưu đánh giá câu trả lời bị lỗi, người dùng vẫn thấy lời cảm ơn như đã ghi nhận, nhưng đội không nhận được phản hồi đó.
  file: `apps/app/app/(app)/[slug]/okr/hoi/cot-hoi-kara.tsx`
  severity: low
  Đề xuất: known-limits

- **Hai lần mở phiên đua nhau: ghiPhienEve âm thầm đẩy phiên thua vào cacPhien và trả thành công**
  Người dùng thấy gì: Gửi câu đầu tiên từ hai tab cùng lúc có thể khiến một tab bị trừ lượt oan và báo lỗi ở các câu sau.
  file: `packages/db/src/okr-cuoc-hoi.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 4/21 lỗi rơi vào file không bộ đo nào phủ (apps/app/lib/cua-okr-hoi.ts, packages/db/src/okr-cuoc-hoi.ts, _acceptance/hoi-dap-okr/rang/do-hoi-dap.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
