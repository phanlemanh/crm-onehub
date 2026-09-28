# Luật kho trên diff của lượt tro-ly-okr-de-xuat

Sinh bởi `node _acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs`. So HEAD `8ebc64360133` với `git merge-base HEAD origin/onehub` = `7db7cea33309`. 89 tệp thêm hay sửa dưới apps/ và packages/ (đã bỏ tệp sinh, *.md, *.json), 14876 dòng thêm.

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

## 2. API không gọi model hay vendor

Lệnh:

```
git diff -U0 7db7cea33309 HEAD -- apps/api/src/okr/tro-ly.service.ts apps/api/src/agent/agent-trigger.service.ts
grep -iE 'generateText|streamText|generateObject|streamObject|@ai-sdk|openai|anthropic|gateway|fetch\(' trên dòng thêm và trên cả tệp hiện tại; in các dòng import
```

Kết quả:

```
# apps/api/src/okr/tro-ly.service.ts
dòng thêm khớp: 0
cả tệp khớp: 0
nguồn nhập:
  import type { Db, Prisma } from "@crm/db";
  import { chiTieuThang, doiSoatGanNhat, thangVN } from "@crm/db/ai-chi-phi";
  import {
  } from "@crm/db/ai-chi-phi-danh-muc";
  import { danhSachDeXuat } from "@crm/db/okr-de-xuat";
  import {
  } from "@crm/db/okr-tro-ly";
  import {
  } from "@crm/db/okr-tro-ly-danh-muc";
  import { docDiemXuHuong, xuHuongKr as tinhXuHuong } from "@crm/db/okr-xu-huong";
  import { kiemOkr } from "@crm/validation/okr-kiem";
  import {
  } from "@crm/validation/okr-kiem-de-xuat";
  import { kieuKr } from "@crm/validation/okr-kr";
  import {
  } from "@crm/validation/okr-tro-ly";
  import {
  } from "@nestjs/common";
  import type { z } from "zod";
  import { AgentTriggerService } from "../agent/agent-trigger.service";
  import { InjectDatabase } from "../database/database.constants";
  import {
  } from "./okr.contracts";
  import { OkrService } from "./okr.service";
  import { chonDonVi, donViCua, OkrAccessService } from "./okr-access.service";
  import { OKR } from "./okr-config";
  import {
  } from "./tro-ly-so-do";
# apps/api/src/agent/agent-trigger.service.ts
dòng thêm khớp: 0
cả tệp khớp: apps/api/src/agent/agent-trigger.service.ts:661: const response = await fetch(agent.url(path), {
nguồn nhập:
  import { type Db, type FieldEntity, Prisma } from "@crm/db";
  import { PRIORITY } from "@crm/db/agent-tasks";
  import { CRM_EVENT_CATALOG, type CrmEventType } from "@crm/db/crm-events";
  import { RECORD_ID_COLUMNS } from "@crm/db/fields";
  import { lockIdempotencyKey } from "@crm/db/idempotency";
  import { fieldBackfillPayload } from "@crm/validation/field-backfill";
  import type { DocSheetPayload } from "@crm/validation/okr-nguon";
  import type { SoanTuNguonPayload } from "@crm/validation/tai-lieu-nguon";
  import { Injectable, Logger } from "@nestjs/common";
  import { InjectDatabase } from "../database/database.constants";
  import { AGENT_DISPATCH } from "./agent-dispatch.config";
  import { bridge } from "./bridge";
```

Kết luận: không dòng thêm nào của lượt gọi model, SDK AI hay fetch; 1 dòng khớp nằm ở phần cũ của tệp, ngoài diff lượt này (in ở trên); nguồn nhập không có SDK AI hay vendor.

## 3. Hằng tinh chỉnh ở một tệp cấu hình

Lệnh:

```
sed -n '/export const TRO_LY_OKR_TRAN = {/,/^} as const;/p' packages/db/src/okr-tro-ly-danh-muc.ts
git diff -U0 7db7cea33309 HEAD -- apps packages   rồi grep từng mẫu số trên dòng thêm của tệp nguồn
```

Kết quả:

```
# packages/db/src/okr-tro-ly-danh-muc.ts (dòng 5–77)
export const TRO_LY_OKR_TRAN = {
	chu: {
		tenMucTieu: 200,
		tenKr: 200,
		viSao: 500,
		lyDo: 200,
		cauHoi: 200,
		cauTomTat: 280,
	},
	soDongDeXuat: 8,
	soCauTomTat: 6,
	soNguonMoiCau: 4,
	tranThangMacDinhUsd: 9,
	tranThangToiDaUsd: 20,
	tuCam: [
		"lương",
		"thưởng",
		"xếp loại",
		"xếp hạng",
		"đánh giá nhân viên",
		"đánh giá hiệu suất",
		"KPI",
		"bảng xếp hạng",
		"huy hiệu",
		"điểm đổi quà",
		"khách hàng",
		"deal",
		"cơ hội",
		"doanh số",
		"phễu",
		"dự án",
		"task",
		"nhiệm vụ",
	],
	soBangChu: {
		hauToCo: [
			"tỷ",
			"tỉ",
			"triệu",
			"nghìn",
			"ngàn",
			"trăm",
			"mươi",
			"%",
			"phần trăm",
		],
		namSauCum: [
			"cuối",
			"đầu",
			"giữa",
			"trong",
			"mỗi",
			"hằng",
			"hàng",
			"cả",
			"nửa",
			"của",
			"chỉ tiêu",
			"kế hoạch",
		],
		namTruocCum: ["nay", "tới", "sau", "trước", "ngoái", "học", "tài chính"],
		dauCau: [".", "!", "?", ";", ":"],
	},
	soChuHoTenToiThieu: 2,
	troLyNgayMoiNguoi: 20,
	luotAnMoiNgay: 40,
	nhipAnMucTieuMs: 30 * MINUTE_MS,
	hanKiemKhoaMs: 10 * MINUTE_MS,
	hoiLaiMs: 1.5 * SECOND_MS,
	tranChoMs: 30 * SECOND_MS,
	diemXuHuongToiThieu: 3,
	hoanTacNgay: 7,
} as const;

# số tinh chỉnh trên dòng thêm của tệp nguồn (bỏ packages/db/src/okr-tro-ly-danh-muc.ts, apps/agent/agent/lib/okr/config.ts, apps/api/src/okr/okr-config.ts và tệp kiểm, evals, proto)
[30 phút] 0 dòng
[40] 0 dòng
[20] 2 dòng
  apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:597: <Skeleton className="h-20 w-full" data-khung-dong />
  apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx:598: <Skeleton className="h-20 w-full" data-khung-dong />
[30 000] 0 dòng
[1 500] 0 dòng
[7 ngày] 0 dòng
```

Kết luận: 2 dòng khớp mẫu số — đọc từng dòng: số trong khuôn Zod, cỡ chữ hay chỉ số mảng không phải hằng tinh chỉnh.

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
