# Tệp theo người phụ trách bản ghi — thiết kế

Hàng DA20 `tep-theo-chu-ban-ghi` của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), mã phạm vi F2,
dãy K1 của đợt `viec-du-an-kho-tai-lieu`. Câu giao: «Nhân viên quan hệ đối tác mở được tệp trong bản ghi mình phụ
trách, và khi đổi người phụ trách thì quyền đi theo người mới». Hạng T3 (hàng lộ trình ghi T3; chạm `packages/auth`).
Cổng Đáng: build, manh, 2026-10-21T23:04:34Z. Mốc đợt 22/10.

Soạn trên giấy theo luật 45 của đợt: hàng này chưa viết mã tới khi DA19 `truong-tep` (#532) gộp. Mọi tên hàm, thủ tục và
khuôn của ô Tệp dưới đây là tên trong thiết kế và kế hoạch của DA19 trên nhánh `feat/truong-tep` (`89cb431c1`, Cổng Phạm
vi đã ký 21/10 22:32Z); mã của DA19 chưa có. DA19 gộp với tên khác thì kế hoạch S2 đọc lại tên thật, hợp đồng không đổi.

Đã đọc: `AGENTS.md`, `docs/api.md` (mục «Logging», «One organization» — «Permissions come from `@crm/auth` … enforced by
the service *and* used to disable the UI control»), `docs/design.md` mục «Trường» › «Tệp» và «Nút bị khoá», `CONTEXT.md`
(«Người phụ trách», «Phụ trách»; tránh «chủ»), `docs/vong-doi.md` mục «Ba câu», thiết kế, hợp đồng, evals, sổ quyết định
và kế hoạch của DA19, `docs/plan/pham-vi-truong-hop-dong.md` (F2), LUAT.md của đợt (luật 1–3, 7, 30–35, 45), skill
`better-auth-best-practices` (vai đọc từ hàng `member`), skill `web-design-guidelines` (nút khoá có lý do, lời lỗi nói
cách sửa), `morphological-scan` (`_acceptance/tep-theo-chu-ban-ghi/coverage-scan.md`).

## Hiện trạng

Trên onehub `33ddf1b02` cộng thiết kế DA19:

| Chỗ | Hôm nay / sau DA19 |
|---|---|
| Người phụ trách | `Deal.ownerId` bắt buộc; `Company.ownerId`, `Contact.ownerId` tuỳ chọn, `onDelete: SetNull` (`schema.prisma:411, 484, 1048`). Đây là ô «Phụ trách» trên phiếu và cột bảng. |
| Đọc bản ghi | Không đường đọc nào xét `ownerId` của người gọi: ai có vai đọc được dữ liệu đối tác (`docDuocDoiTac`) đọc được mọi bản ghi. |
| Luật mở tệp (DA19) | Một hàm `coTheMoTep(vai)` trong `apps/api/src/fields/field-files.service.ts`: chỉ `owner`, `admin`. `downloadUrl` gọi nó; `byId` dùng nó tính cờ `coTheMo` của mỗi tệp. |
| Luật xoá tệp (DA19, Hỏi-2) | `coTheXoaTep(vai, taiBoiId, userId)`: quản trị, hoặc chính người đã tải tệp ấy lên. |
| Màn (DA19) | Ô Tệp khoá «Mở» theo `coTheMo`, kèm dòng «Chỉ quản trị mở được tệp.»; không tự so vai (E4b quét mã). |
| Đường đo (DA19) | Dấu CHẾT «một tệp mở được bởi người không phải quản trị trước khi DA20 lên», đọc từ dòng log `downloadUrl` mang `role`. |

## Phương án

### 1. Một luật mở tệp, sống ở `@crm/auth`, trả cả lý do

`docs/api.md`: quyền đến từ `@crm/auth`, service thi hành và màn dùng cùng hàm để khoá nút, «so the button and the 403
cannot disagree». DA19 đặt luật mở trong service vì nó chỉ đọc vai; luật mới đọc thêm người phụ trách của bản ghi, nên
chuyển về `packages/auth/src/quyen-tep.ts`:

```ts
export type LyDoKhongMoTep = "khong-phu-trach" | "chua-co-phu-trach";

export function quyenMoTep(input: {
  vai: WorkspaceRole | null;
  userId: string;
  phuTrachId: string | null;
}): { coTheMo: true } | { coTheMo: false; lyDo: LyDoKhongMoTep | "ngoai-pham-vi" };
```

| Người gọi | Bản ghi có người phụ trách là chính họ | Có người phụ trách khác | Chưa có người phụ trách |
|---|---|---|---|
| Quản trị (`owner`, `admin`) | mở | mở | mở |
| Nhân viên (`member`) | **mở** | không — `khong-phu-trach` | không — `chua-co-phu-trach` |
| Vai «chỉ OKR» | không — `ngoai-pham-vi` (router chặn trước) | không | không |

- `coTheMoTep` của DA19 thành một lớp mỏng gọi `quyenMoTep`; không chỗ nào khác tính quyền mở.
- `phuTrachId` đọc từ hàng bản ghi trong **cùng lượt đọc** với hàng `FieldFile` ở `downloadUrl` (`fieldFile` →
  `deal`/`company`/`contact` → `ownerId`), không nhận từ người gọi. Không bảng cấp quyền nào được ghi.
- Bản ghi không có người phụ trách: chỉ quản trị — chữ của ghi chú hàng và `docs/design.md` mục «Tệp».
- Người đã tải tệp lên không được tính: `quyenMoTep` không nhận `taiBoiId`. Vế người tải chỉ có ở luật xoá (Hỏi-2).
- Cá nhân không lấy người phụ trách của công ty, thoả thuận không lấy của công ty: «bản ghi mình phụ trách» là đúng bản ghi
  mang tệp.

### 2. Quyền đi theo người mới vì nó không được lưu ở đâu

Quyền tính lúc gọi từ `ownerId` hiện tại, nên mọi đường đổi người phụ trách — sửa ô «Phụ trách» trên phiếu, thao tác hàng
loạt, Kara, gỡ thành viên — đổi quyền ngay ở lần gọi kế, không cần bước đồng bộ nào. Đối chiếu ngành: tệp gắn vào bản ghi
của Salesforce Files mặc định «Set by Record» (quyền tệp đi theo quyền bản ghi, không chép); HubSpot giới hạn «Their
records» theo thuộc tính chủ bản ghi và nhóm «Unassigned» riêng cho bản ghi không có chủ.

Đường đổi người phụ trách trên mã hôm nay (mỗi đường một ô của E2):

<!-- <<<DA20-DUONG-DOI -->
| Đường | Chỗ | Ghi gì |
|---|---|---|
| Sửa ô «Phụ trách» trên phiếu, REST `PATCH /deals/{id}` | `deals.update` → `deals.service.ts:484` (`owner: { connect }`) | đổi sang người khác |
| như trên cho công ty | `companies.update` → `companies.service.ts:375` (`connect` / `disconnect`) | đổi, hoặc gỡ về trống |
| như trên cho cá nhân | `contacts.update` → `contacts.service.ts:578` | đổi, hoặc gỡ về trống |
| Gán hàng loạt | `deals|companies|contacts.bulkAssignOwner` → `deals.service.ts:900`, `companies.service.ts:583`, `contacts.service.ts:607` (`updateManyAndReturn`) | đổi nhiều bản ghi một lượt |
<!-- DA20-DUONG-DOI>>> -->

Không đổi `ownerId` của bản ghi có sẵn (soát mã 22/10): tự tạo từ hộp thư, lịch, biểu mẫu theo dõi, nhập tin đăng (chỉ
đặt lúc tạo), Kara (không công cụ nào ghi người phụ trách), gỡ thành viên (`workspace.service.ts:542` xoá hàng `member`,
không đụng bản ghi). Người đã rời nhóm vẫn mang `ownerId`, nhưng mọi lời gọi của họ bị chặn `NOT_A_MEMBER` ở
`AuthMiddleware` trước khi tới luật tệp; được mời lại thì mở lại được tệp của bản ghi họ vẫn phụ trách — đúng nghĩa
«quyền đi theo người phụ trách».

Hai điều không đi theo, nói thẳng ở Known limits:

- **URL đã cấp.** `downloadUrl` cấp URL Blob đã ký sống tối đa 300 giây (DA19). Người vừa mất quyền mà đã cầm URL trước lúc
  đổi thì vẫn tải được tới hết hạn; Blob ký trước không thu hồi được. Hỏi-1.
- **Màn đang mở.** Phiếu người cũ đang mở vẫn hiện «Mở» bật tới lần tải lại. Bấm thì máy chủ từ chối; màn báo «Bạn không
  còn phụ trách bản ghi này nên không mở được tệp.» và tải lại bản ghi (`cache.<loại>(id)`), nút khoá theo cờ mới.

### 3. Cờ và lý do do máy chủ tính, màn chỉ vẽ

`TepTrongO` (DA19, `packages/validation/src/tep-truong.ts`) thêm một trường: `lyDoKhongMo: "khong-phu-trach" |
"chua-co-phu-trach" | null`, cùng nguồn với `coTheMo` (`quyenMoTep`). Bản ghi trả kèm người phụ trách như hôm nay
(`owner: { id, name }`), nên màn ghép câu lý do từ mã lý do và tên đã có, không so vai hay so id:

| `lyDoKhongMo` | Dòng dưới danh sách tệp |
|---|---|
| `khong-phu-trach` | «Chỉ <tên người phụ trách> và quản trị mở được tệp.» |
| `chua-co-phu-trach` | «Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.» |
| `null` | không có dòng |

Câu «Chỉ quản trị mở được tệp.» của DA19 bị thay; chữ mới vào `apps/app/lib/messages/crm.ts` (chỉ thêm và sửa đúng dòng
của DA19, luật 7). Tên người phụ trách là dữ liệu người nhập, mang `translate="no"`.

### 4. Xoá tệp — Hỏi-2

Câu giao chỉ nói «mở». DA19 chốt xoá được là quản trị và người đã tải tệp lên, với lý do «không nên xoá được thứ mình
không xem được». Khi người phụ trách mở được tệp, câu ấy đòi cân lại: Hỏi-2.

### 5. Vết và đường đo

- `downloadUrl` ghi một dòng log `Field file opened` (`tepId`, `fieldId`, id bản ghi, `userId`, `role`, `laPhuTrach`);
  `laPhuTrach` so thẳng `ownerId` với `userId`, không suy từ kết quả của `quyenMoTep`, để thước bắt được chính lỗi luật;
  lần bị từ chối ghi `Field file open refused` cùng các khoá và `lyDo`. Không log URL (`docs/api.md` «Never log … query
  strings»).
- Dấu CHẾT của DA19 đổi nghĩa: từ khi DA20 lên, «một lần mở bởi người không phải quản trị và không phụ trách bản ghi lúc
  mở» — đếm bằng dòng `Field file opened` có `laPhuTrach=false` và `role` không phải `owner`, `admin`.

### 6. Không đổi gì khác

- Đọc bản ghi, danh sách, số tệp, tên tệp, tải lên: như DA19 cho mọi vai đọc được dữ liệu đối tác. Đây là luật quyền theo
  bản ghi đầu tiên của CRM và nó chỉ chạm việc mở (và xoá, theo Hỏi-2) tệp — không chạm quyền xem hay sửa bản ghi.
- Khoá API: hành động như người giữ khoá, cùng luật.
- Kara: không có đường lấy URL tệp; DA23 đọc tệp bằng quyền hệ thống và chịu ràng buộc «không đưa nội dung tệp tới người
  không có quyền» (ghi chú hàng) — DA23 gọi `quyenMoTep` cho người đang chat, ghi ở hạt giống của DA23, không làm ở đây.
- Không migration, không biến môi trường mới.
- Ba câu của `docs/vong-doi.md`: không áp — hàng này không thêm loại bản ghi hay trạng thái kết thúc.

### 7. Bài kiểm cũ của DA19

E4 (`ttp-quyen`) của DA19 ghi đáp án «nhân viên: mở false» với thoả thuận do quản trị phụ trách, nên vẫn đúng sau DA20.
E4b (`ttp-o-tep`) đọc câu lý do từ bảng chữ thật, nên đổi chữ không làm nó đỏ; hàng này thêm ô `lyDoKhongMo` vào ma trận
của chính nó (E5), không sửa E4b. E10 (`ttp-man`) của DA19 chụp «Chỉ quản trị mở được tệp.» — DA20 thay câu đó, nên E10
của DA19 sẽ đọc câu mới; kế hoạch S2 ghi bước báo phiên DA19 (hay sửa bước đối chiếu của `do-man.mjs` nếu DA19 đã gộp).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: nhân viên mở phiếu thoả thuận mình phụ trách › Chi tiết › ô «Hợp đồng» → bấm «Mở» trên một tệp → tệp mở ở tab
  mới (điểm ra: tab tệp). Quản trị đổi ô «Phụ trách» sang người khác → người mới mở được, người cũ không.
- Biên: bản ghi chưa có người phụ trách → «Mở» khoá với «Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.».
  Nhân viên không phụ trách → «Mở» khoá với «Chỉ <tên> và quản trị mở được tệp.».
- Lỗi & quay lại: người cũ bấm «Mở» trên phiếu mở từ trước khi bị đổi → lời báo «Bạn không còn phụ trách bản ghi này nên
  không mở được tệp.», phiếu tải lại, nút khoá kèm dòng lý do mới.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Phiếu Thoả thuận, Công ty, Cá nhân › ô Tệp | mở tệp của bản ghi mình phụ trách | danh sách / tab tệp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-otep-phu-trach | Phiếu › ô Tệp | «Mở» bật trên mọi dòng tệp, không dòng lý do | mở tệp |
| ST-otep-khong-phu-trach | Phiếu › ô Tệp | «Mở» khoá, «Chỉ <tên> và quản trị mở được tệp.» | nhờ người phụ trách |
| ST-otep-chua-phu-trach | Phiếu › ô Tệp | «Mở» khoá, «Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.» | gán người phụ trách |
| ST-otep-mat-quyen | Phiếu › ô Tệp | lời báo «Bạn không còn phụ trách bản ghi này nên không mở được tệp.», phiếu tải lại, «Mở» khoá | nhờ người phụ trách mới |
| ST-otep-quan-tri | Phiếu › ô Tệp | «Mở» bật với mọi bản ghi | mở tệp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Mở» khoá là `disabled` có `aria-describedby` trỏ dòng lý do, để trình đọc màn đọc được vì sao.
- Lời báo mất quyền đi qua `toast` có sẵn của phiếu, rồi `cache.deal(id)` / `cache.company(id)` / `cache.contact(id)`
  (`docs/api.md` «Freshness»).
- Tên người phụ trách trong dòng lý do mang `translate="no"`; dòng lý do xuống dòng ở 375, không cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Ô Tệp của DA19 (`kieu-truong.tsx`, `Item`, `ItemActions`) | dùng | chỉ đổi dòng lý do theo `lyDoKhongMo` |
| `FieldDescription` (`packages/ui`) | dùng | dòng lý do dưới danh sách, không `<p>` tự đặt cỡ |
| `toast` của phiếu | dùng | lời báo mất quyền |

Bậc tra (`docs/design.md` «Vẽ tay là bậc cuối»): dừng ở bậc 1 — `packages/ui` và ô Tệp của DA19 đủ; không cần shadcn mới
hay ReUI.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — hàng chỉ đổi luật và dòng lý do của ô Tệp có sẵn trên phiếu, không thêm màn; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Câu hỏi cho Cổng Phạm vi

<!-- <<<DA20-HOI -->
- **Hỏi-1 (rủi ro khi lên).** URL tải về đã cấp trước lúc đổi người phụ trách. Máy khuyên **giữ hạn 300 giây của DA19 và
  ghi Known limits**: Blob ký trước không thu hồi được; người cũ phải đã bấm «Mở» trước lúc đổi, và chính họ vừa có quyền
  hợp lệ lúc đó. Lối khác: hạ hạn URL xuống 60 giây cho mọi lần mở — cửa hở ngắn hơn, giá là sửa AC-4 đã ký của DA19 và
  tệp lớn trên mạng chậm có thể hết hạn trước khi trình duyệt kịp bắt đầu tải.
- **Hỏi-2 (khó đảo: xoá dữ liệu).** Ai xoá được tệp khỏi ô. Máy khuyên **quản trị, người đang phụ trách bản ghi, và chính
  người đã tải tệp ấy lên**: người phụ trách nay mở được tệp nên dọn được tệp sai trong bản ghi của mình; người tải giữ
  quyền sửa lỗi tải nhầm của chính họ như DA19. Lối khác (a): giữ nguyên luật DA19 (quản trị và người tải) — người phụ
  trách thấy tệp đồng nghiệp tải nhầm mà phải nhờ quản trị xoá. Lối khác (b): xoá như mở (quản trị và người phụ trách) —
  một luật cho hai nút, giá là người tải nhầm vào bản ghi người khác không tự gỡ được.
- **Hỏi-3.** Bỏ design-pass. Máy khuyên bỏ: luật 45 cấm viết mã, kể cả bản mẫu `/proto` trong `apps/app`, trước khi DA19
  gộp; hàng chỉ đổi dòng lý do của ô Tệp có sẵn, E7 đo bằng mắt ở S4. Lối khác: design-pass ngay khi DA19 gộp, trước S3 —
  nhìn bản bấm được trước, giá là S3 lùi nửa ngày.
- **Hỏi-4.** Người phụ trách đã rời nhóm. Hôm nay ô chọn người phụ trách liệt cả người đã rời, và gỡ thành viên không đổi
  `ownerId`; dòng lý do khi ấy nêu tên người không còn ở đó. Máy khuyên **để sau, ghi Known limits**: đó là việc của ô
  chọn người phụ trách, không của tệp; quản trị vẫn mở được và đổi người phụ trách là xong. Lối khác: làm luôn — `byId`
  đọc thêm người phụ trách còn trong nhóm và có mã lý do thứ ba, giá là một truy vấn mỗi lần đọc bản ghi.
- **Hỏi-5.** Ngưỡng Đường đo (ô Cổng Đáng để trống ngưỡng). Máy đề xuất: SỐNG khi ở phiên nghiệm thu ít nhất bốn trên năm
  nhân viên mở được hợp đồng của thoả thuận mình phụ trách mà không hỏi, và sau một lần đổi người phụ trách người mới mở
  được ngay; CHẾT khi có một dòng `Field file opened` với `laPhuTrach=false` mà vai không phải quản trị. Câu hỏi phép đo:
  nhân viên có tự mở được hợp đồng của bản ghi mình mà không cần quản trị không. Timebox: đọc 14 ngày sau khi lên
  production. Ngưỡng đã duyệt chép vào `opportunity.md` ngay sau Cổng Phạm vi.
<!-- DA20-HOI>>> -->

## Không làm trong hàng này

- Giới hạn xem hay sửa bản ghi theo người phụ trách (quyền theo bản ghi cho mọi thứ khác ngoài tệp).
- Nhóm hay đội cùng phụ trách; người theo dõi được mở tệp; chia sẻ một tệp cho một người cụ thể.
- Cá nhân, thoả thuận lấy người phụ trách của công ty.
- Thu hồi URL đã cấp trước lúc đổi người phụ trách (Hỏi-1).
- Kara đọc tệp theo quyền người đang chat (DA23).
