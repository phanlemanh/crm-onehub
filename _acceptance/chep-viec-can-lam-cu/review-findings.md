# Review findings: chep-viec-can-lam-cu (round 2)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Reuse Existing Code: hanTheoNgayVN tự dựng lại ngayVN của onboarding-nhac**
  Người dùng thấy gì: Hai chỗ trong hệ thống cùng tính ngày theo giờ Việt Nam bằng hai đoạn mã giống nhau. Người dùng vẫn thấy hạn việc đúng ngày; chỉ là sau này sửa một chỗ phải nhớ sửa chỗ kia.
  file: `packages/db/src/viec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Codebase Consistency: điều kiện «TASK đã chép» viết ở bốn chỗ, và CHUA_CHEP mang hai nghĩa**
  Người dùng thấy gì: Luật «không hiện việc cũ đã chép» đang được viết ở nhiều chỗ nên sau này đổi luật dễ sót một màn. Hiện tại các màn đều hiện đúng.
  file: `apps/api/src/activities/activities.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Slop / Diff churn: import dauNgayVN không còn dùng ở activities.service**
  Người dùng thấy gì: Còn sót một dòng khai báo thừa trong mã. Người dùng không thấy khác biệt nào.
  file: `apps/api/src/activities/activities.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Type slop: kiểu xuất ra chỉ để mở một chỗ nối test, kiểu tay chép lại kiểu đã có**
  Người dùng thấy gì: Một số khai báo kiểu dữ liệu trong mã chép việc cũ để lộ nhiều hơn cần thiết. Người dùng không bị ảnh hưởng.
  file: `packages/db/src/viec-chep.ts`
  severity: low
  Đề xuất: wont-fix

- **Parse at the boundary: kiểu ViecCanLamMeta viết tay cạnh schema Zod**
  Người dùng thấy gì: Một khai báo kiểu dữ liệu được viết tay bên cạnh khuôn kiểm tra nên hai thứ có thể lệch nhau về sau. Hiện chưa gây sai kết quả nào cho người dùng.
  file: `packages/db/src/viec.ts`
  severity: low
  Đề xuất: known-limits

- **Constants: PHUT_MS cục bộ, và danh sách vai quản trị thứ ba bị nới kiểu**
  Người dùng thấy gì: Một hằng số và danh sách vai quản trị được khai theo cách khác với phần còn lại của mã. Quyền quản trị vẫn hoạt động đúng.
  file: `packages/db/src/viec.ts`
  severity: low
  Đề xuất: wont-fix

- **Naming / Composition: createRunActivity giờ tạo Việc, và một hàm gánh hai đường ghi**
  Người dùng thấy gì: Hàm Tác nhân dùng để ghi việc có tên chưa nói hết nó làm gì, gây khó đọc cho người bảo trì. Việc Tác nhân giao vẫn ra đúng.
  file: `apps/agent/agent/lib/run-runtime.ts`
  severity: low
  Đề xuất: wont-fix

- **Compatibility cruft: ma-lech vẫn chống trùng theo activity TASK cũ chưa chép**
  Người dùng thấy gì: Phần chống giao trùng với việc cũ chưa chép sẽ thành thừa sau khi chép việc cũ lên hệ thống thật. Lúc này nó đang giúp không giao trùng việc cho người cầm trịch.
  file: `apps/agent/agent/lib/ma-lech.ts`
  severity: low
  Đề xuất: known-limits

- **Codebase Consistency: dòng việc cũ ở Tổng quan tự dựng ô biểu tượng, lệch với dòng anh em và nhãn cột**
  Người dùng thấy gì: Ở khối Việc quá hạn trên Tổng quan, người dùng đọc màn hình có thể nghe nhãn cột «Đã xong» cho một ô chỉ là biểu tượng việc cũ. Người dùng nhìn thấy màn thì không thấy gì lạ.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: known-limits

- **Codebase Consistency: lệnh viec:chep-cu khai hai lần, gốc gọi thẳng tệp thay vì qua gói**
  Người dùng thấy gì: Lệnh chép việc cũ được khai ở hai nơi, khác cách các lệnh cơ sở dữ liệu khác. Lệnh vẫn chạy đúng.
  file: `package.json`
  severity: low
  Đề xuất: wont-fix

- **Reuse Existing Code: test chép lại các helper đã có trong test/support/viec-can-lam-cu**
  Người dùng thấy gì: Một số bài kiểm tra tự viết lại đồ phụ trợ đã có sẵn. Người dùng không bị ảnh hưởng.
  file: `apps/api/test/viec-can-lam-cu.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Diff churn: ảnh bằng chứng trùng byte lưu dưới hai tên**
  Người dùng thấy gì: Hồ sơ nghiệm thu lưu mỗi ảnh chụp màn hai lần dưới hai tên, nặng thêm khoảng 340KB. Không ảnh hưởng người dùng.
  file: `_acceptance/chep-viec-can-lam-cu/evidence/E11-step1.png`
  severity: low
  Đề xuất: wont-fix

