## Trong hợp đồng

- **The monthly AI cap check rejects valid 2-decimal amounts because of floating-point rounding (8.2, 1.1, 9.2, 2.3...)**
  file: `packages/validation/src/okr-chuong-trinh.ts:18`
  severity: high
  source: bugs
  AC: AC-10
  detail: tranThangUsd uses `.refine((n) => Math.round(n * 100) === n * 100)`. In IEEE-754, n*100 is often not an integer even for exact 2-decimal amounts: 8.2*100 = 819.9999999999999, 1.1*100 = 110.00000000000001, 0.29*100 = 28.999999999999996. Measured over 0.00-20.00 in 0.01 steps, 271 of 2001 valid values are rejected, including 1.1, 2.2, 2.3, 4.1, 4.4, 4.6, 4.9, 5.1, 8.2, 8.3, 8.7, 8.8, 9.2, 9.3, 9.7, 9.8, 10.2, 16.1... The schema sits in okrProgram, so it breaks three places: (1) the settings card's docTran (the-tro-ly-okr.tsx:83) returns null → admin types «8,2» and sees «trần không hợp lệ» and Lưu stays disabled; (2) docTranUsd has the same fault; (3) the server's setProgramInput = okrProgram.partial() → 400 even when the client is bypassed. Fix: compare with a tolerance (Math.abs(n*100 - Math.round(n*100)) < 1e-9) or parse the string as integer cents.
  rationale: AC-10 hứa quản trị bật và lưu thì Chương trình OKR có thêm phiên bản mang đúng các trường AI đã chọn; lỗi làm tròn số khiến việc lưu thất bại ngay bây giờ với một phần lớn giá trị trần hợp lệ.

- **The /settings/okr page switched to fetchQuery for program: a transient error now crashes the whole page instead of showing the retry card**
  file: `apps/app/app/(app)/[slug]/settings/okr/page.tsx:78`
  severity: low
  source: bugs
  AC: AC-10
  detail: The old code used prefetchQuery (which swallows errors), so FormCauHinh/TheTroLyOkr showed LoiThe with a Thử lại button when okr.program failed. Now `queryClient.fetchQuery(trpc.okr.program.queryOptions())` throws on error to read canManage, so the whole NoiDung (server component) throws and the user gets Next's error page. The program.isError branch in the-tro-ly-okr.tsx and the error state of FormCauHinh can no longer be reached from the first render. Catch the fetchQuery error (default canManage=false and let the client query handle the error) to keep the old behaviour.
  rationale: AC-10 nói rõ mọi khối phải có trạng thái tải, rỗng và lỗi; một lỗi tạm thời hiện làm sập cả trang thay vì hiện trạng thái lỗi của khối, trực tiếp làm sai Then này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 80% / 100% spending-cap alert levels are defined in four places that can drift apart**
  Người dùng thấy gì: Nếu sau này có người đổi mốc báo 80% hoặc 100% ở một chỗ, phần khác của hệ thống có thể không theo kịp, khiến quản trị nhận nhắc nhở ở một mức phần trăm còn màn cài đặt lại hiển thị mức khác.
  file: `packages/db/src/ai-chi-phi-danh-muc.ts`
  severity: medium
  Đề xuất: known-limits

- **The settings card writes its own parser for the monthly cap and ignores the shared parser in validation**
  Người dùng thấy gì: Màn cài đặt tự kiểm tra số tiền trần nhập vào theo cách riêng, tách khỏi cách kiểm chung của hệ thống; nếu sau này quy định về cách nhập số tiền đổi, màn này có thể không cập nhật theo.
  file: `apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx`
  severity: medium
  Đề xuất: known-limits

- **The reconciliation `lyDo` schema accepts any string, but only a few coded values are actually stored, and the client decodes them by string prefix**
  Người dùng thấy gì: Nếu sau này có thêm một lý do đối soát lỗi mới, màn cài đặt có thể lặng lẽ hiển thị nhầm thành «không rõ lý do» mà không ai nhận ra.
  file: `packages/validation/src/ai-chi-phi.ts`
  severity: medium
  Đề xuất: known-limits

