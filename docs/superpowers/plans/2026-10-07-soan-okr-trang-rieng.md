# Soạn OKR trang riêng (K2) — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa Soạn OKR từ sheet sang trang `/<slug>/okr/soan/<cuộc>` với bản nháp `KaraArtifact` dòng inline, hoàn tác mọi quyết định, nhận cả nhóm, khoá khi Kara soạn, mốc nộp hai chiều, hỏi Kara từ dòng, quyết trên bảng gửi kèm lượt sau, số giữ theo khoá dòng.

**Architecture:** Trang máy chủ prefetch rồi trao cho `TrangSoan` (client). Hook `useCuocSoan` giữ nguyên lõi (agent eve, thử lại, huỷ lượt — R1h), thêm hàng quyết, chip ngữ cảnh, số theo `khoaDong`. Ba module thuần mới (`moc-nop.ts`, `khoi-ngu-canh.ts`, `so-theo-khoa.ts`) mang mọi luật tính, có bài đơn vị riêng. API mở rộng `soanQuyet` bằng `quyet: "hoan"` và `kem`, không thêm thủ tục.

**Tech Stack:** Next.js App Router (cacheComponents), React 19, tRPC + TanStack Query, nuqs, eve/react, NestJS + Prisma, bun test (jsdom qua `packages/ui/test/setup-dom.ts`), shadcn `resizable` (react-resizable-panels), AI Elements.

