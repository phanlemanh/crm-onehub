# Review findings: dieu-phoi-va (round 1)

## Trong hợp đồng

- **Hình dạng 5 (tuyên quét ma trận nhưng thiếu phần tử): E1 khai 10 mục, mục (10) «không mở phiên nghiên cứu / không gọi mô hình» không có assert nào**
  file: `apps/agent/test/dieu-phoi-va.spec.ts:159`
  severity: medium
  AC: AC-1
  source: measurement
  detail: evals.yaml E1 khai ma trận 10 mục, trong đó mục (10) là «khong session nghien cuu nao duoc mo cho hang do». AC-1 hứa thêm «không gọi mô hình nào». Test describe "ma-lech" (dòng 159–218) chỉ assert các mục (1)–(9): TASK_KINDS/DIRECT_KINDS, claimDue, Activity, createdById, companyId, dueAt, subject, meta, finishedAt/outcome. Không có dòng nào kiểm việc chưa mở session hay chưa gọi model: grep "session" trong tệp chỉ trả tên describe mach-lien. Như vậy số assert không bằng số phần tử ma trận đã khai. Một handler vừa ghi Activity vừa mở session nghiên cứu hay gọi model vẫn qua E1.
  rationale: AC-1 nêu rõ «không gọi mô hình nào» nhưng bài kiểm không khẳng định điều đó, nên lời hứa này chưa được chứng minh.

- **Hình dạng 3 (assert «chuỗi có mặt» thay cho quan hệ): thẻ quá hạn chỉ kiểm chuỗi con «4» hay «40» ở đâu đó trong cả thẻ**
  file: `apps/app/test/dieu-phoi-va.dom.tsx:594`
  severity: medium
  AC: AC-7
  source: measurement
  detail: AC-7 và AC-8 hứa một quan hệ: số trong mô tả thẻ = quaHan.viec + quaHan.buoc. Test lại kiểm `the.textContent.includes("40")` (dòng 565) và `chu.includes("4")` (dòng 594) trên toàn bộ textContent của Card: tiêu đề, mô tả, mọi dòng việc và bước, nhãn ngày, chân thẻ. Không neo vào CardDescription, cũng không neo vào khuôn `m.tasks.pastDue(...)`. Mô tả ghi «14», «41», «24» hay «400» vẫn qua; ở ca AC-8, chữ «4» xuất hiện ở bất kỳ chỗ nào trong thẻ cũng qua. man.mjs dòng 378 lặp lại đúng hình dạng này: `the.chu.includes(String(tong))` trên innerText của cả thẻ, trong thẻ có 20 dòng nhãn mang chuỗi MA dạng base36 và chỉ số.
  rationale: AC-7 hứa thẻ ghi đúng «40 quá hạn» và N đúng; bài kiểm chỉ tìm chuỗi con trong cả thẻ nên không chứng minh được con số đó.

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc, không round-trip): payload dashboard.summary của DOM test không phải giá trị mà schema writer sinh ra được**
  file: `apps/app/test/dieu-phoi-va.dom.tsx:490`
  severity: medium
  AC: AC-7
  source: measurement
  detail: evals.yaml E7b nói render DashboardSummary «voi du lieu tu cung khuon dashboard.summary». Nhưng `tongQuan()` ở dòng 483–536 dựng payload bằng tay và không parse qua `dashboardSummaryOutput`. Mỗi phần tử overdueTasks (dòng 490–496) thiếu trường bắt buộc `createdBy`, mà schema yêu cầu `createdBy: linkedRecordOutput` (apps/api/src/dashboard/dashboard.contracts.ts dòng 73). Fixture chỉ sống được vì test luôn render scope "me", nhánh duy nhất không đọc `createdBy`. Đây là dữ liệu không thể tồn tại, khớp khuôn bên đọc chứ không rút từ writer. Một thay đổi shape ở writer (thêm hay đổi tên trường của quaHan hay overdueTasks) không làm test đỏ.
  rationale: AC-7 là tiêu chí xuyên tầng về dữ liệu dashboard.summary; bài kiểm dùng dữ liệu không thể tồn tại nên không chứng minh được hợp đồng giữa API và thẻ.

- **Hình dạng 4 (assertion âm tính đứng một mình): ca không quá hạn chỉ kiểm vắng «nữa», không ghim chữ rỗng của thẻ**
  file: `apps/app/test/dieu-phoi-va.dom.tsx:607`
  severity: medium
  AC: AC-8
  source: measurement
  detail: evals.yaml E8 mục (2) hứa «ca hai ghi chu rong cua the». Test ở dòng 598–608 chỉ có `expect(includes("nữa")).toBe(false)`, không có đối chứng dương (`m.tasks.empty` hay `m.tasks.allDone`) và không ghim thông điệp. Thẻ render rỗng, render sai chữ hay ghi sai tổng vẫn qua. man.mjs dòng 334–339 (ST-tong-quan-du) có cùng hình dạng: trên kho đo mới, tongDu thường bằng 0, khi đó vế `tongDu === 0 ||` bỏ qua kiểm tổng và phán quyết rút về đúng một điều kiện `coDongDu === false`.
  rationale: AC-8 đòi thẻ «ghi đúng tổng» và không có dòng «và … nữa»; bài kiểm chỉ kiểm vế phủ định, vế ghi đúng tổng không được chứng minh.

