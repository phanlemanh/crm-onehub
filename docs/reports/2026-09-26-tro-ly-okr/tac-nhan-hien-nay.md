# Tác nhân hiện nay có dựng được Trợ lý OKR không

Viết 2026-09-27, đo trên `onehub` ở commit `f2acca7f` (eve 0.29.4). Đọc cùng
`docs/plan/lo-trinh-tro-ly-okr.md` và mục 4, 6.3 của `12-kien-truc-va-lo-trinh.md`.

## Câu trả lời

**Không.** Tác nhân hôm nay không dựng được việc nào trong ba việc của kế hoạch, và
không dựng được một phần nào của 9b, 9c hay lượt 10 mà không sửa khung của hãng.

Ba lý do, lý do nào cũng đủ chặn:

1. **Tác nhân không đọc được OKR.** Không công cụ nào của nó chạm Mục tiêu, KR, Cập
   nhật tuần hay cây tổ chức. Nó chỉ thấy liên hệ, công ty và thoả thuận. Thử thật:
   kho có sẵn một Mục tiêu giả, Tác nhân vẫn báo «không có bản ghi OKR nào».
2. **Không có đường vào và đường ra mà kế hoạch cần.** Chạy tay không nhận được Mục
   tiêu đang mở. Không có sự kiện OKR nào. Đầu ra chỉ là bản tóm tắt lượt chạy, một
   ghi chú hay việc trên bản ghi đối tác, hoặc một tin Slack. Không có luồng «đề xuất
   → người nhận, sửa, bác».
3. **Trên production, mọi lượt chạy Tác nhân đang hỏng mà vẫn báo «Xong».**
   Production đặt model Gemini 3.8 Flash. Với Gemini, tác tử chạy việc hỏng ngay ở
   lời gọi đầu (Google từ chối khuôn dữ liệu của công cụ `finish_run`), nhưng lượt
   vẫn ghi «Xong». Đo lại với đúng Gemini 3.8 Flash trên máy local: hỏng y hệt.

Cách thử: ba Tác nhân dựng thật trên máy local, kho DB riêng `crm_tac_nhan_do`, dữ
liệu OKR giả, không nối Slack. Tiền model tối đa $0,67 (đọc từ khoá AI Gateway dùng
chung với các cây khác, nên đây là trần trên). Production chỉ xem.

## Ba Tác nhân đã thử

| # | Yêu cầu gõ vào bộ dựng | Bộ dựng hiểu tới đâu | Bản khai sinh ra | Đưa vào chạy | Chạy thử |
|---|---|---|---|---|---|
| 1 | «Khi tôi bấm trên một Mục tiêu OKR… góp ý viết lại tên Mục tiêu. Chỉ đề xuất… không được tự sửa OKR» | Hứa làm được: «Đọc tên Mục tiêu… và danh sách các KR đi kèm». Không cảnh báo gì | Chạy tay · phạm vi «mọi bản ghi trong không gian làm việc» · một hành động «viết tóm tắt lượt chạy» | Qua | Gemini 3.7 và 3.8: tác tử chạy việc hỏng ngay, lượt ghi «Xong» (ảnh 03). GLM 5.2 Fast: «không có bản ghi OKR nào… không làm gì» (ảnh 04) |
| 2 | «Mỗi sáng thứ Ba 8 giờ (giờ Việt Nam), tóm tắt Cập nhật tuần OKR của Phòng Kinh doanh X… câu nào cũng dẫn nguồn» | Hiểu đúng lịch, tự tính giờ UTC đúng (thứ Ba 01:00 UTC). Vẫn hứa đọc được Cập nhật tuần | Theo lịch, mốc 2026-09-29 01:00 UTC, mỗi 10.080 phút · phạm vi mọi bản ghi · «viết tóm tắt lượt chạy» | Qua | Kích hoạt theo lịch thật (mốc dời về hiện tại, gọi nhịp điều phối). Kết quả: «không có dữ liệu». Tác nhân còn kết luận sai rằng kho trống, trong khi kho có 52 liên hệ, 18 công ty, 27 thoả thuận (ảnh 07) |
| 3 | «Khi một KR trượt so với vạch kỳ vọng… báo cho trưởng đơn vị… mỗi KR nghỉ 14 ngày giữa hai lần báo» | Lần này nhận ra kho không có KR, không có Mức tự tin, không có trưởng đơn vị, và hỏi lại dữ liệu nằm đâu. Câu hỏi hiện bằng tiếng Anh | Không có | — | Không tới được. Mở lại hội thoại đang chờ trả lời thì màn sập (ảnh 08). Trả lời qua API thì hệ thống nhận, nhưng bộ dựng không đi tiếp trong 10 phút. Không kết luận phần sau là lỗi sản phẩm |