- **The cost ledger silently treats an unreadable step event as a step with no usage**
  Người dùng thấy gì: Nếu công cụ AI nền tảng đổi cách báo mức dùng, sổ chi phí AI có thể lặng lẽ ghi 0 đồng cho mọi lượt gọi mà không có cảnh báo nào, khiến trần chi tiêu không bao giờ bị xem là đã chạm dù thực tế đã vượt.
  file: `apps/agent/agent/lib/so-chi-phi.ts`
  severity: medium
  Đề xuất: known-limits

- **Time units are re-derived by hand instead of from one base, and the OKR lease setting is split across two packages**
  Người dùng thấy gì: Các mốc thời gian chờ của Trợ lý OKR nằm rải ở nhiều nơi khác nhau trong hệ thống; ai muốn chỉnh thời gian chờ phải tìm đúng từng chỗ, dễ sửa thiếu.
  file: `apps/agent/agent/lib/okr/config.ts`
  severity: low
  Đề xuất: known-limits

- **New tunable constants sit next to their first use instead of in the area's existing config module**
  Người dùng thấy gì: Vài con số làm tròn tiền và cấu hình OKR được viết lặp ở nhiều chỗ khác nhau; nếu một nơi được sửa mà nơi khác không theo, số tiền hiển thị trên các màn có thể lệch nhau.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: low
  Đề xuất: known-limits

- **The OKR task lease (30 s) is renewed only by a hook on the parent session; the parent's hooks do not fire while the subagent tro_ly_okr runs → the task is closed «hong:het-lease» mid-run and nop_de_xuat refuses**
  Người dùng thấy gì: Có nguy cơ Trợ lý OKR đã làm xong việc góp ý và tốn chi phí AI, nhưng hệ thống lại coi việc đó là hết hạn và huỷ bỏ, khiến đề xuất bị mất mà quản trị không biết vì sao.
  file: `apps/agent/agent/hooks/okr-uy-quyen.ts`
  severity: medium
  Đề xuất: new-contract

- **The «key ready» check sticks: after the model key is added, Trợ lý OKR stays blocked at «chua-co-khoa-mo-hinh» until an admin turns AI off and on again**
  Người dùng thấy gì: Sau khi bộ phận kỹ thuật bổ sung khoá mô hình AI, màn cài đặt vẫn có thể tiếp tục báo «chưa có khoá mô hình» cho tới khi có người vào tắt rồi bật lại Trợ lý OKR, dù khoá đã sẵn sàng.
  file: `packages/db/src/okr-tro-ly.ts`
  severity: medium
  Đề xuất: new-contract

- **ketQuaKiemGanNhat throws on any outcome outside the list (e.g. RETIRED_OUTCOME) → readiness, okr.aiChiTieu and every OKR task all break**
  Người dùng thấy gì: Trong một tình huống rất hiếm, toàn bộ màn Trợ lý OKR và Sổ chi phí AI có thể báo lỗi cho tới khi có người tắt rồi bật lại Trợ lý OKR.
  file: `packages/db/src/okr-tro-ly.ts`
  severity: low
  Đề xuất: wont-fix

