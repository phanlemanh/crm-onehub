# K3c — Quyết góp ý bị từ chối vì lý do cố định thì hiện đúng lý do

Hàng K3c của dãy P1, đợt `sau-14-10`. Cổng Đáng `build` theo luật 26 (Ngoài-6 của `kara-gop-y-luot-2`, Cổng 2
2026-10-09T13:04:37Z). Anh chọn ngả A (2026-10-09): máy chủ trả mã lý do có tên, app dịch theo ngôn ngữ.

## Vấn đề

Từ K3, `loaiLoiDong` (`apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`) xếp mọi lỗi khi quyết một góp ý mà không phải
`NOT_FOUND`, `CONFLICT` hay mất mạng vào «Chưa quyết được góp ý này lúc này. Thử lại sau ít phút.». Phần lớn các lỗi
đó là `BAD_REQUEST`/`FORBIDDEN` mang một câu sản phẩm của máy chủ (`OKR.thongDiep`, chỉ tiếng Việt) và là lý do cố
định: thử lại không bao giờ qua. Người dùng không biết lý do thật.

## Tập mã — một chỗ khai

`packages/validation/src/okr-tro-ly.ts` thêm `LY_DO_KHONG_QUYET` (mảng `as const`) và `lyDoKhongQuyet = z.enum(...)`:

| Mã | Ném từ (hằng câu) | Ý cho người dùng |
|---|---|---|
| `ky-da-an` | `T.chuKy.kyDaAn` | chu kỳ đã ẩn |
| `ky-da-khoa` | `T.kyDaKhoa` | chu kỳ ở pha chấm điểm hoặc đã đóng |
| `muc-tieu-da-bo` | `T.daBo` | Mục tiêu đã bỏ |
| `dang-cho-duyet` | `T.dangChoDuyet` | Mục tiêu đang chờ duyệt |
| `khong-sua-duoc-kr` | `T.khongSuaDuocKr` | không sửa được KR này |
| `khong-sua-duoc-don-vi` | `T.khongSuaDuocDonVi` | không sửa được Mục tiêu của đơn vị này |
| `so-sai-kieu` | mọi giá trị của `T.soTheoKieu` | số của KR không khớp kiểu KR |
| `can-chinh-gioi-han` | `T.canChinh.gioiHanKhongCanChinh` | một bên bị giới hạn hiển thị |
| `can-chinh-chinh-no` | `T.canChinh.chinhNo` | đích là chính Mục tiêu này |
| `can-chinh-cung-cap` | `T.canChinh.cungCap` | đích không ở cấp cao hơn |
| `can-chinh-chua-cong-bo` | `T.canChinh.chuaCongBo` | đích chưa công bố |
| `can-chinh-khac-chu-ky` | `T.canChinh.khacChuKy` | đích khác chu kỳ |
| `can-chinh-da-gan` | `T.canChinh.daGan` | đã gắn vào đích đó rồi |

Ngoài tập (giữ nguyên đường cũ): `NOT_FOUND`, `CONFLICT` (đã có câu từ K3); `T.troLy.cachKhongHop`,
`T.troLy.canGiaTri` (lỗi của chính client, không phải lý do của người dùng); lỗi của `hopLe` khi giá trị «Sửa» sai độ dài (thông điệp là câu Zod thay đổi theo luật, không phải một hằng — để vòng sau, vì đơn chạm tệp P1-53 chỉ cho thân `troLyQuyet`); lỗi Prisma, Zod của hàng hỏng, 5xx.

## Câu cho người dùng — duyệt ở Cổng 1

Mười ba câu, mỗi mã một câu riêng. Căn chỉnh gọi bên nhận là «đích» như câu máy chủ (`T.canChinh`), vì đích có thể là
Mục tiêu hoặc KR.

