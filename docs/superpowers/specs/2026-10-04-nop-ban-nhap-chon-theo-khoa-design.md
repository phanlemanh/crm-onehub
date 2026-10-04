# Các ca của nop-ban-nhap chọn dòng theo khoá bản nháp — design

Ngày: 2026-10-04 · Hồ sơ: `_acceptance/nop-ban-nhap-chon-theo-khoa/` · Hạng T2 · không chạm UI

## Hiện tượng

CI run 37169842118 (PR #240, nhánh `feat/soan-okr-song-lai`) đỏ một lần ở
`apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`, ca «Mục tiêu đã nhận: đổi tên qua chat
không tạo dòng thứ hai cùng khoá…». Kỳ vọng `giu` có một mục khoá `m1` trạng thái `nhan`; nhận
`giu: []`, và `m1` có thêm tên «Đối tác miền Bắc gắn bó thêm hai năm». PR đó không chạm
`apps/agent-okr` hay `packages/ai-okr`; 25 lượt CI trước ca này đều xanh.

## Nguyên nhân (đã đo)

1. `nopBanNhap` (`apps/agent-okr/agent/lib/nop-ban-nhap.ts`) ghi mọi dòng của một lần nộp bằng
   MỘT `createMany` trong một `$transaction`. Cột `createdAt` là
   `TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP` — giờ bắt đầu transaction — nên mọi dòng của một lần
   nộp mang cùng một giá trị. Đo: lần nộp `tron()` ghi 13 dòng, 13 dòng có đúng 1 mốc `createdAt`.
2. Ca chọn «Mục tiêu đầu tiên» bằng `findFirstOrThrow({ …, orderBy: { createdAt: "asc" } })`. Hai
   Mục tiêu đang chờ (`m1`, `m3`) bằng nhau về `createdAt`, nên Postgres trả theo vị trí vật lý
   của bản ghi, không theo thứ tự ghi.
3. Vị trí vật lý đổi được mà không ai chạm dữ liệu logic: trang đầy giữa chừng, autovacuum trả
   chỗ trống, hay một lần cập nhật không-HOT dời bản ghi sang trang khác. Khi đó ca đánh dấu `m3`
   là «nhan» thay vì `m1` → lần nộp đổi tên ghi thêm một dòng `m1` và `giuNguyen` không có `m1`
   — đúng chữ ký CI.

Tái hiện: chạy cả tệp 15 lần bằng Bun 1.3.12 (như CI) → đỏ 1 lần, đúng ca này. Tất định: xếp lại
bảng để `m3` đứng trước `m1` (mục «Đo») → ca đỏ đúng chữ ký CI.

## Cách sửa

Một hàm chọn Mục tiêu đang chờ theo khoá bản nháp, đọc khoá bằng `dongSoanTuHang` (bộ đọc sản
phẩm dùng, parse `noiDung` qua schema). Nguyên văn:

```ts
async function mucTieuChoTheoKhoa(cuocSoanId: string, khoa: string) {
	const hang = await db.okrDeXuat.findMany({
		where: { cuocSoanId, loai: "muc-tieu-moi", trangThai: "cho" },
	});
	const ra = hang.find((h) => dongSoanTuHang(h).khoa === khoa);
	if (!ra) throw new Error(`thieu muc tieu ${khoa}`);
	return ra;
}
```

Ba chỗ sửa trong spec (khối mới / khối cũ khớp nguyên văn bởi bảng `CA` của
`rang/dao-thu-tu.mjs`):

| Ca | Mới | Cũ (onehub 0b8540c1) |
| --- | --- | --- |
| «Mục tiêu đã nhận…» (`nhan`) | `const m1 = await mucTieuChoTheoKhoa(cuoc.id, "m1");` | `findFirstOrThrow({ where: { cuocSoanId: cuoc.id, loai: "muc-tieu-moi", trangThai: "cho" }, orderBy: { createdAt: "asc" } })` |
| «nộp lại dòng có khoá đã bác…» (`bac`) | `const m1 = await mucTieuChoTheoKhoa(canh.cuocSoanId, "m1");` | `findFirstOrThrow({ where: { cuocSoanId: canh.cuocSoanId, loai: "muc-tieu-moi", trangThai: "cho" } })` — không `orderBy` |
| cùng ca, `dich("m3:cc")` (`dich`) | `findMany` các dòng `can-chinh-moi` thêm `orderBy: [{ createdAt: "asc" }, { id: "asc" }]` | không `orderBy`, rồi `.at(-1)` để lấy dòng mới nhất |

Ca `dich`: dòng `m3:cc` có ở ba lần nộp (lần `tron()` của ca đầu, đích `id-la` bị loại, và hai lần
nộp `lai`, đích là KR). `.at(-1)` muốn dòng mới nhất, nhưng không có `orderBy` thì «cuối» là vị trí
vật lý. Các lần nộp khác nhau có `createdAt` khác nhau, nên sắp theo `createdAt` là đủ; `id` chỉ
để thứ tự luôn toàn phần.

Phương án đã loại:

- Thêm khoá phụ `{ id: "asc" }` cho ca `nhan`: `id` là `cuid()` do query engine sinh; thứ tự của nó
  trong một `createMany` là chi tiết hiện thực, không phải hợp đồng — ca vẫn chọn «dòng đầu» thay
  vì chọn «dòng `m1`» mà nó muốn.
- Lọc JSON `noiDung: { path: ["khoa"], equals: "m1" }`: đọc khoá bằng đường dẫn JSON thô, lệch luật
  «parse ở biên» của kho.

## Mã sản phẩm: không đổi

`docDaQuyet` trong `nop-ban-nhap.ts` đã sắp `[{ createdAt: "asc" }, { id: "asc" }]`: hai dòng
cùng `createdAt` luôn ra theo `id`, nên kết quả của nó xác định với cùng một tập dòng — không phụ
thuộc vị trí vật lý. Mã sản phẩm không có chỗ nào khác trong đường nộp sắp theo `createdAt`.

Điều design này KHÔNG khẳng định: rằng hai dòng của một lần nộp không bao giờ tranh nhau một khoá.
Schema `banNhap` (`packages/validation/src/okr-cuoc-soan.ts`) không chặn hai Mục tiêu (hay hai KR
cùng cha) trùng `khoa`; `chanTrungKhoa` chỉ chặn trùng `khoaDong`, mà `khoaDong` của Mục tiêu/KR
là tên chuẩn hoá chứ không phải khoá. Một bản nháp như thế sinh hai dòng cùng `khoaModel` và cùng
`createdAt`; `docDaQuyet` khi đó giữ dòng có `id` nhỏ hơn — xác định, nhưng không phải «dòng ghi
trước». Đó là khe kiểm đầu vào của sản phẩm, không phải nguồn đỏ chập chờn, và nằm ngoài hồ sơ
này (Out of scope; đã mở việc riêng).

## Rà các ca cùng mẫu

Phạm vi: `apps/agent-okr/test` và mọi `packages/<gói>/test`. Hai mẫu máy quét được:
(A) `orderBy: { createdAt` đứng một mình, (B) `findFirst`/`findFirstOrThrow` không `orderBy`. Mẫu
thứ ba — `findMany` không `orderBy` rồi lấy theo vị trí (`.at(…)`, `[0]`) — máy không quét
được cho chắc, nên rà bằng mắt trên `nop-ban-nhap.integration.spec.ts` và các spec `agent-okr`
khác có `findMany` (`app-rieng`, `hong-chen`: chỉ dùng `filter`/`every`/`length`).

Ba chỗ đã sửa: xem bảng «Cách sửa».

Mười một chỗ còn lại, đúng danh sách `DA_RA` của `rang/quet-mau.mjs`:

| Tệp · lời gọi | Mẫu | Thứ tự có quyết định kết quả? |
| --- | --- | --- |
| spec, ca «bản nháp trộn»: `findMany({ where: { cuocSoanId: canh.cuocSoanId }, orderBy: { createdAt: "asc" } })` | A | Không: mọi phép so dùng `every`, `filter().length`, hay `sort()` |
| spec, ca «dòng trùng khoá…» (`krCho`): `findFirstOrThrow({ where: { …, loai: "kr-moi", sau: ten, trangThai: "cho" }, orderBy: { createdAt: "desc" } })` | A | Không trong một lần nộp: mỗi lần nộp có nhiều nhất một dòng mỗi tên; `desc` chỉ phân biệt các lần nộp, mà các lần nộp có `createdAt` khác nhau |
| spec, ca «Mục tiêu đã nhận» (`dongMucTieu`): `findMany({ where: { cuocSoanId: cuoc.id, trangThai: { not: "bi-loai" } }, orderBy: { createdAt: "asc" } })` | A | Không trong một lần nộp: lọc theo khoá; `.at(-1)` của `m2` chọn giữa các lần nộp |
| `packages/auth/test/chia-mat-khau…` ×3: `verification.findFirst({ where: { identifier: <tiền tố + token> } })` | B | Không: `identifier` mang token riêng của lần chia — một dòng |
| `chia-mat-khau…`: `account.findFirst({ where: { userId, providerId: "credential" } })` | B | Không: mỗi người một tài khoản mật khẩu |
| `chia-mat-khau…`: `account.findFirst({ where: { userId, providerId: GOOGLE_PROVIDER_ID } })` | B | Không: mỗi người một tài khoản Google |
| `cong-vao…`: `invitation.findFirst({ where: { organizationId: WORKSPACE_ID, email: dia } })` | B | Không: mỗi địa chỉ một lời mời trong ca |
| `quen-mat-khau…` ×2: `verification.findFirst({ where: { identifier: <tiền tố + token> } })` | B | Không: token riêng — một dòng |

Ngoài phạm vi quét (người giao chỉ định hai cây trên): mã sản phẩm `packages/db/src`, `apps/agent`
có vài `orderBy: { createdAt }` đơn, đều trên bảng mỗi lần ghi một dòng (`agentTask`, `deal`…).

## Đo

Răng `rang/dao-thu-tu.mjs` dựng bản sao của spec ở `.acceptance-runs/<slug>/sao-*` (gitignore,
symlink `node_modules` của `apps/agent-okr`), chèn vào đúng ca một bước XẾP LẠI BẢNG, rồi chạy
riêng ca đó qua `bun run test --` (DB `crm_<id>_test` riêng mỗi lượt, nên DDL không chạm ai):

- xếp lại = `CREATE INDEX` tạm theo một biểu thức giảm dần → `CLUSTER "okrDeXuat" USING` chỉ mục
  đó → `DROP INDEX`. Ca `nhan`/`bac` xếp theo `("noiDung"->>'khoa') DESC` (để `m3` đứng trước `m1`);
  ca `dich` xếp theo `"createdAt" DESC` (để dòng `m3:cc` cũ nhất đứng cuối).
- trước khi xếp, bước chèn kiểm tiền đề: `nhan`/`bac` — các Mục tiêu đang chờ chung MỘT
  `createdAt`; `dich` — các dòng `m3:cc` có `createdAt` khác nhau. Sau khi xếp, kiểm phép xếp ĂN:
  truy vấn cũ trả dòng sai (`nhan`/`bac`: khác `m1`; `dich`: `.at(-1)` là dòng cũ nhất). Không ăn →
  mã 2, không bao giờ xanh.
- chiều xanh: bộ chọn mới → ca xanh. Chiều đỏ (cùng bản sao, chỉ thay bộ chọn bằng bộ chọn cũ) →
  ca đỏ đúng chữ ký: `nhan` — dòng `+` của diff có `"giu": [],` và tên mới; `bac` —
  `Expected: "so-moi"` / `Received: undefined`; `dich` — dòng `+` có `"id-la",`.

Cách xếp lại bằng `CLUSTER` thay cho «cập nhật không-HOT để dời bản ghi» (đã thử trước): bản cập
nhật thường rơi lại cùng trang nếu trang còn chỗ, nên phép dời không tất định; `CLUSTER` thì có.

Răng thứ hai `rang/quet-mau.mjs` quét hai mẫu A/B trên hai cây, nhận diện mỗi chỗ bằng tệp + nội
dung lời gọi (khoảng trắng gộp), không bằng số dòng, rồi so từng chỗ với `DA_RA` (11 chỗ). Chiều
đỏ trên cùng cây, trong bộ nhớ: trả bộ chọn cũ của `nhan` và `bac` → phải thấy đúng 2 chỗ chưa rà.
Hệ quả có chủ đích: thêm, bớt hay sửa một chỗ thuộc hai mẫu này trong hai cây thì lượt ghim lại
của hồ sơ đỏ, buộc ai đó trả lời «thứ tự có quyết định kết quả không?».
