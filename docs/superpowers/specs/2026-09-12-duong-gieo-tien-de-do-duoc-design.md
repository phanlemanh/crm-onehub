# Đường gieo tiền đề đo được — ba eval «không đo được» của ba hồ sơ đã ký

2026-09-12 · phạm vi: `crm-onehub` · kit KHÔNG đổi một dòng

## Vấn đề

Ba eval máy của ba hồ sơ **đã signed-off** thoát mã 2 «không đo được» vì thiếu
tiền đề, nên làn ghim lại từ chối ghi và cổng trước-merge chặn PR #35:

| Hồ sơ | Eval | Răng nói |
|---|---|---|
| `man-cai-dat-noi-tieng-viet` | E5 | `tien de thieu — chua co ty gia nao · chua deal nao co so tien` |
| `agent-builder-noi-tieng-viet` | E7 | `2 route can mot ban ghi that ma cach gieo CHUA CHOT` |
| `cai-dat-con-lai-noi-tieng-viet` | E9 | `theoDoi.domains[].host khong tra ve gia tri nao — tap quan sat rong` |

Ba nguyên nhân KHÁC nhau, chung một hình dạng: **vật để đo chưa bao giờ tồn tại
trên cây đang chạy.** Không cái nào là lỗi sản phẩm.

## Không làm gì (đã cân nhắc và loại)

- **Một fixture-lane tổng dùng chung cho mọi răng.** Ba nhu cầu không chung hình;
  lane chung thành chỗ mọi răng sau dựa dẫm — đúng lớp «đo trước khi vật đủ
  hình». YAGNI.
- **Thêm năng lực tạo workspace cho sản phẩm** để E5 có màn trống. Dựng
  multi-tenancy để đo một ô trống là ngược ưu tiên; E5 không cần workspace thứ
  hai, nó cần trạng thái CÀI MỚI — đường đó đã có.
- **Cho E7 đi luồng hội thoại thật** (gọi LLM sinh tác nhân). Trung thành nhất
  với «vật thật» nhưng phi tất định và tốn tiền mỗi lượt ghim, trong khi thứ
  E7 đo là chuỗi giao diện của route, không phải năng lực sinh tác nhân.
- **Hạ `do_san_duoc` của E9 xuống `false`.** Rẻ hơn nhưng là lời khai lùi để
  khớp thực tế; thêm một dòng seed giữ lời khai thành thật.
- **Khai giới hạn rồi cho qua cả ba.** Luật kit cấm: «chỗ không biến được → khai
  giới hạn»; cả ba đều biến được, và rẻ.

## Ba thay đổi

### 1. E5 — làn trạng thái cài mới

Răng `man-that.mjs trang-thai-rong` cần workspace chưa có tỷ giá và chưa deal nào
có số tiền. `seed.ts` luôn đổ đầy cả hai (`seedRates`, `seedDeals`), và kho chạy
một workspace duy nhất, nên trên cây thường trạng thái ấy không tồn tại.

**Đã kiểm:** `prisma migrate reset` KHÔNG có cờ `--skip-seed` (chỉ `-h · --config
· --schema · -f/--force`), và `prisma.config.ts` treo hook `seed` nên mọi reset
đều seed lại. `prisma db push --force-reset` CÓ tồn tại và không chạy hook đó.

Thêm script `db:reset-trong` vào `packages/db/package.json`, đi qua đúng lưới
`require-local-db.ts` như mọi lệnh DB khác (chốt chỉ chạy trên host local):

    "db:reset-trong": "bun scripts/require-local-db.ts db:reset-trong && prisma db push --force-reset --accept-data-loss"

Làn của eval: `db:reset-trong` → `dev-session.ts` lấy cookie → chạy răng →
`db:reset` trả cây về trạng thái seed đầy.

Đây là trạng thái NGÀY MỘT của người dùng thật, không phải trạng thái bịa.

### 2. E7 — gieo hai bản ghi tối thiểu trong lượt chạy