| Mã | Tiếng Việt | English |
|---|---|---|
| `ky-da-an` | Chu kỳ của Mục tiêu này đã ẩn nên không quyết được góp ý. | This objective's cycle is hidden, so the suggestion can't be decided. |
| `ky-da-khoa` | Chu kỳ đang chấm điểm hoặc đã đóng nên Mục tiêu không sửa được nữa. | The cycle is being scored or is closed, so the objective can't be changed. |
| `muc-tieu-da-bo` | Mục tiêu này đã bỏ nên không quyết được góp ý. | This objective was dropped, so the suggestion can't be decided. |
| `dang-cho-duyet` | Mục tiêu đang chờ duyệt nên nội dung, KR và căn chỉnh đang khoá. Rút lại để sửa. | The objective is awaiting approval, so its content, KRs and alignment are locked. Withdraw it to edit. |
| `khong-sua-duoc-kr` | Chỉ người phụ trách KR này hoặc người sửa được Mục tiêu mới quyết được góp ý này. | Only the KR owner or someone who can edit the objective can decide this suggestion. |
| `khong-sua-duoc-don-vi` | Bạn không sửa được OKR của đơn vị này nên không quyết được góp ý. | You can't edit this unit's OKRs, so the suggestion can't be decided. |
| `so-sai-kieu` | Số trong góp ý không khớp kiểu đo của KR này. | The number in this suggestion doesn't fit how this KR is measured. |
| `can-chinh-gioi-han` | Một bên đang ở mức giới hạn nên không căn chỉnh được. | One side is restricted, so they can't be aligned. |
| `can-chinh-chinh-no` | Đích là chính Mục tiêu này nên không căn chỉnh được. | The target is this objective itself, so it can't be aligned. |
| `can-chinh-cung-cap` | Đích không ở cấp cao hơn nên không căn chỉnh được. | The target isn't at a higher level, so it can't be aligned to. |
| `can-chinh-chua-cong-bo` | Đích chưa công bố nên chưa căn chỉnh được. | The target is not published yet, so it can't be aligned to. |
| `can-chinh-khac-chu-ky` | Đích thuộc chu kỳ khác nên không căn chỉnh được. | The target is in another cycle, so it can't be aligned to. |
| `can-chinh-da-gan` | Mục tiêu này đã căn chỉnh vào đích đó rồi. | This objective is already aligned to that target. |

## Máy chủ

- `okr.contracts.ts`: nhánh `ok: false` của `troLyQuyetOutput` nhận `lyDo: z.union([lyDoKhongSanSang, lyDoKhongQuyet])`.
- `tro-ly.service.ts`: hàm thuần `lyDoKhongQuyetCua(loi: unknown): LyDoKhongQuyet | null` cạnh `troLyQuyet` — chỉ nhận
  `BadRequestException`/`ForbiddenException` có thông điệp bằng ĐÚNG một hằng trong bảng (bảng dựng từ chính các hằng
  `T.*`, không chép chuỗi; `T.soTheoKieu` đưa vào bằng `Object.values`).
- `troLyQuyet` bọc cả `$transaction` trong `try/catch` ở NGOÀI giao dịch: lỗi có mã → `{ ok: false, lyDo }`, góp ý
  vẫn `cho` vì giao dịch đã huỷ (bước `updateMany` đặt trạng thái chạy trước `ghiTheoDong`); lỗi không có mã → ném lại
  như cũ. Lỗi không phải lỗi HTTP (`Error`, Prisma, Zod của hàng hỏng) luôn ném lại và ra `INTERNAL_SERVER_ERROR`.

## App

- `okr-gop-y.ts`: `loiQuyet: Record<LyDoKhongQuyet, string>` ở `vi` (có dấu) và `en`.
- `gop-y-kara.ts`, nhánh `!kq.ok` của `quyet`: `lyDo` thuộc `LY_DO_KHONG_QUYET` → câu `mGopY.loiQuyet[lyDo]` dưới góp
  ý, không đọc lại `troLySanSang`; ngoài tập (lý do «chưa sẵn sàng») → giữ đường cũ.

## Đo

- E1 (API, CSDL kiểm): ma trận viết trước, mỗi mã một ca dựng đúng trạng thái gây lỗi, gọi `troLyQuyet` thật, đòi
  `{ ok: false, lyDo: <mã> }`, góp ý vẫn `cho`, OKR không đổi; số ca === số phần tử của `LY_DO_KHONG_QUYET`.
- E2 (API): lỗi ngoài tập giữ mã tRPC cũ (`NOT_FOUND`, `CONFLICT`, `BAD_REQUEST` của `cachKhongHop`); hàng góp ý hỏng ra
  `INTERNAL_SERVER_ERROR`; `lyDoKhongQuyetCua` trả `null` cho câu lạ, `Error` và lỗi Prisma.
- E3, E4 (DOM): mỗi mã × một ngôn ngữ, chữ dưới góp ý === câu của mã; mười ba câu khác nhau; câu
  `can-chinh-chua-cong-bo` nói «chưa công bố» / «not published».
- E5 (DOM): mã của tập không đọc lại `troLySanSang`; lý do «chưa sẵn sàng» và lỗi 5xx giữ câu thử lại.
- E6 (script): một chỗ khai tập mã; bảng ánh xạ phủ đủ tập; hai bản đồ câu khoá bằng đúng tập.
- E7 ranh giới, E8 đột biến (bỏ một dòng ánh xạ; bắt lỗi trong giao dịch thay vì ngoài; client lấy câu thử lại cho
  mọi `ok:false`).
- Không ui-check: dòng lỗi dưới góp ý đã được bàn đo màn của K3 chụp (trạng thái `loi-dong`); vòng này chỉ đổi chữ của
  dòng đó (entry `descope` «bỏ ui-observed»).
