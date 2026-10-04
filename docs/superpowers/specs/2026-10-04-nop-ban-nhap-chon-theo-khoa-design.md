# Ca «Mục tiêu đã nhận» chọn dòng theo khoá bản nháp — design

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
2. Ca chọn «Mục tiêu đầu tiên» bằng
   `findFirstOrThrow({ where: { …, loai: "muc-tieu-moi", trangThai: "cho" }, orderBy: { createdAt: "asc" } })`.
   Hai Mục tiêu đang chờ (`m1`, `m3`) bằng nhau về `createdAt`, nên Postgres trả theo vị trí vật
   lý của bản ghi (thứ tự TID), không theo thứ tự ghi.
3. Vị trí vật lý đổi được mà không ai chạm dữ liệu logic: trang đầy giữa chừng, autovacuum trả
   chỗ trống, hay một lần cập nhật không-HOT dời bản ghi ra cuối bảng. Khi đó ca đánh dấu `m3` là
   «nhan» thay vì `m1` → lần nộp đổi tên ghi thêm một dòng `m1` (vì `m1` vẫn chưa quyết) và
   `giuNguyen` không có `m1` — đúng chữ ký CI.

Tái hiện:

- Ngẫu nhiên: chạy cả tệp 15 lần bằng Bun 1.3.12 (như CI) → đỏ 1 lần, đúng ca này.
- Tất định: sau lần nộp đầu, cập nhật cột có chỉ mục của dòng `m1` (`cuocSoanId` → `NULL` → giá
  trị cũ) để bản ghi bị dời ra sau → `findFirst` theo `createdAt` trả `m3`, ca đỏ đúng chữ ký CI
  (`"giu": []`, `m1` thêm tên mới).

## Cách sửa

Ca chọn dòng theo khoá ổn định của bản nháp: đọc các dòng Mục tiêu đang chờ của cuộc, đọc khoá
bằng `dongSoanTuHang` (bộ đọc sản phẩm dùng, parse `noiDung` qua schema), lấy dòng có khoá `m1`.
Không phụ thuộc thứ tự nào.

Bộ chọn mới, nguyên văn (răng `rang/dao-thu-tu.mjs` khớp đúng khối này, hằng `BO_CHON_KHOA`):

```ts
		const m1 = (
			await db.okrDeXuat.findMany({
				where: { cuocSoanId: cuoc.id, loai: "muc-tieu-moi", trangThai: "cho" },
			})
		).find((h) => dongSoanTuHang(h).khoa === "m1");
		if (!m1) throw new Error("thieu muc tieu m1");
```

Bộ chọn cũ, nguyên văn từ `onehub` 0b8540c1 dòng 503–506 (hằng `BO_CHON_CREATED_AT` của răng,
dùng cho chiều đỏ):

```ts
		const m1 = await db.okrDeXuat.findFirstOrThrow({
			where: { cuocSoanId: cuoc.id, loai: "muc-tieu-moi", trangThai: "cho" },
			orderBy: { createdAt: "asc" },
		});
```

Phương án đã loại:

- Thêm khoá phụ `{ id: "asc" }`: `id` là `cuid()` do query engine sinh; nó có vẻ tăng theo thứ tự
  ghi trong một `createMany`, nhưng đó là chi tiết hiện thực của engine, không phải hợp đồng —
  ca vẫn chọn «dòng đầu» thay vì chọn «dòng `m1`» mà nó thật sự muốn.
- Lọc JSON `noiDung: { path: ["khoa"], equals: "m1" }`: ngắn hơn, nhưng đọc khoá bằng đường dẫn
  JSON thô, lệch với luật «parse ở biên» của kho; `dongSoanTuHang` là bộ đọc duy nhất của khuôn đó.

## Mã sản phẩm: không đổi

`docDaQuyet` trong `nop-ban-nhap.ts` đã sắp `[{ createdAt: "asc" }, { id: "asc" }]`: hai dòng
cùng `createdAt` luôn ra theo `id`, nên kết quả của nó xác định với cùng một tập dòng — không phụ
thuộc vị trí vật lý. Đó là đủ cho yêu cầu «thứ tự xác định»; mã sản phẩm không có chỗ nào khác
trong đường nộp sắp theo `createdAt`.

