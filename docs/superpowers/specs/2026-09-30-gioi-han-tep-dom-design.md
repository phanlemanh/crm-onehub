# Giới hạn thời gian mỗi tệp DOM và in thời lượng — thiết kế

Ngày: 2026-09-30 · Hạng: T2 · Hồ sơ: `_acceptance/gioi-han-tep-dom/`

## Chuyện gì đã xảy ra

Job CI «check-types, lint, test» của PR #222 (run 36724007135, lượt 1) bị cắt ở trần
20 phút. Giả thuyết ban đầu: một tệp `*.dom.tsx` treo trên Linux, vì trình chạy từng tệp
(`packages/ui/test/chay-tung-tep-dom.ts`) gọi `spawnSync` không có giới hạn.

Đọc log của lượt bị cắt và lượt xanh ngay trước nó (run 36721133755, cùng nhánh, cùng hai
tệp DOM mới) thì giả thuyết không đứng:

- `bun run test` gọi `turbo run test --concurrency=1` (`packages/db/scripts/test-run.ts:84`).
  Các gói chạy **nối tiếp**, và turbo xả log một gói khi gói đó xong. Mốc giờ của mỗi nhóm
  log vì vậy là giờ gói đó kết thúc, và gói kế bắt đầu ngay sau.
- Lượt xanh: bước test 15m17s. `api:test` xong 13:35:32, `agent:test` 13:37:32, `app:test`
  13:40:54 — `app:test` chạy **3m22s**. Tổng thời lượng bun báo cho 83 lượt chạy trong
  `app:test` là 200 giây, khớp.
- Lượt bị cắt: `agent:test` xong 13:54:32, `api:test` 14:01:56, job bị cắt 14:06:01. Lúc bị
  cắt, `app:test` mới chạy **khoảng 4 phút**, không phải 16. Cả lượt chậm hơn lượt xanh chừng
  25–50% (`check-types` 2m35s so với 1m42s; `api:test` 7m24s so với 6m35s).
- Hai tệp nghi vấn đều chạy xanh trên Linux ở lượt xanh: `deals-giai-doan-hydrat.dom.tsx`
  1,4 s, `okr-sua-an-chu-ky.dom.tsx` 4,0 s. Cả hai tháo cây React ở `afterEach`, không đặt
  `setInterval`.
- Thử trên máy: `bun test` thoát bình thường dù tệp để lại một `setInterval` mở. «Handle mở»
  không làm một tiến trình `bun test` treo; thứ làm treo được là một ca chặn đồng bộ.

Kết luận: job không treo mà **chạm trần do tổng thời lượng** — lượt bình thường đã ~19 phút
trên trần 20. Việc nới trần hay rút ngắn bộ test là việc riêng (xem «Ngoài phạm vi»).

## Vẫn đáng làm: trình chạy phải tự dừng và tự khai

Hai điểm yếu vẫn thật, dù không phải nguyên nhân lần này:

1. Một tệp treo thật sẽ đứng tới khi job bị cắt, và vì turbo gom log theo gói, log job bị
   cắt không in dòng nào của gói đó — không biết tệp nào.
2. Không có thời lượng từng tệp tính cả khởi động tiến trình, nên không thấy tệp nào đang
   phình.

## Thiết kế

**Cấu hình** — module mới `packages/ui/test/chay-dom-config.ts`, một đối tượng `CHAY_DOM`
nhóm theo mối quan tâm, đơn vị suy từ `SECOND_MS`/`MINUTE_MS`, `as const`
(theo `apps/agent/agent/lib/dispatch-config.ts`):

- `tep.tranMs` = 1 phút. Tệp chậm nhất trên CI hôm nay là 15,3 s (`the-gop-y-okr.dom.tsx`),
  nên 1 phút dư gấp bốn lần trên máy thường, gấp hơn hai lần rưỡi trên máy chậm 1,5 lần.
  Con số bị chặn trên bởi ngân sách job, xem «Ngân sách» dưới đây.
- `tep.maQuaGio` = 124 — mã thoát khi quá giờ, cùng quy ước với lệnh `timeout` của GNU.
- `tongKet.soTepChamNhat` = 5.

