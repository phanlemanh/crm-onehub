# Luật kho trên diff của lượt tro-ly-okr-de-xuat

Sinh bởi `node _acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`. So HEAD `91eba547b502` với `git merge-base HEAD origin/onehub` = `7db7cea33309`. 90 tệp thêm hay sửa dưới apps/ và packages/ (đã bỏ tệp sinh, *.md, *.json), 14902 dòng thêm.

## 1. Chú thích trong dòng thêm

Lệnh:

```
git diff -U0 7db7cea33309 HEAD -- apps packages   (bỏ /\/generated\// /\.md$/ /\.json$/ /\.lock$/ /bun\.lock/)
lọc dòng «+» chứa // hoặc /* sau khi bỏ chuỗi URL (scheme://…)
```

Kết quả:

```
0 dòng
```

Kết luận: không dòng thêm nào mang chú thích.

### Kiểm chéo độc lập với bộ lọc của luat-kho.mjs

Ba lệnh shell dưới đây chạy nguyên văn qua `bash -c` (không qua hàm lọc JS ở trên); kết quả dán nguyên văn. Lệnh thứ ba là đối chứng: cùng mẫu grep phải bắt một dòng thêm có chú thích.

```
$ git diff -U0 7db7cea333090b5dd5d00e4dd9ae2b1bdfb910a0 HEAD -- apps packages ':(exclude)**/generated/**' ':(exclude)*.md' ':(exclude)*.json' ':(exclude)*.lock' | grep -E '^\+[^+].*(//|/\*)'
(không in dòng nào; grep thoát 1)
$ git diff -U0 7db7cea333090b5dd5d00e4dd9ae2b1bdfb910a0 HEAD -- apps packages ':(exclude)**/generated/**' ':(exclude)*.md' ':(exclude)*.json' ':(exclude)*.lock' | grep -E '^\+[^+].*(//|/\*)' | grep -vE '[a-z][a-z0-9+.-]*://'
(không in dòng nào; grep thoát 1)
$ printf '%s\n' '+const x = 1; // chu thich' | grep -cE '^\+[^+].*(//|/\*)'
1
```

Kiểm chéo: 0 dòng trước khi bỏ URL, 0 sau — khớp 0 dòng của bộ lọc JS; đối chứng bắt được dòng có chú thích.

## 2. API không gọi model hay vendor

Lệnh:

```
git diff --name-only --diff-filter=AM 7db7cea33309 HEAD -- apps/api/src   (bỏ tệp sinh) → 8 tệp
mỗi tệp: nguồn import, đối chiếu /^(ai|@ai-sdk\/.*|openai|@anthropic-ai\/.*|@google\/.*|@vercel\/ai.*|axios|got|node-fetch|undici)$/; grep -iE 'generateText|streamText|generateObject|streamObject|@ai-sdk|openai|anthropic|gateway|fetch\(' trên dòng thêm và cả tệp
```

Kết quả:

```
# apps/api/src/agent/agent-trigger.service.ts
nguồn nhập: @crm/db, @crm/db/agent-tasks, @crm/db/crm-events, @crm/db/fields, @crm/db/idempotency, @crm/validation/field-backfill, @crm/validation/okr-nguon, @crm/validation/tai-lieu-nguon, @nestjs/common, ../database/database.constants, ./agent-dispatch.config, ./bridge
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: apps/api/src/agent/agent-trigger.service.ts:661: const response = await fetch(agent.url(path), {
# apps/api/src/okr/okr-access.service.ts
nguồn nhập: @crm/auth, @crm/db, @crm/validation/okr-muc-tieu, @nestjs/common, zod, ../database/database.constants, ../to-chuc/to-chuc.contracts, ../to-chuc/to-chuc.service, ./okr-config
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: 0
# apps/api/src/okr/okr-config.ts
nguồn nhập: @crm/validation/okr-cap-nhat, @crm/validation/okr-khep
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: 0
# apps/api/src/okr/okr.contracts.ts
nguồn nhập: @crm/validation/ai-chi-phi, @crm/validation/nhac-ke-hoach, @crm/validation/okr-cap-nhat, @crm/validation/okr-chu-ky, @crm/validation/okr-chuong-trinh, @crm/validation/okr-khep, @crm/validation/okr-kr, @crm/validation/okr-muc-tieu, @crm/validation/okr-nguon, @crm/validation/okr-tro-ly, @crm/validation/okr-vet, zod, ./okr-config
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: 0
# apps/api/src/okr/okr.router.ts
nguồn nhập: @crm/validation/okr-cap-nhat, @crm/validation/okr-khep, @crm/validation/okr-trao-doi, @nestjs/common, nestjs-trpc, zod, ../trpc/context.types, ../trpc/middlewares/pham-vi-du-lieu.middleware, ../trpc/openapi, ./okr.contracts, ./okr.service, ./okr-cap-nhat.service, ./okr-khep.contracts, ./okr-khep.service, ./okr-so.contracts, ./okr-so.service, ./okr-trao-doi.service, ./okr-xem.contracts, ./okr-xem.service, ./tro-ly.service
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: 0
# apps/api/src/okr/okr.service.ts
nguồn nhập: @crm/db, @crm/db/okr-tien-do, @crm/db/okr-tro-ly, @crm/db/onboarding-nhac, @crm/db/workspace, @crm/validation/okr-can-chinh, @crm/validation/okr-chu-ky, @crm/validation/okr-chuong-trinh, @crm/validation/okr-kr, @crm/validation/okr-muc-tieu, @crm/validation/okr-nguon, @crm/validation/okr-vet, @nestjs/common, zod, ../agent/agent-trigger.service, ../database/database.constants, ../to-chuc/nhap, ./can-chinh, ./don-vi, ./khep, ./nhap, ./okr.contracts, ./okr-access.service, ./okr-config
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: 0
# apps/api/src/okr/tro-ly-so-do.ts
nguồn nhập: @crm/db, @crm/db/ai-chi-phi, @crm/db/okr-tro-ly-danh-muc, @crm/validation/okr-tro-ly, @crm/validation/okr-vet, zod, ./okr.contracts, ./okr-config
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: 0
# apps/api/src/okr/tro-ly.service.ts
nguồn nhập: @crm/db, @crm/db/ai-chi-phi, @crm/db/ai-chi-phi-danh-muc, @crm/db/okr-de-xuat, @crm/db/okr-tro-ly, @crm/db/okr-tro-ly-danh-muc, @crm/db/okr-xu-huong, @crm/validation/okr-kiem, @crm/validation/okr-kiem-de-xuat, @crm/validation/okr-kr, @crm/validation/okr-tro-ly, @nestjs/common, zod, ../agent/agent-trigger.service, ../database/database.constants, ./okr.contracts, ./okr.service, ./okr-access.service, ./okr-config, ./tro-ly-so-do
nguồn SDK AI hay vendor: 0
dòng thêm khớp lời gọi model/vendor: 0
cả tệp khớp: 0
```

Kết luận: 8 tệp apps/api/src của lượt: 0 nguồn SDK AI hay vendor, 0 dòng thêm gọi model/vendor; 1 dòng khớp mẫu có sẵn từ trước lượt: apps/api/src/agent/agent-trigger.service.ts:661.

## 3. Hằng tinh chỉnh ở một tệp cấu hình

Lệnh:

```
bun nạp TRO_LY_OKR_TRAN (packages/db/src/okr-tro-ly-danh-muc.ts), TRO_LY_OKR (apps/agent/agent/lib/okr/config.ts), OKR (apps/api/src/okr/okr-config.ts) và rút mọi giá trị số
git diff -U0 7db7cea33309 HEAD -- apps packages   rồi quét /(?<![\w.#$-])\d[\d_]*(?:\.\d+)?(?![\w%.-])/g trên dòng thêm của tệp nguồn
```

Kết quả:

```
# packages/db/src/okr-tro-ly-danh-muc.ts: 20 hằng số
  chu.tenMucTieu = 200
  chu.tenKr = 200
  chu.viSao = 500
  chu.lyDo = 200
  chu.cauHoi = 200
  chu.cauTomTat = 280
  soDongDeXuat = 8
  soCauTomTat = 6
  soNguonMoiCau = 4
  tranThangMacDinhUsd = 9
  tranThangToiDaUsd = 20
  soChuHoTenToiThieu = 2
  troLyNgayMoiNguoi = 20
  luotAnMoiNgay = 40
  nhipAnMucTieuMs = 1800000
  hanKiemKhoaMs = 600000
  hoiLaiMs = 1500
  tranChoMs = 30000
  diemXuHuongToiThieu = 3
  hoanTacNgay = 7
# apps/agent/agent/lib/okr/config.ts: 9 hằng số
  judge.nguong = 0.7
  danhGia.tranUsdMacDinh = 2
  cuaSoNguCanh = 1048576
  tranRaMoiLoiGoi = 2000
  limits.maxInputTokensPerSession = 40000
  limits.maxOutputTokensPerSession = 4000
  limits.sessionTimeoutMs = 600000
  timViecCon.soLan = 8
  timViecCon.cachMs = 250
# apps/api/src/okr/okr-config.ts: 9 hằng số
  thoiGian.giayMs = 1000
  ten.toiThieu = 3
  ten.mucTieuToiDa = 200
  ten.krToiDa = 200
  ten.donViDo = 24
  ten.viSao = 500
  lo.toiDaDong = 1000
  lo.toiDaKyTu = 200000
  troLy.soLuotGanDay = 50

# tên hằng khai ở hơn một tệp cấu hình: 1
  viSao: packages/db/src/okr-tro-ly-danh-muc.ts#chu.viSao, apps/api/src/okr/okr-config.ts#ten.viSao

# literal số ≥ 2 chữ số trên dòng thêm của tệp nguồn (ngoài ba tệp cấu hình, tệp kiểm, evals, proto): 18
tệp:dòng · số · loại
apps/api/src/okr/tro-ly-so-do.ts:31 · 24 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
apps/api/src/okr/tro-ly-so-do.ts:31 · 60 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
apps/api/src/okr/tro-ly-so-do.ts:35 · 15 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
apps/api/src/okr/tro-ly-so-do.ts:232 · 0.5 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
apps/api/src/okr/tro-ly-so-do.ts:232 · 0.9 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:66 · 12 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:111 · 01 · trong chuỗi
apps/app/app/(app)/[slug]/settings/okr/the-gop-y-so-do.tsx:63 · 1_000 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
packages/db/src/okr-xu-huong.ts:28 · 24 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
packages/db/src/okr-xu-huong.ts:28 · 60 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
packages/db/src/okr-xu-huong.ts:32 · 100 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
packages/ui/src/components/suggestion.tsx:163 · 15 · trong chuỗi
packages/validation/src/okr-chuong-trinh.ts:22 · 200 · khuôn Zod (min/max)
packages/validation/src/okr-kiem-de-xuat.ts:58 · 15 · hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay
packages/validation/src/okr-kiem-de-xuat.ts:86 · 10 · trong chuỗi
packages/validation/src/okr-kiem-de-xuat.ts:89 · 10 · trong chuỗi
packages/validation/src/okr-kiem-de-xuat.ts:95 · 100 · số rời — đọc tay
packages/validation/src/okr-kiem-de-xuat.ts:101 · 100 · số rời — đọc tay
```

Kết luận: 38 hằng số trong ba tệp cấu hình, 1 tên hằng khai ở hơn một tệp (viSao); 18 literal số ≥ 2 chữ số ở tệp nguồn của lượt — 11 hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay; 4 trong chuỗi; 1 khuôn Zod (min/max); 2 số rời — đọc tay.

### Phán quyết tay cho các dòng «đọc tay»