Hai điều rút ra từ bảng này:

- **Bộ dựng hứa điều Tác nhân không làm được.** Với việc 1 và 2, nó soạn bản khai
  «đọc Mục tiêu, KR, Cập nhật tuần», người dựng bấm Đưa vào chạy, và chỉ biết là
  không được khi đọc kết quả lượt chạy. Luật của bộ dựng cấm bịa sự kiện
  (`apps/agent/agent/subagents/agent_builder/instructions.md:23-30`), nhưng không
  cấm hứa đọc thứ không có.
- **Trạng thái «Xong» không có nghĩa là đã làm.** Lượt có hành động bắt buộc duy nhất
  là «viết tóm tắt» thì hỏng thế nào cũng thành «Xong»
  (`apps/agent/agent/lib/run-runtime.ts:784-817`, gọi từ
  `apps/agent/agent/channels/crm.ts:171-195`).

## Bảng 1 — Năng lực

| Làm được | Bằng chứng |
|---|---|
| Ba kiểu kích hoạt chạy thật: chạy tay, theo lịch, theo sự kiện | `packages/validation/src/agent-manifest.ts:58-77`; lịch: `apps/agent/agent/schedules/dispatch.ts:17` (mỗi phút); sự kiện: `apps/agent/agent/lib/custom-agent-dispatch.ts:284-375`; ảnh 04, 07 |
| Lịch: một mốc đầu và một khoảng phút (1 phút tới 1 năm). Bộ dựng tự quy giờ Việt Nam ra UTC đúng | `agent-manifest.ts:49-52`; `apps/agent/agent/lib/builder-runtime.ts:590-598`; bản khai của việc 2 |
| Sáu sự kiện, trên ba loại bản ghi: công ty tạo, liên hệ tạo, thoả thuận tạo, đổi giai đoạn, mở lại, đóng | `packages/db/src/crm-events.ts:1-40` |
| Ba hành động có kiểu: ghi chú hoặc việc trên một công ty, liên hệ, thoả thuận; tóm tắt lượt chạy; một tin Slack tới đúng một kênh hay một người đã chọn | `agent-manifest.ts:26-47`; `apps/agent/agent/lib/agent-actions.ts:6-10` |
| Phạm vi dữ liệu khai được: bản ghi đã chọn trong hội thoại, hoặc cả không gian làm việc; thêm Gmail, Lịch Google, Slack nếu đã nối | `agent-manifest.ts:79-94`; `builder-runtime.ts:493-547` |
| Đọc liên hệ, công ty, thoả thuận bằng hai công cụ: tìm theo chữ (từ 2 ký tự, tối đa 50 kết quả) và đọc lịch sử một bản ghi, kể cả thư và lịch nếu được cấp | `apps/agent/agent/subagents/agent_runner/tools/query_crm.ts:9-13`; `run-runtime.ts:165-229` |
| Một lượt chạy dở mỗi Tác nhân; bấm chạy thêm khi đang chạy thì bị từ chối | `custom-agent-dispatch.ts:377-409`; `apps/api/src/agent/agent-runs.service.ts:193-204` |
| Mỗi hành động ghi sổ trước khi làm, khoá theo mã lời gọi, nên chạy lại không làm hai lần | `run-runtime.ts:262, 398, 494-571` |
| Dừng lượt chạy bằng một hàng trong DB, có hiệu lực kể cả khi tín hiệu tới tác nhân không tới | `docs/agent.md` mục «Team-agent builder and runner»; `agent-runs.service.ts:333-431` |
| Người vai «chỉ OKR» bị chặn khỏi cả khu Tác nhân, ở ba lớp: màn, API, tác nhân | `apps/app/lib/pham-vi-man.ts:12-20, 70-77`; `apps/api/src/agent/agents.router.ts:46`; `apps/agent/agent/lib/thanh-vien-principal.ts:21` |
| Bộ dựng có hỏi lại khi thiếu dữ liệu (việc 3) | ảnh 08 kèm mô tả ở bảng trên; `instructions.md:63-75` |
| Có trần token cho mỗi phiên: gốc 500k vào / 50k ra, tác tử chạy việc 500k / 40k, bộ dựng 100k / 10k; lượt quá 20 phút bị đánh hỏng | `apps/agent/agent/agent.ts:20-24`; `agent_runner/agent.ts:39-43`; `agent_builder/agent.ts:36-40`; `apps/agent/agent/lib/dispatch-config.ts:27` |