- **chayDoiSoat: the catch covers the DB writes after the Gateway call succeeded → a correct «khop/lech» row is overwritten as «khong-doi-soat-duoc: loi-gateway:PrismaClient…»**
  Người dùng thấy gì: Nếu có một sự cố kỹ thuật nhỏ ngay sau khi đối soát tháng đã tính đúng, kết quả đúng có thể bị ghi đè thành «Gateway lỗi», khiến quản trị nhìn thấy báo lỗi đối soát dù tháng đó thực ra khớp.
  file: `apps/agent/agent/lib/ai-doi-soat.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): E8 chấm «đếm 0» ở lượt okr mà không ghim lượt hook đứng một mình. Chính lượt đó đếm 1**
  Người dùng thấy gì: Có một phép đo được dùng để chứng minh việc chặn công cụ trước khi chạy hoạt động đúng, nhưng cách đo hiện tại chưa chắc thật sự chứng minh được điều đó.
  file: `_acceptance/tro-ly-okr-nen/rang/hook-chan-truoc.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 2 (fixture viết tay): E18 «hàng cấu hình cũ sau migration» là object viết tay chép sẵn mặc định mới**
  Người dùng thấy gì: Chưa có bằng chứng độc lập rằng một chương trình OKR cũ, sau khi nâng cấp, thực sự hiện đúng các giá trị mặc định đã hứa.
  file: `packages/validation/test/okr-tro-ly.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 2 (fixture viết tay): cấu hình AI gieo bằng db.create với version âm và createdAt tự đặt, đúng khuôn bộ đọc sắp theo createdAt**
  Người dùng thấy gì: Vài phép đo dựng dữ liệu thử theo cách không đi qua đường ghi thật của hệ thống, nên chưa chắc phản ánh đúng những gì xảy ra khi dùng thật.
  file: `apps/agent/test/support/tro-ly-gieo.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): thân báo cáo Gateway giả mang đúng khuôn `results[].total_cost` của bộ đọc, và không lượt thật nào đi qua bộ đọc này**
  Người dùng thấy gì: Phép đo đối soát tháng dùng một báo cáo giả khớp sẵn với cách đọc của hệ thống; nếu báo cáo thật từ AI Gateway sau này có dạng khác, phép đo này sẽ không phát hiện ra.
  file: `apps/agent/test/ai-doi-soat.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): ô okr.tom-tat của E2 tiêm tay thuộc tính okrViec vào ngữ cảnh phiên con, khác bản ghi thật**
  Người dùng thấy gì: Phép đo cho việc phân loại tóm tắt tuần gán sẵn một thông tin mà hệ thống thật chưa chắc truyền được, nên chưa có bằng chứng chắc chắn việc phân loại này hoạt động đúng trong thực tế.
  file: `apps/agent/test/so-chi-phi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): nửa «06:30 ngày 1 tháng sau KHÔNG tính» của cặp biên E13 không thể đỏ, vì đã bị cắt tại thời điểm hiện tại**
  Người dùng thấy gì: Một phần của phép đo về ranh giới thời gian tháng không thể thật sự phát hiện lỗi vì cách tính đã loại bỏ tình huống đó từ trước, nên nửa phép đo này chưa chứng minh được điều nó hứa.
  file: `apps/api/test/tro-ly-okr-chi-tieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): tập tool của phiên con và phép «không lọt Zeta» trong E9 xanh cả khi rỗng, còn chiều đỏ là tự kiểm trên mảng viết tay**
  Người dùng thấy gì: Phép đo kiểm tra rằng phiên phụ không gọi nhầm dữ liệu ngoài phạm vi vẫn báo đạt cả khi phiên đó không làm gì cả, nên chưa chắc chứng minh được điều đó.
  file: `apps/agent/evals/okr/cach-ly.eval.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp, chỉ soi tầng ngoài): kiểm «ketQuaTroLy không có chuỗi tự do» chỉ nhìn `type` ở tầng đầu, bỏ qua anyOf của trường nullable**
  Người dùng thấy gì: Phép đo kiểm tra kết quả trả về không chứa chữ tự do chỉ nhìn lớp ngoài cùng, nên có thể bỏ sót một trường ẩn bên trong nếu sau này trường đó đổi dạng.
  file: `apps/agent/test/okr-chuyen-tiep.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay): lượt nhận việc (claim) và lượt mở phiên được giả bằng db.agentTask.update, ghi đúng các cột bộ đọc cần**
  Người dùng thấy gì: Vài phép đo về việc nhận và mở một tác vụ tự dựng sẵn dữ liệu thay vì đi qua đường nhận việc thật, nên chưa chắc phản ánh đúng thực tế khi hệ thống nhận việc.
  file: `apps/agent/test/duong-do-tro-ly.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

CARRIED (từ round trước, tệp không đổi nên round này không chấm lại):

- **Assistant status stays on «Checking…» forever when no agent picks up the readiness task (r2)**
  Người dùng thấy gì: Màn Cài đặt có thể hiện «Đang kiểm tra…» mãi mãi thay vì báo đúng lý do (ví dụ chưa nối được tác tử), khiến quản trị không biết chắc Trợ lý OKR có dùng được hay không.
  file: `apps/api/src/okr/okr.service.ts`
  severity: high
  Đề xuất: known-limits

- **E15-network.txt claims more than the script captured (r2)**
  Người dùng thấy gì: Báo cáo bằng chứng nói không có yêu cầu mạng lạ nào trong bước Lưu, nhưng cách đo chỉ nhìn đúng một loại yêu cầu nên không thể phát hiện nếu thật ra có vấn đề.
  file: `_acceptance/tro-ly-okr-nen/evidence/E15-network.txt`
  severity: medium
  Đề xuất: known-limits