```
tệp:dòng · số · phán quyết
apps/api/src/okr/tro-ly-so-do.ts:31 · 24 · đơn vị (ngày = 24 × 60 phút, dẫn từ MINUTE_MS) — hợp lệ về loại, nhưng TRÙNG: packages/db/src/okr-xu-huong.ts:28 khai đúng biểu thức này; luật «không viết hai lần» của AGENTS.md chưa đạt
apps/api/src/okr/tro-ly-so-do.ts:31 · 60 · đơn vị (ngày = 24 × 60 phút, dẫn từ MINUTE_MS) — hợp lệ về loại, nhưng TRÙNG: packages/db/src/okr-xu-huong.ts:28 khai đúng biểu thức này; luật «không viết hai lần» của AGENTS.md chưa đạt
apps/api/src/okr/tro-ly-so-do.ts:35 · 15 · định dạng: toPrecision(15) cắt đuôi dấu phẩy động khi nội suy phân vị, giới hạn của số double — không phải tham số tinh chỉnh
apps/api/src/okr/tro-ly-so-do.ts:232 · 0.5 · định nghĩa số đo: p50/p90 là tên số đo spec §10 hứa (trả ra p50Ms, p90Ms) — đổi nó là đổi số đo, không phải chỉnh ngưỡng
apps/api/src/okr/tro-ly-so-do.ts:232 · 0.9 · định nghĩa số đo: p50/p90 là tên số đo spec §10 hứa (trả ra p50Ms, p90Ms) — đổi nó là đổi số đo, không phải chỉnh ngưỡng
apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:66 · 12 · đơn vị lịch: 12 tháng một năm (tính tháng kế) — hợp lệ
apps/app/app/(app)/[slug]/settings/okr/the-gop-y-so-do.tsx:63 · 1_000 · đơn vị: mili giây của một giây để định dạng độ trễ — hợp lệ về loại; cùng nghĩa với OKR.thoiGian.giayMs (API) nhưng tệp client không nhập được okr-config của API
packages/db/src/okr-xu-huong.ts:28 · 24 · đơn vị (ngày) — hợp lệ về loại, nhưng TRÙNG với apps/api/src/okr/tro-ly-so-do.ts:31
packages/db/src/okr-xu-huong.ts:28 · 60 · đơn vị (ngày) — hợp lệ về loại, nhưng TRÙNG với apps/api/src/okr/tro-ly-so-do.ts:31
packages/db/src/okr-xu-huong.ts:32 · 100 · đơn vị: 100 của phần trăm (kẹp KR phần trăm, làm tròn hai số lẻ) — hợp lệ
packages/validation/src/okr-kiem-de-xuat.ts:58 · 15 · định dạng: toPrecision(15) khi nhân hệ số tỷ/triệu/nghìn, giới hạn của số double — không phải tham số tinh chỉnh
packages/validation/src/okr-kiem-de-xuat.ts:95 · 100 · ngữ pháp số đếm tiếng Việt: «trăm» = × 100 trong bộ đọc số viết bằng chữ — hằng ngôn ngữ, không tinh chỉnh (đặt tên được nhưng không đổi hành vi)
packages/validation/src/okr-kiem-de-xuat.ts:101 · 100 · ngữ pháp số đếm tiếng Việt: phần sau «trăm» phải < 100 — cùng hằng ngôn ngữ như dòng trên
```

13 dòng «đọc tay» đều có phán quyết: không dòng nào là tham số tinh chỉnh phải vào TRO_LY_OKR_TRAN; một cặp trùng thật (NGAY_MS khai ở apps/api/src/okr/tro-ly-so-do.ts và packages/db/src/okr-xu-huong.ts cùng biểu thức 24 * 60 * MINUTE_MS) — lẽ ra xuất một DAY_MS cạnh MINUTE_MS ở packages/db/src/okr-tro-ly-danh-muc.ts; chưa sửa trong vòng này, ghi để chủ kho quyết.

### viSao khai ở hai tệp cấu hình

```
$ git log -S'viSao' --format='%h %ad %s' --date=short -- packages/db/src/okr-tro-ly-danh-muc.ts apps/api/src/okr/okr-config.ts
dd43b70c5 2026-09-27 tro-ly-okr-nen: dời hàm tiến độ xuống @crm/db, tách điều kiện đích Căn chỉnh, danh mục thuần ở @crm/db
976ee2af3 2026-09-25 okr: module okr — chu kỳ, cấu hình chương trình, quyền theo bản ghi, vết
dd43b70c5: có trong 7db7cea33309 (trước lượt này)
976ee2af3: có trong 7db7cea33309 (trước lượt này)
```

Phán quyết: cùng một nghĩa (độ dài tối đa của «vì sao lúc này», 500 — bằng `max(500)` của `whyNow` trong packages/validation/src/okr-muc-tieu.ts), dùng ở hai khu khác nhau: `OKR.ten.viSao` (apps/api) chặn đầu vào API — lượt này dùng nó làm trần rộng cho `giaTri` của `troLyQuyet` (okr.contracts.ts), rồi `updateObjectiveInput`/`updateKrInput` siết theo đúng trường; `TRO_LY_OKR_TRAN.chu.viSao` (packages/db) là trần câu Trợ lý nộp, đọc ở packages/validation/src/okr-tro-ly.ts, nơi không nhập được cấu hình của apps/api. Cả hai khai báo có từ trước lượt này (xem trên). Nên là một nguồn (một hằng trong packages, apps/api nhập lại) — ba chỗ cùng giữ 500 là nợ có sẵn; gộp là việc ngoài hợp đồng lượt này, chưa làm.