## Bảng 2 — Giới hạn

Cột «Phí bản rẽ» là cái giá nếu OneHub tự vá thay vì gửi hãng. Mọi tệp trong bảng
đều là tệp của hãng.

| Giới hạn | Hệ quả với người dùng | Vá được không | Phí bản rẽ khi vá |
|---|---|---|---|
| **Với model Gemini, tác tử chạy việc hỏng ở lời gọi đầu**: công cụ `finish_run` khai `z.json()` đệ quy, Google từ chối (`agent_runner/tools/finish_run.ts:11`). Production đang đặt Gemini 3.8 Flash | Trên production, mọi Tác nhân dựng từ hôm nay đều không làm gì mà vẫn hiện «Xong» (ảnh 03) | Được, một dòng: bỏ kiểu đệ quy khỏi khuôn đầu vào | Thấp nếu gửi hãng — lỗi còn nguyên ở `upstream/main`. Chip riêng đã mở |
| **Lượt hỏng vẫn báo «Xong»** khi hành động bắt buộc chỉ là tóm tắt | Người xem lịch sử không phân biệt được «đã làm» với «hỏng ngay» | Được: `finishRun` đòi có kết quả do tác tử chạy việc nộp | Thấp nếu gửi hãng |
| **Không đọc được OKR**: không loại bản ghi, không công cụ, không phạm vi nào cho Mục tiêu, KR, Cập nhật tuần, đơn vị (`agent-manifest.ts:79-83`; grep `okr` trong `subagents/` không ra gì) | Mọi việc OKR đều trả «không có dữ liệu», hoặc tệ hơn, kết luận sai | Được, nhưng là tính năng mới: loại bản ghi, công cụ đọc, lọc theo quyền | Cao: chạm bản khai, bộ dựng, tác tử chạy việc, sáu chỗ đọc bản khai |
| **Chạy tay không nhận đầu vào** (`apps/api/src/agent/agents.contracts.ts:77-79`) | Không có «bấm trên Mục tiêu này» — việc 1 không thể làm dù có đọc được OKR | Được | Trung bình: hợp đồng API, màn, bộ dựng |
| **Không có sự kiện OKR** (`crm-events.ts:1-40`); ghi OKR không phát sự kiện nào | Không có «khi KR trượt» | Được | Trung bình tới cao |
| **Sự kiện không lọc theo trường**: mọi thoả thuận đổi giai đoạn đều mở một lượt đầy đủ (`custom-agent-dispatch.ts:309-326`) | Mỗi sự kiện tốn trọn hai phiên kể cả khi không có gì để làm | Được | Trung bình |
| **Lịch không có múi giờ**: màn Tác nhân hiện giờ UTC, thẻ trong hội thoại hiện giờ máy (ảnh 06 và 05). Lịch là «mốc + khoảng phút», không phải «mỗi thứ Ba» | Người dựng đọc hai giờ khác nhau cho cùng một lịch | Được | Thấp |
| **Tìm chỉ theo chữ**; không liệt kê, không lọc | Tác nhân kết luận sai «kho trống» (ảnh 07) | Được | Trung bình |
| **Chạy bằng danh tính người dựng**: lượt theo lịch và theo sự kiện dùng `createdById` (`custom-agent-dispatch.ts:498-511`), và không kiểm lại vai lúc chạy | Người dựng bị hạ xuống «chỉ OKR» hay rời công ty thì Tác nhân vẫn chạy bằng tên họ; ghi chú do máy viết mang tên họ (`run-runtime.ts:330`) | Được | Thấp tới trung bình |
| **Lối rò Slack**: lúc lưu, danh sách người nhận Slack gồm mọi thành viên có Slack, không lọc vai (`builder-runtime.ts:667-680`); lúc chạy, chỉ kiểm bản khai có đúng một nơi nhận (`run-runtime.ts:1024-1056`), không kiểm ai trong kênh | Tác nhân đọc cả thoả thuận và thư, rồi đăng tới kênh có người vai «chỉ OKR», hoặc nhắn thẳng một người vai đó | Được | Trung bình. Là lượt «Vá lối rò Slack» của kế hoạch |
| **Sửa Tác nhân đang chạy thì bản mới chạy ngay**, không cần Đưa vào chạy lại (`apps/api/src/agent/agent-definitions.service.ts:284-321`; thông báo «Đã lưu. Một bản mới đang chạy.») | «Đưa vào chạy là cổng duyệt» chỉ đúng cho bản đầu | Được | Thấp |
| **Ai trong khối đối tác cũng chạy được Tác nhân của người khác** (`agent-runs.service.ts:149, 242`); người tự dựng tự duyệt | Không có người duyệt thứ hai | Được | Thấp |
| **Chi phí đếm thiếu**: `AgentRun.costUsd` chỉ cộng các bước của phiên gốc (`apps/agent/agent/hooks/audit.ts:157-178`); tác tử chạy việc không có hook | Đo thật: sổ ghi $0,017 cho một lượt tốn khoảng $0,083 (21%); một lượt khác ghi $0,036 trên khoảng $0,078 (46%). Tiền bộ dựng không ghi ở đâu. Màn không hiện chi phí | Được. Kết quả thành công của tác tử chạy việc có mang `usage` trong sự kiện `action.result`, nên hook gốc đọc được | Thấp |
| **Không có trần tiền nào**, theo lượt, theo tháng hay theo Tác nhân | Một Tác nhân gắn sự kiện có thể tiêu không giới hạn khi nhập hàng loạt | Được | Trung bình |
| **Không có cờ ZDR** ở đâu trong mã (grep `zeroDataRetention`, `providerOptions`: 0 kết quả trong `apps/`, `packages/`) | Dữ liệu gửi tới nhà cung cấp theo chính sách lưu mặc định | Được | Thấp nếu làm như cấu hình chung; nhưng model đọc từ cài đặt nên đọc hỏng thì rơi về GLM (`apps/agent/agent/lib/model.ts:9-27`) |
| **Mỗi lượt tốn hai phiên** (gốc chuyển tiếp, rồi tác tử chạy việc); mỗi lượt hỏi bộ dựng cũng hai phiên | Phần chuyển tiếp ở gốc khoảng $0,007–0,018 mỗi lượt, như N0 đã đo | Không, nếu giữ khung | — |
| **Không có luồng đề xuất → nhận, sửa, bác**: chạy ở chế độ việc (`task`) nên không dừng chờ người (`custom-agent-dispatch.ts:515`); công cụ hỏi lại bị tắt ở tác tử chạy việc | Máy chỉ ghi thẳng hoặc báo, người không có chỗ nhận hay bác | Không, trong khung này | — |
| **Đầu ra khó đọc**: màn lịch sử chỉ hiện tên các bước và bản tóm tắt cuối, cắt ở 1.000 ký tự, bằng tiếng Anh (ảnh 07; `audit.ts:180-188`). API trả cả dữ liệu thô của 200 sự kiện cho mọi thành viên đọc được Tác nhân (`agent-runs.service.ts:45-93`) | Người dùng không đọc được kết quả thật; thành viên khác đọc được nhiều hơn màn hiện | Được | Thấp |
| **Mở lại hội thoại đang chờ trả lời thì màn sập** («Maximum update depth exceeded» ở ô chọn câu trả lời, `packages/ui/src/components/questionnaire.tsx`) | Người rời trang rồi quay lại không trả lời được câu hỏi của bộ dựng (ảnh 08) | Được | Thấp nếu gửi hãng. Chip riêng đã mở |

