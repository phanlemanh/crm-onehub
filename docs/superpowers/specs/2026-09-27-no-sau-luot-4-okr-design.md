# Nợ sau lượt 4 OKR — thiết kế

Hồ sơ `_acceptance/no-sau-luot-4-okr/`. Hạng mục `4n` ở mục 10 của
`docs/plan/lo-trinh-okr.md`. Mẫu: vòng `no-sau-luot-5-okr` (#159).

## 1. Vì sao có vòng này

Khi ký Cổng Bằng chứng của lượt 4 `cap-nhat-tuan-okr` (26/09), chủ kho chọn «mở hợp
đồng mới» cho năm mục ngoài hợp đồng (sổ `d-20260926T062336Z-37` … `-40`, `-43` của
hồ sơ đó). Vòng này gom cả năm vì chúng cùng một khu — nhắc buổi sáng, cập nhật tuần,
vết OKR — và phục vụ cùng một ngày: mọi phòng ban vào CRM 26/10.

| Mục | Người dùng thấy gì hôm nay | Nặng |
| --- | --- | --- |
| Ngoài-8 | Một người nhận tin «được nhắc tên» hay «được giao» vào giữa trưa, mở đầu bằng «sáng nay», rồi sáng hôm sau nhận lại đúng mục đó | lỗi đang gặp |
| Ngoài-2 | Mục «Cập nhật» trên từng KR ở sheet mục tiêu tự tính ai được bấm; khi luật ghi hộ đổi ở máy chủ, sheet có thể mở cho sai người hoặc chặn nhầm người phụ trách | rủi ro |
| Ngoài-3 | Một lần gửi cập nhật tuần có thể ghi hai bản cho cùng một KR; bản thừa không xoá được, tỷ lệ cập nhật tuần lệch | rủi ro |
| Ngoài-4 | Một dòng vết hỏng khuôn bị coi lặng lẽ là «không ai được giao» — việc «được giao» biến mất mà không ai biết | rủi ro |
| Ngoài-5 | Khuôn mục nhắc OKR viết tay ở năm chỗ; thêm một loại nhắc mới mà quên một chỗ thì nó rơi khỏi tin buổi sáng, không báo gì | rủi ro |

## 2. Cơ chế lỗi của Ngoài-8 (đọc từ mã)

Nhịp dispatch chạy mỗi phút. Từ 08:30 giờ VN, `lenLichNhac` tính `viecCanNhac(now)`
cho mọi người và ghi một `AgentTask` mỗi người mỗi ngày (khoá `user:<id>:<ngày>`,
`skipDuplicates`). Việc theo sự kiện — được giao, nhắc tên, đang theo dõi — lấy trong
cửa sổ **24 giờ trượt** `(now − 24h, now]` (`OKR_NHAC.suKienGio`).

1. Lúc 08:30 ngày D người X không có việc gì → không có hàng nào của X.
2. 14:00 ngày D, Y nhắc tên X. Nhịp 14:01 thấy X có việc → ghi hàng của X ngày D →
   tin đi giữa trưa, câu chào `dungTin` cố định «sáng nay».
3. 08:30 ngày D+1, cửa sổ là `(08:30 D, 08:30 D+1]` — vẫn chứa 14:00 D → X nhận lại.

Nếu X đã có tin sáng D, bước 2 không ghi hàng thứ hai (khoá theo ngày) nhưng bước 3
vẫn xảy ra: X nhận mục đó một lần duy nhất, vào sáng D+1 — đúng ý muốn. Lỗi nằm ở
người **chưa** có tin sáng D.

## 3. Cách sửa

### 3.1 Ngoài-8 — cửa sổ sự kiện neo vào mốc nhắc

**Mốc nhắc** của một ngày là 08:30 giờ VN ngày đó (`NHAC.gio`). Tin buổi sáng ngày D
lấy việc theo sự kiện trong `(mốc D−1, mốc D]` thay cho `(now − 24h, now]`. Mỗi sự
kiện rơi vào đúng một cửa sổ, nên:

- sự kiện sau 08:30 ngày D không sinh tin ngày D — nó chờ sáng D+1;
- sáng D+1 nó có mặt đúng một lần, sáng D+2 không còn;
- nhịp tạo tin chạy lúc nào trong ngày D thì cửa sổ vẫn là của ngày D (nhịp 08:31 và
  nhịp 10:00 khi máy chậm cho cùng kết quả).

Biên: sự kiện đúng 08:30:00.000 thuộc ngày đó (cửa sổ đóng phải); 08:30:00.001 sang
ngày sau. Mốc tính bằng `dauNgayVN` + `NHAC.gio`, không cộng tay.

**Thẻ «Việc của bạn» và Tổng quan kế hoạch giữ 24 giờ trượt.** Hai chỗ đó đọc cùng
`viecCanNhac` nhưng là màn sống: nhắc tên lúc 14:00 phải hiện trên thẻ lúc 14:05, không
chờ sáng mai. Nên `viecCanNhac` nhận thêm một lựa chọn bắt buộc cho **cách tính cửa
sổ** — `"buoi-sang"` (nhắc buổi sáng: `lenLichNhac`, `chayNhac`) hay `"truc-tiep"`
(thẻ và Tổng quan: `OkrTraoDoiService.viecCuaToi`, `DashboardService`). Bắt buộc, không
mặc định: một chỗ gọi mới phải chọn, không lặng lẽ rơi về một trong hai.

**Câu chào theo giờ gửi.** Sau sửa trên, tin giữa ngày vẫn có thể đi khi việc kế hoạch
phát sinh giữa ngày (bước sắp hạn vừa tạo) hay khi máy chậm. `dungTin` nhận giờ dựng
tin: trước 12:00 VN chào «sáng nay», từ 12:00 chào «hôm nay». Áp cho cả tin có OKR lẫn
tin chỉ kế hoạch («… việc 30 ngày đầu …»), cả khuôn Slack lẫn khuôn trơn Zalo. Mốc
12:00 là hằng trong `NHAC` (`NHAC.trua`), không viết tại chỗ.

Loại phương án:

- *Chỉ tạo tin trước 12:00.* Người có máy chậm cả buổi sáng mất tin cả ngày; và 9a
  (`tro-ly-okr-nen`) đang thêm cảnh báo trần AI vào cùng tin — cảnh báo đó sẽ bị hoãn
  sang sáng hôm sau. Không cần: neo cửa sổ đã chặn lặp, câu chào đã chặn «sáng nay»
  sai giờ.
- *Sổ «đã gửi» từng sự kiện.* Cần bảng mới (migration), vòng này không có quyền đó;
  và cửa sổ neo mốc đã cho mỗi sự kiện đúng một lần mà không cần nhớ gì.

### 3.2 Ngoài-2 — sheet dùng quyền máy chủ trả về

Máy chủ có ba chỗ cùng một luật «chủ KR, hoặc sửa được đơn vị của mục tiêu»:
`assertSuaKr`, kiểm quyền trong `guiCapNhat`, và trường `canEditKr` của
`okr.objective`. Sheet thì tự tính lại `kr.laCuaToi || mt.canEdit`.

- Máy chủ: một hàm `ghiDuocKr(q, userId, kr)` trong `OkrAccessService`, ba chỗ gọi
  nó. Không còn bản chép thứ hai của luật.
- Sheet: `capNhatDuoc = kr.hienTaiQuaCapNhat && mt.canEditKr.includes(kr.id)`. Không
  thêm trường mới (`canCapNhatKr` sẽ luôn bằng `canEditKr` — hai trường một giá trị là
  thứ lệch nhau về sau).

Không đổi hình: mục menu vẫn là mục cũ, chỉ nguồn quyết định hiện hay ẩn đổi.

### 3.3 Ngoài-3 — một lần gửi, mỗi KR một lần

`guiCapNhatInput` từ chối lô có hai mục cùng `keyResultId`, câu lỗi
«Mỗi KR chỉ gửi một lần trong một lần cập nhật.» (`LOI_KHUON_CAP_NHAT.trungKr`). Từ chối
cả lô như mọi lỗi khuôn khác của lượt 4: không ghi cập nhật, không vết, phiên còn mở và
gửi lại được. Màn cập nhật tuần không sinh được lô trùng, nên không đổi màn.

### 3.4 Ngoài-4 và Ngoài-5 — một khuôn, đọc ở biên

Gốc chung của hai mục: `@crm/db` không có Zod, và không nhập được `@crm/validation`
(gói đó nhập ngược `@crm/db`). Nên bộ sinh nhắc trong `@crm/db/okr-nhac` đọc `after`
bằng `jsonObject`/`jsonText`, và kiểu `ViecOkr` phải viết tay lại ở API.

**Quyết định: thêm `zod` vào phụ thuộc của `@crm/db`**, rồi:

- **Khuôn vết** `okrVetSnapshot` + `parseOkrVet` dời về `@crm/db/okr-vet`;
  `@crm/validation/okr-vet` tái xuất nguyên văn, nên mọi chỗ nhập cũ không đổi. `viecGiao`
  đọc `after` bằng `parseOkrVet`; `ownerUserId` có mặt mà không phải chuỗi cũng là lỗi.
  Lỗi đọc **ném**, câu nêu mã dòng vết: «Vết OKR <id> không đọc được: …». Không nuốt
  thành «không ai được giao». Hệ quả có chủ ý, và rộng: bộ sinh đọc mọi dòng vết
  trong cửa sổ trước khi lọc theo người, nên một dòng hỏng làm nhịp nhắc dừng cho **mọi
  người** (lỗi ghi ở log agent, lặp mỗi phút), thẻ «Việc của bạn» và khối kế hoạch trên
  Tổng quan của mọi người trả lỗi — tới khi dòng được sửa. Ồn, nhưng không im. Phương án
  hẹp hơn (bỏ riêng dòng hỏng, ghi lỗi có mã rồi đi tiếp) giữ tin cho mọi người khác
  nhưng người được giao vẫn mất mục mà không ai trên màn thấy — đó là quyết định đưa ra
  Cổng Phạm vi. Bên ghi thật (`OkrService.vet`) chỉ ghi giá trị đúng khuôn, nên dòng
  hỏng chỉ đến từ tay người sửa cơ sở dữ liệu.
- **Khuôn mục nhắc OKR** thành một khuôn Zod `viecOkr` (hợp phân biệt theo `loai`) ở
  `@crm/db/okr-nhac`; `ViecOkr = z.infer<typeof viecOkr>`. `@crm/validation/nhac-ke-hoach`
  tái xuất nó. API (`okr.contracts.ts`) dùng chính khuôn đó cho `viecCuaToiOutput` thay
  bản chép. Nhánh OKR của `mucNhac` (mã trong payload) suy từ `viecOkr` bằng bảng khoá
  nhận diện khai một lần (`KHOA_MUC_OKR`: loại → các trường mã), và `maViec` rút mã bằng
  chính bảng đó thay cho `switch` viết tay.
- **Không loại nào rơi im.** `dungTin` hôm nay lọc việc theo `THU_TU_NHAC` — loại không
  có trong danh sách bị bỏ không dấu vết. Sửa: `THU_TU_NHAC` được kiểm đủ ở kiểu (thiếu
  một loại của `LoaiNhac | LoaiNhacOkr` là lỗi `check-types`), và `dungTin` gặp loại
  không có thứ tự thì **ném** nêu tên loại thay vì bỏ.

Loại phương án: *bộ đọc thuần TS trong `@crm/db` cạnh khuôn Zod ở `@crm/validation`,
giữ khớp bằng bài kiểm*. Không đổi phụ thuộc gói, nhưng để lại đúng hai định nghĩa của
một khuôn — thứ Ngoài-5 đang chỉ ra — và thêm một bài kiểm chỉ để giữ chúng khớp. Nếp
«danh mục thuần ở `@crm/db`, khuôn Zod ở `@crm/validation`» (`docs/api.md`, chỉ số CRM)
là cho danh mục; ở đây `@crm/db` cần **đọc** khuôn, nên khuôn phải ở nơi đọc.

## 4. Phối hợp với lượt 9a `tro-ly-okr-nen`

9a đang viết mã và chạm đúng vùng 3.1 và 3.4: thêm `ViecAi` vào `ViecNhac`, hai loại
`ai-tran`, `ai-doi-soat-lech` vào `THU_TU_NHAC`, `TIEU_DE`, `mucNhac`, `maViec`, `dong`,
và `viecAiCanNhac` vào `viecCanNhac` (đã đọc nhánh `feat/tro-ly-okr-nen` tới `1a703483`).

- Vòng này chỉ viết mã sau khi chủ kho cho phép và sau khi gộp `origin/onehub` (khi đó
  9a đã lên hay chưa). Kế hoạch S2 soát lại với mã mới trước S3.
- Kiểm đủ `THU_TU_NHAC` ở kiểu tự phủ hai loại AI khi 9a đã lên — không mục nào của 9a
  rơi im. Khuôn Zod `viecOkr` chỉ gom loại OKR; `ViecAi` giữ khuôn của 9a.
- `viecAiCanNhac` không dùng cửa sổ sự kiện (nó nhớ mức đã báo trong `aiBaoTran`), nên
  lựa chọn cửa sổ của 3.1 không chạm nó.

## 5. Surface và trạng thái chạm

- Sheet mục tiêu (`apps/app/components/crm/record-sheet/objective-sheet.tsx`): menu
  «…» trên từng KR — mục «Cập nhật» hiện hay ẩn. Không đổi hình, không đổi chữ.
- Tin nhắc buổi sáng (Slack, Zalo): câu chào đổi theo giờ; nội dung mục không đổi.
- Thẻ «Việc của bạn» (Tổng quan, trang OKR): không đổi; trạng thái lỗi có sẵn
  `ST-viecokr-loi` là nơi hiện lỗi vết hỏng.

Đặc tả UX, bản mẫu design-pass và ô `ui-observed` đều bỏ có tên trong sổ quyết định:
vòng này không đổi điểm ảnh nào.

## 6. Tệp dự kiến chạm

- `packages/db/package.json` (thêm `zod`), `bun.lock`
- `packages/db/src/okr-vet.ts` (mới), `packages/db/src/okr-nhac.ts`,
  `packages/db/src/onboarding-nhac.ts`
- `packages/validation/src/okr-vet.ts`, `packages/validation/src/nhac-ke-hoach.ts`,
  `packages/validation/src/okr-cap-nhat.ts`
- `apps/agent/agent/lib/nhac-ke-hoach.ts`, `apps/agent/agent/lib/tin-nhac.ts`
- `apps/api/src/okr/okr-access.service.ts`, `okr.service.ts`, `okr-cap-nhat.service.ts`,
  `okr-trao-doi.service.ts`, `okr.contracts.ts`, `okr-config.ts`,
  `apps/api/src/dashboard/dashboard.service.ts`
- `apps/app/components/crm/record-sheet/objective-sheet.tsx`
- Bài kiểm mới: `apps/agent/test/nhac-moc-sang.integration.spec.ts`,
  `apps/agent/test/muc-nhac-okr.spec.ts`, `apps/api/test/no-sau-luot-4-okr.spec.ts`,
  `apps/app/test/sheet-quyen-cap-nhat.dom.tsx`
- Bài kiểm cũ gọi `viecCanNhac(db, { now })` phải khai cửa sổ (đổi cơ học):
  `apps/agent/test/okr-nhac.integration.spec.ts`, `nhac-ke-hoach.integration.spec.ts`,
  `tra-loi-tin-nhac.integration.spec.ts`, `apps/api/test/okr-cap-nhat.spec.ts`
- `docs/agent.md` (mục nhắc buổi sáng: cửa sổ neo mốc, câu chào), `docs/api.md` (vết
  và khuôn mục nhắc), dòng `4n` ở mục 10 của `docs/plan/lo-trinh-okr.md`

Chạm tệp mà eval của hồ sơ đã ký theo dõi (`cap-nhat-tuan-okr`, `may-nhac-truoc-nguoi`
và các hồ sơ nhắc buổi sáng khác) — S5 ghim lại các hồ sơ bị chạm.

## 7. Không làm

- Ngoài-6 (`PHUT_MS` viết lần hai, hằng rời trong `okr-nhac`) — đã chọn «ghi Known
  limits» ở lượt 4. Mã mới của vòng này không thêm hằng rời: mốc trưa vào `NHAC`.
- Không dời giờ tạo tin, không ghi sổ «đã gửi» từng sự kiện, không migration.
- Không xử lý hàng nhắc tồn qua đêm (hàng ngày D chạy sang ngày D+1).
- Không đổi màn cập nhật tuần, không đổi câu hay hình của sheet.
- Không gom khuôn `ViecAi` của 9a vào khuôn Zod của vòng này.