## 4. Record<string, unknown> và as unknown

Lệnh:

```
git diff -U0 7db7cea33309 HEAD -- apps packages
grep -E 'Record<string,\s*unknown>|as unknown' trên dòng thêm
```

Kết quả:

```
apps/agent/test/tro-ly-okr-giu-viec.integration.spec.ts:149: ] as unknown as XuLyKetQuaHanhDong;
apps/agent/test/tro-ly-okr-nop.integration.spec.ts:50: return (nopDeXuat as unknown as CongCuNop).execute(
apps/agent/test/tro-ly-okr-nop.integration.spec.ts:525: ] as unknown as XuLyKetQuaHanhDong;
apps/api/test/tro-ly-okr-san.ts:228: const kq = await (nopDeXuat as unknown as CongCuNop).execute(
```

Kết luận: không tệp nguồn nào của lượt thêm Record<string, unknown> hay ép kiểu qua unknown; 4 dòng nằm ở tệp kiểm (in ở trên).

## 5. className đè component @crm/ui, bảng và danh sách vẽ tay

Lệnh:

```
git diff -U0 7db7cea33309 HEAD -- apps/app   (tệp .tsx)
trên dòng thêm: grep className=, tìm thẻ mở gần nhất, đối chiếu với tên nhập từ "@crm/ui…"; grep -E '<table|divide-y'
```

Kết quả:

```
# tệp apps/app/**/*.tsx của lượt: 15
# className= trên component nhập từ @crm/ui, màn sản phẩm: 6 — bảng phân loại (a = bố cục hay hình dạng hợp lệ, b = đổi màu/góc/khoảng cách/chữ, ? = biểu thức, đọc tay)
tệp:dòng · thành phần · lớp · loại · lý do
apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:597 · <Skeleton> · h-20 w-full · a · hình dạng của Skeleton (chỉ cao/rộng)
apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:598 · <Skeleton> · h-20 w-full · a · hình dạng của Skeleton (chỉ cao/rộng)
apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:599 · <Skeleton> · h-14 w-full · a · hình dạng của Skeleton (chỉ cao/rộng)
apps/app/app/(app)/[slug]/settings/okr/the-gop-y-so-do.tsx:389 · <Skeleton> · h-6 w-full · a · hình dạng của Skeleton (chỉ cao/rộng)
apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx:417 · <Skeleton> · h-9 w-full · a · hình dạng của Skeleton (chỉ cao/rộng)
apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx:418 · <Skeleton> · h-9 w-full · a · hình dạng của Skeleton (chỉ cao/rộng)
# className= trên component nhập từ @crm/ui, bản mẫu /proto: 20
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:93: <SelectTrigger> <SelectTrigger id={`nac-${ma}`} className="w-full sm:w-56">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:134: <CardContent> <CardContent className="flex flex-col gap-6">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:231: <TableCell> <TableCell className={CELL}>{h.nhan}</TableCell>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:232: <TableCell> <TableCell className={`${CELL} text-right tabular-nums`}>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:235: <TableCell> <TableCell className={`${CELL} text-right tabular-nums`}>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:257: <CardContent> <CardContent className="grid grid-cols-2 gap-2">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:259: <Skeleton> <Skeleton key={k} className="h-16 w-full" />
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:293: <CardContent> <CardContent className="flex flex-col gap-6">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:306: <TableCell> <TableCell className={CELL}>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:312: <TableCell> <TableCell className={CELL}>{l.nac}</TableCell>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:313: <TableCell> <TableCell className={`${CELL} text-right tabular-nums`}>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:317: <TableCell> <TableCell className={`${CELL} text-right tabular-nums`}>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:100: <FieldLabel> <FieldLabel htmlFor={`sua-${dong.id}`} className="sr-only">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:168: <Skeleton> <Skeleton className="h-20 w-full" />
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:169: <Skeleton> <Skeleton className="h-20 w-full" />
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:170: <Skeleton> <Skeleton className="h-14 w-full" />
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:236: <Button> <Button variant="outline" disabled className="w-fit">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:250: <Button> <Button variant="outline" className="w-fit" data-nut="gop-y">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:362: <Button> <Button variant="ghost" size="sm" className="w-fit">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:402: <Button> <Button variant="outline" className="w-fit">
# className= trên thẻ HTML hay component cục bộ: 22
apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx:399: <div> className={LOP_THAN_HOP[gopY.cotMo ? "coCot" : "motCot"]}
apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx:278: <div> className={LOP_THAN_HOP[gopY.cotMo ? "coCot" : "motCot"]}
apps/app/app/(app)/[slug]/settings/okr/the-gop-y-so-do.tsx:315: <div> <div className="flex-1 overflow-y-auto px-4 pb-4">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:105: <div> <div className="flex flex-wrap items-center gap-2">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:106: <ul> <ul className="flex flex-wrap gap-1.5" aria-label={nhan}>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:308: <span> <span className="block text-muted-foreground" translate="no">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:340: <div> <div className="flex flex-col gap-3 px-4">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:342: <div> <div key={d.sau} className="flex flex-col gap-1 border-b pb-3">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:343: <p> <p className="text-muted-foreground">{d.loai}</p>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:346: <p> className="text-muted-foreground line-through"
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/cai-dat.tsx:370: <div> <div className="flex w-full max-w-(--container-page) flex-col gap-6">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:94: <p> <p className="text-muted-foreground line-through" translate="no">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:155: <div> <div className="flex items-center justify-between gap-2">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:156: <p> <p className="font-medium">Trợ lý OKR</p>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:167: <div> <div className="mt-3 flex flex-col gap-2">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:206: <p> <p className="mb-3 text-muted-foreground">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:266: <div> <div className="grid grid-cols-2 gap-3">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:323: <div> className={
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:395: <div> className={
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:414: <div> <div className="grid grid-cols-2 gap-3">
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/hop-thoai.tsx:437: <p> <p className="mb-3 font-medium">Trợ lý OKR · chỉ KR này</p>
apps/app/app/proto/_modules/tro-ly-okr-de-xuat/index.tsx:52: <div> className="ml-[calc(50%-50vw)] w-screen border-y bg-background px-4 py-6"
# <table hay divide-y: 0
```