- **Member-page check swallows the load timeout and passed on a page that had not finished loading (r2)**
  Người dùng thấy gì: Bằng chứng «thành viên thường không thấy các khối chỉ-quản-trị» có thể đã tính là đạt dù trang thực ra bị lỗi hoặc chưa tải xong, nên chưa chắc đã kiểm đúng điều cần kiểm.
  file: `_acceptance/tro-ly-okr-nen/rang/man-cai-dat.mjs`
  severity: medium
  Đề xuất: known-limits

- **E25 no longer refreshes the fixture E2 reads, but evals.yaml still says it does (r2)**
  Người dùng thấy gì: Tệp dữ liệu mẫu dùng để kiểm chi phí AI có thể dần lệch với dữ liệu thật mà không ai nhận ra, vì tài liệu nói có một bài kiểm sẽ tự làm mới nó nhưng thực ra không còn làm nữa.
  file: `_acceptance/tro-ly-okr-nen/rang/so-phien-con-that.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture không round-trip): E2 đọc một fixture đã đóng băng, E25 không còn làm mới nó (r2)**
  Người dùng thấy gì: Bài kiểm sổ chi phí có thể tiếp tục báo xanh dựa trên một bản dữ liệu mẫu cũ, dù cách hệ thống thật ghi sổ đã thay đổi, mà không ai biết hai bên đã lệch nhau.
  file: `_acceptance/tro-ly-okr-nen/rang/so-phien-con-that.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng trục phiên con là danh sách tay): ma-tran-viec không rút từ SUBAGENT_CO_SO × VIEC_TRO_LY (r2)**
  Người dùng thấy gì: Nếu sau này có thêm một việc trợ lý mới hay một loại phiên con mới, hệ thống có thể âm thầm tính sai chi phí của việc đó vào nhóm khác mà không ai được cảnh báo.
  file: `packages/validation/test/ai-chi-phi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm không thể đỏ): «request duy nhất là POST okr.setProgram» đo qua bộ lọc chỉ nhận setProgram (r2)**
  Người dùng thấy gì: Bằng chứng nói chỉ có đúng một yêu cầu mạng xảy ra khi Lưu, nhưng cách đo chỉ nhìn một loại yêu cầu nên câu đó luôn đúng bất kể thực tế — không phải bằng chứng thật rằng mạng sạch.
  file: `_acceptance/tro-ly-okr-nen/evidence/E15-network.txt`
  severity: low
  Đề xuất: known-limits

- **Mốc báo trần 80/100 bị chép ở bốn chỗ; màn tự suy lại mốc và lệch với máy nhắc (r1)**
  Người dùng thấy gì: Số phần trăm hiển thị trên thẻ ngân sách có thể không khớp với tin nhắn nhắc gửi cho quản trị, ví dụ khi trần đặt bằng 0 hoặc chi tiêu vừa vượt 80%.
  file: `apps/app/app/(app)/[slug]/settings/okr/the-so-chi-phi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Sổ chi phí nuốt lỗi phân tích: bước đọc không được coi như bước không tốn tiền (r1)**
  Người dùng thấy gì: Khi có dữ liệu bất thường từ hệ thống AI, một số chi phí có thể không được ghi vào sổ mà không có cảnh báo, khiến số tiền hiển thị thấp hơn thực tế.
  file: `apps/agent/agent/lib/so-chi-phi.ts`
  severity: medium
  Đề xuất: known-limits

- **Năng lực «AI model» khai hai lần: tác nhân chặn việc qua hàm riêng thay vì `enabled(id)` (r1)**
  Người dùng thấy gì: Nếu sau này bật hay tắt khả năng dùng AI ở một chỗ mà quên chỗ còn lại, quản trị có thể thấy hai thông tin trái ngược nhau về việc AI có sẵn sàng hay không.
  file: `apps/agent/agent/lib/okr/viec.ts`
  severity: low
  Đề xuất: known-limits

- **Hằng chỉnh được của đối soát và lease nằm cạnh chỗ dùng, viết số đơn vị thô (r1)**
  Người dùng thấy gì: Các con số thời gian chờ và lịch chạy nằm rải rác trong mã, nên người muốn chỉnh sau này khó tìm đúng chỗ và dễ sửa sót.
  file: `apps/agent/agent/lib/ai-doi-soat.ts`
  severity: low
  Đề xuất: known-limits