- **Hình dạng 6 (đo bản khác cây đang kiểm): khong-xoa-expect đọc tệp test từ commit HEAD, không đọc từ cây làm việc**
  file: `_acceptance/dieu-phoi-va/rang/khong-xoa-expect.mjs:107`
  severity: low
  AC: AC-9
  source: measurement
  detail: Script so expect của mốc với `git show HEAD:${tep}` (dòng 107), tức bản đã commit. Trong dpv_hoi_quy, các bước sau đó lại chạy `bun test` trên cây làm việc. Nếu một expect bị xoá hay sửa mà chưa commit, bước kiểm vẫn báo «khong expect san co nao bi xoa hay sua» trong khi test thực sự chạy là bản đã mất expect. Vậy thứ được đo không phải cây đang được kiểm.
  rationale: AC-9 đòi không khẳng định nào bị xoá hay sửa; phép kiểm đọc bản đã commit nên không chứng minh được cho cây thực sự chạy test.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The platform-code field key now exists in two places, and the API and agent each read their own copy**
  Người dùng thấy gì: Hôm nay mã đối tác lệch vẫn thành việc cho người cầm trịch đúng như hứa. Nếu sau này ai đổi tên trường mã đối tác ở một nơi mà quên nơi kia, mọi mã, kể cả mã đã khớp, sẽ đều thành việc giao cho người cầm trịch.
  file: `packages/validation/src/onboarding-identify.ts`
  severity: medium
  Đề xuất: known-limits

- **The screen probe man.mjs writes to the database without checking that it is a disposable measurement database**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Chỉ khi người làm chạy phép đo màn bằng tay, bỏ qua đường chạy chuẩn, thì công ty, kế hoạch và phòng ban thử có thể được tạo rồi xoá trên kho dữ liệu dùng chung, và còn sót lại nếu bị ngắt giữa chừng.
  file: `_acceptance/dieu-phoi-va/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **addStep's department check duplicates an existing check and returns a different error for a missing department**
  Người dùng thấy gì: Chọn một bộ phận không tồn tại thì thêm bước và tạo kế hoạch từ mẫu báo hai kiểu lỗi, hai câu chữ khác nhau. Người dùng vẫn nhận được thông báo đọc được ở cả hai nơi.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: wont-fix

- **conSot mixes the server's VN-day overdue count with the browser's local-day count, so it shows an extra-overdue line for steps that are already on screen**
  Người dùng thấy gì: Người mở Tổng quan từ trình duyệt đặt múi giờ khác Việt Nam, trong vài giờ quanh nửa đêm, có thể thấy dòng «và N việc quá hạn nữa» cho những việc thực ra đã hiện trong danh sách, hoặc thấy thiếu một việc. Người dùng ở Việt Nam không gặp.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: known-limits

- **If the department list query fails, the add-step form shows an empty department picker and no error**
  Người dùng thấy gì: Nếu danh sách bộ phận không tải được, form thêm bước hiện ô chọn trống và nút Lưu không bấm được mà không nói lý do; với kế hoạch đã có bước thì nút thêm ở bộ phận khác biến mất như thể không còn bộ phận nào. Người dùng phải tải lại trang mới thử được.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu phần tử): E2 hứa «mỗi hàng AgentTask đều đóng» nhưng chỉ kiểm hàng thứ hai**
  Người dùng thấy gì: Trong ca gửi lại cùng mã, bài kiểm chỉ xác nhận một trong bốn lượt xử lý được đóng sạch. Nếu một nhánh quên đóng việc thì có thể sót mà không ai thấy ngay.
  file: `apps/agent/test/dieu-phoi-va.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không có đối chứng độc lập): claimDue(1) khiến assert âm bị assert dương kéo theo, thông điệp ghim của CHIỀU ĐỎ không bao giờ hiện**
  Người dùng thấy gì: Nếu một ngày việc mã lệch bị cho vào nhầm làn nghiên cứu, bài kiểm vẫn báo đỏ nhưng nói nguyên nhân sai, nên người sửa mất thời gian hơn để tìm ra.
  file: `apps/agent/test/dieu-phoi-va.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 3 (kiểm thuộc tính thay cho quan hệ): mạch liền chỉ kiểm hai mã khác nhau, không kiểm bằng mã API đã ghi**
  Người dùng thấy gì: Bài kiểm chuỗi từ lúc nhận lô tới lúc có việc chỉ xác nhận có hai mã khác nhau, chưa so với đúng mã đã nhận. Một lỗi làm việc mang nhầm mã nhưng vẫn khác nhau sẽ không bị bắt ở bài này.
  file: `apps/agent/test/dieu-phoi-va.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