Điều design này KHÔNG khẳng định: rằng hai dòng của một lần nộp không bao giờ tranh nhau một khoá.
Schema `banNhap` (`packages/validation/src/okr-cuoc-soan.ts`) không chặn hai Mục tiêu (hay hai KR
cùng cha) trùng `khoa`; `chanTrungKhoa` chỉ chặn trùng `khoaDong`, mà `khoaDong` của Mục tiêu/KR
là tên chuẩn hoá chứ không phải khoá. Một bản nháp như thế sinh hai dòng cùng `khoaModel` và cùng
`createdAt`; `docDaQuyet` khi đó giữ dòng có `id` nhỏ hơn — xác định, nhưng không phải «dòng ghi
trước». Đó là khe kiểm đầu vào của sản phẩm, không phải nguồn đỏ chập chờn, và nằm ngoài hồ sơ
này (ghi ở Out of scope; đề xuất mở việc riêng).
## Rà các ca cùng mẫu

Quét `orderBy: { createdAt` đứng một mình (một dòng và nhiều dòng) trong `apps/agent-okr/test` và
`packages/*/test`: bốn chỗ, đều trong `nop-ban-nhap.integration.spec.ts`.

| Dòng (trước sửa) | Ca | Thứ tự có quyết định kết quả? |
| --- | --- | --- |
| ~242 | «nộp bản nháp trộn…» | Không: mọi phép so dùng `every`, `filter().length`, hay `sort()` |
| ~443 | «dòng trùng khoá với hàng người đã nhận…» (`krCho`) | Không trong một lần nộp: lọc theo tên + `cho` — mỗi lần nộp có nhiều nhất một dòng mỗi tên; `desc` chỉ phân biệt các lần nộp khác nhau, mà các lần nộp có `createdAt` khác nhau |
| ~505 | «Mục tiêu đã nhận…» | **Có** — chính là chỗ đỏ; sửa ở hồ sơ này |
| ~522 | cùng ca (`dongMucTieu`) | Không trong một lần nộp: kết quả lọc theo khoá; `.at(-1)` của `m2` chọn giữa các lần nộp khác nhau |

Ngoài phạm vi quét (người dùng chỉ định), mã sản phẩm trong `packages/db/src` và `apps/agent`
có vài `orderBy: { createdAt }` đơn, nhưng đều trên bảng mỗi lần ghi một dòng (`agentTask`,
`deal`…), không trên dòng ghi chung một `createMany`.

## Đo

Một răng `rang/dao-thu-tu.mjs` dựng bản sao của spec ở `.acceptance-runs/<slug>/sao-*`
(gitignore, symlink `node_modules` của `apps/agent-okr`), chèn bước dời bản ghi `m1` ngay sau lần
nộp đầu của ca, kiểm rằng phép dời ĂN (13 dòng chung một `createdAt`, `findFirst` theo
`createdAt` nay trả dòng khác `m1`), rồi chạy riêng ca đó qua `bun run test --` (DB riêng mỗi lượt):

- chiều xanh: bộ chọn theo khoá → ca xanh;
- chiều đỏ (cùng bản sao, chỉ thay bộ chọn bằng bộ chọn `createdAt` cũ) → ca đỏ đúng chữ ký CI.

Phép dời không ăn hay mốc vắng → mã 2 (không đo được), không bao giờ xanh. Chữ ký chiều đỏ khớp
trên các dòng vế «Received» (`+`) của diff bun, không khớp chuỗi bất kỳ trong log.

Răng thứ hai `rang/quet-mau.mjs` quét lại hai cây `apps/agent-okr/test` và `packages/*/test` bằng
regex chịu xuống dòng (`orderBy:\s*\{\s*createdAt\s*:`): sau sửa phải còn đúng 3 chỗ, cùng ở
`nop-ban-nhap.integration.spec.ts`. Chiều đỏ trên cùng cây: trong bộ nhớ, thay bộ chọn mới của
spec bằng bộ chọn cũ → phải đếm 4. Hệ quả có chủ đích: ai thêm một `orderBy: { createdAt` đơn vào
hai cây này thì lượt ghim lại của hồ sơ đỏ, buộc trả lời câu «dòng ghi chung một lần?».