- **Thẻ Trợ lý OKR viết lại bộ đọc trần thay vì dùng `docTranUsd` dùng chung (r1)**
  Người dùng thấy gì: Có hai cách đọc trần chi tiêu USD người nhập cùng tồn tại; nếu một bên được sửa mà quên bên kia, ô nhập trần có thể chấp nhận hoặc từ chối sai giá trị người gõ.
  file: `apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx`
  severity: low
  Đề xuất: known-limits

- **`LY_DO_VIEC_OKR` khai lý do cho năm loại việc nhưng hai chỗ xếp việc tự gõ lại chuỗi (r1)**
  Người dùng thấy gì: Lý do xếp việc AI được viết lặp ở nhiều nơi trong mã; sửa ở một chỗ mà quên chỗ khác có thể khiến nhật ký vận hành ghi lý do không nhất quán.
  file: `apps/api/src/agent/agent-trigger.service.ts`
  severity: low
  Đề xuất: known-limits

- **Lease 30 s của việc Trợ lý OKR không được gia hạn trong lúc subagent tro_ly_okr chạy, nên việc bị đóng «hong:het-lease» giữa chừng và các đề xuất bị mất (r1)**
  Người dùng thấy gì: Một đề xuất AI đang được soạn có thể bị huỷ giữa chừng và mất trắng nếu bước xử lý mất hơn khoảng 30 đến 90 giây, dù việc soạn vẫn đang diễn ra bình thường.
  file: `apps/agent/agent/hooks/okr-uy-quyen.ts`
  severity: high
  Đề xuất: known-limits

- **Kết quả kiểm «chua-co-khoa-mo-hinh» cũ chặn mọi việc Trợ lý OKR kể cả khi khoá đã được cắm (r1)**
  Người dùng thấy gì: Nếu quản trị bật Trợ lý OKR trước khi cắm khoá kết nối AI, tính năng có thể vẫn báo chưa sẵn sàng cho tới khi tắt rồi bật lại, dù khoá đã được cắm đúng sau đó.
  file: `packages/db/src/okr-tro-ly.ts`
  severity: medium
  Đề xuất: known-limits