- **E7 và E8 thiếu packages/db/src/viec.ts trong paths, dù hai bộ đo phụ thuộc hanTheoNgayVN và VIEC.khoaMaLech sống ở tệp đó**
  Người dùng thấy gì: Nếu sau này ai đổi cách tính hạn việc hay khoá giao việc, bằng chứng đã ký cho việc Tác nhân giao và việc ma-lech giao có thể không bị báo cũ và không được chạy lại. Hôm nay hai chỗ này vẫn đúng.
  file: `_acceptance/chep-viec-can-lam-cu/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Reuse Existing Code: chepViecCanLam chép lại thân ghi của taoViec (r1 · tệp đã đổi)**
  Người dùng thấy gì: Hôm nay người dùng không thấy gì sai. Về sau, nếu cách ghi một Việc đổi, Việc được chép từ việc cũ có thể ghi khác Việc tạo tay và hai loại sẽ lệch nhau.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **Codebase Consistency: điều kiện «TASK đã chép» bị viết ở bốn chỗ, và tên CHUA_CHEP mang hai nghĩa (r1)**
  Người dùng thấy gì: Hiện tại màn hình hiện đúng. Quy tắc ẩn việc cũ đã chép nằm ở nhiều nơi, nên sau này sửa một chỗ mà quên chỗ khác thì việc có thể hiện hai lần hoặc biến mất.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Parse at the boundary: viết tay kiểu ViecCanLamMeta cạnh schema, schema meta liên gói đặt sai chỗ (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là cách tổ chức mã chưa theo đúng quy ước của kho.
  file: `packages/db/src/viec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Slop / Diff churn: còn import dauNgayVN không dùng (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là một dòng thừa trong mã.
  file: `apps/api/src/activities/activities.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Constants: thêm PHUT_MS cục bộ, và danh sách vai quản trị bị nới kiểu (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là hằng số khai chưa theo thói quen chung của kho.
  file: `packages/db/src/viec.ts`
  severity: low
  Đề xuất: wont-fix

- **Type slop: các kiểu xuất ra mà chỉ dùng trong một tệp (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là vài kiểu dữ liệu được mở ra ngoài mà không ai dùng.
  file: `packages/db/src/viec-chep.ts`
  severity: low
  Đề xuất: wont-fix

- **Composition: chepTatCa lặp vòng chép hai lần cho chạy thử và chạy thật (r1)**
  Người dùng thấy gì: Hiện chạy thử và chạy thật đều đúng. Hai nhánh viết riêng nên về sau sửa một nhánh mà quên nhánh kia thì kết quả chạy thử có thể không còn phản ánh chạy thật.
  file: `packages/db/src/viec-chep.ts`
  severity: low
  Đề xuất: known-limits

- **Naming: tên createRunActivity che mất việc ghi một Việc (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không thấy gì khác. Tên hàm gây hiểu nhầm cho người đọc mã sau này.
  file: `apps/agent/agent/lib/run-runtime.ts`
  severity: low
  Đề xuất: wont-fix

- **Reuse Existing Code: goiCuaBanSao là bản chép thứ ba (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm. Chỉ là một đoạn mã của bộ kiểm tra bị chép ở ba nơi.
  file: `_acceptance/chep-viec-can-lam-cu/rang/dot-bien.mjs`
  severity: low
  Đề xuất: wont-fix

- **Compatibility cruft: nới răng của vòng khác bằng danh sách cho phép theo chuỗi con (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Một bộ kiểm của vòng khác bị nới nên có thể bỏ sót việc ai đó xoá nhầm các bước kiểm về sau.
  file: `_acceptance/dieu-phoi-va/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **Codebase Consistency: dòng việc cũ ở Tổng quan tự dựng ô biểu tượng, lệch với dòng anh em (r1)**
  Người dùng thấy gì: Trên Tổng quan, dòng việc cũ quá hạn trông hơi khác dòng Việc, và người dùng đọc màn hình có thể nghe nhãn «Đã xong» sai ở ô đầu dòng.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: known-limits

- **Việc do mã môi giới lệch giao ra hiện hạn sớm một ngày: hanNgay lưu là dauNgayVN(now), không theo lối nửa đêm UTC (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc tự giao cho người cầm trịch khi gặp mã môi giới lạ sẽ hiện hạn là hôm qua, trong khi việc chưa bị đánh dấu quá hạn. Người dùng thấy ngày hạn sai một ngày ở Việc của tôi, Tổng quan và tin nhắc.
  file: `apps/agent/agent/lib/ma-lech.ts`
  severity: high
  Đề xuất: new-contract

- **Lệnh chép chuyển nguyên dueAt sang hanNgay, nên việc cần làm cũ do ma-lech tạo bị lùi hạn một ngày (r1 · tệp đã đổi)**
  Người dùng thấy gì: Các việc cũ do hệ thống giao trước đây, khi được chép lên production, sẽ hiện hạn sớm hơn thật một ngày ở Việc của tôi, Tổng quan, tin nhắc và lịch sử. Người dùng có thể tưởng việc đã quá hạn.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: new-contract

- **viec:chep-cu --chay báo thành công (mã thoát 0) dù có hàng chép hỏng (r1)**
  Người dùng thấy gì: Khi chép việc cũ lên production mà có vài việc chép hỏng, lệnh vẫn báo thành công. Người chạy phải tự đọc danh sách lỗi mới biết còn việc chưa chép.
  file: `packages/db/scripts/chep-viec-can-lam.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): kiểm 'không còn khối ghim' bằng một selector chưa bao giờ có trong mã (r1)**
  Người dùng thấy gì: Phép kiểm màn hình khẳng định không còn khối việc ghim nhưng không thể đỏ, nên nếu khối ấy quay lại thì kiểm này không báo. Người dùng có thể lại thấy việc cũ ghim đầu thẻ mà không ai hay.
  file: `apps/app/test/dong-thoi-gian-viec-cu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/13 lỗi rơi vào file không bộ đo nào phủ (_acceptance/chep-viec-can-lam-cu/evidence/E11-step1.png, _acceptance/chep-viec-can-lam-cu/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
