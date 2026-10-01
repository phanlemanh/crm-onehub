# Bằng chứng máy: luật kho trên diff của «Tóm tắt tuần» (E20)

Chạy ngày 2026-10-01 từ gốc kho, nhánh `feat/tro-ly-okr-tom-tat`, sau các commit S4-r1.
Phạm vi: `git diff origin/onehub...HEAD` — merge-base thật là
`bb55853103b97d8dfa9950b99e6a9e38762b0c49`, 194 tệp, trong đó 94 tệp `.ts`/`.tsx` ngoài
`_acceptance`. Tệp này chỉ ghi điều máy thấy; kết luận đạt hay không là việc của người chấm.

## 1. Lint và lint:slop

```
bun run lint
```

Mã thoát 0. Dòng cuối: `Tasks: 9 successful, 9 total`. Không có lỗi. Có 39 cảnh báo của
biome (`noBarrelFile`, `noReExportAll`, `noUnusedImports`, `useOptionalChain`,
`noImportantStyles`, `noUnusedFunctionParameters`), phần lớn ở tệp cũ. Cảnh báo nằm trong
tệp mà diff này thêm hoặc sửa:

- `packages/validation/src/okr-tom-tat.ts:8:1` `noBarrelFile` (tệp thêm mới, khối `export { OKR_TOM_TAT, … } from "@crm/db/okr-tro-ly-danh-muc"`)
- `packages/validation/src/okr-tro-ly.ts:15:1` `noBarrelFile` (tệp sửa)
- `packages/validation/src/nhac-ke-hoach.ts:5:1` `noBarrelFile` (tệp sửa)
- `packages/db/src/okr-xu-huong.ts:4:2` `noUnusedImports` (tệp sửa; chưa kiểm cảnh báo này có sẵn từ `onehub` hay không)

```
bun run lint:slop
```

Mã thoát 0. Dòng cuối: `Found 0 warnings and 0 errors. Finished in 1.2s on 2344 files with 9 rules using 14 threads.`

## 2. Chú thích mới thêm trong mã

```
git diff -U0 origin/onehub...HEAD -- '*.ts' '*.tsx' ':(exclude)apps/api/src/generated/**' ':(exclude)packages/ui/src/components/ai-elements/**' | awk '/^\+\+\+ /{f=substr($0,7)} /^\+[ \t]*(\/\/|\/\*)/{print f": "$0}'
```

Kết quả: 0 dòng. Cùng lệnh cho `*.mjs` (`-- '*.mjs'`): 0 dòng. Tìm chú thích cuối dòng
(`^\+[^+].*[;{})]\s*// `): 0 dòng.

Hai tệp loại khỏi lệnh trên, đã chạy riêng:

```
git diff -U0 origin/onehub...HEAD -- apps/api/src/generated packages/ui/src/components/ai-elements | awk '/^\+\+\+ /{f=substr($0,7)} /^\+[ \t]*(\/\/|\/\*)/{print f": "$0}'
```

Kết quả: 0 dòng. Hai tệp đó là `apps/api/src/generated/server.ts` (sinh bằng `trpc:generate`)
và `packages/ui/src/components/ai-elements/inline-citation.tsx` (cài bằng CLI của AI Elements).

## 3. API không gọi model hay nhà cung cấp

Tệp của `apps/api/src` trong diff: `okr/dien-bien.ts`, `okr/hop-tuan.ts` (đã xoá, dời sang
`packages/db`), `okr/okr-config.ts`, `okr/okr-xem.config.ts`, `okr/okr-xem.service.ts`,
`okr/okr.router.ts`, `okr/toan-canh.ts`, `okr/tro-ly.service.ts`, `zalo/zalo.contracts.ts`,
`zalo/zalo.router.ts`, `zalo/zalo.service.ts`, `generated/server.ts`.

```
for f in $(git diff --name-only origin/onehub...HEAD -- apps/api/src); do grep -nE "from ['\"](ai|@ai-sdk/[^'\"]*|eve|eve/[^'\"]*|@vercel/ai[^'\"]*|@anthropic-ai/[^'\"]*|openai|[^'\"]*gateway[^'\"]*)['\"]|require\(['\"](ai|eve)['\"]\)" $f | sed "s|^|$f:|"; done
```

Kết quả: không dòng nào (`hop-tuan.ts` đã xoá nên grep báo không có tệp).

```
git diff -U0 origin/onehub...HEAD -- apps/api/src ':(exclude)apps/api/src/generated/**' | grep -niE "^\+.*(gateway|generateText|streamText|anthropic|openai|@ai-sdk)"
```

Kết quả: không dòng nào.

```
grep -rnE "ghiTomTat|xepTomTat|chayXepTomTat|damBaoLichTomTat" apps/api/src
```