- **chayDoiSoat: khối try bọc cả phần ghi DB, nên lỗi DB bị ghi thành lỗi Gateway và đè lên kết quả đối soát đã ghi đúng (r1)**
  Người dùng thấy gì: Khi có trục trặc kỹ thuật nhất thời ngay sau khi đối chiếu chi tiêu AI với nhà cung cấp đã tính đúng, hệ thống có thể ghi đè kết quả đúng bằng một thông báo lỗi sai, khiến báo cáo trông như bị lỗi dù thực ra đã khớp.
  file: `apps/agent/agent/lib/ai-doi-soat.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi gửi phiên của việc Trợ lý OKR bị bỏ qua; việc chỉ đóng sau khi hết lease với lý do sai là het-lease (r1)**
  Người dùng thấy gì: Khi một việc AI không gửi được do lỗi kỹ thuật, hệ thống có thể báo lý do chung chung là hết thời gian chờ thay vì lý do thật, gây khó khăn khi cần chẩn đoán sự cố.
  file: `apps/agent/agent/lib/dispatch.ts`
  severity: medium
  Đề xuất: known-limits

- **nop_de_xuat kiểm-rồi-ghi không khoá, nên cùng một việc có thể nhận hai lần nộp (r1)**
  Người dùng thấy gì: Trong một số tình huống hiếm, một đề xuất AI có thể được ghi nhận hai lần thay vì một.
  file: `apps/agent/agent/subagents/tro_ly_okr/tools/nop_de_xuat.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: báo cáo Gateway giả khớp đúng schema của bộ đọc, bộ đọc thật chưa từng gặp phản hồi thật (r1)**
  Người dùng thấy gì: Phép đo tự động đối soát chi tiêu AI với nhà cung cấp chưa từng được thử với dữ liệu phản hồi thật, nên chưa chắc hoạt động đúng khi triển khai thật.
  file: `apps/agent/test/ai-doi-soat.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: «hàng cấu hình cũ» đã chứa sẵn các trường AI với đúng giá trị mặc định (r1)**
  Người dùng thấy gì: Chưa có bằng chứng độc lập rằng một chương trình OKR cũ, sau khi nâng cấp, thực sự hiện đúng các giá trị mặc định đã hứa.
  file: `packages/validation/test/okr-tro-ly.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: ngữ cảnh ghi lại từ eve bị đè đúng những trường mà hook dùng để suy việc (r1)**
  Người dùng thấy gì: Chưa có bằng chứng độc lập rằng việc phân loại đúng loại chi phí AI hoạt động đúng với dữ liệu ngữ cảnh thật, chỉ mới đúng với dữ liệu bài kiểm tự dựng.
  file: `apps/agent/test/so-chi-phi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: trạng thái đã nhận việc được ghi tay thay vì để claimDue tạo (r1)**
  Người dùng thấy gì: Chưa có bằng chứng độc lập rằng một việc AI thật sự sống đúng khoảng thời gian quy định và không bị nhận nhầm lần hai.
  file: `apps/agent/test/tro-ly-okr-viec.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: cấu hình AI được chèn thẳng vào bảng với version âm và createdAt lùi, bỏ qua okr.setProgram (r1)**
  Người dùng thấy gì: Dữ liệu cấu hình AI dùng để kiểm thử được tạo khác cách admin thật lưu cấu hình, nên bài kiểm có thể bỏ sót một số lỗi thật khi hai đường ghi và đọc lệch nhau.
  file: `apps/agent/test/support/tro-ly-gieo.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Đo chuỗi có mặt trong khi lời hứa là quan hệ: vế Gateway của phép đối soát được chọn theo chính luồng sự kiện ghi ra sổ (r1)**
  Người dùng thấy gì: Phép đo lệch chi tiêu giữa sổ nội bộ và nhà cung cấp AI có thể bỏ sót đúng loại lỗi nghiêm trọng nhất, khi một lượt gọi bị thiếu ở cả hai vế cùng lúc.
  file: `_acceptance/tro-ly-okr-nen/rang/doi-soat-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: đếm 0 ở lượt okr là nhờ tool thay thế, còn đối chứng chỉ-có-hook thì chỉ in ra (r1)**
  Người dùng thấy gì: Phép đo rằng hệ thống chặn AI truy cập ngoài phạm vi có thể báo đạt dù cơ chế chặn thật không hoạt động, vì bài kiểm dùng công cụ giả tạo ra cùng kết quả.
  file: `_acceptance/tro-ly-okr-nen/rang/hook-chan-truoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: tập tool của phiên con được kiểm «không có gì ngoài tập», còn đối chứng đỏ chạy trên danh sách gõ tay (r1)**
  Người dùng thấy gì: Phép đo rằng tác nhân AI phụ chỉ dùng đúng công cụ được phép có thể báo đạt một cách giả tạo nếu hệ thống không đọc được danh sách công cụ đã dùng.
  file: `apps/agent/evals/okr/cach-ly.eval.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: «thành viên không thấy khối AI» xanh cả khi trang không tải (r1)**
  Người dùng thấy gì: Phép đo rằng thành viên thường không thấy khối cài đặt AI có thể báo đạt ngay cả khi trang bị lỗi hoặc chuyển hướng, không thật sự chứng minh việc ẩn đúng theo quyền.
  file: `_acceptance/tro-ly-okr-nen/rang/man-cai-dat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên đi cây khuôn nhưng chỉ soi thuộc tính cấp gốc có type trực tiếp (r1)**
  Người dùng thấy gì: Phép đo rằng kết quả AI trả về gốc chỉ chứa mã, không chữ tự do, hiện chưa quét hết các trường lồng bên trong, dù hiện tại chưa có rò rỉ chữ tự do nào xảy ra.
  file: `apps/agent/test/okr-chuyen-tiep.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — Đo chỉ dẫn thay vì đầu ra: deny-all được kiểm bằng cách đếm chuỗi trong mã nguồn (r1)**
  Người dùng thấy gì: Phép đo rằng khu vực chạy AI bị khoá mạng hoàn toàn chỉ đếm chữ trong mã nguồn thay vì kiểm tra chính sách mạng thật, nên một thay đổi làm hở chính sách mạng sau này có thể không bị phát hiện.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/21 lỗi rơi vào file không bộ đo nào phủ (packages/db/src/ai-chi-phi-danh-muc.ts, apps/agent/test/support/tro-ly-gieo.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.