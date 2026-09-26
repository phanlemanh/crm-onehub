# Review Findings: hoan-thien-hoi-crm-qua-zalo (round 1)

## Trong hợp đồng

### Hình dạng 4 (âm tính một mình, không đối chứng dương): phần đối chứng web của ghi-that không gọi công cụ, gọi thẳng writer của thư viện
- file: `apps/agent/test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts:288`
- severity: high
- source: measurement
- AC: AC-2

detail: AC-2 và E2 hứa: «phiên web gọi hai công cụ với cùng đầu vào → DB đọc lại W, số hàng +1» (evals.yaml E2: `set_field_value(value "web")`, `record_fact(R)` với ctx web). Thực tế ở dòng 288-303, phần đối chứng gọi `writeField({...value:"web"})` và `recordFact({...})` trực tiếp từ `../agent/lib`. `sfv.execute(...)` và `rf.execute(...)` không bao giờ chạy với ctx web; biến `web`/`ctxMucDich({})` còn không được dựng trong ca này. Hệ quả là đường ghi thành công của công cụ không được đo dương ở đâu cả. Ở E1, các mục đích khác chỉ có `.not.toBe(ZALO.hoi.tuChoiGhi)` (dòng 203-206), nên bất kỳ lỗi nào khác cũng làm nó xanh. Một đột biến như `set_field_value.execute` ném `new Error("x")` ở mọi phiên sau `assertNotZaloQuestion` (hay `record_fact` luôn ném) vẫn làm cả E1 lẫn E2 xanh. Phần đối chứng chỉ chứng minh thước nhìn thấy lần ghi của thư viện, không chứng minh được lời hứa «thước nhìn thấy được lần ghi của cả hai công cụ».

Rationale: AC-2 hứa rõ đối chứng phiên web phải chứng minh qua chính hai công cụ (đối chứng: thước nhìn thấy được lần ghi của cả hai công cụ), nhưng test gọi thẳng writer của thư viện, bỏ qua execute của công cụ nên lời hứa này thất bại.

### Hình dạng 5 (tuyên quét lớp nhưng chỉ chặn điểm-case): bảo vệ bằng grep «không token/ctx tay» chỉ cấm hai tên hàm, lách được bằng suKienVoi ngay trong tệp
- file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts:719`
- severity: low
- source: measurement
- AC: AC-9

detail: AC-9 và E9 hứa rằng mọi sự kiện kênh trong cung-phien và duong-chinh không dùng chuỗi token hay ctx dựng tay. E9 còn nêu mẫu grep cụ thể: `continuationToken: "chat:` / `continuationToken: \`chat:`. Ca ở dòng 705-721 lại chỉ cấm `ctxZalo(` và `/\bsuKien\(/`. Lời gọi `suKienVoi(ten, data, "zalo:chat:ZA", {session:{...}})` (hàm cùng tệp, dòng 537, nhận token bất kỳ) không khớp `\bsuKien\(`. Một object ctx viết trực tiếp, một `continuationToken:` viết tay truyền vào `xuLy?.(...)`, hay `phienAudit("ses-gia-1", ZALO.hoi.purpose)` (đang có ở dòng 1274 trong khối duong-chinh) đều lọt. Thước tuyên bố quét cả lớp «dựng tay» nhưng chỉ liệt kê hai cách viết, và bỏ luôn mẫu grep mà eval đã hứa.

Rationale: AC-9 hứa mọi sự kiện kênh trong đúng hai ca này không dùng token hay ctx dựng tay nào; finding chỉ ra một lời gọi suKienVoi với token dựng tay lọt qua trong chính hai ca đó, nên lời hứa của AC-9 không được giữ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chặn Zalo trong execute không tới được ở hai công cụ có approval (archive_field, record_job_change)**
    Người dùng thấy gì: Với các thao tác cần duyệt trước khi ghi (như lưu trữ trường hay ghi nhận đổi việc), người hỏi qua Zalo có thể bị kẹt ở bước hỏi lại thay vì nhận được câu trả lời tiếp theo, dù không có dữ liệu nào bị ghi nhầm.
    file: `apps/agent/agent/tools/archive_field.ts`
    severity: medium
    Đề xuất: known-limits

- **assertNotZaloQuestion so với chuỗi "zalo" viết tay, trong khi lớp ẩn dùng ZALO.hoi.purpose**
    Người dùng thấy gì: Hiện chưa ảnh hưởng gì tới người dùng vì hai cách viết đang cho cùng một giá trị; nhưng nếu sau này có người đổi một chỗ mà quên chỗ còn lại, ranh giới bảo vệ dữ liệu khi hỏi qua Zalo có thể lặng lẽ hỏng mà không ai biết.
    file: `apps/agent/agent/lib/session-purpose.ts`
    severity: low
    Đề xuất: known-limits

- **SO_TIEN exemption unmasks international phone numbers written with dot groups (PII leak regression)**
    Người dùng thấy gì: Một số số điện thoại quốc tế viết theo nhóm ba số cách nhau bằng dấu chấm (ví dụ dạng +84 912.345.678) có thể bị lộ nguyên văn trong câu trả lời trên Zalo thay vì được ẩn đi như các số điện thoại khác.
    file: `apps/agent/agent/lib/zalo-loc.ts`
    severity: high
    Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): nhánh Zalo của tu-choi-vai chỉ khẳng định loai !== "hoi" mà không ghim tu-choi-vai**
    Người dùng thấy gì: Bài kiểm hiện xác nhận hai người không đủ quyền bị chặn, nhưng chưa chứng minh chắc chắn rằng họ luôn bị chặn đúng vì lý do phân quyền vai trò chứ không phải một lý do khác trùng hợp lúc đó.
    file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca «phiên con mang purpose zalo ở initiator» dựng tay initiator.attributes.purpose và ép kiểu để qua**
    Người dùng thấy gì: Việc chặn ghi cho một phiên phát sinh lồng bên trong phiên hỏi qua Zalo mới chỉ được kiểm bằng dữ liệu dựng tay, nên nếu có kẽ hở thật ở loại phiên này thì có thể chưa được phát hiện sớm.
    file: `apps/agent/test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).