Kết quả: không dòng nào. `tro-ly.service.ts` nhập từ `@crm/db/okr-tom-tat` chỉ
`banTuanChoQuanTri`, `docTomTatChoNguoiXem`, `nacTomTatPhong`, `trangThaiTuan` (đều đọc),
và `LUAT_TOM_TAT` từ `@crm/validation/okr-kiem-tom-tat` (bộ kiểm thuần, không gọi ngoài).
Thủ tục ghi duy nhất của API cho tính năng là `troLyTomTatPhanHoi` (một `upsert` vào
`OkrTomTatPhanHoi`).

## 4. Hằng của tóm tắt

Nơi khai: `OKR_TOM_TAT` ở `packages/db/src/okr-tro-ly-danh-muc.ts:82`:
`gioXep {6:00}`, `cuaSoNgay 7`, `tyLeGiuLai 0.3`, `hienTrongNgay 8`, `hoiLaiMs 5 s`,
`tranChoMs 2 phút`, `dongBaoAiToiDa 2`, `giaoDichXepMs 1 phút`; cùng tệp có `GIO_MS`, `NGAY_MS`,
`TUAN_MS` dẫn từ một gốc.

```
grep -rn "OKR_TOM_TAT" apps packages --include=*.ts --include=*.tsx --include=*.mjs | grep -v node_modules | grep -v "\.output" | grep -v "/test/"
```

Nơi dùng (không kể nơi khai): `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx:76,77,339`
(`tranChoMs`, `hoiLaiMs`), `apps/agent/agent/lib/tin-nhac.ts:253` (`dongBaoAiToiDa`),
`apps/agent/agent/lib/okr/lich-tom-tat.ts:40,41,198` (`gioXep`, `giaoDichXepMs`),
`packages/db/src/okr-tom-tat.ts:267,552,760` (`cuaSoNgay`, `tyLeGiuLai`, `hienTrongNgay`),
`apps/agent/evals/okr/tom-tat.eval.ts:82,83` (`gioXep`).

Số cứng còn lại trong dòng thêm của diff, tìm bằng mẫu `_000 | * 60 | * 24 | * 7 | 3 chữ số trở lên` trên dòng có chữ tom/tuan/gio/ms/ngay:

```
git diff -U0 origin/onehub...HEAD -- apps/agent/agent apps/api/src packages/db/src packages/validation/src 'apps/app/app/(app)/[slug]/okr' ':(exclude)apps/api/src/generated/**' | awk '/^\+\+\+ /{f=substr($0,7)} /^\+/{print f": "$0}' | grep -E "(_000|\* *(60|24|7|1000)\b|\b(60|24|7)\s*\*|[^A-Za-z0-9_.\"'-]([0-9]{3,})[^A-Za-z0-9_\"'-])" | grep -iE "tom|tuan|gio|ms|ngay"
```

- `packages/db/src/okr-tom-tat.ts`: `const LAM_TRON_GIA_TRI = 10_000;` — hằng làm tròn chênh lệch, khai cục bộ ở tệp, không ở `OKR_TOM_TAT`.
- `packages/db/src/okr-tro-ly-danh-muc.ts`: `GIO_MS`, `NGAY_MS`, `TUAN_MS` — đây là nơi khai đơn vị.
- `packages/validation/src/okr-kiem-tom-tat.ts`: `const NGHIN = 1000;` — hệ số chữ «k», khai cục bộ. Đợt S4-r1 thêm `CHU_SO_CHINH_XAC = 15` và bảng `HE_SO_DON_VI` cũng ở tệp này (cùng nếp với `TRAN_SO`, `NGHIN` sẵn có, không ở `OKR_TOM_TAT`).
- `packages/validation/src/okr-tom-tat.ts`: `.max(120)` của `ma` — giới hạn độ dài khuôn, không phải số ms/giờ/tuần.

## 5. `className=` trên thành phần `@crm/ui` ở tệp `apps/app` mới của lượt