Hai route `/agents/[agentId]` và `/chat/[chatId]` cần một bản ghi thật để render.
**Đã kiểm** trường bắt buộc:

- `AgentDefinition`: `name`, `createdById`, `updatedAt`
- `AgentConversation`: `userId`, `updatedAt`

Răng gieo một bản ghi mỗi loại bằng Prisma NGAY TRONG lượt chạy, gắn vào user mà
`dev-session.ts` vừa tạo, và xoá trong `finally`. Không chép tay, không fixture
tĩnh — đúng luật «fixture phải do code sinh trong chính lần chạy».

**Giới hạn khai có tên** (vào mục Known limits của hồ sơ): bản ghi gieo thẳng qua
Prisma, KHÔNG đi qua luồng hội thoại sinh tác nhân. Cái E7 đo là chuỗi giao diện
của route — luồng sinh nằm ngoài phạm vi đã khai của hồ sơ này.

### 3. E9 — một dòng vào `seed.ts`

Bảng `du-lieu-nguoi-nhap.json` khai `theoDoi.domains[].host` là `do_san_duoc:
true`, nhưng **đã kiểm**: `seed.ts` chưa bao giờ tạo `TrackedDomain` nào (30 dòng
nhắc «domain» trong seed đều là domain email/công ty).

Giả thuyết ban đầu — răng đọc trạng thái cũ trước khi gieo — **đã bị bác** bằng
đọc mã: chân gieo-thử (dòng 651–707) cố ý dọn ngay sau khi gieo vì nó đo NĂNG LỰC
gieo qua API; chân `do_san_duoc` (712+) là phép đo CÓ SẴN, tách hẳn. Thứ tự đúng
như thiết kế.

`TrackedDomain` chỉ bắt buộc một trường (`host`). Thêm một `upsert` vào `seedRates`
hoặc một hàm `seedTracking` nhỏ gọi từ `main()`.

## Chiều đỏ — mỗi thay đổi một phép phá

Không phép đo nào được nhận là xong nếu chưa chạy chiều đỏ (luật kit: xanh phải
từng chạy chiều đỏ; assertion âm-tính-một-mình không sống).

| Thay đổi | Chiều xanh | Chiều đỏ phải chạy thật |
|---|---|---|
| E5 | trên cây `db:reset-trong`, răng tìm được ô trống → exit 0 | trên cây seed ĐẦY, đúng răng ấy phải KHÔNG báo trống — nếu nó vẫn xanh thì nó không phân biệt được trống với đầy |
| E7 | hai route render, chuỗi vi/en đối chiếu được → exit 0 | xoá một trong hai bản ghi → đúng route đó quay lại `CHUA DO DUOC`, gọi đúng tên route |
| E9 | `theoDoi.domains[].host` trả giá trị, ô chấm được → exit 0 | gỡ dòng seed → E9 quay lại mã 2 với đúng câu `tap quan sat rong` |

## Phạm vi không chạm

- **Kit** (`acceptance-gate-kit`): không đổi. Mọi thứ ở đây là `crm-onehub`.
- **Hợp đồng đã ký** của ba hồ sơ: không sửa tiêu chí. Chỉ thêm mục Known limits
  cho E7 — thêm lời khai giới hạn, không nới tiêu chí.
- **E8/E16 của `cai-dat-con-lai`** (bảng khai trôi khỏi màn) và **E5/E7 của
  `chu-mac-dinh`** (đối chứng dương gãy): KHÁC lớp, không thuộc spec này.
- Mã sản phẩm trong `apps/`: không đổi dòng nào. Thay đổi nằm ở
  `packages/db/prisma/seed.ts`, `packages/db/package.json`, và răng trong
  `_acceptance/`.

## Xong là gì

Ba eval thoát 0 trên cây sạch; làn ghim lại chạy được cho ba hồ sơ; cổng
trước-merge của PR #35 từ 7 xuống còn 4 vi phạm.