Kết luận: màn sản phẩm: 6 className trên component @crm/ui, cả 6 thuộc loại (a) bố cục hay hình dạng; 0 loại (b); không <table> hay divide-y tự dựng. 20 chỗ ở bản mẫu /proto nằm ngoài vật, không phân loại.

## 6. Lệnh ghi của API Trợ lý OKR

Lệnh:

```
git diff -U0 7db7cea33309 HEAD -- apps/api/src/okr/tro-ly.service.ts apps/api/src/okr/tro-ly-so-do.ts | grep -E '^\+.*\.(create|update|updateMany|upsert|delete)\b|executeRaw'
cộng lời gọi this.okr.*Trong(…) và hàm @crm/db ghi AgentTask (xepViecTroLy); mô hình Prisma tìm ngược tối đa 3 dòng
```

Kết quả:

```
tệp:dòng · loại · chi tiết
apps/api/src/okr/tro-ly.service.ts:242 · agentTask · xepViecTroLy (@crm/db/okr-tro-ly)
apps/api/src/okr/tro-ly.service.ts:439 · OkrService · this.okr.addAlignmentTrong
apps/api/src/okr/tro-ly.service.ts:455 · OkrService · this.okr.updateKeyResultTrong
apps/api/src/okr/tro-ly.service.ts:466 · OkrService · this.okr.updateObjectiveTrong
apps/api/src/okr/tro-ly.service.ts:504 · okrDeXuat · const { count } = await tx.okrDeXuat.updateMany({
```

Kết luận: dòng trực tiếp trong hai tệp dịch vụ chỉ ghi AgentTask (1), OkrDeXuat (1) và qua OkrService (3); lần theo hàm @crm/db ở dưới.

### Lần theo hàm @crm/db mà dịch vụ gọi

Mỗi hàm nhập từ @crm/db mà apps/api/src/okr/tro-ly.service.ts (nguồn /^@crm\/db\/.+/), apps/api/src/okr/tro-ly-so-do.ts (nguồn /^@crm\/db\/.+/), apps/api/src/okr/okr.service.ts (nguồn /^@crm\/db\/(okr-tro-ly|okr-de-xuat|okr-xu-huong)$/) gọi: đọc thân hàm trong packages/db/src, đi tiếp vào hàm cùng tệp và hàm nhập tương đối, in mọi lệnh ghi Prisma (`db.|tx.<mô hình>.<create|update|upsert|delete…>(`) hay `$executeRaw`. Lệnh khớp chữ `.update(` mà không phải trên `db`/`tx` in riêng ở cuối.

