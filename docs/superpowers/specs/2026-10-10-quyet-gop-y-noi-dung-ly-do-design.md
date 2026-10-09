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

## Máy chủ

- `okr.contracts.ts`: nhánh `ok: false` của `troLyQuyetOutput` nhận `lyDo: z.union([lyDoKhongSanSang, lyDoKhongQuyet])`.
- `tro-ly.service.ts`: hàm thuần `lyDoKhongQuyetCua(loi: unknown): LyDoKhongQuyet | null` cạnh `troLyQuyet` — chỉ nhận
  `BadRequestException`/`ForbiddenException` có thông điệp bằng ĐÚNG một hằng trong bảng (bảng dựng từ chính các hằng
  `T.*`, không chép chuỗi; `T.soTheoKieu` đưa vào bằng `Object.values`).
- `troLyQuyet` bọc cả `$transaction` trong `try/catch` ở NGOÀI giao dịch: lỗi có mã → `{ ok: false, lyDo }`, góp ý
  vẫn `cho` vì giao dịch đã huỷ (bước `updateMany` đặt trạng thái chạy trước `ghiTheoDong`); lỗi không có mã → ném lại
  như cũ.

## App

- `okr-gop-y.ts`: `loiQuyet: Record<LyDoKhongQuyet, string>` ở `vi` (có dấu) và `en`.
- `gop-y-kara.ts`, nhánh `!kq.ok` của `quyet`: `lyDo` thuộc `LY_DO_KHONG_QUYET` → câu `mGopY.loiQuyet[lyDo]` dưới góp
  ý, không đọc lại `troLySanSang`; ngoài tập (lý do «chưa sẵn sàng») → giữ đường cũ.

## Đo

- E1 (API, CSDL kiểm): ma trận viết trước, mỗi mã một ca dựng đúng trạng thái gây lỗi, gọi `troLyQuyet` thật, đòi
  `{ ok: false, lyDo: <mã> }` và góp ý vẫn `cho`; đếm số ca === số phần tử của `LY_DO_KHONG_QUYET`.
- E2 (DOM): mỗi mã × hai ngôn ngữ, `troLyQuyet` giả trả `{ ok: false, lyDo }`, chữ dưới góp ý === câu của mã, không
  lộ mã, tiếng Việt có dấu, tiếng Anh không có chữ Việt; ca lỗi 5xx vẫn là câu thử lại.
- E3 (script): một chỗ khai tập mã; bảng ánh xạ phủ đủ tập; mỗi hằng trong bảng là chuỗi (không hàm).
- E4 ranh giới, E5 đột biến (bỏ một dòng ánh xạ; bắt lỗi trong giao dịch thay vì ngoài; client lấy câu thử lại cho
  mọi `ok:false`).
- Không ui-check: dòng lỗi dưới góp ý đã được bàn đo màn của K3 chụp (trạng thái `loi-dong`); vòng này chỉ đổi chữ của
  dòng đó (entry `descope` «bỏ ui-observed»).
