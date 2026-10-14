# Review findings: tac-nhan-va (vòng 1)

## Trong hợp đồng

- **Thước AC-10 so dòng expect theo tập hợp, nên không bắt được khi xoá một dòng expect trùng**
  AC: AC-10
  file: `_acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs:31`
  severity: medium
  detail: lech() dựng `new Set(sau.split("\n")...)` rồi chỉ kiểm từng dòng `expect(` của mốc có còn trong tập đó hay không. Dòng expect nào xuất hiện hai lần trở lên ở mốc thì xoá bớt một bản vẫn qua, vì bản còn lại giữ nó trong Set. Ở mốc 966eeb78e, chính các tệp trong VUNG có dòng expect trùng: builder-runtime 3, stale-tasks 5, agent-results 4, agent-transcript 4, cau-hoi-het-han-muc 1, agent-builder 1, het-han-muc 1 (đếm bằng `grep expect( | sort | uniq -d`). Thước in «0 loi» và thoát 0 trong khi AC-10 hứa «không khẳng định expect( nào bị xoá». Phép tự thử --tu-thu chỉ dùng mẫu có hai dòng expect khác nhau, nên không lộ lỗ này. Nên so theo số lần xuất hiện của từng dòng (multiset).
  source: bugs

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): E2 chu-luot, chữ trạng thái lượt và bước đến từ ô lọc `<select>`, không đến từ dòng được đo**
  AC: AC-2
  file: `apps/app/test/tac-nhan-va.dom.tsx:255`
  severity: high
  detail: Biến `chu = o.textContent` lấy chữ của cả AgentRuns, gồm cả `<select aria-label={t.luot.locGiaLoc}>`. Sáu `<option>` của ô lọc (agent-history.tsx, khoảng dòng 104-111) mang đúng chữ của bảng: thanhCong «Xong» = trangThai.SUCCEEDED, hong «Hỏng» = FAILED, dangChay «Đang chạy» = RUNNING, dangXep «Đang xếp» = QUEUED, choDuyet «Chờ duyệt» = WAITING_FOR_APPROVAL, daDung «Đã dừng» = CANCELLED. Vì vậy vòng `for (const status of trangThaiLuot) expect(chu).toContain(t.trangThai[status])` (dòng 255) và vòng AgentActionStatus (dòng 263) với RUNNING, SUCCEEDED, FAILED, CANCELLED đều đạt nhờ riêng ô lọc. Kể cả khi dòng lượt hay dòng việc in `t.trangThaiKhac` («Không rõ») hay để trống, hai vòng này vẫn đạt. Theo E2(a), lời hứa là quan hệ «chữ hiện của mỗi giá trị === chữ của bảng cho giá trị đó». Phép đo thì chỉ kiểm chuỗi có mặt ở đâu đó trong ngăn. Trong cả ma trận, chỉ PLANNED («Chờ chạy») thật sự được phân biệt.
  source: measurement

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): E3 chu-thoa-thuan, ca open đạt nhờ dòng tổng tiền, không nhờ aria-label**
  AC: AC-3
  file: `apps/app/test/tac-nhan-va.dom.tsx:335`
  severity: medium
  detail: Theo AC-3 và E3, chính `aria-label` của section phải mang chữ trạng thái. Phép đo lại ghép `aria-label + ' ' + textContent` rồi gọi `toContain(k.thoaThuan.trangThai[status])`. Với status "open", deal-list-result.tsx (pipelineTotal) in `t.thoaThuan.duongOng(tien)` = «<tiền> đang mở» vào thân bảng, vì fixture có cả hai thoả thuận cùng VND. Như vậy «đang mở» luôn có trong `chu`, dù `tableTitle` có bỏ chữ trạng thái khỏi aria-label đi nữa. Ca open trong ma trận viết trước không phân biệt được đúng hay sai. Cần đọc riêng `getAttribute("aria-label")` cho khẳng định dương, như ca "all" đã đọc `nhan` riêng.
  source: measurement

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): E4 man.mjs đo số tiền bằng «có một chữ số», bỏ hẳn giai đoạn**
  AC: AC-4
  file: `_acceptance/tac-nhan-va/rang/man.mjs:327`
  severity: high
  detail: AC-4 và các bước của E4 hứa rằng ở 375, mỗi mục [data-thoa-thuan] đọc được tên, công ty, giai đoạn và số tiền, và từng mục nằm trong khung nhìn khi cuộn tới. `duMuc` chỉ kiểm `chu.includes(d.name) && chu.includes(d.company.name) && /\d/.test(chu)`. Thứ nhất, `/\d/` đạt với bất kỳ chữ số nào trong innerText của mục, kể cả chữ số trong tên thoả thuận hay tên công ty của bộ seed. Nó không so với số tiền đã định dạng của chính deal `d` (`formatMoney(d.amount, d.currency)`), nên mục mất ô Amount hay hiện EmptyCellValue vẫn có thể đạt. Thứ hai, giai đoạn (`d.stage`) không được khẳng định gì. Thứ ba, không có phép kiểm từng mục nằm trong khung nhìn sau scrollIntoView: `getClientRects().length > 0` chỉ cho biết mục đang được hiển thị.
  source: measurement

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E2(d) quét tên máy viết hoa bị thu về danh sách giá trị enum**
  AC: AC-2
  file: `apps/app/test/tac-nhan-va.dom.tsx:284`
  severity: medium
  detail: E2(d) trong evals.yaml và AC-2 («không chữ nào là tên máy, chuỗi viết hoa có gạch dưới») khai một phép quét cả lớp: toàn bộ textContent không được khớp `/\b[A-Z]{2,}(_[A-Z]+)*\b/`, trừ mã lỗi trong translate="no". Bài kiểm thay bằng vòng `for (const giaTri of new Set(giaTriMay)) expect(chu).not.toMatch(new RegExp(`\\b${giaTri}\\b`))` trên đúng 15 giá trị của ba enum. Mọi chuỗi máy viết hoa khác lọt ra ngăn đều không bị bắt, ví dụ errorCode thô, một trạng thái enum mới chưa có trong bảng, hay mã như `PROVIDER_ERROR`. Lớp đã khai rộng hơn ma trận điểm được kiểm.
  source: measurement

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): khong-xoa-expect.mjs dùng Set, nên xoá một dòng expect trùng chữ không bị bắt**
  AC: AC-10
  file: `_acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs:32`
  severity: medium
  detail: Theo E10 và AC-10, không khẳng định `expect(` nào bị xoá so với mốc 966eeb78e. Lời hứa này là quan hệ đếm: mỗi dòng expect ở mốc vẫn còn đủ số lần. Hàm `lech` dựng `con = new Set(sau.split("\n").map(trim))` rồi chỉ lọc `!con.has(d)`. Nếu một tệp có hai dòng giống hệt nhau, chẳng hạn `expect(res.status).toBe(200);` hay `expect(ket.cauHoi).toBe(null);`, thì xoá một dòng vẫn ra 0 lỗi, vì chuỗi đó còn có mặt. `--tu-thu` chỉ thử mẫu có hai dòng expect khác nhau, nên không lộ được lỗ này. Cần so theo bội số (đếm số lần mỗi dòng xuất hiện) thay vì so có mặt.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Spec tích hợp mới ném lỗi lúc nạp khi thiếu TNV_HAI_LUOT_RA, làm đỏ agent#test trong bun run test, CI (ô con-lai) và pre-push**
  Người dùng thấy gì: Bộ kiểm tự động của kho có thể báo đỏ trên máy của mọi người và trên CI dù tính năng không hỏng, vì một bài kiểm mới đòi một tệp chỉ có khi chạy bằng đường riêng của phiên nghiệm thu. Việc đẩy nhánh và gộp có thể bị chặn oan.
  file: `apps/agent/test/tac-nhan-va.integration.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Schema phía client khai errorCode mà hợp đồng hội thoại chia sẻ không trả về; .catch(null) che chỗ lệch hợp đồng**
  Người dùng thấy gì: Ở màn hội thoại được chia sẻ, tin gửi hỏng luôn hiện câu chung «Tin này gửi không được.» chứ không hiện câu theo đúng nguyên nhân. Người xem vẫn biết tin lỗi, chỉ không biết lỗi vì sao.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: low
  Đề xuất: known-limits

- **Hội thoại dựng: nhãn bước của bộ dựng gộp về «Dùng một công cụ» (vi), và mất phần chi tiết của nhãn (en)**
  Người dùng thấy gì: Trong hội thoại dựng tác nhân, các bước như ghi hướng dẫn, ghi bản mô tả hay lưu bản nháp đều hiện cùng một chữ «Dùng một công cụ». Người dùng không còn thấy bộ dựng đang ghi gì hay đã lưu nháp chưa.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bài nộp FAILED mã DELIVERY_EXHAUSTED rơi về câu chung và mất thông tin «đã thử ba lần»**
  Người dùng thấy gì: Khi bộ dựng đã tự thử gửi tin ba lần mà vẫn không được, người dùng chỉ thấy câu chung «Tin này gửi không được.» và không biết hệ thống đã thử lại.
  file: `apps/app/lib/messages/agent-builder-tro-chuyen.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
