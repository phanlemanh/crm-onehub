## Trong hợp đồng

(rỗng — vòng này scope-triage không chạy được nên không finding nào được xếp vào hợp đồng.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Xoá 19 component nhưng không sửa bảng đăng ký ở docs/chat-ui.md — chính doc đó bắt sửa bảng trước**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ vẫn liệt kê các thành phần đã bị xoá khỏi kho, nên người đọc theo tài liệu này có thể đi tìm nhầm thứ không còn tồn tại.
  file: `docs/chat-ui.md`
  severity: medium
  Đề xuất: known-limits

- **Vòng dựng răng chống mồ côi lại đẻ ra một tệp mồ côi mà chính răng đó không nhìn thấy**
  Người dùng thấy gì: Một tệp mã mới được thêm vào nhưng hiện chưa nơi nào trong ứng dụng dùng tới; nếu việc kết nối nó vào màn thật bị bỏ dở, tệp này có thể nằm im trong kho mà không ai phát hiện, giống các tệp cũ vừa được dọn.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: medium
  Đề xuất: known-limits

- **gate-shape.json: lý do miễn pham-vi-diff khỏi cổng sai sự thật ở cả hai vế, và không có gì bắt được**
  Người dùng thấy gì: Lý do ghi trong cấu hình cổng để miễn kiểm tra phạm vi cho một bước không còn đúng với thực tế hiện tại; điều này không làm sai kết quả hôm nay nhưng khiến hồ sơ khó tin cậy nếu có người đọc lại sau này.
  file: `.githooks/gate-shape.json`
  severity: medium
  Đề xuất: known-limits

- **ConversationDownload thu hồi blob URL ngay sau click — tải im lặng không xảy ra trên Firefox/Safari**
  Người dùng thấy gì: Nút tải xuống hội thoại có thể không hoạt động trên một số trình duyệt như Firefox và Safari — bấm vào nhưng không có tệp nào được tải về và không có thông báo lỗi. Tính năng này chưa được gắn vào màn hình thật nên chưa ai gặp phải.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: low
  Đề xuất: known-limits

- **suite_keys mất check_types_khong_cache ở cấp kho — mọi vòng nghiệm thu sau không còn đo kiểu**
  Người dùng thấy gì: Một thay đổi cấu hình đo lường ở cấp toàn bộ kho đã tắt bước kiểm tra kiểu dữ liệu cho mọi tính năng chạy sau này, không riêng tính năng này. Quyết định này đã được ghi nhận có chủ đích kèm hẹn xem lại, nhưng nếu không ai nhớ quay lại sửa, lỗi kiểu dữ liệu ở nơi khác có thể lọt qua vòng nghiệm thu.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ

### Schema mới ở biên khai lỏng hơn dữ liệu thật — `url` là z.string() trần trong khi module anh em ép http(s)

- file: `packages/validation/src/agent-transcript.ts:9`
- severity: medium
- source: conventions

`packages/validation/src/agent-transcript.ts:8-12` khai:

```ts
export const source = z.object({
	url: z.string(),
	title: z.string(),
	network: z.enum(["linkedin", "github", "web"]),
});
```

Hai lối đã có sẵn trong chính kho, cả hai chặt hơn:
- `packages/validation/src/eve-tool.ts:21-27` — mọi đường dẫn đi qua `const link = z.string().regex(/^https?:\/\//).nullable().catch(null)`.
- `packages/validation/src/agent-manifest.ts`, tệp mà `AGENTS.md` gọi là khuôn mẫu — `z.string().trim().min(1).max(120)`.

`AGENTS.md` mục "Parse at the boundary" viết: "The schema describes what is **actually stored**, not the loosest thing that parses." Ở đây nguồn sinh duy nhất là `sourcesOf()` (`apps/app/lib/agent-transcript.ts:305-313`), và nó chỉ lấy `result.sourceUrl / profileUrl / url` — ba trường đã qua `link`, tức đã chắc chắn http(s). Vậy schema mới lỏng hơn hẳn dữ liệu nó mô tả.

Hệ quả không phải hôm nay (chưa gì render `sources`) mà ở Phase 5: `docs/chat-ui.md` xếp `sources`/`inline-citation` là việc sắp làm, và lúc `url` thành `href` thì `javascript:` qua biên không ai chặn.

Cùng lớp, nhẹ hơn: `id`, `tool`, `label`, `text` đều là `z.string()` trần, không `.trim().min(1)`, nên một `id` rỗng — thứ không thể tồn tại vì `partId()` luôn ghép chuỗi — vẫn parse xanh.

### so-lech-chuan.mjs: process.exit trong try làm finally không bao giờ chạy — sân tạm rò trên mọi đường "KHÔNG ĐO ĐƯỢC"

- file: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs:257`
- severity: medium
- source: bugs

Khối `try` (dòng 231-259) dọn sân tạm bằng `finally { rmSync(san.tam, ...) }`, nhưng cả ba nhánh lỗi trong khối đó — `san.chay.error` (dòng 234), `san.chay.status !== 0` (dòng 240), CLI không ghi file (dòng 250) — đều gọi `boCuoc()` và `boCuoc` kết thúc bằng `process.exit(2)`. Trong Node, `process.exit()` chấm dứt tiến trình ngay, KHÔNG chạy `finally`. Đã xác minh bằng script tối thiểu: `try { process.exit(3) } finally { console.log("FINALLY RAN") }` in ra "in try" rồi thoát 3, không in "FINALLY RAN".

Kịch bản hỏng: máy CI (hoặc máy Mạnh) mất mạng giữa chừng → `bunx --bun ai-elements@latest add` thoát khác 0 → boCuoc → exit 2 → thư mục `os.tmpdir()/so-lech-chuan-XXXX` (kèm `components.json`, `package.json`, `tsconfig.json`, và mọi tệp CLI đã kịp ghi) nằm lại. Mỗi lần chạy lại tạo một thư mục mới; không có gì dọn, không có cảnh báo. Chạy tay 20 lần trong một phiên nghiệm thu mạng chập chờn để lại 20 sân tạm.

Sửa: đổi `boCuoc` trong phạm vi khối này sang `throw`, bắt ở ngoài sau khi `finally` đã chạy; hoặc gọi `rmSync(san.tam, {recursive:true, force:true})` ngay trước mỗi `boCuoc`; hoặc đăng ký dọn bằng `process.on("exit", ...)`.

(Bằng chứng cụ thể: round này, chính hai lần gọi `bunx ai-elements@latest add` — cho E7 và cho E12 — đều thoát khác 0 vì lỗi liên kết dependency; theo đúng đường lỗi ở trên, mỗi lần gọi hỏng đó nhiều khả năng đã để lại một sân tạm chưa dọn trên máy chạy verify vòng này.)

## Chưa adversarial-verify (refuter chết)

(rỗng — không có finding nào đánh dấu unverified trong vòng này.)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
