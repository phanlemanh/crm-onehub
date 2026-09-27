# Morphological scan — tac-nhan-model-rieng

Preset `test-matrix`, trục dựng lại theo bài toán. Ba trục của preset không khớp:
«surface», «role» và «mạng» không phải chiều độc lập ở đây. Chỉ có một actor là
tác nhân, và không có màn nào thay đổi.

## Ngữ cảnh

- Sản phẩm: OneHub Center, CRM nội bộ; khu Tác nhân chạy trên eve 0.29.4.
- Chân sản phẩm: đào repo.
  - Lần thử 27/09 [SUY-TỪ-REPO: docs/reports/2026-09-26-tro-ly-okr/tac-nhan-hien-nay.md].
  - Luật chọn viên gạch [SUY-TỪ-REPO: docs/agent.md].
- Chân ngành:
  - Vercel AI Gateway định tuyến một mã model tới nhiều nhà cung cấp và đẩy lỗi của nhà cung cấp về nguyên văn. Thấy trong lỗi 400 ngày 27/09: `providerAttempts` gồm vertex và google [SUY-TỪ-REPO: tac-nhan-hien-nay.md].
  - Khai báo hàm của Gemini nhận một tập con của OpenAPI, không nhận vòng tham chiếu bắt buộc [NGÀNH: Google Gemini API — function declarations]. Thông điệp 400 «ref loops are only supported if…» là bằng chứng trực tiếp.

## Trục

- **Trục A · Khuôn model thấy:** đầu vào công cụ của gốc | đầu vào công cụ của bộ dựng | đầu vào công cụ của bộ chạy | khuôn kết quả của `subagent`.
  [thước CE: danh sách tệp `agent/tools/*.ts`, `agent/subagents/*/tools/*.ts`, `agent/subagents/*/agent.ts` — SUY-TỪ-REPO]
- **Trục B · Nhà cung cấp:** Google | z.ai | OpenAI.
  [thước CE: danh mục Gateway đọc 27/09; ô chọn model chỉ bày model có `tool-use` (docs/agent.md mục Model)]
- **Trục C · Kết cục của bộ chạy:** nộp kết quả | báo lỗi giữa chừng | phiên xong mà chưa nộp | gốc hỏng lượt | bị huỷ.
  [thước CE: các nhánh `session.completed`, `turn.failed`, `turn.cancelled` của `channels/crm.ts`; N0 phép 6c]
- **Trục D · Model trong Cài đặt:** đặt X | để mặc định | đổi từ X sang Y sau khi Tác nhân đã dựng.
  [thước CE: `packages/db/src/settings.ts`; `builder-runtime.ts` ghi model của bản]

## Core

1. A (mọi giá trị) × khuôn không có vòng tham chiếu — một phép quét tĩnh chặn cả lớp lỗi, không cần khoá. → AC-1
2. A = bộ chạy × B (cả ba) — gọi thật, vì chỉ nhà cung cấp mới nói được có nhận hay không. → AC-2
3. Khuôn kết quả phẳng: phẳng thì lưu nguyên, lồng thì bị từ chối kèm lời báo. → AC-3
4. C = báo lỗi giữa chừng → «Hỏng» ngay, mang lý do. → AC-4
5. C = phiên xong mà chưa nộp → «Hỏng»; C = nộp → «Xong» (đối chứng). → AC-5
6. D = đổi X sang Y sau khi dựng → lượt mới chạy Y, lượt ghi Y, bản vẫn ghi «dựng bằng X». → AC-6
7. D = đặt X | mặc định × gốc, bộ dựng, bộ chạy — một bộ giải theo vai. → AC-7
8. Tài liệu và chỗ rẽ có tên. → AC-8

## Later

- B × gốc và bộ dựng gọi thật: khuôn của hai vai này đã chạy được trên Gemini 27/09, và phép quét tĩnh AC-1 đã phủ lớp lỗi.
- Một ô Cài đặt riêng cho vai Tác nhân: chỉ làm khi có bằng chứng hai vai cần hai model.
- D = đọc Cài đặt hỏng → rơi về model mặc định không có ZDR. Đã biết từ trước; sửa cùng lượt ZDR.

## Never

- C = gốc hỏng lượt, và C = bị huỷ — đã có đường đóng lượt (`turn.failed`, `turn.cancelled`); vòng này không đổi hai đường đó.
- Chọn model theo từng Tác nhân — trái nguyên tắc model là hạ tầng.

## Cross-cutting áp mọi ô Core

- Mỗi phép đo mới có cặp hai chiều trên cùng một fixture, và thông điệp đỏ phải ghim.
- Không migration: cột `modelId` của bản giữ làm thông tin «dựng bằng».