```
nơi gọi · đường hàm · lệnh ghi · mô hình.lệnh · data
apps/api/src/okr/tro-ly.service.ts:382 · danhSachDeXuat · packages/db/src/okr-de-xuat.ts:84 · okrDeXuat.updateMany · { trangThai: "het-han" }
apps/api/src/okr/tro-ly.service.ts:382 · danhSachDeXuat · packages/db/src/okr-de-xuat.ts:93 · okrDeXuat.updateMany · { hienLuc: v.now }
apps/api/src/okr/tro-ly.service.ts:242 · xepViecTroLy → taoViecDeXuat · packages/db/src/okr-tro-ly.ts:311 · agentTask.create · { …nhiều dòng }
apps/api/src/okr/okr.service.ts:276 · xepLuotAnSauKhiLuu → taoViecDeXuat · packages/db/src/okr-tro-ly.ts:311 · agentTask.create · { …nhiều dòng }
# khớp chữ nhưng không phải ghi Prisma: 2
xepViecTroLy → taoViecDeXuat · packages/db/src/okr-tro-ly.ts:287 · const inputHash = createHash("sha256") .update(
xepLuotAnSauKhiLuu → taoViecDeXuat · packages/db/src/okr-tro-ly.ts:287 · const inputHash = createHash("sha256") .update(
```

Qua hàm @crm/db: 4 lệnh ghi — okrDeXuat (2), agentTask (2); không mô hình nào ngoài AgentTask và OkrDeXuat.

Phán quyết cho tro-ly.service.ts:504 (`tx.okrDeXuat.updateMany`): ngoại lệ thiết kế cho phép, không vi phạm. Căn cứ: spec docs/superpowers/specs/2026-09-28-tro-ly-okr-de-xuat-design.md §4 (sơ đồ: «một tx: OkrService …Trong(tx) + OkrTrail.note + OkrDeXuat có điều kiện «cho»») và §8 «Quyết» (nhận và sửa gọi `updateObjectiveTrong`/`updateKeyResultTrong`/`addAlignmentTrong` trong cùng `tx` với cập nhật có điều kiện `trangThai = 'cho'`). Lệnh chỉ ghi quyết định của người (`trangThai`, `giaTriCuoi`, `nguoiQuyet`, `quyetLuc`) lên sổ đề xuất — không sinh nội dung, không chấm, không gọi model; `OkrDeXuat` không phải bản ghi OKR (docs/api.md: «nằm ngoài luật vết»), còn giá trị OKR vẫn ghi qua `OkrService.*Trong`. Câu «API chỉ đọc sổ và ghi `AgentTask`» ở docs/api.md thuộc mục `okr.aiChiTieu`, không phải luật cấm ghi sổ đề xuất. Hai `updateMany` trong `danhSachDeXuat` cũng đúng spec: §8 «dòng `cho` có `truoc` khác giá trị hiện tại thành `het-han` khi đọc», §5 `hienLuc` «lúc dòng lần đầu được `troLyDanhSach` trả cho người». AgentTask ghi qua `xepViecTroLy` (bấm) và `xepLuotAnSauKhiLuu` (chế độ ẩn, gọi từ okr.service.ts) — đúng luật «API ghi một hàng AgentTask, agent quyết».

## 7. Dấu hiệu vẽ tay trên màn Trợ lý OKR

Lệnh:

```
git diff -U0 7db7cea33309 HEAD -- apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx apps/app/app/(app)/[slug]/settings/okr/the-gop-y-so-do.tsx apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx
grep -nE 'rounded-(sm|md|lg)[^"]*border|size-2 rounded-full|navigator\.clipboard|<h[12] ' trên dòng thêm
```

Kết quả:

```
# 5 tệp
0 dòng
```

Kết luận: 5 tệp màn của lượt: không hộp rounded+border tự dựng, không chấm size-2 rounded-full, không navigator.clipboard, không <h1>/<h2> tự đặt.

## 8. API chạy lại kiemDongDeXuat khi đọc troLyDanhSach