**Spec:** `docs/superpowers/specs/2026-10-07-soan-okr-trang-rieng-design.md` · hợp đồng `_acceptance/soan-okr-trang-rieng/contract.md` (đã duyệt 07/10) · evals `_acceptance/soan-okr-trang-rieng/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md). Chữ hiển thị qua `apps/app/lib/messages/okr-soan.ts` (vi + en); tệp chữ chung chỉ thêm dòng.
- `/packages/ui` là nguồn giao diện duy nhất; không `className` đổi màu/góc/khoảng cách của thành phần `@crm/ui`; biến thể mới làm trong `packages/ui`.
- Client component không import `@crm/db`/`@crm/auth`; `"use client"` chỉ nhập `@crm/ui/components/<tên>` theo subpath, tRPC client, React.
- Hằng tinh chỉnh vào `SOAN_UI` (`soan/cau-hinh.ts`), một chỗ.
- Parse ở biên: đầu vào `nop_ban_nhap` qua `parseBanNhap`/`banNhap.safeParse` của `@crm/validation/okr-cuoc-soan`; không truyền `Record<string, unknown>`.
- Ranh giới tệp: `docs/plan/dot-sau-14-10/README.md` mục 2 (K2) + duyệt `tra-loi/P1-3`, `P1-4`, `P1-6`. Bốn tệp chung (`theo-don-vi.tsx`, `thanh-tab.tsx`, `proto/registry.ts`, `proto/catalog.ts`) chỉ thêm dòng; `proposed-change.tsx`, `kara/transcript.tsx`, `packages/ui/src/lib/messages.ts`, `config.yaml`, `messages-guard.spec.ts` chỉ thêm dòng.
- `SOAN_UI.khoHep = "(max-width: 1023px)"`; ô hội thoại mặc định 380 px, tối thiểu 300 px, tối đa 50% thân.
- Bài DOM chạy bằng `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/<tệp> -t <tag>`; bài API qua `bun run test -- "cd apps/api && bun test test/<tệp>"` (CSDL riêng mỗi lượt).
- Mỗi phép đo mới đi kèm chiều đỏ trên cùng fixture với thông điệp ghim (MEASURE-BIRTH-CLAUSE).
- Cổng 3000/3001 là của chủ kho; đo màn qua `bun run do:man` / `tien-de.mjs`.

## Review Focus

1. Kara nộp lại đúng lúc người đang sửa chữ một dòng — chữ đang sửa không mất, dòng không nhảy sang id mới dưới tay (Task 5 thêm ca «đang sửa + nộp lại»).
2. Bấm «Hoàn tác» hai lần nhanh / bấm khi mutation trước chưa xong — chỉ một lời gọi, nút khoá khi đang chờ (Task 5 thêm ca bấm đúp).
3. `sessionStorage` đầy hoặc bị chặn (Safari riêng tư) — số vẫn sống trong bộ nhớ, không ném (Task 3, E11 đã có).
4. Mốc nộp khi transcript có lần nộp bị máy chủ từ chối cả bản (ketQuaNop báo lỗi) — mốc vẫn tính từ đầu vào, không vỡ chuỗi so sánh (Task 3 thêm ca hai lần nộp liền trùng nội dung → mốc rỗng ẩn).
5. Link cũ `?cuocSoan=` trỏ cuộc của đơn vị khác/không quyền — chuyển sang trang rồi trang báo «Không mở được», không lộ dữ liệu (Task 4 thêm ca).

---

### Task 1: API hoàn tác và nhận cả nhóm

**Phục vụ:** E5b, E6b (và E5, E6 phía giao diện dùng kiểu này). **independent: true**

**Files:**
- Modify: `apps/api/src/okr/okr.contracts.ts` (chỉ khối `soanQuyetInput`/`soanQuyetOutput` và `LY_DO_QUYET` — thêm `"chua-quyet"`, `"kem-sai"`)
- Modify: `apps/api/src/okr/soan-ban-nhap.ts` (thêm `ghiHoan`, `ghiNhom`; `ghiQuyet` rẽ nhánh)
- Modify: `apps/api/src/okr/soan.service.ts` (`quyet` giữ cổng `congCuoc`, chuyển nhánh)
- Create: `apps/api/test/soan-okr-hoan-tac.spec.ts`

**Interfaces:**
- Produces: `soanQuyetInput = z.object({ deXuatId: ma, quyet: z.enum(["nhan","sua","bac","hoan"]), giaTriCuoi: z.string().trim().min(1).optional(), kem: z.array(ma).max(BAN_NHAP_TRAN.kr.max).optional() }).refine(kem chỉ đi với quyet "nhan")`; `LY_DO_QUYET` thêm `"chua-quyet" | "kem-sai"`.
- `ghiHoan(tx, { deXuatId, cuoc, userId, now })`: dòng trong tập hiện, không ở `cho` → `cho` + xoá `giaTriCuoi/nguoiQuyet/quyetLuc`; Mục tiêu thì mọi con trong tập hiện ở `nhan|sua|bac` cùng về `cho`. Dòng đang `cho` → `{ ok:false, lyDo:"chua-quyet", chiTiet:null }`. Ngoài tập hiện → `ConflictException(T.dongCu)`.
- `ghiNhom`: Mục tiêu `cho` + mỗi id trong `kem` là KR con `cho` trong tập hiện → cùng `quyetLuc`, một giao dịch; sai bất kỳ → `{ ok:false, lyDo:"kem-sai" }`, không ghi.

- [ ] Viết `soan-okr-hoan-tac.spec.ts` với hai `describe`: `k2-api-hoan` (ma trận {MT, KR, căn chỉnh}×{nhan, sua, bac}→hoan = 8 ô; MT nhan + 2 KR nhan + 1 KR bac → hoan MT → 4 cho; MT bac kéo 3 KR → hoan → 4 cho; từ chối chua-quyet / dòng cũ / cuộc da-dua-vao so ảnh mọi hàng trước-sau; gọi qua tRPC và REST; đối chứng dương nhan) và `k2-api-nhom` (kem [a,c] → 3 hàng nhan cùng quyetLuc, b cho; hoan MT → 3 cho; kem KR khác MT / KR đã quyết → kem-sai không ghi; kem + quyet ≠ nhan → lỗi parse). Gieo bằng `soan-okr-san.ts` (`moCuoc`, `hangTuDongSoan`).
- [ ] Chạy `bun run test -- "cd apps/api && bun test test/soan-okr-hoan-tac.spec.ts"` → đỏ (quyet "hoan" không hợp lệ).
- [ ] Sửa lược đồ, `ghiHoan`, `ghiNhom`, nhánh trong `ghiQuyet`.
- [ ] Chạy lại → xanh. Chiều đỏ: bản sao `ghiHoan` không xoá `quyetLuc` → đỏ 'quyetLuc con sau hoan'; bản sao không kéo KR → đỏ 'kr con quyet sau hoan muc tieu'; ghi KR ngoài giao dịch → đỏ 'ghi nua chung'. Hoàn lại.
- [ ] `bun run test -- "cd apps/api && bun test test/soan-okr-dua-vao.spec.ts test/soan-okr-quyen.spec.ts"` vẫn xanh.
- [ ] Commit `feat(okr): soanQuyet hoàn tác và nhận cả nhóm`.

### Task 2: packages/ui — resizable, ba điểm cắm Kara

**Phục vụ:** E2, E2b, E4, E7, E8b (dựng nền cho N2-1…N2-4). **independent: true**

**Files:**
- Create: `packages/ui/src/components/resizable.tsx` (CLI shadcn, `--dry-run` trước, không `--overwrite`); Modify: `packages/ui/package.json`, `bun.lock` (chỉ qua `bun add react-resizable-panels` trong `packages/ui`)
- Modify: `packages/ui/src/components/proposed-change.tsx` (thêm prop `media?: boolean`, mặc định `true`; `false` thì bỏ `ItemMedia`)
- Modify: `packages/ui/src/components/kara/transcript.tsx` (`KaraCheckpointProps` thêm `label?: string`; có thì thay `msg.karaKhung.moc(summary)`)
- Modify: `packages/ui/src/lib/messages.ts` (thêm `karaKhung.mocDau: (s) => "Kara soạn bản nháp đầu: …"` / en `Kara drafted the first version: …`; `karaKhung.daQuyetHet`)
- Modify: `packages/ui/src/components/kara/proposal.tsx` (`KaraProposal` thêm `highlighted?: boolean` → `data-noi`, nền `accent` mờ dần, tắt khi `prefers-reduced-motion`; trong nhóm truyền `media={false}`; trong `KaraBusy` lý do khoá `sr-only`; `KaraProposalGroup` 0 chờ → `daQuyetHet`, đầu nhóm `flex-wrap` hai hàng ở khổ hẹp)
- Modify: `packages/ui/src/components/kara/artifact.tsx` (bận: một dòng lý do nhìn thấy dưới đầu khung)

**Interfaces:**
- Produces: `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` từ `@crm/ui/components/resizable`; `ProposedChangeProps.media?: boolean`; `KaraCheckpointProps.label?: string`; `KaraProposalProps.highlighted?: boolean`.

- [ ] `cd packages/ui && bun run ui:add resizable --dry-run`; đọc danh sách tệp; không đụng tệp sẵn có thì chạy thật; `bun add react-resizable-panels` nếu CLI chưa thêm. Sửa `resizable.tsx` theo `docs/reui.md`/design.md (icon Carbon, bỏ chú thích, góc theo thang, `aria-label` qua prop).
- [ ] Ba prop tuỳ chọn ở trên, mặc định giữ hành vi cũ; khoá messages mới cả hai tiếng.
- [ ] `cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/bo-xuong-kara.dom.tsx` và `bun test ./test/messages-guard.spec.ts` xanh (mặc định không đổi).
- [ ] `bun run check-types` gói ui xanh. Commit `feat(ui): resizable và ba điểm cắm Kara cho Soạn OKR`.

### Task 3: Luật thuần — mốc nộp, khối ngữ cảnh, số theo khoá dòng

**Phục vụ:** E8, E10, E11 (phần luật). **independent: true**

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/soan/moc-nop.ts`
- Create: `apps/app/app/(app)/[slug]/okr/soan/khoi-ngu-canh.ts`
- Create: `apps/app/app/(app)/[slug]/okr/soan/so-theo-khoa.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/soan/luat-ban-nhap.ts` (`soCua`, `krThieuSo`, `krDuaVao` đổi khoá `kr.id` → `kr.khoaDong`; `laDuSo(kr, so)`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/kieu.ts`, `cau-hinh.ts` (`khoHep` 1023, `noiMs: 2000`, `ocHoiThoai: { macDinhPx: 380, toiThieuPx: 300, toiDaPhanTram: 50 }`, `khoaSo: "okr-soan-so:"`)
- Create: `apps/app/test/soan-okr-moc.spec.ts`

**Interfaces:**
- `type TomTatMoc = { docDuoc: false } | { docDuoc: true; dau: boolean; mucTieu: number; kr: number; them: number; sua: number; chuyen: number; bo: number; dongDoi: string[] }`
- `tomTatMoc(truoc: BanNhap | null, sau: unknown): TomTatMoc` — parse `sau` bằng `banNhap.safeParse`; so theo khoá MT và `khoaMT/khoaKR`.
- `mocTuTranscript(items: TranscriptItem[]): { itemId: string; tom: TomTatMoc }[]` — chỉ `did` của `SOAN_UI.congCuNop`.
- `type KhoiNguCanh = { dong: { loai: "muc-tieu"|"kr"|"can-chinh"; chu: string } | null; quyet: QuyetBang[] }`; `type QuyetBang = { cach: "nhan"|"sua"|"bac"|"hoan"; loai: …; chu: string; khoaDong: string }`
- `vietKhoi(khoi: KhoiNguCanh, nguoi: string): string`, `docKhoi(tin: string): { khoi: KhoiNguCanh | null; nguoi: string }` (dấu mở/đóng là hằng `KHOI_MO`, `KHOI_DONG`; chữ người chứa đúng dấu được thoát), `rutGonQuyet(ds: QuyetBang[]): QuyetBang[]` (cặp quyết + hoàn tác cùng `khoaDong` triệt tiêu).
- `docSoDaLuu(cuocSoanId): SoDaGo`, `ghiSoDaLuu(cuocSoanId, so): void` — `sessionStorage` bọc try/catch.

- [ ] Viết `soan-okr-moc.spec.ts`: `tom-tat-moc` (7 ô E8 + ca Review Focus 4: hai lần nộp trùng nội dung → mọi số 0), fixture qua `banNhap.parse`; `khoi-ngu-canh` (6 ô khứ hồi E10 + rút gọn hàng); `so-theo-khoa` (ghi/đọc, sessionStorage ném khi ghi, khoá theo cuộc).
- [ ] Chạy → đỏ (module chưa có). Viết ba module + đổi khoá trong `luat-ban-nhap.ts`. Chạy → xanh.
- [ ] Chiều đỏ: so KR chỉ theo khoa KR → 'chuyen khong dem: 0 != 1'; `docKhoi` tách theo xuống dòng đầu → 'khu hoi lech: ten dong co xuong dong'. Hoàn lại.
- [ ] `bun run test -- "cd apps/app && export TZ=Asia/Ho_Chi_Minh && bun test ./test/soan-okr-luat.spec.ts ./test/soan-okr-moc.spec.ts"` xanh. Commit `feat(okr-soan): luật mốc nộp, khối ngữ cảnh, số theo khoá dòng`.

### Task 4: Trang, đầu trang, khung co giãn, lối vào

**Phục vụ:** E1, E2b (và nền cho E1b, E2). **independent: false** (cần Task 2)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/soan/[cuocSoanId]/page.tsx` (máy chủ: `requireSession`, prefetch `okr.soanDanhSach`, `okr.access`, `workspace.get`, `HydrateClient`, `<Suspense>`)
- Create: `apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx` (client: đầu trang, `KhungSoan`)
- Create: `apps/app/app/(app)/[slug]/okr/soan/khung-soan.tsx` (rộng: `ResizablePanelGroup`; hẹp: `Tabs` với `?tab=` qua nuqs; `kichMacDinh(beRongThan)` xuất ra)
- Modify: `soan/nut-soan.tsx` (bỏ `ManSoan`/`useQueryState(cuocSoan)`; `router.push(duongTrangSoan(slug, id))`), `soan/luat-ban-nhap.ts` (`duongTrangSoan`)
- Modify (chỉ thêm): `okr/thanh-tab.tsx` (`DauTrangOkr` trả `null` khi `laTrangSoan(pathname)`), `okr/theo-don-vi/theo-don-vi.tsx` (đọc `cuocSoan` → `router.replace(duongTrangSoan…)`)
- Delete: `soan/man-soan.tsx` (thay bằng `trang-soan.tsx`)
- Modify: `apps/app/lib/search-param-keys.ts` nếu cần khoá `tab` — KHÔNG trong ranh giới → dùng khoá cục bộ trong `cau-hinh.ts` (`SOAN_UI.thamSo.tab = "tab"`)
- Create/Modify: `apps/app/test/soan-okr-trang.dom.tsx`, `apps/app/test/khung-soan-okr.tsx` (thêm `moTrang()` dựng `TrangSoan` với router giả, `matchMedia` giả)

**Interfaces:**
- Produces: `TrangSoan({ cuocSoanId, quanTri, cauNoi })`, `KhungSoan({ hoiThoai, banNhap, soDong })`, `duongTrangSoan(slug, cuocSoanId): string`, `laTrangSoan(pathname: string): boolean`, `kichMacDinh(beRongThanPx: number): number`.

- [ ] Viết `-t k2-duong` (5 ô E1 + ca Review Focus 5: id cuộc không quyền → «Không mở được») và `-t k2-khung` (4 ô E2b) trong `soan-okr-trang.dom.tsx`.
- [ ] Chạy → đỏ. Dựng trang, khung, sửa nút, thêm nhánh thanh tab và chuyển hướng.
- [ ] Chạy → xanh; chiều đỏ của E1, E2b. `bun run check-types` app xanh. Commit `feat(okr-soan): trang riêng, khung co giãn, lối vào`.

### Task 5: Bản nháp — dòng inline, quyết, hoàn tác, nhóm, khoá, còn thiếu

**Phục vụ:** E3, E4, E5, E6, E7, E11, E12. **independent: false** (Task 1, 2, 3, 4)

**Files:**
- Rewrite: `soan/bang-nhap.tsx` → `BanNhap` dựng `KaraArtifact` (title, meta, actions «Chỉ dòng chờ» `?loc=cho`, footer `ChanDuaVao`, busy)
- Rewrite: `soan/the-nhap.tsx` → `NhomMucTieu` (`KaraProposalGroup`), `DongMucTieu`, `DongKr`, `DongCanChinh` (`KaraProposal` inline, `media` tắt trong nhóm), ô số dưới biên nhận khi đã nhận, nút «Hỏi Kara về dòng này» (`onHoi(dong)`), `highlighted` theo `dongNoi`
- Modify: `soan/dung-cuoc-soan.ts` (`useNhapCuoc`: `so` theo `khoaDong` + `docSoDaLuu`/`ghiSoDaLuu` sau gắn; `quyet` nhận `"hoan"` và `kem`; hàng quyết `quyetBang` + `rutGonQuyet`; `dongNoi` state; bỏ quyết trùng khi mutation đang chờ)
- Modify: `soan/loi-cua.ts` (`lyDoQuyetTuLoi(e)`: `TRPCClientError` CONFLICT → `"dong-cu" | "cuoc-khong-dang"` theo câu máy chủ)
- Modify: `apps/app/lib/messages/okr-soan.ts` (chỉ thêm khoá: `banNhap.tieuDe`, `meta`, `dangSoanDau`, `themMucTieu`, `themKr`, `themCanChinh`, `themNhom(n)`, `daThemNhom(stt,n)`, `hoanKem(n)`, `hoiKara`, `conThieu`, `duaVao(mt,kr)`, `lyDoQuyet.chua-quyet|kem-sai|dongCu|cuocKhongDang`, …)
- Modify: `apps/app/test/soan-okr-trang.dom.tsx`

**Interfaces:**
- Consumes: Task 1 `soanQuyetInput`; Task 2 `media`, `highlighted`; Task 3 `laDuSo`, `docSoDaLuu`, `rutGonQuyet`; Task 4 `KhungSoan`.
- Produces: `CuocDangSoan` thêm `quyetBang: QuyetBang[]`, `boQuyetBang(): QuyetBang[]`, `dongNoi: string | null`, `noiDong(khoaDong)`, `hoiVeDong: DongSoan | null`, `datHoiVeDong(d | null)`.

- [ ] Viết `-t k2-trang-thai` (6 ô), `-t k2-dong`, `-t k2-quyet` (12 ô + ca Review Focus 2 bấm đúp), `-t k2-nhom`, `-t k2-khoa`, `-t k2-so` (+ ca Review Focus 1: đang sửa chữ + nộp lại), `-t k2-dua-vao`.
- [ ] Chạy → đỏ. Viết lại `bang-nhap.tsx`, `the-nhap.tsx`, nối hook.
- [ ] Chạy → xanh; mọi chiều đỏ ghim trong evals E3–E7, E11, E12. Commit `feat(okr-soan): bản nháp KaraArtifact, hoàn tác, nhóm, khoá, còn thiếu`.

### Task 6: Hội thoại — Kara khung chung, mốc hai chiều, chip dòng, dòng hệ thống

**Phục vụ:** E7 (Dừng), E8b, E9, E10b. **independent: false** (Task 3, 4, 5)

**Files:**
- Rewrite: `soan/hoi-thoai-soan.tsx` → `KaraTranscript`, `KaraTurn`, `KaraCheckpoint` (`label` mốc đầu), `KaraSystemLine` (khối quyết đọc từ tin người + hàng chưa gửi), `KaraSteps` cho bước đọc/nộp, `KaraState` cho lỗi/hết lượt/chưa cấu hình; `KaraComposer` (context chip, Dừng = `huyLuot`)
- Modify: `soan/dung-cuoc-soan.ts` (`gui(chu)` → `vietKhoi({ dong: hoiVeDong, quyet: rutGonQuyet(quyetBang) }, chu)`, xoá hàng sau gửi; `mocs = mocTuTranscript(...)`; `cuonToiMoc`, `cuonToiDong`)
- Modify: `soan/tach-cau-hoi.ts` (tin người qua `docKhoi` trước)
- Modify: `apps/app/lib/messages/okr-soan.ts` (chỉ thêm: `moc.dau`, `moc.doi`, `moc.khongDoc`, `heThong.seGui`, `heThong.daQuyet`, …)
- Modify: `apps/app/test/soan-okr-trang.dom.tsx`, `apps/app/test/messages-guard.spec.ts` (chỉ thêm ghim khoá mới)

- [ ] Viết `-t k2-moc`, `-t k2-hoi-dong`, `-t k2-he-thong`.
- [ ] Chạy → đỏ. Viết lại hội thoại, nối mốc/chip/hàng.
- [ ] Chạy → xanh; chiều đỏ E8b, E9, E10b. Chạy lại toàn bộ `soan-okr-trang.dom.tsx` và `messages-guard.spec.ts`. Commit `feat(okr-soan): hội thoại Kara, mốc hai chiều, hỏi từ dòng, dòng hệ thống`.

### Task 7: Bài kiểm cũ của Soạn OKR theo trang mới

**Phục vụ:** suite xanh (`bun run test`). **independent: false** (Task 4–6)

**Files:** Modify `apps/app/test/khung-soan-okr.tsx`, `soan-okr.dom.tsx`, `soan-okr-hong.dom.tsx`, `soan-okr-thu-lai.dom.tsx`, `soan-okr-thu-lai-45s.dom.tsx`, `soan-okr-song-lai.dom.tsx`, `soan-okr-so-do.dom.tsx`, `soan-okr-cai-dat.dom.tsx` — đổi `moMan` (sheet) sang `moTrang`, đổi bộ chọn `[data-man-soan]`, `[data-cot]` theo trang mới; giữ nguyên lời hứa của từng bài (thử lại, 45 giây, hỏng, không trừ lượt).

- [ ] Chạy cả thư mục: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr*.dom.tsx` → liệt đỏ.
- [ ] Sửa khung và bộ chọn, không nới khẳng định nào; ca nào lời hứa đổi theo K2 (vd «Chưa có dòng nào» khi đang soạn) thì đổi theo hợp đồng K2 và ghi dòng sổ `fix`.
- [ ] Xanh hết. Commit `test(okr-soan): bài kiểm cũ theo trang soạn mới`.

### Task 8: Cổng mồ côi, tài liệu, răng script

**Phục vụ:** E13, E13b, E13c, E16. **independent: false** (Task 4–6)

**Files:**
- Modify: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` (MIEN_TRU rỗng; cầu đi qua `components/kara/*.tsx`)
- Modify: `docs/chat-ui.md` (hai hàng artifact/task + đoạn miễn trừ), `docs/ai-ux.md` (thêm hàng K2 ở lộ trình)
- Create: `_acceptance/soan-okr-trang-rieng/rang/mo-coi-hai-chieu.mjs`, `rang/ranh-gioi.mjs`, `rang/tai-lieu.mjs`

- [ ] Viết ba script với chiều đỏ ghim (bản sao trong thư mục tạm ngoài gói — luật bản sao đột biến).
- [ ] Chạy `node _acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` và ba script → xanh; chạy chiều đỏ → đúng thông điệp. Chạy `config:executors.script.k2_san_thiet_ke`.
- [ ] Commit `feat(acceptance): cổng mồ côi đi qua kara/, gỡ miễn trừ K1; tài liệu`.

### Task 9: Răng đo màn `rang/man.mjs` với Kara mô hình giả

**Phục vụ:** E1b, E2, E8c, E9b, E10c, E11b, E12b, E14 (và ảnh cho E15). **independent: false** (Task 4–6)

**Files:** Create `_acceptance/soan-okr-trang-rieng/rang/man.mjs`, `rang/kich-ban.mjs` (kịch bản mô hình giả viết trước: hai lần nộp, nộp lại giữ khoá, ghi đầu vào ra ndjson — dựa `apps/agent-okr/test/support/mo-hinh-gia.ts` và `soan-okr-cung-tro-ly/rang/phien-soan.mjs`)

- [ ] `--phan duong|khung|moc|hoi-dong|he-thong|so|dua-vao|ma-tran`, mỗi phần in «buoc N: dat»; `--kiem-do-do <ten>` cho từng chiều đỏ của evals; dấu mốc cây; bảng tab theo trạng thái cho E14; chụp `evidence/E14-<id>-<khổ>-<nền>.png`.
- [ ] Chạy từng phần qua `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/soan-okr-trang-rieng/rang/man.mjs --phan <p>"` → xanh; mỗi chiều đỏ → đúng thông điệp, mã 1.
- [ ] Commit `feat(acceptance): răng đo màn Soạn OKR trang riêng`.

### Task 10: Cổng của kho

**Phục vụ:** suite S4. **independent: false**

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test`, `bun run build` — đều xanh (bọc `giu-nhip` nếu đang giữ khoá).
- [ ] Commit sửa nếu có; set contract `status: implemented`; vào S4.

### Task 11: Ghim lại hồ sơ bị chạm (sau Cổng Bằng chứng, trước PR)

**Phục vụ:** lưới kiểm trước khi gộp (kit 2.24 chỉ soi hồ sơ có trong diff). **independent: false** — đi cuối cùng, ở đỉnh nhánh đã hợp nhất `origin/onehub`.

- [ ] Hợp nhất `origin/onehub`; `bun install` nếu `package.json`/`bun.lock` đổi (luật 4); số commit `onehub` chưa có trong nhánh = 0.
- [ ] Xin khoá `ghim-lai`; chạy làn ghim lại của feature-loop cho hồ sơ `nen-chat-ai-elements` (lý do «K2 gỡ miễn trừ cổng mồ côi») qua lệnh bọc `giu-nhip`, thêm hồ sơ nào khác mà lưới gọi tên.
- [ ] Lưới kiểm trước khi gộp chạy cả bản không giới hạn hồ sơ; xanh → nhả khoá, commit, đẩy.
