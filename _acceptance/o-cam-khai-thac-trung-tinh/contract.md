---
schema_version: 1
feature: Trả ổ cắm buổi khai thác về trạng thái trung tính, và thu phép đo ổ cắm về đúng hai ổ thiết kế
slug: o-cam-khai-thac-trung-tinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-01T01:02:53Z
---

# Acceptance Contract: o-cam-khai-thac-trung-tinh

## Context

Kit nói ổ cắm buổi khai thác là trung tính: `commands/start.md` cấm cắm
`superpowers:brainstorming` vào đó, cấm luôn mọi skill hội thoại mở, và nói
`discovery.brainstorm_skill` để trống là hợp lệ — bộ quét trả `null` thì thẻ
trỏ về khuôn khai thác của kit, không cờ đỏ, không chặn.

Hồ sơ `sua-test-do-thu-tu-nap` đã ký hôm nay lại khai ngược: AC-7 của nó đòi
**ba** ổ cắm đều có tên, và răng `rang-config.sh --chan o-cam` cưỡng chế điều
đó. Một phiên khác gỡ khoá theo đúng luật kit, và răng đã ký chuyển sang đỏ.
Vòng này sửa phép đo cho khớp luật, không sửa luật cho khớp phép đo.

Source input: prompt

## Criteria

- AC-1: Given `_acceptance/config.yaml`, When bộ đọc của kit đọc `discovery.brainstorm_skill`, Then khoá vắng mặt và giá trị đọc ra là rỗng.
- AC-2: Given `_acceptance/config.yaml`, When bộ đọc của kit đọc `feature_loop.ui_standards_skill` và `design_pass.ds_skill`, Then cả hai trả về tên skill.
- AC-3: Given răng ổ cắm đã thu về hai ổ thiết kế, When chạy nó trên cấu hình thật, Then nó thoát 0.
- AC-4: Given hai cấu hình dựng sẵn, mỗi cái gỡ đúng MỘT ổ thiết kế, When chạy răng chiều đỏ trên từng cái, Then nó bắt được cả hai và báo đúng tên ổ thiếu của từng cái.
- AC-5: Given một cấu hình dựng sẵn có khai `discovery.brainstorm_skill`, When chạy răng ổ cắm trên cấu hình đó, Then nó KHÔNG coi đó là lỗi — ổ trung tính, khai hay không khai đều hợp lệ.
- AC-6: Given bộ quét vào phiên, When chạy nó trên repo này, Then nó không báo hồ sơ hỏng nào và bản đồ không lệch.
- AC-7: Given hợp đồng của hồ sơ `sua-test-do-thu-tu-nap`, When người đọc mục Notes của nó, Then có dòng nói AC-7 cũ bị vòng này thay thế, kèm slug thay thế.
- AC-8: Given cây làm việc hiện tại, When chạy tác vụ lint và tác vụ kiểm kiểu, Then cả hai xanh.

## Coverage

Hai trục. Không quét hình thái: không gian đúng bằng ba ổ cắm trong một file
cấu hình, đã đếm hết được.

- Trục ổ cắm: ổ khai thác — phải trung tính (AC-1, AC-5) | hai ổ thiết kế — phải có tên (AC-2, AC-3, AC-4) [thước CE: `commands/start.md` dòng 113-120 và chú thích ổ cắm trong `start-scan.mjs`]
- Trục chiều đo: chiều dương — cấu hình thật phải xanh (AC-2, AC-3, AC-6, AC-8) | chiều âm — gỡ ổ thiết kế phải đỏ (AC-4), khai ổ khai thác phải KHÔNG đỏ (AC-5) [thước CE: hai fixture dựng trong chính răng]

## Out of scope

- Không cắm skill nào vào ổ khai thác. Kit cố ý để trống, vòng này giữ nguyên ý đó.
- Không sửa văn bản AC-7 trong hợp đồng đã ký. Hồ sơ đó đã đóng; vòng này chỉ thêm một dòng thay-thế vào mục Notes của nó.
- Không chạy lại vòng chấm của hồ sơ cũ. Bằng chứng của nó đúng với cấu hình tại commit `b933334`.
- Không sửa hai commit của phiên khác. Chúng mang đuôi đồng-tác-giả trái luật kho, nhưng viết lại lịch sử đã đẩy là việc của người.

## Notes

Vòng này sinh ra từ một phép đo sai, không từ một tính năng thiếu. Nó cũng là
lần đầu hai phiên cùng ghi một cây làm việc: khoá bị gỡ lúc 07:21:00 bởi tiến
trình ngoài phiên này, và bản đồ tôi vẽ lại bị phiên đó commit kèm.

**Vòng chấm 1 trả PASS nhưng nêu hai điểm yếu của chính phép đo; cả hai đã sửa
TRƯỚC vòng 2, không phải sau một cái đỏ.**

- Bốn tiêu chí AC-2 đến AC-5 từng dùng chung một lệnh, một mã thoát. Nay răng
  tách thành ba chân riêng, mỗi tiêu chí một mã thoát của nó.
- Chiều đỏ chỉ gỡ `ui_standards_skill`. Nay gỡ từng ổ một, và AC-4 nói rõ là
  hai cấu hình dựng sẵn.
- Lỗi tôi TỰ GÂY RA khi viết bản mở rộng vòng 2, và người chấm bắt được trước
  khi nó ra khỏi cửa: `grep -v ds_skill` gỡ CẢ HAI dòng, vì `ds_skill` là chuỗi
  con của `ui_standards_skill`. Nó KHÔNG có ở vòng 1 — chiều đỏ vòng 1 chỉ dùng
  mẫu `ui_standards_skill`, và mẫu đó gỡ đúng một dòng. Bản ghi trước của mục
  này nói ngược lại; câu đó sai và đã sửa. Răng nay tự đếm số dòng bị gỡ và kêu
  nếu khác 1.
