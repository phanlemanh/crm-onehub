# Review findings: chep-viec-can-lam-cu (round 1)

## Trong hợp đồng

- **Hình dạng 1 (đo thứ khác thay vì đầu ra): E4 viết lại bộ lọc bằng truy vấn Prisma tự soạn, không gọi activities.timeline**
  file: `packages/db/test/viec-chep.spec.ts:593`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Eval E4 hứa: "activities.timeline (caller tRPC thật, phiên thành viên) của thoả thuận có lại hai việc cần làm, không thì ném cvc: dao xong viec cu khong hien lai". Spec dòng 593-596 không gọi bên đọc thật. Nó chạy `db.activity.findMany({ where: { id: { in: [a, b] }, type: "TASK", viecChep: { is: null } } })` rồi assert `hien.length === 2`. Truy vấn này chép tay bộ lọc CHUA_CHEP; bộ lọc thật nằm ở activities.service.ts (`NOT: { type: TASK, viecChep: { isNot: null } }` ghép AND với anchor và filterClause). Vì vậy assert chỉ nói lại rằng hàng Viec đã bị xoá, một điều mà assert 'cvc: dao khong xoa ban chua doi' ở trên đã kiểm. Đầu ra của dòng thời gian sau khi đảo không được đo: nếu activities.timeline lọc sai (anchor, CHUA_CHEP), hay ẩn bản gốc vì lý do khác, phép đo vẫn xanh. E13 cũng không có cặp đột biến nào cho vế 'đảo xong thì hiện lại'.
  rationale: AC-4 đòi bản gốc hiện lại trên dòng thời gian sau đảo, nhưng phép đo không gọi bên đọc thật nên AC chưa được chứng minh.

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ bắt một điểm-case): quet-task chỉ tìm lời ghi đứng TRƯỚC dòng TASK, và đột biến (k) cấy đúng dạng đó**
  file: `_acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs:63`
  severity: low
  AC: AC-6
  source: measurement
  detail: E14 tuyên: "Một chỗ ghi ... ở bất kỳ tệp nào thì ném cvc: con duong ghi TASK". Dòng 63-66 chỉ xét `nguon.slice(Math.max(0, soDong - 1 - CUA_SO), soDong)`, tức 12 dòng phía trên và chính dòng có TASK. Lời ghi dựng dữ liệu trước rồi gọi sau thì lọt: `const data = { type: ActivityType.TASK, ... }; await tx.activity.create({ data })`, hay `rows.push({ type: ActivityType.TASK })` rồi `createMany({ data: rows })` (đúng khuôn seed.ts vừa bị xoá). Với tệp đã nằm trong MA_TRAN (ma-lech.ts, run-runtime.ts, viec-ghi.ts, viec-chep.ts…), vế 'ngoai ma tran' cũng không đỡ được, vì tệp đó vốn đã nhắc TASK. Chiều đỏ duy nhất là E13 (k), và (k) cấy đúng dạng mà bộ quét bắt được (`tx.activity.create({ data: { type: ActivityType.TASK ...`, TASK nằm sau lời gọi). Không có ca nào cho các dạng còn lại của lớp 'đường ghi TASK'.
  rationale: AC-6 đòi quét mã không còn chỗ nào ghi activity loại TASK, nhưng bộ quét bỏ sót các dạng ghi dựng dữ liệu trước rồi gọi sau.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Reuse Existing Code: chepViecCanLam chép lại thân ghi của taoViec**
  Người dùng thấy gì: Hôm nay người dùng không thấy gì sai. Về sau, nếu cách ghi một Việc đổi, Việc được chép từ việc cũ có thể ghi khác Việc tạo tay và hai loại sẽ lệch nhau.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **Codebase Consistency: điều kiện «TASK đã chép» bị viết ở bốn chỗ, và tên CHUA_CHEP mang hai nghĩa**
  Người dùng thấy gì: Hiện tại màn hình hiện đúng. Quy tắc ẩn việc cũ đã chép nằm ở nhiều nơi, nên sau này sửa một chỗ mà quên chỗ khác thì việc có thể hiện hai lần hoặc biến mất.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Parse at the boundary: viết tay kiểu ViecCanLamMeta cạnh schema, schema meta liên gói đặt sai chỗ**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là cách tổ chức mã chưa theo đúng quy ước của kho.
  file: `packages/db/src/viec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Slop / Diff churn: còn import dauNgayVN không dùng**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là một dòng thừa trong mã.
  file: `apps/api/src/activities/activities.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Constants: thêm PHUT_MS cục bộ, và danh sách vai quản trị bị nới kiểu**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là hằng số khai chưa theo thói quen chung của kho.
  file: `packages/db/src/viec.ts`
  severity: low
  Đề xuất: wont-fix

