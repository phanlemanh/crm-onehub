# Bấm KR mở chi tiết KR — thiết kế (SV6)

Hàng SV6 `bam-kr-mo-chi-tiet-kr` của `docs/plan/lo-trinh-okr.json` (thêm qua #557). Căn cứ: bốn luật «Bấm vào KR và cập
nhật» chủ kho chốt 24/10 (nguyên văn trong ghi chú `SV6-luat-bam-kr.md` của giám sát vk; vào `docs/design.md` mục «Nếp màn»
qua #557 — khi #557 gộp, căn cứ đổi sang `docs/design.md`). Đọc trên onehub `09d7d1dcf`.

Đọc trước khi viết: `AGENTS.md`, `docs/design.md` (nếp màn, «Dấu hiệu vẽ tay»), `docs/agent-panel.md` không áp, `CONTEXT.md`
(KR, Cập nhật tuần — đổi trong #557), `.agents/skills/web-design-guidelines` (tiêu điểm, tên truy cập của nút).

## Hiện trạng

Ngăn bản ghi xếp chồng ở URL `?record=objective:<id>|kr:<id>` (`components/crm/record-sheet/record-stack.ts`); mở bằng
`useOpenRecord()` / `openRecord({ kind, id })`. Bốn chỗ trái luật 2 «bấm KR ở bất kỳ đâu → chi tiết KR»:

| Nơi bấm | Hôm nay | Sau vòng |
| --- | --- | --- |
| Của tôi › «KR bạn phụ trách»: tên KR (`phan-kr-phu-trach.tsx:83-86`) | `openRecord({kind:"objective", id: mucTieu.id})` | `{kind:"kr", id: k.id}`; dòng phụ «đơn vị · mục tiêu» giữ nguyên chữ |
| Cây căn chỉnh: chọn nút (`cay-can-chinh.tsx:258-260`) | mọi nút mở `nut.objectiveId` | nút `loai === "kr"` mở `{kind:"kr", id: nut.id}` (id nút KR là id KR: `apps/api/src/okr/can-chinh.ts:91`); nút mục tiêu giữ |
| Của tôi › Việc OKR: nút cuối dòng (`viec-cua-toi.tsx:188-196`) | «Mở mục tiêu» kể cả việc có `keyResultId` | có `keyResultId` → nút «Mở KR» mở `{kind:"kr"}`; không có → giữ «Mở mục tiêu» |
| Chi tiết mục tiêu › `BangKr`: tên KR (`bang-kr.tsx:366-368`) | `<span>` chữ | `Button variant="link"` mở `{kind:"kr", id: kr.id}`, chồng lên ngăn mục tiêu như `SoViecKr` (`bang-kr.tsx:194-203`) |

Chỗ đã đúng, không chạm: bảng Danh sách (`theo-don-vi/bang.tsx:391`), Họp tuần (`hop-tuan.tsx:111`), `khoi-kr-cua-toi.tsx:47`,
«Mới KR» (`moi-kr.tsx:274`), Quanh mục tiêu (`the-quanh.tsx:18`).

## Chữ

Luật «Chữ»: check-in gọi là «Cập nhật», bỏ «tuần» — ghi bất cứ lúc nào; nhịp tuần là khuyến nghị vận hành. Giữ cụm chỉ
khoảng thời gian («… tuần này») và «ngày cập nhật» (thuộc tính của chu kỳ).

| Tệp · khoá | Hôm nay (vi) | Sau vòng (vi) | en |
| --- | --- | --- | --- |
| `okr.ts` `capNhatTuan` (dòng 340) | Cập nhật tuần | Cập nhật | Weekly update → Update |
| `okr.ts` `"cap-nhat-tuan"` (393) | Cập nhật tuần | Cập nhật | Weekly update → Update |
| `okr.ts` `capNhatTuan` (751) | Cập nhật tuần | Cập nhật | tương ứng |
| `okr-toan-canh.ts` `chuaCapNhat` (107) | Tuần này chưa có Cập nhật tuần nào | Tuần này chưa có lần cập nhật nào | No updates yet this week |
| `okr-toan-canh.ts` (109) | … ít nhất một lần Cập nhật tuần. | … ít nhất một lần cập nhật. | … at least one update. |
| `okr-toan-canh.ts` (151) | … ít nhất một lần Cập nhật tuần … | … ít nhất một lần cập nhật … | … at least one update … |
| `okr-soan.ts` `"3-tom-gon"` (271) | Lớp 3: dòng tóm gọn Cập nhật tuần | Lớp 3: dòng tóm gọn lần cập nhật | Layer 3: update summaries |
| `apps/agent/agent/lib/tin-nhac.ts` `"okr-cap-nhat"` (31) | Cập nhật tuần | Cập nhật | — |

`okr-toan-canh.ts:288` en «after the first weekly update» → «after the first update». Khoá giữ nguyên tên (`capNhatTuan`,
`cap-nhat-tuan`) — đổi tên khoá là đổi mã không người dùng nào thấy.

Bảng trên là **bảng cặp** của vòng: S3 chép nó thành `_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json` (chuỗi cũ →
chuỗi mới, vi và en) trước khi sửa chữ. E5 đòi đúng chuỗi mới; E6 đòi mỗi khối diff ở bài kiểm đã ký là đúng một cặp của
bảng. Chuỗi «Cập nhật tuần» nào S3 gặp thêm (E5 quét mọi tệp dưới `apps/app/lib/messages/` và chữ trong mã
`apps/agent/agent/lib/`) thì thêm một cặp vào bảng trong cùng commit, nêu ở mô tả PR.

Ngoài vòng: lời dặn model `apps/agent/agent/lib/okr/chi-dan-tom-tat.ts` (đổi chữ trong lời dặn là đổi đầu vào model — một
hàng riêng có đo), nhãn trạng thái bản mẫu `apps/app/app/proto/**`, `CONTEXT.md` (#557).

## Mọi chỗ mở bản ghi dưới khu OKR

Bốn chỗ ở trên do giám sát dò; luật 2 nói «ở bất kỳ đâu». E7 quét lúc chạy mọi lời gọi `openRecord` / `useOpenRecord`
dưới `apps/app/app/(app)/[slug]/okr/` (16 tệp lúc đọc) và so với bảng viết trước
`_acceptance/bam-kr-mo-chi-tiet-kr/rang/cho-mo-ban-ghi.json` — S3 viết bảng TRƯỚC khi sửa mã, mỗi chỗ gọi một dòng (tệp,
mỏ neo, `kind`, nguồn là mục tiêu hay KR). Chỗ nguồn là KR mà mở mục tiêu là đỏ; chỗ gọi mới chưa có trong bảng là đỏ.
Thấy chỗ thứ năm trái luật lúc viết bảng → sửa trong vòng và thêm một dòng sổ `fix`.

## Hồ sơ đã ký

Đổi chữ chạm bài kiểm đã ký khẳng định «Cập nhật tuần» (đọc 24/10): `apps/app/test/tro-ly-okr-tom-tat.dom.tsx`,
`apps/api/test/okr-mau.spec.ts`, `apps/agent/test/kara-mot-ten.spec.ts`, `apps/agent/test/okr-nhac.integration.spec.ts`,
`apps/agent/test/fixtures/tin-nhac-truoc-tb1.json`, `packages/validation/test/okr-tom-gon-ky.spec.ts`,
`_acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs`.

`apps/agent/test/fixtures/tin-nhac-truoc-tb1.json` là ảnh chụp tin nhắc trước vòng TB1 (`thong-bao-ghi.integration.spec.ts`
đọc lịch sử git của nó) — dữ liệu lịch sử, không đổi; bài nào so tin hôm nay với ảnh chụp thì đổi kỳ vọng qua bảng cặp
(câu hỏi ở Cổng Phạm vi). Luật tạm «không tự sửa thước hồ sơ đã ký»: mỗi tệp đổi đúng một lớp
(chuỗi kỳ vọng) và hồ sơ chủ của nó có một dòng sổ `fix` decided_by chủ kho — chủ kho đã chấp thuận đổi chữ («Đồng ý hết
theo khuyến nghị», 24/10). `khong-doi-hinh.mjs` (E6) quét lớp lúc chạy để không sót tệp.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Của tôi / Cây căn chỉnh / Việc OKR / chi tiết mục tiêu → bấm KR → ngăn chi tiết KR mở (điểm ra: nút «Cập nhật» ở
  đầu ngăn mở hộp cập nhật một KR — có từ trước).
- Biên: bấm KR trong chi tiết mục tiêu → ngăn KR chồng lên ngăn mục tiêu; đóng ngăn KR về lại mục tiêu. Việc chỉ gắn mục tiêu
  vẫn mở mục tiêu.
- Lỗi & quay lại: KR đã bị xoá hay không còn quyền xem → ngăn KR hiện trạng thái lỗi sẵn có của ngăn (không đổi trong vòng).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn chi tiết KR | xem một KR và cập nhật nó | bốn chỗ bấm KR / hộp cập nhật một KR, ngăn mục tiêu bên dưới |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bkr-mo-kr | Ngăn chi tiết KR | ngăn KR của KR vừa bấm, URL `record=…kr:<id>` | đọc, bấm «Cập nhật» |
| ST-bkr-chong | Ngăn KR trên ngăn mục tiêu | hai ngăn xếp chồng, `record=objective:<O>|kr:<K>` | đóng để về mục tiêu |
| ST-bkr-viec-muc-tieu | Của tôi › Việc OKR | việc chỉ gắn mục tiêu giữ nút «Mở mục tiêu» | mở mục tiêu |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên KR trong `BangKr` là nút: Tab tới, Enter mở; tên truy cập là tên KR; tên là dữ liệu người nhập nên `translate="no"`.
- Nút «Mở KR» ở Việc OKR cùng cỡ và kiểu với «Mở mục tiêu» (`size="sm" variant="outline"`).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Button variant="link"` | dùng | như tên KR ở «KR bạn phụ trách»; không vẽ nút mới |
| `useOpenRecord` / ngăn bản ghi | dùng | đường mở bản ghi duy nhất của app |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: (ii) không tra — luồng hiển nhiên: luật 2 chủ kho chốt «Click vào KR -> Chi tiết KR», như Tability (ảnh
`docs/findings/2026-10-22-hop-tuan/tab/t03-ngan-kr.jpg`).
<!-- UX-SPEC-TEMPLATE>>> -->

## Tệp dự kiến

- `apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx`, `cay-can-chinh.tsx`, `viec-cua-toi.tsx`, `bang-kr.tsx`.
- `apps/app/lib/messages/okr.ts` (thêm `moKr`, đổi chữ), `okr-toan-canh.ts`, `okr-soan.ts`; `apps/agent/agent/lib/tin-nhac.ts`.
- Bài kiểm: `apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx`, `apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts`; bộ quét
  `_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs`; các bài đã ký đổi chuỗi theo mục «Hồ sơ đã ký».