## Bảng 3 — So với kế hoạch

«Làm được» nghĩa là Tác nhân hôm nay làm được mà không sửa mã.

### 9a · Nền Trợ lý OKR

| Bàn giao | Tác nhân hiện nay | Vì sao |
|---|---|---|
| Subagent `tro_ly_okr` với bốn chốt | Không | Tác tử chạy việc nhận lời dặn tự do của người dựng, model đọc từ cài đặt, kết quả về gốc là chữ (`agent_runner/agent.ts:44-47`) |
| Sổ chi phí mọi phiên | Không | Chỉ đếm phiên gốc; đo được 21–46% |
| Trần $9 kiểm trước khi xếp việc | Không | Không có trần nào |
| Bảng đề xuất, tóm tắt, phản hồi | Không | Chỉ có `AgentRun.summary` và `AgentAction` |
| Công tắc theo việc × đơn vị | Không | Tác nhân không biết đơn vị |
| Chi tiêu AI theo việc, báo 80% và 100% | Không | Cột chi phí có nhưng thiếu và không hiện ở màn |
| Eval cách ly bằng mã | Không | Chỉ có eval đầu-cuối cho bộ dựng (`docs/agent.md`, cuối mục «Team-agent builder and runner») |

### 9b · Góp ý khi bấm