- **Type slop: các kiểu xuất ra mà chỉ dùng trong một tệp**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là vài kiểu dữ liệu được mở ra ngoài mà không ai dùng.
  file: `packages/db/src/viec-chep.ts`
  severity: low
  Đề xuất: wont-fix

- **Composition: chepTatCa lặp vòng chép hai lần cho chạy thử và chạy thật**
  Người dùng thấy gì: Hiện chạy thử và chạy thật đều đúng. Hai nhánh viết riêng nên về sau sửa một nhánh mà quên nhánh kia thì kết quả chạy thử có thể không còn phản ánh chạy thật.
  file: `packages/db/src/viec-chep.ts`
  severity: low
  Đề xuất: known-limits

- **Naming: tên createRunActivity che mất việc ghi một Việc**
  Người dùng thấy gì: Người dùng không thấy gì khác. Tên hàm gây hiểu nhầm cho người đọc mã sau này.
  file: `apps/agent/agent/lib/run-runtime.ts`
  severity: low
  Đề xuất: wont-fix

- **Reuse Existing Code: goiCuaBanSao là bản chép thứ ba**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm. Chỉ là một đoạn mã của bộ kiểm tra bị chép ở ba nơi.
  file: `_acceptance/chep-viec-can-lam-cu/rang/dot-bien.mjs`
  severity: low
  Đề xuất: wont-fix

- **Compatibility cruft: nới răng của vòng khác bằng danh sách cho phép theo chuỗi con**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Một bộ kiểm của vòng khác bị nới nên có thể bỏ sót việc ai đó xoá nhầm các bước kiểm về sau.
  file: `_acceptance/dieu-phoi-va/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **Codebase Consistency: dòng việc cũ ở Tổng quan tự dựng ô biểu tượng, lệch với dòng anh em**
  Người dùng thấy gì: Trên Tổng quan, dòng việc cũ quá hạn trông hơi khác dòng Việc, và người dùng đọc màn hình có thể nghe nhãn «Đã xong» sai ở ô đầu dòng.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: known-limits

- **Việc do mã môi giới lệch giao ra hiện hạn sớm một ngày: hanNgay lưu là dauNgayVN(now), không theo lối nửa đêm UTC**
  Người dùng thấy gì: Việc tự giao cho người cầm trịch khi gặp mã môi giới lạ sẽ hiện hạn là hôm qua, trong khi việc chưa bị đánh dấu quá hạn. Người dùng thấy ngày hạn sai một ngày ở Việc của tôi, Tổng quan và tin nhắc.
  file: `apps/agent/agent/lib/ma-lech.ts`
  severity: high
  Đề xuất: new-contract

- **Lệnh chép chuyển nguyên dueAt sang hanNgay, nên việc cần làm cũ do ma-lech tạo bị lùi hạn một ngày**
  Người dùng thấy gì: Các việc cũ do hệ thống giao trước đây, khi được chép lên production, sẽ hiện hạn sớm hơn thật một ngày ở Việc của tôi, Tổng quan, tin nhắc và lịch sử. Người dùng có thể tưởng việc đã quá hạn.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: new-contract

- **viec:chep-cu --chay báo thành công (mã thoát 0) dù có hàng chép hỏng**
  Người dùng thấy gì: Khi chép việc cũ lên production mà có vài việc chép hỏng, lệnh vẫn báo thành công. Người chạy phải tự đọc danh sách lỗi mới biết còn việc chưa chép.
  file: `packages/db/scripts/chep-viec-can-lam.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): kiểm 'không còn khối ghim' bằng một selector chưa bao giờ có trong mã**
  Người dùng thấy gì: Phép kiểm màn hình khẳng định không còn khối việc ghim nhưng không thể đỏ, nên nếu khối ấy quay lại thì kiểm này không báo. Người dùng có thể lại thấy việc cũ ghim đầu thẻ mà không ai hay.
  file: `apps/app/test/dong-thoi-gian-viec-cu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