**Ngân sách.** `app:test` là gói cuối của chuỗi nối tiếp. Lượt xanh: nó bắt đầu ở phút
15:17 của job, còn 4m43s tới trần, bản thân chạy 3m22s — dư 1m21s. Trình chạy dừng ngay ở tệp
quá giờ, nên ca xấu nhất là tệp cuối treo: 3m22s + giới hạn. Với 1 phút là 4m22s, lọt trần và
tên tệp hiện trong log; với 2 phút là 5m22s, job bị cắt trước và tên mất cùng job. Lượt chậm như
36724007135 thì `app:test` bắt đầu ở phút 16m12s, vốn đã không đủ chỗ cho chính nó: **ở máy chạy
chậm, không giới hạn nào cứu được tên tệp** — chỉ nới trần hoặc rút ngắn bộ test mới cứu được.
Trong `packages/ui` (gói chạy sớm) còn nhiều ngân sách hơn.

**Trình chạy** — `chay-tung-tep-dom.ts` tách thành hàm `chayTungTep({ goc, co, tranMs, ghi, loi })`
trả mã thoát, cộng một đoạn `import.meta.main` gọi hàm với `CHAY_DOM.tep.tranMs` rồi
`process.exit`. Hai lệnh gọi hiện có (`packages/ui` `test`, `apps/app` `test:dom`) không đổi.

- Mỗi tệp: `spawnSync("bun", ["test", ...co, "./test/<tệp>"], { cwd: goc, stdio: "inherit",
  timeout: tranMs, killSignal: "SIGKILL" })`. Đo bằng `performance.now()` quanh lời gọi, tức
  tính cả khởi động tiến trình `bun` và `--preload`. Số bun tự báo (`Ran … [x]`) đã gồm nạp module
  của tệp test (đo ở S3: tệp ngủ 300 ms ở cấp module báo 306 ms); phần bun không báo là khởi động
  tiến trình và preload.
Dòng xanh, dòng tổng và dòng «chậm nhất» ra stdout; dòng đỏ, dòng quá giờ và dòng «không có
tệp» ra stderr. Số giây in một chữ số thập phân với dấu chấm.

- Xanh: in `chay-dom: test/<tệp> xanh sau <s> s`.
- Đỏ: in `chay-dom: test/<tệp> đỏ (mã <m>) sau <s> s`, thoát với mã đó (như hôm nay).
- Quá giờ (`error.code === "ETIMEDOUT"`, đã thử trên Bun 1.3.10: trả `signal: SIGKILL`):
  in `chay-dom: test/<tệp> quá <giới hạn> s — đã cắt tiến trình`, thoát 124. Dừng ngay, không
  chạy tệp sau — giống ca đỏ.
- Hết lượt xanh: in `chay-dom: <n> tệp xanh sau <s> s (giới hạn mỗi tệp <g> s)` rồi
  `chay-dom: chậm nhất — <tệp> <s> s · …` với năm tệp chậm nhất, xếp giảm dần.

Mã thoát khác 0 làm `app:test` kết thúc, turbo xả nhóm log của nó, nên tên tệp hiện trong
log CI thay vì mất cùng job.

**Đo** — `packages/ui/test/chay-tung-tep-dom.spec.ts`. Mỗi ca dựng một thư mục tạm chứa
`test/*.dom.tsx` tí hon, chạy hàm trong một tiến trình con (`bun -e`) bằng `spawn` bất đồng bộ
của `node:child_process`, `detached` để có nhóm tiến trình riêng, với đồng hồ riêng 30 s; hết
giờ thì giết cả nhóm (`process.kill(-pid)`), nên tiến trình cháu đang giữ pipe cũng chết. Mỗi
ca khai timeout 45 s, lớn hơn đồng hồ riêng. Nhờ vậy một bản trình chạy quên `timeout` làm ca
đỏ với thông điệp ghim, chứ không treo bộ test hay để lại tiến trình mồ côi. Tệp treo dùng
`Atomics.wait` có trần 60 s, dài hơn đồng hồ riêng — chặn đồng bộ, đồng hồ 5 s của `bun test` không cắt được, đúng
hình dạng của một ca treo thật. Tệp thứ ba của mỗi thư mục ghi một tệp dấu khi chạy, để «không
được chạy» đo bằng tệp dấu vắng mặt chứ không bằng một dòng log vắng mặt.

## Ngoài phạm vi

- `.github/workflows/ci.yml` (trần 20 phút) — CI của hãng, không sửa ở kho này.
- Rút ngắn tổng thời lượng: bỏ `--concurrency=1`, chia job, gộp tệp DOM. Mỗi hướng có hệ
  quả riêng (kho thử dùng chung giữa các gói) và cần vòng riêng.