| Bàn giao | Tác nhân hiện nay | Vì sao |
|---|---|---|
| Nút góp ý trên hộp thoại Mục tiêu và KR | Không | Chạy tay không nhận đầu vào; nút nằm ở màn Tác nhân |
| Đề xuất viết lại, câu cũ cạnh câu mới | Không | Không đọc được Mục tiêu (việc 1) |
| Nhận, sửa, bác từng dòng; vết «theo đề xuất của Trợ lý OKR»; đã bác thì không quay lại | Không | Không có luồng đề xuất |
| Câu hỏi chất lượng, đề xuất Căn chỉnh | Không | Không đọc được OKR |
| Dòng xu hướng tính bằng mã | Không | Không có chỗ cho mã tính trước |
| p50 ≤ 8 giây | Không đo được | Hai lượt đo: 37,5 và 46,2 giây (ảnh 04, 07), với kết quả rỗng |

### 9c · Tóm tắt tuần

| Bàn giao | Tác nhân hiện nay | Vì sao |
|---|---|---|
| Lịch tóm tắt mỗi tuần | **Một phần** | Lịch chạy được, đúng giờ UTC (việc 2). Nhưng không đọc được Cập nhật tuần |
| Khối tóm tắt đầu bảng họp tuần, câu nào cũng bấm ra lần cập nhật gốc | Không | Đầu ra nằm ở lịch sử Tác nhân, không ở khu OKR |
| Nút «hữu ích / không» | Không | — |
| Tóm tắt lọc theo người xem lúc hiện | Không | Mọi thành viên khối đối tác đọc cùng một bản |
| Một dòng trong nhắc buổi sáng | Không | Tác nhân không ghi vào nhắc buổi sáng |

### Lượt 10 · OKR trong chat

| Bàn giao | Tác nhân hiện nay | Vì sao |
|---|---|---|
| Báo trưởng đơn vị khi lệch vạch kỳ vọng, chỉ khi đổi trạng thái, nghỉ 14 ngày | Không | Không có sự kiện OKR, không đọc được KR; nghỉ 14 ngày cần trạng thái giữa các lượt (việc 3) |
| Nút Mức tự tin và sửa số trong Slack | Không | Tin Slack của Tác nhân là chữ một chiều |
| Hỏi đáp OKR theo quyền người hỏi | Không | Tác nhân không có người hỏi; chạy bằng danh tính người dựng |
| Vai «chỉ OKR» chỉ hỏi được về OKR | Không | Vai này không vào được khu Tác nhân |
| Trần số câu mỗi người mỗi ngày | Không | Không có trần nào |

### Các luật của kế hoạch

| Luật | Tác nhân hiện nay | Vì sao |
|---|---|---|
| ZDR bắt buộc, kể cả eval | Không | Không có cờ ZDR; model đọc từ cài đặt, đọc hỏng rơi về GLM |
| Vai «chỉ OKR» an toàn | **Ngược lại** | Họ không dùng được Tác nhân, nhưng Tác nhân của người khác gửi được dữ liệu đối tác tới họ qua Slack |
| Máy không ghi OKR | Làm được, vì không có đường | Không có hành động nào ghi OKR (`agent-manifest.ts:4-8`) |
| Kiểm số bằng mã | Không | Chữ của model đi thẳng vào tóm tắt |
| Trần $9 | Không | Không có trần; sổ đếm thiếu |
| Không thêm tin nhắn | Không giữ được | Người dựng tự khai tin Slack, mỗi lượt một tin; không có luật gộp hay nghỉ |

## Kiểm lại lý do loại phương án C

Phương án C lấy khung Tác nhân làm đơn vị mở rộng, và bị loại với 15,5 điểm. Kiểm
từng khẳng định về mã của ba giám khảo với mã thật và với số đo ở trên:

| Khẳng định của giám khảo | Thực tế |
|---|---|
| Chạy bằng danh tính người dựng (GK khớp kho M2, GK rủi ro K7) | **Đúng**, cho lượt theo lịch và theo sự kiện. Lượt chạy tay dùng người bấm (`custom-agent-dispatch.ts:498-511`) |
| Mỗi Tác nhân một lượt đang chạy | **Đúng** |
| Lối rò Slack: chỉ kiểm nơi nhận đã khai | **Đúng, và rộng hơn đã tả**: danh sách người nhận lúc lưu không lọc vai, nên nhắn thẳng người vai «chỉ OKR» cũng được |
| Phạm vi cả không gian trả hết; chạy tay chỉ cần là thành viên | **Đúng** |
| `isAutomated` chỉ nhận danh tính của app | **Đúng, nhưng không chạm tác tử chạy việc**: tác tử này không có công cụ ghi nhạy cảm nào. `isAutomated` chỉ có tác dụng ở phiên gốc, qua `archive_field` và `record_job_change` |
| Sổ chi phí mù phần tác tử con | **Đúng**, và nay có số: 21–46% |
| Chế độ việc không dừng chờ duyệt | **Đúng** |
| Không có cờ ZDR | **Đúng** |
| Chọn model hỏng thì rơi về GLM không ZDR | **Đúng** (`model.ts:9-27`). Thêm: tác tử chạy việc dùng model ghim lúc lưu bản, nên đổi cài đặt không đổi Tác nhân đã dựng |
| Router Tác nhân thành đường đọc thứ hai | **Đúng**: lịch sử trả dữ liệu thô của sự kiện cho mọi thành viên đọc được |

Giám khảo không thấy bốn điều, và cả bốn làm lý do loại **mạnh hơn**:

1. Với model production, khung này hỏng hoàn toàn và giấu lỗi. C sẽ dựng lên một
   đường chạy đang hỏng.
2. Chạy tay không nhận đầu vào. «Bấm trên Mục tiêu» — việc chính của 9b — cần thêm
   một hợp đồng mới, ngoài 13 chỗ sửa C đã đếm.
3. Sửa Tác nhân đang chạy thì bản mới chạy ngay, nên «Đưa vào chạy theo đơn vị» của C
   không phải cổng duyệt bền.
4. Bộ dựng hứa đọc thứ không có. Một khung mà người dùng tự ghép lời dặn sẽ lặp lại
   đúng lỗi đó với OKR.

Không có khẳng định nào của giám khảo sai với mã. Lý do loại đứng vững.

## Lối rò Slack và danh tính người dựng: vẫn đúng

Cả hai điều N0 và thiết kế đã nêu vẫn đúng ở `f2acca7f`:

- **Lối rò Slack:** `run-runtime.ts:1024-1056` và `builder-runtime.ts:667-680`. Kịch
  bản: một người khối kinh doanh dựng Tác nhân phạm vi cả không gian, đọc thoả thuận
  và thư, đăng vào `#general` có nhân viên vai «chỉ OKR», hoặc nhắn thẳng một người
  vai đó, rồi tự Đưa vào chạy.
- **Danh tính người dựng:** `custom-agent-dispatch.ts:498-511`. Lượt nền chạy bằng
  người tạo, và không kiểm lại vai của họ lúc chạy.

Việc vá riêng đã mở (chip ngày 26/09, dòng «Vá lối rò Slack» ở mục 9 của
`lo-trinh-tro-ly-okr.md`), chưa có PR. Hai điều cần thêm vào phạm vi của lượt vá:

- Vá `isAutomated` không đóng được lối nào trong hai lối trên. Chỗ vá phải là lọc
  người nhận theo vai, ở cả hai lúc (lưu và chạy), và kiểm lại vai của người tạo lúc
  chạy.
- Hôm nay lối rò chưa xảy ra trên production, vì production chưa có Tác nhân nào, và
  với Gemini mọi lượt hỏng trước khi kịp đăng. Nó mở lại ngay khi lỗi Gemini được vá.
  **Vá lỗi Gemini và vá lối rò nên lên production cùng lúc.**

## Có nên đổi kế hoạch không

**Giữ nguyên phương án A.** Không phần nào của khung Tác nhân rút ngắn được 9a, 9b,
9c hay lượt 10. Những gì kế hoạch định dùng lại đã là nếp chung của kho, không riêng
Tác nhân: hàng `AgentTask` và nhịp điều phối mỗi phút, ghi sổ trước khi làm, khoá
theo mã lời gọi.

Bốn điều nên thêm vào phạm vi 9a, rút từ lần thử này:

1. **Khuôn công cụ và khuôn đầu ra của `tro_ly_okr` không được có kiểu đệ quy.** Cần
   một test ghim: mọi khuôn chuyển được sang JSON Schema mà Gemini nhận. Đây là đúng
   lỗi đang làm hỏng Tác nhân.
2. **Model production là Gemini 3.8 Flash**, không phải 3.7 mà N0 đã đo. Việc này trả
   lời một nửa câu hỏi «production đặt model nào» của truy vấn N0. Giá và tỷ lệ cache
   của 3.8 cần đo lại trước Cổng Phạm vi 9a.
3. **Việc hỏng phải hiện là hỏng.** Tác nhân cho thấy hậu quả của «gốc không hỏng khi
   con hỏng» (N0): lượt hỏng ghi «Xong». Hook đóng việc theo `isError` của 9a là đúng
   hướng; cần thêm test cho ca «subagent hỏng ở lời gọi đầu».
4. **Kết quả thành công của subagent có mang `usage`** trong sự kiện `action.result`
   (thấy ở lượt của việc 2). Sổ chi phí đối soát được thêm từ đó, nhưng vẫn cần hook
   trong subagent cho ca hỏng, như N0 đã chốt.

Tiền và cách thử:

- Tiền model: khoá chung ghi tăng $0,67 trong phiên này. Con số gồm cả các cây khác
  dùng chung khoá, nên chỉ là trần trên. Các phần đo được:
  - bộ dựng (Gemini 3.7): khoảng $0,07 một lượt;
  - bộ dựng (GLM): khoảng $0,21 một lượt;
  - lượt chạy (GLM): khoảng $0,08;
  - lượt chạy (Gemini, hỏng ngay): khoảng $0,01.
- Thử 1 và 2 dùng model mặc định GLM cho phần chạy. Để tách nguyên nhân, model ghim
  của Tác nhân 1 được đổi thẳng trong DB giữa các lượt; đó là thao tác thử, người
  dùng không làm được.
- Mốc lịch của Tác nhân 2 được dời về hiện tại để lịch kích hoạt ngay. Vì thế ảnh 05
  và 06 hiện mốc kế tiếp là Chủ nhật: lịch lấy mốc đã dời làm gốc.
- Dọn dẹp:
  - đã tắt máy chủ dev;
  - đã xoá `crm_tac_nhan_do` và bản mẫu `crm_tac_nhan__mau_do`;
  - đã xoá trạng thái phiên cục bộ của tác nhân (`apps/agent/.eve`).
- Không nối Slack và không đăng gì: hành động Slack «không thử», vì cần kênh thật.
- Production chỉ xem, với phiên đăng nhập sẵn trong trình duyệt:
  - màn Tác nhân: cùng khung với bản local, đội chưa có Tác nhân nào;
  - Cài đặt › Chung: đọc tên model, không bấm gì.

## Ảnh

Thư mục `tac-nhan-anh/`, chụp ở máy local, giao diện sáng, 1280×800.

| Ảnh | Nội dung |
|---|---|
| `01-tac-nhan-1-da-dua-vao-chay-trong-hoi-thoai.jpg` | Tác nhân 1 đã vào chạy, thẻ trong hội thoại |
| `02-tac-nhan-1-man-tac-nhan.jpg` | Màn Tác nhân 1: «Nó thấy được gì: mọi bản ghi trong không gian làm việc» |
| `03-tac-nhan-1-luot-gemini-hong-van-bao-xong.jpg` | Lượt #001 với Gemini: lỗi khuôn dữ liệu, trạng thái «Xong» |
| `04-tac-nhan-1-luot-glm.jpg` | Lượt #002 với GLM: 37,5 giây, không việc nào ra ngoài |
| `05-tac-nhan-2-trong-hoi-thoai.jpg` | Tác nhân 2 trong hội thoại: mốc kích hoạt hiện theo giờ máy |
| `06-tac-nhan-2-man-tac-nhan-gio-utc.jpg` | Màn Tác nhân 2: «Chạy khi nào» hiện theo UTC |
| `07-tac-nhan-2-luot-theo-lich-ket-qua.jpg` | Lượt theo lịch: «No data», kết luận sai «kho trống», tiếng Anh |
| `08-tac-nhan-3-mo-lai-hoi-thoai-dang-hoi-bi-sap.jpg` | Mở lại hội thoại đang chờ trả lời: màn sập |