Tệp mới: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`,
`apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx`. Tệp sửa có dòng
`className` thêm: `okr/hop-tuan.tsx` (1 dòng), `settings/notifications/khoi-kenh.tsx` (2 dòng).

```
grep -n "className" 'apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx' 'apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx'
git diff -U0 origin/onehub...HEAD -- 'apps/app/app/(app)/[slug]/okr/hop-tuan.tsx' 'apps/app/app/(app)/[slug]/settings/notifications/khoi-kenh.tsx' | grep -n "^+.*className"
```

Trên thành phần `@crm/ui`:

| Tệp:dòng | Thành phần | className | Nhận xét |
| --- | --- | --- | --- |
| khoi-tom-tat.tsx:117, 350 | `Button` | `self-start` | bố cục: không cho nút giãn hết chiều ngang của cột flex; không đổi màu, góc, cỡ chữ |
| khoi-tom-tat.tsx:331-334 | `Skeleton` | `h-3 w-1/3`, `h-4 w-full`, `h-4 w-5/6`, `h-4 w-2/3` | kích thước khung chờ; `Skeleton` nhận `className` làm cách đặt cỡ |
| tom-tat-quan-tri.tsx:380-382 | `Skeleton` | `h-4 w-full`, `h-4 w-5/6`, `h-4 w-2/3` | như trên |
| tom-tat-quan-tri.tsx:134, 162, 165, 168, 172, 179 | `SimpleTableCell` | `align-top`, `whitespace-normal`, `hidden … md:table-cell` | căn dọc và ẩn cột ở màn hẹp (bố cục); không đổi màu hay góc |
| tom-tat-quan-tri.tsx:349, 354, 362, 369 | khoá `className` trong mô tả cột của `SimpleTable` | `hidden md:table-cell` | ẩn cột ở màn hẹp, là tham số có sẵn của cột |

Trên phần tử DOM thường (không phải thành phần `@crm/ui`), `className` là bố cục hoặc chữ:
`div`, `dl`, `dt`, `dd`, `figure`, `figcaption`, `p`, `ol`, `li`, `span`, `section`
(khoi-tom-tat.tsx:86-108, 206, 224, 241-246, 342, 345; tom-tat-quan-tri.tsx:119, 148-156,
184, 258-261, 268, 280, 292-299; hop-tuan.tsx thêm `flex flex-col gap-6`; khoi-kenh.tsx thêm
`flex flex-col gap-3 border-t pt-5`).

Điểm đối chiếu với `docs/design.md` mục «Dấu hiệu vẽ tay» (`<h1>`, `<h2>` tự đặt cỡ chữ → `PageShellTitle`, `CardTitle`):

- `settings/notifications/khoi-kenh.tsx:183` — `<h2 className="font-medium text-sm">` thêm mới.
- `tom-tat-quan-tri.tsx:264, 295` — `<h3 className="font-medium text-sm">` (hai tiêu đề trong `SheetBody`).
- `khoi-tom-tat.tsx:92-101` — `<dl>` với lưới `grid-cols-[auto_1fr]` dựng tay cho cặp nhãn-giá trị chỉ đọc.

Lệnh: `grep -n "<h[1-6]" <ba tệp trên>`.

## 6. Khuôn parse ở biên

Khuôn Zod ở `packages/validation/src/okr-tom-tat.ts` (xuất): `trangThaiTomTat`, `maBoCau`,
`cauBoTomTat`, `noiDungTomTat`, `troLyTomTatInput`, `nguonHienTomTat`, `banHienTomTat`,
`troLyTomTatOutput`, `troLyTomTatPhanHoiInput`, `troLyTomTatPhanHoiOutput`,
`troLyTomTatQuanTriInput`, `nguonQuanTriTomTat` (`discriminatedUnion("mat")`),
`cauQuanTriTomTat`, `cauBoQuanTriTomTat`, `dongQuanTriTomTat`, `troLyTomTatQuanTriOutput`.
Kiểu dẫn bằng `z.infer` (`NoiDungTomTat`, `BanHienTomTat`, `TroLyTomTatOutput`, …). Khuôn việc
`okrTroLyViec` và `cauTomTat` ở `packages/validation/src/okr-tro-ly.ts`.

Nơi parse, `grep -rnE "parseNoiDungTomTat|parseTrangThaiTomTat|docNoiDung|docTrangThai|okrTroLyViec|docViec"`:

- Cột `OkrTomTat.cau` (Json): `parseNoiDungTomTat` (`okr-tom-tat.ts:45`, `safeParse`, ném lỗi có thông điệp), đi vào `@crm/db/okr-tom-tat` qua `LUAT_TOM_TAT.docNoiDung` tại `okr-tom-tat.ts:554, 768, 896`.
- Cột `OkrTomTat.trangThai` (String): `parseTrangThaiTomTat` qua `LUAT_TOM_TAT.docTrangThai` tại `okr-tom-tat.ts:767, 897`.
- Payload `AgentTask` của việc tóm tắt (Json): `okrTroLyViec.safeParse` tại `apps/agent/agent/lib/okr/nop-tom-tat.ts:39` và `apps/api/src/okr/tro-ly.service.ts:591`; `LUAT_TOM_TAT.docViec` tại `packages/db/src/okr-tom-tat.ts:611, 730, 891`.
- Đầu vào tRPC: `troLyTomTatInput`, `troLyTomTatPhanHoiInput`, `troLyTomTatQuanTriInput` do router nhập thẳng (`apps/api/src/okr/okr.router.ts:49-54`).

```
grep -rnE "Record<string, unknown>|as unknown as|: unknown" <các tệp tóm tắt của db, validation, agent, app>
```

Kết quả: hai dòng, đều là tham số `value: unknown` của hai hàm parse ở
`packages/validation/src/okr-tom-tat.ts:45, 53`. Không có `Record<string, unknown>` hay ép
kiểu qua `unknown` trong các tệp tóm tắt.
