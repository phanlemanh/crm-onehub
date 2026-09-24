# claimDue trong bài test chỉ thấy dòng của chính nó — design

Ngày: 2026-09-24 · Hạng: T2 · Hồ sơ: `_acceptance/claimdue-chi-thay-dong-cua-minh/`

## Vấn đề

Lượt CI đầu tiên của PR #98 (run 35879017470, commit `175e61fd`, chỉ đổi tài
liệu) đỏ ở `agent#test`. Ba bài trong `describe("claimDue")` của
`apps/agent/test/tasks.integration.spec.ts` hỏng:

| Bài | Mong | Nhận |
| --- | --- | --- |
| claims due work and leases it | danh sách chứa dòng của bài | 10 dòng lạ |
| does not hand the same row to two dispatchers (dòng 79) | 3 | 6 |
| leaves work that is not due yet | 0 | 6 |

Chạy lại thì xanh. Bước kiểm trước khi đẩy ở máy cũng xanh.

## Nguyên nhân (đã chứng từ log CI, không đoán)

1. **Không phải chạy song song.** `test-run.ts` gọi `turbo run test
   --concurrency=1`, còn `bun test` chạy các file của một gói lần lượt trong một
   tiến trình. Chạy riêng từng file agent đúng thứ tự CI trên cơ sở dữ liệu của
   lượt: không file nào để lại dòng `AgentTask`.
2. **Dòng lạ do tiến trình khác tạo.** Mã cuid của dòng lạ
   (`cmue8o2vz04y2 6c2g …`) mang dấu tiến trình `6c2g` và bộ đếm khoảng 6.410,
   còn dòng của bài test mang dấu `iy2g`. Mốc thời gian trong mã cho thấy dòng lạ
   được tạo sớm hơn khoảng 15 giây, tức trong lúc `api:test` đang chạy.
3. **Người ghi là lượt quét ngầm sau đăng nhập của API.**
   `apps/api/test/go-la-cat-quyen.spec.ts` đăng nhập thật bằng
   `auth.api.signInEmail`. Hook `session.create.after` gọi `notifySignedIn`,
   rồi `BackfillService.auto()` chạy một lượt quét kiểu `void (async …)()`:
   xếp một dòng `identify` (độ ưu tiên `sweep` = 50, đến hạn ngay) cho mọi liên
   hệ chưa được tìm hiểu đang có trong cơ sở dữ liệu lúc đó. Log lần đỏ ghi
   `Backfill queued { kind: 'identify', queued: 11 }` hai lần — 22 dòng. Không
   bài test nào sở hữu các dòng này, và `AgentTask.contactId` không có khoá
   ngoại, nên xoá liên hệ không kéo theo dòng.
4. **Số khớp đúng.** 22 dòng, ưu tiên 50 cao hơn 0 của bài test. Bài 1 bị chiếm
   10 dòng lạ (giới hạn 10, dòng của bài xếp sau). Bài 2 nhận 3 + 3 dòng lạ = 6.
   Bài 3 nhận 6 dòng lạ còn lại. 10 + 6 + 6 = 22. Ở máy, lượt quét chạy khi
   không có liên hệ nào nên xếp 0 dòng — vì thế máy xanh.

Gốc lỗi của bài test: `claimDue(n, { except: DIRECT_KINDS })` nhận **mọi** dòng
nghiên cứu đến hạn trong bảng, không riêng dòng bài vừa tạo. Cơ sở dữ liệu dùng
chung trong một lượt, nên bất kỳ ai để lại một dòng nghiên cứu đến hạn cũng làm
nó đỏ. Issue trycompai/crm#195 của hãng đã nêu đúng điểm này, và vẫn mở.

## Phương án

**Chọn: lọc theo dấu riêng.** Các lời gọi `claimDue` trong ba khối
`claimDue` · `retireExhausted` · `completeTask` đổi `RESEARCH` thành
`{ only: [kind] }`, với `kind = "test-lease"` là loại chỉ file này dùng. Bài
test chỉ thấy dòng của chính nó **bằng cấu trúc**, bất kể ai ghi gì trước hay
trong lúc nó chạy. Vẫn đi qua đúng một hàm `claimDue` của sản phẩm, chỉ khác
nhánh lọc.

Phương án bị loại:

- **Dọn cả bảng trong `beforeEach`.** Chỉ đúng tại thời điểm bắt đầu bài. Nó dựa
  vào giả định không ai ghi trong lúc bài chạy, trong khi lượt quét ngầm chính
  là việc ghi không chờ ai. Cách này còn xoá dòng của người khác nếu có ngày các
  gói chạy chồng nhau.
- **Chặn lượt quét ngầm trong test api.** Đúng là đường rò, nhưng nó chỉ bịt một
  nguồn. Bài test vẫn mong manh trước nguồn kế tiếp. Việc này tách thành việc
  riêng (Ngoài phạm vi).

Khối `a limited lock subquery…` giữ `RESEARCH`: nó tự xoá cả bảng ngay trong
bài (`staleStatistics`) rồi mới gọi `claimDue`, và nó đo hành vi của planner
trên đúng câu lệnh CI đã cắn. Đổi nhánh lọc ở đó là đổi thứ bài đang đo.

Nhánh `except` của `claimDue` vẫn có người giữ: `lanes.integration.spec.ts` gọi
`claimDue(10, { except: DIRECT_KINDS })` với độ ưu tiên cộng 1.000.000.

## Cách chứng minh

Thước đo đặt ở `_acceptance/claimdue-chi-thay-dong-cua-minh/rang/`, chạy trong
cơ sở dữ liệu riêng của một lượt `bun run test`.

- **Hàng xóm ồn ào.** Một file nạp trước (preload) chèn dòng lạ trước **mỗi**
  bài: 22 dòng `identify` đến hạn đúng hình CI, cộng dòng loại hiển thị, dòng
  chưa đến hạn, ưu tiên cao hơn mọi dòng của bài. Sau mỗi bài nó kiểm không
  dòng lạ nào bị cho thuê hay bị tăng `attempts`. Chiều lành: file thật → 0
  bài hỏng, 0 dòng lạ bị động. Chiều phá: bản sao đổi `{ only: [kind] }` về
  `RESEARCH` → đỏ, và ba bài của CI có tên trong danh sách hỏng.
- **Cùng lượt với các file ghi `AgentTask`.** Trong một cơ sở dữ liệu của lượt,
  gieo 22 dòng hình CI rồi chạy `tasks.integration.spec.ts` cùng các file agent
  ghi `AgentTask` (lanes, stale-tasks, close-task, keyless-brand, enrichment,
  log-loi-hoi-thoai, nhac-ke-hoach, nhac-qua-zalo, slack-membership) theo ba
  thứ tự — tasks đầu, tasks giữa, tasks cuối — lặp năm lần, cộng một lượt chung
  một tiến trình. Chiều lành: 0 hỏng. Chiều phá: bản sao hỏng đỏ ngay lượt đầu.

Bản sao phá sống trong thư mục tạm (`mktemp -d`) với liên kết mềm sang
`apps/agent/agent` và `node_modules`, không bao giờ nằm trong cây thật —
thước S4 chạy song song cùng cây.