Lệnh:

```
grep -n 'kiemDongDeXuat' apps/api/src/okr/tro-ly.service.ts
bao đóng import của packages/validation/src/okr-kiem-de-xuat.ts (đi theo ./… và @crm/db|@crm/validation qua exports); đối chiếu /^(ai|@ai-sdk\/.*|openai|@anthropic-ai\/.*|@google\/.*|@vercel\/ai.*|axios|got|node-fetch|undici)$/; grep -iE 'generateText|streamText|generateObject|streamObject|@ai-sdk|openai|anthropic|gateway|fetch\(' trên mọi tệp trong bao, rồi lọc dòng là lời gọi hay import thật
in thân noiVeNguoi
```

Kết quả:

```
apps/api/src/okr/tro-ly.service.ts:25: kiemDongDeXuat,
apps/api/src/okr/tro-ly.service.ts:387: kiemLai: (hang) => kiemDongDeXuat(dongTuHang(hang), goi),
# tệp trong bao đóng import: 6
packages/validation/src/okr-kiem-de-xuat.ts
packages/validation/src/okr-kiem.ts
packages/validation/src/okr-kr.ts
packages/validation/src/okr-tro-ly.ts
packages/db/src/okr-tro-ly-danh-muc.ts
packages/validation/src/okr-chu-ky.ts
# nguồn ngoài kho: zod
# nguồn SDK AI hay vendor: 0
# dòng khớp mẫu lỏng 'generateText|streamText|generateObject|streamObject|@ai-sdk|openai|anthropic|gateway|fetch\(': packages/db/src/okr-tro-ly-danh-muc.ts:129: "het-tran-gateway",
# trong đó là lời gọi hay import thật (\b(generateText|streamText|generateObject|streamObject|fetch)\s*\(|from\s+"(ai|@ai-sdk\/[^"]*|openai|@anthropic-ai\/[^"]*)"): 0
# thân noiVeNguoi
packages/validation/src/okr-kiem-de-xuat.ts:274: function noiVeNguoi(dong: DongDeXuat, goi: GoiKiem): boolean {
packages/validation/src/okr-kiem-de-xuat.ts:275: 	const chu = chuCuaDong(dong).map(khongDau);
packages/validation/src/okr-kiem-de-xuat.ts:276: 	return goi.tenThanhVien
packages/validation/src/okr-kiem-de-xuat.ts:277: 		.map(khongDau)
packages/validation/src/okr-kiem-de-xuat.ts:278: 		.filter(
packages/validation/src/okr-kiem-de-xuat.ts:279: 			(ten) => ten.split(" ").length >= TRO_LY_OKR_TRAN.soChuHoTenToiThieu,
packages/validation/src/okr-kiem-de-xuat.ts:280: 		)
packages/validation/src/okr-kiem-de-xuat.ts:281: 		.some((ten) => chu.some((c) => coCum(c, ten)));
packages/validation/src/okr-kiem-de-xuat.ts:282: }
```

Kết luận: kiemDongDeXuat là hàm thuần trong packages/validation: bao đóng import 6 tệp, nguồn ngoài kho chỉ zod; 0 SDK AI hay vendor, 0 lời gọi model hay mạng (1 dòng khớp mẫu lỏng là chữ, không phải lời gọi — in ở trên).

Phán quyết: API chạy lại `kiemDongDeXuat` trong `troLyDanhSach` (qua `kiemLai` của `danhSachDeXuat`) không vi phạm luật «trí khôn sống ở apps/agent». Luật đó cấm vendor client, làm giàu, chấm điểm và khớp danh tính trong Nest. Đây là một hàm thuần, tất định, không gọi model, không gọi mạng, dùng chung với agent (spec §8: bộ kiểm «chạy trong nop_de_xuat trước khi ghi, và chạy lại khi troLyDanhSach đọc — số hiện tại có thể đã đổi»); nó chỉ quyết một dòng agent đã nộp có còn được hiện hay không. Chốt `noi-ve-nguoi` (`noiVeNguoi`) so họ tên đầy đủ của thành viên (không dấu, tối thiểu `TRO_LY_OKR_TRAN.soChuHoTenToiThieu` chữ) trong chữ đề xuất để CHẶN dòng đó — không gắn dòng với một người, không ghi, không trả danh tính nào; nên không phải khớp danh tính theo nghĩa của luật.
